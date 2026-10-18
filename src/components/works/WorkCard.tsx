import { asset } from "../../lib/utils";
import type { WorkItem } from "../../lib/works";

interface WorkCardProps {
  work: WorkItem;
  /** 入场动画的延迟序号 */
  index: number;
  /** 大卡片（每页 2 个那种）字号大一点 */
  large?: boolean;
}

/**
 * 作品卡片：透明托盘 + 玻璃主体。
 *
 * 层次感靠三层叠出来，关键是**主体要够透**，让背景视频能透过来：
 * 1. 托盘 —— 往右下偏移 6px 的实心浅色框，卡片"浮"在它上面；
 * 2. 主体 —— 只留 35% 的底色 + 轻微毛玻璃，边框用青色细线；
 * 3. 封面 —— 没有图片时用 `hue` 生成很淡的点阵，只做氛围，不抢背景。
 */
export function WorkCard({ work, index, large = false }: WorkCardProps) {
  const hue = work.hue ?? 170;

  return (
    <article
      className="group animate-fade-up relative opacity-0"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* 托盘 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 translate-x-3 translate-y-3 border border-cyan-200/30 bg-cyan-300/[0.07] transition-all duration-300 group-can-hover:translate-x-3.5 group-can-hover:translate-y-3.5 group-can-hover:border-cyan-200/50 group-can-hover:bg-cyan-300/[0.12]"
      />

      <div className="relative overflow-hidden border border-cyan-200/40 bg-[#03080f]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_-22px_rgba(0,0,0,0.95)] backdrop-blur-md transition-colors duration-300 group-can-hover:border-cyan-200/75 group-can-hover:bg-[#04121c]/45">
        {/* 封面 */}
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          {work.cover ? (
            <img
              src={asset(work.cover)}
              alt={work.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full"
              style={{
                backgroundColor: `hsl(${hue} 60% 12% / 0.35)`,
                backgroundImage: `radial-gradient(130% 100% at 50% 125%, hsl(${hue} 80% 55% / 0.3), transparent 60%), repeating-linear-gradient(0deg, hsl(${hue} 80% 70% / 0.035) 0 1px, transparent 1px 6px)`,
              }}
            />
          )}

          {/* 扫描线，和背景视频的像素颗粒对上 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.22)_0_1px,transparent_1px_3px)]"
          />

          {/* 四角像素标记 */}
          <span aria-hidden="true" className="absolute left-1.5 top-1.5 h-1.5 w-1.5 bg-cyan-200/50 transition-colors group-can-hover:bg-primary" />
          <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-cyan-200/50 transition-colors group-can-hover:bg-primary" />

          {/*
            摘要：桌面端悬停才浮上来；触屏没有 hover，就一直显示，
            否则这段内容在手机上等于被藏掉了。
          */}
          {work.summary && (
            <p className="font-pixel absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#02070c] via-[#02070c]/90 to-transparent px-3 pb-2 pt-10 text-[12px] leading-[18px] text-cyan-100/80 transition-all duration-300 hoverable:translate-y-2 hoverable:opacity-0 group-can-hover:translate-y-0 group-can-hover:opacity-100">
              {work.summary}
            </p>
          )}
        </div>

        {/* 名称条 */}
        <div
          className={`relative flex items-center gap-2.5 border-t border-cyan-200/25 bg-[#02080e]/45 backdrop-blur-sm ${
            large ? "h-14 px-4" : "h-11 px-3"
          }`}
        >
          <span className="h-2 w-2 shrink-0 bg-primary/80" aria-hidden="true" />
          <h3
            className={`font-pixel truncate text-foreground/90 transition-colors group-can-hover:text-primary ${
              large ? "text-[24px] leading-[28px]" : "text-[20px] leading-[24px]"
            }`}
          >
            {work.title}
          </h3>
        </div>
      </div>
    </article>
  );
}
