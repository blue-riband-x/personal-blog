import { WorksBackdrop } from "../components/works/WorksBackdrop";
import { WorksShowcase } from "../components/works/WorksShowcase";

/**
 * 作品页。
 *
 * 分两层：背景视频（`WorksBackdrop`）+ 交互主体（`WorksShowcase`）。
 * 背景层 `absolute inset-0` 铺满，交互层也是绝对定位、自己算坐标，
 * 所以页面本身不需要额外容器。
 */
export default function Works() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-x-hidden bg-[#05070f]">
      <WorksBackdrop />
      <WorksShowcase />
    </section>
  );
}
