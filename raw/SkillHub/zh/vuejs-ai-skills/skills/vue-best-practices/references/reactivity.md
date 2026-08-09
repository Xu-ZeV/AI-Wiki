---
title: 响应式核心模式（ref、reactive、shallowRef、compulated、watch）
impact: MEDIUM
impactDescription: Clear reactivity choices keep state predictable and reduce unnecessary updates in Vue 3 apps
type: efficiency
tags: [vue3, reactivity, ref, reactive, shallowRef, computed, watch, watchEffect, external-state, best-practice]
---

# 响应式核心模式（ref、reactive、shallowRef、compulated、watch）

**影响：中** - 首先选择正确的反应原语，使用 `computed` 进行派生，并且仅使用侦听器来产生副作用。

该参考文献涵盖了本地状态、外部数据、派生值和效果的核心响应式决策。

## 任务列表

- 正确声明反应状态
  - 始终使用 `shallowRef()` 而不是 `ref()` 作为原始值
  - 为对象/数组/映射/集合选择正确的响应式声明方法
- 遵循 `reactive` 的最佳实践
  - 避免直接从 `reactive()` 解构
  - 正确观看 `reactive`
- 遵循 `computed` 的最佳实践
  - 优先选择 `computed` 而不是侦听器分配的派生参考
  - 将过滤/排序的派生排除在模板之外
  - 使用 `computed` 可重用的类/样式逻辑
  - 保持计算的吸气剂纯净（无副作用）并将副作用放入侦听器中
- 遵循侦听器的最佳实践
  - 使用 `immediate: true` 而不是重复的初始调用
  - 清理侦听器的异步效果

## 正确声明反应状态

### 对于原始值（字符串、数字、布尔值、空值等），始终使用 `shallowRef()` 而不是 `ref()`，以获得更好的性能。

**错误：**
```ts
import { ref } from 'vue'
const count = ref(0)
```

**正确：**
```ts
import { shallowRef } from 'vue'
const count = shallowRef(0)
```

### 为对象/数组/映射/集合选择正确的响应式声明方法

当您经常**替换整个值** (`state.value = newObj`) 并且仍然希望在其中进行深度反应时，请使用 `ref()`，通常用于：

- 经常重新分配状态（替换获取的对象/列表、重置为默认值、切换预设）。
- 可组合返回值，其中更新主要通过 `.value` 重新分配进行。

当您主要**改变属性**且完全替换不常见时，请使用 `reactive()`，通常用于：

- “单一状态对象”模式（存储/表单）：`state.count++`、`state.items.push(...)`、`state.user.name = ...`。
- 您想要避免 `.value` 并就地更新嵌套字段的情况。

```ts
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: { name: 'Alice', age: 30 }
})

state.count++ // ✅ reactive
state.user.age = 31 // ✅ reactive
// ❌ avoid replacing the reactive object reference:
// state = reactive({ count: 1 })
```

当值**不透明/不应被代理**（类实例、外部库对象、非常大的嵌套数据）并且您只希望在**替换** `state.value`（无深度跟踪）时触发更新时，请使用 `shallowRef()`，通常用于：

- 存储外部实例/句柄（SDK 客户端、类实例），无需 Vue 代理内部。
- 通过替换根引用来更新的大数据（不可变样式更新）。

```ts
import { shallowRef } from 'vue'

const user = shallowRef({ name: 'Alice', age: 30 })

user.value.age = 31 // ❌ not reactive
user.value = { name: 'Bob', age: 25 } // ✅ triggers update
```

当您想要**仅顶级属性**反应时，请使用 `shallowReactive()` ；嵌套对象保持原始状态，通常用于：

- 仅顶级密钥更改的容器对象和嵌套有效负载应保持非托管/非代理状态。
- Vue 跟踪包装器对象的混合结构，但不跟踪深度嵌套或外来对象。

```ts
import { shallowReactive } from 'vue'

const state = shallowReactive({
  count: 0,
  user: { name: 'Alice', age: 30 }
})

state.count++ // ✅ reactive
state.user.age = 31 // ❌ not reactive
```

## `reactive` 的最佳实践

### 避免直接从 `reactive()` 解构

**不好：**

```ts
import { reactive } from 'vue'

const state = reactive({ count: 0 })
const { count } = state // ❌ disconnected from reactivity
```

### 正确观察响应式

