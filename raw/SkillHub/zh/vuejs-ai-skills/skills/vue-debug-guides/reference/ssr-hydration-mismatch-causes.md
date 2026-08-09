---
title: 了解并修复 SSR 水合不匹配问题
impact: HIGH
impactDescription: Hydration mismatches cause visual flickering, performance loss, and broken functionality
type: gotcha
tags: [vue3, ssr, hydration, debugging, nuxt, server-side-rendering]
---

# 了解并修复 SSR 水合不匹配问题

**影响：高** - 当客户端上呈现的 HTML 与服务器呈现的内容不同时，就会发生水合不匹配。 Vue 尝试通过丢弃并重新渲染不匹配的节点来恢复，从而导致性能下降、视觉闪烁以及可能损坏的事件处理程序。

了解常见原因有助于您有效地预防和调试这些问题。

## 任务清单

- [ ] 验证 HTML 结构是否正确嵌套（p 中没有 div，没有嵌套 a 标签）
- [ ] 将随机值生成移至 onMounted 或使用种子随机数
- [ ] 仅在客户端格式化日期/时间
- [ ] 使用 `data-allow-mismatch` (Vue 3.5+) 进行故意不匹配
- [ ] 在开发工具中检查浏览器修改的 HTML

## 原因 1：无效的 HTML 嵌套

浏览器会自动更正无效的 HTML，创建与 Vue 预期不同的 DOM。

**错误：**
```vue
<template>
  <!-- WRONG: <div> cannot be inside <p> -->
  <p>
    <div>This will break hydration</div>
  </p>

  <!-- WRONG: <a> cannot be inside <a> -->
  <a href="/parent">
    <a href="/child">Nested link</a>
  </a>

  <!-- WRONG: Block elements in inline elements -->
  <span>
    <div>Block in inline</div>
  </span>
</template>
```

浏览器将第一个示例转换为：
```html
<p></p>
<div>This will break hydration</div>
<p></p>
```

**正确：**
```vue
<template>
  <!-- CORRECT: Use appropriate nesting -->
  <div>
    <div>This works fine</div>
  </div>

  <!-- CORRECT: Single link with event handling -->
  <a href="/parent" @click="handleParentClick">
    <span @click.stop="handleChildClick">Nested action</span>
  </a>

  <!-- CORRECT: Block element wrapper -->
  <div>
    <div>Block in block</div>
  </div>
</template>
```

## 原因 2：渲染中的随机值

服务器和客户端生成不同的随机值。

**错误：**
```vue
<template>
  <!-- WRONG: Different ID on server vs client -->
  <div :id="'field-' + Math.random()">
    Form field
  </div>

  <!-- WRONG: Random order differs -->
  <div v-for="item in shuffledItems" :key="item.id">
    {{ item.name }}
  </div>
</template>

<script setup>
import { computed } from 'vue'

const items = [/* ... */]

// WRONG: Random shuffle runs differently on server and client
const shuffledItems = computed(() =>
  [...items].sort(() => Math.random() - 0.5)
)
</script>
```

**正确 - 仅限客户端随机：**
```vue
<template>
  <div :id="fieldId">
    Form field
  </div>

  <div v-for="item in displayItems" :key="item.id">
    {{ item.name }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const items = [/* ... */]

// CORRECT: Start with deterministic value
const fieldId = ref('field-default')
const displayItems = ref(items) // Original order on server

onMounted(() => {
  // Randomize only on client
  fieldId.value = 'field-' + Math.random().toString(36).slice(2)
  displayItems.value = [...items].sort(() => Math.random() - 0.5)
})
</script>
```

**正确 - 随机种子：**
```javascript
// utils/seededRandom.js
export function createSeededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// Use same seed on server and client
const seed = 12345 // Could be based on user ID, page, etc.
const random = createSeededRandom(seed)
```

## 原因 3：时区和日期差异

服务器可能与客户端位于不同的时区。

**错误：**
```vue
<template>
  <!-- WRONG: Server time != client time -->
  <span>{{ new Date().toLocaleTimeString() }}</span>

  <!-- WRONG: Server formats dates in server's timezone -->
  <span>{{ formatDate(article.createdAt) }}</span>
</template>

<script setup>
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>
```

**正确：**
```vue
<template>
  <!-- CORRECT: Render placeholder, update on client -->
  <span>{{ displayTime || 'Loading...' }}</span>

  <!-- CORRECT: Use UTC or defer to client -->
  <span>{{ formattedDate }}</span>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps(['article'])
const displayTime = ref(null)
const isClient = ref(false)

onMounted(() => {
  displayTime.value = new Date().toLocaleTimeString()
  isClient.value = true
})

// CORRECT: Server renders UTC, client converts to local
const formattedDate = computed(() => {
  if (!props.article?.createdAt) return ''

  if (isClient.value) {
    // Client: user's local timezone
    return new Date(props.article.createdAt).toLocaleDateString()
  } else {
    // Server: consistent UTC format
    return new Date(props.article.createdAt).toISOString().split('T')[0]
  }
})
</script>
```

## 原因 4：浏览器扩展和修改

浏览器扩展可以将内容注入到 DOM 中。

**缓解措施：**
```vue
<template>
  <!-- Use data-allow-mismatch for areas extensions might modify -->
  <head data-allow-mismatch>
    <title>{{ pageTitle }}</title>
  </head>
</template>
```

## Vue 3.5+ 抑制故意不匹配

```vue
<template>
  <!-- Suppress specific mismatch types -->
  <div data-allow-mismatch="text">
    {{ clientOnlyText }}
  </div>

  <!-- Suppress all mismatches for this element -->
  <div data-allow-mismatch>
    <ComplexClientComponent />
  </div>
</template>
```

有效的 `data-allow-mismatch` 值：
- `text` - 文本内容不匹配
- `children` - 子元素不匹配
- `class` - 类属性不匹配
- `style` - 样式属性不匹配
- `attribute` - 其他属性不匹配
-（无值）- 所有不匹配

## 调试水合不匹配

```javascript
// Enable detailed hydration mismatch warnings in development
// vite.config.js
export default {
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true
  }
}
```

```vue
<script setup>
import { onMounted } from 'vue'

// Debug: Compare server HTML with client expectation
onMounted(() => {
  const serverHTML = document.getElementById('app').innerHTML
  console.log('Server rendered:', serverHTML)
})
</script>
```

## 常见错误消息

|错误 |可能的原因 |
|-------|--------------|
| “水合文本内容不匹配”|服务器/客户端上的不同文本（日期，随机） |
| “儿童水合作用不匹配” |无效的 HTML 嵌套、条件渲染 |
| “水合属性不匹配” |具有不同值的动态属性 |
| “水合节点不匹配” |呈现完全不同的元素 |

## 参考
- [Vue.js SSR 指南 - 水合不匹配](https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch)
- [Nuxt补水最佳实践](https://nuxt.com/docs/guide/best-practices/hydration)
- [数据允许不匹配 RFC](https://github.com/vuejs/core/pull/9562)
