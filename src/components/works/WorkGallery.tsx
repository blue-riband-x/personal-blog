import type { WorkItem } from "../../lib/works";
import { CoverArt, Scanlines } from "./CoverArt";
import { PageIndicator, PagerArrow } from "./WorkPager";

/**
 * 侧边图片相对**自身宽度**的位移（百分比）。
 * 中间那张占 68% 宽，往两边各推 56% 后正好露出一小截 ——
 * 想调「露出来多少」改这一个数就够了。
 */
const SIDE_SHIFT = 56;

/** 按「离当前张的距离」索引：0 = 当前，1 = 左右邻居，2 = 更远（藏起来） */
const SCALE = [1, 0.84, 0.7];
const OPACITY = [1, 0.78, 0];
const FILTER = ["none", "blur(5px) brightness(0.85)", "blur(9px) brightness(0.45)"];

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

  return (
    <div className="relative w-full">
      {/*
        框架的宽高比 = 图的宽高比(16:10) ÷ 当前图宽度占比。**两者必须配着改**，
        不然中间那张会被 object-cover 裁掉左右两边。
        手机上 88% 宽 → 1.6 / 0.88 = 20/11，桌面 72% 宽 → 1.6 / 0.72 ≈ 22/10。

        宽度占比同时也是「左右邻居能露出多少」的唯一旋钮：邻居贴在框架边缘被裁，
        露出的那一条永远等于 (1 - 占比) / 2 —— 手机 88% 只剩 22px 左右，
        再往上加（试过 90%）邻居就基本看不见了，别再放大。
      */}
      <div className="relative aspect-[20/11] w-full overflow-hidden border-b border-cyan-200/25 bg-[#03080f]/60 md:aspect-[22/10]">
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
                "absolute left-1/2 top-1/2 aspect-[16/10] w-[88%] overflow-hidden border border-cyan-200/40 md:w-[72%]",
                "transition-[transform,opacity,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                delta === 0
                  ? "cursor-default shadow-[0_0_44px_-10px_rgba(0,0,0,0.95)]"
                  : "cursor-pointer",
              ].join(" ")}
              style={{
                // 垂直居中放进 transform 里：这个元素已经有内联 transform，再叠一个
                // -translate-y-1/2 的类会被内联样式覆盖，只好一次写全
                transform: `translate(calc(-50% + ${delta * SIDE_SHIFT}%), -50%) scale(${SCALE[depth]})`,
                opacity: OPACITY[depth],
                filter: FILTER[depth],
                zIndex: 30 - depth * 10,
                pointerEvents: depth <= 1 ? "auto" : "none",
              }}
            >
              <CoverArt work={work} src={src} />
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

        {total > 1 && (
          <div className="absolute inset-x-0 bottom-2 z-50">
            <PageIndicator page={index + 1} total={total} />
          </div>
        )}
      </div>
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