**不好：**

将非 getter 值传递给 `watch()`

```ts
import { reactive, watch } from 'vue'

const state = reactive({ count: 0 })

// ❌ watch expects a getter, ref, reactive object, or array of these
watch(state.count, () => { /* ... */ })
```

**好：**

保留与 `toRefs()` 的响应式并使用 `watch()` 的吸气剂

```ts
import { reactive, toRefs, watch } from 'vue'

const state = reactive({ count: 0 })
const { count } = toRefs(state) // ✅ count is a ref

watch(count, () => { /* ... */ }) // ✅
watch(() => state.count, () => { /* ... */ }) // ✅
```

## `computed` 的最佳实践

### 优先选择 `computed` 而不是侦听器分配的派生引用

**不好：**
```ts
import { ref, watchEffect } from 'vue'

const items = ref([{ price: 10 }, { price: 20 }])
const total = ref(0)

watchEffect(() => {
  total.value = items.value.reduce((sum, item) => sum + item.price, 0)
})
```

**好：**
```ts
import { ref, computed } from 'vue'

const items = ref([{ price: 10 }, { price: 20 }])
const total = computed(() =>
  items.value.reduce((sum, item) => sum + item.price, 0)
)
```

### 将过滤/排序的派生排除在模板之外

**不好：**
```vue
<template>
  <li v-for="item in items.filter(item => item.active)" :key="item.id">
    {{ item.name }}
  </li>

  <li v-for="item in getSortedItems()" :key="item.id">
    {{ item.name }}
  </li>
</template>

<script setup>
import { ref } from 'vue'

const items = ref([
  { id: 1, name: 'B', active: true },
  { id: 2, name: 'A', active: false }
])

function getSortedItems() {
  return [...items.value].sort((a, b) => a.name.localeCompare(b.name))
}
</script>
```

**好：**
```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([
  { id: 1, name: 'B', active: true },
  { id: 2, name: 'A', active: false }
])

const visibleItems = computed(() =>
  items.value
    .filter(item => item.active)
    .sort((a, b) => a.name.localeCompare(b.name))
)
</script>

<template>
  <li v-for="item in visibleItems" :key="item.id">
    {{ item.name }}
  </li>
</template>
```

### 使用 `computed` 来实现可重用的类/样式逻辑

**不好：**
```vue
<template>
  <button :class="{ btn: true, 'btn-primary': type === 'primary' && !disabled, 'btn-disabled': disabled }">
    {{ label }}
  </button>
</template>
```

**好：**
```vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'primary' },
  disabled: Boolean,
  label: String
})

const buttonClasses = computed(() => ({
  btn: true,
  [`btn-${props.type}`]: !props.disabled,
  'btn-disabled': props.disabled
}))
</script>

<template>
  <button :class="buttonClasses">
    {{ label }}
  </button>
</template>
```

### 保持计算的 getter 纯净（无副作用）并将副作用放入侦听器中

计算的 getter 应该只派生一个值。没有突变，没有 API 调用，没有存储写入，没有事件发出。
([参考](https://vuejs.org/guide/essentials/computed.html#best-practices))

**不好：**

计算内的副作用

```ts
const count = ref(0)

const doubled = computed(() => {
  // ❌ side effect
  if (count.value > 10) console.warn('Too big!')
  return count.value * 2
})
```

**好：**

纯计算 + `watch()` 的副作用

```ts
const count = ref(0)
const doubled = computed(() => count.value * 2)

watch(count, (value) => {
  if (value > 10) console.warn('Too big!')
})
```

## 侦听器的最佳实践

### 使用 `immediate: true` 而不是重复的初始调用

**不好：**
```ts
import { ref, watch, onMounted } from 'vue'

const userId = ref(1)

function loadUser(id) {
  // ...
}

onMounted(() => loadUser(userId.value))
watch(userId, (id) => loadUser(id))
```

**好：**
```ts
import { ref, watch } from 'vue'

const userId = ref(1)

watch(
  userId,
  (id) => loadUser(id),
  { immediate: true }
)
```

### 清理侦听器的异步效果

当对快速变化（搜索框、过滤器）做出反应时，取消先前的请求。

**好：**

```ts
const query = ref('')
const results = ref<string[]>([])

watch(query, async (q, _prev, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())

  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
    signal: controller.signal,
  })

  results.value = await res.json()
})
```
