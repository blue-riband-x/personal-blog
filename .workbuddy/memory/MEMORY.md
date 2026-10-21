# Blog-X 项目长期笔记

## 项目与部署

- 个人博客「妄想龙王的世界」：React 19 + Vite 8 + TS + Tailwind 3 的 SPA，无后端，内容构建期收集。
- 线上 https://blue-riband-x.github.io/personal-blog/ ，仓库 `blue-riband-x/personal-blog`，`main` + Actions，
  push 后 1~2 分钟生效；2026-10 由 VitePress 重构，旧版留在远端 `backup-vitepress`。
- 子路径只认 `vite.config.ts` 的 `REPO_BASE`（`/personal-blog/`），路由 basename 跟随 `BASE_URL`。
- **public 资源一律 `asset()`**（`lib/utils.ts`）：裸路径 404、相对路径在 `/blog/:slug` 解析错；对外链原样返回。
- 路由懒加载（`App.tsx` 的 `React.lazy`）：全静态 import 会让首屏连带解析 `react-markdown` + Spline，
  JS 从 95KB 涨到 171KB(gzip)。
- 文档：`README.md` 是项目介绍（页面 / 作品页 / 部署 / 取舍），`TODO.md` 只放待办。
- **线上核验**：文章正文单独打成 `assets/posts-<hash>.js`（`import.meta.glob`），搜标题要搜这个 chunk，
  别搜 `index-*.js`；`/blog/<slug>` 返回 404 是 Pages 用 `404.html` 兜底的正常现象，浏览器里照常渲染。

## 编码约定

- 组件化优先、不留死代码；页面只做「取数据 + 组合 + 状态」，UI 进 `components/`；文案改 `lib/site.ts`。
- 文章 `src/content/posts/*.md`，文件名 = slug，frontmatter `title/date/description/tags/cover`；
  **不要 gray-matter**（依赖 Buffer），解析器在 `lib/posts.ts`；正文样式是 `index.css` 的 `.prose-blog`。
- **写文章别套模板**：用户明确反感「一、二、三…」编号标题 + 每节一张表 + 统一「小结」的骨架
  （about-rag / langchain-guide 都是这个毛病）。改用短句小标题、一个具体场景贯穿、
  只在真要并列时才用列表/表格，结尾不要固定套路。
- Markdown **连续几行会被合并成一段**：中文要点要么空行分段，要么写 `- **X**：…` 列表，
  别用软换行连排（踩过：四行动作渲染成一坨）。
- 封面图：`public/covers/`（随 Pages 发布）或 OSS 外链二选一，`asset()` 对外链原样返回。
  要精确控制中文排版就用 HTML+SVG 写好再用 Playwright 截图（1600×1000），比生图可控、无乱码。
- 字体自托管：`sora-latin-var.woff2`（33KB，300–700）+ `zpix-pixel.woff2`（153KB，GB2312 一级子集，
  加字要重跑 fonttools）；别引 Google Fonts（跨域 + 渲染阻塞）。
- 没装图标库：手写内联 SVG 或 `PixelIcon` 字符网格（`crispEdges`），别引 `lucide-react`。
- 导航：首页 / 博客 / 作品 / 关于；移动端内容区顺序 博主卡片 → 标签云 → 文章列表 → 站点统计（CSS `order`）。

## 触屏与悬停

- `:hover` 在触屏会粘住，`tailwind.config.ts` 三个变体：`hoverable:`=`{ & }`（静态媒体查询，给触屏写降级）、
  `can-hover:`=`{ &:hover }`、`group-can-hover:`。**`can-hover:` 自带 `:hover`，不能当 `hoverable:`**
  （踩过：摘要一直挂在封面上）。
- **别给已内联 `transform` 的元素再叠 `-translate-y-1/2`**：与 `active:translate-y-[2px]` 争同一个
  `--tw-translate-y`，按下瞬间跳位导致 click 不触发；居中用父层 `inset-y-0 flex items-center`。

## 页面

- `Navbar` 两形态由 `App.tsx` 传 `variant`：`floating` 内容页（`px-4` + `top-0` + `rounded-b-2xl` 毛玻璃浮岛）、
  `plain` **仅首页**（通栏贴边、全透明、压在整屏 3D 上，用户明确要求，别再套浮岛）。
