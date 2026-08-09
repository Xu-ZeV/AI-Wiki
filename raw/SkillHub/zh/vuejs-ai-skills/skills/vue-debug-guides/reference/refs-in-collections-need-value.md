---
title: 数组和集合中的引用需要 .value
impact: MEDIUM
impactDescription: Refs inside reactive arrays, Maps, or Sets are NOT auto-unwrapped like in reactive objects
type: capability
tags: [vue3, reactivity, ref, arrays, collections, unwrapping]
---

# 数组和集合中的引用需要 .value

**影响：中** - 与 ref 是响应式对象的属性时不同，响应式数组、Map 和 Set 内的 ref 不会自动解包。您必须使用 `.value` 访问它们，忘记这一点会导致无声错误。

Vue 仅当引用是响应式对象的属性时才自动展开引用。当 refs 是数组中的元素或映射/集合中的值时，它们仍然是 ref 对象，并且需要显式 `.value` 访问。

## 任务清单

- [ ] 访问响应式数组中存储的引用时始终使用 `.value`
- [ ] 访问响应式映射或集合中存储的引用时始终使用 `.value`
- [ ] 考虑在集合中存储普通值而不是引用以避免混淆
- [ ] 迭代包含 refs 的数组时请注意这一点

**错误：**
```javascript
import { ref, reactive } from 'vue'

const books = reactive([ref('Vue 3 Guide')])
const counts = reactive(new Map([['clicks', ref(0)]]))

// WRONG: Refs in arrays are NOT unwrapped
console.log(books[0])        // Ref object, not 'Vue 3 Guide'
books[0] = 'New Title'       // Replaces the ref, doesn't update it!

// WRONG: Refs in Maps are NOT unwrapped
console.log(counts.get('clicks'))     // Ref object, not 0
counts.get('clicks')++                // Does nothing useful
```

**正确：**
```javascript
import { ref, reactive } from 'vue'

const books = reactive([ref('Vue 3 Guide')])
const counts = reactive(new Map([['clicks', ref(0)]]))

// CORRECT: Use .value for refs in arrays
console.log(books[0].value)    // 'Vue 3 Guide'
books[0].value = 'New Title'   // Updates the ref's value

// CORRECT: Use .value for refs in Maps
console.log(counts.get('clicks').value)  // 0
counts.get('clicks').value++             // Increments to 1
```

```javascript
// ALTERNATIVE: Just store plain values in collections (simpler)
const books = reactive(['Vue 3 Guide', 'Vuex Handbook'])
const counts = reactive(new Map([['clicks', 0]]))

// No .value needed - but changes to individual items aren't independently reactive
console.log(books[0])            // 'Vue 3 Guide'
console.log(counts.get('clicks')) // 0

// Mutations still trigger reactivity through the reactive wrapper
books[0] = 'New Title'           // Works
counts.set('clicks', counts.get('clicks') + 1)  // Works
```

```vue
<template>
  <!-- In templates, refs in arrays also need special handling -->
  <div v-for="(book, index) in books" :key="index">
    <!-- If book is a ref, you'd need: -->
    {{ book.value }}

    <!-- Or use computed to unwrap them first -->
  </div>
</template>
```

## 参考
- [Vue.js 响应式基础知识 - 数组和集合中的注意事项](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#caveat-in-arrays-and-collections)
