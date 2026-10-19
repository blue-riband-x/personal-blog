interface PixelIconProps {
  /** 每行一个字符串，"X" 表示实心像素 */
  pattern: string[];
  className?: string;
}

/**
 * 像素图标。
 *
 * 不用字形也不引图标库：图案就是一串字符网格，每个 `X` 渲染成一个 1×1 的
 * `<rect>`，配合 `shapeRendering="crispEdges"` 缩放时不会糊边。
 * 加新图标只要再定义一组字符串。
 */
export function PixelIcon({ pattern, className }: PixelIconProps) {
  const width = pattern[0].length;
  const height = pattern.length;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {pattern.map((row, y) =>
        [...row].map((cell, x) =>
          cell === "X" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null
        )
      )}
    </svg>
  );
}

/**
 * 右箭头（9×8）：一根横杆 + 三角尖。
 * 图形占满 1~7 列，左右各留一列空白，缩放后不会偏在盒子左边。
 */
export const ARROW_RIGHT = [
  "....X....",
  "....XX...",
  "....XXX..",
  ".XXXXXXX.",
  ".XXXXXXX.",
  "....XXX..",
  "....XX...",
  "....X....",
];

/** 左箭头：右箭头的镜像 */
export const ARROW_LEFT = [
  "....X....",
  "...XX....",
  "..XXX....",
  ".XXXXXXX.",
  ".XXXXXXX.",
  "..XXX....",
  "...XX....",
  "....X....",
];

/**
 * 回车（10×7）：右侧竖线到底 → 向右折行的底线 → 左端三角箭头，
 * 也就是 ↵ 的像素化。**不要加顶部横线**，加了就变成一个「⌐」，认不出来。
 * 宽度取 10 是为了在 20px 的盒子里正好每格 2px，不会糊。
 */
export const ENTER = [
  "..........",
  "........X.",
  "........X.",
  "........X.",
  "XX......X.",
  ".XX.....X.",
  "..XXXXXXX.",
];

/**
 * 关闭（10×10）：两条 2px 宽的对角线交叉。
 * 取 10 列同样是为了在 20px 的盒子里每格正好 2px。
 */
export const CROSS = [
  "XX......XX",
  ".XX....XX.",
  "..XX..XX..",
  "...XXXX...",
  "....XX....",
  "....XX....",
  "...XXXX...",
  "..XX..XX..",
  ".XX....XX.",
  "XX......XX",
];
