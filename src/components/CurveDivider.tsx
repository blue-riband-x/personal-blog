import { cn } from "../lib/utils";

interface CurveDividerProps {
  /** 额外类名，用来控制高度（如 h-[72px]） */
  className?: string;
  /** 是否叠加一层淡绿色辉光，制造叠影层次 */
  glow?: boolean;
}

/**
 * 背景图 / 视频与下方内容区之间的曲线过渡。
 *
 * 由两条错位的平滑贝塞尔曲线叠加而成：
 * 上层是渐隐的主题色辉光，下层是与页面背景同色的主体曲线。
 * 移出辉光边缘，形成「图片自然溶进页面」的过渡，而不是生硬的直线切割。
 */
export function CurveDivider({ className, glow = true }: CurveDividerProps) {
  return (
    <svg
      className={cn("pointer-events-none block w-full", className)}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="curve-divider-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.14" />
        </linearGradient>
      </defs>

      {glow && (
        <path
          d="M0,50 C220,92 420,26 720,42 C1000,57 1220,96 1440,54 L1440,120 L0,120 Z"
          fill="url(#curve-divider-glow)"
        />
      )}

      <path
        d="M0,86 C240,112 480,56 720,66 C960,76 1200,110 1440,84 L1440,120 L0,120 Z"
        fill="hsl(var(--hero-bg))"
      />
    </svg>
  );
}
