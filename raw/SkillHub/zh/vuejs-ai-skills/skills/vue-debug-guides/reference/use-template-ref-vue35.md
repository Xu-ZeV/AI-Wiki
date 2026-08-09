---
title: 在 Vue 3.5+ 中使用 useTemplateRef 作为模板引用
impact: MEDIUM
impactDescription: Legacy ref pattern is error-prone due to name matching requirement
type: best-practice
tags: [vue3, vue35, template-refs, useTemplateRef, composition-api]
---

# 在 Vue 3.5+ 中使用 useTemplateRef 作为模板引用

**影响：中度** - 在 Vue 3.5 之前，模板引用需要声明 `ref()`，其名称与模板的 ref 属性完全匹配。这种脆弱的连接在重构过程中悄然断裂。 Vue 3.5 的 `useTemplateRef()` 通过显式绑定和更好的 TypeScript 支持消除了这个问题。

当名称不匹配时，旧模式不会导致错误或警告 - 引用只是保持为空，从而导致调试会话混乱。

## 任务清单

- [ ] 在Vue 3.5+项目中使用`useTemplateRef('ref-name')`
- [ ] 第一个参数必须与模板中的 ref 属性值完全匹配
- [ ] IDE 支持为可用的引用名称提供自动完成功能
- [ ] TypeScript 自动推断元素类型

**不正确（旧模式）：**
```vue
<script setup>
import { ref, onMounted } from 'vue'

// FRAGILE: Variable name MUST match template ref value exactly
const input = ref(null)

// DANGER: After refactoring, names may not match
const inputElement = ref(null) // Renamed variable...

onMounted(() => {
  // NO ERROR - just silently null!
  inputElement.value?.focus() // Does nothing
})
</script>

<template>
  <!-- But template still uses old name -->
  <input ref="input" />
</template>
```

```vue
<script setup>
import { ref } from 'vue'

// TYPO: 'inupt' instead of 'input' - no warning!
const inupt = ref(null)
</script>

<template>
  <input ref="input" />
  <!-- inupt.value will always be null -->
</template>
```

**正确（Vue 3.5+）：**
```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

// CORRECT: Explicit binding - argument matches template ref
const inputElement = useTemplateRef('my-input')

onMounted(() => {
  inputElement.value?.focus()
})
</script>

<template>
  <!-- ref name is explicitly connected via useTemplateRef argument -->
  <input ref="my-input" />
</template>
```

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

// BENEFITS:
// 1. Variable name is independent of ref attribute
// 2. IDE auto-completes available ref names
// 3. TypeScript infers correct element type
// 4. Typos in argument cause visible errors

const searchInput = useTemplateRef('search-box')
const submitButton = useTemplateRef('submit-btn')

onMounted(() => {
  // TypeScript knows these are HTMLInputElement and HTMLButtonElement
  searchInput.value?.focus()
  submitButton.value?.disabled = false
})
</script>

<template>
  <input ref="search-box" type="search" />
  <button ref="submit-btn">Submit</button>
</template>
```

## 限制：v-for Refs

`useTemplateRef()` **不能**与 `v-for` 参考一起使用。您必须使用旧版 `ref()` 模式来收集循环中的多个元素引用。

```vue
<script setup>
import { ref, onMounted } from 'vue'

// CORRECT: Legacy pattern required for v-for refs
const itemRefs = ref([])

onMounted(() => {
  // itemRefs.value is an array of DOM elements
  itemRefs.value.forEach(el => {
    console.log(el.textContent)
  })
})
</script>

<template>
  <ul>
    <li v-for="item in items" ref="itemRefs" :key="item.id">
      {{ item.text }}
    </li>
  </ul>
</template>
```

**为什么存在此限制：** 当使用 `v-for` 时，Vue 使用元素数组填充 ref。 `useTemplateRef()` API 专为单元素引用而设计，不支持 `v-for` 所需的数组填充机制。

## 迁移指南

```vue
<!-- BEFORE (Vue < 3.5) -->
<script setup>
import { ref } from 'vue'
const myElement = ref(null) // Name must match template
</script>
<template>
  <div ref="myElement"></div>
</template>

<!-- AFTER (Vue 3.5+) -->
<script setup>
import { useTemplateRef } from 'vue'
const element = useTemplateRef('my-element') // Any variable name
</script>
<template>
  <div ref="my-element"></div>
</template>
```

## 参考
- [Vue.js 模板 ref - 组合 API](https://vuejs.org/guide/essentials/template-refs.html#accessing-the-refs)
- [Vue 3.5 发行说明](https://blog.vuejs.org/posts/vue-3-5)
