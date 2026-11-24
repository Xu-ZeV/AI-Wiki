<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isHome = computed(() => route.path === '/')
const pageTitle = computed(() => (route.meta.title as string) || 'UI 模板库画廊')
const pageBadge = computed(() => (route.meta.badge as string) || '')

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <header class="app-navbar">
    <div class="navbar-container">
      <div class="brand" @click="goHome">
        <span class="brand-icon">✨</span>
        <span class="brand-title">UI Template Gallery</span>
      </div>

      <div class="nav-center">
        <span v-if="!isHome" class="route-badge">{{ pageBadge }}</span>
        <span class="nav-title">{{ pageTitle }}</span>
      </div>

      <div class="nav-actions">
        <button v-if="!isHome" class="back-btn" @click="goHome">
          <span class="arrow">←</span> 返回画廊
        </button>
        <span v-else class="version-tag">Production Ready</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  height: 60px;
  background: rgba(9, 13, 22, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
}

.navbar-container {
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.05rem;
  transition: opacity 0.2s;
}

.brand:hover {
  opacity: 0.85;
}

.brand-icon {
  font-size: 1.25rem;
}

.nav-center {
  display: flex;
  align-items: center;
  gap: 10px;
}

.route-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(234, 88, 12, 0.2);
  color: #fb923c;
  border: 1px solid rgba(234, 88, 12, 0.35);
}

.nav-title {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--border-color-hover);
}

.version-tag {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
