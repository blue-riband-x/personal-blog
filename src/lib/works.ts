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
 */

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
  /** 详情页轮播的图，一张以上；留空则退回封面 */
  gallery?: string[];
  /** 详情页简介，段落之间空一行 */
  description?: string;
  /** 「立即体验」的目标地址；留空则该按钮不出现 */
  link?: string;
  /** 链接按钮的文案，默认「立即体验」 */
  linkLabel?: string;
  /** 详情页标题下的一行元信息，如「2026 · React + Web Audio」 */
  meta?: string;
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
        summary: "Spring Boot + FastAPI 混合架构 · 四种教学 Agent",
        hue: 205,
        meta: "2026 · Vue 3 + Spring Boot + FastAPI",
        description:
          "一个能自己「备课」的虚拟课堂：选好大纲、定好教师风格，AI 会把一节课拆成讲稿和板书两部分同时生成。\n\n" +
          "架构上走了混合路线 —— Java Spring Boot 承担账号、课程、权限这些主业务，Python FastAPI 专职跑模型相关的四个 Agent：Outline（按大纲拆知识点）、Tutor（按教师风格讲课）、Grader（判作业）、Recommender（推荐下一节学什么）。教师风格支持幽默、严谨、默认三种，同一份大纲换个风格就是另一种讲课节奏。\n\n" +
          "前端用 Vue 3，板书是一张张图片，和课程绑定后跟着音频的进度翻页；虚拟形象用 Three.js 渲染，每四秒眨一次眼。生成流程做成「文字先出、语音跟上」，避免等语音合成时整个页面空转。",
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
      { id: "g1", title: "像素冒险", summary: "横版闯关，手绘点阵素材", hue: 150 },
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
      { id: "d1", title: "光污染海报", summary: "赛博色调的视觉实验", hue: 320 },
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
export function workGallery(work: WorkItem) {
  if (work.gallery?.length) return work.gallery;
  return work.cover ? [work.cover] : [];
}

/** 详情页的简介，没有就退回一句话说明 */
export function workDescription(work: WorkItem) {
  return work.description ?? work.summary ?? "";
}
