---
title: 必须在任何 Await 之前调用 DefineExpose
impact: HIGH
impactDescription: Properties exposed after await are inaccessible to parent component refs
type: gotcha
tags: [vue3, script-setup, defineExpose, async, component-refs]
---

# defineExpose 必须在任何 Await 之前调用

**影响：高** - 在 `<script setup>` 中，如果您在 `await` 语句之后调用 `defineExpose()`，则使用模板引用的父组件将无法访问公开的属性。这是一个微妙的异步计时问题，会导致无提示故障。

编译器会转换顶级await，并且await 之后的代码会在不同的执行上下文中运行，其中defineExpose 无法正确注册到组件实例。

## 任务清单

- [ ] 始终在 script setup 的顶部、任何等待之前调用defineExpose()
- [ ] 如果暴露的方法中需要异步数据，则单独获取
- [ ] 结构代码，因此首先公开声明
- [ ] 使用异步设置时测试父引用访问

**错误：**
```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const data = ref(null)
const count = ref(0)

function increment() {
  count.value++
}

// WRONG: await before defineExpose
const response = await fetch('/api/data')
data.value = await response.json()

// BROKEN: This won't work - called after await!
defineExpose({
  count,
  increment,
  data
})
</script>

<template>
  <div>{{ data }}</div>
</template>
```

```vue
<!-- ParentComponent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

onMounted(() => {
  // FAILS: All exposed properties are undefined!
  console.log(childRef.value.count) // undefined
  childRef.value.increment() // TypeError
})
</script>

<template>
  <Suspense>
    <ChildComponent ref="childRef" />
  </Suspense>
</template>
```

**正确：**
```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const data = ref(null)
const count = ref(0)

function increment() {
  count.value++
}

// CORRECT: defineExpose BEFORE any await
defineExpose({
  count,
  increment,
  data
})

// Now safe to use await
const response = await fetch('/api/data')
data.value = await response.json()
</script>

<template>
  <div>{{ data }}</div>
</template>
```

```vue
<!-- Alternative: Separate async logic from expose -->
<script setup>
import { ref, onMounted } from 'vue'

const data = ref(null)
const loading = ref(true)

function getData() {
  return data.value
}

async function refreshData() {
  loading.value = true
  const response = await fetch('/api/data')
  data.value = await response.json()
  loading.value = false
}

// CORRECT: No await at top level - defineExpose always works
defineExpose({
  data,
  getData,
  refreshData,
  loading
})

// Trigger async load in lifecycle hook instead
onMounted(() => {
  refreshData()
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>{{ data }}</div>
</template>
```

```vue
<!-- If you must use top-level await, define expose first -->
<script setup>
import { ref } from 'vue'

const user = ref(null)
const posts = ref([])

// CORRECT: All expose calls come first
defineExpose({
  user,
  posts,
  refresh: () => loadData()
})

// Now safe to await
async function loadData() {
  const [userRes, postsRes] = await Promise.all([
    fetch('/api/user'),
    fetch('/api/posts')
  ])
  user.value = await userRes.json()
  posts.value = await postsRes.json()
}

// Top-level await after defineExpose is safe
await loadData()
</script>
```

## 为什么会发生这种情况

Vue 的编译器将带有顶级等待的 `<script setup>` 转换为异步设置函数。组件实例上下文仅在第一次等待之前同步可用。在等待之后，执行会在该上下文之外恢复，从而使defineExpose 无效。

```javascript
// What the compiler roughly generates:
async setup() {
  const count = ref(0)

  // Context available here
  await fetch(...)  // Suspends execution

  // Context lost after resuming
  defineExpose({ count }) // Too late!
}
```

## 参考
- [Vue.js script setup - DefineExpose](https://vuejs.org/api/sfc-script-setup.html#defineexpose)
- [Vue.js 异步组件](https://vuejs.org/guide/components/async.html)
