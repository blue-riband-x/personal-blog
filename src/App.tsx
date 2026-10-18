import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

/**
 * 路由按需加载。
 *
 * 全部静态 import 时，首屏要一次性下载并解析所有页面 —— 包括只有文章详情才用到的
 * react-markdown / remark-gfm，以及首页那套 Spline 运行时。
 * 访客大多是从一条分享链接直接落到某一页，为他没打开的页面付成本并不划算。
 */
const Home = lazy(() => import("./pages/Home"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Works = lazy(() => import("./pages/Works"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** 分块下载期间的占位：只铺底色，不闪白也不跳版 */
function RouteFallback() {
  return <div className="min-h-[60vh] w-full bg-hero-bg" aria-hidden="true" />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();
  // 首页是整屏 3D 场景，浮岛胶囊会显得多余，沿用通栏透明导航；其余页面走浮岛。
  const navbarVariant = pathname === "/" ? "plain" : "floating";
  // 作品页是整屏背景舞台，下面再挂一条页脚会把页面顶出滚动条，滚下去还露出内容区
  const hideFooter = pathname === "/works";

  return (
    <div className="flex min-h-screen flex-col bg-hero-bg">
      <ScrollToTop />
      <Navbar variant={navbarVariant} />
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/works" element={<Works />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
