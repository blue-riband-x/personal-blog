import { Link } from "react-router-dom";
import { formatDate } from "../../lib/posts";
import type { Post } from "../../lib/posts";

interface PostCardProps {
  post: Post;
}

/**
 * 当文章没有指定封面时，用标题首字生成一个纯色占位封面。
 */
function PostCover({ cover, title }: { cover?: string; title: string }) {
  if (cover) {
    return (
      <div className="shrink-0 overflow-hidden rounded-lg border border-white/10 md:w-44">
        <img
          src={cover}
          alt={title}
          className="h-44 w-full object-cover md:h-28 md:w-44"
          loading="lazy"
        />
      </div>
    );
  }

  const firstChar = title.charAt(0) || "文";

  return (
    <div className="flex h-44 w-full shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-primary/25 to-primary/5 md:h-28 md:w-44">
      <span className="text-5xl font-bold text-primary/60 md:text-4xl">
        {firstChar}
      </span>
    </div>
  );
}

/**
 * 博客列表中的文章卡片。
 * 左侧（移动端上方）是封面，右侧是标题、元信息和摘要。
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-hero-bg/60 p-5 transition-all hover:border-primary/30 hover:bg-hero-bg/80">
      <Link
        to={`/blog/${post.slug}`}
        className="flex flex-col gap-5 md:flex-row"
      >
        <PostCover cover={post.cover} title={post.title} />

        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary md:text-xl">
              {post.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/70">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime} 分钟阅读</span>
              {post.tags.length > 0 && (
                <span className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/5 px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </span>
              )}
            </div>

            <p className="mt-3 line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground">
              {post.description}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
