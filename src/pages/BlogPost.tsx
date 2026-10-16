import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { formatDate, getPost } from "../lib/posts";

const markdownComponents: Components = {
  a: ({ href, children }) =>
    href && href.startsWith("/") ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    ),
  img: ({ src, alt }) => (
    <img src={src} alt={alt} loading="lazy" className="rounded-lg border border-white/10" />
  ),
};

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPost(slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">没有找到这篇文章</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          它可能已经被移动或删除了。
        </p>
        <Link
          to="/blog"
          className="mt-8 inline-block rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
        >
          返回博客列表
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8">
      <Link
        to="/blog"
        className="text-xs tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
      >
        ← 返回博客
      </Link>

      <header className="mt-6 border-b border-white/10 pb-6">
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-foreground">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground/70">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>·</span>
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
      </header>

      <div className="prose-blog mt-8">
        <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {post.content}
        </Markdown>
      </div>

      <footer className="mt-16 border-t border-white/10 pt-8">
        <Link
          to="/blog"
          className="inline-block rounded-sm border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-white/10"
        >
          ← 返回博客列表
        </Link>
      </footer>
    </article>
  );
}
