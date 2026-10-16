export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: number;
  /** 文章封面图路径，可选。建议用相对 public 目录的路径，如 "covers/xxx.jpg" */
  cover?: string;
}

export interface Post extends PostMeta {
  /** Markdown 正文（已剥离 frontmatter） */
  content: string;
}

type FrontmatterValue = string | string[];

const POST_FILES = import.meta.glob("../content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function unquote(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' || first === "'") && first === last) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}

/** 极简 YAML frontmatter 解析，只覆盖博客用到的标量 / 行内数组语法 */
function parseFrontmatter(raw: string): { data: Record<string, FrontmatterValue>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, FrontmatterValue> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf(":");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!key) continue;

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map(unquote)
        .filter(Boolean);
    } else {
      data[key] = unquote(value);
    }
  }

  return { data, body: raw.slice(match[0].length) };
}

const CJK_PATTERN = /[\u4e00-\u9fa5\u3040-\u30ff]/g;

/** 中英混排的粗略阅读时长估算 */
function estimateReadingTime(body: string): number {
  const cjkCount = body.match(CJK_PATTERN)?.length ?? 0;
  const wordCount = body.replace(CJK_PATTERN, " ").match(/[A-Za-z0-9]+/g)?.length ?? 0;
  const minutes = cjkCount / 400 + wordCount / 200;
  return Math.max(1, Math.round(minutes));
}

function toArray(value: FrontmatterValue | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value) return [value];
  return [];
}

function buildPost(path: string, raw: string): Post {
  const { data, body } = parseFrontmatter(raw);
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const title = typeof data.title === "string" && data.title ? data.title : slug;

  return {
    slug,
    title,
    date: typeof data.date === "string" ? data.date : "",
    description: typeof data.description === "string" ? data.description : "",
    tags: toArray(data.tags),
    readingTime: estimateReadingTime(body),
    cover: typeof data.cover === "string" && data.cover ? data.cover : undefined,
    content: body,
  };
}

/** 站点统计数字 */
export function getBlogStats() {
  const tagList = getAllTags();
  const totalWords = posts.reduce((sum, post) => sum + post.readingTime, 0);

  return {
    postCount: posts.length,
    tagCount: tagList.length,
    totalReadingTime: totalWords,
  };
}

/** 全部文章，按日期倒序 */
export const posts: Post[] = Object.entries(POST_FILES)
  .map(([path, raw]) => buildPost(path, raw))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export function getPost(slug: string | undefined): Post | undefined {
  if (!slug) return undefined;
  return posts.find((post) => post.slug === slug);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counter = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }
  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function formatDate(date: string): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return `${parsed.getFullYear()} 年 ${parsed.getMonth() + 1} 月 ${parsed.getDate()} 日`;
}
