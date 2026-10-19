import { asset } from "../../lib/utils";
import type { WorkItem } from "../../lib/works";

interface CoverArtProps {
  work: WorkItem;
  /** 指定具体的图；不传就退回 `work.cover` */
  src?: string;
  /** 附加到图片/图案上的定位类（比如详情里想换 object-position） */
  className?: string;
}

/**
 * 封面底图：有图就出图，没图按 `hue` 生成一层很淡的点阵。
 *
 * 卡片和详情轮播都从这里取图 —— 占位图案的算法只写一份，
 * 以后占位作品打开详情时看到的底图和卡片上完全一致。
 */
export function CoverArt({ work, src, className = "" }: CoverArtProps) {
  const source = src ?? work.cover;

  if (source) {
    return (
      <img
        src={asset(source)}
        alt={work.title}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const hue = work.hue ?? 170;

  return (
    <div
      className={`h-full w-full ${className}`}
      style={{
        backgroundColor: `hsl(${hue} 60% 12% / 0.35)`,
        backgroundImage: `radial-gradient(130% 100% at 50% 125%, hsl(${hue} 80% 55% / 0.3), transparent 60%), repeating-linear-gradient(0deg, hsl(${hue} 80% 70% / 0.035) 0 1px, transparent 1px 6px)`,
      }}
    />
  );
}

/** 扫描线：和背景视频的像素颗粒对齐，盖在图片上压一层旧显示器质感 */
export function Scanlines({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.22)_0_1px,transparent_1px_3px)] ${className}`}
    />
  );
}
