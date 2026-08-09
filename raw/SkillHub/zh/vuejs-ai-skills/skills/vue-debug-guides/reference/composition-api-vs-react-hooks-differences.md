---
title: Vue Composition API 运行一次，与 React Hook 不同
impact: MEDIUM
impactDescription: Understanding this difference prevents over-engineering and React patterns that don't apply
type: gotcha
tags: [vue3, composition-api, react-hooks, setup, stale-closure]
---

# Vue Composition API 运行一次，与 React Hook 不同

**影响：中** - Vue 的 `setup()` 或 `<script setup>` 每个组件实例仅执行一次，而 React Hooks 在每个渲染上运行。来自 React 的开发者经常应用在 Vue 中不必要且适得其反的模式（依赖数组、过度记忆、useCallback）。

理解这一根本区别对于编写惯用的 Vue 代码至关重要。 Vue 的方法消除了困扰 React 应用程序的整个类别的错误（过时的闭包、详尽的依赖）。

## 任务清单

- [ ] 不要实现“依赖数组” - Vue 自动跟踪依赖关系
- [ ] 不要将函数包装在“useCallback”等价物中 - Vue 中不需要
- [ ] 不要使用“useMemo”模式 - Vue 的 `computed()` 自动处理此问题
- [ ] 了解 Vue 中的闭包不会像 React 中那样变得“陈旧”
- [ ] 不用担心“调用顺序” - Vue 可组合函数可以是有条件的

**Vue 中要避免的 React 模式：**
```javascript
// These patterns are UNNECESSARY in Vue - they solve React-specific problems

// WRONG: Trying to implement dependency arrays (React pattern)
watch(
  [dep1, dep2, dep3],  // Vue tracks deps automatically in watchEffect
  () => {
    // ...
  }
)
// Unless you specifically WANT to control which deps trigger the watcher,
// prefer watchEffect() which auto-tracks

// WRONG: Memoizing callbacks like useCallback
const memoizedHandler = computed(() => {
  return () => doSomething(state.value)
})
// In Vue, just define the function normally - no memoization needed

// WRONG: Worrying about stale closures
function useData() {
  const data = ref(null)

  // In React, this could capture stale 'data' - NOT in Vue!
  // Vue refs are always current
  const handler = () => {
    console.log(data.value)  // Always gets current value
  }

  return { data, handler }
}
```

**正确的 Vue 模式：**
```javascript
import { ref, computed, watchEffect } from 'vue'

// CORRECT: Auto-dependency tracking with watchEffect
const query = ref('')
const filter = ref('all')

watchEffect(() => {
  // Vue automatically detects that this depends on query and filter
  // No dependency array needed!
  fetchResults(query.value, filter.value)
})

// CORRECT: computed() handles memoization automatically
const expensiveResult = computed(() => {
  // Only recalculates when dependencies actually change
  return heavyComputation(data.value)
})

// CORRECT: Functions don't need memoization
function handleClick() {
  count.value++
}
// Just use it directly - no useCallback wrapper needed
// <button @click="handleClick">

// CORRECT: Closures always access current values
const count = ref(0)
const message = ref('')

function logState() {
  // This always logs CURRENT values, never stale ones
  console.log(`Count: ${count.value}, Message: ${message.value}`)
}

setTimeout(() => {
  logState()  // Gets current values even if called later
}, 5000)
```

## Vue 相对于 React Hook 的优势

```javascript
// 1. No stale closure problems
const count = ref(0)

onMounted(() => {
  setInterval(() => {
    // In React: would need useRef or deps array to avoid stale value
    // In Vue: count.value is always current
    console.log(count.value)
  }, 1000)
})

// 2. Composables can be conditional
if (featureEnabled) {
  const { data } = useSomeFeature()  // This is FINE in Vue!
}
// In React: "Hooks cannot be conditional" - not a problem in Vue

// 3. No exhaustive-deps linting headaches
watchEffect(() => {
  // Use any reactive values - Vue tracks them all automatically
  // No ESLint rule yelling about missing dependencies
  doSomething(a.value, b.value, c.value)
})

// 4. Child components don't need memoization by default
// Vue's reactivity system only updates what actually changed
// No need for React.memo() equivalents in most cases
```

## 当 Vue 模式不同时

```javascript
// Setup runs once - so initialization happens once
<script setup>
import { ref, onMounted } from 'vue'

// This code runs ONCE when component is created
const data = ref(null)
console.log('Setup running')  // Only logs once

onMounted(() => {
  console.log('Mounted')  // Only logs once
})

// If you need something to run on every reactive change,
// use watch or watchEffect
watchEffect(() => {
  // This runs when dependencies change
  console.log('Data changed:', data.value)
})
</script>
```

## 参考
- [Composition API 常见问题解答 - 与 React Hooks 的关系](https://vuejs.org/guide/extras/composition-api-faq.html#relationship-with-react-hooks)
- [反应基础知识](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
