import { Link } from "react-router-dom";
import { SITE } from "../../lib/site";
import { IconCode, IconExternal, IconFolder, IconImage, IconLayers } from "./WorksIcons";

/** 每个项目条目将来会包含的信息，先把它显式列出来，让空状态也说得清「这里会长出什么」。 */
const ENTRY_HINTS = [
  { icon: IconLayers, label: "技术栈", desc: "用了什么、为什么这么选" },
  { icon: IconImage, label: "截图与简介", desc: "长什么样、解决了什么问题" },
  { icon: IconCode, label: "源码 / 演示", desc: "能跑起来的地址" },
];

/**
 * 作品区的占位状态。
 *
 * 现在还没有项目，所以不摆假卡片，用一个明确的空状态占位：
 * 虚线边框 + 中心光晕 + 一句人话说明，下方列出条目将来包含的信息，
 * 等有项目了直接把这里换成项目卡片网格即可。
 */
export function WorksPlaceholder() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/15 bg-hero-bg/50 px-6 py-14 text-center sm:py-16">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <IconFolder className="h-6 w-6 text-primary" />
        </span>

        <h2 className="mt-6 text-lg font-semibold text-foreground">这里还空着</h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
          项目资料还在整理，理清一个就放上来一个。想先看点能读的东西，博客那边一直有更新。
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/blog"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-hero-bg"
          >
            去看博客
          </Link>
          <a
            href={SITE.github}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            GitHub
            <IconExternal className="h-3.5 w-3.5 opacity-60" />
          </a>
        </div>

        <dl className="mx-auto mt-10 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
          {ENTRY_HINTS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5"
            >
              <dt className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                <Icon className="h-3.5 w-3.5 text-primary/80" />
                {label}
              </dt>
              <dd className="mt-1.5 text-xs font-light leading-relaxed text-muted-foreground/80">
                {desc}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
