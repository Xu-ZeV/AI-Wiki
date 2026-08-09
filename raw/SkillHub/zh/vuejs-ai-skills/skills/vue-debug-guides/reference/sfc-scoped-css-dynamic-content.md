---
title: 作用域 CSS 不适用于动态添加的内容
impact: HIGH
impactDescription: Programmatically inserted DOM elements won't receive scoped style data attributes, causing styles to fail silently
type: gotcha
tags: [vue3, sfc, scoped-css, dynamic-content, v-html]
---

# 作用域 CSS 不适用于动态添加的内容

**影响：高** - Vue 的作用域 CSS 通过在编译时向元素添加数据属性来工作。在运行时动态添加的内容（通过 `v-html`、JavaScript DOM 操作或第三方库）不会具有这些属性，因此作用域样式将不适用。

## 任务清单

- [ ] 对于 `v-html` 内容，请使用 `:deep()` 选择器或无范围样式
- [ ] 避免编程式 DOM 操作；更喜欢 Vue 的响应式模板系统
- [ ] 当 DOM 操作不可避免时，使用具有唯一类前缀的全局样式
- [ ] 考虑混合静态和动态元素的内容的 CSS 模块

**有问题的代码：**
```vue
<script setup>
import { ref } from 'vue'

const htmlContent = ref('<p class="dynamic">This is dynamic content</p>')
</script>

<template>
  <div class="container">
    <div v-html="htmlContent"></div>
  </div>
</template>

<style scoped>
/* BAD: Won't apply to the dynamic <p> element! */
.dynamic {
  color: red;
  font-weight: bold;
}
</style>
```

**正确代码：**
```vue
<script setup>
import { ref } from 'vue'

const htmlContent = ref('<p class="dynamic">This is dynamic content</p>')
</script>

<template>
  <div class="container">
    <div v-html="htmlContent"></div>
  </div>
</template>

<style scoped>
/* GOOD: Use :deep() for v-html content */
.container :deep(.dynamic) {
  color: red;
  font-weight: bold;
}
</style>
```

## 为什么会发生这种情况

Vue 作用域 CSS 添加了一个独特的数据属性（例如 `data-v-7ba5bd90`）：
1. 组件模板中的所有元素（编译时）
2.所有CSS选择器

```html
<!-- What Vue generates at compile time -->
<div class="container" data-v-7ba5bd90>
  <div data-v-7ba5bd90>
    <!-- v-html content is inserted at runtime WITHOUT the attribute -->
    <p class="dynamic">This is dynamic content</p>
  </div>
</div>
```

```css
/* Generated scoped CSS */
.dynamic[data-v-7ba5bd90] { color: red; }
/* ^ Won't match because the dynamic <p> doesn't have data-v-7ba5bd90 */
```

## 替代方案：具有唯一前缀的全局样式

```vue
<script setup>
import { ref } from 'vue'
const htmlContent = ref('<p class="my-component-dynamic">Dynamic text</p>')
</script>

<template>
  <div class="my-component">
    <div v-html="htmlContent"></div>
  </div>
</template>

<!-- Use unscoped styles with unique prefixes -->
<style>
.my-component .my-component-dynamic {
  color: red;
}
</style>
```

## 编程 DOM 操作

当使用操作 DOM 的第三方库时：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const editorRef = ref(null)

onMounted(() => {
  // Third-party editor that injects its own DOM elements
  initRichEditor(editorRef.value)
})
</script>

<template>
  <div class="editor-wrapper">
    <div ref="editorRef"></div>
  </div>
</template>

<style scoped>
/* BAD: Won't reach injected editor elements */
.editor-toolbar { ... }
.editor-content { ... }
</style>

<style>
/* GOOD: Global styles scoped by parent class */
.editor-wrapper .editor-toolbar {
  background: #f5f5f5;
}
.editor-wrapper .editor-content {
  padding: 1rem;
}
</style>
```

## 最佳实践：首选响应式模板

尽可能使用 Vue 的响应式系统，而不是动态 HTML：

```vue
<script setup>
import { ref } from 'vue'

// BAD: Dynamic HTML that needs special style handling
const badHtml = ref('<span class="highlight">text</span>')

// GOOD: Reactive data that templates handle
const items = ref([
  { text: 'Item 1', isHighlighted: true },
  { text: 'Item 2', isHighlighted: false }
])
</script>

<template>
  <!-- BAD -->
  <div v-html="badHtml"></div>

  <!-- GOOD: Scoped styles work normally -->
  <ul>
    <li
      v-for="item in items"
      :key="item.text"
      :class="{ highlight: item.isHighlighted }"
    >
      {{ item.text }}
    </li>
  </ul>
</template>

<style scoped>
/* Works perfectly with reactive template */
.highlight {
  background: yellow;
}
</style>
```

## 参考
- [Vue.js 作用域 CSS](https://vuejs.org/api/sfc-css-features.html#scoped-css)
- [GitHub 问题：作用域 CSS 不适用于以编程方式添加的元素](https://github.com/vuejs/vue/issues/7649)
