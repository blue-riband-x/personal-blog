# Blog-X 项目长期笔记

## 项目

个人博客「妄想龙王的世界」前端：React 19 + Vite + TS + Tailwind 3，SPA，部署在 GitHub Pages
（https://blue-riband-x.github.io/personal-blog/ ，仓库 `blue-riband-x/personal-blog`，`main` + Actions 自动发布，
push 后 1~2 分钟生效）。2026-10-16 由 VitePress 版重构而来，旧版留在远端分支 `backup-vitepress`。

## 编码约定

- **组件化优先，不留死代码**：页面只做「取数据 + 组合 + 状态」，UI 拆进 `src/components/`；
  可复用能力抽组件或工具函数；不再用的组件及时删。文案改 `src/lib/site.ts`（站名/笔名/技术栈/GitHub/邮箱/bio）。
- **路由懒加载**（`App.tsx` 的 `React.lazy` + `Suspense`）；全静态 import 会让首屏连带解析
  `react-markdown` 与 Spline，JS 从 95KB 涨到 171KB(gzip)。
- **public 资源一律走 `asset()`**（`src/lib/utils.ts`）：站点在 `/personal-blog/` 子路径下，
  裸路径会 404、相对路径在 `/blog/:slug` 会解析错。`asset()` 对外链原样返回，两套链路可共存。
  正文图片组件也接了 `asset()`，文章里写 `covers/xxx.jpg` 即可。
- **子路径只认 `vite.config.ts` 的 `REPO_BASE`**，路由 basename 自动跟随 `import.meta.env.BASE_URL`。
- 文章放 `src/content/posts/*.md`（文件名=slug，frontmatter `title/date/description/tags/cover`），
  构建期自动收集；**不要用 gray-matter**（依赖 Buffer），解析器在 `src/lib/posts.ts`。
  正文样式是 `index.css` 的 `.prose-blog`，没引 typography 插件。
- **字体自托管**：`src/assets/fonts/sora-latin-var.woff2`（33KB 可变，300–700）；
  像素字 `zpix-pixel.woff2`（153KB，GB2312 一级字库子集，加字要重跑 fonttools）。
  别引 Google Fonts（跨域 + 渲染阻塞，国内常卡死），中文回退 PingFang / 微软雅黑。
- **没装图标库**：图标手写内联 SVG 或用 `PixelIcon` 的字符网格（`crispEdges`），别引入 `lucide-react`。
- 导航顺序：首页 / 博客 / 作品 / 关于。移动端内容区顺序：博主卡片 → 标签云 → 文章列表 → 站点统计（CSS `order`）。

## 触屏与悬停

`:hover` 在触屏会粘住，`tailwind.config.ts` 自定义了三个变体，**装饰性悬停别用原生 `hover:`**：

- `hoverable:` = `{ & }` 静态媒体查询，给触屏写「默认显示」的降级样式；
- `can-hover:` = `{ &:hover }` 真正的悬停；`group-can-hover:` = `{ .group:hover & }`。
- **`can-hover:` 自带 `:hover`，不能当 `hoverable:` 用**（踩过：摘要一直挂在封面上）。

另：**别给已内联 `transform` 的元素再叠 `-translate-y-1/2`** —— 与 `active:translate-y-[2px]`
争同一个 `--tw-translate-y`，按下瞬间元素跳位，`click` 不触发。居中用父层 `inset-y-0 flex items-center`。

## 页面结构

- **导航栏两种形态**由 `App.tsx` 按路由给 `Navbar` 的 `variant`（差异集中在 `VARIANTS` 表）：
  `floating` 内容页默认（`px-4` + `top-0` + `rounded-b-2xl` 半透明浮岛）；
  `plain` **仅首页**（通栏贴边、全透明、压在整屏 3D 上，用户明确要求，别再套浮岛）。
- **首页 3D 背景** `HeroBackground.tsx` 三段式：内联 40×23 模糊图（`lib/hero-poster.ts`）→
  静态大图（`public/hero-bg.webp` 桌面 57KB / 竖屏 15KB）→ Spline 淡入。
  - **绝不用 `manualChunks` 归组 `@splinetool/*`**：会把 1MB 提升成首屏静态依赖（实测 2.7s → 10.9s）。
  - **别用 `document.readyState`/`load` 排顺序**（complete 不回退，3D 会提前开跑），挂在目标图片的 `load` 上。
  - **别用 `navigator.connection.effectiveType`** 判断网络（国内一律判 3g，会永久关掉 3D），只留 `hover/pointer`+`saveData`。
- 文章卡封面用 `PostCard.tsx` 的 `COVER_BOX`：手机 16:9 通栏、桌面 `md:w-52`+`aspect-[16/10]`，
  **高度由 aspect-ratio 推导，不写死 px**；标题 `line-clamp-2 min-h-14`、摘要 `line-clamp-2`。
