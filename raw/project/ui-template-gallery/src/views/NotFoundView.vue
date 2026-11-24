<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="not-found-view">
    <div class="content">
      <div class="icon">🔍</div>
      <h1>404</h1>
      <p>未找到该页面或控件入口</p>
      <button class="back-home-btn" @click="router.push('/')">返回画廊首页</button>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.icon {
  font-size: 3rem;
  margin-bottom: 16px;
}
h1 {
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 8px;
}
p {
  color: var(--text-secondary);
  margin-bottom: 24px;
}
.back-home-btn {
  padding: 10px 24px;
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  font-weight: 500;
  transition: opacity 0.2s;
}
.back-home-btn:hover {
  opacity: 0.9;
}
</style>
