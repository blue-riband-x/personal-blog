import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllTags, posts } from "../lib/posts";
import { cn } from "../lib/utils";

export default function BlogList() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const tags = useMemo(() => getAllTags(), []);

  const visiblePosts = activeTag
    ? posts.filter((post) => post.tags.includes(activeTag))
    : posts;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8">
      <header className="animate-fade-up opacity-0">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-foreground">
          博客
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          共 {posts.length} 篇文章 · 记录技术、项目与思考
        </p>
      </header>

      {tags.length > 0 && (
        <div className="animate-fade-up mt-8 flex flex-wrap gap-2 opacity-0" style={{ animationDelay: "0.1s" }}>
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeTag === null
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground",
            )}
          >
            全部
          </button>
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                activeTag === tag
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground",
              )}
            >
              {tag}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          ))}
        </div>
      )}

      <ul className="mt-10 space-y-2">
        {visiblePosts.map((post, index) => (
          <li
            key={post.slug}
            className="animate-fade-up opacity-0"
            style={{ animationDelay: `${0.15 + index * 0.06}s` }}
          >
            <Link
              to={`/blog/${post.slug}`}
              className="group block border-b border-white/10 py-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary sm:text-xl">
                  {post.title}
                </h2>
                <time
                  dateTime={post.date}
                  className="shrink-0 text-xs font-light text-muted-foreground/70"
                >
                  {post.date}
                </time>
              </div>

              {post.description && (
                <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
                  {post.description}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/70">
                <span>{post.readingTime} 分钟阅读</span>
                {post.tags.length > 0 && (
                  <span className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 px-2 py-0.5">
                        #{tag}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {visiblePosts.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">这个标签下还没有文章。</p>
      )}
    </div>
  );
}
