---
title: 指定嵌套过渡的显式持续时间
impact: MEDIUM
impactDescription: Nested transitions with different timings may end prematurely when Vue detects only the root element's transition end
type: gotcha
tags: [vue3, transition, animation, duration, nested, timing]
---

# 指定嵌套转换的显式持续时间

**影响：中** - 当转换包含具有不同动画计时的嵌套子元素的元素时，Vue 默认情况下仅侦听 **根** 转换元素上的第一个 `transitionend` 或 `animationend` 事件。这意味着如果内部元素具有较长或延迟的动画，它们可能会在根元素的过渡完成时被切断。

## 任务清单

- [ ] 确定您的过渡是否包含具有不同动画持续时间的嵌套元素
- [ ] 使用 `:duration` 属性指定 Vue 应等待的总时间
- [ ] 如果进入和离开持续时间不同，请考虑使用单独的进入和离开持续时间
- [ ] 测试动画以确保嵌套元素完全完整

**有问题的代码：**
```vue
<template>
  <!-- BAD: Inner element has longer animation that gets cut off -->
  <Transition name="nested">
    <div v-if="show" class="outer">
      <div class="inner">Hello</div>
    </div>
  </Transition>
</template>

<style>
.nested-enter-active .outer,
.nested-leave-active .outer {
  transition: opacity 0.3s ease;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
  /* This 0.5s animation gets cut off at 0.3s when outer finishes! */
  transition: transform 0.5s ease 0.2s; /* 0.2s delay + 0.5s = 0.7s total */
}

.nested-enter-from .outer,
.nested-leave-to .outer {
  opacity: 0;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
  transform: translateX(-30px);
}
</style>
```

**正确代码：**
```vue
<template>
  <!-- GOOD: Explicit duration ensures all nested animations complete -->
  <Transition name="nested" :duration="700">
    <div v-if="show" class="outer">
      <div class="inner">Hello</div>
    </div>
  </Transition>
</template>

<style>
.nested-enter-active .outer,
.nested-leave-active .outer {
  transition: opacity 0.3s ease;
}

.nested-enter-active .inner,
.nested-leave-active .inner {
  /* Now this animation completes fully */
  transition: transform 0.5s ease 0.2s;
}

.nested-enter-from .outer,
.nested-leave-to .outer {
  opacity: 0;
}

.nested-enter-from .inner,
.nested-leave-to .inner {
  transform: translateX(-30px);
}
</style>
```

## 不同的进入和离开持续时间

```vue
<template>
  <!-- GOOD: Separate durations for enter and leave -->
  <Transition
    name="complex"
    :duration="{ enter: 500, leave: 800 }"
  >
    <div v-if="show" class="container">
      <h1 class="title">Title</h1>
      <p class="content">Content with staggered animation</p>
    </div>
  </Transition>
</template>

<style>
/* Enter: title first, then content */
.complex-enter-active .title {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.complex-enter-active .content {
  transition: opacity 0.3s ease 0.2s, transform 0.3s ease 0.2s;
}

/* Leave: content first, then title (reverse order) */
.complex-leave-active .content {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.complex-leave-active .title {
  transition: opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s;
}

.complex-enter-from .title,
.complex-enter-from .content,
.complex-leave-to .title,
.complex-leave-to .content {
  opacity: 0;
  transform: translateY(20px);
}
</style>
```

## 精心设计的交错动画

```vue
<template>
  <Transition name="stagger" :duration="800">
    <div v-if="show" class="card">
      <img class="card-image" src="..." />
      <h2 class="card-title">Title</h2>
      <p class="card-body">Body text...</p>
      <button class="card-action">Action</button>
    </div>
  </Transition>
</template>

<style>
/* Staggered entrance: image -> title -> body -> action */
.stagger-enter-active .card-image { transition: all 0.3s ease; }
.stagger-enter-active .card-title { transition: all 0.3s ease 0.1s; }
.stagger-enter-active .card-body { transition: all 0.3s ease 0.2s; }
.stagger-enter-active .card-action { transition: all 0.3s ease 0.3s; }
/* Total: 0.3s delay + 0.3s animation = 0.6s, but use 800ms for safety */

.stagger-enter-from .card-image,
.stagger-enter-from .card-title,
.stagger-enter-from .card-body,
.stagger-enter-from .card-action {
  opacity: 0;
  transform: translateY(10px);
}
</style>
```

## 计算持续时间

使用此公式计算正确的持续时间：
```
duration = max(delay + animation_duration) for all nested elements
```

示例：
- 元素 A：无延迟，300 毫秒持续时间 = 总计 300 毫秒
- 元素 B：100 毫秒延迟，300 毫秒持续时间 = 总共 400 毫秒
- 元素 C：200 毫秒延迟，500 毫秒持续时间 = 总共 700 毫秒

**所需 `:duration`**：700（或稍高一些以确保安全裕度）

## 参考
- [Vue.js 转换 - 嵌套转换](https://vuejs.org/guide/built-ins/transition.html#nested-transitions-and-explicit-transition-durations)
