# Blog-X 项目长期笔记

## 项目是什么

个人博客「妄想龙王的世界」的前端，React 19 + Vite + TypeScript + Tailwind 3 单页应用。
部署在 GitHub Pages：https://blue-riband-x.github.io/personal-blog/
仓库：`blue-riband-x/personal-blog`（默认分支 `main`，Pages 已开启）。

由原 VitePress 博客重构而来（2026-10-16），本地工作空间此前是 SENTINEL AI 落地页模板。

## 约定

- **编码习惯（用户明确要求）**：保持良好工程习惯 —— 组件化优先，单个文件不要冗余。
  页面只做「取数据 + 组合 + 状态」，具体 UI 拆到 `src/components/`；
  可复用的能力抽成独立组件或工具函数，不要复制粘贴；
  不再使用的组件及时删除，不留死代码；改文案优先改 `src/lib/site.ts` 的集中配置。
- **文章写在 `src/content/posts/*.md`**，文件名 = URL slug，frontmatter 字段：
  `title` / `date` / `description` / `tags` / `cover`（可选）。构建期自动收集，不需要注册路由。
  `cover` 建议用相对 `public` 的路径，如 `covers/xxx.jpg`。
- **站点信息集中在 `src/lib/site.ts`**（`name` 中文站名 / `nameEn` 英文站名 / 笔名 / 技术栈 /
  GitHub / 邮箱 / bio）。改文案优先改这里。
- **部署子路径**由 `vite.config.ts` 的 `REPO_BASE` 决定，路由 basename 自动跟随
  `import.meta.env.BASE_URL`，两者不要拆开改。
- **不要用 gray-matter**：它依赖 Buffer，浏览器端会挂。frontmatter 用 `src/lib/posts.ts` 里的自研解析器。
- 文章正文样式是 `src/index.css` 里的 `.prose-blog`，没有引入 `@tailwindcss/typography`。
- **public 下的静态资源必须用 `asset()` 拼路径**（`src/lib/utils.ts`）。
  站点部署在 `/personal-blog/` 子路径下，写 `/avatar.jpg` 会指向域名根而 404；
  写相对路径又会在 `/blog/:slug` 多级路由下解析错。别再直接写裸路径。
  `asset()` 对外链（http/https/data）原样返回，所以文章里直接贴图床地址也没问题。
  正文图片（`BlogPost.tsx` 的 `img` 组件）也已经接了 `asset()`，文章里写 `covers/xxx.jpg` 即可。
- **博客页组件在 `src/components/blog/`**：`BlogHero` / `PostCard` / `ProfileCard` / `SiteStats` / `TagCloud`，
  通用组件（跨页面复用）放 `src/components/`，如 `CurveDivider`。
  `src/pages/BlogList.tsx` 只负责组合和状态，不写具体卡片实现。
- **文章卡片封面用统一的 `COVER_BOX` 常量控制尺寸**（`PostCard.tsx`）：手机 16:9 通栏、
  桌面 `md:w-52` + `aspect-[16/10]`，高度由 `aspect-ratio` 推导，**不要写死 px 高度**。
  标题 `line-clamp-2 min-h-14` 锁两行、摘要 `line-clamp-2`，封面在桌面端 `items-center` 居中，
  这样各卡片高度差最小、封面尺寸完全一致，也不会出现一侧留空。
- **导航栏有两种形态，由 `App.tsx` 按路由决定**（`Navbar` 的 `variant` prop，样式差异集中在组件内 `VARIANTS` 表）：
  - `floating`（内容页默认）：左右留白、贴顶无空隙（`top-0` + `px-4`，胶囊 `rounded-b-2xl`）、半透明毛玻璃浮岛。
  - `plain`（**仅首页**）：通栏贴边、默认全透明、无容器、滚动条区域直接压在整屏 3D 场景上 —— 用户明确要求首页用这一版，别再给首页套浮岛。
  两种形态内容一致：左侧圆形头像 + 英文站名 `SITE.nameEn` + 绿色 `Blog` 字样。
- **曲线过渡组件 `CurveDivider`**：两条错位贝塞尔曲线（渐隐绿色辉光 + 背景色主体），
  用于图片/视频与内容区的交界，比直线切割自然。要复用就传 `className` 控高度。
- **作品页在 `src/pages/Works.tsx`**，两层：`WorksBackdrop`（背景视频，`absolute inset-0`）
  + `WorksShowcase`（交互主体，绝对定位自己算坐标）。页面容器 `min-h-[100svh]`，
  **不再挂 Footer**（`App.tsx` 里 `hideFooter = pathname === "/works"`，
  否则 121px 页脚会把整屏舞台顶出滚动条）。
