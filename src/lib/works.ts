/**
 * 作品页的数据源。
 *
 * 每个条目的**卡片**和**详情**都从这一份数据渲染：
 * - 卡片用 `title` / `summary` / `cover` / `hue`
 * - 详情用 `gallery` / `description` / `link` / `meta`
 *
 * 详情页的字段都可以留空：没有 `gallery` 就退回封面（或 `hue` 占位图案），
 * 没有 `link` 就不显示「立即体验」，没有 `description` 就用 `summary`。
 * 所以新增一个占位作品只要写 `id / title / summary / hue` 四行。
 *
 * `gallery` 里的条目**可以是图片也可以是视频**（按扩展名自动识别），
 * 图片/视频可以来自 `public` 下的相对路径，也可以直接写 OSS 外链。
 */

import { MEDIA } from "./media";

/**
 * 案例页（`caseStudy`）的内容块。
 *
 * 「开发项目」这类作品要讲需求、选型和实现，一段 description 装不下，
 * 所以详情走另一套排版：小节 + 内容块。块用 `kind` 区分，渲染器按顺序铺开，
 * 加一种新块只要在 `CaseBlocks.tsx` 的 switch 里补一个分支。
 */
export type CaseBlock =
  /** 正文段落，段落之间空一行 */
  | { kind: "text"; body: string }
  /** 带标题的小卡片，用来拆需求 / 列实现要点 / 写反思 */
  | { kind: "points"; items: { title: string; body: string }[] }
  /** 选型对照：选了什么、为什么、以及没选的那条路 */
  | { kind: "choices"; items: { pick: string; why: string; alt?: string }[] }
  /** 截图，一张通栏、两张并排 */
  | { kind: "figures"; items: { src: string; caption: string; size?: FigureSize }[] }
  /** 代码 / 协议样例 */
  | { kind: "code"; title?: string; body: string }
  /** 分层架构图：一行一层，层内是节点方块 */
  | { kind: "arch"; caption?: string; tiers: CaseTier[] };

export interface CaseTier {
  /** 层名，如「前端」「AI 后端」 */
  label: string;
  nodes: { name: string; note?: string }[];
}

/**
 * 单张截图的宽度。
 *
 * `wide` 是通栏（界面截图，宽一点才看得清字）；
 * `compact` 收窄到 560（配角截图，全宽会把版面拉得很长）；
 * `square` 再窄到 400（方形素材比如板书原图，通栏会高得吓人）。
 */
export type FigureSize = "wide" | "compact" | "square";

export interface CaseSection {
  /** 锚点 id，也用于目录高亮 */
  id: string;
  /** 小节标题 */
  title: string;
  /** 标题上方的英文小标签，如 `TRADE-OFFS` */
  kicker: string;
  blocks: CaseBlock[];
}

/**
 * 项目档案：作品卡片的「深度拆解」视图。
 *
 * 和 `description` 是两套平行的详情：有 `caseStudy` 就打开整屏档案，
 * 没有就退回小的浮层详情。所以占位作品和老作品都不用改。
 */
export interface CaseStudy {
  /** 一句话定位，档案左上角放大显示 */
  lede: string;
  /** 我的角色 */
  role: string;
  /** 时间与项目性质 */
  period: string;
  /** 概览数字，如「5 个 / 智能体」 */
  facts: { label: string; value: string }[];
  /** 技术栈标签 */
  stack: string[];
  /** 档案顶部的大图 */
  hero: { src: string; caption: string };
  sections: CaseSection[];
  /** 结尾的补充说明（比如为什么没有线上地址） */
  note?: string;
}

/**
 * 详情图区一张素材的朝向。
 *
 * 决定的不只是图片自己的比例，还有它在图区里占多宽 —— 所有卡片等高，
 * 宽度按比例反推（16:10 约占 72% 宽，9:16 约占 25%）。
 */
export type WorkAspect = "wide" | "tall";

/**
 * `gallery` 的一项。
 *
 * 裸字符串就跟随作品的 `aspect`；写对象可以单独指定方向，
 * 比如一组图里既有 16:9 的街景、又有 9:16 的海报。
 */
export type GalleryEntry = string | { src: string; aspect?: WorkAspect };

/** 展开后的一项：图区只认这个形态 */
export interface WorkSlide {
  src: string;
  aspect: WorkAspect;
}

