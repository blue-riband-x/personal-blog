import { cn } from "../../lib/utils";

export interface TagItem {
  tag: string;
  count: number;
}

interface TagCloudProps {
  tags: TagItem[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
}

/**
 * 标签云，支持“全部”重置与单个标签筛选。
 */
export function TagCloud({ tags, activeTag, onTagClick }: TagCloudProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-hero-bg/60 p-6 backdrop-blur-sm">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
        标签云
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onTagClick(null)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            activeTag === null
              ? "border-primary bg-primary/10 text-primary"
              : "border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground",
          )}
        >
          全部
        </button>

        {tags.map(({ tag, count }) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick(tag === activeTag ? null : tag)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              activeTag === tag
                ? "border-primary bg-primary/10 text-primary"
                : "border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground",
            )}
          >
            {tag}
            <span className="ml-1 opacity-60">{count}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
