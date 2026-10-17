import { Link } from "react-router-dom";
import { SITE } from "../lib/site";
import { HeroBackground } from "./HeroBackground";

export function HeroSection() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative flex min-h-screen items-end overflow-hidden bg-hero-bg"
    >
      <HeroBackground />

      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/30" aria-hidden="true" />

      <div className="pointer-events-none relative z-10 w-full max-w-[90%] px-6 pb-10 pt-32 sm:max-w-md md:px-10 md:pb-10 lg:max-w-2xl">
        <h1
          id="hero-title"
          className="animate-fade-up mb-2 text-[clamp(2.25rem,6vw,4.5rem)] font-bold leading-[1.15] tracking-[-0.03em] text-foreground opacity-0 md:mb-4"
          style={{ animationDelay: "0.2s" }}
        >
          妄想龙王<span className="text-primary">的世界</span>
        </h1>

        <p
          className="animate-fade-up mb-3 text-[clamp(1.125rem,2.5vw,1.875rem)] font-light text-foreground/80 opacity-0 md:mb-6"
          style={{ animationDelay: "0.4s" }}
        >
          {SITE.tagline}
          <span className="hidden sm:inline"> · {SITE.taglineEn}</span>
        </p>

        <p
          className="animate-fade-up mb-4 text-[clamp(0.875rem,1.5vw,1.25rem)] font-light text-muted-foreground opacity-0 md:mb-8"
          style={{ animationDelay: "0.55s" }}
        >
          一个普通程序员的成长笔记。主攻 Java 后端，也在折腾 AI 应用与全栈项目 ——
          这里记录踩过的坑、做过的项目，还有一些还没想明白的事。
        </p>

        <div
          className="animate-fade-up pointer-events-none flex flex-wrap gap-3 font-bold opacity-0"
          style={{ animationDelay: "0.7s" }}
        >
          <Link
            to="/blog"
            className="pointer-events-auto cursor-pointer rounded-sm bg-primary px-6 py-3 text-sm text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg md:px-8 md:py-4"
          >
            进入博客
          </Link>
          <Link
            to="/about"
            className="pointer-events-auto cursor-pointer rounded-sm bg-white px-6 py-3 text-sm text-background transition-all hover:brightness-90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg md:px-8 md:py-4"
          >
            关于我
          </Link>
        </div>

        <p
          className="animate-fade-up mt-4 text-xs font-light text-muted-foreground/60 opacity-0 md:mt-6"
          style={{ animationDelay: "0.85s" }}
        >
          {SITE.stack.join(" · ")}
        </p>
      </div>
    </section>
  );
}
