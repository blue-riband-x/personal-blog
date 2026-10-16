import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-6 pb-24 pt-32 lg:px-8">
      <p className="text-sm tracking-[0.3em] text-primary">404</p>
      <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-foreground">
        页面走丢了
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        这个地址下面什么也没有。要不回首页，或者直接去博客看看？
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/"
          className="rounded-sm bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97]"
        >
          回到首页
        </Link>
        <Link
          to="/blog"
          className="rounded-sm bg-white px-6 py-3 text-sm font-bold text-background transition-all hover:brightness-90 active:scale-[0.97]"
        >
          进入博客
        </Link>
      </div>
    </div>
  );
}