- **作品页是像素风舞台，交互是「按钮位移」而不是两套布局切换**：
  `activeId === null` 时三个分类按钮纵向排在左侧；点哪个就把它的 `left/top`
  换成顶部居中，另外两个原地淡出，全程由 CSS transition 补间坐标。
  状态机在 `src/components/works/WorksShowcase.tsx`，数据在 `src/lib/works.ts`
  （分类 / `pageSize` / `columns` / `items`），卡片 `WorkCard`、翻页 `WorkPager`、
  像素图标 `PixelIcon` 都在 `src/components/works/`。
  - 按钮位置常量集中在文件顶部（`IDLE_TOPS_*` / `ACTIVE_TOP_*` / `BODY_TOP_*`），
    调布局改那里。
  - **移动端每页数量单独定**：`MOBILE_PAGE_SIZE = { 2: 1, 3: 4 }`，
    桌面那套（2 个大的 / 6 个小的）在手机上会直接溢出视口。
  - **返回图标的位置要按按钮 `minWidth` 算**：桌面 `calc(50% - 160px)`、
    移动 `calc(50% - 132px)`，写小了 ↵ 会压住分类按钮的左边框。
- **作品页（以及以后新加的按钮）一律像素风**：文字用 `font-pixel`（Zpix），
  图标用 `PixelIcon` 的字符网格 + `crispEdges`，别引图标库。
- **`src/assets/fonts/zpix-pixel.woff2`**（153KB）：Zpix 子集化到 GB2312 一级字库，
  ASCII 和箭头符号都在里面。`@font-face` 在 `src/index.css`。加字要重新跑 fonttools 子集。
- **触屏的 `:hover` 会粘住**，所以 `tailwind.config.ts` 里自定义了三个变体，
  纯装饰性的悬停**不要用原生 `hover:` / `group-hover:`**：
  - `hoverable:` = `{ & }`，静态媒体查询，给触屏写「默认就显示」的降级样式；
  - `can-hover:` = `{ &:hover }`，真正的悬停；
  - `group-can-hover:` = `{ .group:hover & }`。
  **`can-hover:` 自带 `:hover`，不能当 `hoverable:` 用** —— 实测踩过：摘要文字会一直挂在封面上。
- 背景视频托管在阿里云 OSS（详见下面「视频托管」一条）+ 手机档
  `works-bg-mobile.mp4`（1080 宽）+ `works-bg-poster.jpg`（ffmpeg 抽的**整帧**首帧），
  素材来自 MotionSites「Gradient Wave」，商用前需确认授权。
- **版本备份用 annotated tag**：重做某个页面前先 `git tag -a backup/xxx -m "..."`。
  作品页重设计的回退点是 `backup/pre-works-design`（已推远端）。
- **视频/首帧图的外链一律从 `src/lib/media.ts` 的 `MEDIA` 取，不要在组件里写死地址。**
  GitHub Pages 到国内实测只有 ~1Mbps，所以 mp4 不放 Pages、走阿里云 OSS 直链；
  换托管只改 `OSS_BASE` 一行。`asset()` 对外链原样返回，两条链路可以共存。
  改文件用 `?v=N` 破缓存（对象上设了 30 天 `Cache-Control`）。
- **背景视频一律用 `src/components/AmbientVideo.tsx`**，别自己写 `<video autoPlay muted loop>`：
  React 写 `muted` 的时机可能晚于浏览器首次自动播放尝试，被策略拦下后不会重试，
  画面就永远停在 poster 上（看起来像「完全静止」）。组件会在任何 `play()` 之前把静音
  落到 DOM，并在 canplay / 切回前台 / 首次用户交互时补播。
  分档用 `sources={[{ src, media }]}`。
- **首页 3D 背景走 `src/components/HeroBackground.tsx`，三段式加载**：
  内联 40×23 模糊图（`src/lib/hero-poster.ts`，386B）→ 静态大图
  （`public/hero-bg.webp` 桌面 57KB / `hero-bg-mobile.webp` 竖屏 15KB）→ Spline 淡入。
  - **绝不要用 `manualChunks` 把 `@splinetool/*` 手动归组**：会把它提升成首屏
    chunk 的静态依赖，浏览器解析 index.js 就开始下那 1MB，背景图被挤到 10 秒开外。
    已验证：加了 10.9s，去掉 2.7s。`vite.config.ts` 顶部写了这条警告。
  - **别用 `document.readyState` / `load` 排加载顺序**：readyState 一旦 complete
    就不回退，首页 HTML 里没图片 → React 刚插 `<img>` 时它已是 complete，
    3D 会立刻开跑。要挂在目标图片自己的 `load` 上。
  - **别用 `navigator.connection.effectiveType` 判断网络**：国内链路一律被判 3g，
    会把正常访客的 3D 永久关掉。只留 `hover/pointer` 和 `saveData`。
  - 静态图的拍摄方式：本地 `vite` + playwright，隐藏文字层后截 canvas；
    竖屏版要用 `addInitScript` 覆盖 `matchMedia` 强制放行 3D 才能拍到真实构图。
