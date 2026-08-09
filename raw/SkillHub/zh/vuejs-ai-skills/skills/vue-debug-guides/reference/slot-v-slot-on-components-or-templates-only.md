---
title: v-slot 只能用在组件或模板标签上
impact: HIGH
impactDescription: Using v-slot on HTML elements causes compilation errors
type: gotcha
tags: [vue3, slots, v-slot, compilation-error, common-mistake]
---

# v-slot 只能用在组件或模板标签上

**影响：高** - `v-slot` 指令（及其简写 `#`）只能在 Vue 组件或 `<template>` 标签上使用。在 `<div>` 或 `<span>` 等原生 HTML 元素上使用它会导致 Vue 编译错误。

## 任务清单

- [ ] 仅在组件元素或 `<template>` 标签上使用 `v-slot`
- [ ] 当使用默认作用域插槽简写时，应用于组件本身
- [ ] 对于命名槽，始终使用 `<template #name>` 语法

**错误：**
```vue
<template>
  <!-- BAD: v-slot on a native HTML element -->
  <div v-slot:header>
    <h1>Title</h1>
  </div>

  <!-- BAD: Shorthand on HTML element -->
  <span #default="{ item }">
    {{ item.name }}
  </span>

  <!-- BAD: v-slot inside a plain HTML element -->
  <div>
    <p v-slot:content>Some text</p>
  </div>
</template>
```

这些导致错误：`v-slot can only be used on components or <template> tags`

**正确：**
```vue
<template>
  <!-- GOOD: v-slot on component element (default scoped slot) -->
  <MyComponent v-slot="{ item }">
    {{ item.name }}
  </MyComponent>

  <!-- GOOD: Named slots use template tags -->
  <BaseLayout>
    <template #header>
      <h1>Title</h1>
    </template>

    <template #default>
      <p>Main content</p>
    </template>

    <template #footer>
      <p>Footer content</p>
    </template>
  </BaseLayout>

  <!-- GOOD: Shorthand on component for default slot -->
  <FancyList #default="{ item }">
    <div>{{ item.name }}</div>
  </FancyList>
</template>
```

## 常见场景

### 将插槽内容封装在 HTML 中
如果您需要 HTML 包装插槽内容，请将它们放入模板中：

```vue
<!-- WRONG -->
<MyComponent>
  <div v-slot:header class="header-wrapper">
    <h1>Title</h1>
  </div>
</MyComponent>

<!-- CORRECT -->
<MyComponent>
  <template #header>
    <div class="header-wrapper">
      <h1>Title</h1>
    </div>
  </template>
</MyComponent>
```

### 同一元件上有多个 V 型槽
当您有多个 v-slot 指令时，会发生另一个错误 - 仅第一个被识别：

```vue
<!-- BAD: Multiple v-slot directives -->
<MyComponent v-slot:header v-slot:footer>
  Content
</MyComponent>

<!-- GOOD: Separate template for each slot -->
<MyComponent>
  <template #header>Header</template>
  <template #footer>Footer</template>
</MyComponent>
```

## 有效的 v 槽位置

|元素类型 |允许 V 型槽吗？ |示例|
|--------------|-----------------|---------|
|组件|是的 | `<MyComponent v-slot="props">` |
| `<template>` |是的 | `<template #header>` |
| `<div>` |没有 |编译错误 |
| `<span>` |没有 |编译错误|
|任何 HTML 元素 |没有 |编译错误|

## 参考
- [Vue.js 插槽](https://vuejs.org/guide/components/slots.html)
- [深度扫描 - vue-misused-v-slot](https://deepscan.io/docs/rules/vue-misused-v-slot)
