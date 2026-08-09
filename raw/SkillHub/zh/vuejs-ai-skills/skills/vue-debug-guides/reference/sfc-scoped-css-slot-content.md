---
title: 作用域 CSS 无法直接设置插槽内容的样式
impact: HIGH
impactDescription: Slot content receives the parent component's scope, not the child's, causing styles to fail unexpectedly
type: gotcha
tags: [vue3, sfc, scoped-css, slots, deep-selector]
---

# 作用域 CSS 无法直接设置插槽内容的样式

**影响：高** - 当父组件通过插槽传递内容时，该内容会接收父组件的作用域样式属性，而不是子组件的样式属性。这意味着子组件无法使用常规范围的 CSS 设置插槽内容的样式。

## 任务清单

- [ ] 在包装器组件中使用 `:deep()` 选择器来设置插槽内容的样式
- [ ] 或者，使用 `:slotted()` 伪选择器来定位开槽元素
- [ ] 对于复杂的插槽样式，请考虑使用 CSS 模块或无范围样式
- [ ] 存在样式假设时记录预期的槽内容结构

**有问题的代码：**
```vue
<!-- Card.vue (child component) -->
<template>
  <div class="card">
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card-body {
  padding: 1rem;
}

/* BAD: Won't apply to slot content! */
.card-body h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.card-body p {
  color: #666;
}
</style>
```

```vue
<!-- Parent.vue -->
<template>
  <Card>
    <!-- This h2 and p won't be styled by Card's scoped CSS -->
    <h2>Card Title</h2>
    <p>Card description text.</p>
  </Card>
</template>
```

**正确代码：**
```vue
<!-- Card.vue - Using :slotted() -->
<template>
  <div class="card">
    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card-body {
  padding: 1rem;
}

/* GOOD: :slotted() targets slot content */
:slotted(h2) {
  color: #333;
  margin-bottom: 0.5rem;
}

:slotted(p) {
  color: #666;
}
</style>
```

## 使用 :deep() 替代方案

```vue
<!-- Card.vue - Using :deep() -->
<style scoped>
.card-body {
  padding: 1rem;
}

/* :deep() also works for slot content */
.card-body :deep(h2) {
  color: #333;
}

.card-body :deep(p) {
  color: #666;
}
</style>
```

## 为什么会发生这种情况

插槽内容在父组件的范围内编译：

```vue
<!-- Parent template compiles to: -->
<Card>
  <h2 data-v-parent123>Card Title</h2>
  <p data-v-parent123>Card description</p>
</Card>

<!-- Card template compiles to: -->
<div class="card" data-v-card456>
  <div class="card-body" data-v-card456>
    <slot />  <!-- Content inserted WITHOUT data-v-card456 -->
  </div>
</div>
```

`<h2>` 具有 `data-v-parent123`，但 Card 的作用域 CSS 需要 `data-v-card456`。

## 槽的 :slotted() 与 :deep()

两者都有效，但有细微的差别：

```vue
<style scoped>
/* :slotted() - Specifically for slot content */
/* Only targets direct slotted elements */
:slotted(h2) {
  color: blue;
}

/* :deep() - More general deep selector */
/* Can target nested elements within slot content */
.card-body :deep(h2) {
  color: blue;
}

/* For nested elements in slot content, must use :deep() */
:slotted(.wrapper h2) { }  /* Won't work for nested h2 */
.card-body :deep(.wrapper h2) { }  /* Works for nested */
</style>
```

## 与命名槽组合

```vue
<template>
  <div class="card">
    <header class="card-header">
      <slot name="header" />
    </header>
    <div class="card-body">
      <slot />
    </div>
    <footer class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
/* Style specific slot content */
.card-header :slotted(h1),
.card-header :slotted(h2) {
  margin: 0;
  font-size: 1.25rem;
}

.card-body :slotted(p) {
  margin-bottom: 1rem;
}

.card-footer :slotted(button) {
  margin-right: 0.5rem;
}
</style>
```

## 性能提示：使用类

使用 `:slotted()` 的元素选择器可能会更慢：

```vue
<style scoped>
/* SLOWER: Element selector */
:slotted(p) {
  color: gray;
}

/* FASTER: Class selector */
:slotted(.card-text) {
  color: gray;
}
</style>
```

## 何时使用无作用域样式

对于复杂的插槽样式，无作用域样式可能更简洁：

```vue
<template>
  <article class="article-card">
    <slot />
  </article>
</template>

<style>
/* Unscoped with unique prefix for complex content styling */
.article-card h1,
.article-card h2,
.article-card h3 {
  font-family: Georgia, serif;
  line-height: 1.2;
}

.article-card p {
  line-height: 1.6;
}

.article-card img {
  max-width: 100%;
}

.article-card blockquote {
  border-left: 3px solid #ccc;
  padding-left: 1rem;
}
</style>
```

## 参考
- [Vue.js 作用域 CSS - 开槽选择器](https://vuejs.org/api/sfc-css-features.html#slotted-selectors)
- [Vue.js 深度选择器](https://vuejs.org/api/sfc-css-features.html#deep-selectors)
