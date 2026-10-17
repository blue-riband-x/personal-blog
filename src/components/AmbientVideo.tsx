import { useEffect, useRef } from "react";
import { asset } from "../lib/utils";

export interface AmbientVideoSource {
  /** 完整地址（OSS 直链）或 `public` 下的相对路径，如 `videos/hero.mp4` */
  src: string;
  type?: string;
  /** 媒体查询。浏览器只在「选源」那一刻按它决定，不会随窗口缩放切换 */
  media?: string;
}

interface AmbientVideoProps {
  /** 按顺序列出可选的源，浏览器取第一个 `media` 命中的 */
  sources: AmbientVideoSource[];
  /** 兜底首帧。请用与视频同比例的画面，否则加载期构图会和播放时不一致 */
  poster?: string;
  /** 布局与 `object-position` 由调用方决定 */
  className?: string;
}

/**
 * 纯装饰用的循环背景视频。
 *
 * 只做一件事：让背景视频在任何浏览器上都真的动起来。
 * 浏览器对「自动播放」的限制很碎，最容易踩的坑是 React 把 `muted` 作为 DOM 属性写入，
 * 浏览器可能在挂载瞬间就抢先尝试自动播放 —— 那一刻还没被标记成静音，于是被策略拦下，
 * 而且拦下后不会自动重试，画面就永远停在 poster 上，看起来「完全静止」。
 *
 * 这里的兜底策略：
 * 1. 在任何 `play()` 之前，先把静音落到 DOM 上；
 * 2. 首帧可解码（`loadeddata` / `canplay` / `canplaythrough`）时再补一次；
 * 3. 切回前台补一次（应对切后台、省电模式导致的系统暂停）；
 * 4. 实在被拦，等用户第一次交互后补播；
 * 5. 所有 `play()` 失败都静默吞掉，不污染控制台。
 */
export function AmbientVideo({ sources, poster, className }: AmbientVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    let disposed = false;
    const tryPlay = () => {
      if (disposed) return;
      const result = video.play();
      if (result && typeof result.catch === "function") result.catch(() => {});
    };

    tryPlay();

    const readyEvents = ["loadeddata", "canplay", "canplaythrough"] as const;
    readyEvents.forEach((name) => video.addEventListener(name, tryPlay));

    const resume = () => {
      if (!document.hidden) tryPlay();
    };
    document.addEventListener("visibilitychange", resume);

    const gestureEvents = ["pointerdown", "touchstart", "keydown"] as const;
    gestureEvents.forEach((name) =>
      document.addEventListener(name, tryPlay, { once: true, passive: true }),
    );

    return () => {
      disposed = true;
      readyEvents.forEach((name) => video.removeEventListener(name, tryPlay));
      document.removeEventListener("visibilitychange", resume);
      gestureEvents.forEach((name) => document.removeEventListener(name, tryPlay));
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster ? asset(poster) : undefined}
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    >
      {sources.map((source) => (
        <source
          key={source.src}
          src={asset(source.src)}
          type={source.type ?? "video/mp4"}
          media={source.media}
        />
      ))}
    </video>
  );
}
