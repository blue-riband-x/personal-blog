import type { WorkItem } from "../../lib/works";
import { CoverArt, Scanlines } from "./CoverArt";
import { PageIndicator, PagerArrow } from "./WorkPager";

/**
 * 侧边图片相对**自身宽度**的位移（百分比）。
 *
 * 横图和竖图的可用宽度差得很远，所以不能共用一个值：
 * - 横图占 72~88% 宽，往两边推 56% 正好露出一小截；
 * - 竖图只占中间窄窄一条，两边空得很，推开 105% 才能「前一张 / 后一张」都完整露出来。
 */
const SIDE_SHIFT = { wide: 56, tall: 105 } as const;

/** 按「离当前张的距离」索引：0 = 当前，1 = 左右邻居，2 = 更远（藏起来） */
const SCALE = [1, 0.84, 0.7];
const OPACITY = [1, 0.78, 0];
const FILTER = ["none", "blur(5px) brightness(0.85)", "blur(9px) brightness(0.45)"];

/**
 * 框架 / 卡片的两套几何。
 *
 * 横图（截图）：框架比例 = 图的 16:10 ÷ 宽度占比，手机 88% → 20/11，桌面 72% → 22/10。
 * 竖图（9:16 短片）：宽度由高度反推，所以给框架一个**高度**而不是宽高比，
 * 卡片贴上 `aspect-[9/16]` 自己算宽度 —— 手机上 340 高 ≈ 191 宽，桌面 460 高 ≈ 259 宽。
 */
const FRAME = {
  wide: "aspect-[20/11] md:aspect-[22/10]",
  tall: "h-[min(44svh,340px)] md:h-[min(56svh,460px)]",
} as const;

const CARD = {
  wide: "aspect-[16/10] w-[88%] md:w-[72%]",
  tall: "aspect-[9/16] h-[92%]",
} as const;

interface WorkGalleryProps {
  work: WorkItem;
  images: string[];
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
 */
export function WorkGallery({ work, images, index, onIndexChange }: WorkGalleryProps) {
  const total = images.length;
  const tall = work.aspect === "tall";

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
  const shift = SIDE_SHIFT[tall ? "tall" : "wide"];

  return (
    <div className="w-full">
      <div
        className={`relative w-full overflow-hidden border-b border-cyan-200/25 bg-[#03080f]/60 ${FRAME[tall ? "tall" : "wide"]}`}
      >
        {images.map((src, i) => {
          const delta = offsetOf(i, index, total);
          const depth = Math.min(Math.abs(delta), 2);

          return (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => delta !== 0 && onIndexChange(i)}
              tabIndex={depth <= 1 ? 0 : -1}
              aria-label={delta === 0 ? `当前第 ${i + 1} 张` : `查看第 ${i + 1} 张`}
              aria-current={delta === 0 || undefined}
              className={[
                "absolute left-1/2 top-1/2 overflow-hidden border border-cyan-200/40",
                CARD[tall ? "tall" : "wide"],
                "transition-[transform,opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
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
              <CoverArt work={work} src={src} fit="contain" />
              <Scanlines />
            </button>
          );
        })}

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
