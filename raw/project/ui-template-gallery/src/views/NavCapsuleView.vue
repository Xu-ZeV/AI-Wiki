<script setup lang="ts">
import { ref } from 'vue'
import NavCapsuleBar from '../components/nav-capsule/NavCapsuleBar.vue'
import type { NavMenuItem } from '../composables/useNavCapsule'
import '../styles/nav-capsule.css'

const isSimulatedScroll = ref(false)
const selectedTab = ref<string>('任务列表')

const handleMenuChange = (item: NavMenuItem) => {
  selectedTab.value = item.label
}

const toggleScrollMode = () => {
  isSimulatedScroll.value = !isSimulatedScroll.value
}
</script>

<template>
  <div class="nav-capsule-demo-page">
    <div class="demo-wrapper">
      <!-- 控件演练与控制台 -->
      <section class="control-panel">
        <div class="panel-header">
          <div class="panel-badge">交互控制台</div>
          <h2>南瓜助手胶囊导航栏演练</h2>
          <p class="panel-desc">
            支持未吸顶时的完整展开磁吸滑块动效，以及吸顶滚动后的正圆折叠、悬停展开与互斥让位机制。
          </p>
        </div>

        <div class="toggle-bar">
          <div class="toggle-info">
            <span class="mode-name">{{ isSimulatedScroll ? '当前形态：吸顶折叠模式 (.is-scrolled)' : '当前形态：常态完整展开模式' }}</span>
            <span class="mode-desc">{{ isSimulatedScroll ? '非激活项收缩为 38px 正圆；悬停任意项时触发互斥让位展开' : '点击切换菜单项，底色 Glider 滑块带有物理阻尼惯性平滑滑行' }}</span>
          </div>
          <button class="toggle-btn" :class="{ active: isSimulatedScroll }" @click="toggleScrollMode">
            <span>{{ isSimulatedScroll ? '切换为常态展开' : '模拟滚动吸顶' }}</span>
            <span class="switch-icon">{{ isSimulatedScroll ? '🔽' : '🔼' }}</span>
          </button>
        </div>
      </section>

      <!-- 演示舞台 -->
      <section class="stage-container" :class="{ 'scrolled-stage': isSimulatedScroll }">
        <div class="stage-header-mock">
          <div class="mock-left">
            <button class="mock-back-circle" title="吸顶折叠返回">←</button>
            <span class="mock-app-title">南瓜助手</span>
          </div>

          <div class="mock-nav-center">
            <NavCapsuleBar :is-scrolled="isSimulatedScroll" @change="handleMenuChange" />
          </div>

          <div class="mock-right">
            <span class="avatar-circle">NP</span>
          </div>
        </div>

        <div class="stage-body">
          <div class="tab-status-card">
            <span class="label">当前激活业务页面</span>
            <h3 class="current-value">{{ selectedTab }}</h3>
            <p class="sub-hint">
              {{ isSimulatedScroll ? '提示：鼠标滑入其他正圆图标，观察悬停项向两侧展开与原激活项互斥收缩。' : '提示：点击任意菜单项，观察 Glider 底色滑块的物理阻尼滑行与图标 360° 微弹性旋转。' }}
            </p>
          </div>
        </div>
      </section>

      <!-- 四大核心机制解读 -->
      <section class="mechanisms-grid">
        <div class="mech-card">
          <div class="mech-num">01</div>
          <h4>弹性磁吸底色滑块</h4>
          <p>绝对定位的 <code>.nav-capsule-glider</code>，缓动曲线采用带物理惯性的 <code>cubic-bezier(0.25, 1, 0.3, 1)</code>，位移耗时 0.4s，宽度自适应 0.38s。</p>
        </div>
        <div class="mech-card">
          <div class="mech-num">02</div>
          <h4>图标与文字绝对居中</h4>
          <p>针对汉字字数不一致（如“大厅”2 字与“任务列表”4 字），内层弹性盒几何居中，杜绝视觉重心偏心。</p>
        </div>
        <div class="mech-card">
          <div class="mech-num">03</div>
          <h4>360° 微弹性顺时针旋转</h4>
          <p>点击切换激活或悬停展开时，图标采用弹性贝塞尔 <code>cubic-bezier(0.34, 1.25, 0.64, 1)</code> 耗时 0.65s 顺时针旋转。</p>
        </div>
        <div class="mech-card">
          <div class="mech-num">04</div>
          <h4>吸顶折叠与互斥让位</h4>
          <p>滚动触发 <code>.is-scrolled</code> 瞬间收起文字，悬停非激活项时通过 CSS 互斥让位机制自动压缩原激活项宽度。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.nav-capsule-demo-page {
  width: 100%;
  padding: 32px 20px 80px;
}

.demo-wrapper {
  max-width: 1100px;
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

.toggle-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
  gap: 16px;
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(234, 88, 12, 0.15);
  color: #fb923c;
  border: 1px solid rgba(234, 88, 12, 0.35);
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #ea580c;
  color: #fff;
  border-color: #ea580c;
}

.toggle-btn.active {
  background: #ea580c;
  color: #fff;
}

/* 演示舞台 */
.stage-container {
  background: rgba(10, 14, 23, 0.75);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
  min-height: 380px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.stage-header-mock {
  padding: 14px 24px;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mock-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mock-back-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.mock-app-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.mock-right {
  display: flex;
  align-items: center;
}

.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ea580c;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-body {
  flex: 1;
  padding: 60px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-status-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px 48px;
  max-width: 520px;
}

.label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.current-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fb923c;
  margin: 10px 0 14px;
}

.sub-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* 机制卡片 */
.mechanisms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.mech-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
}

.mech-num {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ea580c;
  margin-bottom: 8px;
}

.mech-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.mech-card p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.mech-card code {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 4px;
  border-radius: 4px;
  color: #fb923c;
  font-size: 0.8rem;
}
</style>
