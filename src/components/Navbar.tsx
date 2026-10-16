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
 * 导航栏形态：
 * - `floating`：两端留白 + 圆角胶囊 + 毛玻璃的「浮岛」，内容页使用，浮在视频背景之上。
 * - `plain`：通栏贴边、默认全透明，直接在首页整屏 3D 场景上铺开，不做容器化处理。
 */
export type NavbarVariant = "floating" | "plain";

/** 两种形态的样式差异集中在此，调整某一种形态只动这一处。 */
const VARIANTS = {
  floating: {
    header: "px-4 lg:px-8",
    bar: "mx-auto max-w-7xl overflow-hidden rounded-b-2xl border border-t-0 border-white/10 shadow-lg shadow-black/20 backdrop-blur-xl",
    barClosed: "bg-hero-bg/50",
    barOpen: "bg-hero-bg/90",
    inner: "px-4 py-3 sm:px-6",
    nav: "hidden items-center gap-1 md:flex",
    link: "rounded-lg px-3.5 py-2 text-sm",
    linkActive: "bg-white/5 text-primary",
    linkIdle: "text-muted-foreground hover:bg-white/5 hover:text-foreground",
    mobileNav: "border-t border-white/10 px-4 pb-4 pt-2",
    mobileLink: "block rounded-lg px-3 py-2.5",
  },
  plain: {
    header: "",
    bar: "border-b",
    barClosed: "border-transparent bg-transparent",
    barOpen: "border-white/10 bg-hero-bg/90 backdrop-blur-md",
    inner: "px-6 py-5 lg:px-16",
    nav: "hidden items-center gap-8 md:flex",
    link: "text-sm tracking-[0.2em]",
    linkActive: "text-primary",
    linkIdle: "text-muted-foreground hover:text-foreground",
    mobileNav: "border-t border-white/10 px-6 pb-5 pt-2",
    mobileLink: "block border-b border-white/5 py-3",
  },
} as const;

interface NavbarProps {
  /** 导航栏形态，默认浮岛（内容页）。 */
  variant?: NavbarVariant;
}

export function Navbar({ variant = "floating" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const styles = VARIANTS[variant];

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50", styles.header)}>
      <div
        className={cn(
          "transition-colors duration-300",
          styles.bar,
          menuOpen ? styles.barOpen : styles.barClosed,
        )}
      >
        <div className={cn("flex items-center justify-between", styles.inner)}>
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

          <nav aria-label="主导航" className={styles.nav}>
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  cn(
                    styles.link,
                    "transition-colors focus-visible:outline-none focus-visible:text-primary",
                    isActive ? styles.linkActive : styles.linkIdle,
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
            className={cn("animate-fade-in md:hidden", styles.mobileNav)}
          >
            {navigationLinks.map((link) => (
              <NavLink
                key={link.to}
                end={link.to === "/"}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    styles.mobileLink,
                    "text-sm transition-colors",
                    isActive ? styles.linkActive : styles.linkIdle,
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
