<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import GlassSearchBar from '../components/glass-search/GlassSearchBar.vue'
import '../styles/glass-search.css'

interface MockRecord {
  id: string
  title: string
  tag: string
  date: string
  desc: string
}

const mockRecords: MockRecord[] = [
  {
    id: 'rec-1',
    title: '南瓜助手技术交接与架构梳理',
    tag: '会议纪要',
    date: '2026-11-03 11:09',
    desc: '梳理南瓜会议助手 4 大高质感控件的前端工程化实践与性能铁律。'
  },
  {
    id: 'rec-2',
    title: 'Vue 3 + Vite 60fps 动效渲染排障',
    tag: '性能优化',
    date: '2026-11-05 14:30',
    desc: '排查多切片动画中的 backdrop-filter 掉帧问题，确立仅改动 transform 的渲染守则。'
  },
  {
    id: 'rec-3',
    title: 'Damped Lerp 物理滞后滑行与微视差技术方案',
    tag: '交互设计',
    date: '2026-11-08 16:20',
    desc: '单实例容器共享无界高斯弥散光晕，以物理阻尼惯性追踪卡片中心位移。'
  },
  {
    id: 'rec-4',
    title: '高速公路智慧收费站标准化接口对接',
    tag: '业务项目',
    date: '2026-11-12 10:00',
    desc: 'RSU 与 ETC 交易流程控制、车道控制器外设通信协议规范落地。'
  },
  {
    id: 'rec-5',
    title: '南瓜助手磨砂流光设计令牌（Design Tokens）体系',
    tag: '设计规范',
    date: '2026-11-15 09:40',
    desc: '基于 --gs-* 变量解耦色彩与结构，实现搜索框全套南瓜橙流光一键换肤。'
  }
]

const searchQuery = ref('')
const debouncedQuery = ref('')
const isDebouncing = ref(false)
const activeTheme = ref<'nangua' | 'emerald' | 'cyan'>('nangua')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// 250ms 防抖更新机制（Debounce filter）
watch(searchQuery, (newVal) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // 若为空（如点击清空按钮），立即同步无延迟
  if (!newVal.trim()) {
    debouncedQuery.value = ''
    isDebouncing.value = false
    return
  }

  isDebouncing.value = true
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = newVal
    isDebouncing.value = false
  }, 250)
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})

// 空格清洗与特殊字符转义过滤
const filteredRecords = computed(() => {
  const q = debouncedQuery.value.trim().toLowerCase()
  if (!q) return mockRecords

  // 转义正则特殊字符避免非法 RegExp
  const sanitized = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const reg = new RegExp(sanitized, 'i')

  return mockRecords.filter(item =>
    reg.test(item.title) || reg.test(item.tag) || reg.test(item.desc)
  )
})

const handleClearSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  searchQuery.value = ''
  debouncedQuery.value = ''
  isDebouncing.value = false
}

const switchTheme = (theme: 'nangua' | 'emerald' | 'cyan') => {
  activeTheme.value = theme
}
</script>

<template>
  <div class="glass-search-demo-page" :class="`theme-${activeTheme}`">
    <div class="demo-wrapper">
      <!-- 控制台与令牌说明 -->
      <section class="control-panel">
        <div class="panel-header">
          <div class="panel-badge">控件三演练</div>
          <h2>南瓜助手磨砂流光搜索框</h2>
          <p class="panel-desc">
            全胶囊药丸造型、双层径向渐变底边呼吸扫光、解耦设计令牌（<code>--gs-*</code>）与正圆触控清空按钮联动。
          </p>
        </div>

        <div class="theme-bar">
          <span class="theme-label">令牌换肤（Design Tokens 切换）：</span>
          <div class="theme-buttons">
            <button
              class="theme-btn nangua-btn"
              :class="{ active: activeTheme === 'nangua' }"
              @click="switchTheme('nangua')"
            >
              南瓜暖橙 (默认)
            </button>
            <button
              class="theme-btn emerald-btn"
              :class="{ active: activeTheme === 'emerald' }"
              @click="switchTheme('emerald')"
            >
              薄荷翡翠
            </button>
            <button
              class="theme-btn cyan-btn"
              :class="{ active: activeTheme === 'cyan' }"
              @click="switchTheme('cyan')"
            >
              深海青蓝
            </button>
          </div>
        </div>
      </section>

      <!-- 搜索框展示舞台 -->
      <section class="search-stage">
        <div class="search-stage-inner">
          <GlassSearchBar
            v-model="searchQuery"
            placeholder="搜索会议标题、技术关键词或动效特征..."
            @clear="handleClearSearch"
          />

          <div class="beam-indicator">
            <span class="indicator-dot"></span>
            <span>底边双层径向渐变环境流光：常态 3.6s 呼吸扫光 / 悬停 2.6s 加速 / 聚焦 2.0s 峰值流光</span>
            <span v-if="isDebouncing" class="debouncing-badge">输入防抖过滤中...</span>
          </div>
        </div>

        <!-- 联动模拟搜索列表 -->
        <div class="results-container">
          <div class="results-header">
            <h4>模拟业务检索列表</h4>
            <span class="count-tag">
              {{ isDebouncing ? '过滤中...' : `找到 ${filteredRecords.length} 条结果` }}
            </span>
          </div>

          <!-- 存在结果 -->
          <div v-if="filteredRecords.length > 0" class="records-list">
            <div
              v-for="rec in filteredRecords"
              :key="rec.id"
              class="record-card"
            >
              <div class="record-meta-row">
                <span class="record-badge">{{ rec.tag }}</span>
                <span class="record-date">{{ rec.date }}</span>
              </div>
              <h5 class="record-title">{{ rec.title }}</h5>
              <p class="record-desc">{{ rec.desc }}</p>
            </div>
          </div>

          <!-- 边界情况：空状态（Empty state）UI 展现 -->
          <div v-else class="empty-state-box">
            <div class="empty-icon">🔍</div>
            <h5 class="empty-title">未找到与关键词匹配的内容</h5>
            <p class="empty-desc">
              未搜索到包含 “<strong>{{ debouncedQuery.trim() }}</strong>” 的记录，请尝试其他关键词或点击搜索框右侧清空按钮。
            </p>
            <button class="clear-search-link" @click="handleClearSearch">清空搜索条件</button>
          </div>
        </div>
      </section>

      <!-- 核心规范解读 -->
      <section class="specs-grid">
        <div class="spec-card">
          <span class="spec-tag">HIG 标准</span>
          <h4>44px 黄金触控胶囊</h4>
          <p>外框高度 44px、圆角 9999px，清空按钮具备 44px 触控区与 22px 内层面，悬停微放大 <code>scale(1.08)</code>。</p>
        </div>
        <div class="spec-card">
          <span class="spec-tag">双层流光</span>
          <h4>底边呼吸径向渐变</h4>
          <p>内层 <code>ellipse 110px 4px</code> 核心光束 + 外层 <code>ellipse 140px 24px</code> 柔光晕，<code>filter: blur(1.5px)</code> 融合。</p>
        </div>
        <div class="spec-card">
          <span class="spec-tag">解耦架构</span>
          <h4>CSS 变量设计令牌</h4>
          <p>结构与色彩完全解耦，通过 <code>--gs-accent</code>、<code>--gs-beam-core</code>、<code>--gs-surface</code> 等一键换肤。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.glass-search-demo-page {
  width: 100%;
  padding: 32px 20px 80px;
}

