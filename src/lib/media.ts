/**
 * 背景视频与首帧图的外链配置。
 *
 * 这些资源不放 GitHub Pages：Pages 到国内实测只有 ~1Mbps，
 * 3MB 的视频要下 30 秒，期间画面只能停在 poster 上，看起来像「视频静止」。
 * 图片和 JS 走 Pages 没问题（单张最大只有 130KB），只有视频必须换直链托管。
 *
 * 换托管只需要改 `OSS_BASE` 一行 —— 组件里一律引用 `MEDIA`，别再写死地址。
 * 阿里云 OSS 有两个前置条件，缺一个链接就是 403：
 * 1. bucket 读写权限 = 公共读，且「阻止公共访问」处于关闭状态（新建桶默认是开启的）；
 * 2. 对象上的 `Content-Type` 必须是 `video/mp4` / `image/jpeg`（控制台按扩展名自动识别）。
 *
 * 改路径用 `?v=` 版本号（如 `hero.mp4?v=2`）来破缓存，
 * 因为对象上设了 `Cache-Control: max-age=2592000`，换文件不换名会命中旧缓存。
 */
const OSS_BASE = "https://blue-blog-source.oss-cn-beijing.aliyuncs.com";

const oss = (path: string) => `${OSS_BASE}/${path}`;

export const MEDIA = {
  /** 博客页顶部横幅：1786kbps 的原始编码，已做交叉淡化循环 */
  hero: {
    desktop: oss("videos/hero.mp4"),
    poster: oss("videos/hero-poster.jpg"),
  },
  /** 作品页背景：桌面 2000k / 手机 1080 宽 900k */
  works: {
    desktop: oss("videos/works-bg.mp4"),
    mobile: oss("videos/works-bg-mobile.mp4"),
    poster: oss("videos/works-bg-poster.jpg"),
  },
} as const;
