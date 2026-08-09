---
title: 返回 Pinia 设置存储中的所有状态属性
impact: HIGH
impactDescription: Not returning state properties in setup stores breaks SSR, DevTools, and plugin compatibility
type: gotcha
tags: [vue3, pinia, state-management, setup-stores, ssr, devtools]
---

# 返回 Pinia 设置存储中的所有状态属性

**影响：高** - 使用 Pinia 的设置存储语法（Composition API 样式）时，您必须从设置函数返回所有状态属性。未返回的私有状态将破坏服务器端渲染 (SSR)、Vue DevTools 检查和 Pinia 插件。

这是一个关键问题，可能会导致生产中出现无声故障。

## 任务清单

- [ ] 从设置存储返回所有反应状态属性
- [ ] 不要通过从返回中省略它来创建“私有”状态
- [ ] 如果您需要私有状态，请使用前缀约定（例如，`_internal`）
- [ ] 使用 DevTools 测试存储以验证所有状态是否可见
- [ ] 验证 SSR 水合包括所有必要的状态

## 问题：安装存储中的私有状态

```javascript
// stores/user.js - WRONG: Private state breaks SSR/DevTools
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Public state
  const name = ref('')
  const email = ref('')

  // "Private" state - NOT returned
  const authToken = ref('')  // Won't be serialized for SSR!
  const lastFetchTime = ref(null)  // Won't appear in DevTools!

  const isLoggedIn = computed(() => !!authToken.value)

  async function login(credentials) {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    const data = await response.json()

    authToken.value = data.token  // This state won't transfer to client in SSR!
    name.value = data.name
    email.value = data.email
    lastFetchTime.value = Date.now()
  }

  // WRONG: Not returning authToken and lastFetchTime
  return {
    name,
    email,
    isLoggedIn,
    login
  }
})
```

**什么会破坏：**

1. **SSR Hydration**：`authToken` 和 `lastFetchTime` 不会被序列化发送给客户端
2. **DevTools**：这些属性不会出现在store 检查器中
3. **插件**：持久性插件不会保存这些属性
4. **时间旅行调试**：无法跟踪隐藏状态的更改

## 解决方案：返回所有内容

```javascript
// stores/user.js - CORRECT: All state returned
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // All state properties
  const name = ref('')
  const email = ref('')
  const authToken = ref('')
  const lastFetchTime = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!authToken.value)

  // Actions
  async function login(credentials) {
    const response = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
    const data = await response.json()

    authToken.value = data.token
    name.value = data.name
    email.value = data.email
    lastFetchTime.value = Date.now()
  }

  function logout() {
    authToken.value = ''
    name.value = ''
    email.value = ''
  }

  // CORRECT: Return ALL state, getters, and actions
  return {
    // State
    name,
    email,
    authToken,
    lastFetchTime,
    // Getters
    isLoggedIn,
    // Actions
    login,
    logout
  }
})
```

## 如果您需要“私有”状态

使用命名约定而不是实际隐藏状态：

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // Convention: underscore prefix for "internal" state
  // Still returned, but signals it's not for external use
  const _authToken = ref('')
  const _lastFetchTime = ref(null)

  // Public state
  const name = ref('')
  const email = ref('')

  const isLoggedIn = computed(() => !!_authToken.value)

  // Return everything - convention communicates intent
  return {
    // "Private" - use with caution
    _authToken,
    _lastFetchTime,
    // Public
    name,
    email,
    isLoggedIn
  }
})
```

## Options store没有这个问题

使用Options API语法，所有状态都会被自动跟踪：

```javascript
// stores/user.js - Options syntax: all state is tracked automatically
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: '',
    authToken: '',  // Automatically included
    lastFetchTime: null  // Automatically included
  }),

  getters: {
    isLoggedIn: (state) => !!state.authToken
  },

  actions: {
    async login(credentials) {
      // ...
    }
  }
})
```

## 安装程序如何将映射存储到状态

了解映射有助于避免错误：

```javascript
defineStore('example', () => {
  // ref() becomes state
  const count = ref(0)  // → state.count

  // computed() becomes getters
  const double = computed(() => count.value * 2)  // → getters.double

  // Regular functions become actions
  function increment() {  // → actions.increment
    count.value++
  }

  // CRITICAL: Must return all of them
  return { count, double, increment }
})
```

## 调试：验证所有状态均已返回

```javascript
// Test that DevTools can see all state
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// In DevTools console or tests:
console.log(userStore.$state)
// Should include ALL reactive state properties

// Check what's returned
console.log(Object.keys(userStore))
// Should include: name, email, authToken, lastFetchTime, isLoggedIn, login, logout
```

## 参考
- [Pinia - 设置store](https://pinia.vuejs.org/core-concepts/#setup-stores)
- [Pinia - SSR](https://pinia.vuejs.org/ssr/)
- [掌握 Pinia - 常见错误](https://masteringpinia.com/blog/top-5-mistakes-to-avoid-when-using-pinia)
