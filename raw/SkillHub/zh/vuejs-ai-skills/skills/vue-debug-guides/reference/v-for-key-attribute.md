---
title: 始终在 v-for 循环中提供唯一的键
impact: HIGH
impactDescription: Missing or improper keys cause hard-to-debug bugs when list items have state, components, or animations
type: gotcha
tags: [vue3, v-for, list-rendering, key, state, components]
---

# 始终在 v-for 循环中提供唯一的键

**影响：高** - 如果没有正确的键，Vue 在列表更改时无法跟踪元素身份。这会导致组件状态丢失、动画不正确、表单输入值在项目之间跳转以及极难调试的错误。

`key` 属性告诉 Vue 你的数据如何与其渲染的 DOM 元素相关。当数据顺序发生变化（通过排序、过滤、添加或删除）时，Vue 使用键来确定要更新、删除或创建的内容。如果没有唯一键，Vue 就地重用 DOM 元素，这可能会导致一个项目的状态错误地显示在另一个项目上。

## 任务清单

- [ ] 始终为 `:key` 提供唯一、稳定的标识符（数据库 ID、UUID）
- [ ] 切勿使用数组索引作为键 - 添加/删除项目时索引会发生变化
- [ ] 仅使用原始值（字符串或数字） - 切勿使用对象作为键
- [ ] 在 `<template v-for>` 上，将密钥放在 `<template>` 标签本身上（Vue 3 更改）
- [ ] 在 v-for 中使用组件时，key 是强制的，不是可选的

**错误：**
```html
<!-- WRONG: No key provided -->
<li v-for="item in items">{{ item.name }}</li>

<!-- WRONG: Using array index as key - shifts when list changes -->
<li v-for="(item, index) in items" :key="index">
  <input v-model="item.value" />
</li>

<!-- WRONG: Object as key -->
<li v-for="item in items" :key="item">{{ item.name }}</li>

<!-- WRONG (Vue 3): Key on child instead of template -->
<template v-for="item in items">
  <li :key="item.id">{{ item.name }}</li>
</template>
```

```javascript
// Bug demonstration: Using index as key
// Initial: ['Alice', 'Bob', 'Charlie'] at indices [0, 1, 2]
// After removing 'Bob': ['Alice', 'Charlie'] at indices [0, 1]
// Charlie now has index 1, so Vue reuses Bob's DOM/component state for Charlie!
```

**正确：**
```html
<!-- CORRECT: Unique identifier as key -->
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>

<!-- CORRECT: With components -->
<MyComponent
  v-for="item in items"
  :key="item.id"
  :item="item"
/>

<!-- CORRECT (Vue 3): Key on template tag -->
<template v-for="item in items" :key="item.id">
  <li>{{ item.name }}</li>
  <span>{{ item.description }}</span>
</template>

<!-- CORRECT: With stateful elements -->
<div v-for="user in users" :key="user.id">
  <input v-model="user.email" />
  <select v-model="user.role">
    <option value="admin">Admin</option>
    <option value="user">User</option>
  </select>
</div>
```

## 当按键很关键时

当 v-for 循环包含以下内容时，绝对需要键：
- 具有本地状态的组件
- 表单元素（`<input>`、`<select>`、`<textarea>`）
- 具有初始化逻辑的元素（安装/创建的钩子）
- 动画或过渡
- 直接 DOM 操作

## 参考
- [Vue.js 列表渲染 - 关键](https://vuejs.org/guide/essentials/list.html#maintaining-state-with-key)
- [Vue 3 迁移指南 - 模板上的 Key](https://v3-migration.vuejs.org/breaking-changes/key-attribute)
