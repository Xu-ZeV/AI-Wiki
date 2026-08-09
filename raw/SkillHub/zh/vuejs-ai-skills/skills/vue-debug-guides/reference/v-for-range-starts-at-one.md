---
title: v-for 范围迭代从 1 开始，而不是 0
impact: LOW
impactDescription: v-for with a number range starts at 1, unlike JavaScript arrays which start at 0
type: gotcha
tags: [vue3, v-for, list-rendering, range]
---

# v-for 范围迭代从 1 开始，而不是 0

**影响：低** - 将 `v-for` 与数字（范围迭代）一起使用时，迭代从 `1` 开始，而不是 `0`。这与数组以 0 为索引的典型 JavaScript 行为不同。

当生成的数字用于计算或数组索引时，此问题通常会导致差一错误。

## 任务清单

- [ ] 请记住 `v-for="n in 10"` 生成 1 到 10，而不是 0 到 9
- [ ] 使用范围值进行数组索引时，减 1：`items[n - 1]`
- [ ] 如果需要基于 0 的索引，请考虑创建计算数组

**错误的假设：**
```html
<!-- Developer expects 0-9, but gets 1-10 -->
<span v-for="n in 10">{{ n }}</span>
<!-- Output: 1 2 3 4 5 6 7 8 9 10 -->

<!-- WRONG: Off-by-one error when used for array access -->
<li v-for="n in items.length" :key="n">
  {{ items[n].name }}  <!-- Error! items[10] is undefined when length is 10 -->
</li>
```

**正确：**
```html
<!-- Correct understanding: 1-based range -->
<span v-for="n in 10" :key="n">{{ n }}</span>
<!-- Output: 1 2 3 4 5 6 7 8 9 10 -->

<!-- CORRECT: Adjust index for array access -->
<li v-for="n in items.length" :key="n">
  {{ items[n - 1].name }}  <!-- n-1 converts to 0-based -->
</li>

<!-- BETTER: Just iterate the array directly -->
<li v-for="(item, index) in items" :key="item.id">
  {{ index + 1 }}. {{ item.name }}  <!-- index is 0-based, add 1 for display -->
</li>
```

```html
<!-- Range for repeating elements (no array involved) -->
<div v-for="n in 3" :key="n" class="skeleton-row">
  Loading placeholder {{ n }} of 3...
</div>
<!-- Output: Loading placeholder 1 of 3, 2 of 3, 3 of 3 -->
```

## 范围迭代何时有用

- 渲染固定数量的占位符/骨架元素
- 创建分页按钮：`v-for="page in totalPages"`
- 生成星级：`v-for="star in 5"`
- 重复模板结构一定次数

## 参考
- [Vue.js 列表渲染 - 带范围的 v-for](https://vuejs.org/guide/essentials/list.html#v-for-with-a-range)
