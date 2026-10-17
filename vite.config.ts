import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * 部署在 GitHub Pages 的仓库子路径下：https://blue-riband-x.github.io/personal-blog/
 * 本地开发用 "/"，构建（含 preview）用仓库子路径。
 */
const REPO_BASE = "/personal-blog/";

/**
 * 首页那个 3D 背景（@splinetool/runtime）必须保持默认的动态 import 拆分。
 *
 * 别用 `build.rollupOptions.output.manualChunks` 把它手动归组 —— 一旦手动分包，
 * 它会被提升成首屏 chunk 的**静态**依赖（外加一条 `modulepreload`），
 * 浏览器解析 index.js 时就开始下那 1MB，把背景大图挤到 10 秒开外。
 * 这个坑实测过：加了 manualChunks 后背景图 10.9 秒才到位，去掉后 2.7 秒。
 */
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? REPO_BASE : "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
}));
