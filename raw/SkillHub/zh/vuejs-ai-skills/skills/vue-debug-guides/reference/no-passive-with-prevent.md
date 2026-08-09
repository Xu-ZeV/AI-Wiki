---
title: 切勿一起使用 .passive 和 .prevent
impact: HIGH
impactDescription: Conflicting modifiers cause .prevent to be ignored and trigger browser warnings
type: gotcha
tags: [vue3, events, modifiers, scroll, touch, performance]
---

# 切勿一起使用 .passive 和 .prevent

**影响：高** - `.passive` 修饰符告诉浏览器您不会调用 `preventDefault()`，而 `.prevent` 正是这样做的。一起使用它们会导致 `.prevent` 被忽略并触发浏览器控制台警告。这是导致事件处理中断的逻辑矛盾。

## 任务清单

- [ ] 切勿在同一事件中组合 `.passive` 和 `.prevent`
- [ ] 使用 `.passive` 进行滚动/触摸事件，您希望获得更好的性能
- [ ] 当您需要停止默认浏览器操作时，请使用 `.prevent`
- [ ] 如果需要条件预防，请在 JavaScript 中处理，无需 `.passive`

**错误：**
```html
<!-- WRONG: Conflicting modifiers -->
<template>
  <div @scroll.passive.prevent="handleScroll">
    <!-- .prevent will be IGNORED -->
    <!-- Browser shows warning -->
  </div>
</template>
```

```html
<!-- WRONG: On touch events -->
<template>
  <div @touchstart.passive.prevent="handleTouch">
    <!-- Cannot prevent default - passive already promised not to -->
  </div>
</template>
```

```html
<!-- WRONG: On wheel events -->
<template>
  <div @wheel.passive.prevent="handleWheel">
    <!-- Broken: will scroll anyway despite .prevent -->
  </div>
</template>
```

**正确：**
```html
<!-- CORRECT: Use .passive for performance (no prevention needed) -->
<template>
  <div @scroll.passive="handleScroll">
    <!-- Good for scroll tracking without blocking -->
  </div>
</template>
```

```html
<!-- CORRECT: Use .prevent when you need to prevent default -->
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Correctly prevents form submission -->
  </form>
</template>
```

```html
<!-- CORRECT: For touch events where you need to prevent -->
<template>
  <div @touchmove="handleTouchMove">
    <!-- Handle prevention conditionally in JS -->
  </div>
</template>

<script setup>
function handleTouchMove(event) {
  if (shouldPreventScroll.value) {
    event.preventDefault()
  }
  // ... handle touch
}
</script>
```

## 理解.passive

```javascript
// .passive tells the browser:
// "I promise I won't call preventDefault()"

// This allows the browser to:
// 1. Start scrolling immediately without waiting for JS
// 2. Improve scroll performance, especially on mobile
// 3. Reduce jank and stuttering

// Equivalent to:
element.addEventListener('scroll', handler, { passive: true })
```

## 何时使用 .passive

```html
<!-- Good use cases for .passive -->

<!-- Scroll tracking analytics -->
<div @scroll.passive="trackScrollPosition">

<!-- Touch gesture detection (no prevention needed) -->
<div @touchmove.passive="detectGesture">

<!-- Wheel event monitoring -->
<div @wheel.passive="monitorWheel">
```

## 何时使用 .prevent（不使用 .passive）

```html
<!-- Good use cases for .prevent -->

<!-- Form submission -->
<form @submit.prevent="handleSubmit">

<!-- Link clicks with custom navigation -->
<a @click.prevent="navigate">

<!-- Preventing context menu -->
<div @contextmenu.prevent="showCustomMenu">
```

## 浏览器警告

当您组合 `.passive` 和 `.prevent` 时，浏览器控制台显示：
```
[Intervention] Unable to preventDefault inside passive event listener
due to target being treated as passive.
```

## 参考
- [Vue.js 事件处理 - 事件修饰符](https://vuejs.org/guide/essentials/event-handling.html#event-modifiers)
- [MDN - 通过被动侦听器提高滚动性能](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners)
