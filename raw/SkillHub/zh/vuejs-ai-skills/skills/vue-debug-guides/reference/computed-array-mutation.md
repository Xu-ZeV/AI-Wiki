---
title: 避免在计算属性中改变数组上的方法
impact: HIGH
impactDescription: Array mutating methods in computed modify source data causing unexpected behavior
type: capability
tags: [vue3, computed, arrays, mutation, sort, reverse]
---

# 避免在计算属性中改变数组上的方法

**影响：高** - `reverse()`、`sort()`、`splice()`、`push()`、`pop()`、`shift()` 和 `unshift()` 等 JavaScript 数组方法会改变原始数组方法数组。直接在计算属性内的响应式数组上使用它们将修改源数据，从而导致意外的副作用和错误。

## 任务清单

- [ ] 在使用变异方法之前始终创建数组的副本
- [ ] 使用扩展运算符 `[...array]` 或 `slice()` 复制数组
- [ ] 优先选择可用的非变异替代方案
- [ ] 注意哪些数组方法会发生变化，哪些会返回新数组

**错误：**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([3, 1, 4, 1, 5, 9, 2, 6])
const users = ref([
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
])

// BAD: sort() mutates the original array!
const sortedItems = computed(() => {
  return items.value.sort((a, b) => a - b)
})

// BAD: reverse() mutates the original array!
const reversedItems = computed(() => {
  return items.value.reverse()
})

// BAD: Both arrays now point to the same mutated data
// items.value and sortedItems.value are the SAME array
// items.value and reversedItems.value are the SAME array

// BAD: Chained mutations
const sortedUsers = computed(() => {
  return users.value.sort((a, b) => a.age - b.age)
})
</script>

<template>
  <!-- Original array is corrupted! -->
  <div>Original: {{ items }}</div>
  <div>Sorted: {{ sortedItems }}</div>
</template>
```

**正确：**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([3, 1, 4, 1, 5, 9, 2, 6])
const users = ref([
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
])

// GOOD: Spread operator creates a copy first
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => a - b)
})

// GOOD: slice() also creates a copy
const reversedItems = computed(() => {
  return items.value.slice().reverse()
})

// GOOD: Copy before sorting objects
const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => a.age - b.age)
})

// GOOD: Use toSorted() (ES2023) - non-mutating
const sortedItemsModern = computed(() => {
  return items.value.toSorted((a, b) => a - b)
})

// GOOD: Use toReversed() (ES2023) - non-mutating
const reversedItemsModern = computed(() => {
  return items.value.toReversed()
})
</script>

<template>
  <!-- Original array stays intact -->
  <div>Original: {{ items }}</div>
  <div>Sorted: {{ sortedItems }}</div>
  <div>Reversed: {{ reversedItems }}</div>
</template>
```

## 变异数组方法与非变异数组方法

|变异（避免在计算中）|非变异（安全）|
|------------------------------|---------------------|
| `sort()` | `toSorted()` (ES2023) |
| `reverse()` | `toReversed()` (ES2023) |
| `splice()` | `toSpliced()` (ES2023) |
| `push()` | `concat()` |
| `pop()` | `slice(0, -1)` |
| `shift()` | `slice(1)` |
| `unshift()` | `[item, ...array]` |
| `fill()` | `map()` 具有新的价值 |

## ES2023 非变异替代方案

现代 JavaScript (ES2023) 提供了常见数组方法的非变异版本：

```javascript
// These return NEW arrays, safe for computed properties
const sorted = array.toSorted((a, b) => a - b)
const reversed = array.toReversed()
const spliced = array.toSpliced(1, 2, 'new')
const withReplaced = array.with(0, 'newFirst')
```

## 嵌套数组的深度复制

对于可能会改变嵌套属性的对象数组：

```javascript
const items = ref([{ name: 'A', values: [1, 2, 3] }])

// Shallow copy - nested arrays still shared
const copied = computed(() => [...items.value])

// Deep copy if you need to mutate nested structures
const deepCopied = computed(() => {
  return JSON.parse(JSON.stringify(items.value))
  // Or use structuredClone():
  // return structuredClone(items.value)
})
```

## 参考
- [Vue.js 计算属性 - 避免改变计算值](https://vuejs.org/guide/essentials/computed.html#avoid-mutating-computed-value)
- [MDN 数组方法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
