---
title: 模板引用展开仅适用于顶级属性
impact: MEDIUM
impactDescription: Nested refs in template expressions render as [object Object] instead of their values
type: capability
tags: [vue3, reactivity, ref, template, unwrapping]
---

# 模板引用展开仅适用于顶级属性

**影响：中** - Vue 仅自动解开模板渲染上下文中顶级属性的引用。嵌套引用（对象内的引用）未在表达式中展开，导致 `[object Object]` 渲染或计算错误。

当开发者将引用存储在反应对象或普通对象中并尝试在 `{{ object.count + 1 }}` 等模板表达式中使用它们时，这个警告会让开发者陷入困境。

## 任务清单

- [ ] 将引用保留在设置返回或script setup 的顶层
- [ ] 在表达式中使用之前解构顶级变量的嵌套引用
- [ ] 请注意，文本插值 `{{ object.ref }}` 会解包，但表达式 `{{ object.ref + 1 }}` 不会解包
- [ ] 考虑重构数据以避免模板中嵌套引用

**错误：**
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const object = { id: ref(1) }
</script>

<template>
  <!-- WRONG: Nested ref in expression - does NOT unwrap -->
  <p>ID + 1 = {{ object.id + 1 }}</p>
  <!-- Renders: "ID + 1 = [object Object]1" -->

  <!-- Surprisingly, plain interpolation DOES work -->
  <p>ID = {{ object.id }}</p>
  <!-- Renders: "ID = 1" (unwrapped because it's the final expression) -->
</template>
```

**正确：**
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const object = { id: ref(1) }

// SOLUTION 1: Destructure to top-level
const { id } = object
</script>

<template>
  <!-- CORRECT: Top-level ref unwraps in all expressions -->
  <p>Count + 1 = {{ count + 1 }}</p>
  <!-- Renders: "Count + 1 = 1" -->

  <!-- CORRECT: Destructured ref is now top-level -->
  <p>ID + 1 = {{ id + 1 }}</p>
  <!-- Renders: "ID + 1 = 2" -->
</template>
```

```vue
<script setup>
import { ref, computed } from 'vue'

const object = { id: ref(1) }

// SOLUTION 2: Use computed for derived values
const idPlusOne = computed(() => object.id.value + 1)
</script>

<template>
  <!-- CORRECT: Computed handles the .value access -->
  <p>ID + 1 = {{ idPlusOne }}</p>
</template>
```

```vue
<script setup>
import { reactive } from 'vue'

// SOLUTION 3: Use reactive object instead (refs inside reactive auto-unwrap)
const object = reactive({ id: 1 })
</script>

<template>
  <!-- CORRECT: Plain reactive property works in expressions -->
  <p>ID + 1 = {{ object.id + 1 }}</p>
</template>
```

```javascript
// WHY this happens:
// - Template compilation only adds .value to top-level identifiers
// - {{ count + 1 }} compiles to: count.value + 1
// - {{ object.id + 1 }} compiles to: object.id + 1 (no .value added!)
// - Plain {{ object.id }} has special handling for display purposes
```

## 参考
- [Vue.js 响应式基础知识 - 在模板中展开时的警告](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#caveat-when-unwrapping-in-templates)
