import { Link } from "react-router-dom";
import { SITE } from "../lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-hero-bg">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-foreground">{SITE.name}</p>
          <p className="mt-1 text-xs">
            © {SITE.since === year ? year : `${SITE.since}–${year}`} {SITE.author} · 用 React + Vite + Tailwind 构建
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <Link to="/blog" className="transition-colors hover:text-primary">
            博客
          </Link>
          <Link to="/about" className="transition-colors hover:text-primary">
            关于
          </Link>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer noopener"
            className="transition-colors hover:text-primary"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
