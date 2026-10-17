import { asset } from "../../lib/utils";

/**
 * 作品页背景层：MotionSites「Gradient Wave」循环视频。
 *
 * 严格按背景素材要求实现：
 * - 静音（muted）+ 自动播放（autoPlay）+ 循环（loop）+ 行内播放（playsInline），
 *   移动端才不会被系统接管成全屏播放器；
 * - `object-cover` 铺满整个视口，不做留边；
 * - 移动端裁切重心右移（`object-[68%_center]`），避免竖屏把画面右侧的焦点运动裁掉，
 *   桌面端回到居中；
 * - 纯装饰层：无播放控件、禁止画中画、不参与 Tab 焦点、对读屏隐藏；
 * - `poster` 兜底：视频未加载完或解码失败时显示从该视频抽的一帧。
 *
 * 素材授权：MotionSites「Gradient Wave」（background 分类，标注免费）。
 * 用于商业项目前，请先确认 MotionSites 的授权状态。
 */
export function WorksBackdrop() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <video
        className="h-full w-full object-cover object-[68%_center] md:object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={asset("videos/works-bg-poster.png")}
        disablePictureInPicture
        tabIndex={-1}
      >
        <source src={asset("videos/works-bg.mp4")} type="video/mp4" />
      </video>
    </div>
  );
}
