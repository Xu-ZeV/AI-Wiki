---
title: 使用 nextTick() 等待 DOM 更新
impact: MEDIUM
impactDescription: DOM updates are batched and asynchronous - direct DOM access after state changes sees stale values
type: capability
tags: [vue3, dom, nextTick, reactivity, async]
---

# 使用 nextTick() 等待 DOM 更新

**影响：中** - Vue 异步批量更新 DOM 以提高性能。如果您在更改反应状态后立即访问 DOM，您将看到旧值。使用 `nextTick()` 等待 DOM 更新。

当您修改响应式状态时，Vue 不会同步更新 DOM。相反，它会缓冲更改并将其应用到事件循环的下一个“tick”中。这是一种性能优化，但当您需要在状态更改后读取或操作 DOM 时，它可能会导致错误。

## 任务清单

- [ ] 当状态更改后需要访问更新的 DOM 元素时，请使用 `await nextTick()`
- [ ] 数据更改后测量 DOM 元素（高度、宽度）时使用 `nextTick()`
- [ ] 在内容更新后聚焦输入或滚动时使用 `nextTick()`
- [ ] 考虑您是否确实需要 DOM 访问 - 通常您可以使用响应式数据

**错误：**
```javascript
import { ref } from 'vue'

const message = ref('Hello')
const messageEl = ref(null)

function updateMessage() {
  message.value = 'Updated!'

  // WRONG: DOM still shows "Hello" at this point
  console.log(messageEl.value.textContent) // "Hello" - stale!

  // WRONG: Scrolling/focusing may not work correctly
  scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
}
```

**正确：**
```javascript
import { ref, nextTick } from 'vue'

const message = ref('Hello')
const messageEl = ref(null)

async function updateMessage() {
  message.value = 'Updated!'

  // CORRECT: Wait for DOM to update
  await nextTick()

  // Now the DOM is updated
  console.log(messageEl.value.textContent) // "Updated!"

  // Scrolling and focusing now work correctly
  scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
}

// Alternative: callback syntax
function updateWithCallback() {
  message.value = 'Updated!'

  nextTick(() => {
    console.log(messageEl.value.textContent) // "Updated!"
  })
}
```

```vue
<script setup>
import { ref, nextTick } from 'vue'

const items = ref([])
const listRef = ref(null)

async function addItem() {
  items.value.push({ id: Date.now(), text: 'New item' })

  await nextTick()

  // Now we can safely scroll to the new item
  listRef.value.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
}
</script>
```

## 参考
- [Vue.js 响应式基础知识 - DOM 更新时序](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#dom-update-timing)
- [Vue.js nextTick API](https://vuejs.org/api/general.html#nexttick)
