---
title: JavaScript 转换钩子需要带有 css="false" 的 did() 回调
impact: HIGH
impactDescription: Without calling done(), JavaScript-only transitions complete immediately, skipping the animation entirely
type: gotcha
tags: [vue3, transition, javascript, animation, hooks, gsap, done-callback]
---

# JavaScript 转换钩子需要带有 css="false" 的 did() 回调

**影响：高** - 使用纯 JavaScript 转换（使用 `:css="false"`）时，`@enter` 和 `@leave` 挂钩**必须**调用 `done()` 回调以在动画完成时发出信号。如果不调用 `done()`，Vue 会认为转换立即完成，导致元素出现/消失而没有动画。

当使用 GSAP、Anime.js 或 Web Animations API 等动画库时，这一点尤其重要。

## 任务清单

- [ ] 使用 `:css="false"` 时，始终在 `@enter` 和 `@leave` 钩子中调用 `done()`
- [ ] 当 JavaScript 动画完成时调用 `done()` （在 `onComplete` 回调中）
- [ ] 请记住：当 CSS 处理转换时，`done()` 是可选的，但对于 `:css="false"` 是**必需**
- [ ] 使用 `:css="false"` 防止 CSS 规则干扰 JS 动画

**有问题的代码：**
```vue
<template>
  <!-- BAD: No done() callback - animation is skipped! -->
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="show" class="box">Content</div>
  </Transition>
</template>

<script setup>
import gsap from 'gsap'

function onEnter(el) {
  // Animation starts but Vue doesn't wait for it!
  gsap.from(el, {
    opacity: 0,
    y: 50,
    duration: 0.5
  })
  // Missing done() call - element appears with no animation
}

function onLeave(el) {
  gsap.to(el, {
    opacity: 0,
    y: -50,
    duration: 0.5
  })
  // Missing done() call - element removed immediately!
}
</script>
```

**正确代码：**
```vue
<template>
  <!-- GOOD: done() callback signals animation completion -->
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="show" class="box">Content</div>
  </Transition>
</template>

<script setup>
import gsap from 'gsap'

function onEnter(el, done) {
  gsap.from(el, {
    opacity: 0,
    y: 50,
    duration: 0.5,
    onComplete: done  // Tell Vue animation is complete
  })
}

function onLeave(el, done) {
  gsap.to(el, {
    opacity: 0,
    y: -50,
    duration: 0.5,
    onComplete: done  // Element removed after animation
  })
}
</script>
```

## 为什么使用`:css="false"`？

1. **防止 CSS 干扰**：Vue 不会添加可能冲突的过渡类
2. **轻微的性能提升**：跳过 CSS 转换检测
3. **更清晰的意图**：明确 JS 控制动画

```vue
<template>
  <!-- Without :css="false", Vue adds v-enter-active etc. classes -->
  <!-- These can interfere with your JS animation timing -->
  <Transition @enter="onEnter" @leave="onLeave">
    <div v-if="show">May have CSS conflicts</div>
  </Transition>

  <!-- With :css="false", no classes added - full JS control -->
  <Transition :css="false" @enter="onEnter" @leave="onLeave">
    <div v-if="show">Pure JS animation</div>
  </Transition>
</template>
```

## 完整的 JavaScript 转换示例

```vue
<template>
  <Transition
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @enter-cancelled="onEnterCancelled"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
    @leave-cancelled="onLeaveCancelled"
  >
    <div v-if="show" class="animated-box">Content</div>
  </Transition>
</template>

<script setup>
import gsap from 'gsap'
import { ref } from 'vue'

const show = ref(false)
let enterAnimation = null
let leaveAnimation = null

function onBeforeEnter(el) {
  // Set initial state before animation
  el.style.opacity = 0
  el.style.transform = 'translateY(50px)'
}

function onEnter(el, done) {
  // Store animation reference for potential cancellation
  enterAnimation = gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: done  // REQUIRED with :css="false"
  })
}

function onAfterEnter(el) {
  // Cleanup after enter completes
  enterAnimation = null
}

function onEnterCancelled() {
  // Handle interruption (e.g., user toggles quickly)
  if (enterAnimation) {
    enterAnimation.kill()
    enterAnimation = null
  }
}

function onBeforeLeave(el) {
  // Set state before leaving
}

function onLeave(el, done) {
  leaveAnimation = gsap.to(el, {
    opacity: 0,
    y: -50,
    duration: 0.5,
    ease: 'power2.in',
    onComplete: done  // REQUIRED with :css="false"
  })
}

function onAfterLeave(el) {
  leaveAnimation = null
}

function onLeaveCancelled() {
  if (leaveAnimation) {
    leaveAnimation.kill()
    leaveAnimation = null
  }
}
</script>
```

## 使用网页动画 API

```vue
<script setup>
function onEnter(el, done) {
  const animation = el.animate([
    { opacity: 0, transform: 'scale(0.9)' },
    { opacity: 1, transform: 'scale(1)' }
  ], {
    duration: 300,
    easing: 'ease-out'
  })

  animation.onfinish = done  // Call done when animation ends
}

function onLeave(el, done) {
  const animation = el.animate([
    { opacity: 1, transform: 'scale(1)' },
    { opacity: 0, transform: 'scale(0.9)' }
  ], {
    duration: 300,
    easing: 'ease-in'
  })

  animation.onfinish = done
}
</script>
```

## 常见错误

```javascript
// WRONG: Calling done() immediately instead of after animation
function onEnter(el, done) {
  gsap.from(el, { opacity: 0, duration: 0.5 })
  done() // Called immediately - animation skipped!
}

// WRONG: Forgetting done() parameter
function onEnter(el) {  // No 'done' parameter
  gsap.from(el, {
    opacity: 0,
    onComplete: done  // Error: done is not defined!
  })
}

// CORRECT: Pass done to animation callback
function onEnter(el, done) {
  gsap.from(el, {
    opacity: 0,
    duration: 0.5,
    onComplete: done  // Called after 0.5s
  })
}
```

## 参考
- [Vue.js 转换 - JavaScript 挂钩](https://vuejs.org/guide/built-ins/transition.html#javascript-hooks)
- [GSAP与Vue](https://gsap.com/resources/vue/)
