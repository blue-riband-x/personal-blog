import type { WorkAspect, WorkItem, WorkSlide } from "../../lib/works";
import { CoverArt, Scanlines } from "./CoverArt";
import { PageIndicator, PagerArrow } from "./WorkPager";

/** 两种素材的宽高比，位移计算要用到 */
const AR: Record<WorkAspect, number> = { wide: 16 / 10, tall: 9 / 16 };

/**
 * 卡片高度占框架高度的比例。
 *
 * 横框里卡片几乎顶满（高度反过来决定 72% 的宽度，邻居正好只在边缘露一条）；
 * 竖框留出上下呼吸，不然 9:16 的卡片会顶到边框。
 */
const CARD_HEIGHT: Record<WorkAspect, string> = {
  wide: "h-[99%]",
  tall: "h-[92%]",
};

const CARD_AR: Record<WorkAspect, string> = {
  wide: "aspect-[16/10]",
  tall: "aspect-[9/16]",
};

/**
 * 框架。横图（截图）按比例给宽度，竖图（短片/海报）按高度给 —— 见下面注释。
 */
const FRAME: Record<WorkAspect, string> = {
  wide: "aspect-[20/11] md:aspect-[22/10]",
  tall: "h-[min(44svh,340px)] md:h-[min(56svh,460px)]",
};

/** 按「离当前张的距离」索引：0 = 当前，1 = 左右邻居，2 = 更远（藏起来） */
const SCALE = [1, 0.84, 0.7];
const OPACITY = [1, 0.78, 0];
const FILTER = ["none", "blur(5px) brightness(0.85)", "blur(9px) brightness(0.45)"];

/**
 * 邻居要往旁边推多少（相对**它自己**的宽度，百分比）。
 *
 * 所有卡片等高，所以宽度比就等于宽高比。两张卡并排时中心距 = 两卡半宽之和，
 * 再让邻居钻到当前张底下一点点（5% 当前卡宽），视觉上像一叠摊开的卡片。
 * 整个式子消掉了框架的实际像素尺寸，横竖混排也不会算错。
 */
function shiftPercent(current: WorkAspect, self: WorkAspect) {
  const c = AR[current];
  const s = AR[self];
  return ((c + s) / (2 * s) - (0.05 * c) / s) * 100;
}

interface WorkGalleryProps {
  work: WorkItem;
  slides: WorkSlide[];
  /** 当前第几张（受控 —— 交给 WorkDetail 统一接管键盘左右键） */
  index: number;
  onIndexChange: (index: number) => void;
}

/**
 * 详情页的图片区：中间一张清楚的，左右各一张模糊的，像摊开的卡片。
 *
 * 不是轮播图那种「整条轨道平移」—— 每张图都常驻在同一层，
 * 只按**离当前张的距离**改 `translateX / scale / opacity / blur` 四个值，
 * 位置和虚化都交给 CSS 补间。所以翻页时看到的是「中间这张退到旁边、
 * 旁边那张顶上来」，而不是一条胶卷在滑动。
 *
 * 每张卡片的高度统一、宽度由**素材自己的比例**推算，所以一组里混着
 * 16:9 街景和 9:16 海报时，两张卡是等高不同宽，谁都不会被塞进不合适的框里。
 */
