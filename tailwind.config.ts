import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sora: [
          "Sora",
          "system-ui",
          "-apple-system",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans SC",
          "sans-serif",
        ],
        /**
         * 作品页的像素字体：Zpix（12px 点阵，SIL OFL）。
         * 只子集到 GB2312 一级字库（3755 字 + ASCII），153KB，覆盖日常中文。
         * 缺字会回退到系统字体，不会出豆腐块。
         */
        pixel: ["Zpix", "PingFang SC", "Microsoft YaHei", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        "nav-button": "hsl(var(--nav-button))",
        "hero-bg": "hsl(var(--hero-bg))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
            filter: "blur(4px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
            filter: "blur(0)",
          },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        /** 作品详情面板的入场：轻微下落 + 放大，别做成弹窗那种夸张的弹跳 */
        "panel-in": {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.965)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "panel-in": "panel-in 0.26s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    /**
     * 触屏浏览器点完会一直保留 `:hover` 状态，按钮就卡在悬停样式上不走了，
     * 看着像被选中。所以 hover 效果要按设备能力分两套变体：
     *
     * - `hoverable:` —— 只在有指针的设备上生效的**普通**样式（不加 `:hover`），
     *   用来给触屏留一套「默认就显示」的降级样式。
     * - `can-hover:` —— 同一媒体查询下的 `:hover` 样式，纯装饰性地悬停用。
     *
     * 注意 `can-hover:` 自己就带 `:hover`，不能拿来当 `hoverable:` 用。
     */
    plugin(({ addVariant }) => {
      const POINTER = "@media (hover: hover) and (pointer: fine)";
      addVariant("hoverable", `${POINTER} { & }`);
      addVariant("can-hover", `${POINTER} { &:hover }`);
      addVariant("group-can-hover", `${POINTER} { .group:hover & }`);
    }),
  ],
};

export default config;
