---
title: 具有 CSS 转换和样式绑定的状态驱动动画
impact: LOW
impactDescription: Combining Vue's reactive style bindings with CSS transitions creates smooth, interactive animations
type: best-practice
tags: [vue3, animation, css, transition, style-binding, state, interactive]
---

# 具有 CSS 转换和样式绑定的状态驱动动画

**影响：低** - 对于对用户输入或状态更改做出反应的响应式交互式动画，请将 Vue 的动态样式绑定与 CSS 过渡相结合。这将创建平滑的动画，根据状态实时插入值。

## 任务列表

- 对频繁更改的动态属性使用 `:style` 绑定
- 添加 CSS `transition` 属性以在值之间平滑地设置动画
- 考虑使用 `transform` 和 `opacity` 进行 GPU 加速动画
- 对于复杂的值插值，请使用带有动画库的侦听器

## 基本模式

```vue
<template>
  <div
    @mousemove="onMousemove"
    :style="{ backgroundColor: `hsl(${hue}, 80%, 50%)` }"
    class="interactive-area"
  >
    <p>Move your mouse across this div...</p>
    <p>Hue: {{ hue }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const hue = ref(0)

function onMousemove(e) {
  // Map mouse X position to hue (0-360)
  const rect = e.currentTarget.getBoundingClientRect()
  hue.value = Math.round((e.clientX - rect.left) / rect.width * 360)
}
</script>

<style>
.interactive-area {
  transition: background-color 0.3s ease;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
```

## 常见用例

### 跟随鼠标位置

```vue
<template>
  <div
    class="container"
    @mousemove="onMousemove"
  >
    <div
      class="follower"
      :style="{
        transform: `translate(${x}px, ${y}px)`
      }"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const x = ref(0)
const y = ref(0)

function onMousemove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  x.value = e.clientX - rect.left
  y.value = e.clientY - rect.top
}
</script>

<style>
.container {
  position: relative;
  height: 300px;
}

.follower {
  position: absolute;
  width: 20px;
  height: 20px;
  background: blue;
  border-radius: 50%;
  /* Smooth following with transition */
  transition: transform 0.1s ease-out;
  /* Prevent the follower from triggering mousemove */
  pointer-events: none;
}
</style>
```

### 进度动画

```vue
<template>
  <div class="progress-container">
    <div
      class="progress-bar"
      :style="{ width: `${progress}%` }"
    />
  </div>
  <input
    type="range"
    v-model.number="progress"
    min="0"
    max="100"
  />
</template>

<script setup>
import { ref } from 'vue'

const progress = ref(0)
</script>

<style>
.progress-container {
  height: 20px;
  background: #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}
</style>
```

### 基于滚动的动画

```vue
<template>
  <div
    class="hero"
    :style="{
      opacity: heroOpacity,
      transform: `translateY(${scrollOffset}px)`
    }"
  >
    <h1>Scroll Down</h1>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const scrollY = ref(0)

const heroOpacity = computed(() => {
  return Math.max(0, 1 - scrollY.value / 300)
})

const scrollOffset = computed(() => {
  return scrollY.value * 0.5  // Parallax effect
})

function handleScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
.hero {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Note: No transition for scroll-based animations - they should be instant */
}
</style>
```

### 颜色主题过渡

```vue
<template>
  <div
    class="app"
    :style="themeStyles"
  >
    <button @click="toggleTheme">Toggle Theme</button>
    <p>Current theme: {{ isDark ? 'Dark' : 'Light' }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const isDark = ref(false)

const themeStyles = computed(() => ({
  '--bg-color': isDark.value ? '#1a1a1a' : '#ffffff',
  '--text-color': isDark.value ? '#ffffff' : '#1a1a1a',
  backgroundColor: 'var(--bg-color)',
  color: 'var(--text-color)'
}))

function toggleTheme() {
  isDark.value = !isDark.value
}
</script>

<style>
.app {
  min-height: 100vh;
  transition: background-color 0.5s ease, color 0.5s ease;
}
</style>
```

## 高级：使用侦听器进行数值补间

为了获得流畅的数字动画（计数器、统计数据），请使用带有动画库的侦听器：

```vue
<template>
  <div>
    <input v-model.number="targetNumber" type="number" />
    <p class="counter">{{ displayNumber.toFixed(0) }}</p>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue'
import gsap from 'gsap'

const targetNumber = ref(0)
const tweened = reactive({ value: 0 })

// Computed for display
const displayNumber = computed(() => tweened.value)

watch(targetNumber, (newValue) => {
  gsap.to(tweened, {
    duration: 0.5,
    value: Number(newValue) || 0,
    ease: 'power2.out'
  })
})
</script>
```

## 性能考虑因素

```vue
<style>
/* GOOD: GPU-accelerated properties */
.element {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* AVOID: Properties that trigger layout recalculation */
.element {
  transition: width 0.3s ease, height 0.3s ease, margin 0.3s ease;
}

/* For high-frequency updates, consider will-change */
.frequently-animated {
  will-change: transform;
}
</style>
```
