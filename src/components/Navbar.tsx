import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { asset, cn } from "../lib/utils";
import { SITE } from "../lib/site";

const navigationLinks = [
  { label: "首页", to: "/" },
  { label: "博客", to: "/blog" },
  { label: "关于", to: "/about" },
];

/**
 * 全局悬浮导航栏。
 *
 * 做成两端留白、圆角胶囊、半透明毛玻璃的「浮岛」形态：
 * 内容与屏幕边缘不接触，浮在 Hero 视频 / 3D 背景之上，
 * 滚动时始终固定，样式不随页面变化，保证全站一致。
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 lg:px-8">
      <div
        className={cn(
          "mx-auto max-w-7xl overflow-hidden rounded-b-2xl border border-t-0 border-white/10 shadow-lg shadow-black/20 backdrop-blur-xl transition-colors duration-300",
          menuOpen ? "bg-hero-bg/90" : "bg-hero-bg/50",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
            aria-label={`${SITE.name} 首页`}
          >
            <img
              src={asset("avatar.jpg")}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full border border-primary/30 object-cover"
            />
            <span className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                {SITE.nameEn}
              </span>
              <span className="text-xs font-medium text-primary">Blog</span>
            </span>
          </Link>

          <nav
            aria-label="主导航"
            className="hidden items-center gap-1 md:flex"
          >
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:text-primary",
                    isActive
                      ? "bg-white/5 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="navCta"
              size="lg"
              className="hidden rounded-lg px-6 text-xs uppercase tracking-widest md:inline-flex"
            >
              <Link to="/blog">进入博客</Link>
            </Button>

            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-label="切换导航菜单"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            >
              <span className="sr-only">菜单</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                {menuOpen ? (
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M3 6h14M3 10h14M3 14h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label="移动端导航"
            className="animate-fade-in border-t border-white/10 px-4 pb-4 pt-2 md:hidden"
          >
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                end={link.to === "/"}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-white/5 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Button
              asChild
              variant="default"
              size="lg"
              className="mt-3 w-full rounded-lg text-xs uppercase tracking-widest"
            >
              <Link to="/blog">进入博客</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