- **裁切重心按画面内容定，不要一律 `object-center`**：Video 是 3:2、屏幕更宽时会裁上下，
  作品页主体在底部草地，所以用 `object-[68%_100%] md:object-[50%_100%]` 只裁上方黑天空。
- **poster 必须抽视频整帧**，不能用某个视口的截图 —— 视口截图会带上 `object-cover` 的裁切，
  加载期的构图就和播放时对不上。ffmpeg：`-frames:v 1 -q:v 3`。
- **页面路由要懒加载**（`App.tsx` 用 `React.lazy` + `Suspense`）。全部静态 import 时
  首屏要连带解析 `react-markdown` 和首页的 Spline 运行时，JS 从 95KB 涨到 171KB（gzip）。
- **字体自托管**：`src/assets/fonts/sora-latin-var.woff2`（33KB 可变字体，覆盖 300–700），
  `@font-face` 写在 `src/index.css`。别再引 Google Fonts —— 两个跨域来源 + 渲染阻塞，
  国内经常卡死。中文本来就回退到 PingFang SC / 微软雅黑。
- **压视频先试二遍定码率，不是 CRF**：CRF 在低复杂度内容上会超配码率
  （同一素材 CRF18 给 5.2MB，二遍 2000k 给 3.3MB，SSIM 完全相同）。
  一律 `-an` 去掉音轨（背景视频都是静音的）+ `-movflags +faststart`。
  改完用 `-lavfi ssim` 和原片比对，SSIM ≥ 0.99 基本可视为观感无损。
- **背景视频必须做成无缝循环**：原素材首尾帧通常对不上，直接 `<video loop>` 会「啪」一下。
  做法是把尾部 0.5s 淡出叠到开头（overlay + `fade=alpha=1`），输出比原片短 0.5s。
  **分界点要挑原片帧间差最小的位置**，因为接缝差异就等于该处的帧间差，压不下去。
  判断是否修好：用首末帧的单像素最大跳变去比「正常相邻两帧」的同指标，回落到同一量级即达标。
  `trim` 用 `start_frame`/`end_frame`，别用秒 —— 有些素材时间戳不严格。
- **项目没装图标库**，需要图标就手写内联 SVG，别引入 `lucide-react`。
- **导航顺序：首页 / 博客 / 作品 / 关于**（`Navbar.tsx` 的 `navigationLinks`）。
- **移动端内容区顺序**：博主卡片 → 标签云 → 文章列表 → 站点统计（用 CSS `order` 控制，
  桌面端仍是左中右三栏）。个人介绍要排在手机端最前面。

## 本机环境

（2026-10-16 21:06 复核过一遍，以下均为实测结果）

- node v22.22.2 + npm 10.9.2；**没有 pnpm，也没有 gh CLI** → 一律用 npm。
- git 推送用 GCM（Git Credential Manager，已安装且凭据已缓存，无需交互）。
- 全局 git 身份是 `Blue <tengruiqi22@dnui.edu.cn>`，提交会自动用这个作者。
- 开发端口固定 3000（`npm run dev`）。
- **网络（2026-10-17 起）**：用户已关掉本机代理，`github.com` **可以直连**（实测 200）。
  但进程环境变量里的 `http_proxy` / `https_proxy` 仍指向已失效的 `127.0.0.1:61473`，
  会污染所有命令行请求，所以本仓库写了 `git config --local http.proxy ""`
  （**空值 = 强制不走代理**，只影响本仓库、不进版本库），`git push/fetch` 现已直连可用。
  若哪天又要走代理，改成 `git config --local http.proxy http://127.0.0.1:<端口>` 即可。
- **`api.github.com` 直连一直可用**，比 `github.com` 稳，查工作流/仓库状态一律优先走 API。
- **兜底通道**：万一 `github.com` 又断，可用 GitHub Git Data API 经 `api.github.com` 推送
  （token 从 `git credential fill` 取），做法见 2026-10-16 日志。注意 API 建的 commit
  与本地 commit 可能仅差"消息末尾换行"，本地 ref 需用 `git update-ref` 对齐。
