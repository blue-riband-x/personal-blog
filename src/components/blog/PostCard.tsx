import { Link } from "react-router-dom";
import { formatDate } from "../../lib/posts";
import type { Post } from "../../lib/posts";
import { asset } from "../../lib/utils";

interface PostCardProps {
  post: Post;
}

/**
 * 封面容器：所有卡片共用同一套尺寸，保证列表里缩略图完全一致。
 *
 * - 手机端：通栏 16:9，卡片纵向排布；
 * - 桌面端：固定宽度 16:10，高度随 `aspect-ratio` 推导，不再用固定 px 高度，
 *   这样即使以后换封面图也不会因为原始比例不同而忽高忽低。
 */
const COVER_BOX =
  "aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-white/10 " +
  "md:aspect-[16/10] md:w-52";

function PostCover({ cover, title }: { cover?: string; title: string }) {
  if (cover) {
    return (
      <div className={COVER_BOX}>
        <img
          src={asset(cover)}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  const firstChar = title.charAt(0) || "文";

  return (
    <div
      className={`${COVER_BOX} flex items-center justify-center bg-gradient-to-br from-primary/25 to-primary/5`}
      aria-hidden="true"
    >
      <span className="text-4xl font-bold text-primary/60">{firstChar}</span>
    </div>
  );
}

/**
 * 博客列表中的文章卡片。
 *
 * 左侧是标题 / 元信息 / 摘要，右侧是封面（手机端封面上、文字下）。
 * 标题与摘要都做两行截断并给标题留出两行高度，卡片之间的高度差被压到最小，
 * 封面再用 `items-center` 垂直居中，避免出现一侧贴顶、另一侧留空的割裂感。
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-hero-bg/60 p-5 transition-all hover:border-primary/30 hover:bg-hero-bg/80">
      <Link
        to={`/blog/${post.slug}`}
        className="flex flex-col gap-5 md:flex-row md:items-center"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="line-clamp-2 min-h-14 text-lg font-semibold leading-7 text-foreground transition-colors group-hover:text-primary md:text-xl">
            {post.title}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground/70">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{post.readingTime} 分钟阅读</span>

            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-white/5 px-2 py-0.5 text-muted-foreground/80"
              >
                #{tag}
              </span>
            ))}
          </div>

          <p className="mt-3 line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground">
            {post.description}
          </p>
        </div>

        <PostCover cover={post.cover} title={post.title} />
      </Link>
    </article>
  );
}
