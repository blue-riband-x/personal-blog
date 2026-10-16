import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/**
 * GitHub Pages 对未知路径会返回 404.html。
 * 复制一份 index.html 作为 404.html，单页应用的子路由就能直接访问。
 */
const distDir = resolve(process.cwd(), "dist");
const source = resolve(distDir, "index.html");

if (!existsSync(source)) {
  console.warn("[spa-404] 未找到 dist/index.html，跳过 404 回退文件生成");
  process.exit(0);
}

copyFileSync(source, resolve(distDir, "404.html"));
console.log("[spa-404] 已生成 dist/404.html（GitHub Pages SPA 路由回退）");
