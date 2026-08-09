---
title: Guard 通用 SSR 代码中特定于平台的 API
impact: HIGH
impactDescription: Accessing browser-only APIs on server causes crashes; Node.js APIs fail in browser
type: gotcha
tags: [vue3, ssr, browser-api, nodejs, universal, isomorphic, server-side-rendering]
---

# 在通用 SSR 代码中保护平台特定的 API

**影响：高** - SSR 应用程序在服务器 (Node.js) 和客户端（浏览器）上运行相同的代码。 Node.js 中不存在 `window`、`document` 和 `localStorage` 等浏览器 API，并且会抛出 `ReferenceError`。同样，`fs` 和 `process` 等 Node.js API 在浏览器中也不可用。

通用/同构代码必须保护特定于平台的 API 访问或使用在两个平台上工作的库。

## 任务清单

- [ ] 切勿访问 `setup()` 或 `created()` 中的 `window`、`document`、`navigator`
- [ ] 将浏览器 API 访问移至 `onMounted()` 生命周期挂钩
- [ ] 在生命周期之外需要时使用 `typeof window !== 'undefined'` 防护
- [ ] 使用跨平台库来实现通用功能（获取、存储）
- [ ] 在 Nuxt 项目中使用 Nuxt 的 `process.client` / `process.server` 防护

## 破坏 SSR 的常见浏览器 API

|应用程序接口 | Node.js 行为 |
|-----|-----------------|
| `window` | `ReferenceError: window is not defined` |
| `document` | `ReferenceError: document is not defined` |
| `localStorage` / `sessionStorage` | `ReferenceError` |
| `navigator` | `ReferenceError` |
| `location` | `ReferenceError` |
| `history` | `ReferenceError` |
| `alert` / `confirm` / `prompt` | `ReferenceError` |
| `requestAnimationFrame` | `ReferenceError` |
| `IntersectionObserver` | `ReferenceError` |
| `ResizeObserver` | `ReferenceError` |

**不正确 - 服务器崩溃：**
```javascript
// WRONG: These run during setup/SSR - crashes in Node.js
const width = ref(window.innerWidth)
const theme = localStorage.getItem('theme')
const userAgent = navigator.userAgent
```

```vue
<script setup>
import { ref } from 'vue'

// WRONG: Runs on server, crashes
const scrollY = ref(window.scrollY)

// WRONG: document doesn't exist on server
document.title = 'My Page'
</script>
```

**正确 - 使用 onMounted:**
```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Safe defaults that work on server
const width = ref(0)
const theme = ref('light')
const scrollY = ref(0)

onMounted(() => {
  // Browser APIs only accessed after mount (client-only)
  width.value = window.innerWidth
  theme.value = localStorage.getItem('theme') || 'light'
  scrollY.value = window.scrollY

  // Event listeners safe in mounted
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})

function handleResize() {
  width.value = window.innerWidth
}

function handleScroll() {
  scrollY.value = window.scrollY
}
</script>
```

**正确 - 防护类型为：**
```javascript
// When you need to check outside lifecycle hooks
function getStoredValue(key, defaultValue) {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem(key) ?? defaultValue
  }
  return defaultValue
}

// Composable with SSR awareness
export function useMediaQuery(query) {
  const matches = ref(false)

  // Only run on client
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches

    // Setup listener in lifecycle
    onMounted(() => {
      const handler = (e) => { matches.value = e.matches }
      mediaQuery.addEventListener('change', handler)
      onUnmounted(() => mediaQuery.removeEventListener('change', handler))
    })
  }

  return matches
}
```

## Nuxt.js 守卫

```vue
<script setup>
// Nuxt provides process.client and process.server
if (process.client) {
  // Only runs in browser
  window.analytics.track('page_view')
}

if (process.server) {
  // Only runs on server
  console.log('Rendering on server')
}
</script>
```

```vue
<template>
  <!-- ClientOnly component for client-only rendering -->
  <ClientOnly>
    <BrowserOnlyChart :data="chartData" />
    <template #fallback>
      <ChartSkeleton />
    </template>
  </ClientOnly>
</template>
```

## 跨平台库

使用抽象平台差异的库：

```javascript
// Fetch - works in both Node.js 18+ and browsers
const response = await fetch('/api/data')

// For older Node.js, use node-fetch or axios
import axios from 'axios'
const { data } = await axios.get('/api/data')
```

```javascript
// Universal cookie handling
import Cookies from 'js-cookie' // Client only
import { parse } from 'cookie' // Works both

// In Nuxt, use useCookie()
const token = useCookie('auth-token')
```

## 在浏览器中损坏的常见 Node.js API

|应用程序接口 |浏览器行为 |
|-----|-----------------|
| `fs` |找不到模块 |
| `path` |找不到模块 |
| `process`（完整）|未定义或有限 |
| `Buffer` |未定义（除非填充）|
| `__dirname` / `__filename` |未定义 |
| `require()` | ES 模块中未定义 |

**错误：**
```javascript
// WRONG: Node.js APIs in universal code
import fs from 'fs'
const config = JSON.parse(fs.readFileSync('./config.json'))
```

**正确 - 单独的服务器代码：**
```javascript
// server/utils.js - Server-only file
import fs from 'fs'
export function loadConfig() {
  return JSON.parse(fs.readFileSync('./config.json'))
}

// app.js - Universal code uses API instead
const config = await fetch('/api/config').then(r => r.json())
```

## 环境检测实用程序

```javascript
// utils/environment.js
export const isClient = typeof window !== 'undefined'
export const isServer = !isClient

export const isBrowser = isClient && typeof document !== 'undefined'
export const isNode = typeof process !== 'undefined' &&
                      process.versions?.node != null

// Usage
import { isClient, isServer } from '@/utils/environment'

if (isClient) {
  // Browser-specific code
}
```

## 第三方库问题

一些库在导入时自动访问浏览器 API：

```javascript
// WRONG: Library accesses window on import
import SomeChartLibrary from 'some-chart-library'
// ^ Crashes on server if library does: const x = window.something
```

**正确 - 动态导入：**
```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// Dynamic import only loads on client
const Chart = defineAsyncComponent(() =>
  import('some-chart-library').then(m => m.ChartComponent)
)
</script>

<template>
  <ClientOnly>
    <Chart :data="data" />
  </ClientOnly>
</template>
```

## 参考
- [Vue.js SSR - 特定于平台的 API](https://vuejs.org/guide/scaling-up/ssr.html#access-to-platform-specific-apis)
- [Nuxt客户端仅组件](https://nuxt.com/docs/api/components/client-only)
- [MDN：Web API](https://developer.mozilla.org/en-US/docs/Web/API)
