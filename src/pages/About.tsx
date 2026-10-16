import { Link } from "react-router-dom";
import { SITE } from "../lib/site";
import { posts } from "../lib/posts";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-8">
      <header className="animate-fade-up opacity-0">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-foreground">
          关于
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{SITE.role}</p>
      </header>

      <div className="prose-blog mt-10">
        <p>
          你好，我是 <strong>{SITE.author}</strong>。一个还在读书、但已经写了不少代码的开发者。
          目前主要方向是 Java 后端，平时也在折腾 AI 应用和全栈项目 ——
          从模型调用、Agent 编排，到前端界面和部署上线，都会自己摸一遍。
        </p>

        <h2>这个博客写什么</h2>
        <ul>
          <li>
            <strong>技术分享</strong> — 后端、数据库、系统设计等领域的实战经验和踩坑记录，
            尤其是那些查了半天才解决的问题。
          </li>
          <li>
            <strong>项目记录</strong> — 自己做过的项目，从想法到落地的全过程，
            包括走过的弯路。
          </li>
          <li>
            <strong>思考随笔</strong> — 对技术趋势、学习方法和职业发展的个人看法。
          </li>
        </ul>

        <h2>常用技术栈</h2>
        <p>
          <span className="flex flex-wrap gap-2">
            {SITE.stack.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </span>
        </p>

        <h2>关于这个站点</h2>
        <p>
          站点由 React + Vite + Tailwind CSS 构建，文章用 Markdown 写在仓库里，
          构建时自动读取并渲染，通过 GitHub Pages 部署。
          早前它是用 VitePress 搭的，后来为了统一视觉和交互，重构成了现在的样子。
        </p>

        <h2>联系我</h2>
        <p>
          有问题、想法或者只是想聊聊，都欢迎通过以下方式找到我：
        </p>
        <ul>
          <li>
            <a href={SITE.github} target="_blank" rel="noreferrer noopener">
              GitHub — @{SITE.handle}
            </a>
          </li>
          {SITE.email && (
            <li>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </li>
          )}
        </ul>
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          to="/blog"
          className="rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
        >
          看看博客（{posts.length} 篇）
        </Link>
        <a
          href={SITE.github}
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-sm bg-white px-6 py-3 text-sm font-bold text-background transition-all hover:brightness-90 active:scale-[0.97]"
        >
          GitHub
        </a>
      </div>
    </div>
  );
}
