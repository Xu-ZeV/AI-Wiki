<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { TemplateItem } from '../../types'

const props = defineProps<{
  item: TemplateItem
}>()

const router = useRouter()

const navigate = () => {
  router.push(props.item.route)
}
</script>

<template>
  <div class="template-card" @click="navigate">
    <div class="card-glow" aria-hidden="true"></div>
    <div class="card-inner">
      <div class="card-header">
        <div class="icon-badge" v-html="item.iconSvg"></div>
        <div class="category-pill">{{ item.category }}</div>
      </div>

      <div class="card-body">
        <h3 class="card-title">{{ item.title }}</h3>
        <span class="card-subtitle">{{ item.titleEn }}</span>
        <p class="card-desc">{{ item.description }}</p>

        <div class="tag-row">
          <span v-for="tag in item.tags" :key="tag" class="tag-chip">
            {{ tag }}
          </span>
        </div>

        <ul class="highlights-list">
          <li v-for="(h, i) in item.highlights" :key="i">
            <span class="check-bullet">✓</span> {{ h }}
          </li>
        </ul>
      </div>

      <div class="card-footer">
        <button class="action-btn" @click.stop="navigate">
          <span>立即体验</span>
          <span class="arrow-icon">→</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-card {
  position: relative;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.65);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 24px;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.25, 1, 0.3, 1),
              border-color 0.25s ease,
              box-shadow 0.25s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-4px);
  border-color: rgba(234, 88, 12, 0.45);
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.4),
              0 0 24px -4px rgba(234, 88, 12, 0.25);
}

.card-glow {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(234, 88, 12, 0.25) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transition: opacity 0.3s;
  opacity: 0.6;
}

.template-card:hover .card-glow {
  opacity: 1;
}

.card-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.icon-badge {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(234, 88, 12, 0.15);
  color: #fb923c;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(234, 88, 12, 0.3);
}

.category-pill {
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 12px;
}

.card-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
  flex-grow: 1;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.tag-chip {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.highlights-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.highlights-list li {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.check-bullet {
  color: #10b981;
  font-size: 0.85rem;
}

.card-footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(234, 88, 12, 0.12);
  color: #fb923c;
  font-weight: 500;
  font-size: 0.9rem;
  border: 1px solid rgba(234, 88, 12, 0.28);
  transition: all 0.2s;
}

.template-card:hover .action-btn {
  background: #ea580c;
  color: #ffffff;
  border-color: #ea580c;
  box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35);
}

.arrow-icon {
  transition: transform 0.2s;
}

.template-card:hover .arrow-icon {
  transform: translateX(4px);
}
</style>
