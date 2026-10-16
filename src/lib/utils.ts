import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 拼接 public 目录下的静态资源路径。
 *
 * 站点部署在 GitHub Pages 的 `/personal-blog/` 子路径下，
 * 直接写 `/avatar.jpg` 会指向域名根而 404；写相对路径又会在
 * `/blog/:slug` 这类多级路由下解析错。统一走这个函数。
 */
export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
}
