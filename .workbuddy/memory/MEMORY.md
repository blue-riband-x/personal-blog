# Blog-X 项目长期笔记

## 项目是什么

个人博客「妄想龙王的世界」的前端，React 19 + Vite + TypeScript + Tailwind 3 单页应用。
部署在 GitHub Pages：https://blue-riband-x.github.io/personal-blog/
仓库：`blue-riband-x/personal-blog`（默认分支 `main`，Pages 已开启）。

由原 VitePress 博客重构而来（2026-10-16），本地工作空间此前是 SENTINEL AI 落地页模板。

## 约定

- **文章写在 `src/content/posts/*.md`**，文件名 = URL slug，frontmatter 字段：
  `title` / `date` / `description` / `tags` / `cover`（可选）。构建期自动收集，不需要注册路由。
  `cover` 建议用相对 `public` 的路径，如 `covers/xxx.jpg`。
- **站点信息集中在 `src/lib/site.ts`**（站名、笔名、技术栈、GitHub、邮箱、bio）。改文案优先改这里。
- **部署子路径**由 `vite.config.ts` 的 `REPO_BASE` 决定，路由 basename 自动跟随
  `import.meta.env.BASE_URL`，两者不要拆开改。
- **不要用 gray-matter**：它依赖 Buffer，浏览器端会挂。frontmatter 用 `src/lib/posts.ts` 里的自研解析器。
- 文章正文样式是 `src/index.css` 里的 `.prose-blog`，没有引入 `@tailwindcss/typography`。
- **public 下的静态资源必须用 `asset()` 拼路径**（`src/lib/utils.ts`）。
  站点部署在 `/personal-blog/` 子路径下，写 `/avatar.jpg` 会指向域名根而 404；
  写相对路径又会在 `/blog/:slug` 多级路由下解析错。别再直接写裸路径。
- **博客页组件在 `src/components/blog/`**：`BlogHero` / `PostCard` / `ProfileCard` / `SiteStats` / `TagCloud`，
  通用组件（跨页面复用）放 `src/components/`，如 `CurveDivider`。
  `src/pages/BlogList.tsx` 只负责组合和状态，不写具体卡片实现。
- **导航栏是全站浮岛样式**：两端留白 + 圆角胶囊 + 半透明毛玻璃，不做页面区分。
- **曲线过渡组件 `CurveDivider`**：两条错位贝塞尔曲线（渐隐绿色辉光 + 背景色主体），
  用于图片/视频与内容区的交界，比直线切割自然。要复用就传 `className` 控高度。

## 本机环境

- 没有 pnpm，也没有 gh CLI → 用 npm；git 推送用 GCM（已安装，凭据已缓存，无需交互）。
- 开发端口固定 3000（`npm run dev`）。
- **有 HTTP 代理 `127.0.0.1:61473`，直连 GitHub 不通；代理会间歇性 502**。
  所有 git push / GitHub 请求都要包重试循环，失败一次就放弃会误判。

## 部署状态（2026-10-16 已上线）

- 线上：https://blue-riband-x.github.io/personal-blog/
- 远端 main = `a78a89b`；旧 VitePress 版本保存在远端分支 `backup-vitepress`（原 `81b82e2`）。
- 推 main 用 `git push origin main`，现在已是 fast-forward，不需要 force。
