---
title: 异步创建的侦听器必须手动停止
impact: HIGH
impactDescription: Async-created watchers are not bound to component lifecycle and cause memory leaks
type: capability
tags: [vue3, watch, watchers, async, memory-leak, lifecycle, cleanup]
---

# 异步创建的侦听器必须手动停止

**影响：高** - 在异步回调（setTimeout、Promise.then、async/await）内创建的侦听器不会自动绑定到组件实例。它们在组件卸载后继续运行，导致内存泄漏和错误。

始终手动停止异步创建的观察程序，或重构代码以使用条件逻辑同步创建观察程序。

## 任务清单

- [ ] 尽可能在 setup() 或生命周期挂钩中同步创建侦听器
- [ ] 如果异步创建不可避免，则存储并调用 unwatch 函数
- [ ] 使用 `onUnmounted` 清理异步创建的侦听器
- [ ] 考虑在同步观察器中使用条件逻辑
- [ ] 在 setTimeout、Promise 回调和等待之后注意这种模式

**错误：**
```vue
<script setup>
import { ref, watch, watchEffect, onMounted } from 'vue'

const data = ref(null)

// BAD: Watcher created in setTimeout won't auto-stop
onMounted(() => {
  setTimeout(() => {
    watchEffect(() => {
      console.log(data.value)  // Keeps running after unmount!
    })
  }, 1000)
})

// BAD: Watcher created after await won't auto-stop
onMounted(async () => {
  await loadInitialData()

  // This watcher is NOT bound to component lifecycle
  watch(data, (newVal) => {
    processData(newVal)  // Memory leak!
  })
})

// BAD: Watcher in Promise callback
fetch('/api/config').then(() => {
  watch(data, () => {
    // Leaks memory!
  })
})
</script>
```

**正确：**
```vue
<script setup>
import { ref, watch, watchEffect, onMounted, onUnmounted } from 'vue'

const data = ref(null)
const isDataLoaded = ref(false)
let asyncWatcherCleanup = null

// CORRECT: Synchronous watcher with conditional logic
watch(
  data,
  (newVal) => {
    if (isDataLoaded.value && newVal) {
      processData(newVal)
    }
  }
)

onMounted(async () => {
  await loadInitialData()
  isDataLoaded.value = true
})

// CORRECT: Manual cleanup for async-created watcher
onMounted(() => {
  setTimeout(() => {
    const unwatch = watchEffect(() => {
      console.log(data.value)
    })

    // Store for cleanup
    asyncWatcherCleanup = unwatch
  }, 1000)
})

onUnmounted(() => {
  // Clean up async watcher
  if (asyncWatcherCleanup) {
    asyncWatcherCleanup()
  }
})
</script>
```

## 首选模式：条件观察逻辑

```vue
<script setup>
import { ref, watch, onMounted } from 'vue'

const config = ref(null)
const userData = ref(null)

// BEST: Create watcher synchronously, handle async condition inside
watch(
  userData,
  (newData) => {
    // Only process when config is loaded
    if (config.value && newData) {
      applyUserSettings(config.value, newData)
    }
  }
)

onMounted(async () => {
  config.value = await fetchConfig()
  // Watcher will start processing once config is loaded
})
</script>
```

## 将 watchEffect 与条件逻辑结合使用

```vue
<script setup>
import { ref, watchEffect, onMounted } from 'vue'

const apiData = ref(null)
const isReady = ref(false)

// GOOD: Synchronous watchEffect with condition
watchEffect(() => {
  if (isReady.value && apiData.value) {
    // This pattern avoids async watcher creation
    doSomethingWithData(apiData.value)
  }
})

onMounted(async () => {
  apiData.value = await fetchData()
  isReady.value = true
})
</script>
```

## 跟踪多个异步侦听器

```vue
<script setup>
import { ref, watch, onUnmounted } from 'vue'

const unwatchers = []

function createDynamicWatcher(source, callback) {
  const unwatch = watch(source, callback)
  unwatchers.push(unwatch)
  return unwatch
}

// Clean up all dynamic watchers
onUnmounted(() => {
  unwatchers.forEach(unwatch => unwatch())
})
</script>
```

## 参考
- [Vue.js 侦听器 - 停止侦听器](https://vuejs.org/guide/essentials/watchers.html#stopping-a-watcher)