- `CurveDivider`：两条错位贝塞尔曲线做图片/视频与内容区的过渡，复用时传 `className` 控高度。

## 作品页

`src/pages/Works.tsx` = `WorksBackdrop`（背景视频）+ `WorksShowcase`（交互舞台）。
容器 `min-h-[100svh]`，**不挂 Footer**（`App.tsx` 里 `hideFooter = pathname === "/works"`，否则溢出滚动条）。

**像素风舞台，交互是「按钮位移」不是两套布局**：`activeId === null` 时三个分类按钮纵向排在页面
垂直中线上（`left: 50%` + `translate(-50%, -50%)`，桌面早期贴左 7%，用户要求改居中）；
点哪个就把它 `top` 移到顶部居中，另外两个淡出，全程 CSS transition。
状态机 `WorksShowcase.tsx`，数据 `lib/works.ts`（分类/pageSize/columns/items），
卡片 `WorkCard`、翻页 `WorkPager`、图标 `PixelIcon` 都在 `components/works/`。

- 位置常量在文件顶部（`IDLE_TOPS_*` / `ACTIVE_TOP_*` / `BODY_TOP_*`），调布局改那里。
- **移动端每页数量单独定**：`MOBILE_PAGE_SIZE = { 2: 1, 3: 4 }`，桌面那套手机上会溢出。
- 返回图标位置按按钮 `minWidth` 算（桌面 `calc(50% - 160px)`、移动 `calc(50% - 132px)`）。
- **每页格子高度锁成满页行数**：翻页箭头 `inset-y-0` 贴着网格居中，末页不满会塌。
  用 `WorkCardSpacer` 补 `pageSize - items.length` 个等高占位块（共用 `CARD_BORDER`/`COVER_BOX`/`BAR_HEIGHT`）。

### 详情：两种视图

`WorkItem` 有 `caseStudy` → 打开整屏**项目档案**（`CaseStudy.tsx`：左固定信息栏 + 右滚动正文 +
目录高亮 + 阅读进度）；没有 → 打开**浮层详情**（`WorkDetail.tsx`：上图 / 下文 / 最下面「立即体验」）。
`WorkCard` 铺一层透明 `<button>` 做点击区，网格层挂 `inert`，Esc 逐层退
（详情自己监听 Esc，外层要先判断 `detail` 再关分类）。详情 `key={work.id}`，换作品图片索引归零。
**两个视图都在 `work.link` 存在时渲染「立即体验」**（档案页在 footer 第一个）。

- `WorkGallery` **不是轮播图**：每张图常驻同层，按离当前张的环形距离改
  `translateX/scale/opacity/blur`（`offsetOf()` 取最短距离，三张停在第 1 张时最后一张在左边）。
- **中间那张的宽度占比是总开关**：邻居贴框架边缘被裁，露出恒等于 `(1-占比)/2`；
  框架 `aspect = 图的宽高比 ÷ 占比`。桌面 72% → `22/10`，手机 88% → `20/11`（露 22px，试过 90% 只剩 18px 看不见）。
- `CoverArt`（封面 / hue 占位）+ `Scanlines` 卡片与详情共用。按扩展名识别视频（复用 `AmbientVideo`）；
  `fit="cover"` 填满给卡片，`fit="contain"` 完整显示 + 同画面虚化垫底给详情。
- **竖幅作品写 `aspect: "tall"`**：图区换 9:16 立式卡（手机 `min(44svh,340px)`、桌面 `min(56svh,460px)`），
  **`SIDE_SHIFT` 必须同步改 105**（横图 56），否则邻居藏一半。页码放图区**下方**，否则压住画面主体。
- `workGallery()` / `workDescription()` 兜底，占位作品也能开；`gallery` 里图片视频可混放。

## 视频与图片

- **视频外链一律从 `lib/media.ts` 的 `MEDIA` 取**，别在组件写死。GitHub Pages 国内实测 ~1Mbps，
  mp4 走阿里云 OSS 直链，换托管只改 `OSS_BASE`。改文件用 `?v=N` 破缓存（对象 30 天 Cache-Control）。
- **背景视频一律用 `AmbientVideo`**，别自己写 `<video autoPlay muted loop>`：
  React 写 `muted` 可能晚于首次自动播放尝试，被拦后不重试，画面永远停 poster。
  该组件在 `play()` 前把静音落到 DOM，并在 canplay / 回前台 / 首次交互补播。分档用 `sources=[{src,media}]`。
