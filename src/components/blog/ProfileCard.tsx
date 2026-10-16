import { SITE } from "../../lib/site";

/**
 * 博客左侧博主信息卡片。
 */
export function ProfileCard() {
  return (
    <section className="rounded-2xl border border-white/10 bg-hero-bg/60 p-6 text-center backdrop-blur-sm">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary/30 bg-hero-bg">
        <img
          src="/avatar.jpg"
          alt={SITE.author}
          className="h-20 w-20 rounded-full object-cover"
          loading="lazy"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-foreground">{SITE.author}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{SITE.role}</p>

      <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground/80">
        {SITE.bio}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <a
          href={SITE.github}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          GitHub
          <svg
            className="h-3 w-3 opacity-70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
