---
title: 仅在设置上下文中同步调用可组合函数
impact: HIGH
impactDescription: Composables called outside setup context or asynchronously fail to register lifecycle hooks and may cause memory leaks
type: gotcha
tags: [vue3, composables, composition-api, setup, async, lifecycle]
---

# 仅在设置上下文中同步调用可组合函数

**影响：高** - 可组合函数必须在 `<script setup>`、`setup()` 函数或生命周期挂钩内同步调用。在回调中或外部组件上下文中异步调用可组合函数（在等待之后）会阻止 Vue 将生命周期挂钩与组件实例关联，从而导致静默失败。

这很重要，因为可组合函数经常在内部注册 `onMounted` 和 `onUnmounted` 挂钩。如果在错误的上下文中调用，这些钩子永远不会注册，从而导致未初始化状态或内存泄漏。

## 任务清单

- [ ] 调用 `<script setup>` 或 `setup()` 顶层的所有可组合函数
- [ ] 切勿在异步回调、setTimeout 或 Promise.then 内调用可组合函数
- [ ] 切勿有条件地调用可组合函数 (if/else) - 无条件调用并处理内部条件
- [ ] 切勿在循环内调用可组合函数 - 重组以使用数组数据调用一次
- [ ] 例外：可组合函数可以在生命周期挂钩中调用，例如 `onMounted`

**错误：**
```vue
<script setup>
import { useFetch } from './composables/useFetch'
import { useAuth } from './composables/useAuth'

// WRONG: Composable called after await
const config = await loadConfig()
const { data } = useFetch(config.apiUrl)  // Lifecycle hooks won't register!

// WRONG: Composable called conditionally
if (someCondition) {
  const { user } = useAuth()  // Inconsistent hook registration!
}

// WRONG: Composable called in callback
setTimeout(() => {
  const { data } = useFetch('/api/delayed')  // No component context!
}, 1000)

// WRONG: Composable called in loop
for (const url of urls) {
  const { data } = useFetch(url)  // Creates multiple instances incorrectly
}
</script>
```

**正确：**
```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useFetch } from './composables/useFetch'
import { useAuth } from './composables/useAuth'

// CORRECT: Call composables synchronously at top level
const { user, isAuthenticated } = useAuth()
const apiUrl = ref('/api/default')
const { data, execute } = useFetch(apiUrl)

// Handle async config loading differently
onMounted(async () => {
  const config = await loadConfig()
  apiUrl.value = config.apiUrl  // Update the ref, composable reacts
})

// CORRECT: Handle condition inside, not outside
const showUserData = computed(() => isAuthenticated.value && someCondition)

// CORRECT: For multiple URLs, use a different pattern
const urls = ref(['/api/a', '/api/b', '/api/c'])
const results = ref([])

// Either fetch in onMounted or use a composable designed for arrays
onMounted(async () => {
  results.value = await Promise.all(urls.value.map(url => fetch(url)))
})
</script>
```

## 异常：调用生命周期挂钩

可组合函数可以在生命周期挂钩内调用，因为 Vue 维护组件上下文：

```vue
<script setup>
import { onMounted } from 'vue'
import { useEventListener } from '@vueuse/core'

// CORRECT: Called in lifecycle hook - component context is available
onMounted(() => {
  // This works because we're still in the component's execution context
  useEventListener(document, 'visibilitychange', handleVisibility)
})
</script>
```

## 特殊情况：`<script setup>` 中的异步设置

`<script setup>` 中的顶级等待是特殊的 - Vue 的编译器自动保留上下文：

```vue
<script setup>
import { useFetch } from './composables/useFetch'

// CORRECT: Top-level await in <script setup> preserves context
// Vue compiler handles this specially
const config = await loadConfig()
const { data } = useFetch(config.apiUrl)  // This works!

// But nested awaits still break context:
async function initLater() {
  await delay(1000)
  const { data } = useFetch('/api/late')  // WRONG: This won't work!
}
</script>
```

## 为什么这很重要

当您调用可组合函数时，Vue 需要知道将其与哪个组件实例关联。这种关联通过仅在同步安装执行期间设置的内部“当前实例”发生。

```javascript
// Inside a composable
export function useFetch(url) {
  const data = ref(null)

  // These need the current component instance!
  onMounted(() => { /* ... */ })
  onUnmounted(() => { /* cleanup */ })

  // If called outside setup context, Vue can't find the instance
  // and these hooks are silently ignored
  return { data }
}
```

## 参考
- [Vue.js 可组合函数 - 使用限制](https://vuejs.org/guide/reusability/composables.html#usage-restrictions)
- [Vue.js 组合 API - 设置上下文](https://vuejs.org/api/composition-api-setup.html)
