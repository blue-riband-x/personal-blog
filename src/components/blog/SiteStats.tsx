import { useMemo } from "react";
import { getBlogStats } from "../../lib/posts";
import { SITE } from "../../lib/site";

/**
 * 博客右侧站点统计卡片：文章数、标签数、累计阅读时长、运行天数。
 */
export function SiteStats() {
  const stats = useMemo(() => getBlogStats(), []);

  const runningDays = useMemo(() => {
    const start = new Date(`${SITE.since}-01-01`);
    return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86_400_000));
  }, []);

  const items = [
    { label: "文章数", value: stats.postCount },
    { label: "标签数", value: stats.tagCount },
    { label: "累计阅读时长", value: `${stats.totalReadingTime} 分钟` },
    { label: "运行天数", value: runningDays },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-hero-bg/60 p-6 backdrop-blur-sm">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
        站点统计
      </h3>

      <ul className="mt-4 space-y-3">
        {items.map(({ label, value }) => (
          <li
            key={label}
            className="flex items-center justify-between border-b border-white/5 pb-3 last:border-b-0 last:pb-0"
          >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
