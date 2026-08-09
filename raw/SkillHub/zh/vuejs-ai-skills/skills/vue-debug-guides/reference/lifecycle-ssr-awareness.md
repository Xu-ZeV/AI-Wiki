---
title: 已安装和未安装的挂钩在 SSR 期间不会运行
impact: MEDIUM
impactDescription: SSR applications may fail if mounted-only code is essential for functionality
type: capability
tags: [vue3, lifecycle, ssr, server-side-rendering, nuxt, onMounted, mounted, hydration]
---

# 已安装和未安装的钩子在 SSR 期间不会运行

**影响：中度** - 在服务器端渲染 (SSR) 期间，服务器上永远不会调用 `mounted`、`onMounted`、`unmounted` 和 `onUnmounted` 等生命周期挂钩。如果仅将关键逻辑放置在这些钩子中，这可能会导致服务器呈现的内容和客户端呈现的内容之间存在差异、水合作用不匹配以及功能缺失。

在服务器上，仅运行 `beforeCreate`、`created` 及其 Composition API 等效项。特定于客户端的操作（DOM 访问、浏览器 API、第三方库）必须位于已安装的挂钩中，但您必须适当处理 SSR 情况。

## 任务清单

- [ ] 将浏览器特定的代码（窗口、文档、localStorage）放置在 Mounted/onMounted 中
- [ ] 确保关键数据获取发生在服务器上运行的挂钩中（已创建）
- [ ] 处理客户端与服务器不同的内容的水合不匹配
- [ ] 对仅客户端组件使用 `<ClientOnly>` 包装器 (Nuxt) 或条件渲染
- [ ] 使用浏览器 API 之前检查浏览器环境

**错误：**
```javascript
// WRONG: Accessing browser APIs in created - breaks SSR
export default {
  created() {
    // These don't exist on the server!
    this.width = window.innerWidth // ReferenceError: window is not defined
    this.savedData = localStorage.getItem('data') // ReferenceError: localStorage is not defined
  }
}
```

```javascript
// WRONG: Critical initialization only in mounted - won't run on server
export default {
  data() {
    return { user: null }
  },
  async mounted() {
    // This won't run on server - page renders without user data
    // Then hydrates with user data - causes flash of content
    this.user = await fetchCurrentUser()
  }
}
```

**正确：**
```javascript
// CORRECT: Data fetching in created (runs on server), DOM in mounted
export default {
  data() {
    return {
      user: null,
      windowWidth: 0
    }
  },
  async created() {
    // This runs on both server and client
    this.user = await fetchCurrentUser()
  },
  mounted() {
    // Browser-specific code safely in mounted
    this.windowWidth = window.innerWidth
    window.addEventListener('resize', this.handleResize)
  },
  unmounted() {
    window.removeEventListener('resize', this.handleResize)
  }
}
```

```vue
<!-- CORRECT: Composition API with SSR awareness -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const user = ref(null)
const windowWidth = ref(0)

// This runs on both server and client (during setup)
user.value = await useFetch('/api/user')

// These only run on client
onMounted(() => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

function handleResize() {
  windowWidth.value = window.innerWidth
}
</script>
```

## 检查浏览器环境

```javascript
// CORRECT: Guard browser API access
export default {
  data() {
    return { theme: 'light' }
  },
  created() {
    // Check if we're in browser before accessing browser APIs
    if (typeof window !== 'undefined') {
      this.theme = localStorage.getItem('theme') || 'light'
    }
  },
  mounted() {
    // mounted only runs in browser, so this is always safe
    this.applyTheme()
  }
}
```

## Nuxt.js 特定模式

```vue
<!-- CORRECT: Using Nuxt's ClientOnly for client-specific components -->
<template>
  <div>
    <!-- This content renders on both server and client -->
    <h1>Dashboard</h1>

    <!-- This only renders on client - no hydration mismatch -->
    <ClientOnly>
      <ChartComponent :data="chartData" />
      <template #fallback>
        <p>Loading chart...</p>
      </template>
    </ClientOnly>
  </div>
</template>
```

```javascript
// CORRECT: Using Nuxt's process.client/process.server
export default {
  created() {
    if (process.client) {
      // Only runs in browser
      this.initAnalytics()
    }
    if (process.server) {
      // Only runs on server
      this.logServerRequest()
    }
  }
}
```

## 处理水合不匹配

```vue
<script setup>
import { ref, onMounted } from 'vue'

// Start with a value that matches what server renders
const currentTime = ref(null)

onMounted(() => {
  // Update to real value only on client
  // This prevents hydration mismatch
  currentTime.value = new Date().toLocaleTimeString()
})
</script>

<template>
  <!-- Renders null on server, then updates on client -->
  <span v-if="currentTime">{{ currentTime }}</span>
  <span v-else>Loading...</span>
</template>
```

## 参考
- [Vue.js SSR 指南](https://vuejs.org/guide/scaling-up/ssr.html)
- [Nuxt.js 生命周期](https://nuxt.com/docs/api/composables/use-nuxt-app#lifecycle-hooks)
- [Vue SSR 水合](https://vuejs.org/guide/scaling-up/ssr.html#client-hydration)
