---
title: 组合 API 使用可变响应式，而不是函数式编程
impact: MEDIUM
impactDescription: Misunderstanding the paradigm leads to incorrect state management patterns
type: gotcha
tags: [vue3, composition-api, reactivity, functional-programming, paradigm]
---

# Composition API 使用可变响应式，而不是函数式编程

**影响：中** - 尽管 Composition API 是基于函数的，但它遵循 Vue 的可变的、细粒度的响应式范例，而不是函数式编程原则。将其视为功能范式会导致不正确的模式，例如不必要的克隆、不可变样式更新或在突变是预期模式时避免突变。

Vue 的 Composition API 利用导入的函数来组织代码，但底层模型基于 Vue 跟踪和响应的可变反应状态。这与具有不变性的函数式编程（如 Redux 减速器）有根本的不同。

## 任务清单

- [ ] 直接改变反应状态 - 不要为每次更新创建新对象
- [ ] 不要应用不必要的不变性模式（扩展、Object.assign 用于更新）
- [ ] 了解 `ref()` 和 `reactive()` 启用可变状态跟踪
- [ ] 按预期使用 Vue 的响应式：带有自动跟踪的直接突变

**错误：**
```javascript
import { ref } from 'vue'

const todos = ref([])

// WRONG: Treating Vue like Redux/functional - unnecessary immutability
function addTodo(todo) {
  // Creating a new array every time is wasteful in Vue
  todos.value = [...todos.value, todo]
}

function updateTodo(id, updates) {
  // Unnecessary spread - Vue tracks mutations directly
  todos.value = todos.value.map(t =>
    t.id === id ? { ...t, ...updates } : t
  )
}

const user = ref({ name: 'John', age: 30 })

// WRONG: Creating new object for simple update
function updateName(newName) {
  user.value = { ...user.value, name: newName }
}
```

**正确：**
```javascript
import { ref, reactive } from 'vue'

const todos = ref([])

// CORRECT: Mutate directly - Vue tracks the change
function addTodo(todo) {
  todos.value.push(todo)  // Direct mutation is the Vue way
}

function updateTodo(id, updates) {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    Object.assign(todo, updates)  // Direct mutation
  }
}

const user = ref({ name: 'John', age: 30 })

// CORRECT: Mutate the property directly
function updateName(newName) {
  user.value.name = newName  // Vue tracks this!
}

// Or with reactive():
const state = reactive({ name: 'John', age: 30 })

function updateNameReactive(newName) {
  state.name = newName  // Direct mutation, reactivity preserved
}
```

## 当不变性模式有意义时

```javascript
// Immutability IS appropriate when:

// 1. Replacing the entire state (e.g., from API response)
const users = ref([])
async function fetchUsers() {
  users.value = await api.getUsers()  // Complete replacement is fine
}

// 2. When you need a snapshot for comparison
const previousState = { ...currentState }  // For undo/redo

// 3. When passing data to external libraries expecting immutable data
const chartData = computed(() => [...rawData.value])  // Copy for chart lib
```

## Vue 心理模型

```javascript
// Vue's reactivity is like a spreadsheet:
// - Cell A1 contains a value (ref)
// - Cell B1 has a formula referencing A1 (computed)
// - Change A1, and B1 automatically updates

const a1 = ref(10)
const b1 = computed(() => a1.value * 2)

// You CHANGE A1 (mutate), you don't create a new A1
a1.value = 20  // b1 automatically becomes 40

// This is fundamentally different from:
// state = reducer(state, action)  // Functional/Redux pattern
```

## 参考
- [组合API常见问题](https://vuejs.org/guide/extras/composition-api-faq.html)
- [反应基础知识](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