- 首页 3D `HeroBackground.tsx` 三段式：内联 40×23 模糊图（`lib/hero-poster.ts`）→ 静态大图
  （`hero-bg.webp` 57KB / 竖屏 15KB）→ Spline 淡入。**绝不用 `manualChunks` 归组 `@splinetool/*`**
  （1MB 变首屏静态依赖，实测 2.7s → 10.9s）；**别用 `readyState`/`load` 排顺序**（complete 不回退），
  挂目标图自己的 `load`；**别用 `navigator.connection.effectiveType`**（国内一律判 3g，会永久关 3D），
  只留 `hover/pointer` + `saveData`。
- 文章卡 `COVER_BOX`：手机 16:9 通栏、桌面 `md:w-52` + `aspect-[16/10]`，高度由 aspect-ratio 推导别写死 px；
  标题 `line-clamp-2 min-h-14`、摘要 `line-clamp-2`。
- `CurveDivider`：两条错位贝塞尔曲线做过渡，复用时传 `className` 控高度。

## 作品页

`Works.tsx` = `WorksBackdrop`（背景视频）+ `WorksShowcase`（舞台），`min-h-[100svh]`，
**不挂 Footer**（`hideFooter = pathname === "/works"`）。像素风舞台，交互是「按钮位移」：
`activeId === null` 时三组按钮纵向排在页面垂直中线（`left: 50%` + `translate(-50%,-50%)`），
点中移到顶部居中、其余淡出，全 CSS transition。状态机 `WorksShowcase`，数据 `lib/works.ts`，
卡片 / 翻页 / 图标在 `components/works/`。

- 位置常量在文件顶部（`IDLE_TOPS_*` / `ACTIVE_TOP_*` / `BODY_TOP_*`），调布局改那里。
- **移动端每页数量单独定**：`MOBILE_PAGE_SIZE = { 2: 1, 3: 4 }`（桌面那套手机上溢出）；
  返回图标位置按按钮 `minWidth` 算（桌面 `calc(50% - 160px)`、移动 `calc(50% - 132px)`）。
- **每页格子锁成满页行数**：`WorkCardSpacer` 补 `pageSize - items.length` 个等高占位
  （共用 `CARD_BORDER`/`COVER_BOX`/`BAR_HEIGHT`），否则翻页箭头跟着跳。

### 详情两档

`WorkItem.caseStudy` 存在 → 整屏**项目档案** `CaseStudy.tsx`（左固定栏：定位语 / 概览数字 / 技术栈 / 目录，
右滚动正文 + 目录高亮 + 阅读进度；窄屏目录折成吸顶横排）；否则 → 浮层详情 `WorkDetail.tsx`
（上图 / 下文 / 有 `link` 才显示「立即体验」）。`WorkCard` 铺透明 `<button>` 做点击区，网格挂 `inert`，
Esc 逐层退（先判 `detail` 再关分类），详情 `key={work.id}`。已建档：AI 虚拟课堂、创星工厂、击穿霓虹街头。
虚拟课堂**是个人项目不是团队项目**（用户确认），身份写「全栈开发 · 前端交互 / 服务端接口 / AI 流程编排」。

### 档案正文

`CaseBlocks.tsx` 按 `kind` 铺：`text` / `points` / `choices` / `figures` / `code` / `arch`，内容全在 `works.ts`；
加项目只写数据，新块型才改渲染器。

- `figures` 单图按 `size`：`wide` 通栏 / `compact` 560 / `square` 400；两张并排**必须等高**
  （`aspect-[7/9]` + `object-top`），否则说明文字错位。
- hero 图限高 `max-h-[min(46svh,420px)]` + `object-cover object-top`，否则 16:10 截图独占一屏。
- **`CaseBlocks` 不解析 Markdown**：`**加粗**`、反引号会原样显示，正文只能纯文本。
- 截图放 `public/works/<项目>/`，ffmpeg 转 webp（1600 宽 q84 / 1400 宽 q82，单张 25–75KB）；
  素材要本地实跑截（三端起来、真等讲义流完），不是静态页面截图。

### 画廊

`WorkGallery` **不是轮播**：每张常驻同层，按环形距离改 `translateX/scale/opacity/blur`
（`offsetOf()` 取最短距离）。

- **卡片等高、宽度由素材比例反推**：`h-[99%]`（竖框 92%）+ `aspect-[16/10] | aspect-[9/16]`，
  横卡 ~72%、竖卡 ~25%；`gallery` 项写 `{ src, aspect: "tall" }` 单独指定，裸字符串跟作品 `aspect`。
