import { CurveDivider } from "../CurveDivider";
import { asset } from "../../lib/utils";

/**
 * 作品页顶部横幅：全宽视频背景（Gradient Wave）+ 左下角标题。
 *
 * 素材说明：背景视频来自 MotionSites「Gradient Wave」（background 分类，标注免费），
 * 本地副本为 `public/videos/works-bg.mp4`，poster 是从视频里抽的一帧
 * （`works-bg-poster.png`，无 ffmpeg 时用无头 Chrome 截图取得）。
 * 若要用于商业项目，先确认 MotionSites 的授权状态再使用。
 *
 * 画面右侧是亮蓝的行星、左侧是暗部星空，所以文字压左侧、只做单向遮罩：
 * 1. 顶部渐变 —— 保证悬浮导航栏文字可读；
 * 2. 左侧渐变 —— 只压暗文字区域，右侧的行星和星野保持通透；
 * 3. 底部渐变 —— 过渡到页面背景；
 * 4. 曲线分隔 —— 收尾，与博客页保持同一套过渡语言。
 *
 * 移动端用 `object-[68%_center]` 把裁切重心右移，避免竖屏下把右侧行星裁掉。
 */
export function WorksHero() {
  return (
    <section className="relative flex min-h-[540px] items-end overflow-hidden bg-[#05070f] md:h-[76vh] md:max-h-[720px]">
      <video
        className="absolute inset-0 h-full w-full object-cover object-[68%_center] md:object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={asset("videos/works-bg-poster.png")}
        aria-hidden="true"
      >
        <source src={asset("videos/works-bg.mp4")} type="video/mp4" />
      </video>

      {/* 顶部压暗：给浮岛导航栏留出可读区域 */}
      <div
        className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 to-transparent"
        aria-hidden="true"
      />
      {/* 左侧压暗：文字所在的半边，右侧保持画面亮度 */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent md:via-black/25"
        aria-hidden="true"
      />
      {/* 底部过渡带 */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-hero-bg via-hero-bg/55 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full px-6 pb-24 pt-40 sm:px-10 lg:px-16">
        <p
          className="animate-fade-up text-[11px] font-semibold uppercase tracking-[0.42em] text-primary opacity-0"
          style={{ animationDelay: "80ms" }}
        >
          Works
        </p>

        <h1
          className="animate-fade-up mt-4 text-[clamp(2.75rem,7vw,4.75rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white opacity-0"
          style={{ animationDelay: "180ms" }}
        >
          作品
        </h1>

        <p
          className="animate-fade-up mt-5 max-w-md text-sm font-light leading-relaxed text-white/70 opacity-0 sm:text-base"
          style={{ animationDelay: "280ms" }}
        >
          做过的东西都会放在这里：课程项目、自己折腾的小工具，
          还有那些「先写出来再说」的实验。
        </p>
      </div>

      <CurveDivider className="absolute inset-x-0 bottom-0 h-[56px] sm:h-[86px]" />
    </section>
  );
}
