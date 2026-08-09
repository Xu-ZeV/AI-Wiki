---
title: 单文件组件结构、样式和模板模式
impact: MEDIUM
impactDescription: Consistent SFC structure and styling choices improve maintainability, tooling support, and render performance
type: best-practice
tags: [vue3, sfc, scoped-css, styles, build-tools, performance, template, v-html, v-for, computed, v-if, v-show]
---

# 单文件组件结构、样式和模板模式

**影响：中** - 使用具有一致结构和高性能样式的 SFC 可以使组件更易于维护，并避免不必要的渲染开销。

## 任务列表

- 使用 `.vue` SFC 而不是组件的单独 `.js`/`.ts` 和 `.css` 文件
- 默认情况下将模板、脚本和样式并置在同一个 SFC 中
- 对模板和文件名中的组件名称使用 PascalCase
- 更喜欢组件范围的样式
- 在范围 CSS 中优先使用类选择器（而不是元素选择器）以提高性能
- 在 Vue 3.5+ 中使用 `useTemplateRef()` 访问 DOM / 组件引用
- 在 `:style` 绑定中使用驼峰式键以实现一致性和 IDE 支持
- 正确使用`v-for`和`v-if`
- 切勿将 `v-html` 与不受信任/用户提供的内容一起使用
- 根据切换频率和初始渲染成本选择 `v-if` 与 `v-show`

## 并置模板、脚本和样式

**不好：**
```
components/
├── UserCard.vue
├── UserCard.js
└── UserCard.css
```

**好：**
```vue
<!-- components/UserCard.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: { type: Object, required: true }
})

const displayName = computed(() =>
  `${props.user.firstName} ${props.user.lastName}`
)
</script>

<template>
  <div class="user-card">
    <h3 class="name">{{ displayName }}</h3>
  </div>
</template>

<style scoped>
.user-card {
  padding: 1rem;
}

.name {
  margin: 0;
}
</style>
```

## 组件名称使用 PascalCase

**不好：**
```vue
<script setup>
import userProfile from './user-profile.vue'
</script>

<template>
  <user-profile :user="currentUser" />
</template>
```

**好：**
```vue
<script setup>
import UserProfile from './UserProfile.vue'
</script>

<template>
  <UserProfile :user="currentUser" />
</template>
```

## SFC 中 `<style>` 块的最佳实践

### 更喜欢组件范围的样式

- 对于属于组件的样式使用 `<style scoped>`。
- 将 **全局 CSS** 保存在专用文件中（例如 `src/assets/main.css`），用于重置、排版、标记等。
- 谨慎使用 `:deep()`（仅限边缘情况）。

**不好：**

```vue
<style>
/* ❌ leaks everywhere */
button { border-radius: 999px; }
</style>
```

**好：**

```vue
<style scoped>
.button { border-radius: 999px; }
</style>
```

**好：**

```css
/* src/assets/main.css */
/* ✅ resets, tokens, typography, app-wide rules */
:root { --radius: 999px; }
```

### 在作用域 CSS 中使用类选择器

**不好：**
```vue
<template>
  <article>
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </article>
</template>

<style scoped>
article { max-width: 800px; }
h1 { font-size: 2rem; }
p { line-height: 1.6; }
</style>
```

**好：**
```vue
<template>
  <article class="article">
    <h1 class="article-title">{{ title }}</h1>
    <p class="article-subtitle">{{ subtitle }}</p>
  </article>
</template>

<style scoped>
.article { max-width: 800px; }
.article-title { font-size: 2rem; }
.article-subtitle { line-height: 1.6; }
</style>
```

## 使用 `useTemplateRef()` 访问 DOM/组件引用

对于 Vue 3.5+：使用 `useTemplateRef()` 访问模板引用。

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const inputRef = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

## 在 `:style` 绑定中使用驼峰命名法

**不好：**
```vue
<template>
  <div :style="{ 'font-size': fontSize + 'px', 'background-color': bg }">
    Content
  </div>
</template>
```

**好：**
```vue
<template>
  <div :style="{ fontSize: fontSize + 'px', backgroundColor: bg }">
    Content
  </div>
</template>
```

## 正确使用`v-for`和`v-if`

### 始终提供稳定的`:key`

- 更喜欢原始键（`string | number`）。
- 避免使用对象作为键。

**好：**

```vue
<li v-for="item in items" :key="item.id">
  <input v-model="item.text" />
</li>
```

### 避免 `v-if` 和 `v-for` 在同一元素上

它会导致意图不明确和不必要的工作。
([参考](https://vuejs.org/guide/essentials/list.html#v-for-with-v-if))

**过滤项目**
**不好：**

```vue
<li v-for="user in users" v-if="user.active" :key="user.id">
  {{ user.name }}
</li>
```

**好：**

```vue
<script setup lang="ts">
import { computed } from 'vue'

const activeUsers = computed(() => users.value.filter(u => u.active))
</script>

<template>
  <li v-for="user in activeUsers" :key="user.id">
    {{ user.name }}
  </li>
</template>
```

**有条件地显示/隐藏整个列表**
**好：**

```vue
<ul v-if="shouldShowUsers">
  <li v-for="user in users" :key="user.id">
    {{ user.name }}
  </li>
</ul>
```

## 切勿使用 `v-html` 渲染不受信任的 HTML

**不好：**
```vue
<template>
  <!-- DANGEROUS: untrusted input can inject scripts -->
  <article v-html="userProvidedContent"></article>
</template>
```

**好：**
```vue
<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps<{
  trustedHtml?: string
  plainText: string
}>()

const safeHtml = computed(() => DOMPurify.sanitize(props.trustedHtml ?? ''))
</script>

<template>
  <!-- Preferred: escaped interpolation -->
  <p>{{ props.plainText }}</p>

  <!-- Only for trusted/sanitized HTML -->
  <article v-html="safeHtml"></article>
</template>
```

## 通过切换行为选择 `v-if` 与 `v-show`

**不好：**
```vue
<template>
  <!-- Frequent toggles with v-if cause repeated mount/unmount -->
  <ComplexPanel v-if="isPanelOpen" />

  <!-- Rarely shown content with v-show pays initial render cost -->
  <AdminPanel v-show="isAdmin" />
</template>
```

**好：**
```vue
<template>
  <!-- Frequent toggles: keep in DOM, toggle display -->
  <ComplexPanel v-show="isPanelOpen" />

  <!-- Rare condition: lazy render only when true -->
  <AdminPanel v-if="isAdmin" />
</template>
```
