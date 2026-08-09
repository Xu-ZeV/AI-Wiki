---
title: 状态管理策略
impact: HIGH
impactDescription: Choosing the wrong store pattern can cause SSR request leaks, brittle mutation flows, and poor scaling
type: best-practice
tags: [vue3, state-management, pinia, composables, ssr, vueuse]
---

# 状态管理策略

**影响：高** - 使用适合您的应用程序架构的最轻状态解决方案。仅 SPA 应用程序可以使用轻量级全局可组合函数，而 SSR/Nuxt 应用程序应默认使用 Pinia，以实现请求安全隔离和可预测工具。

## 任务列表

- 首先保持状态本地，然后仅在需要时提升为共享/全局
- 仅在非 SSR 应用程序中使用单例可组合函数
- 将全局状态公开为只读并通过显式操作进行变异
- 更喜欢 Pinia 来满足 SSR/Nuxt、大型应用程序和高级调试/插件需求
- 避免直接导出可变的模块级反应状态

## 选择最轻的存储方式

- **可组合功能：** 具有本地/功能级状态的可重用逻辑的默认值。
- **单例可组合或 VueUse `createGlobalState`：** 需要共享应用程序状态的小型非 SSR 应用程序。
- **Pinia：** SSR/Nuxt 应用程序、中型到大型应用程序以及需要开发工具、插件或操作跟踪的案例。

## 避免导出可变模块状态

**不好：**
```ts
// store/cart.ts
import { reactive } from 'vue'

export const cart = reactive({
  items: [] as Array<{ id: string; qty: number }>
})
```

**好：**
```ts
// composables/useCartStore.ts
import { reactive, readonly } from 'vue'

let _store: ReturnType<typeof createCartStore> | null = null

function createCartStore() {
  const state = reactive({
    items: [] as Array<{ id: string; qty: number }>
  })

  function addItem(id: string, qty = 1) {
    const existing = state.items.find((item) => item.id === id)
    if (existing) {
      existing.qty += qty
      return
    }
    state.items.push({ id, qty })
  }

  return {
    state: readonly(state),
    addItem
  }
}

export function useCartStore() {
  if (!_store) _store = createCartStore()
  return _store
}
```

## 不要在 SSR 中使用运行时单例

模块单例在运行时生命周期内有效。在 SSR 中，这可能会泄漏请求之间的状态。

**不好：**
```ts
// shared singleton reused across requests
const cartStore = useCartStore()

export function useServerCart() {
  return cartStore
}
```

**好：**

> 需要 `pinia` 依赖项。

```ts
// stores/cart.ts
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as Array<{ id: string; qty: number }>
  }),
  actions: {
    addItem(id: string, qty = 1) {
      const existing = this.items.find((item) => item.id === id)
      if (existing) {
        existing.qty += qty
        return
      }
      this.items.push({ id, qty })
    }
  }
})
```

## 使用 `createGlobalState` 进行小型 SPA 全局状态

> 需要 `@vueuse/core` 依赖项。

如果应用程序是非 SSR 并且已经使用 VueUse，则 `createGlobalState` 会删除单例样板。

```ts
import { createGlobalState } from '@vueuse/core'
import { computed, ref } from 'vue'

export const useAuthState = createGlobalState(() => {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => token.value !== null)

  function setToken(next: string | null) {
    token.value = next
  }

  return {
    token,
    isAuthenticated,
    setToken
  }
})
```
