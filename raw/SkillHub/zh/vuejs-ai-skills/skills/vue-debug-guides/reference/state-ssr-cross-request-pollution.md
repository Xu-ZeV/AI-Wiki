---
title: 防止SSR应用程序中的交叉请求状态污染
impact: CRITICAL
impactDescription: Singleton stores in SSR share state across all server requests, potentially leaking user data between requests
type: gotcha
tags: [vue3, ssr, state-management, pinia, vuex, security, server-side-rendering, nuxt]
---

# 防止SSR应用中的交叉请求状态污染

**影响：严重** - 在服务器端渲染 (SSR) 应用程序中，单例存储模式创建在所有服务器请求之间共享的单个实例。这意味着一个用户请求的数据可能会泄漏到另一用户的响应中，从而导致严重的安全和数据完整性问题。

这是 Vue 状态管理中最关键的问题之一，可能会产生严重的生产后果。

## 任务清单

- [ ] 切勿在 SSR 应用程序中使用单例存储模式
- [ ] 使用 SSR 时为每个请求创建一个新的存储实例
- [ ] 使用 Pinia 正确处理 SSR 状态管理
- [ ] 测试并发请求的SSR状态隔离
- [ ] 检查任何全局反应状态以实现 SSR 兼容性

## 问题：SSR 中的单例状态

```javascript
// store.js - DANGEROUS for SSR
import { reactive } from 'vue'

// This is a singleton - same instance for ALL requests
export const store = reactive({
  user: null,
  cart: [],
  preferences: {}
})
```

**SSR 中会发生什么：**

1. 用户A收到请求A
2.服务器组`store.user = userA`
3. 在响应完成之前，请求 B 到达用户 B
4.请求B看到`store.user = userA`（用户A的数据泄露！）
5.服务器组`store.user = userB`
6. 请求 A 的响应现在可能包含用户 B 的数据

这会产生不可预测的行为和潜在的安全漏洞。

## 解决方案 1：使用 Pinia（推荐）

Pinia 通过为每个请求创建新的存储实例来正确处理 SSR：

```javascript
// stores/user.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    preferences: {}
  }),
  actions: {
    setUser(user) {
      this.user = user
    }
  }
})
```

```javascript
// main.js (or entry-server.js)
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

// For SSR: Create fresh instances per request
export function createAppInstance() {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)

  return { app, pinia }
}
```

```javascript
// entry-server.js
import { createAppInstance } from './main'
import { renderToString } from 'vue/server-renderer'

export async function render(url, context) {
  // Fresh app and store instance per request
  const { app, pinia } = createAppInstance()

  // ... setup router, fetch data, etc.

  const html = await renderToString(app)

  // Serialize state for client hydration
  const state = pinia.state.value

  return { html, state }
}
```

```javascript
// entry-client.js - Hydrate from serialized state
import { createAppInstance } from './main'

const { app, pinia } = createAppInstance()

// Restore server state before mounting
if (window.__PINIA_STATE__) {
  pinia.state.value = window.__PINIA_STATE__
}

app.mount('#app')
```

## 方案二：手卷状态的工厂模式

如果不使用 Pinia，请创建一个工厂函数：

```javascript
// store.js - SSR-safe with factory
import { reactive, readonly } from 'vue'

// Factory function creates fresh state per call
export function createStore() {
  const state = reactive({
    user: null,
    cart: [],
    preferences: {}
  })

  return {
    state: readonly(state),
    setUser(user) {
      state.user = user
    },
    addToCart(item) {
      state.cart.push(item)
    }
  }
}
```

```javascript
// entry-server.js
import { createStore } from './store'
import { provide } from 'vue'

export async function render(url) {
  const app = createApp(App)

  // Fresh store instance for this request only
  const store = createStore()
  app.provide('store', store)

  // ... render
}
```

## 解决方案 3：基于上下文的状态（高级）

对于像 Nuxt 这样的框架，使用请求上下文：

```javascript
// composables/useRequestState.js
import { useSSRContext } from 'vue'

export function useRequestState(key, initialValue) {
  if (import.meta.env.SSR) {
    const ctx = useSSRContext()
    ctx.state = ctx.state || {}

    if (!(key in ctx.state)) {
      ctx.state[key] = initialValue()
    }

    return ctx.state[key]
  }

  // Client-side: use regular reactive state
  return reactive(initialValue())
}
```

## Nuxt.js 自动处理这个问题

在 Nuxt 3 中，状态隔离是自动处理的：

```javascript
// Nuxt automatically creates fresh Pinia instance per request
// You can use stores normally

export default defineNuxtPlugin(async (nuxtApp) => {
  const userStore = useUserStore()
  await userStore.fetchUser()
})
```

## 状态污染测试

```javascript
// test/ssr-state-isolation.test.js
import { describe, it, expect } from 'vitest'
import { render } from './entry-server'

describe('SSR State Isolation', () => {
  it('should not leak state between concurrent requests', async () => {
    // Simulate concurrent requests
    const [result1, result2] = await Promise.all([
      render('/user/1', { userId: '1' }),
      render('/user/2', { userId: '2' })
    ])

    // Each should have their own user data
    expect(result1.html).toContain('User 1')
    expect(result2.html).toContain('User 2')

    // State should not be mixed
    expect(result1.html).not.toContain('User 2')
    expect(result2.html).not.toContain('User 1')
  })
})
```

```javascript
// Alternative: Test store isolation directly
import { createApp } from './app.js'

test('requests do not share state', async () => {
  // Simulate two concurrent requests
  const { app: app1, store: store1 } = createApp()
  const { app: app2, store: store2 } = createApp()

  store1.user = { id: 1, name: 'Alice' }
  store2.user = { id: 2, name: 'Bob' }

  // Each should have its own state
  expect(store1.user.name).toBe('Alice')
  expect(store2.user.name).toBe('Bob')
})
```

## 需要注意的危险信号

```javascript
// ANY module-level reactive state is dangerous in SSR

// BAD: Module-level reactive
export const globalUser = ref(null)

// BAD: Module-level reactive object
export const appState = reactive({})

// BAD: Shared Map/Set
export const cache = new Map()

// BAD: Even plain objects can be problematic
let requestCount = 0  // Shared across requests
```

## 为什么 Pinia 被推荐用于 SSR

1. **自动请求隔离** - 每个请求的新鲜store 实例
2. **内置状态序列化** - 客户端轻松水合
3. **DevTools 支持** - 服务器和客户端上的调试状态
4. **TypeScript 支持** - 类型安全状态管理
5. **经过测试的模式** - 经过实战考验的 SSR 操控

## 参考
- [Vue.js状态管理-SSR注意事项](https://vuejs.org/guide/scaling-up/state-management.html#ssr-considerations)
- [Pinia SSR指南](https://pinia.vuejs.org/ssr/)
- [Vue SSR指南](https://vuejs.org/guide/scaling-up/ssr.html)
