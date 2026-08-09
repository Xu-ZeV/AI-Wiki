---
title: 混合命名槽和作用域槽时使用显式默认模板
impact: HIGH
impactDescription: Mixing v-slot on component with named slots inside causes ambiguous scope and compilation errors
type: gotcha
tags: [vue3, slots, scoped-slots, named-slots, compilation-error]
---

# 混合命名槽和作用域槽时使用显式默认模板

**影响：高** - 当组件同时使用默认作用域插槽和命名插槽时，您必须对默认插槽使用显式 `<template #default>`。在具有嵌套命名槽模板的情况下直接在组件上使用 `v-slot` 会导致范围模糊和编译错误。

## 任务清单

- [ ] 当将命名插槽与带有props的默认插槽一起使用时，请始终使用显式 `<template #default>`
- [ ] 切勿将 `v-slot` 与 `<template #name>` 混合在组件元件上
- [ ] 保持插槽范围清晰明确

**错误：**
```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <!-- BAD: v-slot on component + named template inside causes ambiguity -->
  <MyComponent v-slot="{ message }">
    <p>{{ message }}</p>

    <template #footer>
      <!-- Ambiguous: Is 'message' available here? Vue can't determine -->
      <p>Footer: {{ message }}</p>
    </template>
  </MyComponent>
</template>
```

这会导致编译错误，因为 Vue 无法确定：
1. 默认插槽中的 `message` 是否应在页脚插槽中可用
2、非模板内容适用于哪些范围

**正确：**
```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <!-- GOOD: Explicit template for each slot with clear scope -->
  <MyComponent>
    <template #default="{ message }">
      <p>{{ message }}</p>
    </template>

    <template #footer>
      <!-- Clear: footer slot has its own scope, no access to default's 'message' -->
      <p>Footer content here</p>
    </template>
  </MyComponent>
</template>
```

**正确 - 当页脚也有props时：**
```vue
<script setup>
import MyComponent from './MyComponent.vue'
</script>

<template>
  <MyComponent>
    <template #default="{ message }">
      <p>{{ message }}</p>
    </template>

    <template #footer="{ year }">
      <!-- Each slot receives its own props -->
      <p>Copyright {{ year }}</p>
    </template>
  </MyComponent>
</template>
```

## 规则

当您有**任何**命名插槽 (`<template #name>`) 时，请始终对**所有**插槽（包括默认插槽）使用显式模板。这使得范围边界清晰并防止编译错误。

|图案|有效的？ |笔记|
|---------|--------|-------|
| `v-slot` 仅在组件上 |是的 |单个默认作用域插槽 |
|仅命名模板|是的 |多个命名插槽 |
| `v-slot` 组件 + 命名模板 |没有 |范围不明确 |
|所有显式模板 |是的 |每个插槽的清晰范围|

## 参考
- [Vue.js 插槽 - 命名范围插槽](https://vuejs.org/guide/components/slots.html#named-scoped-slots)
