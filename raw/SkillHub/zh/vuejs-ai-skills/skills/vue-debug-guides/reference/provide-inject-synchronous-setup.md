---
title: Provide 必须在设置过程中同步调用
impact: HIGH
impactDescription: Calling provide() asynchronously or conditionally may fail silently or cause inconsistent injection behavior
type: gotcha
tags: [vue3, provide-inject, composition-api, async, setup]
---

# Provide 必须在安装过程中同步调用

**影响：高** - 必须在组件的 `setup()` 阶段同步调用 `provide()` 函数。异步调用它（在回调、promise 内或在等待之后）将默默失败，并且后代组件将不会收到提供的值。

## 任务清单

- [ ] 始终在 `setup()` 或 `<script setup>` 的顶层调用 `provide()`
- [ ] 切勿在异步回调内或await语句之后调用`provide()`
- [ ] 对于异步数据，先提供引用，然后更新其值
- [ ] 将立即 `provide()` 与响应式容器一起用于动态数据

## 问题：异步提供无提示地失败

**错误 - 在异步操作后提供：**
```vue
<script setup>
import { provide } from 'vue'

// WRONG: provide() called after await - will NOT work
onMounted(async () => {
  const userData = await fetchUser()
  provide('user', userData) // Silent failure!
})
</script>
```

**错误 - 提供内部回调：**
```vue
<script setup>
import { provide } from 'vue'

// WRONG: provide() inside callback - will NOT work
setTimeout(() => {
  provide('config', { theme: 'dark' }) // Silent failure!
}, 0)
</script>
```

**错误 - 在设置中等待后提供：**
```vue
<script setup>
import { provide } from 'vue'

const response = await fetch('/api/config')
const config = await response.json()

// WRONG: This is after an await, setup context may be lost
provide('config', config) // May not work reliably
</script>
```

## 解决方案：同步提供，异步更新

**正确 - 立即提供参考，稍后更新：**
```vue
<script setup>
import { provide, ref, onMounted } from 'vue'

// Provide immediately with initial value
const user = ref(null)
const isLoading = ref(true)
const error = ref(null)

provide('userState', {
  user,
  isLoading,
  error
})

// Update the ref values asynchronously
onMounted(async () => {
  try {
    const userData = await fetchUser()
    user.value = userData
  } catch (e) {
    error.value = e
  } finally {
    isLoading.value = false
  }
})
</script>
```

```vue
<!-- Consumer component -->
<script setup>
import { inject } from 'vue'

const { user, isLoading, error } = inject('userState')
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>Welcome, {{ user?.name }}</div>
</template>
```

## 模式：异步数据提供者

为异步提供的数据创建可重用模式：

```vue
<!-- AsyncDataProvider.vue -->
<script setup>
import { provide, ref, onMounted, watch } from 'vue'

const props = defineProps({
  fetchFn: {
    type: Function,
    required: true
  },
  provideKey: {
    type: [String, Symbol],
    required: true
  },
  immediate: {
    type: Boolean,
    default: true
  }
})

const data = ref(null)
const isLoading = ref(false)
const error = ref(null)

async function load() {
  isLoading.value = true
  error.value = null

  try {
    data.value = await props.fetchFn()
  } catch (e) {
    error.value = e
  } finally {
    isLoading.value = false
  }
}

// Provide synchronously
provide(props.provideKey, {
  data,
  isLoading,
  error,
  reload: load
})

// Fetch asynchronously
if (props.immediate) {
  onMounted(load)
}
</script>

<template>
  <slot />
</template>
```

用途：

```vue
<template>
  <AsyncDataProvider
    :fetch-fn="() => api.getUser(userId)"
    provide-key="userData"
  >
    <UserProfile />
  </AsyncDataProvider>
</template>
```

## 为什么会发生这种情况

Vue 的 `provide()` 依赖于当前组件实例上下文，该上下文仅在设置期间同步可用。设置完成后：

1.设置上下文被清除
2. `provide()` 找不到当前实例
3. 调用静默失败（不抛出错误）

## 检查设置上下文

您可以验证设置上下文是否可用：

```js
import { getCurrentInstance } from 'vue'

function debugProvide(key, value) {
  const instance = getCurrentInstance()

  if (!instance) {
    console.error(
      `provide() called outside setup context. ` +
      `Key: ${String(key)}. This will fail silently.`
    )
    return
  }

  provide(key, value)
}
```

## 应用程序级提供（例外）

`app.provide()` 可以在应用程序初始化期间随时调用：

```js
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// This works - app-level provide
app.provide('appConfig', { version: '1.0.0' })

// Even async is OK at app level before mount
fetchConfig().then(config => {
  app.provide('apiConfig', config)
  app.mount('#app')
})
```

但是一旦安装了应用程序，就不应调用 `app.provide()`。

## 参考
- [Vue.js 组合 API - 提供()](https://vuejs.org/api/composition-api-dependency-injection.html#provide)
- [Vue.js 提供/注入指南](https://vuejs.org/guide/components/provide-inject.html)
