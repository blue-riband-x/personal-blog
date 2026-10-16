# 妄想龙王的世界 — 个人博客

React + Vite + TypeScript + Tailwind CSS 单页博客，由原 VitePress 版本重构而来。
部署地址：https://blue-riband-x.github.io/personal-blog/

## 页面结构

| 路由 | 文件 | 说明 |
| --- | --- | --- |
| `/` | `src/pages/Home.tsx` | 首页（Spline 3D 主视觉 + 进入博客按钮） |
| `/blog` | `src/pages/BlogList.tsx` | 文章列表，支持按标签筛选 |
| `/blog/:slug` | `src/pages/BlogPost.tsx` | 文章详情，Markdown 渲染 |
| `/about` | `src/pages/About.tsx` | 关于页 |
| `*` | `src/pages/NotFound.tsx` | 404 |

## 写新文章

在 `src/content/posts/` 下新建一个 `.md` 文件，文件名即 URL slug，顶部写 frontmatter：

```markdown
---
title: 文章标题
date: 2026-05-31
description: 列表页显示的一句话摘要
tags: [随笔, 建站]
---

正文从这里开始，支持标准 Markdown + GFM（表格、删除线等）。
```

构建时通过 `import.meta.glob` 自动收集，按日期倒序排列，无需手动注册路由。

## 常用命令

```bash
npm run dev      # 本地开发 http://localhost:3000
npm run build    # 构建（自动追加 dist/404.html 用于 Pages 路由回退）
npm run preview  # 预览构建产物
```

## 部署

推送到 `main` 分支后，`.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages。
仓库子路径由 `vite.config.ts` 的 `REPO_BASE` 控制（`/personal-blog/`），
路由 basename 从 `import.meta.env.BASE_URL` 读取，两者保持一致即可。

## 待办

- [ ] 在 `src/lib/site.ts` 里补上真实邮箱与社交链接
- [ ] 把 `public/favicon.svg` 换成自己喜欢的图标
- [ ] 给文章详情页加代码高亮（目前只有等宽字体与深色代码块样式）
- [ ] 文章数量变多后，考虑加分页或归档页
