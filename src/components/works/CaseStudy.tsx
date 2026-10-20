import { useCallback, useEffect, useRef, useState } from "react";
import { SITE } from "../../lib/site";
import type { CaseStudy as CaseStudyData, WorkItem } from "../../lib/works";
import { asset } from "../../lib/utils";
import { CaseBlocks } from "./CaseBlocks";
import { ARROW_RIGHT, CROSS, PixelIcon } from "./PixelIcon";

interface CaseStudyProps {
  work: WorkItem;
  study: CaseStudyData;
  onClose: () => void;
}

/**
 * 项目档案：开发类作品的整屏详情。
 *
 * 和小的浮层详情（`WorkDetail`）不是同一档东西 —— 这里要装下需求、选型、
 * 架构、实现、踩坑，还要放五六张截图，所以版式从「一张图 + 几段话」
 * 换成了「左侧固定信息栏 + 右侧可滚动的正文」：
 *
 * - 左边是不动的：一句话定位、概览数字、技术栈、目录；
 * - 右边滚动时，目录高亮跟着变，顶部还有一条阅读进度；
 * - 窄屏上左栏折叠进正文开头，目录变成标题下方的一排横向标签。
 *
 * 状态都留在组件内部（当前小节、进度），从 `WorksShowcase` 看出去
 * 它只是一个「盖在网格上的整屏层」，开关由 `detail` 决定。
 */
