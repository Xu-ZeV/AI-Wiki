---
title: DOM 内模板解析注意事项
impact: HIGH
impactDescription: Browser HTML parsing before Vue compilation causes case sensitivity, self-closing tag, and element nesting issues
type: gotcha
tags: [vue3, templates, in-dom, html-parsing, kebab-case, self-closing-tags]
---

# DOM 内模板解析注意事项

**影响：高** - 当直接在 DOM 中（而不是在 `.vue` 文件中）编写 Vue 模板时，浏览器的本机 HTML 解析器会在 Vue 看到模板之前对其进行处理。这会导致三个关键问题：区分大小写问题、自闭合标签故障和元素放置限制。

这些问题不适用于单文件组件 (SFC) 或 Vue 编译器直接处理解析的字符串模板。

## 任务清单

- [ ] 在 DOM 模板中使用短横线命名组件名称
- [ ] 在 DOM 模板中使用短横线作为 prop 名称
- [ ] 在 DOM 模板中使用显式结束标记（非自结束）
- [ ] 对受限元素内的组件使用 `is="vue:component-name"`
- [ ] 更喜欢 SFC 以避免所有 DOM 内解析问题

## 问题 1：不区分大小写

HTML 不区分大小写。浏览器会在 Vue 看到之前将所有内容小写。

**不正确（DOM 内模板）：**
```html
<!-- Browser converts to: <blogpost posttitle="hello"> -->
<BlogPost postTitle="hello" @updatePost="onUpdate"></BlogPost>
```

**正确（DOM 内模板）：**
```html
<!-- Use kebab-case for everything -->
<blog-post post-title="hello" @update-post="onUpdate"></blog-post>
```

**在 SFC 中，PascalCase 工作正常：**
```vue
<!-- BlogPost.vue - PascalCase recommended -->
<template>
  <BlogPost postTitle="hello" @updatePost="onUpdate" />
</template>
```

## 问题 2：自关闭标签失败

HTML 仅允许 void 元素使用自关闭语法（`<input>`、`<img>` 等）。对于所有其他的，浏览器期望结束标签。

**不正确（DOM 内模板）：**
```html
<!-- Browser thinks the tag never closed, breaks nesting -->
<my-component />
<another-component />
```

**正确（DOM 内模板）：**
```html
<!-- Explicit closing tags required -->
<my-component></my-component>
<another-component></another-component>
```

**在证监会中，自动关闭效果很好：**
```vue
<template>
  <MyComponent />
  <AnotherComponent />
</template>
```

## 问题 3：元素放置限制

某些 HTML 元素对有效子元素有严格的规则。在 Vue 看到模板之前，浏览器会剔除无效元素。

**受限父元素：**
- `<ul>`、`<ol>` - 只允许 `<li>`
- `<table>` - 仅允许 `<thead>`、`<tbody>`、`<tfoot>`、`<tr>`、`<caption>`、`<colgroup>`
- `<tr>` - 只允许 `<td>`、`<th>`
- `<select>` - 只允许 `<option>`、`<optgroup>`

**不正确（DOM 内模板）：**
```html
<!-- Browser hoists blog-post-row outside the table -->
<table>
  <blog-post-row v-for="post in posts" :post="post"></blog-post-row>
</table>

<!-- Renders as: -->
<blog-post-row></blog-post-row>
<blog-post-row></blog-post-row>
<table></table>
```

**正确（DOM 内模板）：**
```html
<!-- Use is="vue:component-name" on a valid native element -->
<table>
  <tr is="vue:blog-post-row" v-for="post in posts" :key="post.id" :post="post"></tr>
</table>
```

```html
<ul>
  <li is="vue:todo-item" v-for="todo in todos" :key="todo.id" :todo="todo"></li>
</ul>
```

**重要提示：** `vue:` 前缀是必需的！如果没有它，`is` 将被视为本机自定义内置元素属性。

```html
<!-- WRONG: Missing vue: prefix -->
<tr is="blog-post-row"></tr>

<!-- CORRECT: With vue: prefix -->
<tr is="vue:blog-post-row"></tr>
```

## 这些何时适用？

|模板类型|做作的？ |示例|
|---------------|-----------|---------|
|单文件组件 (`.vue`) |没有 | `<template>`款|
|字符串模板 |没有 | `template: '<div>...</div>'` |
| DOM 内模板 | **是** | `<div id="app">...</div>` |
| `<script type="text/x-template">` | **是** |浏览器解析脚本内容 |

## 最佳实践：使用 SFC

最简单的解决方案是使用单文件组件（`.vue` 文件），它完全避免了 DOM 解析问题：

```vue
<!-- MyComponent.vue - All issues avoided -->
<script setup>
import BlogPost from './BlogPost.vue'
</script>

<template>
  <BlogPost postTitle="hello" @updatePost="onUpdate" />

  <table>
    <BlogPostRow v-for="post in posts" :key="post.id" :post="post" />
  </table>
</template>
```

## 参考
- [Vue.js - DOM 内模板解析注意事项](https://vuejs.org/guide/essentials/component-basics.html#in-dom-template-parsing-caveats)
