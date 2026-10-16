import { CurveDivider } from "../CurveDivider";
import { SITE } from "../../lib/site";
import { asset } from "../../lib/utils";

/**
 * 博客页顶部横幅：全宽视频背景 + 居中标题。
 *
 * 视觉层次自上而下：
 * 1. 顶部渐变压暗 —— 保证悬浮导航栏的文字始终可读；
 * 2. 全局轻压暗 —— 让标题从画面里「浮」出来；
 * 3. 底部渐变 —— 视频与页面背景的过渡带；
 * 4. 曲线分隔 —— 收尾，形成自然的溶入效果。
 */
export function BlogHero() {
  return (
    <section className="relative h-[58vh] min-h-[400px] w-full overflow-hidden bg-hero-bg">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={asset("videos/hero.mp4")} type="video/mp4" />
      </video>

      {/* 顶部压暗：给悬浮导航栏留出可读区域 */}
      <div
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-hero-bg/80 to-transparent"
        aria-hidden="true"
      />
      {/* 全局轻压暗 */}
      <div className="absolute inset-0 bg-hero-bg/25" aria-hidden="true" />
      {/* 底部过渡带 */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-hero-bg via-hero-bg/60 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="animate-fade-up text-3xl font-bold tracking-tight text-foreground drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)] sm:text-4xl md:text-5xl">
          {SITE.name}
        </h1>
        <p
          className="mt-3 animate-fade-up text-sm text-foreground/70 sm:text-base"
          style={{ animationDelay: "120ms" }}
        >
          {SITE.taglineEn}
        </p>
      </div>

      <CurveDivider className="absolute inset-x-0 bottom-0 h-[56px] sm:h-[86px]" />
    </section>
  );
}
