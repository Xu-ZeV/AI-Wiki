---
title: TransitionGroup 组件最佳实践
impact: MEDIUM
impactDescription: TransitionGroup animates list items; missing keys or misuse leads to broken list transitions
type: best-practice
tags: [vue3, transition-group, animation, lists, keys]
---

# TransitionGroup 组件最佳实践

**影响：中** - `<TransitionGroup>` 对进入、离开和移动的项目列表进行动画处理。将其用于 `v-for` 列表或单个项目随时间变化的动态集合。

## 任务列表

- 仅对列表和重复项目使用 `<TransitionGroup>`
- 为每个直系孩子提供独特、稳定的钥匙
- 当您需要语义或布局包装器时，使用 `tag`
- 避免使用 `mode` 属性（不支持）
- 使用 JavaScript 钩子实现交错效果

## 对列表使用 TransitionGroup

`<TransitionGroup>` 专为列表项而设计。需要时使用 `tag` 来控制包装器元素。

**不好：**
```vue
<template>
  <TransitionGroup name="fade">
    <ComponentA />
    <ComponentB />
  </TransitionGroup>
</template>
```

**好：**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

## 始终提供稳定的密钥

需要钥匙。如果没有稳定的键，Vue 就无法跟踪项目位置并且动画会中断。

**不好：**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="(item, index) in items" :key="index">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

**好：**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>
```

## 不要在 TransitionGroup 上使用 `mode`

`mode` 仅适用于 `<Transition>`，因为它交换单个元素。如果需要输入/输出排序，请使用 `<Transition>`。

**不好：**
```vue
<template>
  <TransitionGroup name="list" tag="div" mode="out-in">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </TransitionGroup>
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

## 具有数据属性的交错列表动画

对于级联列表动画，将索引传递给 JavaScript 挂钩并计算每个项目的延迟。

```vue
<template>
  <TransitionGroup
    tag="ul"
    :css="false"
    @before-enter="onBeforeEnter"
    @enter="onEnter"
  >
    <li v-for="(item, index) in items" :key="item.id" :data-index="index">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<script setup>
function onBeforeEnter(el) {
  el.style.opacity = 0
  el.style.transform = 'translateY(12px)'
}

function onEnter(el, done) {
  const delay = Number(el.dataset.index) * 80
  setTimeout(() => {
    el.style.transition = 'all 0.25s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
    setTimeout(done, 250)
  }, delay)
}
</script>
```
