---
title: 清理侦听器中的异步操作以防止竞争条件
impact: HIGH
impactDescription: Stale async requests can overwrite newer data, causing incorrect UI state and hard-to-debug issues
type: capability
tags: [vue3, watch, watchers, async, cleanup, race-condition, abort]
---

# 清理侦听器中的异步操作以防止竞争情况

**影响：高** - 当监视值快速变化时，多个异步操作会同时运行。如果不进行清理，较慢的较早请求可能会在较快的较晚请求之后完成，从而用过时的结果覆盖当前数据。

当观察程序重新运行或组件卸载时，始终使用 `onWatcherCleanup` 或 `onCleanup` 回调参数取消挂起的异步操作。

## 任务清单

- [ ] 在异步侦听器中使用 `onWatcherCleanup()` 或 `onCleanup` 参数
- [ ] 使用 `AbortController` 取消挂起的获取请求
- [ ] 取消清理中的任何 setTimeout/setInterval 调用
- [ ] 使用标志使先前的异步操作结果无效
- [ ] 在获取之前考虑消除快速变化

**错误：**
```javascript
import { ref, watch } from 'vue'

const searchQuery = ref('')
const results = ref([])

// BAD: Race condition - slow request for "a" can finish after fast request for "ab"
watch(searchQuery, async (query) => {
  if (query) {
    const response = await fetch(`/api/search?q=${query}`)
    results.value = await response.json()  // May overwrite newer results!
  }
})

// BAD: No cleanup for timeouts
watch(searchQuery, (query) => {
  // Previous timeout keeps running even when query changes
  setTimeout(() => {
    performExpensiveSearch(query)
  }, 500)
})
```

**正确：**
```javascript
import { ref, watch, onWatcherCleanup } from 'vue'

const searchQuery = ref('')
const results = ref([])
const loading = ref(false)

// CORRECT: Using onWatcherCleanup (Vue 3.5+)
watch(searchQuery, async (query) => {
  if (!query) {
    results.value = []
    return
  }

  const controller = new AbortController()

  // Register cleanup to abort on re-run or unmount
  onWatcherCleanup(() => {
    controller.abort()
  })

  loading.value = true
  try {
    const response = await fetch(`/api/search?q=${query}`, {
      signal: controller.signal
    })
    results.value = await response.json()
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('Search failed:', err)
    }
  } finally {
    loading.value = false
  }
})
```

## 使用 onCleanup 参数

```javascript
import { ref, watch } from 'vue'

const userId = ref(1)
const userData = ref(null)

// CORRECT: Using onCleanup callback parameter
watch(userId, (newId, oldId, onCleanup) => {
  const controller = new AbortController()

  fetch(`/api/users/${newId}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      userData.value = data
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err)
      }
    })

  onCleanup(() => {
    controller.abort()
  })
})
```

## 超时清理

```javascript
import { ref, watch, onWatcherCleanup } from 'vue'

const input = ref('')

// CORRECT: Cancel previous timeout on new input
watch(input, (value) => {
  const timeoutId = setTimeout(() => {
    performExpensiveOperation(value)
  }, 300)

  onWatcherCleanup(() => {
    clearTimeout(timeoutId)
  })
})
```

## 失效标志模式

```javascript
import { ref, watch } from 'vue'

const id = ref(1)
const data = ref(null)

// CORRECT: Invalidation flag for non-abortable operations
watch(id, async (newId, oldId, onCleanup) => {
  let cancelled = false

  onCleanup(() => {
    cancelled = true
  })

  const result = await someNonAbortableAsyncOperation(newId)

  // Check if this watch run is still valid
  if (!cancelled) {
    data.value = result
  }
})
```

## watchEffect 清理

```javascript
import { ref, watchEffect, onWatcherCleanup } from 'vue'

const resourceId = ref('abc')

watchEffect(async () => {
  const id = resourceId.value
  const controller = new AbortController()

  onWatcherCleanup(() => {
    controller.abort()
  })

  const data = await fetchResource(id, { signal: controller.signal })
  processData(data)
})
```

## 参考
- [Vue.js 侦听器 - 回调刷新计时](https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing)
- [Vue.js 侦听器 - 副作用清理](https://vuejs.org/api/reactivity-core.html#watcheffect)