.demo-wrapper {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.control-panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.panel-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(234, 88, 12, 0.15);
  color: #fb923c;
  margin-bottom: 8px;
}

.panel-desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 6px;
}

.theme-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
  gap: 12px;
}

.theme-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.theme-buttons {
  display: flex;
  gap: 8px;
}

.theme-btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  transition: all 0.2s;
}

.theme-btn:hover {
  background: rgba(255, 255, 255, 0.12);
}

.theme-btn.active {
  border-color: #ea580c;
  background: rgba(234, 88, 12, 0.2);
  color: #fb923c;
}

/* 换肤令牌覆盖 */
.theme-emerald {
  --gs-accent: #10b981;
  --gs-beam-core: #d1fae5;
  --gs-beam-edge: #10b981;
  --gs-glow-strong: rgba(16, 185, 129, 0.55);
  --gs-glow-mid: rgba(16, 185, 129, 0.28);
  --gs-glow-tail: rgba(16, 185, 129, 0.1);
  --gs-border-focus: rgba(16, 185, 129, 0.65);
}

.theme-cyan {
  --gs-accent: #06b6d4;
  --gs-beam-core: #cffafe;
  --gs-beam-edge: #06b6d4;
  --gs-glow-strong: rgba(6, 182, 212, 0.55);
  --gs-glow-mid: rgba(6, 182, 212, 0.28);
  --gs-glow-tail: rgba(6, 182, 212, 0.1);
  --gs-border-focus: rgba(6, 182, 212, 0.65);
}

/* 舞台容器 */
.search-stage {
  background: rgba(10, 14, 23, 0.7);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 36px 28px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
}

.search-stage-inner {
  margin-bottom: 32px;
}

.beam-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 14px;
  flex-wrap: wrap;
}

.indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gs-accent);
  box-shadow: 0 0 8px var(--gs-accent);
}

.debouncing-badge {
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(234, 88, 12, 0.2);
  color: #fb923c;
  animation: pulse 1s infinite;
}

.results-container {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 24px;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.results-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.count-tag {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 16px 20px;
  transition: all 0.2s;
}

.record-card:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.record-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.record-badge {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(234, 88, 12, 0.15);
  color: #fb923c;
}

.record-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.record-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.record-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

/* 空状态 UI */
.empty-state-box {
  text-align: center;
  padding: 48px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 14px;
}

.empty-icon {
  font-size: 2.4rem;
  margin-bottom: 12px;
  opacity: 0.8;
}

.empty-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  max-width: 480px;
  margin: 0 auto 16px;
  line-height: 1.5;
}

.clear-search-link {
  font-size: 0.85rem;
  color: #fb923c;
  background: rgba(234, 88, 12, 0.12);
  border: 1px solid rgba(234, 88, 12, 0.3);
  padding: 6px 16px;
  border-radius: 8px;
  transition: all 0.2s;
}

.clear-search-link:hover {
  background: #ea580c;
  color: #fff;
}

/* 规范解读卡片 */
.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.spec-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
}

.spec-tag {
  display: inline-block;
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  margin-bottom: 8px;
}

.spec-card h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.spec-card p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.spec-card code {
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
  color: #fb923c;
  font-size: 0.78rem;
}
</style>
