---
title: script setup中的顶级等待保留组件上下文
impact: HIGH
impactDescription: Misunderstanding async context causes lifecycle hooks and watchers to silently fail
type: gotcha
tags: [vue3, composition-api, script-setup, async, await, suspense]
---

# script setup中的顶级等待保留组件上下文

**影响：高** - 在 `<script setup>` 中，顶级 `await` 语句保留组件上下文（允许 `await` 之后的生命周期挂钩和观察程序），但这是一种特殊情况。嵌套的异步函数或回调会丢失上下文，导致生命周期挂钩默默失败。

Vue 的编译器在 `<script setup>` 中的每个顶级等待之后自动注入上下文恢复。这不适用于 `setup()` 函数或嵌套异步上下文。

## 任务清单

- [ ] 了解`<script setup>`中的顶级await是经过特殊处理的
- [ ] 切勿在嵌套异步函数中注册生命周期钩子子
- [ ] 使用异步 `<script setup>` 组件时使用 `<Suspense>`
- [ ] 在常规`setup()`中，在生命周期钩子子注册之前切勿使用await
- [ ] 同步注册钩子，然后在其中执行异步工作

**顶级等待工作（仅限script setup）：**
```vue
<script setup>
import { ref, onMounted, watch } from 'vue'

// This is TOP-LEVEL await - Vue compiler preserves context
const config = await fetchConfig()  // OK!

// These hooks work because Vue restored context
onMounted(() => {
  console.log('This will run!')  // Works
})

watch(someRef, () => {
  console.log('This will track!')  // Works
})

// Another top-level await - still OK
const data = await fetchData(config.apiUrl)  // OK!

// Still works after multiple awaits
onMounted(() => {
  console.log('This also runs!')  // Works
})
</script>

<!-- IMPORTANT: Parent must use Suspense -->
<template>
  <Suspense>
    <AsyncComponent />
  </Suspense>
</template>
```

**嵌套异步破坏上下文：**
```vue
<script setup>
import { ref, onMounted, watch } from 'vue'

// WRONG: Nested async function - context lost after await
async function initializeData() {
  const config = await fetchConfig()

  // BUG: This hook will NOT be registered!
  // We're no longer in the synchronous setup context
  onMounted(() => {
    console.log('This will NEVER run!')  // Silent failure
  })

  // BUG: This watcher won't auto-dispose on unmount
  watch(someRef, () => {
    console.log('Memory leak - not cleaned up!')
  })
}

// Calling the async function
initializeData()  // Hooks inside won't work!

// WRONG: Callbacks also lose context
setTimeout(async () => {
  await delay(100)
  onMounted(() => {
    console.log('Never runs!')  // Silent failure
  })
}, 0)
</script>
```

**正确模式：**
```vue
<script setup>
import { ref, onMounted, watch } from 'vue'

const data = ref(null)
const config = ref(null)

// CORRECT: Register hooks synchronously FIRST
onMounted(async () => {
  // Then do async work INSIDE the hook
  config.value = await fetchConfig()
  data.value = await fetchData(config.value.apiUrl)
})

// CORRECT: Watchers registered synchronously
watch(config, async (newConfig) => {
  if (newConfig) {
    data.value = await fetchData(newConfig.apiUrl)
  }
})

// Or use top-level await for initial data
const initialConfig = await fetchConfig()  // OK - top level
config.value = initialConfig

onMounted(() => {
  console.log('Works!')  // Context preserved by compiler
})
</script>
```

**setup() 函数（不是script setup）：**
```javascript
// In regular setup(), await ALWAYS breaks context
export default {
  async setup() {
    const data = ref(null)

    // WRONG: Hooks after await won't register
    const config = await fetchConfig()

    onMounted(() => {
      console.log('Never runs!')  // Silent failure!
    })

    return { data }
  }
}

// CORRECT: Register hooks before any await
export default {
  async setup() {
    const data = ref(null)

    // Register hooks FIRST (synchronous)
    onMounted(async () => {
      const config = await fetchConfig()
      data.value = await fetchData(config)
    })

    // Now you can await if needed
    // But hooks must be registered before this point

    return { data }
  }
}
```

## 为什么会发生这种情况

```javascript
// Vue tracks the "current component instance" during setup
// This is like a global variable that gets set and cleared

// During synchronous setup:
function setup() {
  currentInstance = this  // Vue sets this

  onMounted(cb)  // Uses currentInstance to register

  // After await, JavaScript resumes in a microtask
  await something()

  // currentInstance is now null or different!
  onMounted(cb)  // Can't find the instance - silently fails
}

// <script setup> compiler adds restoration:
// After each await, it injects: setCurrentInstance(savedInstance)
```

## Suspense要求

```vue
<!-- When using async script setup, parent needs Suspense -->
<template>
  <Suspense>
    <!-- Async component with top-level await -->
    <AsyncChild />

    <!-- Optional: Loading state -->
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```

## 参考
- [Composition API 常见问题解答 - 异步设置](https://vuejs.org/guide/extras/composition-api-faq.html)
- [可组合函数 - 无需等待的异步](https://antfu.me/posts/async-with-composition-api)
- [Suspense](https://vuejs.org/guide/built-ins/suspense.html)
