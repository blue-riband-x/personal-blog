import { WorksHero } from "../components/works/WorksHero";
import { WorksPlaceholder } from "../components/works/WorksPlaceholder";

/**
 * 作品页。
 *
 * 顶部是全宽视频横幅（WorksHero），下方是项目区。
 * 目前还没有项目，先由 WorksPlaceholder 承担空状态；
 * 等有内容了，把占位换成项目卡片网格即可，页面本身不用改结构。
 */
export default function Works() {
  return (
    <div>
      <WorksHero />

      <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              项目一览
            </h2>
            <p className="mt-2 text-sm font-light text-muted-foreground">
              按时间倒序排列，做过的都留个记录。
            </p>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
            整理中
          </span>
        </div>

        <div className="mt-8">
          <WorksPlaceholder />
        </div>
      </section>
    </div>
  );
}
