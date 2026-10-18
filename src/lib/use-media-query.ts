import { useEffect, useState } from "react";

/**
 * 监听媒体查询。
 *
 * 有些布局差异没法只用 Tailwind 的响应式类表达 —— 比如「按钮在左侧」和
 * 「按钮移到顶部居中」需要配合 `transform` 一起切换，这里用 JS 拿到布尔值
 * 再统一算位置，避免两套 CSS 互相覆盖。
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
