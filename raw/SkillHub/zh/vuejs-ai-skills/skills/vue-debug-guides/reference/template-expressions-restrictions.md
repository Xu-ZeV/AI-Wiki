---
title: 模板表达式必须是单个表达式
impact: MEDIUM
impactDescription: Using statements instead of expressions in templates causes compilation errors
type: capability
tags: [vue3, template, expressions, interpolation, syntax]
---

# 模板表达式必须是单个表达式

**影响：中** - Vue 模板仅支持单个 JavaScript 表达式，而不支持语句。使用变量声明、if 语句或多个语句会导致模板编译错误。

模板插值 `{{ }}` 和指令绑定评估生成值的 JavaScript 表达式。不允许使用 `if`、`for` 等语句、变量声明或多行代码块。

## 任务清单

- [ ] 在 `{{ }}` 插值中仅使用单个表达式
- [ ] 使用三元运算符代替 if/else 语句
- [ ] 将复杂逻辑移至计算属性或方法
- [ ] 避免在模板中声明变量
- [ ] 使用 `v-if`/`v-else` 指令进行条件渲染

**错误：**
```vue
<template>
  <!-- ERROR: Variable declaration is a statement, not expression -->
  <p>{{ var greeting = 'Hello' }}</p>
  <p>{{ let x = 1 }}</p>
  <p>{{ const name = 'Vue' }}</p>

  <!-- ERROR: if statement not allowed -->
  <p>{{ if (ok) { return message } }}</p>
  <p>{{ if (user) return user.name }}</p>

  <!-- ERROR: Multiple statements not allowed -->
  <p>{{ count++; return count }}</p>
  <p>{{ items.push(newItem); items.length }}</p>

  <!-- ERROR: for/while loops not allowed -->
  <p>{{ for (let i = 0; i < 5; i++) { } }}</p>
</template>
```

**正确：**
```vue
<template>
  <!-- OK: Simple expressions -->
  <p>{{ message }}</p>
  <p>{{ count + 1 }}</p>
  <p>{{ items.length }}</p>

  <!-- OK: Ternary operators for conditionals -->
  <p>{{ ok ? 'YES' : 'NO' }}</p>
  <p>{{ user ? user.name : 'Guest' }}</p>
  <p>{{ score >= 60 ? 'Pass' : 'Fail' }}</p>

  <!-- OK: Method/function calls -->
  <p>{{ formatDate(date) }}</p>
  <p>{{ items.filter(i => i.active).length }}</p>

  <!-- OK: Chained expressions -->
  <p>{{ message.split('').reverse().join('') }}</p>

  <!-- OK: Template literals -->
  <p>{{ `Hello, ${name}!` }}</p>

  <!-- OK: Object/array expressions -->
  <p>{{ { name: 'Vue', version: 3 } }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const ok = ref(true)
const message = ref('Hello')
const user = ref({ name: 'Alice' })
const score = ref(85)

// Move complex logic to computed properties
const greeting = computed(() => {
  if (user.value) {
    return `Welcome back, ${user.value.name}!`
  }
  return 'Hello, Guest!'
})

// Or use methods for reusable logic
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
</script>
```

## 使用指令控制流

```vue
<template>
  <!-- Instead of if/else in expressions, use v-if/v-else -->
  <p v-if="user">Welcome, {{ user.name }}!</p>
  <p v-else>Please log in</p>

  <!-- Instead of loops in expressions, use v-for -->
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>

  <!-- Conditional display without removing from DOM -->
  <p v-show="isVisible">This toggles visibility</p>
</template>
```

## 参考
- [Vue.js 模板语法 - 使用 JavaScript 表达式](https://vuejs.org/guide/essentials/template-syntax.html#using-javascript-expressions)
- [Vue.js 条件渲染](https://vuejs.org/guide/essentials/conditional.html)
