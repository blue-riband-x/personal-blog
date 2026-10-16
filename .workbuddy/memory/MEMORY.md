# Blog-X 项目长期笔记

## 项目是什么

个人博客「妄想龙王的世界」的前端，React 19 + Vite + TypeScript + Tailwind 3 单页应用。
部署在 GitHub Pages：https://blue-riband-x.github.io/personal-blog/
仓库：`blue-riband-x/personal-blog`（默认分支 `main`，Pages 已开启）。

由原 VitePress 博客重构而来（2026-10-16），本地工作空间此前是 SENTINEL AI 落地页模板。

## 约定

- **文章写在 `src/content/posts/*.md`**，文件名 = URL slug，frontmatter 字段：
  `title` / `date` / `description` / `tags`。构建期自动收集，不需要注册路由。
- **站点信息集中在 `src/lib/site.ts`**（站名、笔名、技术栈、GitHub、邮箱）。改文案优先改这里。
- **部署子路径**由 `vite.config.ts` 的 `REPO_BASE` 决定，路由 basename 自动跟随
  `import.meta.env.BASE_URL`，两者不要拆开改。
- **不要用 gray-matter**：它依赖 Buffer，浏览器端会挂。frontmatter 用 `src/lib/posts.ts` 里的自研解析器。
- 文章正文样式是 `src/index.css` 里的 `.prose-blog`，没有引入 `@tailwindcss/typography`。

## 本机环境

- 没有 pnpm，也没有 gh CLI → 用 npm；git 推送用 GCM（已安装，凭据已缓存，无需交互）。
- 开发端口固定 3000（`npm run dev`）。
- **有 HTTP 代理 `127.0.0.1:61473`，直连 GitHub 不通；代理会间歇性 502**。
  所有 git push / GitHub 请求都要包重试循环，失败一次就放弃会误判。

## 部署状态（2026-10-16 已上线）

- 线上：https://blue-riband-x.github.io/personal-blog/
- 远端 main = `a321ee6`；旧 VitePress 版本保存在远端分支 `backup-vitepress`（原 `81b82e2`）。
- 推 main 用 `git push -u origin main --force`（换栈，历史不相关，必须 force）。
