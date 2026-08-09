---
title: 在 JavaScript 中访问 ref() 时始终使用 .value
impact: HIGH
impactDescription: Forgetting .value causes silent failures and bugs in reactive state updates
type: capability
tags: [vue3, reactivity, ref, composition-api]
---

# 在 JavaScript 中访问 ref() 时始终使用 .value

**影响：高** - 忘记 `.value` 会导致静默故障，其中状态更新不会触发响应式，从而导致难以调试的问题。

当在 Vue 3 的 Composition API 中使用 `ref()` 时，反应值被包装在一个对象中，并且必须通过 JavaScript 代码中的 `.value` 进行访问。但是，在模板中，Vue 会自动解开引用，因此那里不需要 `.value`。这种不一致是错误的常见来源。

## 任务清单

- [ ] 在 `<script>` 或 `.js`/`.ts` 文件中读取或写入参考值时始终使用 `.value`
- [ ] 切勿在 `<template>` 中使用 `.value` - Vue 会自动在那里解开引用
- [ ] 向函数传递ref时，决定是传递ref对象还是`.value`
- [ ] 使用 IDE/TypeScript 尽早捕获丢失的 `.value` 错误

**错误：**
```javascript
import { ref } from 'vue'

const count = ref(0)

// These do NOT work as expected
count++           // Tries to increment the ref object, not the value
count = 5         // Reassigns the variable, loses reactivity
console.log(count) // Logs "[object Object]", not the number

const items = ref([1, 2, 3])
items.push(4)     // Error: push is not a function
```

**正确：**
```javascript
import { ref } from 'vue'

const count = ref(0)

// Always use .value in JavaScript
count.value++           // Correctly increments to 1
count.value = 5         // Correctly sets value to 5
console.log(count.value) // Logs "5"

const items = ref([1, 2, 3])
items.value.push(4)     // Correctly adds 4 to the array
```

```vue
<template>
  <!-- In templates, NO .value needed - Vue unwraps automatically -->
  <p>{{ count }}</p>
  <button @click="count++">Increment</button>
</template>
```

## 参考
- [Vue.js 响应式基础知识 - ref()](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#ref)
