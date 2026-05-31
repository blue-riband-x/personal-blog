---
title: 博客
---

# 📖 博客文章

<script setup>
const posts = [
  { title: '第一篇博客 — 启程', date: '2026-05-31', link: '/blog/first-post', desc: '这是我的第一篇博客，聊聊建站初衷和未来的计划。' },
]
</script>

<article v-for="post in posts" :key="post.link" class="post-item">
  <a :href="post.link" class="post-title">{{ post.title }}</a>
  <span class="post-date">{{ post.date }}</span>
  <p class="post-desc">{{ post.desc }}</p>
</article>

<style>
.post-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
}
.post-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.post-title:hover {
  text-decoration: underline;
}
.post-date {
  display: inline-block;
  margin-left: 1rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.post-desc {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}
</style>
