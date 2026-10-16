import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { SITE } from "../lib/site";

const navigationLinks = [
  { label: "首页", to: "/" },
  { label: "博客", to: "/blog" },
  { label: "关于", to: "/about" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        isHome && !menuOpen
          ? "bg-transparent"
          : "border-b border-white/10 bg-hero-bg/80 backdrop-blur-md",
      )}
    >
      <div className="flex items-center justify-between px-6 py-5 lg:px-16">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80 sm:text-xl"
          aria-label={`${SITE.name} 首页`}
        >
          妄想龙王
          <span className="text-primary">·</span>
          世界
        </Link>

        <nav aria-label="主导航" className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
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
          className="animate-fade-in border-t border-white/10 bg-hero-bg/95 px-6 pb-5 pt-2 backdrop-blur-md md:hidden"
        >
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                cn(
                  "block border-b border-white/5 py-3 text-sm tracking-[0.2em] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Button asChild variant="default" size="lg" className="mt-4 w-full rounded-lg text-xs uppercase tracking-widest">
            <Link to="/blog">进入博客</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
