<script setup lang="ts">
import TemplateCard from '../components/gallery/TemplateCard.vue'
import { TEMPLATES } from '../data/templates'
</script>

<template>
  <div class="home-view">
    <div class="home-container">
      <!-- 英雄介绍区 -->
      <section class="hero-section">
        <div class="hero-badge">
          <span class="pulse-dot"></span>
          <span>前端组件模板 Skill 生产级展示工程</span>
        </div>
        <h1 class="hero-title">
          高质感 Web 交互与动效画廊
        </h1>
        <p class="hero-desc">
          收纳源自 <code>ui-template-library</code> 生产实战检验的高性能前端 UI 控件。
          每个样式独立入口，严格遵循 60fps 硬件加速、物理阻尼缓动与无障碍规范。
        </p>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-num">4</span>
            <span class="stat-label">生产级控件</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">60<small>fps</small></span>
            <span class="stat-label">合成层硬件加速</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">100%</span>
            <span class="stat-label">Vue 3 + TS 严谨类型</span>
          </div>
        </div>
      </section>

      <!-- 画廊卡片网格 -->
      <section class="gallery-section">
        <div class="section-header">
          <h2 class="section-title">精选交互控件</h2>
          <span class="section-hint">点击卡片即可进入独立交互展示页</span>
        </div>

        <div class="cards-grid">
          <TemplateCard
            v-for="item in TEMPLATES"
            :key="item.id"
            :item="item"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100%;
  padding: 40px 20px 80px;
}

.home-container {
  max-width: 1240px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  margin-bottom: 56px;
  padding: 24px 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 9999px;
  background: rgba(234, 88, 12, 0.12);
  border: 1px solid rgba(234, 88, 12, 0.28);
  color: #fb923c;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 20px;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ea580c;
  box-shadow: 0 0 10px #ea580c;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.hero-title {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  max-width: 720px;
  margin: 0 auto 32px;
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.hero-desc code {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  color: #fb923c;
}

.stats-row {
  display: inline-flex;
  align-items: center;
  gap: 32px;
  padding: 12px 28px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-num small {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-left: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: var(--border-color);
}

.gallery-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

@media (min-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .stats-row {
    gap: 16px;
    padding: 10px 16px;
  }
  .section-header {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
