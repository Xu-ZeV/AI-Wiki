---
title: 在侦听器中访问更新的 DOM 时使用flush post
impact: MEDIUM
impactDescription: Default watcher timing runs before DOM updates, causing stale DOM reads
type: capability
tags: [vue3, watch, watchers, flush, DOM, timing, post]
---

# 在 Watchers 中访问更新的 DOM 时使用lush: 'post'

**影响：中** - 默认情况下，观察程序回调在组件的 DOM 更新之前运行。如果您在侦听器回调中访问 DOM，您将看到更新前的状态。当您需要访问更新的 DOM 时，请使用 `flush: 'post'` 或 `watchPostEffect`。

## 任务清单

- [ ] 在响应状态更改后读取 DOM 时使用 `{ flush: 'post' }`
- [ ] 使用 `watchPostEffect()` 作为 `watchEffect` 的简写，并带有齐平：'post'
- [ ] 避免 `{ flush: 'sync' }` 除非绝对必要（性能影响）
- [ ] 请记住，默认计时对于大多数非 DOM 操作来说是理想的选择

**错误：**
```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const listItems = ref(['a', 'b', 'c'])

// BAD: DOM shows old value when this runs
watch(count, () => {
  // Element still shows the OLD count value
  const el = document.querySelector('.counter')
  console.log('DOM shows:', el.textContent)  // Old value!
})

// BAD: List DOM not yet updated
watchEffect(() => {
  console.log('Items:', listItems.value.length)
  // DOM still has old number of list items
  const items = document.querySelectorAll('.list-item')
  console.log('DOM items:', items.length)  // Old count!
})
</script>

<template>
  <div class="counter">{{ count }}</div>
  <ul>
    <li v-for="item in listItems" :key="item" class="list-item">
      {{ item }}
    </li>
  </ul>
</template>
```

**正确：**
```vue
<script setup>
import { ref, watch, watchEffect, watchPostEffect } from 'vue'

const count = ref(0)
const listItems = ref(['a', 'b', 'c'])

// CORRECT: flush: 'post' runs after DOM update
watch(
  count,
  () => {
    const el = document.querySelector('.counter')
    console.log('DOM shows:', el.textContent)  // Correct new value!
  },
  { flush: 'post' }
)

// CORRECT: watchPostEffect shorthand
watchPostEffect(() => {
  console.log('Items:', listItems.value.length)
  const items = document.querySelectorAll('.list-item')
  console.log('DOM items:', items.length)  // Matches listItems.length!
})

// CORRECT: Using watchEffect with flush option
watchEffect(
  () => {
    // Access reactive state and DOM together
    const expectedCount = listItems.value.length
    const actualCount = document.querySelectorAll('.list-item').length
    console.log(`Expected: ${expectedCount}, Actual: ${actualCount}`)
  },
  { flush: 'post' }
)
</script>

<template>
  <div class="counter">{{ count }}</div>
  <ul>
    <li v-for="item in listItems" :key="item" class="list-item">
      {{ item }}
    </li>
  </ul>
</template>
```

## 冲洗时间选项

```javascript
import { watch, watchEffect, watchPostEffect, watchSyncEffect } from 'vue'

// Default: 'pre' - runs before component DOM update
watch(source, callback)  // Same as { flush: 'pre' }

// Post: runs after component DOM update
watch(source, callback, { flush: 'post' })
watchPostEffect(callback)  // Shorthand

// Sync: runs immediately when reactive value changes
// USE WITH CAUTION - no batching, fires on every mutation
watch(source, callback, { flush: 'sync' })
watchSyncEffect(callback)  // Shorthand
```

## 何时使用每次冲洗计时

|时间 |使用案例|
|--------|----------|
| `'pre'`（默认）|不需要 DOM 访问的逻辑 |
| `'post'` |读取或测量更新的 DOM |
| `'sync'` |调试日志记录，仅简单布尔标志 |

## 同步侦听器警告

```javascript
import { ref, watch } from 'vue'

const items = ref([1, 2, 3])

// DANGEROUS: Fires for EVERY array mutation
watch(
  items,
  () => {
    console.log('Changed!')  // Called 3 times for push, push, push
  },
  { flush: 'sync' }
)

// This triggers the watcher 3 times synchronously
items.value.push(4)
items.value.push(5)
items.value.push(6)

// Better: Use default flush which batches updates
watch(items, () => {
  console.log('Changed!')  // Called once after all mutations
}, { deep: true })
```

## 实际示例：自动滚动

```vue
<script setup>
import { ref, watchPostEffect } from 'vue'

const messages = ref([])
const containerRef = ref(null)

// Auto-scroll to bottom when new messages arrive
watchPostEffect(() => {
  // Access messages.value to track it
  const msgCount = messages.value.length

  // DOM is updated, safe to scroll
  if (containerRef.value && msgCount > 0) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight
  }
})

function addMessage(text) {
  messages.value.push({ text, timestamp: Date.now() })
}
</script>

<template>
  <div ref="containerRef" class="messages">
    <div v-for="msg in messages" :key="msg.timestamp">
      {{ msg.text }}
    </div>
  </div>
</template>
```

## 参考
- [Vue.js 侦听器 - 回调刷新计时](https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing)
