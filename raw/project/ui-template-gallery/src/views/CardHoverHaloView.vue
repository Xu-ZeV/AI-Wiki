<script setup lang="ts">
import CardListWithHalo, { type CardItem } from '../components/card-halo/CardListWithHalo.vue'
import '../styles/card-hover-halo.css'

const sampleCards: CardItem[] = [
  {
    id: 'c1',
    title: '南瓜交接与架构梳理',
    subtitle: '会议纪要',
    tag: '会议',
    time: '2026-11-03 11:09',
    content: '会议录音与纪要提炼完成，涵盖胶囊导航栏、磨砂流光搜索框与卡片跟随光晕三大生产级交互规范。'
  },
  {
    id: 'c2',
    title: 'Vue 3 + Vite 60fps 动效渲染排障',
    subtitle: '架构讨论',
    tag: '优化',
    time: '2026-11-05 14:30',
    content: '彻底去除 backdrop-filter 高频重绘，确立仅改动 transform 合成层与单实例光晕共享的性能铁律。'
  },
  {
    id: 'c3',
    title: 'Damped Lerp 物理滞后滑行算法评审',
    subtitle: '交互设计',
    tag: '规范',
    time: '2026-11-08 16:20',
    content: '采用 0.11 阻尼系数赋予阴影高级物理质量感，结合 (mouseX - centerX) * 0.05 实现卡片内微视差立体追踪。'
  },
  {
    id: 'c4',
    title: '智慧交通车道工控外设标准化项目评审',
    subtitle: '项目周会',
    tag: '业务',
    time: '2026-11-12 10:00',
    content: '协同各外设协议，规范交易流程控制，构建高可靠性收费站车道终端自动化状态机。'
  }
]
</script>

<template>
  <div class="card-halo-demo-page">
    <div class="demo-wrapper">
      <!-- 介绍控制台 -->
      <section class="control-panel">
        <div class="panel-header">
          <div class="panel-badge">控件四演练</div>
          <h2>列表卡片悬停跟随阴影与氛围光晕</h2>
          <p class="panel-desc">
            容器内单实例共享 <code>.card-hover-halo</code> 节点，消除生硬轮廓线，基于 Damped Lerp 物理滞后滑行与微视差立体追踪。
          </p>
        </div>

        <div class="indicator-bar">
          <span class="hint-pill">💡 交互提示</span>
          <span class="hint-text">
            缓慢将鼠标在卡片之间滑动切换，观察光晕的滞后追随与形变；在卡片内部移动时，注意微视差立体悬浮位移。
          </span>
        </div>
      </section>

      <!-- 列表舞台 -->
      <section class="halo-stage">
        <div class="stage-title-row">
          <h3>会议与任务看板</h3>
          <span class="stage-tag">单实例 DOM 共享</span>
        </div>

        <CardListWithHalo :items="sampleCards" />
      </section>

      <!-- 四大核心机制解读 -->
      <section class="mechanisms-grid">
        <div class="mech-card">
          <div class="mech-tag">无界弥散</div>
          <h4>高斯羽化消隐</h4>
          <p><code>filter: blur(18px)</code> + 径向渐变消退，彻底消隐机械边界，外扩 14px 垫在纯白卡片底层。</p>
        </div>
        <div class="mech-card">
          <div class="mech-tag">物理阻尼</div>
          <h4>Inertia Damped Lerp</h4>
          <p>插值公式 <code>curr += (target - curr) * 0.11</code>，在不同高度卡片间切换时表现出丝滑的几何滞后追随。</p>
        </div>
        <div class="mech-card">
          <div class="mech-tag">空间层次</div>
          <h4>卡片内微视差追踪</h4>
          <p>内部移动时计算 <code>(mouseX - centerX) * 0.05</code>，带动光晕微幅位移，营造悬浮于发光面上的立体感。</p>
        </div>
        <div class="mech-card">
          <div class="mech-tag">初态守卫</div>
          <h4>防穿帮就位与淡出</h4>
          <p>初次进入直接就位淡入（消除历史远方穿帮飘入），鼠标离开列表后透明度平滑衰减归零（阻尼 0.15）。</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.card-halo-demo-page {
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

.panel-desc code {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 4px;
  border-radius: 4px;
  color: #fb923c;
}

.indicator-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.hint-pill {
  color: #fb923c;
  font-weight: 500;
  flex-shrink: 0;
}

.halo-stage {
  background: rgba(10, 14, 23, 0.7);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.6);
}

.stage-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 14px;
}

.stage-title-row h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stage-tag {
  font-size: 0.75rem;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
}

.mechanisms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.mech-card {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 20px;
}

.mech-tag {
  display: inline-block;
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(234, 88, 12, 0.15);
  color: #fb923c;
  margin-bottom: 8px;
}

.mech-card h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.mech-card p {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.mech-card code {
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 4px;
  border-radius: 3px;
  color: #fb923c;
  font-size: 0.78rem;
}
</style>
