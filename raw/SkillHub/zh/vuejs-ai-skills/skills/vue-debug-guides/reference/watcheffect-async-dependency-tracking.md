---
title: watchEffect 仅在第一次等待之前跟踪依赖关系
impact: HIGH
impactDescription: Dependencies accessed after await are not tracked, causing watchers to miss reactive changes
type: capability
tags: [vue3, watchEffect, watchers, async, await, dependency-tracking]
---

# watchEffect 仅在第一次等待之前跟踪依赖关系

**影响：高** - `watchEffect` 自动跟踪响应式依赖项，但仅限于同步执行期间。在第一个 `await` 语句之后访问的任何响应式属性都不会被跟踪，并且对它们的更改不会触发观察器。

对于异步操作，可以在等待之前访问所有依赖项，或者使用具有显式依赖项的 `watch`。

## 任务清单

- [ ] 在 watchEffect 中第一个等待之前访问所有响应式依赖项
- [ ] 当需要异步跟踪时，使用带有显式源的 `watch`
- [ ] 在等待之前将反应值存储在局部变量中
- [ ] 注意await之后的依赖对Vue来说是不可见的

**错误：**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const userId = ref(1)
const includeDetails = ref(true)
const userData = ref(null)

// BAD: includeDetails is accessed after await - NOT TRACKED!
watchEffect(async () => {
  const response = await fetch(`/api/users/${userId.value}`)
  const data = await response.json()

  // This dependency is NOT tracked - changes won't trigger re-run
  if (includeDetails.value) {
    userData.value = { ...data, details: await fetchDetails(data.id) }
  } else {
    userData.value = data
  }
})

// BAD: Multiple dependencies after await
watchEffect(async () => {
  await someAsyncSetup()

  // None of these are tracked!
  console.log(optionA.value)  // Not tracked
  console.log(optionB.value)  // Not tracked
  doSomething(optionC.value)  // Not tracked
})
</script>
```

**正确：**
```vue
<script setup>
import { ref, watchEffect, watch } from 'vue'

const userId = ref(1)
const includeDetails = ref(true)
const userData = ref(null)

// CORRECT: Access all dependencies before await
watchEffect(async () => {
  // Capture reactive values synchronously
  const id = userId.value
  const withDetails = includeDetails.value

  // Now these are tracked
  const response = await fetch(`/api/users/${id}`)
  const data = await response.json()

  if (withDetails) {
    userData.value = { ...data, details: await fetchDetails(data.id) }
  } else {
    userData.value = data
  }
})

// ALTERNATIVE: Use watch with explicit dependencies
watch(
  [userId, includeDetails],
  async ([id, withDetails]) => {
    const response = await fetch(`/api/users/${id}`)
    const data = await response.json()

    if (withDetails) {
      userData.value = { ...data, details: await fetchDetails(data.id) }
    } else {
      userData.value = data
    }
  },
  { immediate: true }
)
</script>
```

## 模式：首先提取依赖关系

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const filters = ref({ status: 'active', sortBy: 'name' })
const page = ref(1)
const results = ref([])

// CORRECT: Extract all needed values synchronously
watchEffect(async () => {
  // All dependencies accessed before await - all tracked!
  const { status, sortBy } = filters.value
  const currentPage = page.value

  // Now safe to do async work
  const response = await fetch(
    `/api/items?status=${status}&sort=${sortBy}&page=${currentPage}`
  )
  results.value = await response.json()
})
</script>
```

## 何时使用手表

```vue
<script setup>
import { ref, watch } from 'vue'

const source = ref('initial')
const option = ref('default')
const result = ref(null)

// BEST for complex async: Use watch with explicit sources
// All dependencies are explicitly declared and always tracked
watch(
  [source, option],
  async ([sourceVal, optionVal]) => {
    const data = await processAsync(sourceVal)
    result.value = applyOption(data, optionVal)
  },
  { immediate: true }
)
</script>
```

## 调试未跟踪的依赖项

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const a = ref(1)
const b = ref(2)

watchEffect(async () => {
  console.log('Tracked dependency a:', a.value)  // Tracked

  await someAsyncOperation()

  console.log('Untracked dependency b:', b.value)  // NOT tracked!
  // Changing b.value won't re-run this watchEffect
})

// Test: Change a.value -> watchEffect re-runs
// Test: Change b.value -> watchEffect does NOT re-run
</script>
```

## 参考
- [Vue.js 侦听器 - watchEffect](https://vuejs.org/guide/essentials/watchers.html#watcheffect)
- [Vue.js API - watchEffect](https://vuejs.org/api/reactivity-core.html#watcheffect)
