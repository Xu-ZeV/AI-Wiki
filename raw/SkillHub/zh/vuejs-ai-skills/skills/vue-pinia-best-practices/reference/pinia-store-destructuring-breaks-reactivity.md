---
title: 解构 Pinia Store 时使用 storeToRefs
impact: HIGH
impactDescription: Destructuring Pinia stores directly breaks reactivity - state changes won't trigger UI updates
type: gotcha
tags: [vue3, pinia, state-management, reactivity, destructuring]
---

# 解构 Pinia Stores 时使用 storeToRefs

**影响：高** - Pinia store 用 `reactive` 包装，因此解构它们会直接提取非响应式值。对 store的更改不会反映在您的组件中，从而导致UI 不更新和令人困惑的错误。

这是使用 Pinia 时最常见的错误之一，特别是对于来自 Vuex 或其他状态管理库的开发者来说。

## 任务清单

- [ ] 切勿直接从 Pinia store解构状态或 getter
- [ ] 使用 `storeToRefs()` 提取反应态和吸气剂
- [ ] 直接解构动作（它们不需要响应式）
- [ ] 请记住：`storeToRefs` 用于状态/获取器，直接解构用于操作

## 问题：直接解构

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// WRONG: Direct destructuring breaks reactivity
const { name, email, isLoggedIn } = userStore

// Later, when store updates...
userStore.login({ name: 'John', email: 'john@example.com' })

// name and email are still the OLD values!
// UI won't update because these are no longer reactive
console.log(name) // undefined (or initial value)
</script>

<template>
  <!-- This won't update when store changes -->
  <div>{{ name }}</div>
</template>
```

## 解决方案：使用 storeToRefs

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// CORRECT: Use storeToRefs for state and getters
const { name, email, isLoggedIn } = storeToRefs(userStore)

// Actions can be destructured directly (they're just functions)
const { login, logout } = userStore

// Now when the store updates...
login({ name: 'John', email: 'john@example.com' })

// name and email are reactive refs that update automatically
console.log(name.value) // 'John'
</script>

<template>
  <!-- This updates reactively -->
  <div>{{ name }}</div>
  <button @click="logout">Logout</button>
</template>
```

## 理解为什么会发生这种情况

Pinia store是响应式对象（如 `reactive()`）。当你解构时：

```javascript
const store = useCounterStore()
// store is a reactive Proxy

const { count } = store
// count is now just a primitive number (0), not reactive
// It's like doing: const count = 0

// vs with storeToRefs
const { count } = storeToRefs(store)
// count is now a ref that stays connected to the store
// It's like: const count = computed(() => store.count)
```

## 完整模式：状态、获取器和操作

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'

const cartStore = useCartStore()

// State and getters: USE storeToRefs
const {
  items,           // state
  itemCount,       // getter
  totalPrice,      // getter
  isEmpty          // getter
} = storeToRefs(cartStore)

// Actions: destructure directly
const {
  addItem,
  removeItem,
  clearCart
} = cartStore
</script>

<template>
  <div v-if="isEmpty">Cart is empty</div>
  <div v-else>
    <p>{{ itemCount }} items - ${{ totalPrice }}</p>
    <ul>
      <li v-for="item in items" :key="item.id">
        {{ item.name }}
        <button @click="removeItem(item.id)">Remove</button>
      </li>
    </ul>
    <button @click="clearCart">Clear All</button>
  </div>
</template>
```

## 替代方案：不要解构

如果您愿意，您可以完全避免解构：

```vue
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
// Use userStore.name, userStore.login(), etc. directly
</script>

<template>
  <div>{{ userStore.name }}</div>
  <button @click="userStore.logout()">Logout</button>
</template>
```

这工作得很好，但对于模板中经常使用的store 来说更加冗长。

## 常见错误：将 storeToRefs 与 Actions 混合使用

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// WRONG: Don't include actions in storeToRefs
// Actions are just functions and storeToRefs will skip them anyway
const { name, login } = storeToRefs(userStore)
// login is undefined! Actions aren't included in storeToRefs result

// CORRECT: Separate state/getters from actions
const { name } = storeToRefs(userStore)
const { login } = userStore
</script>
```

## TypeScript 提示

使用 TypeScript，类型可以正常工作：

```typescript
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// name is Ref<string>, email is Ref<string>
const { name, email } = storeToRefs(userStore)

// login is (credentials: Credentials) => Promise<void>
const { login } = userStore
```

## 参考
- [Pinia - 从store解构](https://pinia.vuejs.org/core-concepts/#destructuring-from-a-store)
- [Pinia API - storeToRefs](https://pinia.vuejs.org/api/modules/pinia.html#storetorefs)
