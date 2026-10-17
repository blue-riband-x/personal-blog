import { AmbientVideo } from "../AmbientVideo";
import { MEDIA } from "../../lib/media";

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
 * 桌面 3.1MB（与原片 SSIM 0.994，和 CRF18 完全同档，只是省掉了一堆冗余码率），
 * 手机另给一条 1080 宽 900k 的版本 1.4MB（手机上根本看不出差别）。
 * 压缩和换托管是两件事：视频现已托管在阿里云 OSS（见 `lib/media.ts`），带宽不再是瓶颈，
 * 但体积仍然值得压 —— 首屏流量越小，画面越早起播。
 *
 * 循环：原片首尾帧对不上（最差像素跳 177 级，正常帧间只有 42），直接 loop 会「啪」一下。
 * 所以把末尾 0.5 秒叠到开头做交叉淡化，输出比原片短 0.5 秒 —— 首帧和末帧取自原片的
 * 相邻两帧，回绕时等同于正常播过去一帧。做法见 .workbuddy/memory 的 2026-10-17 日志。
 *
 * 素材授权：MotionSites「Gradient Wave」（background 分类，标注免费）。
 * 用于商业项目前，请先确认 MotionSites 的授权状态。
 */
export function WorksBackdrop() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <AmbientVideo
        sources={[
          { src: MEDIA.works.mobile, media: "(max-width: 768px)" },
          { src: MEDIA.works.desktop },
        ]}
        poster={MEDIA.works.poster}
        // 底色与视频首帧同源，poster 解码完成前也不会闪白
        className="h-full w-full bg-[#05070f] object-cover object-[68%_100%] md:object-[50%_100%]"
      />
    </div>
  );
}
