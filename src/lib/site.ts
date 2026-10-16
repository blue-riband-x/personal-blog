/**
 * 站点全局信息。改这一个文件就能换掉全站的署名、简介和社交链接。
 * 带 TODO 的字段是预留给博主自己填的，留空时页面上对应模块会自动隐藏。
 */
export const SITE = {
  /** 站点名称 */
  name: "妄想龙王的世界",
  /** 英文别名 / GitHub 用户名 */
  handle: "blue-riband-x",
  /** 一句话简介 */
  tagline: "记录技术与思考",
  /** 英文副标题 */
  taglineEn: "Write code, write thoughts.",
  /** 首页与 SEO 描述 */
  description:
    "妄想龙王的世界 —— 一个普通程序员的成长笔记。记录后端开发、AI 应用与全栈项目的实战经验、踩坑记录和零散思考。",
  /** 博主笔名 */
  author: "妄想龙王",
  /** 博主定位 */
  role: "学生开发者 · Java 后端 · AI 应用",
  /** 所在城市，留空则不展示 */
  location: "",
  /** TODO: 填上自己的邮箱后，关于页会显示联系方式 */
  email: "",
  github: "https://github.com/blue-riband-x",
  /** TODO: 可补充其他社交链接 */
  socials: [] as { label: string; href: string }[],
  /** 首页展示的技术栈 */
  stack: ["Java", "Spring Boot", "Python", "FastAPI", "React", "MySQL", "LangGraph"],
  /** 建站年份，用于页脚版权 */
  since: 2026,
};
