import { useEffect, useState } from "react";
import { workDescription, workGallery, type WorkItem } from "../../lib/works";
import { ARROW_RIGHT, CROSS, PixelIcon } from "./PixelIcon";
import { WorkGallery } from "./WorkGallery";

interface WorkDetailProps {
  work: WorkItem;
  /** 图区要不要扫描线，见 `WorkCategory.scanlines` */
  scanlines?: boolean;
  onClose: () => void;
}

/**
 * 作品详情：盖住整张作品网格的一层浮层。
 *
 * 上图片、下文字、最下面「立即体验」。调用方用 `key={work.id}` 挂载，
 * 所以换一个作品时组件会重建，图片索引自动回到第一张，不用手动重置。
 */
export function WorkDetail({ work, scanlines = true, onClose }: WorkDetailProps) {
  const slides = workGallery(work);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (slides.length < 2) return;
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + slides.length) % slides.length);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length, onClose]);

  const paragraphs = workDescription(work).split("\n\n").filter(Boolean);

  return (
    // 顶部留出导航浮岛的高度，否则面板会钻到导航条底下
    <div className="absolute inset-0 z-30 flex items-center justify-center px-2 pb-4 pt-[74px] sm:px-6 sm:pb-6 sm:pt-[88px]">
      {/* 背板：点一下就关，和 Esc 等价 */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-[#02060c]/85 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={work.title}
        className="relative flex max-h-[88svh] w-full max-w-[780px] animate-panel-in flex-col overflow-hidden border-[3px] border-cyan-200/45 bg-[#04101a]/95 shadow-[10px_10px_0_0_rgba(0,0,0,0.6)]"
      >
        {/* 内衬细线，和分类按钮上的那圈一致 */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 z-40 border border-cyan-200/12"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          autoFocus
          className={[
            "absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center",
            "border-2 border-cyan-200/60 bg-[#01080e]/[0.96] text-cyan-50 backdrop-blur-[6px]",
            "shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] transition-colors duration-150",
            "can-hover:border-primary can-hover:text-primary",
            "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_rgba(0,0,0,0.6)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          ].join(" ")}
        >
          <PixelIcon pattern={CROSS} className="h-4 w-4" />
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <WorkGallery
            work={work}
            slides={slides}
            index={index}
            scanlines={scanlines}
            onIndexChange={setIndex}
          />

          <div className="px-5 pb-6 pt-5 sm:px-7 sm:pb-7">
            <h2 className="font-pixel text-[24px] leading-[30px] text-primary sm:text-[30px] sm:leading-[36px]">
              {work.title}
            </h2>

            {work.meta && (
              <p className="font-pixel mt-2 text-[12px] leading-[18px] tracking-[0.06em] text-cyan-100/55">
                {work.meta}
              </p>
            )}

            {paragraphs.length > 0 && (
              <div className="mt-4 space-y-3 border-l-2 border-cyan-200/25 pl-4">
                {paragraphs.map((text, i) => (
                  <p key={i} className="text-[14px] leading-[24px] text-foreground/75">
                    {text}
                  </p>
                ))}
              </div>
            )}

            {work.link && (
              <a
                href={work.link}
                target="_blank"
                rel="noreferrer noopener"
                className={[
                  "font-pixel mt-6 inline-flex items-center gap-2.5 border-[3px] border-primary/75",
                  "bg-primary/[0.14] px-5 py-3 text-[18px] leading-[22px] text-primary",
                  "shadow-[5px_5px_0_0_rgba(0,0,0,0.6)] transition-colors duration-150",
                  "can-hover:border-primary can-hover:bg-primary/25",
                  "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_rgba(0,0,0,0.6)]",
                ].join(" ")}
              >
                {work.linkLabel ?? "立即体验"}
                <PixelIcon pattern={ARROW_RIGHT} className="h-[14px] w-[14px]" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
