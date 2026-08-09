---
title: 计算属性获取器必须无副作用
impact: HIGH
impactDescription: Side effects in computed getters break reactivity and cause unpredictable behavior
type: efficiency
tags: [vue3, computed, reactivity, side-effects, best-practices]
---

# 计算属性获取器必须无副作用

**影响：高** - 计算的 getter 函数应该只执行纯计算。计算 getter 中的副作用会破坏 Vue 的响应式模型并导致难以追踪的错误。

计算属性旨在以声明方式描述如何从其他反应状态导出值。它们并不意味着执行操作或修改状态。

## 任务清单

- [ ] 切勿改变计算 getter 内的其他反应状态
- [ ] 切勿在计算 getter 内发出异步请求或 API 调用
- [ ] 切勿在计算的 getter 内执行 DOM 突变
- [ ] 使用侦听器对带有副作用的状态变化做出反应
- [ ] 使用事件处理程序来执行用户触发的操作

**错误：**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([])
const count = ref(0)
const lastFetch = ref(null)

// BAD: Mutates other state
const doubledCount = computed(() => {
  count.value++  // Side effect - modifying state!
  return count.value * 2
})

// BAD: Makes async request
const userData = computed(async () => {
  const response = await fetch('/api/user')  // Side effect - API call!
  return response.json()
})

// BAD: Modifies DOM
const highlightedItems = computed(() => {
  document.title = `${items.value.length} items`  // Side effect - DOM mutation!
  return items.value.filter(i => i.highlighted)
})

// BAD: Writes to external state
const processedData = computed(() => {
  lastFetch.value = new Date()  // Side effect - modifying state!
  return items.value.map(i => i.name)
})
</script>
```

**正确：**
```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const items = ref([])
const count = ref(0)
const userData = ref(null)

// GOOD: Pure computation only
const doubledCount = computed(() => {
  return count.value * 2
})

// GOOD: Use lifecycle hook for initial fetch
onMounted(async () => {
  const response = await fetch('/api/user')
  userData.value = await response.json()
})

// GOOD: Pure filtering
const highlightedItems = computed(() => {
  return items.value.filter(i => i.highlighted)
})

// GOOD: Use watcher for side effects
watch(items, (newItems) => {
  document.title = `${newItems.length} items`
}, { immediate: true })

// Increment count through event handler, not computed
function increment() {
  count.value++
}
</script>
```

## 什么算作副作用

|副作用类型|示例|另类|
|-----------------|---------|-------------|
|状态突变 | `otherRef.value = x` |使用侦听器 |
| API 调用 | `fetch()`、`axios()` |使用侦听器或生命周期钩子子 |
| DOM 操作 | `document.title = x` |使用侦听器 |
|控制台日志记录 | `console.log()` |删除或使用侦听器 |
|存储访问 | `localStorage.setItem()` |使用侦听器 |
|定时器设置 | `setTimeout()` |使用生命周期钩子子 |

## 参考
- [Vue.js 计算属性 - Getter 应该无副作用](https://vuejs.org/guide/essentials/computed.html#getters-should-be-side-effect-free)
