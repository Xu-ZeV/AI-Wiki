---
title: 计算属性无法接受参数
impact: MEDIUM
impactDescription: Attempting to pass arguments to computed properties fails or defeats caching
type: capability
tags: [vue3, computed, methods, parameters, common-mistake]
---

# 计算属性无法接受参数

**影响：中** - 计算属性旨在从无参数的反应状态导出值。尝试传递参数会破坏缓存机制或导致错误。使用返回函数的方法或计算属性。

## 任务清单

- [ ] 需要传递参数时使用方法
- [ ] 考虑参数是否可以改为反应状态
- [ ] 如果必须参数化，请了解返回函数会失去缓存优势
- [ ] 优先在模板中调用方法来进行参数化操作

**错误：**
```vue
<template>
  <!-- BAD: Computed properties don't accept parameters like this -->
  <p>{{ filteredItems('active') }}</p>
  <p>{{ formattedPrice(100, 'USD') }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([/* ... */])

// BAD: This won't work as expected
// Computed is called once, not per parameter
const filteredItems = computed((status) => {  // status will be undefined or previous value
  return items.value.filter(i => i.status === status)
})
</script>
```

```vue
<script>
export default {
  data() {
    return { items: [/* ... */] }
  },
  computed: {
    // BAD: Computed doesn't receive arguments
    filteredItems(status) {  // 'status' is actually 'this' or undefined
      return this.items.filter(i => i.status === status)
    }
  }
}
</script>
```

**正确：**
```vue
<template>
  <!-- GOOD: Use method for parameterized operations -->
  <p>{{ getFilteredItems('active') }}</p>
  <p>{{ formatPrice(100, 'USD') }}</p>

  <!-- GOOD: Or use computed with reactive filter state -->
  <select v-model="statusFilter">
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </select>
  <p>{{ filteredItems }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([/* ... */])
const statusFilter = ref('active')

// GOOD: Method for parameterized operations
function getFilteredItems(status) {
  return items.value.filter(i => i.status === status)
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// GOOD: Computed with reactive parameter
const filteredItems = computed(() => {
  return items.value.filter(i => i.status === statusFilter.value)
})
</script>
```

## 解决方法：计算返回函数

如果您需要带有参数的类似计算的内容，您可以返回一个函数。 **然而，这违背了缓存的好处：**

```vue
<template>
  <p>{{ getItemsByStatus('active') }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const items = ref([/* ... */])

// This works but provides NO caching benefit
// The inner function runs every time it's called
const getItemsByStatus = computed(() => {
  return (status) => items.value.filter(i => i.status === status)
})

// This is essentially equivalent to just using a method
// Only useful if you need to compose with other computed properties
</script>
```

## 何时使用每种方法

|场景 |方法|缓存 |
|----------|----------|---------|
|基于反应状态的固定滤波器 |计算|是的 |
|动态过滤器作为参数传递 |方法|没有 |
|从用户选择中筛选选项 |计算+反应参数 |是的 |
|使用可变参数进行格式化 |方法|没有 |
|带论证的组合推导|计算返回函数 |部分|

## 使参数具有响应式

最好的模式通常是使“参数”成为反应值：

```vue
<script setup>
import { ref, computed } from 'vue'

const items = ref([/* ... */])

// Instead of passing 'status' as a parameter:
const currentStatus = ref('active')

// Make a computed that uses the reactive status
const filteredItems = computed(() => {
  return items.value.filter(i => i.status === currentStatus.value)
})

// Change the filter by updating the ref
function filterByStatus(status) {
  currentStatus.value = status
}
</script>
```

## 参考
- [Vue.js 计算属性](https://vuejs.org/guide/essentials/computed.html)
- [Vue.js 方法](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#declaring-methods)