export function CaseStudy({ work, study, onClose }: CaseStudyProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(study.sections[0]?.id ?? "");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /** 滚动时同时更新进度条和高亮的目录项（取「已经越过 1/3 屏」的最后一节） */
  const handleScroll = useCallback(() => {
    const viewport = scrollRef.current;
    if (!viewport) return;

    const max = viewport.scrollHeight - viewport.clientHeight;
    setProgress(max > 0 ? Math.min(1, viewport.scrollTop / max) : 1);

    const top = viewport.getBoundingClientRect().top;
    const probe = viewport.clientHeight * 0.32;
    let current = study.sections[0]?.id ?? "";
    for (const section of study.sections) {
      const node = viewport.querySelector<HTMLElement>(`[data-section="${section.id}"]`);
      if (node && node.getBoundingClientRect().top - top <= probe) current = section.id;
    }
    setActive(current);
  }, [study.sections]);

  useEffect(() => handleScroll(), [handleScroll]);

  /** 目录跳转：算出目标在容器内的绝对偏移，避免被 sticky 的标签条压住 */
  const goTo = (id: string) => {
    const viewport = scrollRef.current;
    const node = viewport?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!viewport || !node) return;

    const offset = node.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
    viewport.scrollTo({ top: viewport.scrollTop + offset - 8, behavior: "smooth" });
  };

  return (
    // 顶部留出导航浮岛的高度，否则面板会钻到导航条底下
    <div className="absolute inset-0 z-30 flex justify-center px-0 pb-0 pt-[64px] sm:px-5 sm:pb-5 sm:pt-[86px]">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-[#02060c]/90 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        className="relative flex h-full w-full max-w-[1180px] animate-panel-in flex-col overflow-hidden border-[3px] border-cyan-200/45 bg-[#04101a]/97 shadow-[10px_10px_0_0_rgba(0,0,0,0.6)]"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-1 z-40 border border-cyan-200/10"
        />

        <header className="relative shrink-0 border-b border-cyan-200/20 px-3.5 sm:px-6">
          <div className="flex items-center gap-3 py-2.5 sm:py-3">
            <span className="font-pixel hidden shrink-0 text-[10px] leading-[15px] tracking-[0.16em] text-primary/60 sm:block">
              CASE
              <br />
              FILE
            </span>

            <div className="min-w-0 flex-1">
              <h2
                id="case-title"
                className="font-pixel truncate text-[19px] leading-[26px] text-primary sm:text-[23px] sm:leading-[30px]"
              >
                {work.title}
              </h2>
              <p className="mt-0.5 truncate text-[11.5px] leading-[16px] text-cyan-100/40">
                {study.role} · {study.period}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="关闭项目档案"
              autoFocus
              className={[
                "flex h-9 w-9 shrink-0 items-center justify-center border-2 border-cyan-200/55 bg-[#01080e]/90 text-cyan-50",
                "shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] transition-colors duration-150",
                "can-hover:border-primary can-hover:text-primary",
                "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_rgba(0,0,0,0.6)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              ].join(" ")}
            >
              <PixelIcon pattern={CROSS} className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 阅读进度：贴在页头下沿，比单独的进度条安静 */}
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-cyan-200/10">
            <div
              className="h-full bg-primary/70 transition-[width] duration-150"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          {/* 左栏：桌面端固定不动，只滚右边 */}
          <aside className="hidden w-[300px] shrink-0 flex-col overflow-y-auto border-r border-cyan-200/15 px-5 py-6 lg:flex">
            <p className="text-[13.5px] leading-[24px] text-foreground/80">{study.lede}</p>

            <div className="mt-5 grid grid-cols-2 gap-px border border-cyan-200/20 bg-cyan-200/15">
              {study.facts.map((fact) => (
                <div key={fact.label} className="bg-[#04101a] px-3 py-2.5">
                  <div className="font-pixel text-[17px] leading-[22px] text-primary">
                    {fact.value}
                  </div>
                  <div className="mt-1 text-[10.5px] leading-[15px] text-cyan-100/40">
                    {fact.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <div className="font-pixel text-[10px] tracking-[0.24em] text-cyan-100/30">STACK</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {study.stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-cyan-200/20 px-1.5 py-1 text-[10.5px] leading-[14px] text-cyan-100/55"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <nav aria-label="项目档案目录" className="mt-6 border-t border-cyan-200/15 pt-4">
              <ul className="space-y-0.5">
                {study.sections.map((section, i) => {
                  const isActive = section.id === active;
                  return (
                    <li key={section.id}>
                      <button
                        type="button"
                        onClick={() => goTo(section.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={[
                          "font-pixel flex w-full items-center gap-2.5 border-l-2 py-1.5 pl-2.5 pr-1 text-left text-[12.5px] leading-[18px] transition-colors duration-200",
                          isActive
                            ? "border-primary text-primary"
                            : "border-cyan-200/15 text-foreground/45 can-hover:border-cyan-200/40 can-hover:text-foreground/75",
                        ].join(" ")}
                      >
                        <span className={isActive ? "text-primary/60" : "text-cyan-100/25"}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {section.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* 右栏：正文滚动区 */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth"
          >
            {/* 窄屏：左栏的信息挪到正文开头 */}
            <div className="border-b border-cyan-200/12 px-5 py-5 lg:hidden">
              <p className="text-[13.5px] leading-[23px] text-foreground/80">{study.lede}</p>

              <div className="mt-4 grid grid-cols-4 gap-px border border-cyan-200/20 bg-cyan-200/15">
                {study.facts.map((fact) => (
                  <div key={fact.label} className="bg-[#04101a] px-2 py-2 text-center">
                    <div className="font-pixel text-[14px] leading-[19px] text-primary">
                      {fact.value}
                    </div>
                    <div className="mt-0.5 text-[10px] leading-[14px] text-cyan-100/40">
                      {fact.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {study.stack.map((tech) => (
                  <span
                    key={tech}
                    className="border border-cyan-200/20 px-1.5 py-0.5 text-[10.5px] leading-[15px] text-cyan-100/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* 窄屏目录：吸顶的横向标签条 */}
            <div className="sticky top-0 z-20 border-b border-cyan-200/15 bg-[#04101a]/95 backdrop-blur-sm lg:hidden">
              <div className="flex gap-1.5 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {study.sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => goTo(section.id)}
                    className={[
                      "font-pixel shrink-0 border px-2.5 py-1 text-[11.5px] leading-[16px] transition-colors",
                      section.id === active
                        ? "border-primary/70 bg-primary/[0.12] text-primary"
                        : "border-cyan-200/20 text-foreground/50",
                    ].join(" ")}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>

            <figure className="border-b border-cyan-200/15 px-3.5 py-4 sm:px-6 sm:py-5">
              <div className="relative overflow-hidden border-2 border-cyan-200/35 bg-[#03080f]">
                {/*
                  首页那张大图不能按原比例铺满 —— 16:10 的截图在 800px 高的面板里
                  会独占一整屏，第一节要滚很久才看得到。限高后裁掉底部那条导航，
                  不损失信息。
                */}
                <img
                  src={asset(study.hero.src)}
                  alt={study.hero.caption}
                  decoding="async"
                  className="block max-h-[min(46svh,420px)] w-full object-cover object-top"
                />
                <span aria-hidden="true" className="absolute left-1.5 top-1.5 h-2 w-2 bg-primary/70" />
                <span aria-hidden="true" className="absolute right-1.5 top-1.5 h-2 w-2 bg-primary/70" />
              </div>
              <figcaption className="mt-2 flex gap-2 text-[12px] leading-[19px] text-cyan-100/40">
                <span className="font-pixel shrink-0 text-primary/60">▲</span>
                <span className="flex-1">{study.hero.caption}</span>
              </figcaption>
            </figure>

            {study.sections.map((section, i) => (
              <section
                key={section.id}
                data-section={section.id}
                className="border-b border-cyan-200/12 px-3.5 py-7 sm:px-6"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="font-pixel text-[12.5px] leading-[18px] text-primary/65">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-pixel text-[20px] leading-[27px] text-foreground/95 sm:text-[23px] sm:leading-[30px]">
                    {section.title}
                  </h3>
                </div>
                <div className="font-pixel mt-1 pl-[30px] text-[10px] leading-[14px] tracking-[0.26em] text-cyan-100/25">
                  {section.kicker}
                </div>

                <div className="mt-4 space-y-4">
                  <CaseBlocks blocks={section.blocks} />
                </div>
              </section>
            ))}

            <footer className="px-3.5 py-6 sm:px-6">
              {study.note && (
                <div className="border-l-2 border-primary/50 bg-primary/[0.06] px-3.5 py-3">
                  <div className="font-pixel text-[10px] tracking-[0.24em] text-primary/75">NOTE</div>
                  <p className="mt-1.5 text-[12.5px] leading-[21px] text-foreground/60">
                    {study.note}
                  </p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                {/* 有线上地址的作品先给一个直接开玩的入口，再是社交/返回 */}
                {work.link && (
                  <a
                    href={work.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={[
                      "font-pixel inline-flex items-center gap-2 border-2 border-primary bg-primary/25 px-3.5 py-2",
                      "text-[13px] leading-[18px] text-primary",
                      "shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] transition-colors duration-150",
                      "can-hover:bg-primary/40",
                      "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_rgba(0,0,0,0.6)]",
                    ].join(" ")}
                  >
                    {work.linkLabel ?? "立即体验"}
                    <PixelIcon pattern={ARROW_RIGHT} className="h-3 w-3" />
                  </a>
                )}

                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={[
                    "font-pixel inline-flex items-center gap-2 border-2 border-primary/70",
                    "bg-primary/[0.12] px-3.5 py-2 text-[13px] leading-[18px] text-primary",
                    "shadow-[3px_3px_0_0_rgba(0,0,0,0.6)] transition-colors duration-150",
                    "can-hover:bg-primary/25",
                    "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_rgba(0,0,0,0.6)]",
                  ].join(" ")}
                >
                  在 GitHub 找我
                  <PixelIcon pattern={ARROW_RIGHT} className="h-3 w-3" />
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className={[
                    "font-pixel border-2 border-cyan-200/40 px-3.5 py-2 text-[13px] leading-[18px] text-foreground/70",
                    "transition-colors duration-150 can-hover:border-cyan-200/80 can-hover:text-primary",
                  ].join(" ")}
                >
                  返回作品列表
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