export interface WorkItem {
  id: string;
  /** 作品名 */
  title: string;
  /** 一句话说明，卡片悬停时显示，同时是详情简介的兜底 */
  summary?: string;
  /** 封面图，相对 `public` 的路径；留空则用像素占位图案 */
  cover?: string;
  /** 占位图案的色相（0–360），没有封面时用来区分 */
  hue?: number;
  /**
   * 详情页轮播的图，一张以上；留空则退回封面。
   * 每一项可以是裸路径，也可以是带 `aspect` 的对象（一横一竖混排时用）。
   */
  gallery?: GalleryEntry[];
  /** 详情页简介，段落之间空一行 */
  description?: string;
  /**
   * 详情图区的朝向，默认 `wide`（16:10 截图）。
   * 竖屏视频/竖幅海报写 `tall`，图区会换成 9:16 的立式卡片，
   * 素材按原比例铺满，不会被裁成一条。
   *
   * 它决定的是**框架**的形状，单张素材的方向由 `gallery` 项自己覆盖。
   * 混排时按素材更多的那个方向选，不然框架的宽度装不下另一边。
   */
  aspect?: WorkAspect;
  /** 「立即体验」的目标地址；留空则该按钮不出现 */
  link?: string;
  /** 链接按钮的文案，默认「立即体验」 */
  linkLabel?: string;
  /** 详情页标题下的一行元信息，如「2026 · React + Web Audio」 */
  meta?: string;
  /**
   * 项目档案：有这一项，详情就从小的浮层换成整屏的拆解页。
   * 只有需要讲需求 / 选型 / 实现的项目才值得写，玩具类作品不写。
   */
  caseStudy?: CaseStudy;
}

export interface WorkCategory {
  id: string;
  /** 菜单按钮上的文字 */
  label: string;
  /** 每页显示几个 */
  pageSize: number;
  /** 桌面端网格列数 */
  columns: 2 | 3;
  items: WorkItem[];
}

/**
 * 三个分类。
 *
 * 「开发项目」每页 2 个、卡片大一些（重点项目）；
 * 另外两类每页 6 个、三列小卡片。翻页只在页数 > 1 时真正可用。
 */