export function WorkGallery({ work, slides, index, onIndexChange }: WorkGalleryProps) {
  const total = slides.length;
  // 框架跟着**当前这张**走，而不是跟着作品 —— 一横一竖混排时，
  // 竖版海报能占满整个框，不会被塞进横向的矮框里缩成一条。
  const frame = slides[index]?.aspect ?? work.aspect ?? "wide";

  // 没配图时退回封面或 hue 占位图案，至少让详情页有一张底图
  if (total === 0) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-cyan-200/25 bg-[#03080f]/60">
        <CoverArt work={work} />
        <Scanlines />
      </div>
    );
  }

  const step = (delta: number) => onIndexChange((index + delta + total) % total);

  /**
   * 一张卡的公共样式。
   *
   * 高度统一、宽度由**素材自己的比例**反过来算，所以一横一竖并排时是等高不同宽，
   * 谁都不会被塞进不合适的框里。
   */
  const cardClass = (aspect: WorkAspect) =>
    [
      "absolute left-1/2 top-1/2 max-w-[94%] overflow-hidden border border-cyan-200/40",
      CARD_AR[aspect],
      CARD_HEIGHT[frame],
      "transition-[transform,opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
    ].join(" ");

  // 只有两张时，环形排不开 —— 前后张其实是同一张，只在一侧出现。
  // 补一个镜像副本到另一侧，翻页时左右都能看到虚化的邻居，构图才对称。
  // 副本的偏移取**邻居偏移的相反数**：翻到第 2 张时邻居在第 1 张左边，副本就得去右边。
  const mirror = total === 2 ? slides[(index + 1) % 2] : null;
  const mirrorDelta = mirror ? -offsetOf((index + 1) % 2, index, total) : 0;
  const mirrorShift = mirror ? shiftPercent(slides[index].aspect, mirror.aspect) : 0;

  return (
    <div className="w-full">
      <div
        className={`relative w-full overflow-hidden border-b border-cyan-200/25 bg-[#03080f]/60 ${FRAME[frame]}`}
      >
        {slides.map((slide, i) => {
          const delta = offsetOf(i, index, total);
          const depth = Math.min(Math.abs(delta), 2);
          const shift = shiftPercent(slides[index].aspect, slide.aspect);

          return (
            <button
              key={`${slide.src}-${i}`}
              type="button"
              onClick={() => delta !== 0 && onIndexChange(i)}
              tabIndex={depth <= 1 ? 0 : -1}
              aria-label={delta === 0 ? `当前第 ${i + 1} 张` : `查看第 ${i + 1} 张`}
              aria-current={delta === 0 || undefined}
              className={[
                cardClass(slide.aspect),
                delta === 0
                  ? "cursor-default shadow-[0_0_44px_-10px_rgba(0,0,0,0.95)]"
                  : "cursor-pointer",
              ].join(" ")}
              style={{
                // 垂直居中放进 transform 里：这个元素已经有内联 transform，再叠一个
                // -translate-y-1/2 的类会被内联样式覆盖，只好一次写全
                transform: `translate(calc(-50% + ${delta * shift}%), -50%) scale(${SCALE[depth]})`,
                opacity: OPACITY[depth],
                filter: FILTER[depth],
                zIndex: 30 - depth * 10,
                pointerEvents: depth <= 1 ? "auto" : "none",
              }}
            >
              <CoverArt work={work} src={slide.src} fit="contain" />
              <Scanlines />
            </button>
          );
        })}

        {/* 两张时另一侧的镜像副本：纯装饰，不接事件也不进无障碍树 */}
        {mirror && (
          <div
            aria-hidden="true"
            className={`${cardClass(mirror.aspect)} pointer-events-none`}
            style={{
              transform: `translate(calc(-50% + ${mirrorDelta * mirrorShift}%), -50%) scale(${SCALE[1]})`,
              opacity: OPACITY[1],
              filter: FILTER[1],
              zIndex: 20,
            }}
          >
            <CoverArt work={work} src={mirror.src} fit="contain" />
            <Scanlines />
          </div>
        )}

        {/* 只有一张图时不需要翻页箭头。
            居中用 flex 而不是 -translate-y-1/2 —— 按下时按钮要 translate-y-[2px]，
            两个类写的是同一个 --tw-translate-y，会把按钮从 50% 顶上直接跳下来，
            结果鼠标抬起时指针已经不在按钮上，click 事件根本不会触发。 */}
        {total > 1 && (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-2 z-50 flex items-center sm:left-3">
              <PagerArrow
                direction="prev"
                disabled={false}
                onClick={() => step(-1)}
                label="上一张"
                className="h-9 w-9 sm:h-11 sm:w-11"
              />
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-2 z-50 flex items-center sm:right-3">
              <PagerArrow
                direction="next"
                disabled={false}
                onClick={() => step(1)}
                label="下一张"
                className="h-9 w-9 sm:h-11 sm:w-11"
              />
            </div>
          </>
        )}
      </div>

      {/* 页码放在框架外面：竖屏素材会占满整张卡片的高度，压在图上一定挡住画面 */}
      {total > 1 && (
        <div className="mt-2.5">
          <PageIndicator page={index + 1} total={total} />
        </div>
      )}
    </div>
  );
}

/**
 * 第 i 张相对当前张的偏移。
 *
 * 超过两张时取**环形最短距离** —— 三张图停在第 1 张时，最后一张应该出现在
 * 左手边而不是右边。两张图时不做环形处理，不然永远只有一侧有邻居。
 */
function offsetOf(index: number, current: number, total: number) {
  let delta = index - current;
  if (total > 2) {
    if (delta > total / 2) delta -= total;
    if (delta < -total / 2) delta += total;
  }
  return delta;
}
