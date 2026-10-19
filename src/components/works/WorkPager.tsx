import { ARROW_LEFT, ARROW_RIGHT, PixelIcon } from "./PixelIcon";

interface PagerArrowProps {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

/** 翻页按钮：像素方块 + 硬阴影，按下时整体右下位移 2px 模拟被按进去 */
export function PagerArrow({ direction, disabled, onClick, label, className = "" }: PagerArrowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={[
        // 尺寸由调用方给（列表翻页 56/40，详情图 44）—— 这里写死默认值会和传进来的
        // h-* / w-* 撞车，而 Tailwind 谁赢只取决于生成顺序，不是 class 的先后
        "pointer-events-auto flex items-center justify-center border-2 border-cyan-100/60",
        // 底色必须接近全实：右侧箭头落在星球的高光区，15% 的透光就能把箭头吃掉
        "bg-[#01080e]/[0.96] text-cyan-50 shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] backdrop-blur-[6px]",
        "transition-colors duration-150",
        "can-hover:enabled:border-primary can-hover:enabled:bg-[#04121c] can-hover:enabled:text-primary",
        "enabled:active:translate-x-[2px] enabled:active:translate-y-[2px] enabled:active:shadow-[1px_1px_0_0_rgba(0,0,0,0.6)]",
        // 禁用态只压暗字和边框、不整体降透明度：整块半透明的框落在星球高光区会直接消失
        "disabled:cursor-not-allowed disabled:border-cyan-200/25 disabled:text-cyan-100/30",
        className,
      ].join(" ")}
    >
      <PixelIcon
        pattern={direction === "prev" ? ARROW_LEFT : ARROW_RIGHT}
        className="h-[18px] w-[18px]"
      />
    </button>
  );
}

interface PageIndicatorProps {
  page: number;
  total: number;
  className?: string;
}

/** 页码：`01 / 02`，两位补零更像仪表 */
export function PageIndicator({ page, total, className = "" }: PageIndicatorProps) {
  return (
    <div
      className={`font-pixel flex items-center justify-center gap-2 text-[16px] leading-[20px] tracking-[0.12em] text-cyan-100/60 ${className}`}
    >
      <span className="text-primary">{String(page).padStart(2, "0")}</span>
      <span className="text-cyan-100/30">/</span>
      <span>{String(total).padStart(2, "0")}</span>
    </div>
  );
}
