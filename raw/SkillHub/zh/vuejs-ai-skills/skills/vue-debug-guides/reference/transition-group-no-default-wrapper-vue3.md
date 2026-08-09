---
title: TransitionGroup 不再渲染 Vue 3 中的默认包装元素
impact: MEDIUM
impactDescription: Vue 2 to Vue 3 migration may break layouts relying on the default span wrapper
type: gotcha
tags: [vue3, transition-group, migration, vue2, breaking-change, wrapper-element]
---

# TransitionGroup 不再渲染 Vue 3 中的默认包装元素

**影响：中** - 在 Vue 2 中，`<transition-group>` 始终呈现包装元素（默认 `<span>`），但在 Vue 3 中，由于片段支持，它默认不呈现包装元素。从 Vue 2 迁移时，这一重大更改可能会导致布局问题和样式损坏。

如果您的代码依赖于包装器元素进行样式或布局，则必须在 Vue 3 中显式指定 `tag` 属性。

## 任务清单

- [ ] 从 Vue 2 迁移时，向所有 `<TransitionGroup>` 组件添加显式 `tag` 属性
- [ ] 查看针对包装元素的 CSS 选择器
- [ ] 更新需要包装元素的父组件样式
- [ ] 考虑 Vue 3 中是否确实需要包装元素

**Vue 2 行为（默认包装元素）：**
```vue
<template>
  <transition-group name="list">
    <div v-for="item in items" :key="item.id">{{ item }}</div>
  </transition-group>
</template>

<!-- Renders as: -->
<span>  <!-- Default wrapper in Vue 2 -->
  <div>Item 1</div>
  <div>Item 2</div>
</span>
```

**Vue 3 行为（默认情况下没有包装器）：**
```vue
<template>
  <TransitionGroup name="list">
    <div v-for="item in items" :key="item.id">{{ item }}</div>
  </TransitionGroup>
</template>

<!-- Renders as (fragment): -->
<div>Item 1</div>
<div>Item 2</div>
<!-- No wrapper element! -->
```

**Vue 3 - 显式指定包装器：**
```vue
<template>
  <!-- Use tag prop to specify wrapper element -->
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">{{ item }}</li>
  </TransitionGroup>
</template>

<!-- Renders as: -->
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

## 迁移场景

### 布局取决于包装器

**在 Vue 3 中中断的 Vue 2 代码：**
```vue
<template>
  <transition-group class="grid-container" name="list">
    <div v-for="item in items" :key="item.id">{{ item }}</div>
  </transition-group>
</template>

<style>
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
</style>
```

在 Vue 3 中，该类不会应用于任何内容，因为没有包装器元素。

**针对 Vue 3 已修复：**
```vue
<template>
  <TransitionGroup class="grid-container" name="list" tag="div">
    <div v-for="item in items" :key="item.id">{{ item }}</div>
  </TransitionGroup>
</template>
```

### 语义 HTML 列表

**视图2：**
```vue
<transition-group tag="ul" name="list">
  <li v-for="item in items" :key="item.id">{{ item }}</li>
</transition-group>
```

**Vue 3（相同的语法，但现在标签更重要）：**
```vue
<TransitionGroup tag="ul" name="list">
  <li v-for="item in items" :key="item.id">{{ item }}</li>
</TransitionGroup>
```

### 当你不需要包装纸时

Vue 3 的片段支持意味着您可能根本不需要包装器：

```vue
<template>
  <div class="parent-with-styles">
    <!-- No tag needed if parent handles layout -->
    <TransitionGroup name="fade">
      <span v-for="item in items" :key="item.id">{{ item }}</span>
    </TransitionGroup>
  </div>
</template>

<style>
.parent-with-styles {
  display: flex;
  gap: 8px;
}
</style>
```

## DOM 内模板语法

使用 DOM 内模板（而非 SFC）时，请记住使用短横线大小写：

```html
<!-- In-DOM template -->
<transition-group tag="ul" name="list">
  <li v-for="item in items" :key="item.id">{{ item }}</li>
</transition-group>

<!-- NOT -->
<TransitionGroup tag="ul" name="list">  <!-- Won't work in DOM templates -->
```

## 参考
- [Vue 3 迁移指南 - TransitionGroup 根元素](https://v3-migration.vuejs.org/breaking-changes/transition-group.html)
- [Vue.js 过渡组](https://vuejs.org/guide/built-ins/transition-group.html)
