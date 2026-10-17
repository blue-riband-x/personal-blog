import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { HERO_LQIP } from "../lib/hero-poster";
import { asset } from "../lib/utils";

const SplineScene = lazy(() => import("@splinetool/react-spline"));

const SCENE_URL = "https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode";

/** 背景大图就绪后，再留这么久才开始下载 3D，避开首屏最后一波请求 */
const SCENE_START_DELAY_MS = 600;

/**
 * 该不该加载 3D 场景。
 *
 * 它是一张跟随鼠标的背景装饰：1MB 运行时 + 4.6MB JS 解析。
 * 没有精确指针的设备（手机、平板）收益几乎为零，省流量模式下更不该花这笔钱。
 *
 * 注意别用 `navigator.connection.effectiveType` 判断：Chrome 根据实测带宽估算，
 * GitHub Pages 到国内这种链路会被判成 `3g`（实测 downlink 1.3Mbps / rtt 250ms），
 * 于是桌面端正常访问也永远看不到 3D。它已经延迟到首屏之后才加载、且有静态图兜底，
 * 慢网络下不该被完全禁用。
 */
function shouldLoadScene() {
  if (typeof window === "undefined") return false;

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return false;

  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    ?.saveData;

  return !saveData;
}

/**
 * 首页背景的加载顺序，按「多久能看到东西」排：
 *
 * 1. 0ms —— 内联的 40×23 模糊图（386 字节），随 React 首帧上屏，
 *    先给出与真实画面同色调的底色，不再是纯黑。
 * 2. 网络 —— 静态大图（WebP 57KB / JPG 兜底 132KB，从 3D 场景实拍），
 *    这才是「看起来已经加载完」的那一帧。1Mbps 下约 0.5 秒。
 * 3. 大图就绪之后 —— 才去下载 Spline（1MB gzip + 上百个 chunk），完成后淡入。
 *
 * 第 3 步的时机不能靠 `document.readyState` / `load` 判断：
 * `readyState` 一旦变成 `complete` 就不会回退，而首页 HTML 里本来就没有图片，
 * 于是它会在 React 刚插入 `<img>` 时就已是 complete —— 3D 会立刻开跑，
 * 把这张静态图挤到 10 秒开外。所以这里直接挂在图片的 `load` 上。
 */
export function HeroBackground() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageReady, setImageReady] = useState(false);
  const [sceneMounted, setSceneMounted] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    if (image.complete && image.naturalWidth > 0) {
      setImageReady(true);
      return;
    }

    // error 也算「结束」：静态图挂了就早点让 3D 接管
    const settle = () => setImageReady(true);
    image.addEventListener("load", settle, { once: true });
    image.addEventListener("error", settle, { once: true });

    return () => {
      image.removeEventListener("load", settle);
      image.removeEventListener("error", settle);
    };
  }, []);

  useEffect(() => {
    if (!imageReady || !shouldLoadScene()) return;

    const timer = window.setTimeout(() => setSceneMounted(true), SCENE_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [imageReady]);

  // onLoad 只代表资源解析完毕，首帧 WebGL 未必已经画出来。
  // 等两帧再淡入，否则会先闪一下透明 canvas。
  const handleSceneLoad = useCallback(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setSceneReady(true)));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <img
        src={HERO_LQIP}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />

      <picture className="contents">
        {/* 竖屏专用：780×1688，按手机视口实拍，只要 15KB（横向图裁切后既费流量又难看） */}
        <source
          media="(max-aspect-ratio: 1/1)"
          srcSet={asset("hero-bg-mobile.webp")}
          type="image/webp"
        />
        <source srcSet={asset("hero-bg.webp")} type="image/webp" />
        <img
          ref={imageRef}
          src={asset("hero-bg.jpg")}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            sceneReady ? "opacity-0" : "opacity-100"
          }`}
        />
      </picture>

      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          sceneReady ? "opacity-100" : "opacity-0"
        }`}
      >
        {sceneMounted && (
          <Suspense fallback={null}>
            <SplineScene
              scene={SCENE_URL}
              onLoad={handleSceneLoad}
              className="h-full w-full"
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