- **本地 HTTP 请求要加 `--noproxy '*'`**（curl）/ `--no-proxy-server`（Chrome），
  否则会被那个已失效的环境代理拦成 502。
- **ffmpeg 在 `C:/Users/14386/.workbuddy/binaries/ffmpeg/ffmpeg.exe`**（6.0 essentials，
  2026-10-17 装的）。GitHub release 直连只有 8KB/s，以后要装同类二进制先试
  `cdn.npmmirror.com`。npm 同理：默认 registry 会挂死，加
  `--registry=https://registry.npmmirror.com`。
- **`playwright-core` 在 `C:/Users/14386/.workbuddy/binaries/node/pw/`**，
  用 `executablePath` 指本机 Chrome，不下载浏览器。要验证「视频到底有没有在播」必须用它
  真等实时再读 `video.currentTime` —— headless Chrome 的 `--virtual-time-budget`
  **不推进媒体时钟**，拿它截图比对会得到「静止」的错误结论。
- **本地构建可能卡在 `prepare-out-dir`**：`dist` 里的 mp4 会让 safe-delete 的 trash 失败。
  先用 Python `shutil.rmtree('dist')` 清目录再 `npm run build`。Actions 是 Linux，不受影响。
- **GitHub Pages 到国内实测约 1Mbps**（有时低到 62KB/s），图片和 JS 能忍，
  **视频忍不了** —— 3MB 要下 30 秒，期间画面停在 poster 上，看起来就是「视频静止」。

## 视频托管：阿里云 OSS

- Bucket：`blue-blog-source`，地域**华北2（北京）**，
  Endpoint `oss-cn-beijing.aliyuncs.com`，
  直链前缀 `https://blue-blog-source.oss-cn-beijing.aliyuncs.com/`。
- 对象按 `videos/<文件名>` 存放，源文件在仓库的 `media-src/videos/`
  （**不在 `public/` 下**，不随构建发布，只作备份）。
- 改了视频跑 `python scripts/oss-upload.py` 重新上传 + 匿名校验；
  `--check` 只校验不上传。脚本会写 `Content-Type` 和
  `Cache-Control: public, max-age=2592000`（**OSS 对 jpg 会猜成
  application/octet-stream，那浏览器就不当图片加载了**）。
- 权限：**公共读**（匿名 GET 不存在的 key 返回 `NoSuchKey` 而非 `AccessDenied`
  即说明匿名读已放开；访问桶根返回 `AccessDenied` 属正常，公共读不含 ListObjects）。
  **「阻止公共访问」必须是关闭状态**，否则一律 403。
- 访问者是 RAM 子账号 `Ricky@...onaliyun.com`，自定义策略只给
  `oss:PutObject/GetObject/GetObjectMeta/GetBucketInfo/ListObjects`。
  `ListObjects` 的 Resource **必须有不带 `/*` 的那条桶 ARN**，只写 `/*` 列目录仍 403。
- 访客只是播放，`<video src>` 跨域不需要 CORS，**不用配 CORS 规则**。
- **坑：本机环境变量里残留过 `OSS_ACCESS_KEY_ID`（一组已禁用的旧 key）**，
  脚本优先级已改成「密钥文件 > 环境变量」，否则会报
  `InvalidAccessKeyId: ... is disabled` 而密钥文件明明是对的。
- 凭据只放 `~/.workbuddy/oss-key.txt`（两行：id、secret），用完删，绝不入库。

- 本机**装有 Chrome**（`C:\Program Files\Google\Chrome\Application\chrome.exe`），
  可以用 `--headless=new --screenshot=xxx.png --window-size=W,H <url>` 截图验证页面效果。
  注意 headless 有最小窗口宽度限制：`--window-size=390` 实际会被撑到约 500，
  想看窄屏请从 500 起，否则右侧内容会被裁掉造成误判。

## 部署状态（2026-10-16 已上线）

- 线上：https://blue-riband-x.github.io/personal-blog/
- 远端 main = `d3c911c`（内容等同本地 `b1253e3`，tree 完全一致）；旧 VitePress 版本保存在远端分支
  `backup-vitepress`（原 `81b82e2`）。
- 推 main 用 `git push origin main`（fast-forward，不需要 force），本仓库已配好代理，直接可用。
- Actions 工作流 `Deploy blog to GitHub Pages`，push 后约 1~2 分钟完成。