export const WORK_CATEGORIES: WorkCategory[] = [
  {
    id: "dev",
    label: "开发项目",
    pageSize: 2,
    columns: 2,
    items: [
      {
        id: "innofact",
        title: "创星工厂",
        summary: "大学生一站式创业孵化小程序 · 多智能体 AI 导师",
        hue: 145,
        meta: "2026 · 微信小程序 · FastAPI + LangGraph",
        description:
          "面向大学生的一站式创业孵化平台，把「有个想法」到「组起队伍」之间那几步拆成了可执行的功能。\n\n" +
          "平台里有五个模块：AI 导师、AI 大纲、AI 润色、团队组建、工作空间。导师不是单个模型在答题，而是一组分工不同的智能体 —— 导师负责把问题问清楚，考官负责挑刺，助手负责整理成能落地的条目，最后由主流程串成一份可执行的计划。\n\n" +
          "后端用 FastAPI + LangGraph 编排多智能体，对话通过 SSE 流式推回前端；结构化数据存 MySQL，历史对话的向量索引放 Chroma，检索时按用户自己的项目空间做隔离。",
      },
      {
        id: "virtual-classroom",
        title: "AI 虚拟课堂",
        summary: "选主题自动备课 · 流式讲课 + AI 板书 + 学伴",
        cover: "works/virtual-classroom/hero.webp",
        hue: 205,
        meta: "2026 · Vue 3 + Spring Boot + FastAPI",
        description:
          "一个能自己「备课」的虚拟课堂：聊三个问题生成大纲，进课堂后 AI 教师逐字讲课、板书跟着翻页，讲完还能出题判卷。\n\n" +
          "架构上走了混合路线 —— Java Spring Boot 承担账号、大纲、排行榜，Python FastAPI 跑五个教学 Agent，前端只认一个域名。",
        caseStudy: {
          lede: "选一个主题，它给你排一份大纲，然后把这节课讲给你听 —— 讲稿逐字流出、板书一张张生成、讲完出题判卷。",
          role: "全栈开发 · 前端交互 / 服务端接口 / AI 流程编排",
          period: "2026 · 课程设计 / 个人项目",
          facts: [
            { value: "5", label: "教学 Agent" },
            { value: "3", label: "并行服务" },
            { value: "11", label: "MySQL 数据表" },
            { value: "1–2s", label: "首字响应" },
          ],
          stack: [
            "Vue 3",
            "Pinia",
            "Three.js",
            "ECharts",
            "Spring Boot 3",
            "MyBatis",
            "MySQL 8",
            "FastAPI",
            "LangGraph",
            "DeepSeek",
            "Seedream",
            "ChromaDB",
            "SSE",
          ],
          hero: {
            src: "works/virtual-classroom/hero.webp",
            caption: "课堂运行中：左边模块进度，中间 AI 教师逐字讲解，右侧板书由模型实时生成",
          },
          sections: [
            {
              id: "brief",
              kicker: "THE PROBLEM",
              title: "想解决的问题",
              blocks: [
                {
                  kind: "text",
                  body:
                    "网课的节奏是别人的：讲快了跟不上，讲慢了走神，讲深了听不懂。我想要的不是又一个课程列表，而是「按我的水平和时间，现备一节课」——\n\n" +
                    "主题、水平、每天能投入多久，这三个信息就足够决定一份大纲长什么样。剩下的备课（拆知识点、写讲稿、画板书）交出去，但控制权留在用户手里：风格能换，进度能停，讲完能查。",
                },
                {
                  kind: "points",
                  items: [
                    {
                      title: "大纲要能「聊」出来",
                      body: "不做表单填空。三轮对话（学什么 / 什么水平 / 每天多久）后直接生成分模块、带知识点和练习任务的大纲，右侧实时预览。",
                    },
                    {
                      title: "讲课必须是流式的",
                      body: "等 30 秒憋出一整段，体验就断了。从模型到浏览器全程 SSE，第一个 token 在 1–2 秒内可见，剩下的边生成边念。",
                    },
                    {
                      title: "板书不能是文字堆",
                      body: "每节课配 4 张 1920×1920 的板书图（封面 + 两个知识点 + 总结），跟着讲解进度切换，视觉上才像真的在上一节课。",
                    },
                    {
                      title: "学完要能量化",
                      body: "出题、判分、知识点雷达图、XP 与连续天数。把「学了多久」换成「掌握到什么程度」，才有动力继续下一节。",
                    },
                  ],
                },
              ],
            },
            {
              id: "design",
              kicker: "TRADE-OFFS",
              title: "技术选型：为什么是这套",
              blocks: [
                {
                  kind: "text",
                  body:
                    "所有选择都围绕一个前提：这是一个人写、要能答辩演示的项目，所以「少一层胶水」比「理论上更优雅」重要。",
                },
                {
                  kind: "choices",
                  items: [
                    {
                      pick: "Vue 3 + Pinia",
                      why: "课堂状态只分两块：用户（XP / 设置 / 风格）和课堂（大纲 / 模块 / 消息 / 掌握度）。SSE 推来的 token 只写一处 store，组件用 computed 派生。组合式 API 也方便把「打字机 + 语音 + 板书切换」拆成可复用的 composable。",
                      alt: "Next.js：登录后才用的应用拿不到 SSR 的好处，反而多一层部署和鉴权边界。",
                    },
                    {
                      pick: "Java + Python 双后端",
                      why: "账号、鉴权、大纲 CRUD、排行榜这些传统业务交给 Spring Boot + MyBatis，稳且熟；模型编排和流式输出留在 Python，LangGraph、embedding 的生态都在那边。前端由 devServer 按路径前缀分发，只认一个域名。",
                      alt: "全 Spring Boot：LangGraph 只有 Python 版，硬接要自己包一层 HTTP 服务，等于绕回来还多写一份。",
                    },
                    {
                      pick: "SSE 而不是 WebSocket",
                      why: "课堂是单向推流：讲课、切板书、推图片都由服务端发起，用户输入走普通 POST。SSE 是纯 HTTP，浏览器原生 EventSource 自带断线重连，服务端用 sse-starlette 管生命周期就够了。",
                      alt: "WebSocket：双向能力用不上，还得自己维护心跳、重连和路由。",
                    },
                    {
                      pick: "MySQL + ChromaDB 双存储",
                      why: "用户、大纲、模块内容、会话这些要事务一致性，走 MySQL；对话历史转成 1024 维向量放 Chroma，提问时按语义检索 Top-K 注入提示词。既不断上下文，也不用每次把全部历史塞进请求里烧 token。",
                      alt: "全塞 MySQL：向量相似度得自己算，等于手写一个更差的向量库。",
                    },
                    {
                      pick: "LangGraph 编排 Agent",
                      why: "Tutor 是 input → teach → output 的三节点状态图，多个 Agent 共享一份 state，靠条件边决定下一步走谁。加一个能力就是注册一个节点，不用改动已有流程。",
                      alt: "裸调 chat API：一旦要「讲完 → 判卷 → 推荐下一节」，状态全靠手写变量传递，很快就理不清。",
                    },
                  ],
                },
              ],
            },
            {
              id: "arch",
              kicker: "ARCHITECTURE",
              title: "系统怎么连起来",
              blocks: [
                {
                  kind: "arch",
                  caption: "四层结构：前端只面对一个域名，路由在 devServer 里按前缀拆给两个后端",
                  tiers: [
                    {
                      label: "前端",
                      nodes: [
                        { name: "Vue 3 SPA", note: "Router + Pinia" },
                        { name: "课堂页", note: "流式消费 / 板书 / 学伴" },
                        { name: "学习规划", note: "对话式大纲" },
                        { name: "报告 & 排行", note: "ECharts 雷达图" },
                      ],
                    },
                    {
                      label: "Java 后端",
                      nodes: [
                        { name: "认证", note: "JWT + 拦截器" },
                        { name: "大纲 CRUD", note: "MyBatis" },
                        { name: "用户与 XP", note: "升级 / 连续天数" },
                        { name: "排行榜", note: "多榜单聚合" },
                      ],
                    },
                    {
                      label: "Python 后端",
                      nodes: [
                        { name: "Outline", note: "三轮对话生成" },
                        { name: "Tutor", note: "风格化讲稿 + SSE" },
                        { name: "Board", note: "板书结构 + 出图" },
                        { name: "Grader", note: "四维评分" },
                        { name: "Recommender", note: "下一步推荐" },
                      ],
                    },
                    {
                      label: "数据与模型",
                      nodes: [
                        { name: "MySQL 8", note: "结构化数据" },
                        { name: "ChromaDB", note: "对话向量" },
                        { name: "DeepSeek", note: "讲稿 / 判卷" },
                        { name: "Seedream", note: "板书出图" },
                        { name: "百炼 embedding", note: "1024 维" },
                      ],
                    },
                  ],
                },
                {
                  kind: "code",
                  title: "vue.config.js —— 一个域名，两套后端",
                  body:
                    "// 路径前缀决定落到哪个服务，前端代码里不出现第二个 host\n" +
                    "'/api/v1/auth'            -> http://127.0.0.1:8081  // Java\n" +
                    "'/api/v1/outline/generate' -> http://127.0.0.1:8000  // Python\n" +
                    "'/api/v1/outline'          -> http://127.0.0.1:8081  // Java CRUD（注意顺序）\n" +
                    "'/api/v1/ai'               -> http://127.0.0.1:8000  // 流式教学\n" +
                    "'/static'                  -> http://127.0.0.1:8000  // 板书图片\n",
                },
                {
                  kind: "text",
                  body:
                    "同一个 `/api/v1/outline` 前缀被两家共用，靠「更具体的规则写在前面」区分：生成走 Python，增删改查走 Java。代价是规则顺序不能乱，所以这一段在配置里单独加了注释。",
                },
              ],
            },
            {
              id: "impl",
              kicker: "IMPLEMENTATION",
              title: "关键实现",
              blocks: [
                {
                  kind: "points",
                  items: [
                    {
                      title: "流式讲课：一条连接跑完一节课",
                      body: "服务端用 LangChain 的 astream 逐 token 推；事件分四类 —— token（讲稿）、board_switch（该翻页了）、boards_ready（图片好了）、done（讲完）。前端只写一个 reducer 消费，不关心内容从哪来。",
                    },
                    {
                      title: "板书异步补图",
                      body: "文字先出、图片后补。Board Agent 先给我结构（标题 / 要点 / 配图描述），再逐张调模型出图，谁好了推谁，不等齐。图片落盘 static/boards 做缓存，重复进课堂不重复计费。",
                    },
                  ],
                },
                {
                  kind: "code",
                  title: "SSE 事件协议",
                  body:
                    "event: token\n" +
                    "data: {\"token\":\"同学们好，今天这节课我们聊……\"}\n\n" +
                    "event: board_switch\n" +
                    "data: {\"index\":1,\"title\":\"认识自我兴趣\"}\n\n" +
                    "event: boards_ready\n" +
                    "data: {\"urls\":[\"/static/boards/board_4_1_0.png\", …]}\n\n" +
                    "event: done\n" +
                    "data: {\"module_index\":1,\"tokens\":1832}\n",
                },
                {
                  kind: "figures",
                  items: [
                    {
                      src: "works/virtual-classroom/outline.webp",
                      caption: "大纲生成：三个问题之后，右侧直接出分模块大纲，每个模块带时长、知识点和练习任务",
                    },
                  ],
                },
                {
                  kind: "figures",
                  items: [
                    {
                      src: "works/virtual-classroom/board.webp",
                      caption: "模型生成的板书原图（1920×1920），文字与配图都由提示词控制",
                      size: "square",
                    },
                  ],
                },
                {
                  kind: "text",
                  body:
                    "板书是我最花心思的一环。它不是「把讲稿贴到 PPT 上」，而是让模型先想清楚这一页要讲什么（一个概念 + 三条要点 + 一个比喻画面），再把这个结构翻译成中文的配图提示词。这样同一节课的四张板书风格是一致的，也不会出现「左边一堆字、右边一张无关插画」。",
                },
                {
                  kind: "figures",
                  items: [
                    {
                      src: "works/virtual-classroom/teacher-style.webp",
                      caption: "三种教师风格：同一份大纲，换风格就是另一种讲法",
                    },
                    {
                      src: "works/virtual-classroom/companion.webp",
                      caption: "三个学伴：学霸 / 显眼包 / 内向，发言概率不同",
                    },
                  ],
                },
                {
                  kind: "text",
                  body:
                    "教师风格不是换个形容词，而是换一整套提示词与节奏：幽默风格会主动打比方、自嘲，严谨风格先给定义再给推导，默认风格取中间。学伴则是三个独立人格，按各自概率插话（学霸 50%、显眼包 80%、内向 20%），串行调用 —— 同时发言会抢话，看起来像吵架。",
                },
                {
                  kind: "figures",
                  items: [
                    {
                      src: "works/virtual-classroom/home.webp",
                      caption: "首页：Three.js 渲染的形象，空闲时每 4 秒眨一次眼；XP、连续天数都由 store 驱动",
                      size: "compact",
                    },
                  ],
                },
                {
                  kind: "figures",
                  items: [
                    {
                      src: "works/virtual-classroom/report.webp",
                      caption: "学习报告：Grader 的四维评分折算成知识点掌握度，用雷达图看短板",
                      size: "compact",
                    },
                  ],
                },
                {
                  kind: "text",
                  body:
                    "判分不是「对 / 错」二元。Grader 按正确性 40%、完整性 30%、表达 20%、深度 10% 四个维度打分，再把分数映射回知识点，才能画出上面这张雷达图 —— 用户看到的是「哪块弱」，而不是「考了 78 分」。",
                },
              ],
            },
            {
              id: "hard",
              kicker: "HARD PARTS",
              title: "踩过的坑",
              blocks: [
                {
                  kind: "points",
                  items: [
                    {
                      title: "五条时间线要对齐",
                      body: "模型逐 token 生成、前端打字机、语音朗读、板书自动翻页、图片异步出图 —— 任何一条快慢都会让「老师念到哪、PPT 翻到哪」错位。解法是分层解耦：SSE 层只管收，缓冲区层管节奏，渲染和语音从同一个游标读，谁慢只影响自己。",
                    },
                    {
                      title: "SSE 被代理攒成一坨",
                      body: "devServer 默认会缓冲 text/event-stream，表现是一次性刷出一大段，流式效果全没了。要在代理层声明 X-Accel-Buffering: no，并删掉 content-length，后端再加 30 秒心跳保活。",
                    },
                    {
                      title: "最慢的一环不能挡主流程",
                      body: "一张板书要几十秒，绝不能让它卡住讲课。所以文字先出、图片后台补；同时给模块卡片一个「生成中 62%」的进度条 —— 用户怕的不是慢，是不知道还要多久。",
                    },
                    {
                      title: "三套模型凭证，缺一个就降级",
                      body: "文本（DeepSeek）、出图（Seedream）、向量（百炼）三套 key 分开管，服务启动时校验。出图挂了就只显示文字板书，向量挂了就退回全量历史 —— 演示时最怕因为一个额度用完整堂课打不开。",
                    },
                    {
                      title: "同一段对话存了两份",
                      body: "MySQL 存会话明细，Chroma 存向量，两边靠 session_id + 时间戳对齐。删会话必须两边一起删，否则检索会把已删除的上下文重新捞出来，AI 就会「记得」用户已经清掉的内容。",
                    },
                  ],
                },
              ],
            },
            {
              id: "outcome",
              kicker: "OUTCOME",
              title: "做完了什么",
              blocks: [
                {
                  kind: "text",
                  body:
                    "现在这条链路是通的：注册登录 → 聊出大纲 → 进课堂听课（流式讲稿 + AI 板书 + 语音）→ 答题判分 → 看报告和排行榜。三个服务本地并行（前端 8080 / Java 8081 / Python 8000），MySQL 十一张表，向量库一个集合。",
                },
                {
                  kind: "figures",
                  items: [
                    {
                      src: "works/virtual-classroom/leaderboard.webp",
                      caption: "排行榜：按 XP、本周增量、连续天数、知识掌握度四个维度切换",
                      size: "compact",
                    },
                  ],
                },
                {
                  kind: "points",
                  items: [
                    {
                      title: "比较满意的地方",
                      body: "板书和讲解的耦合 —— 每一页都跟当前这一段讲稿对齐，而不是随机轮播；以及双后端的分工，业务代码和模型代码各自演进，互不牵扯。",
                    },
                    {
                      title: "还想改的地方",
                      body: "语音和文字的联动还没做干净：理想状态是「读完这句再推进」，现在是按缓冲量推进，偶尔会跳读。另外板书重复生成、移动端布局也都要再收一遍。",
                    },
                    {
                      title: "最大的收获",
                      body: "把一个慢且不稳定的外部依赖放进产品主流程，真正的工作量不在「调通」，而在延迟、失败、额度、并发这些边角上。",
                    },
                  ],
                },
              ],
            },
          ],
          note:
            "项目没有部署上线：它依赖三个本地服务（Vue / Spring Boot / FastAPI）和多个付费模型额度，直接放到公网既不安全也跑不动，所以只保留源码与演示录屏，详情里的截图全部来自本地开发环境实跑。",
        },
      },
    ],
  },
  {
    id: "game",
    label: "游戏玩具",
    pageSize: 6,
    columns: 3,
    items: [
      {
        id: "earworm-studio",
        title: "音乐盒子",
        summary: "点方块 DIY 自己的循环音乐 · 五声部实时合成",
        hue: 170,
        cover: "works/earworm/01.webp",
        gallery: ["works/earworm/01.webp", "works/earworm/02.webp", "works/earworm/03.webp"],
        meta: "2026 · React + Web Audio API",
        link: "https://blue-riband-x.github.io/music-play/",
        description:
          "一个在浏览器里点方块就能出音乐的玩具。屏幕上每一行是一种音色，每一列是一拍里的一个位置，点亮的格子就是发声的时刻；十六步走完自动回到第一步，一直循环，边听边改，改动下一拍就生效。\n\n" +
          "五个声部各自一条轨道：鼓机（底鼓、军鼓、踩镲）、贝斯、合成器、弦乐、音效。按住鼠标横向拖动可以连续涂色或者擦除，一条节奏几秒就刷完；`Demo` 里有现成的示范节奏，可以直接拿来改。\n\n" +
          "所有声音都是 Web Audio API 现场合成的 —— 振荡器做音高、白噪声做鼓，仓库里没有任何音频文件，首屏 JS 只有 52KB。",
      },
      {
        id: "neon-street-breaker",
        title: "击穿霓虹街头",
        summary: "像素风横版清版格斗 · 四波杂兵打到巷王",
        cover: "works/neon/01.webp",
        hue: 320,
        meta: "2026 · Godot 4.7 / 网页版",
        link: "https://blue-riband-x.github.io/neon-street-breaker/",
        description:
          "一条霓虹街道，一个地下车库，四波杂兵，最后是巷王。轻击连段、重击破盾、翻滚穿身、抓投掷出，能捡起路边的东西当武器。\n\n" +
          "用 Godot 4.7 写成，导出成 WebAssembly，打开网页就能打，键盘、手柄、手机横屏都支持。",
        caseStudy: {
          lede: "一条霓虹街道、一个地下车库、四波杂兵，最后是巷王。用 Godot 写的横版清版动作游戏，导出成网页，点开就能打。",
          role: "独立开发 · 玩法 / 像素美术 / 音乐 / 程序",
          period: "2026 · 个人项目",
          facts: [
            { value: "2", label: "场景" },
            { value: "4", label: "敌人波次" },
            { value: "3", label: "杂兵类型" },
            { value: "1", label: "Boss" },
          ],
          stack: [
            "Godot 4.7",
            "GDScript",
            "GL Compatibility",
            "WebAssembly",
            "AudioWorklet",
            "Lossless WebP",
            "GitHub Actions",
            "GitHub Pages",
          ],
          hero: {
            src: "works/neon/01.webp",
            caption: "标题画面：左侧菜单、右侧主角诺瓦，右下角署名「制作 RICKY」",
          },
          sections: [
            {
              id: "brief",
              kicker: "THE IDEA",
              title: "想复刻的是什么感觉",
              blocks: [
                {
                  kind: "text",
                  body:
                    "清版格斗的乐趣不在「打赢」，而在「怎么打赢」—— 拉开距离、等出手、抓破绽、把三下轻击接在一个重击后面。这类手感是帧级的，做得不到位就立刻变成「按了没反应」。\n\n" +
                    "所以这一作的目标很具体：两关走完只要十来分钟，但每一拳都要有回应。敌人只有三类，但三类要逼出三种打法 —— 杂兵可以硬换血，盾兵必须重击或跳攻破防，飞刀手要看着预警翻滚穿身。",
                },
                {
                  kind: "points",
                  items: [
                    {
                      title: "波次推进，不是一路平推",
                      body: "每个场景两波，清完才解锁前进的路口。四波之后是巷王，Boss 有明确的预警帧，看错就要吃一整条血。",
                    },
                    {
                      title: "道具是战术，不是装饰",
                      body: "木箱、路牌能捡起来挥，也能直接掷出去。手里有东西的时候，盾兵的盾就不算问题了。",
                    },
                    {
                      title: "评价系统给正反馈",
                      body: "连段数、风格评价（D → S）实时挂在 HUD 上。打得漂亮会被承认，这是清版游戏愿意再打一遍的理由。",
                    },
                  ],
                },
              ],
            },
            {
              id: "feel",
              kicker: "GAME FEEL",
              title: "手感是怎么堆出来的",
              blocks: [
                {
                  kind: "text",
                  body:
                    "打击感很少是「一个特效」，而是好几层反馈叠在同一帧上：命中瞬间的顿帧、受击方的击退与硬直、镜头的微震、粒子与音效。少任何一层都会显得飘。\n\n" +
                    "角色是一套状态机（fighter.gd）：待机 / 走 / 轻击 / 重击 / 跳攻 / 翻滚 / 受击 / 抓投各自有起手、持续、收招三段，翻滚全程带无敌帧，抓投期间敌人切换成「被举起」的状态而不是死掉。",
                },
                {
                  kind: "points",
                  items: [
                    {
                      title: "顿帧优先于特效",
                      body: "命中的那一两帧先把时间停住，再让击退和粒子发生。停得够短才有「实」的感觉，长了就变成卡顿。",
                    },
                    {
                      title: "翻滚是安全阀",
                      body: "Shift 翻滚有完整的无敌帧，飞刀和 Boss 冲击波都靠它穿。没有这个安全阀，被围住时玩家会只剩挨打的份。",
                    },
                    {
                      title: "音效即时合成",
                      body: "打击音效走合成器，按下就出声，不等外部资源加载 —— 声音晚 50ms，手感就散了一半。",
                    },
                  ],
                },
                {
                  kind: "figures",
                  items: [
                    {
                      src: "works/neon/02.webp",
                      caption: "第一波：两个杂兵从右侧压上来，路口屏障在清场前不会解除",
                      size: "wide",
                    },
                    {
                      src: "works/neon/03.webp",
                      caption: "轻击接重击，命中帧上同时出现击退、连段计数与风格评价",
                      size: "wide",
                    },
                  ],
                },
              ],
            },
            {
              id: "build",
              kicker: "PIPELINE",
              title: "从引擎到浏览器",
              blocks: [
                {
                  kind: "text",
                  body:
                    "选 Godot 是因为它导出 Web 的路子最省事：同一份工程既能本地跑，也能编成 WebAssembly 直接丢静态托管。代价是引擎本体不小，所以这一作的性能工作几乎全在「怎么让首屏少下点东西」上。",
                },
                {
                  kind: "choices",
                  items: [
                    {
                      pick: "GL Compatibility + 关闭线程",
                      why: "WebAssembly 多线程要求站点带 COOP/COEP 响应头，GitHub Pages 给不了。走单线程 + 兼容渲染器，静态托管就能跑，不需要用户开任何服务器配置。",
                      alt: "Forward+ 与多线程：画面更好，但要自建带隔离头的服务端，代价和收益不成比例。",
                    },
                    {
                      pick: "精灵图集转无损 WebP",
                      why: "五张 2560×1440 的像素图集原本是 PNG，共 17.4MB。无损 WebP 压到 7.5MB，逐像素比对过，像素画不能吃有损压缩。",
                      alt: "有损 WebP：体积还能再小一半，但像素边缘会出现杂色。",
                    },
                    {
                      pick: "清掉模板残留再导出",
                      why: "工程里带着一堆没用到的旧美术和脚本，资源包一度 54.5MB。删干净之后是 17.4MB，首次加载少下三十多兆。",
                      alt: "全量导出：省事，但国内网络下要多等好几分钟。",
                    },
                  ],
                },
                {
                  kind: "points",
                  items: [
                    {
                      title: "构建是命令行的",
                      body: "godot --headless --export-release 直接产出静态目录，推上去由 GitHub Actions 发布到 Pages，没有手工拖拽这一步。",
                    },
                    {
                      title: "GitHub Pages 会 gzip wasm",
                      body: "引擎本体 37.7MB，gzip 后实际传输 10.2MB，资源包压不动（里面已经是 WebP 和 MP3）。实测首次可交互约 8 秒。",
                    },
                    {
                      title: "中英双语是数据不是分支",
                      body: "所有文案在 localization 下的 JSON 里，运行时热切换，标题屏右上角的「中文 / EN」直接改语言，不用重开。",
                    },
                  ],
                },
              ],
            },
          ],
          note:
            "游戏托管在 GitHub Pages（仓库 blue-riband-x/neon-street-breaker），用的是 Godot 4.7 的 Web 导出。首屏需要下载约 10MB 的 wasm 与 17MB 的资源包，国内网络首次打开要等几秒；之后浏览器有缓存。手机建议横屏，触屏虚拟按键可以在设置里开关。",
        },
      },
      { id: "g2", title: "星尘跳跃", summary: "重力反转的平台跳跃", hue: 210 },
      { id: "g3", title: "方块农场", summary: "放置类种田小游戏", hue: 95 },
      { id: "g4", title: "霓虹赛车", summary: "伪 3D 竞速", hue: 285 },
      { id: "g5", title: "地牢探险", summary: "程序化地牢生成", hue: 25 },
      { id: "g6", title: "弹球实验室", summary: "物理弹球沙盒", hue: 190 },
    ],
  },
  {
    id: "design",
    label: "创意设计",
    pageSize: 6,
    columns: 3,
    items: [
      {
        id: "natsu-slope",
        title: "夏日坡道",
        summary: "9:16 竖屏短片 · 三个镜头的夏日放学路",
        hue: 30,
        aspect: "tall",
        cover: MEDIA.design.natsuSlope.poster,
        // 第一个是视频，后面两个是分镜截图 —— 详情里能翻着看
        gallery: [
          MEDIA.design.natsuSlope.video,
          ...MEDIA.design.natsuSlope.stills,
        ],
        meta: "2026 · 9:16 竖屏短片 · AI 生成 + 剪辑",
        description:
          "一段 5 秒的竖屏短片：放学后沿着海边的坡道骑下去，穿过铁道口，天色正好。全片只有三个镜头 —— 骑车的全景、一个回头特写、日落时分的铁路道口，靠镜头的切换把节奏提起来。\n\n" +
          "画面是 AI 生成的动画风格，分镜、调色和剪辑是在生成之后自己接的：先把想要的三个瞬间分别生成，再按「远 — 近 — 远」的顺序剪，让 5 秒里有一次呼吸。\n\n" +
          "做竖屏是因为它本来就该在手机上竖着看 —— 详情页里这条会保持 9:16 原比例，两侧用虚化的画面补满，不裁掉任何一帧。",
      },
      {
        id: "light-pollution",
        title: "光污染海报",
        summary: "同一场霓虹夜雨的横竖双版 · 街心与路口",
        hue: 320,
        cover: MEDIA.design.lightPollution.wide,
        // 横版在前：封面和第一张同比例，切到第二张才换成竖版
        gallery: [
          MEDIA.design.lightPollution.wide,
          { src: MEDIA.design.lightPollution.tall, aspect: "tall" },
        ],
        meta: "2026 · 霓虹视觉实验 · 横版 16:9 / 竖版 9:16",
        description:
          "同一个夜晚、同一身衣服、同一片霓虹，拍成一横一竖两张。横版站在街心，两侧的广告牌全开，整条街的光都朝中间收；竖版撑伞走进路口，雨丝把招牌拉成一条条竖线。\n\n" +
          "两张是分开构图的，不是把一张裁成另一种比例 —— 横版要有左右撑开的纵深，竖版则要让人物顶住画面中线、留出头顶霓虹的高度。同一套色只有三种：青、品红、荧光绿，多一种就俗了。\n\n" +
          "湿地面是这套图的关键：所有颜色都要在积水里再出现一次，比空气里的光更脏、更散。所以画面里真正亮的不是灯，是灯掉在水上的那一片。",
      },
      { id: "d2", title: "赛博名片", summary: "可交互的电子名片", hue: 260 },
      { id: "d3", title: "像素图标集", summary: "16×16 手绘图标 120 枚", hue: 175 },
      { id: "d4", title: "终端主题", summary: "终端配色的设计系统", hue: 130 },
      { id: "d5", title: "字体实验", summary: "等宽字体的像素变体", hue: 45 },
      { id: "d6", title: "交互装置", summary: "体感驱动的投影装置", hue: 225 },
      { id: "d7", title: "波形封面", summary: "音频可视化的专辑封面", hue: 300 },
      { id: "d8", title: "数据雕塑", summary: "把接口数据画成图形", hue: 15 },
    ],
  },
];

