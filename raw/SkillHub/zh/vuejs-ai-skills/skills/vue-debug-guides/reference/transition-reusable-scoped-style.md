---
title: 避免在可重用过渡组件中使用范围样式
impact: MEDIUM
impactDescription: Scoped styles in transition wrapper components won't apply to slotted content, breaking the transition animation
type: gotcha
tags: [vue3, transition, scoped-css, slot, reusable-component]
---

# 避免在可重用过渡组件中使用范围样式

**影响：中** - 创建可重用过渡包装组件时，使用 `<style scoped>` 将阻止过渡 CSS 类应用于开槽内容。作用域样式仅影响直接在组件模板中的元素，而不影响通过槽传递的内容。您的过渡动画将默默地失败。

## 任务清单

- [ ] 在可重用过渡组件中，使用 `<style>`，而不使用 `scoped`
- [ ] 或者，使用唯一的类名前缀来避免全局冲突
- [ ] 或者使用带有 `:global()` 的 CSS 模块作为过渡类
- [ ] 测试组件在不同上下文中使用时过渡是否有效

**有问题的代码：**
```vue
<!-- MyFadeTransition.vue -->
<template>
  <Transition name="my-fade">
    <slot />
  </Transition>
</template>

<!-- BAD: Scoped styles won't apply to slot content! -->
<style scoped>
.my-fade-enter-active,
.my-fade-leave-active {
  transition: opacity 0.3s ease;
}

.my-fade-enter-from,
.my-fade-leave-to {
  opacity: 0;
}
</style>
```

```vue
<!-- Parent component using the transition -->
<template>
  <MyFadeTransition>
    <div v-if="show">This won't animate!</div>
  </MyFadeTransition>
</template>

<!--
The <div> is slotted content, so .my-fade-* classes
applied by Vue won't match the scoped CSS selectors
-->
```

**正确代码：**
```vue
<!-- MyFadeTransition.vue -->
<template>
  <Transition name="my-fade">
    <slot />
  </Transition>
</template>

<!-- GOOD: Unscoped styles apply to any element -->
<style>
.my-fade-enter-active,
.my-fade-leave-active {
  transition: opacity 0.3s ease;
}

.my-fade-enter-from,
.my-fade-leave-to {
  opacity: 0;
}
</style>
```

## 替代方案：使用唯一的前缀类名

为了避免全局样式冲突，请使用独特的前缀：

```vue
<!-- FadeTransition.vue -->
<template>
  <Transition name="v-fade-transition">
    <slot />
  </Transition>
</template>

<style>
/* Unique prefix reduces collision risk */
.v-fade-transition-enter-active,
.v-fade-transition-leave-active {
  transition: opacity 0.3s ease;
}

.v-fade-transition-enter-from,
.v-fade-transition-leave-to {
  opacity: 0;
}
</style>
```

## 替代方案：带有 :global() 的 CSS 模块

```vue
<!-- FadeTransition.vue -->
<template>
  <Transition name="fade">
    <slot />
  </Transition>
</template>

<style module>
/* Use :global() for transition classes */
:global(.fade-enter-active),
:global(.fade-leave-active) {
  transition: opacity 0.3s ease;
}

:global(.fade-enter-from),
:global(.fade-leave-to) {
  opacity: 0;
}
</style>
```

## 替代方案：自定义转换类

使用自定义类属性来应用作用域类：

```vue
<!-- FadeTransition.vue -->
<template>
  <Transition
    :enter-active-class="$style.enterActive"
    :leave-active-class="$style.leaveActive"
    :enter-from-class="$style.enterFrom"
    :leave-to-class="$style.leaveTo"
  >
    <slot />
  </Transition>
</template>

<style module>
.enterActive,
.leaveActive {
  transition: opacity 0.3s ease;
}

.enterFrom,
.leaveTo {
  opacity: 0;
}
</style>
```

## 完整的可重用过渡组件示例

```vue
<!-- transitions/SlideTransition.vue -->
<template>
  <Transition
    name="slide"
    :mode="mode"
    :appear="appear"
    @before-enter="$emit('before-enter', $event)"
    @enter="$emit('enter', $event)"
    @after-enter="$emit('after-enter', $event)"
    @before-leave="$emit('before-leave', $event)"
    @leave="$emit('leave', $event)"
    @after-leave="$emit('after-leave', $event)"
  >
    <slot />
  </Transition>
</template>

<script setup>
defineProps({
  mode: {
    type: String,
    default: 'out-in',
    validator: (v) => ['out-in', 'in-out', ''].includes(v)
  },
  appear: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'before-enter', 'enter', 'after-enter',
  'before-leave', 'leave', 'after-leave'
])
</script>

<!-- Unscoped so styles apply to slotted content -->
<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
```

用途：
```vue
<template>
  <SlideTransition>
    <div v-if="show" class="content">
      This will properly animate!
    </div>
  </SlideTransition>
</template>
```

## 为什么会发生这种情况

Vue 的作用域样式通过向元素和选择器添加唯一的数据属性（例如 `data-v-7ba5bd90`）来工作：

```css
/* What you write */
.my-fade-enter-active { ... }

/* What Vue generates (scoped) */
.my-fade-enter-active[data-v-7ba5bd90] { ... }
```

开槽内容来自父组件并获取父组件的数据属性，而不是过渡组件的属性。所以选择器永远不会匹配。

## 参考
- [Vue.js 可重用过渡](https://vuejs.org/guide/built-ins/transition.html#reusable-transitions)
- [Vue.js 作用域 CSS](https://vuejs.org/api/sfc-css-features.html#scoped-css)
