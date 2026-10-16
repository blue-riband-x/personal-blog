import { SITE } from "../../lib/site";

/**
 * 博客页顶部横幅。
 * 首页不动；这里只给博客页一个柔和的标题区，延续深色 + 绿色风格。
 */
export function BlogHeader() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 via-hero-bg to-hero-bg p-8 sm:p-10 md:p-12">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl">
          {SITE.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {SITE.tagline} · {SITE.taglineEn}
        </p>
      </div>

      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
    </section>
  );
}