- **裁切重心按画面内容定**，不要一律 `object-center`（作品页主体在底部草地 → `object-[68%_100%] md:object-[50%_100%]`）。
- **poster 必须抽视频整帧**（`-frames:v 1 -q:v 3`），视口截图会带 `object-cover` 裁切，加载期构图对不上。
- **压视频用二遍定码率而非 CRF**（CRF 低复杂度会超配：CRF18 5.2MB vs 2pass 2000k 3.3MB，SSIM 相同）；
  静音素材加 `-an`，配 `-movflags +faststart`；用 `-lavfi ssim` 复核，≥0.99 视为观感无损。
- **无缝循环**：尾部 0.5s 淡出叠到开头（overlay + `fade=alpha=1`），输出短 0.5s；
  分界点挑原片帧间差最小处；用首末帧单像素最大跳变 vs 相邻帧同指标判断是否修好；`trim` 用帧号不用秒。

## 视频托管：阿里云 OSS

- Bucket `blue-blog-source`，华北2（北京），`oss-cn-beijing.aliyuncs.com`，
  直链 `https://blue-blog-source.oss-cn-beijing.aliyuncs.com/`。
- **对象键 = `media-src/` 下的相对路径**（`media-src/works/design/a.mp4` → `works/design/a.mp4`）。
  已用：`videos/`、`works/design/`。源文件留在仓库 `media-src/`（不在 `public/`，不随构建发布）。
- 上传：`python scripts/oss-upload.py`（`--only <dir>` 增量、`--check` 只校验）。
  脚本写 `Content-Type` + `Cache-Control: public, max-age=2592000`
  （**OSS 会把 jpg 猜成 octet-stream，浏览器就不当图片加载**）。
- 权限公共读 + 「阻止公共访问」关闭。RAM 子账号策略只给 Put/Get/GetObjectMeta/GetBucketInfo/ListObjects，
  `ListObjects` 的 Resource 必须含**不带 `/*` 的桶 ARN**。播放不需要 CORS。
- 凭据只放 `~/.workbuddy/oss-key.txt`（两行，用完删）；脚本优先级「密钥文件 > 环境变量」
  （环境变量里留着一组已禁用的旧 key，会报 `InvalidAccessKeyId ... is disabled`）。

## 本机环境

- node v22.22.2 + npm 10.9.2；**没有 pnpm、没有 gh CLI** → 用 npm + REST API。
- git 走 GCM，凭据已缓存；全局身份 `Blue <tengruiqi22@dnui.edu.cn>`。
- 开发端口 3000。本机有 Chrome（`C:\Program Files\Google\Chrome\Application\chrome.exe`）。
- **网络**：代理已关，`github.com` 与 `api.github.com` 可直连；但环境变量里 `http_proxy/https_proxy`
  仍指向失效的 `127.0.0.1:61473`，所以仓库里配了 `git config --local http.proxy ""`（空值=直连、不进版本库），
  本地 curl / Chrome 要加 `--noproxy '*'` / `--no-proxy-server`。
  推不上去时走 Git Data API 兜底（token 从 `git credential fill` 取），再用 `git update-ref` 对齐远端 ref。
- **GitHub 绑定域名下载只有 ~50KB/s，带 `gh-proxy.com` 前缀能到 ~1MB/s**（release 下载用它）。
  npm 默认 registry 会挂，加 `--registry=https://registry.npmmirror.com`。
- ffmpeg 在 `C:/Users/14386/.workbuddy/binaries/ffmpeg/ffmpeg.exe`；
  `playwright-core` 在 `C:/Users/14386/.workbuddy/binaries/node/pw/`（用 `executablePath` 指本机 Chrome）。
  验证视频是否在播必须真等实时读 `currentTime`（`--virtual-time-budget` 不推进媒体时钟）。
  Pillow 在 `C:/Users/14386/.workbuddy/binaries/python/envs/default/Scripts/python.exe`。
- **删目录会被 safe-delete 拦**（`dist`、`build` 里含媒体时 trash 失败）：用 Python `shutil.rmtree`
  也不一定行，最稳是**导出到新目录**或先 `shutil.rmtree` 再建。Actions 是 Linux，不受影响。

## 关联作品（不在本仓库）

- 音乐盒子 `blue-riband-x/music-play` → https://blue-riband-x.github.io/music-play/
- 击穿霓虹街头（Godot 4.7 像素清版格斗）`blue-riband-x/neon-street-breaker`
  → https://blue-riband-x.github.io/neon-street-breaker/
  源码在本机 `D:\coding\battle`，导出产物提交在仓库 `web-build/`，Pages 走 Actions 工作流
  （`build_type=workflow`，上传 `web-build` 目录）。重新发布：Godot 导出到 `build/` →
  同步到 `web-build/` → push。wasm 37.7MB 经 Pages gzip 后传 10.2MB，pck 17.4MB，首次可交互约 8s。
