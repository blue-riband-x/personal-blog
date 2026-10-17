import { WorksBackdrop } from "../components/works/WorksBackdrop";

/**
 * 作品页。
 *
 * 目前只放背景视频这一层，内容待补充；除全站导航栏外不加任何额外元素。
 * 后续要放项目时，在 `<WorksBackdrop />` 之后叠内容即可（背景层已 `absolute inset-0`）。
 */
export default function Works() {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-[#05070f]">
      <WorksBackdrop />
    </section>
  );
}
