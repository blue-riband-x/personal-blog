import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * 部署在 GitHub Pages 的仓库子路径下：https://blue-riband-x.github.io/personal-blog/
 * 本地开发用 "/"，构建（含 preview）用仓库子路径。
 */
const REPO_BASE = "/personal-blog/";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? REPO_BASE : "/",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
  },
}));