- 框架跟着**当前那张**（`slides[index].aspect`），代价是横竖切换高度瞬跳（`aspect-ratio` 不能补间）。
- **邻居位移算出来，别写死常量**：`(ar_c + ar_s) / (2·ar_s) - 0.05·ar_c/ar_s`，相对邻居自身宽度；
  式子消掉了框架像素尺寸，774 和 368 一样准，别改回 `SIDE_SHIFT = 56 / 105`。
- **只有两张时要补镜像副本**（`aria-hidden` div，偏移取邻居偏移的相反数）：环形在 2 张时前后是同一张，
  不补就只有一侧有虚化邻居、构图偏；3 张以上天然两侧都有。
- `CoverArt`（封面 / hue 占位）+ `Scanlines` 卡片与详情共用；按扩展名识别视频（复用 `AmbientVideo`），
  `fit="cover"` 填卡、`fit="contain"` 完整显示 + 同画面虚化垫底给详情。
- **扫描线是分类级开关**：`WorkCategory.scanlines`（默认盖），创意设计置 `false` 让素材原样呈现；
  `WorksShowcase` 算一次再透传 `WorkCard` / `WorkDetail` → `WorkGallery`，别逐条作品加字段。
- **竖幅作品写 `aspect: "tall"`**：9:16 立式（手机 `min(44svh,340px)`、桌面 `min(56svh,460px)`），
  页码放图区**下方**，否则压住画面主体。
- `workGallery()` 展开成 `WorkSlide[]`，`workDescription()` 兜底，占位作品也能开详情；图片视频可混放。

## 视频与图片

- **视频外链一律从 `lib/media.ts` 的 `MEDIA` 取**，别在组件写死。Pages 国内实测 ~1Mbps，
  mp4 放阿里云 OSS 直链，换托管只改 `OSS_BASE`；改文件用 `?v=N` 破缓存（对象设了 30 天 Cache-Control）。
- **背景视频一律 `AmbientVideo`**，别手写 `<video autoPlay muted loop>`：React 写 `muted` 可能晚于首次
  自动播放尝试，被拦后不重试、画面永远停 poster。组件在 `play()` 前把静音落到 DOM，并在
  canplay / 回前台 / 首次交互补播；分档用 `sources=[{ src, media }]`。
- 裁切重心按画面内容定，不要一律 `object-center`（作品页主体在底部草地 → `object-[68%_100%] md:object-[50%_100%]`）。
- **poster 必须抽视频整帧**（`-frames:v 1 -q:v 3`）：视口截图会带上 `object-cover` 的裁切，加载期构图对不上。
- **压视频用二遍定码率而非 CRF**（CRF 低复杂度超配：CRF18 5.2MB vs 2pass 2000k 3.3MB，SSIM 相同）；
  静音加 `-an` + `-movflags +faststart`；`-lavfi ssim` 复核，≥0.99 视为观感无损。
- **无缝循环**：尾部 0.5s 淡出叠到开头（overlay + `fade=alpha=1`），输出短 0.5s；分界点挑帧间差最小处；
  用首末帧单像素最大跳变对比相邻帧判断是否修好；`trim` 用帧号不用秒。

## 阿里云 OSS

- Bucket `blue-blog-source`（华北2 北京），`https://blue-blog-source.oss-cn-beijing.aliyuncs.com/`；
  **对象键 = `media-src/` 下的相对路径**（`media-src/works/design/a.mp4` → `works/design/a.mp4`），
  已用 `videos/`、`works/design/`；源文件留在仓库 `media-src/`（不进 `public/`，不随构建发布）。
- 上传 `python scripts/oss-upload.py`（`--only <dir>` 增量、`--check` 只校验），脚本写 `Content-Type`
  + `Cache-Control: public, max-age=2592000`（**OSS 会把 jpg 猜成 octet-stream**）。
- 公共读 + 关闭「阻止公共访问」；RAM 子账号只给 Put/Get/GetObjectMeta/GetBucketInfo/ListObjects，
  `ListObjects` 的 Resource 必须含**不带 `/*` 的桶 ARN**；播放不需要 CORS。
- 凭据只放 `~/.workbuddy/oss-key.txt`（两行，用完删）；脚本优先级「密钥文件 > 环境变量」
  （环境变量里留着已禁用的旧 key，会报 `InvalidAccessKeyId ... is disabled`）。

