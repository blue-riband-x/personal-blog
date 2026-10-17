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
 * 这里做了无损观感的重编码 —— 去掉音轨、CRF 18、faststart（moov 前置，边下边播）：
 * 桌面 5.2MB，手机另给一条 1080 宽的 CRF 20 版本 1.7MB（手机上根本看不出差别）。
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
