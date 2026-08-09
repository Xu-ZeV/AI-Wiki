---
title: 切勿直接解构reactive()对象
impact: HIGH
impactDescription: Destructuring reactive objects breaks reactivity - changes won't trigger updates
type: capability
tags: [vue3, reactivity, reactive, composition-api, destructuring]
---

# 永远不要直接解构reactive()对象

**影响：高** - 解构 `reactive()` 对象会破坏响应式连接。对解构变量的更新不会触发 UI 更新，从而导致数据显示陈旧。

Vue 的 `reactive()` 使用 JavaScript 代理来跟踪属性访问。当您解构时，您从代理中提取原始值，从而失去响应式连接。从可组合函数或导入状态解构时，这尤其危险。

## 任务清单

- [ ] 如果需要响应式，切勿直接解构响应式对象
- [ ] 在解构之前使用 `toRefs()` 将响应式对象属性转换为 refs
- [ ] 考虑使用 `ref()` 而不是 `reactive()` 来完全避免这个陷阱
- [ ] 从可组合函数导入状态时，在解构之前检查它是否是响应式的

**错误：**
```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue'
})

// WRONG: Destructuring breaks reactivity
const { count, name } = state

// These updates work on the original state...
state.count++  // state.count is now 1

// ...but the destructured variables are NOT updated
console.log(count)  // Still 0! Lost reactivity
```

```javascript
// WRONG: Destructuring from a composable
function useCounter() {
  const state = reactive({ count: 0 })
  return state
}

const { count } = useCounter()  // count is now a non-reactive primitive
```

**正确：**
```javascript
import { reactive, toRefs } from 'vue'

const state = reactive({
  count: 0,
  name: 'Vue'
})

// CORRECT: Use toRefs() to maintain reactivity
const { count, name } = toRefs(state)

state.count++
console.log(count.value)  // 1 - Reactivity preserved! (note: now needs .value)
```

```javascript
// CORRECT: Return toRefs from composables
function useCounter() {
  const state = reactive({ count: 0 })
  return toRefs(state)  // Now safe to destructure
}

const { count } = useCounter()  // count is now a ref, reactivity preserved
```

```javascript
// ALTERNATIVE: Just use ref() to avoid the issue entirely
import { ref } from 'vue'

const count = ref(0)
const name = ref('Vue')

// No destructuring needed, no gotchas
```

## 参考
- [Vue.js 响应式基础知识 - Reactor()](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive)
- [Vue.js 响应式 API - toRefs()](https://vuejs.org/api/reactivity-utilities.html#torefs)
