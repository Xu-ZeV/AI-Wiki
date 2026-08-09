---
title: 使用基于类的动画实现非进入/离开效果
impact: LOW
impactDescription: Class-based animations are simpler and more performant for elements that remain in the DOM
type: best-practice
tags: [vue3, animation, css, class-binding, state]
---

# 使用基于类的动画实现非进入/离开效果

**影响：低** - 对于未进入或离开 DOM 的元素上的动画，请使用由 Vue 反应状态触发的基于 CSS 类的动画。这比 `<Transition>` 更简单，更适合抖动、脉冲或高亮效果等反馈动画。

## 任务列表

- 对 DOM 中的元素使用基于类的动画
- 仅将 `<Transition>` 用于进入/离开动画
- 将 CSS 动画与 Vue 的类绑定相结合 (`:class`)
- 考虑使用 `setTimeout` 自动删除动画类

**何时使用基于类的动画：**
- 用户反馈（错误时摇动，成功时脉冲）
- 引人注目的效果（突出显示变化）
- 悬停/焦点状态需要的不仅仅是 CSS 转换
- 元素保持安装状态的任何动画

**何时使用过渡组件：**
- 元素进入/离开 DOM (v-if/v-show)
- 路线转换
- 列表项目添加/删除

## 基本模式

```vue
<template>
  <div :class="{ shake: showError }">
    <button @click="submitForm">Submit</button>
    <span v-if="showError">This feature is disabled!</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showError = ref(false)

function submitForm() {
  if (!isValid()) {
    // Trigger shake animation
    showError.value = true

    // Auto-remove class after animation completes
    setTimeout(() => {
      showError.value = false
    }, 820)  // Match animation duration
  }
}
</script>

<style>
.shake {
  animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);  /* Enable GPU acceleration */
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}
</style>
```

## 常见的动画模式

### 成功的脉搏

```vue
<template>
  <button
    @click="save"
    :class="{ pulse: saved }"
  >
    {{ saved ? 'Saved!' : 'Save' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const saved = ref(false)

async function save() {
  await saveData()
  saved.value = true
  setTimeout(() => saved.value = false, 1000)
}
</script>

<style>
.pulse {
  animation: pulse 0.5s ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
</style>
```

### 突出显示变化

```vue
<template>
  <div
    :class="{ highlight: justUpdated }"
  >
    Value: {{ value }}
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const value = ref(0)
const justUpdated = ref(false)

watch(value, () => {
  justUpdated.value = true
  setTimeout(() => justUpdated.value = false, 1000)
})
</script>

<style>
.highlight {
  animation: highlight 1s ease-out;
}

@keyframes highlight {
  0% { background-color: yellow; }
  100% { background-color: transparent; }
}
</style>
```

### 弹跳注意力

```vue
<template>
  <div
    :class="{ bounce: needsAttention }"
    @animationend="needsAttention = false"
  >
    <BellIcon />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const needsAttention = ref(false)

function notifyUser() {
  needsAttention.value = true
  // No setTimeout needed - using animationend event
}
</script>

<style>
.bounce {
  animation: bounce 0.5s ease;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
```

## 使用动画结束事件

使用 `animationend` 事件代替 `setTimeout` 以获得更清晰的代码：

```vue
<template>
  <div
    :class="{ animate: isAnimating }"
    @animationend="isAnimating = false"
  >
    Content
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isAnimating = ref(false)

function triggerAnimation() {
  isAnimating.value = true
  // Class is automatically removed when animation ends
}
</script>
```

## 可组合用于可重用动画

```javascript
// composables/useAnimation.js
import { ref } from 'vue'

export function useAnimation(duration = 500) {
  const isAnimating = ref(false)

  function trigger() {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, duration)
  }

  return {
    isAnimating,
    trigger
  }
}
```

```vue
<script setup>
import { useAnimation } from '@/composables/useAnimation'

const shake = useAnimation(820)
const pulse = useAnimation(500)
</script>

<template>
  <button
    :class="{ shake: shake.isAnimating.value }"
    @click="shake.trigger()"
  >
    Shake me
  </button>

  <button
    :class="{ pulse: pulse.isAnimating.value }"
    @click="pulse.trigger()"
  >
    Pulse me
  </button>
</template>
```
