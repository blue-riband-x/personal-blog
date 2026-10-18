/**
 * 作品页的数据源。
 *
 * 现在的条目都是**占位内容**（名称是我按分类调性编的，封面用 CSS 像素图案生成），
 * 换成真实作品时只需要改 `items`，`cover` 填上图片路径即可（相对 `public`，走 `asset()`）。
 */

export interface WorkItem {
  id: string;
  /** 作品名 */
  title: string;
  /** 一句话说明，卡片 hover 时显示 */
  summary?: string;
  /** 封面图，相对 `public` 的路径；留空则用像素占位图案 */
  cover?: string;
  /** 占位图案的色相（0–360），没有封面时用来区分 */
  hue?: number;
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
      },
      {
        id: "virtual-classroom",
        title: "AI 虚拟课堂",
        summary: "Spring Boot + FastAPI 混合架构 · 四种教学 Agent",
        hue: 205,
      },
    ],
  },
  {
    id: "game",
    label: "游戏玩具",
    pageSize: 6,
    columns: 3,
    items: [
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
