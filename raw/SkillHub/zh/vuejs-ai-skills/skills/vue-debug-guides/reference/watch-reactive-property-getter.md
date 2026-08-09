---
title: 查看响应式对象属性时使用 Getter 函数
impact: HIGH
impactDescription: Watching reactive properties directly passes a primitive value, causing the watcher to never trigger
type: capability
tags: [vue3, watch, watchers, reactive, getter, common-mistake]
---

# 查看响应式对象属性时使用 Getter 函数

**影响：高** - 直接观察响应式对象的属性将原始值传递给 `watch()`，而不是响应式引用。侦听器永远不会触发，因为原语不是响应式的。

当您需要观察响应式对象的特定属性时，请始终将其包装在 getter 函数 `() => obj.property` 中。

## 任务清单

- [ ] 在观察响应式对象的属性时始终使用 getter 函数
- [ ] 请记住，`watch(obj.count, ...)` 传递的是当前值，而不是响应式参考值
- [ ] 参考可直接观看：`watch(myRef, ...)`
- [ ] 对于整个反应对象，您可以直接观察（创建隐式深度侦听器）

**错误：**
```javascript
import { reactive, watch } from 'vue'

const state = reactive({ count: 0, name: 'Vue' })

// WRONG: Passes the number 0 to watch(), not a reactive reference
// This watcher will NEVER fire!
watch(state.count, (newCount) => {
  console.log(`Count changed to: ${newCount}`)
})

// WRONG: Same problem with string property
watch(state.name, (newName) => {
  console.log(`Name changed to: ${newName}`)
})
```

**正确：**
```javascript
import { reactive, watch } from 'vue'

const state = reactive({ count: 0, name: 'Vue' })

// CORRECT: Use a getter function
watch(
  () => state.count,
  (newCount, oldCount) => {
    console.log(`Count changed from ${oldCount} to ${newCount}`)
  }
)

// CORRECT: Multiple properties with getter
watch(
  () => state.name,
  (newName) => {
    console.log(`Name changed to: ${newName}`)
  }
)

// CORRECT: Watching derived values
watch(
  () => state.count * 2,
  (doubledCount) => {
    console.log(`Doubled count: ${doubledCount}`)
  }
)
```

## 查看多个属性

```javascript
import { reactive, watch } from 'vue'

const state = reactive({ firstName: 'John', lastName: 'Doe' })

// Watch multiple properties with array of getters
watch(
  [() => state.firstName, () => state.lastName],
  ([newFirst, newLast], [oldFirst, oldLast]) => {
    console.log(`Name changed from ${oldFirst} ${oldLast} to ${newFirst} ${newLast}`)
  }
)
```

## 当直接观看有效时

```javascript
import { ref, reactive, watch } from 'vue'

const count = ref(0)
const state = reactive({ nested: { value: 1 } })

// CORRECT: Refs can be watched directly
watch(count, (newVal) => {
  console.log(`Count: ${newVal}`)
})

// CORRECT: Entire reactive objects create implicit deep watcher
watch(state, (newState) => {
  // Fires on any nested change
  // Note: newState === oldState (same object reference)
})
```

## 参考
- [Vue.js 侦听器 - 侦听器源类型](https://vuejs.org/guide/essentials/watchers.html#watch-source-types)
