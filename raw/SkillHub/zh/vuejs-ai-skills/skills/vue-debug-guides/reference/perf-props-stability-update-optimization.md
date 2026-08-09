---
title: 保持props稳定以最大程度地减少子项重新渲染
impact: HIGH
impactDescription: Passing changing props to list items causes ALL children to re-render unnecessarily
type: efficiency
tags: [vue3, performance, props, v-for, re-renders, optimization]
---

# 保持props稳定以最大程度地减少子项重新渲染

**影响：高** - 当传递给子组件的 props 发生变化时，Vue 必须重新渲染这些组件。将 `activeId` 之类的派生值传递给每个列表项会导致所有项目在 activeId 更改时重新呈现，即使实际上只有一项的活动状态发生变化。

将比较逻辑移至父级并传递布尔结果。这是 Vue 中最有影响力的更新性能优化之一。

## 任务清单

- [ ] 避免传递所有子级都进行比较的父级状态（如 `activeId`）
- [ ] 在父级中预先计算派生布尔属性（如 `:active="item.id === activeId"`）
- [ ] 使用 Vue DevTools 重新渲染配置文件来识别 prop 稳定性问题
- [ ] 考虑此模式对于大型列表尤其重要

**错误：**
```vue
<template>
  <!-- BAD: activeId changes -> ALL 100 ListItems re-render -->
  <ListItem
    v-for="item in list"
    :key="item.id"
    :id="item.id"
    :active-id="activeId"
  />
</template>

<script setup>
import { ref } from 'vue'

const list = ref([/* 100 items */])
const activeId = ref(null)

// When activeId changes from 1 to 2:
// - ListItem 1 needs to re-render (was active, now not)
// - ListItem 2 needs to re-render (was not active, now active)
// - All other 98 ListItems ALSO re-render because activeId prop changed!
</script>
```

```vue
<!-- ListItem.vue - receives activeId and compares internally -->
<template>
  <div :class="{ active: id === activeId }">
    {{ id }}
  </div>
</template>

<script setup>
defineProps({
  id: Number,
  activeId: Number  // This prop changes for ALL items
})
</script>
```

**正确：**
```vue
<template>
  <!-- GOOD: Only items whose :active actually changed will re-render -->
  <ListItem
    v-for="item in list"
    :key="item.id"
    :id="item.id"
    :active="item.id === activeId"
  />
</template>

<script setup>
import { ref } from 'vue'

const list = ref([/* 100 items */])
const activeId = ref(null)

// When activeId changes from 1 to 2:
// - ListItem 1: :active changed from true to false -> re-renders
// - ListItem 2: :active changed from false to true -> re-renders
// - All other 98 ListItems: :active is still false -> NO re-render!
</script>
```

```vue
<!-- ListItem.vue - receives pre-computed boolean -->
<template>
  <div :class="{ active }">
    {{ id }}
  </div>
</template>

<script setup>
defineProps({
  id: Number,
  active: Boolean  // This only changes for items that truly changed
})
</script>
```

## 导致 Prop 不稳定的常见模式

```vue
<!-- BAD: Passing index that could shift -->
<Item
  v-for="(item, index) in items"
  :key="item.id"
  :index="index"
  :total="items.length"  <!-- Changes when list changes -->
/>

<!-- BAD: Passing entire selection set -->
<Item
  v-for="item in items"
  :key="item.id"
  :selected-ids="selectedIds"  <!-- All items re-render on any selection -->
/>

<!-- GOOD: Pre-compute the boolean -->
<Item
  v-for="item in items"
  :key="item.id"
  :selected="selectedIds.includes(item.id)"
/>
```

## 性能影响示例

|场景 |props变更 |组件重新渲染 |
|----------|---------------|------------------------|
| 100 项，通过 `activeId` | 100 | 100 100（全部）|
| 100 项，通过 `:active` 布尔值 | 2 | 2（仅更改）|
| 1000 项，通过 `activeId` | 1000 | 1000 1000（全部）|
| 1000 项，通过 `:active` 布尔值 | 2 | 2（仅更改）|

## 参考
- [Vue.js 性能 - props稳定性](https://vuejs.org/guide/best-practices/performance.html#props-stability)
