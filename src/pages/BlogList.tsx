import { useMemo, useState } from "react";
import { BlogHeader } from "../components/blog/BlogHeader";
import { PostCard } from "../components/blog/PostCard";
import { ProfileCard } from "../components/blog/ProfileCard";
import { SiteStats } from "../components/blog/SiteStats";
import { TagCloud } from "../components/blog/TagCloud";
import { getAllTags, posts } from "../lib/posts";

/**
 * 博客列表页（三栏参考布局）。
 * 中间是文章卡片流；左侧是博主卡片 + 标签云；右侧是站点统计。
 * 组件都拆到 src/components/blog/ 下，避免单个文件臃肿。
 */
export default function BlogList() {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const tags = useMemo(() => getAllTags(), []);

  const visiblePosts = useMemo(
    () => (activeTag ? posts.filter((post) => post.tags.includes(activeTag)) : posts),
    [activeTag],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <BlogHeader />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 左侧边栏：博主 + 标签云 */}
          <aside className="order-2 space-y-8 lg:order-1 lg:col-span-3">
            <ProfileCard />
            <TagCloud tags={tags} activeTag={activeTag} onTagClick={setActiveTag} />
          </aside>

          {/* 中间：文章列表 */}
          <main className="order-1 space-y-6 lg:order-2 lg:col-span-6">
            {visiblePosts.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-hero-bg/60 p-8 text-center text-sm text-muted-foreground">
                这个标签下还没有文章。
              </p>
            ) : (
              visiblePosts.map((post) => <PostCard key={post.slug} post={post} />)
            )}
          </main>

          {/* 右侧边栏：站点统计 */}
          <aside className="order-3 space-y-8 lg:col-span-3">
            <SiteStats />
          </aside>
        </div>
      </div>
    </div>
  );
}
