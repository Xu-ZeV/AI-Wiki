---
title: 从计算属性返回稳定的对象引用
impact: MEDIUM
impactDescription: Computed properties returning new objects trigger effects even when values haven't meaningfully changed
type: efficiency
tags: [vue3, computed, performance, reactivity, vue3.4]
---

# 从计算属性返回稳定的对象引用

**影响：中** - 在 Vue 3.4+ 中，计算属性仅在其值发生变化时触发效果。但是，如果计算每次都返回一个新对象，Vue 无法检测到里面的值是否相同。这会导致不必要的效果重新运行。

对于原始值，Vue 3.4+ 会自动处理。对于对象，当没有任何有意义的变化时，手动比较并返回先前的值。

## 任务清单

- [ ] 对于返回基元的计算属性，Vue 3.4+ 自动处理稳定性
- [ ] 对于返回对象的计算属性，与之前的值进行比较，如果未更改则返回旧引用
- [ ] 在比较之前始终执行完整计算（以正确跟踪依赖关系）
- [ ] 考虑是否真的需要返回一个对象，或者基元是否足够

**错误：**
```vue
<script setup>
import { ref, computed, watchEffect } from 'vue'

const count = ref(0)

// BAD: Returns new object every time, always triggers effects
const stats = computed(() => {
  return {
    isEven: count.value % 2 === 0,
    doubleValue: count.value * 2
  }
})

watchEffect(() => {
  console.log('Stats changed:', stats.value)
  // Logs on EVERY count change, even when isEven hasn't changed
  // count: 0 -> 2 -> 4: isEven is always true, but effect runs each time
})
</script>
```

**正确：**
```vue
<script setup>
import { ref, computed, watchEffect } from 'vue'

const count = ref(0)

// GOOD (Vue 3.4+): Primitive computed - automatic stability
const isEven = computed(() => count.value % 2 === 0)

watchEffect(() => {
  console.log('isEven:', isEven.value)
  // Only logs when isEven actually changes (0, 2, 4 won't re-trigger)
})

// GOOD (Vue 3.4+): Manual comparison for object returns
const stats = computed((oldValue) => {
  // Step 1: Always compute the new value first (to track dependencies)
  const newValue = {
    isEven: count.value % 2 === 0,
    category: count.value < 10 ? 'small' : 'large'
  }

  // Step 2: Compare with previous value
  if (oldValue &&
      oldValue.isEven === newValue.isEven &&
      oldValue.category === newValue.category) {
    return oldValue  // Return old reference - no effect triggers
  }

  return newValue
})

watchEffect(() => {
  console.log('Stats changed:', stats.value)
  // Now only logs when isEven or category actually changes
})
</script>
```

## 原始与对象计算行为 (Vue 3.4+)

```javascript
import { ref, computed, watchEffect } from 'vue'

const count = ref(0)

// PRIMITIVE: Vue automatically detects value hasn't changed
const isEven = computed(() => count.value % 2 === 0)

watchEffect(() => console.log(isEven.value))  // true

count.value = 2  // isEven still true - NO log
count.value = 4  // isEven still true - NO log
count.value = 3  // isEven now false - logs: false

// OBJECT: New reference every time (without manual comparison)
const obj = computed(() => ({ isEven: count.value % 2 === 0 }))

watchEffect(() => console.log(obj.value))  // { isEven: true }

count.value = 2  // Logs again! New object reference
count.value = 4  // Logs again! New object reference
```

## 高级：深度对象比较

```javascript
import { ref, computed } from 'vue'
import { isEqual } from 'lodash-es'  // For deep comparison

const filters = ref({ category: 'all', sortBy: 'date', page: 1 })

// For complex objects, use deep comparison
const activeFilters = computed((oldValue) => {
  const newValue = {
    ...filters.value,
    hasFilters: filters.value.category !== 'all' || filters.value.sortBy !== 'date'
  }

  // Deep compare for complex objects
  if (oldValue && isEqual(oldValue, newValue)) {
    return oldValue
  }

  return newValue
})
```

## 重要提示：始终在比较之前进行计算

```javascript
// BAD: Early return prevents dependency tracking
const optimized = computed((oldValue) => {
  if (oldValue && someCondition) {
    return oldValue  // Dependencies not tracked!
  }
  return computeExpensiveValue()
})

// GOOD: Compute first, then compare
const optimized = computed((oldValue) => {
  const newValue = computeExpensiveValue()  // Always track dependencies
  if (oldValue && newValue === oldValue) {
    return oldValue
  }
  return newValue
})
```

## 参考
- [Vue.js 性能 - 计算稳定性](https://vuejs.org/guide/best-practices/performance.html#computed-stability)
- [Vue.js 计算属性](https://vuejs.org/guide/essentials/computed.html)
