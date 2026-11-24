<script setup lang="ts">
import { ref } from 'vue'
import { MOCK_ARTWORKS } from '../data/mockImages'
import { useGlassBoard } from '../composables/useGlassBoard'
import '../styles/glass-board.css'

const boardRef = ref<HTMLElement | null>(null)

const {
  currentArtwork,
  currentIdx,
  tiles,
  cols,
  rows,
  isImageLoading,
  isImageError,
  stageWidth,
  stageHeight,
  registerTileCell,
  registerTileSheen,
  nextArtwork
} = useGlassBoard(boardRef, MOCK_ARTWORKS)
</script>

<template>
  <div class="glass-board-container">
    <!-- 背景环境光晕（仅在换图时更新一次并被 GPU 缓存） -->
    <div
      class="ambient-layer"
      :style="{ backgroundImage: `url(${currentArtwork.url})` }"
      aria-hidden="true"
    ></div>

    <!-- 主画板外壳 -->
    <div
      ref="boardRef"
      class="board-shell"
    >
      <!-- 骨架态与容错占位 -->
      <div v-if="isImageLoading" class="board-skeleton-overlay">
        <div class="skeleton-spinner"></div>
        <span>正在加载画卷切片与对齐贴图...</span>
      </div>
      <div v-else-if="isImageError" class="board-skeleton-overlay">
        <div class="error-fallback-box">
          <span>⚠️ 画卷图片解码失败，已自动切换至安全备用占位</span>
        </div>
      </div>

      <!-- 切片拼图网格舞台 -->
      <div class="board-stage">
        <div
          class="board-grid"
          :style="{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`
          }"
        >
          <div
            v-for="tile in tiles"
            :key="tile.id"
            :ref="(el) => registerTileCell(tile.id, el as HTMLElement | null)"
            class="tile-cell"
            :class="{ flipping: tile.isFlipping }"
          >
            <!-- 拼图内切片：以抵消 offsetLeft/offsetTop 还原大图全貌 -->
            <div
              class="tile-image-slice"
              :style="{
                width: `${stageWidth}px`,
                height: `${stageHeight}px`,
                backgroundImage: `url('${currentArtwork.url}')`,
                backgroundSize: `${stageWidth}px ${stageHeight}px`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                transform: `translate3d(-${tile.offsetLeft}px, -${tile.offsetTop}px, 0)`
              }"
            ></div>
            <!-- 表面高光反射层（由 registerTileSheen 绑定原生 DOM 矩阵直写） -->
            <div
              :ref="(el) => registerTileSheen(tile.id, el as HTMLElement | null)"
              class="tile-specular"
              aria-hidden="true"
            ></div>
          </div>
        </div>
      </div>

      <!-- 右侧空白/控制交互区域：点击整块区域切换下一张 -->
      <aside
        class="board-sidebar"
        @click="nextArtwork"
      >
        <div class="sidebar-header">
          <span class="artwork-badge">画卷 {{ currentIdx + 1 }} / {{ MOCK_ARTWORKS.length }}</span>
          <h3 class="artwork-title">{{ currentArtwork.title }}</h3>
          <span class="artwork-meta">{{ currentArtwork.author }} · {{ currentArtwork.year }}</span>
        </div>

        <div class="switch-hint-box">
          <span class="hint-icon">👆</span>
          <span class="hint-text">点击侧边空白切图</span>
          <span class="hint-sub">波浪式翻转动效</span>
        </div>

        <div class="performance-pills">
          <div class="perf-pill">
            <span class="dot"></span>
            <span>GPU 合成层位移</span>
          </div>
          <div class="perf-pill">
            <span class="dot"></span>
            <span>无 backdrop-filter 损耗</span>
          </div>
          <div class="perf-pill">
            <span class="dot"></span>
            <span>24~30 块弹性视差</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
