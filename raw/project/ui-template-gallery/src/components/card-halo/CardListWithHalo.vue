<script setup lang="ts">
import { ref } from 'vue'
import { useCardHalo } from '../../composables/useCardHalo'

export interface CardItem {
  id: string
  title: string
  subtitle: string
  tag: string
  time: string
  content: string
}

defineProps<{
  items: CardItem[]
}>()

const containerRef = ref<HTMLElement | null>(null)

const {
  haloStyle,
  updateHalo,
  handlePointerLeaveContainer
} = useCardHalo(containerRef)

const onCardPointerMove = (e: PointerEvent) => {
  const target = (e.currentTarget as HTMLElement)
  updateHalo(target, e.clientX, e.clientY)
}
</script>

<template>
  <div
    ref="containerRef"
    class="card-list-container"
    @pointerleave="handlePointerLeaveContainer"
  >
    <!-- 容器内单实例共享跟随光晕节点（置于底层 z-index: 1） -->
    <div
      class="card-hover-halo"
      :style="{
        transform: haloStyle.transform,
        width: haloStyle.width,
        height: haloStyle.height,
        borderRadius: haloStyle.borderRadius,
        opacity: haloStyle.opacity
      }"
      aria-hidden="true"
    ></div>

    <!-- 卡片列表（置于上层 z-index: 2） -->
    <div
      v-for="item in items"
      :key="item.id"
      class="halo-card"
      @pointermove="onCardPointerMove"
    >
      <div class="card-head-row">
        <div class="title-group">
          <span class="card-badge">{{ item.tag }}</span>
          <h4 class="card-h4">{{ item.title }}</h4>
        </div>
        <span class="card-time">{{ item.time }}</span>
      </div>
      <p class="card-summary">{{ item.content }}</p>
    </div>
  </div>
</template>

<style scoped>
.card-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: #ffedd5;
  color: #ea580c;
  border: 1px solid rgba(234, 88, 12, 0.25);
}

.card-h4 {
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f172a;
}

.card-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.card-summary {
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.5;
}
</style>
