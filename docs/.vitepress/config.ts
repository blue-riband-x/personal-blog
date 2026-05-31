import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '妄想龙王的世界',
  description: '个人博客，记录技术与思考',
  lang: 'zh-CN',
  base: '/personal-blog/', // 与 GitHub 仓库名一致，使用用户主页仓库可改为 '/'

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: '关于', link: '/about' },
    ],

    // 侧边栏
    sidebar: {
      '/blog/': [
        {
          text: '文章列表',
          items: [
            { text: '第一篇博客', link: '/blog/first-post' },
          ],
        },
      ],
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/blue-riband-x' },
    ],

    // 页脚
    footer: {
      message: '用 VitePress 构建',
      copyright: 'Copyright © 2026 妄想龙王的世界',
    },

    // 搜索
    search: {
      provider: 'local',
    },
  },
})
