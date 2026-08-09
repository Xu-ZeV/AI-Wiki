---
title: 默认情况下，script setup中的变量不是响应式的
impact: HIGH
impactDescription: Forgetting to wrap variables with ref() or reactive() causes silent reactivity failures in script setup
type: gotcha
tags: [vue3, sfc, script-setup, reactivity, ref, composition-api]
---

# script setup中的变量默认情况下不响应

**影响：高** - 与选项 API 的 `data()` 不同，`<script setup>` 会自动使属性成为响应式的，`<script setup>` 中声明的变量是纯 JavaScript 值。您必须显式使用 `ref()` 或 `reactive()` 以使它们具有响应式。忘记这一点会导致 UI 在值更改时不会更新。

## 任务清单

- [ ] 始终用 `ref()` 包装原始值（字符串、数字、布尔值）
- [ ] 当不需要重新分配整个对象时，对对象使用 `reactive()`
- [ ] 请记住在脚本中的引用上访问 `.value` （模板中不需要）
- [ ] 使用 Vue 中的 `computed()`，而不是普通函数，用于派生反应状态

**有问题的代码：**
```vue
<script setup>
// BAD: These are NOT reactive!
let count = 0
let message = 'Hello'
let user = { name: 'John', age: 30 }

function increment() {
  count++  // This change won't update the UI!
}

function updateMessage() {
  message = 'World'  // UI won't reflect this change!
}
</script>

<template>
  <div>
    <!-- Will always show initial values -->
    <p>Count: {{ count }}</p>
    <p>Message: {{ message }}</p>
    <button @click="increment">Increment</button>
    <button @click="updateMessage">Update</button>
  </div>
</template>
```

**正确代码：**
```vue
<script setup>
import { ref, reactive, computed } from 'vue'

// GOOD: Primitives wrapped with ref()
const count = ref(0)
const message = ref('Hello')

// GOOD: Object with reactive()
const user = reactive({ name: 'John', age: 30 })

// GOOD: Computed for derived state
const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++  // Use .value for refs in script
}

function updateMessage() {
  message.value = 'World'
}

function updateUser() {
  user.name = 'Jane'  // No .value needed for reactive objects
}
</script>

<template>
  <div>
    <!-- No .value needed in templates - Vue unwraps automatically -->
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <p>Message: {{ message }}</p>
    <p>User: {{ user.name }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

## 常见错误：简单计算

```vue
<script setup>
import { ref } from 'vue'

const items = ref([1, 2, 3, 4, 5])

// BAD: Plain function, not reactive - won't update when items change
const total = items.value.reduce((sum, n) => sum + n, 0)

// BAD: Arrow function - recalculates but Vue doesn't track it
const getTotal = () => items.value.reduce((sum, n) => sum + n, 0)
</script>

<template>
  <!-- total never updates, getTotal works but isn't optimal -->
  <p>Total: {{ total }}</p>
</template>
```

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([1, 2, 3, 4, 5])

// GOOD: computed() tracks dependencies and caches result
const total = computed(() => items.value.reduce((sum, n) => sum + n, 0))
</script>

<template>
  <p>Total: {{ total }}</p>  <!-- Updates when items change -->
</template>
```

## 何时使用 ref() 与reactive()

```vue
<script setup>
import { ref, reactive } from 'vue'

// Use ref() for:
// - Primitives (string, number, boolean)
// - Values you might reassign entirely
const count = ref(0)
const isLoading = ref(false)
const selectedId = ref<number | null>(null)

// Use reactive() for:
// - Objects/arrays you'll mutate but not reassign
// - When you want to avoid .value
const form = reactive({
  name: '',
  email: '',
  errors: []
})

// Gotcha: Can't reassign reactive objects
const user = reactive({ name: 'John' })
// user = { name: 'Jane' }  // This breaks reactivity!
// user.name = 'Jane'       // This works

// Use ref() if you need to reassign objects
const userData = ref({ name: 'John' })
userData.value = { name: 'Jane' }  // This works
</script>
```

## 模板自动展开

Vue 自动解开模板中的引用：

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const user = ref({ name: 'John' })
</script>

<template>
  <!-- All of these work - no .value needed -->
  <p>{{ count }}</p>
  <p>{{ user.name }}</p>
  <input v-model="count" type="number">
  <button @click="count++">Increment</button>
</template>
```

但在内联编写的事件处理程序中，您可能仍然需要 `.value`：

```vue
<template>
  <!-- This works (Vue handles it) -->
  <button @click="count++">+1</button>

  <!-- For complex logic, .value may be needed -->
  <button @click="() => { count.value = Math.max(0, count.value - 1) }">
    -1 (min 0)
  </button>
</template>
```

## 参考
- [Vue.js 响应式基础知识](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue.js 参考()](https://vuejs.org/api/reactivity-core.html#ref)
- [Vue.js 响应式()](https://vuejs.org/api/reactivity-core.html#reactive)
