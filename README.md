# 妄想龙王的世界

个人博客与作品集：写文章、放作品、记录做过的东西是怎么长出来的。

**线上地址**：https://blue-riband-x.github.io/personal-blog/

技术栈是 React 19 + Vite 8 + TypeScript + Tailwind CSS 3。原来的 VitePress 版本留在远端分支
`backup-vitepress`，现版本是 2026-10 重写的单页应用，没有后端，所有内容都在构建期收集。

## 相关项目

| 项目 | 地址 | 说明 |
| --- | --- | --- |
| 音乐盒子 | https://blue-riband-x.github.io/music-play/ | Web Audio 的本地音乐播放器 |
| 击穿霓虹街头 | https://blue-riband-x.github.io/neon-street-breaker/ | Godot 4 像素清版格斗，Web 导出 |
| AI 虚拟课堂 | — | 未部署，源码在本机；作品页里有完整的项目档案 |

## 页面

| 路由 | 文件 | 说明 |
| --- | --- | --- |
| `/` | `src/pages/Home.tsx` | 首页，Spline 3D 主视觉 + 进入博客 |
| `/blog` | `src/pages/BlogList.tsx` | 文章列表，按标签筛选 |
| `/blog/:slug` | `src/pages/BlogPost.tsx` | 文章详情，Markdown 渲染 |
| `/works` | `src/pages/Works.tsx` | 作品页，像素风舞台 + 两级详情 |
| `/about` | `src/pages/About.tsx` | 关于页 |
| `*` | `src/pages/NotFound.tsx` | 404 |

路由全部懒加载，页面组件只负责「取数据 + 组合 + 状态」，具体 UI 拆在 `src/components/`。

## 目录结构

```
src/
├── assets/fonts/      # Sora 可变字体 + Zpix 像素字体（自托管）
├── components/
│   ├── blog/          # 博客页专用：卡片、博主信息、标签云、统计
│   ├── works/         # 作品页专用：舞台、卡片、详情、项目档案
│   └── ui/            # 基础组件
├── content/posts/     # 文章 Markdown，文件名即 slug
├── lib/               # site.ts 站点信息 / works.ts 作品数据 / media.ts 视频外链 / posts.ts 解析器
└── pages/             # 路由级页面
public/                # 静态资源（图片、按作品分目录的截图）
scripts/               # 构建后处理、资源上传等零散脚本
```

## 作品页

作品分三组：**开发项目**、**游戏**、**创意设计**。卡片本身的文案来自 `src/lib/works.ts`，
新增一个作品通常只改这一个文件。

详情分了**两档**，由数据决定走哪一档：

- `WorkItem` 带 `caseStudy` → 打开**整屏项目档案**（`CaseStudy.tsx`）。
  左侧固定信息栏（定位语、概览数字、技术栈、目录），右侧滚动正文，目录跟着高亮，
  页头下沿有阅读进度。适合需要讲清需求、选型、实现的项目。
- 不带 `caseStudy` → 打开**浮层详情**（`WorkDetail.tsx`）：图片在上、介绍在下、
  有 `link` 时底部出现「立即体验」。适合一两段话能说完的作品。

档案正文由 `CaseBlocks.tsx` 按 `kind` 铺开，目前支持六种块：

| kind | 用途 |
| --- | --- |
| `text` | 正文段落，段落之间空一行 |
| `points` | 带标题的小卡片：拆需求、列实现要点、写反思 |
| `choices` | 选型对照：选了什么 / 为什么 / 没选的那条路为什么不行 |
| `figures` | 截图，一张通栏或两张并排；`size` 控制单图宽度 |
| `code` | 代码或协议样例 |
| `arch` | 分层架构图，一行一层，层内是节点方块（纯 HTML 绘制，不用截图） |

**加项目只写数据，只有新增块型才需要动渲染器。**

截图放在 `public/works/<项目名>/`，用 ffmpeg 转成 webp（1600 宽 q84 / 1400 宽 q82，
单张 25–75KB）。图片路径写成相对 `public` 的形式，交给 `asset()` 拼前缀。

## 写文章

在 `src/content/posts/` 下新建 `.md`，文件名就是 URL slug：

```markdown
---
title: 文章标题
date: 2026-05-31
description: 列表页显示的一句话摘要
tags: [随笔, 建站]
cover: covers/xxx.jpg
---

正文从这里开始，支持标准 Markdown + GFM（表格、删除线等）。
```

构建期用 `import.meta.glob` 自动收集，按日期倒序排列，不用注册路由。
文章里的图片同样交给 `asset()` 处理，所以直接贴图床外链也没问题。

## 常用命令

```bash
npm run dev      # 本地开发 http://localhost:3000
npm run build    # 类型检查 + 构建，构建后自动生成 dist/404.html
npm run preview  # 预览构建产物
```

## 部署

推送到 `main` 后由 `.github/workflows/deploy.yml` 自动构建并发布到 GitHub Pages。
站点跑在 `/personal-blog/` 子路径下：

- 子路径由 `vite.config.ts` 的 `REPO_BASE` 决定；
- 路由 `basename` 自动跟随 `import.meta.env.BASE_URL`；
- `public` 下的资源一律用 `asset()` 拼路径，不要写裸路径或相对路径。

## 几个刻意的选择

- **字体自托管**：Sora 可变字体 33KB 覆盖 300–700，像素字 Zpix 子集化到常用字。
  不引 Google Fonts —— 跨域加渲染阻塞，国内经常卡在字体上。
- **视频不放 Pages**：Pages 到国内实测约 1Mbps，几 MB 的 mp4 要下半分钟。
  视频走阿里云 OSS 直链，地址集中在 `src/lib/media.ts`，换托管只改一行。
- **首页三段式加载**：内联模糊图 → 静态大图 → Spline 淡入。
  3D 运行时用动态 `import()`，绝不进首屏 chunk。
- **不用 `gray-matter`**：它依赖 Buffer，浏览器端会挂，frontmatter 解析器自己写。
- **不引图标库**：图标手写内联 SVG，像素图标用 `PixelIcon` 的字符网格。

待办事项见 [TODO.md](./TODO.md)。
