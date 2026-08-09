---
title: 使用带有模板引用的 watchEffect 齐平帖子
impact: MEDIUM
impactDescription: Default watchEffect runs before DOM updates, causing refs to be out of sync
type: gotcha
tags: [vue3, watchEffect, template-refs, flush, dom-timing]
---

# 使用带有模板引用的 watchEffect 的刷新帖子

**影响：中度** - 默认情况下，`watchEffect` 在 DOM 更新之前运行。当观看模板引用时，这意味着效果可能会使用陈旧的或空的引用值运行。使用 `flush: 'post'` 确保效果在 DOM 更新后且引用为最新时运行。

这个计时问题特别令人困惑，因为观察器运行，但 ref 尚未反映当前 DOM 状态。

## 任务清单

- [ ] 当 watchEffect 访问模板引用时使用 `{ flush: 'post' }`
- [ ] 或者，使用 `watchPostEffect` 帮助程序以获得更清晰的语法
- [ ] 仍然包括空检查，因为可以卸载引用
- [ ] 考虑使用 `watch` 和显式参考监视来代替

**错误：**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const inputEl = ref(null)
const text = ref('')

// WRONG: Runs BEFORE DOM update - ref may be null or stale
watchEffect(() => {
  // On first run: inputEl.value is null (DOM not rendered yet)
  // On updates: May reference old element state
  if (inputEl.value) {
    console.log('Input value:', inputEl.value.value) // Stale!
    inputEl.value.focus()
  }
})
</script>

<template>
  <input ref="inputEl" v-model="text" />
</template>
```

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const items = ref([1, 2, 3])
const itemRefs = ref([])

// WRONG: Refs array not yet populated when this runs
watchEffect(() => {
  console.log('Number of refs:', itemRefs.value.length) // Always 0!
})
</script>

<template>
  <div v-for="item in items" :key="item" :ref="el => itemRefs.value.push(el)">
    {{ item }}
  </div>
</template>
```

**正确：**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const inputEl = ref(null)
const text = ref('')

// CORRECT: flush: 'post' runs AFTER DOM update
watchEffect(() => {
  if (inputEl.value) {
    console.log('Input value:', inputEl.value.value) // Current!
    inputEl.value.focus()
  }
}, { flush: 'post' })
</script>

<template>
  <input ref="inputEl" v-model="text" />
</template>
```

```vue
<script setup>
import { ref, watchPostEffect } from 'vue'

const inputEl = ref(null)
const showInput = ref(true)

// CORRECT: watchPostEffect is shorthand for flush: 'post'
watchPostEffect(() => {
  if (inputEl.value) {
    inputEl.value.focus()
  }
})
</script>

<template>
  <input v-if="showInput" ref="inputEl" />
</template>
```

```vue
<script setup>
import { ref, watch, onMounted } from 'vue'

const inputEl = ref(null)

// ALTERNATIVE: Use watch on the ref directly
watch(inputEl, (el) => {
  if (el) {
    el.focus()
  }
}, { flush: 'post' })

// ALTERNATIVE: For one-time setup, onMounted is sufficient
onMounted(() => {
  inputEl.value?.focus()
})
</script>

<template>
  <input ref="inputEl" />
</template>
```

```vue
<script setup>
import { useTemplateRef, watchPostEffect } from 'vue'

// Vue 3.5+ with useTemplateRef
const input = useTemplateRef('my-input')

// CORRECT: watchPostEffect with useTemplateRef
watchPostEffect(() => {
  input.value?.focus()
})
</script>

<template>
  <input ref="my-input" />
</template>
```

## 冲洗选项解释

```javascript
// Default: 'pre' - runs before DOM update
watchEffect(() => { ... }) // Same as { flush: 'pre' }

// 'post' - runs after DOM update (use for refs)
watchEffect(() => { ... }, { flush: 'post' })
watchPostEffect(() => { ... }) // Shorthand

// 'sync' - runs synchronously (rarely needed, can cause issues)
watchEffect(() => { ... }, { flush: 'sync' })
watchSyncEffect(() => { ... }) // Shorthand
```

## 何时使用每种冲水模式

|场景 |推荐同花|
|----------|-------------------|
|访问模板 ref| `post` |
|读取更新的 DOM | `post` |
|渲染前触发 | `pre`（默认）|
|性能关键的同步更新 | `sync`（谨慎）|

## 参考
- [Vue.js 侦听器 - 回调刷新计时](https://vuejs.org/guide/essentials/watchers.html#callback-flush-timing)
- [Vue.js watchEffect API](https://vuejs.org/api/reactivity-core.html#watcheffect)
