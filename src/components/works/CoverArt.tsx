import { AmbientVideo } from "../AmbientVideo";
import { asset } from "../../lib/utils";
import type { WorkItem } from "../../lib/works";

/** 按扩展名判断是图片还是视频 —— 数据层不区分类型，`gallery` 里可以混着放 */
const VIDEO_RE = /\.(mp4|webm|mov)$/i;

export function isVideoSource(src: string) {
  return VIDEO_RE.test(src.split("?")[0]);
}

const FIT = {
  cover: "object-cover",
  contain: "object-contain",
} as const;

interface CoverArtProps {
  work: WorkItem;
  /** 指定具体的图/视频；不传就退回 `work.cover` */
  src?: string;
  /** 附加到媒体上的类（比如想换 object-position） */
  className?: string;
  /**
   * `cover`：裁切填满，卡片用 —— 网格要整齐，宁可裁掉一部分。
   * `contain`：完整显示 + 同画面虚化底衬，详情用 —— 竖屏视频不会被裁成一条。
   */
  fit?: keyof typeof FIT;
  /** 视频的兜底首帧，默认取 `work.cover` */
  poster?: string;
}

/**
 * 封面底图：有图/视频就渲染，没有就按 `hue` 生成一层很淡的点阵。
 *
 * 卡片和详情轮播都从这里取 —— 占位图案的算法只写一份，
 * 以后占位作品打开详情时看到的底图和卡片上完全一致。
 */
export function CoverArt({ work, src, className = "", fit = "cover", poster }: CoverArtProps) {
  const source = src ?? work.cover;

  if (!source) {
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

  const fitClass = FIT[fit];
  // 竖屏素材塞进横框时会空出两侧，用同一张画面放大虚化垫底，比留黑边好看
  const backdrop = poster ?? work.cover ?? source;

  return (
    <div className="relative h-full w-full overflow-hidden">
      {fit === "contain" && (
        <img
          src={asset(backdrop)}
          alt=""
          aria-hidden="true"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-xl"
        />
      )}

      {isVideoSource(source) ? (
        <AmbientVideo
          sources={[{ src: source }]}
          poster={backdrop}
          className={`relative h-full w-full ${fitClass} ${className}`}
        />
      ) : (
        <img
          src={asset(source)}
          alt={work.title}
          loading="lazy"
          decoding="async"
          className={`relative h-full w-full ${fitClass} ${className}`}
        />
      )}
    </div>
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
