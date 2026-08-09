---
title: 避免将响应式对象与 === 运算符进行比较
impact: HIGH
impactDescription: Reactive proxies have different identity than original objects - comparison bugs are silent and hard to debug
type: gotcha
tags: [vue3, reactivity, proxy, comparison, debugging, identity]
---

# 避免将响应式对象与 === 运算符进行比较

**影响：高** - Vue 的 `reactive()` 返回一个与原始对象具有不同标识的代理包装器。使用 `===` 比较响应式对象可能会导致无提示错误，其中比较意外返回 `false`。

当您使用 `reactive()` 包装对象时，返回的代理不等于原始对象。此外，从响应式对象访问嵌套对象每次都会返回新的代理包装器，这可能会导致身份比较问题。

## 任务清单

- [ ] 切勿直接将响应式对象实例与 `===` 进行比较
- [ ] 使用唯一标识符（ID、UUID）进行对象比较
- [ ] 当绝对需要进行身份比较时，两边都使用 `toRaw()`
- [ ] 考虑使用数据库记录中的原始标识符进行比较

**错误：**
```javascript
import { reactive } from 'vue'

const original = { id: 1, name: 'Item' }
const state = reactive(original)

// BUG: Always returns false - proxy !== original
if (state === original) {
  console.log('Same object') // Never executes
}

// BUG: Nested object comparison fails
const items = reactive([{ id: 1 }, { id: 2 }])
const item = items[0]

// Later...
if (items[0] === item) {
  // May or may not work depending on Vue's proxy caching
}

// BUG: Comparing items from different reactive sources
const listA = reactive([{ id: 1 }])
const listB = reactive([{ id: 1 }])
if (listA[0] === listB[0]) {
  // Never true, even though they represent the same data
}
```

**正确：**
```javascript
import { reactive, toRaw } from 'vue'

const original = { id: 1, name: 'Item' }
const state = reactive(original)

// CORRECT: Use toRaw() for identity comparison
if (toRaw(state) === original) {
  console.log('Same underlying object') // Works!
}

// BEST: Use unique identifiers instead
const items = reactive([
  { id: 'uuid-1', name: 'Item 1' },
  { id: 'uuid-2', name: 'Item 2' }
])

function findItem(targetId) {
  return items.find(item => item.id === targetId)
}

function isSelected(item) {
  return selectedId.value === item.id // Compare IDs, not objects
}

// CORRECT: For Set/Map operations, use primitive keys
const selectedIds = reactive(new Set())
selectedIds.add(item.id)  // Use ID, not object
selectedIds.has(item.id)  // Check by ID
```

```javascript
// When you must compare objects, use toRaw on both sides
import { toRaw, isReactive } from 'vue'

function areEqual(a, b) {
  const rawA = isReactive(a) ? toRaw(a) : a
  const rawB = isReactive(b) ? toRaw(b) : b
  return rawA === rawB
}
```

## 参考
- [Vue.js 深度反应](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Vue.js toRaw() API](https://vuejs.org/api/reactivity-advanced.html#toraw)
