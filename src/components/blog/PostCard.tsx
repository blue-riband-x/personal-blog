import { Link } from "react-router-dom";
import { formatDate } from "../../lib/posts";
import type { Post } from "../../lib/posts";
import { asset } from "../../lib/utils";

interface PostCardProps {
  post: Post;
}

/**
 * 封面：优先后台配置的 cover，缺省时用标题首字生成一个渐变占位图。
 */
function PostCover({ cover, title }: { cover?: string; title: string }) {
  if (cover) {
    return (
      <div className="shrink-0 overflow-hidden rounded-xl border border-white/10 md:w-44">
        <img
          src={asset(cover)}
          alt={title}
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-28 md:w-44"
          loading="lazy"
        />
      </div>
    );
  }

  const firstChar = title.charAt(0) || "文";

  return (
    <div className="flex h-44 w-full shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-primary/25 to-primary/5 md:h-28 md:w-44">
      <span className="text-5xl font-bold text-primary/60 md:text-4xl">
        {firstChar}
      </span>
    </div>
  );
}

/**
 * 博客列表中的文章卡片。
 * 移动端封面在上；桌面端对齐参考图：左侧文字、右侧缩略图。
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group rounded-2xl border border-white/10 bg-hero-bg/60 p-5 transition-all hover:border-primary/30 hover:bg-hero-bg/80">
      <Link to={`/blog/${post.slug}`} className="flex flex-col gap-5 md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary md:text-xl">
              {post.title}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/70">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime} 分钟阅读</span>
            </div>

            <p className="mt-3 line-clamp-2 text-sm font-light leading-relaxed text-muted-foreground">
              {post.description}
            </p>
          </div>

          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <PostCover cover={post.cover} title={post.title} />
      </Link>
    </article>
  );
}
