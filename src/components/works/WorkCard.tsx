import { workGallery, type WorkItem } from "../../lib/works";
import { CoverArt, isVideoSource, Scanlines } from "./CoverArt";
import { PLAY, PixelIcon } from "./PixelIcon";

/**
 * 卡片的"几何骨架"。
 *
 * 真卡片和占位块必须**逐像素等高**，否则翻到作品较少的最后一页时，
 * 网格整体高度会变、贴在两边的翻页箭头和页码会跟着位移。
 * 所以高度相关的类都抽到这里，两边共用。
 */
const CARD_BORDER = "border border-cyan-200/40";
const COVER_BOX = "relative aspect-[3/2] w-full overflow-hidden";
const BAR_HEIGHT = { large: "h-14", small: "h-11" } as const;

interface WorkCardProps {
  work: WorkItem;
  /** 入场动画的延迟序号 */
  index: number;
  /** 大卡片（每页 2 个那个）字号大一点 */
  large?: boolean;
  /** 封面上要不要扫描线，见 `WorkCategory.scanlines` */
  scanlines?: boolean;
  /** 点开详情；不传则卡片不可点 */
  onOpen?: (work: WorkItem) => void;
}

/**
 * 作品卡片：透明托盘 + 玻璃主体。
 *
 * 层次感靠三层叠出来，关键是**主体要够透**，让背景视频能透过来：
 * 1. 托盘 —— 往右下偏移 6px 的实心浅色框，卡片"浮"在它上面；
 * 2. 主体 —— 只留 35% 的底色 + 轻微毛玻璃，边框用青色细线；
 * 3. 封面 —— 没有图片时用 `hue` 生成很淡的点阵，只做氛围，不抢背景。
 *
 * 整张卡片的点击区是一层铺满的透明 `<button>`，而不是把 `<article>` 改成按钮 ——
 * 这样标题还能是 `<h3>`，屏幕阅读器和 SEO 都不吃亏。
 */
export function WorkCard({ work, index, large = false, scanlines = true, onOpen }: WorkCardProps) {
  // 详情里含视频就打个角标，让人知道点进去是会动的
  const hasVideo = workGallery(work).some((slide) => isVideoSource(slide.src));

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

      <div
        className={`relative overflow-hidden ${CARD_BORDER} bg-[#03080f]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_-22px_rgba(0,0,0,0.95)] backdrop-blur-md transition-colors duration-300 group-can-hover:border-cyan-200/75 group-can-hover:bg-[#04121c]/45`}
      >
        {/* 封面 */}
        <div className={COVER_BOX}>
          <CoverArt work={work} />
          {scanlines && <Scanlines />}

          {/* 四角像素标记 */}
          <span aria-hidden="true" className="absolute left-1.5 top-1.5 h-1.5 w-1.5 bg-cyan-200/50 transition-colors group-can-hover:bg-primary" />
          <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-cyan-200/50 transition-colors group-can-hover:bg-primary" />

          {hasVideo && (
            // 放右上角：底部会被摘要盖住（触屏上摘要默认就是显示的）
            <span className="font-pixel absolute right-3 top-2 z-[1] flex items-center gap-1 border border-cyan-100/40 bg-[#01080e]/85 px-1.5 py-1 text-[10px] leading-[12px] text-cyan-100/85 backdrop-blur-[4px]">
              <PixelIcon pattern={PLAY} className="h-2.5 w-2.5 text-primary" />
              视频
            </span>
          )}

          {/*
            有项目档案的作品点开是整屏拆解，不是小浮层。
            先在卡片上标出来，别让人点进去才发现内容量不一样。
          */}
          {work.caseStudy && (
            <span className="font-pixel absolute left-3 top-2 z-[1] border border-primary/45 bg-[#01080e]/85 px-1.5 py-1 text-[10px] leading-[12px] text-primary backdrop-blur-[4px]">
              深度拆解
            </span>
          )}

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
          className={`relative flex items-center gap-2.5 border-t border-cyan-200/25 bg-[#02080e]/45 backdrop-blur-sm ${BAR_HEIGHT[large ? "large" : "small"]} ${large ? "px-4" : "px-3"}`}
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

      {onOpen && (
        <button
          type="button"
          onClick={() => onOpen(work)}
          aria-label={`查看「${work.title}」`}
          className="absolute inset-0 z-10 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-primary"
        />
      )}
    </article>
  );
}

/**
 * 空位占位块：占一个格子、高度和真卡片完全一致，但不可见。
 *
 * 用途是**锁住每页的高度** —— 最后一页作品不够一整页时补几个占位，
 * 网格行数就不会从 2 掉到 1，两侧的翻页箭头和下方页码也就不会跳。
 */
export function WorkCardSpacer({ large = false }: { large?: boolean }) {
  return (
    <div aria-hidden="true" className={`invisible ${CARD_BORDER}`}>
      <div className={COVER_BOX} />
      <div className={BAR_HEIGHT[large ? "large" : "small"]} />
    </div>
  );
}
