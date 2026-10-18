import { useCallback, useEffect, useState } from "react";
import { useMediaQuery } from "../../lib/use-media-query";
import { WORK_CATEGORIES, pageCount, pageItems } from "../../lib/works";
import { ENTER, PixelIcon } from "./PixelIcon";
import { WorkCard } from "./WorkCard";
import { PageIndicator, PagerArrow } from "./WorkPager";

/** 未选中时三个按钮的纵向位置（相对舞台高度的百分比） */
const IDLE_TOPS_DESKTOP = ["32%", "50%", "68%"];
const IDLE_TOPS_MOBILE = ["44%", "55%", "66%"];

/** 选中后按钮停的位置：顶部居中，也就是参考图里的蓝框。导航栏是浮岛，别压上去 */
const ACTIVE_TOP_DESKTOP = "17%";
const ACTIVE_TOP_MOBILE = "15%";

const BODY_TOP_DESKTOP = "24%";
const BODY_TOP_MOBILE = "22%";

/**
 * 手机上每页放几个。
 *
 * 屏幕窄、高度也有限，桌面那套「2 个大的 / 6 个小的」会直接溢出视口，
 * 所以移动端减半：大卡片分类一页 1 个，小卡片分类一页 4 个（2×2）。
 */
const MOBILE_PAGE_SIZE = { 2: 1, 3: 4 } as const;

/**
 * 作品页的交互主体。
 *
 * 两个状态：`activeId === null` 时是三个分类按钮，选中后按钮飞向顶部、
 * 下方展开该分类的作品网格。
 *
 * 位移不是两套布局之间硬切 —— 每个按钮始终绝对定位，只改
 * `left / top / transform` 三个值，交给 CSS transition 补间：点哪个，
 * 哪个就从原位滑到顶部，另外两个原地淡出。
 */
export function WorksShowcase() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const active = WORK_CATEGORIES.find((category) => category.id === activeId) ?? null;
  const pageSize = active
    ? isDesktop
      ? active.pageSize
      : MOBILE_PAGE_SIZE[active.columns]
    : 0;
  const total = active ? pageCount(active, pageSize) : 0;
  const items = active ? pageItems(active, page, pageSize) : [];

  const open = useCallback((id: string) => {
    setActiveId(id);
    setPage(1);
  }, []);

  const close = useCallback(() => {
    setActiveId(null);
    setPage(1);
  }, []);

  // Esc 也能退回分类菜单，键盘操作不至于无路可走
  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, close]);

  const activeTop = isDesktop ? ACTIVE_TOP_DESKTOP : ACTIVE_TOP_MOBILE;

  return (
    <div className="absolute inset-0">
      {/* 顶部渐变：压暗星空，保证按钮和标题的对比度 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36%] bg-gradient-to-b from-[#02060c]/70 via-[#02060c]/25 to-transparent"
      />

      {/* 分类按钮：始终渲染，靠坐标切换做位移动画 */}
      {WORK_CATEGORIES.map((category, index) => {
        const isActive = activeId === category.id;
        const isIdle = activeId === null;
        const idleTop = (isDesktop ? IDLE_TOPS_DESKTOP : IDLE_TOPS_MOBILE)[index];

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => open(category.id)}
            aria-pressed={isActive}
            tabIndex={activeId && !isActive ? -1 : 0}
            className={[
              "font-pixel absolute border-[3px] px-6 py-4 text-[24px] leading-[28px] tracking-[0.08em]",
              "transition-[left,top,transform,opacity,background-color,border-color,color,box-shadow]",
              "duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              "shadow-[5px_5px_0_0_rgba(0,0,0,0.65)]",
              isActive
                ? "cursor-default border-primary/80 bg-primary/[0.16] text-primary shadow-[0_0_28px_-2px_hsl(var(--primary)/0.5),5px_5px_0_0_rgba(0,0,0,0.65)]"
                : "cursor-pointer border-cyan-200/40 bg-[#04101a]/75 text-foreground/90 can-hover:border-cyan-200/85 can-hover:bg-[#0a2030]/85 can-hover:text-primary",
            ].join(" ")}
            style={{
              left: isActive ? "50%" : isDesktop ? "7%" : "50%",
              top: isActive ? activeTop : idleTop,
              transform: `translate(${isActive || !isDesktop ? "-50%" : "0"}, -50%)`,
              opacity: !isActive && !isIdle ? 0 : 1,
              pointerEvents: isActive ? "none" : "auto",
              minWidth: isDesktop ? "12.5rem" : "9.5rem",
            }}
          >
            {/* 内衬细线：像素风对话框常见的双线边框 */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-1 border border-current opacity-20"
            />
            {category.label}
          </button>
        );
      })}

      {/* 返回：贴在标题左侧。按钮最小宽度 200(桌面)/152(移动)，半宽 + 图标半宽 + 16px 间隙 */}
      <button
        type="button"
        onClick={close}
        aria-label="返回分类"
        className={[
          "absolute flex h-11 w-11 items-center justify-center border-2 border-cyan-200/45 bg-[#04101a]/85 text-cyan-100",
          "shadow-[3px_3px_0_0_rgba(0,0,0,0.65)] transition-all duration-300",
          "can-hover:border-cyan-200/85 can-hover:bg-[#0a2030]/85 can-hover:text-primary",
          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_rgba(0,0,0,0.65)]",
          activeId ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        style={{
          left: isDesktop ? "calc(50% - 160px)" : "calc(50% - 132px)",
          top: activeTop,
          transform: "translateY(-50%)",
        }}
      >
        <PixelIcon pattern={ENTER} className="h-5 w-5" />
      </button>

      {/* 作品区 */}
      <div
        className={[
          "absolute left-1/2 w-[92%] max-w-[1030px] -translate-x-1/2 transition-opacity duration-500",
          "md:w-[69%]",
          activeId ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        style={{ top: isDesktop ? BODY_TOP_DESKTOP : BODY_TOP_MOBILE }}
      >
        {active && (
          <>
            <div className="relative">
              <div
                key={`${active.id}-${page}`}
                className={
                  active.columns === 2
                    ? "grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-10"
                    : "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-7"
                }
              >
                {items.map((work, index) => (
                  <WorkCard
                    key={work.id}
                    work={work}
                    index={index}
                    large={active.columns === 2}
                  />
                ))}
              </div>

              {/* 桌面端：箭头贴在网格两侧、垂直居中 */}
              <div className="pointer-events-none absolute inset-y-0 -left-[4.5rem] hidden items-center md:flex">
                <PagerArrow
                  direction="prev"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  label="上一页"
                  className="h-14 w-14"
                />
              </div>
              <div className="pointer-events-none absolute inset-y-0 -right-[4.5rem] hidden items-center md:flex">
                <PagerArrow
                  direction="next"
                  disabled={page >= total}
                  onClick={() => setPage((p) => Math.min(total, p + 1))}
                  label="下一页"
                  className="h-14 w-14"
                />
              </div>
            </div>

            {/* 桌面端页码在网格下方 */}
            <div className="mt-6 hidden md:block">
              <PageIndicator page={page} total={total} />
            </div>

            {/* 移动端：箭头和页码排成一行，放网格下面 */}
            <div className="mt-4 flex items-center justify-center gap-5 md:hidden">
              <PagerArrow
                direction="prev"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                label="上一页"
                className="h-10 w-10 border-cyan-200/40"
              />
              <PageIndicator page={page} total={total} />
              <PagerArrow
                direction="next"
                disabled={page >= total}
                onClick={() => setPage((p) => Math.min(total, p + 1))}
                label="下一页"
                className="h-10 w-10 border-cyan-200/40"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