## 本机环境

- node v22.22.2 + npm 10.9.2；**没有 pnpm、没有 gh CLI** → npm + REST API。git 走 GCM（凭据已缓存），
  全局身份 `Blue <tengruiqi22@dnui.edu.cn>`；开发端口 3000；Chrome 在
  `C:\Program Files\Google\Chrome\Application\chrome.exe`。
- 代理已关，`github.com` 与 `api.github.com` 可直连；但环境变量 `http_proxy/https_proxy` 仍指向失效的
  `127.0.0.1:61473`，仓库里配了 `git config --local http.proxy ""`（空值 = 直连、不进版本库），
  本地 curl / Chrome 要加 `--noproxy '*'` / `--no-proxy-server`；推不上去走 Git Data API 兜底，
  再用 `git update-ref` 对齐远端 ref。
- GitHub 绑定域名下载 ~50KB/s，加 `gh-proxy.com` 前缀约 1MB/s；npm 默认 registry 会挂，
  加 `--registry=https://registry.npmmirror.com`。
- ffmpeg 在 `C:/Users/14386/.workbuddy/binaries/ffmpeg/ffmpeg.exe`；`playwright-core` 在
  `.../node/pw/`（`executablePath` 指本机 Chrome）。验证视频是否在播必须真等实时读 `currentTime`
  （`--virtual-time-budget` 不推进媒体时钟）；Pillow 在 `.../python/envs/default/Scripts/python.exe`。
- **删目录会被 safe-delete 拦**（`dist` 含媒体时 trash 失败）：先用 Python `shutil.rmtree` 再建；
  Actions 是 Linux，不受影响。
- 仓库 About 已补：中文简介 + homepage + topics（blog / portfolio / react / typescript / vite /
  tailwindcss / personal-website）。

## 关联作品（不在本仓库）

- **TestHub 测试平台**（`D:\code\AITestPlatform\Ai_Testhub`）：Django 4.2 + Vue 3 的测试管理平台，
  15 个 app / 114 张表 / 51 个数据工厂工具；仓库 `blue-riband-x/testhub-platform`（**私有，只做备份**），
  博客档案**不挂链接、不提供立即体验**（只有本地部署）。本地入口：前端 3000 / 后端 8000，
  `admin / Admin@123456`，MySQL80 root/root 库 `testhub`；演示数据用 `scripts/seed_demo.py` 灌。
- **AI 虚拟课堂**（`D:\code\VirtualClassroom`）：两个远端 —— `origin` = Gitee
  `rriicckkyy/virtual-classroom`，`github` = https://github.com/blue-riband-x/virtual-classroom
  （默认分支 **master**，与 Gitee 共用一条历史，推 GitHub 用 `git push github master`）。
  作品档案里用 `link` + `linkLabel: "查看源码"` 指向它；`model_3D/`、`backend/static/boards/`（7MB 产物）、
  日志、`.env` 都在 `.gitignore` 里，仓库只有源码 + 3 张 README 截图（~190KB）。
- 小游戏合集 `blue-riband-x/mini-games` → https://blue-riband-x.github.io/mini-games/
  一个仓库装四个开源小游戏（td13k 太空塔防 / Space Huggers / Boulder Dash / Project Sand），
  根 `index.html` 是入口页，Pages 走 legacy + `main` 根目录。**改署名只改游戏内可见处**
  （标题画面、`meta author`、`app*.js` 文件头），`LICENSE`、`AUTHORS`、引擎目录、README 的「原作」
  一行必须留，`THIRD-PARTY.md` 逐项写来源与改动 —— MIT/GPL 都要求保留原点。
  塔防用 `src/` 未压缩源码发布（原来的 Closure 单文件改不了署名，字符串被编码）。
- 音乐盒子 `blue-riband-x/music-play` → https://blue-riband-x.github.io/music-play/
- 击穿霓虹街头（Godot 4.7 像素清版）`blue-riband-x/neon-street-breaker`
  → https://blue-riband-x.github.io/neon-street-breaker/ ；源码本机 `D:\coding\battle`，
  导出产物提交在 `web-build/`，Pages 走 workflow（`build_type=workflow`）；重新发布：Godot 导出 `build/`
  → 同步 `web-build/` → push。wasm 37.7MB 经 gzip 后 10.2MB、pck 17.4MB，首次可交互约 8s。
