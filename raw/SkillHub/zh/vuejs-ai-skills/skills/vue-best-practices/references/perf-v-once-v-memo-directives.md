---
title: 使用 v-once 和 v-memo 跳过不必要的更新
impact: MEDIUM
impactDescription: v-once skips all future updates for static content; v-memo conditionally memoizes subtrees
type: efficiency
tags: [vue3, performance, v-once, v-memo, optimization, directives]
---

# 使用 v-once 和 v-memo 跳过不必要的更新

**影响：中** - Vue 会针对每个响应式更改重新评估模板。对于从不更改或不经常更改的内容，`v-once` 和 `v-memo` 告诉 Vue 跳过更新，从而减少渲染工作。

使用 `v-once` 表示真正的静态内容，使用 `v-memo` 表示列表中的条件静态内容。

## 任务列表

- 将 `v-once` 应用于使用运行时数据但不需要更新的元素
- 应用 `v-memo` 来列出仅应在特定条件更改时更新的项目
- 验证记忆的内容不需要响应其他状态更改
- 使用 Vue DevTools 进行配置文件以确认跳过更新

## v-once：渲染一次，永不更新

**不好：**
```vue
<template>
  <!-- BAD: Re-evaluated on every parent re-render -->
  <div class="terms-content">
    <h1>Terms of Service</h1>
    <p>Version: {{ termsVersion }}</p>
    <div v-html="termsContent"></div>
  </div>

  <!-- This content NEVER changes, but Vue checks it every render -->
  <footer>
    <p>Copyright {{ copyrightYear }} {{ companyName }}</p>
  </footer>
</template>
```

**好：**
```vue
<template>
  <!-- GOOD: Rendered once, skipped on all future updates -->
  <div class="terms-content" v-once>
    <h1>Terms of Service</h1>
    <p>Version: {{ termsVersion }}</p>
    <div v-html="termsContent"></div>
  </div>

  <!-- v-once tells Vue this never needs to update -->
  <footer v-once>
    <p>Copyright {{ copyrightYear }} {{ companyName }}</p>
  </footer>
</template>

<script setup>
// These values are set once at component creation
const termsVersion = '2.1'
const termsContent = fetchedTermsHTML
const copyrightYear = 2024
const companyName = 'Acme Corp'
</script>
```

## v-memo：列表的条件记忆

**不好：**
```vue
<template>
  <!-- BAD: All items re-render when selectedId changes -->
  <div v-for="item in list" :key="item.id">
    <div :class="{ selected: item.id === selectedId }">
      <ExpensiveComponent :data="item" />
    </div>
  </div>
</template>
```

**好：**
```vue
<template>
  <!-- GOOD: Items only re-render when their selection state changes -->
  <div
    v-for="item in list"
    :key="item.id"
    v-memo="[item.id === selectedId]"
  >
    <div :class="{ selected: item.id === selectedId }">
      <ExpensiveComponent :data="item" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const list = ref([/* many items */])
const selectedId = ref(null)

// When selectedId changes:
// - Only the previously-selected item re-renders (selected: true -> false)
// - Only the newly-selected item re-renders (selected: false -> true)
// - All other items are SKIPPED (v-memo values unchanged)
</script>
```

## 具有多个依赖项的 v-memo

```vue
<template>
  <!-- Re-render only when item's selection OR editing state changes -->
  <div
    v-for="item in items"
    :key="item.id"
    v-memo="[item.id === selectedId, item.id === editingId]"
  >
    <ItemCard
      :item="item"
      :selected="item.id === selectedId"
      :editing="item.id === editingId"
    />
  </div>
</template>

<script setup>
const selectedId = ref(null)
const editingId = ref(null)
const items = ref([/* ... */])
</script>
```

## v-memo 与空数组 = v-once

```vue
<template>
  <!-- v-memo="[]" is equivalent to v-once -->
  <div v-for="item in staticList" :key="item.id" v-memo="[]">
    {{ item.name }}
  </div>
</template>
```

## 何时不使用这些指令

```vue
<template>
  <!-- DON'T: Content that DOES need to update -->
  <div v-once>
    <span>Count: {{ count }}</span>  <!-- count won't update! -->
  </div>

  <!-- DON'T: When child components have their own reactive state -->
  <div v-memo="[selected]">
    <InputField v-model="item.name" />  <!-- v-model won't work properly -->
  </div>

  <!-- DON'T: When the memoization benefit is minimal -->
  <span v-once>{{ simpleText }}</span>  <!-- Overhead not worth it -->
</template>
```

## 性能比较

|场景 |无指令 |与 v-once/v-memo |
|----------|-------------------|-------------------|
|静态标头，父级重新渲染 100 倍 |重新评估 100 倍 |已评估 1x |
| 1000 项，选择更改 | 1000 个项目重新渲染 | 2 项重新渲染 |
|复杂子组件 |完全重新渲染 |如果已记住则跳过 |

## 调试记忆组件

```vue
<script setup>
import { onUpdated } from 'vue'

// This won't fire if v-memo prevents update
onUpdated(() => {
  console.log('Component updated')
})
</script>
```