/**
 * 某个分类一共几页。
 * `pageSize` 可覆盖 —— 手机上每页放不下 6 个，会传更小的值。
 */
export function pageCount(category: WorkCategory, pageSize = category.pageSize) {
  return Math.max(1, Math.ceil(category.items.length / pageSize));
}

/** 取某一页的作品 */
export function pageItems(category: WorkCategory, page: number, pageSize = category.pageSize) {
  const start = (page - 1) * pageSize;
  return category.items.slice(start, start + pageSize);
}

/**
 * 详情页要展示的图。
 *
 * 没有 `gallery` 就退回封面；两样都没有就返回空数组，
 * 由调用方渲染 `hue` 占位图案 —— 这样占位作品也能打开详情。
 */
export function workGallery(work: WorkItem): WorkSlide[] {
  const entries: GalleryEntry[] = work.gallery?.length
    ? work.gallery
    : work.cover
      ? [work.cover]
      : [];
  const fallback = work.aspect ?? "wide";

  return entries.map((entry) =>
    typeof entry === "string"
      ? { src: entry, aspect: fallback }
      : { src: entry.src, aspect: entry.aspect ?? fallback },
  );
}

/** 详情页的简介，没有就退回一句话说明 */
export function workDescription(work: WorkItem) {
  return work.description ?? work.summary ?? "";
}
