---
title: 过渡组件最佳实践
impact: MEDIUM
impactDescription: Transition animates a single element or component; incorrect structure or keys prevent animations
type: best-practice
tags: [vue3, transition, animation, performance, keys]
---

# 过渡组件最佳实践

**影响：中** - `<Transition>` 以动画方式显示单个元素或组件的进入/离开。它非常适合切换 UI 状态、交换视图或一次为一个组件设置动画。

## 任务列表

- 将单个元件或组件包裹在 `<Transition>` 内
- 在相同元素类型之间切换时提供 `key`
- 当您需要顺序交换时使用 `mode="out-in"`
- 优选 `transform` 和 `opacity` 以获得流畅的动画

## 对单个根元素使用转换

`<Transition>` 仅支持一个直接子级。将多个节点包装在单个元素或组件中。

**不好：**
```vue
<template>
  <Transition name="fade">
    <h3>Title</h3>
    <p>Description</p>
  </Transition>
</template>
```

**好：**
```vue
<template>
  <Transition name="fade">
    <div>
      <h3>Title</h3>
      <p>Description</p>
    </div>
  </Transition>
</template>
```

## 相同元素类型之间的强制转换

当标签类型不变时，Vue 会重用相同的 DOM 元素。添加 `key`，以便 Vue 将其视为新元素并触发进入/离开。

**不好：**
```vue
<template>
  <Transition name="fade">
    <p v-if="isActive">Active</p>
    <p v-else>Inactive</p>
  </Transition>
</template>
```

**好：**
```vue
<template>
  <Transition name="fade" mode="out-in">
    <p v-if="isActive" key="active">Active</p>
    <p v-else key="inactive">Inactive</p>
  </Transition>
</template>
```

## 使用 `mode` 避免交换期间重叠

交换组件或视图时，请使用 `mode="out-in"` 来防止两者同时可见。

**不好：**
```vue
<template>
  <Transition name="fade">
    <component :is="currentView" />
  </Transition>
</template>
```

**好：**
```vue
<template>
  <Transition name="fade" mode="out-in">
    <component :is="currentView" :key="currentView" />
  </Transition>
</template>
```

## 动画 `transform` 和 `opacity` 以提高性能

避免布局触发属性，例如 `height`、`margin` 或 `top`。使用 `transform` 和 `opacity` 实现平滑、GPU 友好的过渡。

**不好：**
```css
.slide-enter-active,
.slide-leave-active {
  transition: height 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  height: 0;
}
```

**好：**
```css
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from {
  transform: translateX(-12px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(12px);
  opacity: 0;
}
```
