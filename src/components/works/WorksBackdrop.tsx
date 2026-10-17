import { AmbientVideo } from "../AmbientVideo";

/**
 * 作品页背景层：MotionSites「Gradient Wave」循环视频。
 *
 * 严格按背景素材要求实现：
 * - 静音 + 自动播放 + 循环 + 行内播放，移动端不会被系统接管成全屏播放器（见 `AmbientVideo`）；
 * - `object-cover` 铺满整个视口，不留边；
 * - 视频是 3:2（1764×1176），比绝大多数屏幕更「方」，`cover` 必然要在上下裁掉一条。
 *   画面主体是最底部那条草地，所以裁切重心压到底部（`…100%`），只牺牲上方纯黑的天空，
 *   不再吃掉草地；手机竖屏是横向裁切，把重心稍微右移（`68%`）保住画面右侧的焦点；
 * - `poster` 用的是视频真实比例的首帧图，加载期间的构图与播放时完全一致，不会跳一下。
 *
 * 体积：原片 13.3MB（8.2Mbps，还带一条没人听的 AAC 音轨）。
 * 这里做了观感无损的重编码 —— 去掉音轨、二遍定码率 2000k、faststart（moov 前置，边下边播）：
 * 桌面 3.3MB（与原片 SSIM 0.994，和 CRF18 完全同档，只是省掉了一堆冗余码率），
 * 手机另给一条 1080 宽 900k 的版本 1.4MB（手机上根本看不出差别）。
 * 之所以要压得这么狠：GitHub Pages 到国内实测只有 1Mbps 上下，5MB 的视频要下 40 秒，
 * 期间画面只能停在 poster 上 —— 再好看的首帧也不如动起来。
 *
 * 素材授权：MotionSites「Gradient Wave」（background 分类，标注免费）。
 * 用于商业项目前，请先确认 MotionSites 的授权状态。
 */
export function WorksBackdrop() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <AmbientVideo
        sources={[
          { src: "videos/works-bg-mobile.mp4", media: "(max-width: 768px)" },
          { src: "videos/works-bg.mp4" },
        ]}
        poster="videos/works-bg-poster.jpg"
        // 底色与视频首帧同源，poster 解码完成前也不会闪白
        className="h-full w-full bg-[#05070f] object-cover object-[68%_100%] md:object-[50%_100%]"
      />
    </div>
  );
}
