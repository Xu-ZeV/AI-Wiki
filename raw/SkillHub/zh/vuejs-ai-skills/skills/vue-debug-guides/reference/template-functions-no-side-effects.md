---
title: 模板函数必须是纯粹的，没有副作用
impact: MEDIUM
impactDescription: Functions with side effects in templates cause unpredictable behavior on every re-render
type: efficiency
tags: [vue3, template, functions, performance, side-effects]
---

# 模板函数必须纯净且无副作用

**影响：中** - 模板中调用的函数在每个组件重新渲染时执行。具有副作用的函数（修改数据、API 调用、日志记录）将导致不可预测的行为、性能问题和难以调试的错误。

每当组件更新时，就会评估包含函数调用的模板表达式。这使得它们不适合只发生一次或修改状态的操作。

## 任务清单

- [ ] 保持模板函数纯净（相同的输入 = 相同的输出）
- [ ] 切勿修改模板函数内的反应状态
- [ ] 切勿在模板函数中进行 API 调用或异步操作
- [ ] 将副作用移至事件处理程序、观察程序或生命周期挂钩
- [ ] 尽可能对派生值使用计算属性而不是函数
- [ ] 避免昂贵的计算；使用计算属性进行缓存

**错误：**
```vue
<template>
  <!-- BAD: Modifies state on every render -->
  <p>{{ incrementAndGet() }}</p>

  <!-- BAD: API call on every render -->
  <div>{{ fetchUserName() }}</div>

  <!-- BAD: Logging side effect -->
  <span>{{ logAndFormat(date) }}</span>

  <!-- BAD: Expensive computation without caching -->
  <ul>
    <li v-for="item in filterAndSort(items)" :key="item.id">
      {{ item.name }}
    </li>
  </ul>

  <!-- BAD: Random values change on every render -->
  <p>{{ getRandomGreeting() }}</p>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
const items = ref([/* large array */])

// BAD: Has side effect - modifies state
function incrementAndGet() {
  count.value++  // Side effect!
  return count.value
}

// BAD: Async operation in template
async function fetchUserName() {
  const res = await fetch('/api/user')  // Side effect!
  return (await res.json()).name
}

// BAD: Logging is a side effect
function logAndFormat(date) {
  console.log('Formatting date:', date)  // Side effect!
  return new Date(date).toLocaleDateString()
}

// BAD: Expensive, runs every render without caching
function filterAndSort(items) {
  return items
    .filter(i => i.active)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// BAD: Non-deterministic
function getRandomGreeting() {
  const greetings = ['Hello', 'Hi', 'Hey']
  return greetings[Math.floor(Math.random() * greetings.length)]
}
</script>
```

**正确：**
```vue
<template>
  <!-- OK: Pure formatting function -->
  <p>Count: {{ count }}</p>
  <button @click="increment">Increment</button>

  <!-- OK: Data fetched via lifecycle/watcher -->
  <div>{{ userName }}</div>

  <!-- OK: Pure function, no side effects -->
  <span>{{ formatDate(date) }}</span>

  <!-- OK: Computed property caches result -->
  <ul>
    <li v-for="item in filteredAndSortedItems" :key="item.id">
      {{ item.name }}
    </li>
  </ul>

  <!-- OK: Random value set once -->
  <p>{{ greeting }}</p>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const userName = ref('')
const date = ref(new Date())
const items = ref([/* large array */])

// Side effects in event handlers
function increment() {
  count.value++
}

// Fetch data in lifecycle hook
onMounted(async () => {
  const res = await fetch('/api/user')
  userName.value = (await res.json()).name
})

// Pure function - same input, same output
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}

// Computed property - cached, only recalculates when dependencies change
const filteredAndSortedItems = computed(() => {
  return items.value
    .filter(i => i.active)
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Set random value once, not on every render
const greetings = ['Hello', 'Hi', 'Hey']
const greeting = ref(greetings[Math.floor(Math.random() * greetings.length)])
</script>
```

## 纯函数指南

纯函数：
1. 给定相同的输入，总是返回相同的输出
2. 不修改任何外部状态
3.不执行I/O操作（网络、控制台、文件系统）
4. 不依赖于可变的外部状态

```javascript
// PURE - safe for templates
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

function fullName(first, last) {
  return `${first} ${last}`
}

function isExpired(date) {
  return new Date(date) < new Date()
}

// IMPURE - unsafe for templates
function logAndReturn(value) {
  console.log(value)  // I/O
  return value
}

function getFromLocalStorage(key) {
  return localStorage.getItem(key)  // External state
}

function updateAndReturn(obj, key, value) {
  obj[key] = value  // Mutation
  return obj
}
```

## 参考
- [Vue.js 模板语法 - 调用函数](https://vuejs.org/guide/essentials/template-syntax.html#calling-functions)
- [Vue.js 计算属性](https://vuejs.org/guide/essentials/computed.html)
