---
title: 深度监视回调接收旧值和新值的相同对象引用
impact: MEDIUM
impactDescription: Comparing oldValue and newValue in deep watchers is misleading since they reference the same object
type: capability
tags: [vue3, watch, watchers, deep, oldValue, newValue, object-reference]
---

# Deep Watch 回调接收旧值和新值的相同对象引用

**影响：中** - 在反应对象上使用深度观察程序时，回调中的 `newValue` 和 `oldValue` 都指向相同的对象引用。对于嵌套突变，它们始终相等，因为 Vue 不会在突变之前克隆对象。

不要依赖深度观察程序中的 `newValue` 与 `oldValue` 的比较来检测发生了什么变化。相反，跟踪特定值或实现您自己的差异。

## 任务清单

- [ ] 不要在深度侦听器中比较 newValue === oldValue 来检测变化
- [ ] 对于更改检测，请改为观察特定属性
- [ ] 如果需要旧值，请在更改之前手动快照
- [ ] 考虑使用序列化方法来满足复杂的差异需求
- [ ] 仅当替换整个对象时，值才会不同

**错误：**
```javascript
import { reactive, watch } from 'vue'

const state = reactive({
  user: {
    name: 'John',
    preferences: { theme: 'dark' }
  }
})

// BAD: Trying to compare old and new values
watch(
  () => state.user,
  (newUser, oldUser) => {
    // This comparison is ALWAYS true for nested mutations!
    if (newUser === oldUser) {
      console.log('Same reference!')  // Always logs for nested changes
    }

    // This also won't work - they're the same object
    if (newUser.name !== oldUser.name) {
      console.log('Name changed')  // Never logs for nested mutations
    }
  },
  { deep: true }
)

// When this happens:
state.user.name = 'Jane'
// Both newUser and oldUser are { name: 'Jane', preferences: { theme: 'dark' } }
```

**正确：**
```javascript
import { reactive, watch, ref } from 'vue'

const state = reactive({
  user: {
    name: 'John',
    preferences: { theme: 'dark' }
  }
})

// CORRECT: Watch specific properties you care about
watch(
  () => state.user.name,
  (newName, oldName) => {
    console.log(`Name changed from "${oldName}" to "${newName}"`)
    // oldName and newName are primitives, work correctly
  }
)

// CORRECT: Watch multiple specific properties
watch(
  [() => state.user.name, () => state.user.preferences.theme],
  ([newName, newTheme], [oldName, oldTheme]) => {
    if (newName !== oldName) {
      console.log(`Name: ${oldName} -> ${newName}`)
    }
    if (newTheme !== oldTheme) {
      console.log(`Theme: ${oldTheme} -> ${newTheme}`)
    }
  }
)
```

## 手动快照模式

```javascript
import { reactive, watch, ref } from 'vue'

const state = reactive({ count: 0, items: [] })

// Keep a manual snapshot for comparison
const previousSnapshot = ref(JSON.stringify(state))

watch(
  state,
  (newState) => {
    const currentSnapshot = JSON.stringify(newState)

    if (currentSnapshot !== previousSnapshot.value) {
      const oldData = JSON.parse(previousSnapshot.value)
      console.log('Old:', oldData)
      console.log('New:', newState)

      // Update snapshot for next comparison
      previousSnapshot.value = currentSnapshot
    }
  },
  { deep: true }
)
```

## 当新旧价值观不同时

```javascript
import { reactive, watch } from 'vue'

const state = reactive({
  currentUser: { name: 'John' }
})

watch(
  () => state.currentUser,
  (newUser, oldUser) => {
    // THESE DIFFER when the object itself is replaced
    console.log('Old:', oldUser)  // { name: 'John' }
    console.log('New:', newUser)  // { name: 'Jane' }
  },
  { deep: true }
)

// Object replacement - old and new are different
state.currentUser = { name: 'Jane' }

// vs. Mutation - old and new are the same reference
// state.currentUser.name = 'Jane'
```

## 使用 Getter 返回新对象

```javascript
import { reactive, watch } from 'vue'

const state = reactive({
  user: { firstName: 'John', lastName: 'Doe' }
})

// CORRECT: Getter returns new object, so old/new comparison works
watch(
  () => ({ ...state.user }),  // Shallow clone
  (newUser, oldUser) => {
    // Now these are different objects
    console.log('Changed from', oldUser, 'to', newUser)
  },
  { deep: true }
)
```

## 参考
- [Vue.js 侦听器 - 深度侦听器](https://vuejs.org/guide/essentials/watchers.html#deep-watchers)
