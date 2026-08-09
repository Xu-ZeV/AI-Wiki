---
title: 在计算属性中的reverse() 或sort() 之前复制数组
impact: MEDIUM
impactDescription: reverse() and sort() mutate the original array, causing unintended side effects in computed getters
type: gotcha
tags: [vue3, v-for, computed, array, mutation, list-rendering]
---

# 在计算属性中的reverse()或sort()之前复制数组

**影响：中度** - `reverse()` 和 `sort()` 方法会就地改变原始数组。当直接在计算属性 getter 中使用时，这会导致源数组被修改，从而导致无限响应式循环或不正确的数据状态。

计算的属性应该是纯粹的——它们计算的值没有副作用。改变计算 getter 内部的源数据违反了这一原则并导致不可预测的行为。

## 任务清单

- [ ] 在计算属性中调用 `reverse()` 或 `sort()` 之前始终创建数组的副本
- [ ] 使用扩展运算符 `[...array]` 或 `Array.from(array)` 或 `array.slice()` 进行复制
- [ ] 这适用于计算 getter 中使用的任何就地突变方法
- [ ] 考虑使用返回新数组的 `toSorted()` 和 `toReversed()` (ES2023)

**错误：**
```javascript
const numbers = ref([1, 2, 3, 4, 5])

// WRONG: Mutates the original array
const reversedNumbers = computed(() => {
  return numbers.value.reverse()  // Modifies numbers.value!
})

// WRONG: Same issue with sort
const sortedItems = computed(() => {
  return items.value.sort((a, b) => a.name.localeCompare(b.name))
})
```

**正确：**
```javascript
const numbers = ref([1, 2, 3, 4, 5])

// CORRECT: Create a copy first with spread operator
const reversedNumbers = computed(() => {
  return [...numbers.value].reverse()
})

// CORRECT: Create a copy before sorting
const sortedItems = computed(() => {
  return [...items.value].sort((a, b) => a.name.localeCompare(b.name))
})

// CORRECT: Using slice() to copy
const reversedNumbers = computed(() => {
  return numbers.value.slice().reverse()
})

// CORRECT: ES2023 non-mutating methods (if supported)
const reversedNumbers = computed(() => {
  return numbers.value.toReversed()
})

const sortedItems = computed(() => {
  return items.value.toSorted((a, b) => a.price - b.price)
})
```

## 也适用于模板中使用的方法

当使用方法在嵌套 v-for 循环中进行过滤/排序时，适用相同的规则：

```javascript
// CORRECT: Method that doesn't mutate
function getSortedChildren(parent) {
  return [...parent.children].sort((a, b) => a.order - b.order)
}
```

```html
<ul v-for="parent in parents" :key="parent.id">
  <li v-for="child in getSortedChildren(parent)" :key="child.id">
    {{ child.name }}
  </li>
</ul>
```

## 参考
- [Vue.js 列表渲染 - 显示过滤/排序结果](https://vuejs.org/guide/essentials/list.html#displaying-filtered-sorted-results)
