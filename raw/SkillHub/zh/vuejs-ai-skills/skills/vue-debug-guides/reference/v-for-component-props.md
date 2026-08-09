---
title: 始终通过 Props 将 v-for 数据传递给组件
impact: MEDIUM
impactDescription: Components have isolated scope - v-for iteration data is not automatically available inside child components
type: gotcha
tags: [vue3, v-for, components, props, list-rendering]
---

# 始终通过 Props 将 v-for 数据传递给组件

**影响：中** - Vue 组件在设计上具有隔离范围。当使用 `v-for` 渲染组件时，迭代变量（例如 `item`）在子组件内不会自动可用。您必须通过 props 显式传递数据。

这种隔离是有意为之的——它使组件保持可重用性，并且它们的数据依赖关系是明确的。忘记传递 props 会导致 `undefined` 数据或有关丢失属性的错误。

## 任务清单

- [ ] 始终将迭代数据显式绑定到组件 props
- [ ] 如果组件需要，则传递项目和索引
- [ ] 使用 v-for 渲染组件时始终包含唯一的 `:key`
- [ ] 在子组件中定义相应的props来接收数据

**错误：**
```html
<!-- WRONG: Component cannot access 'todo' - it's not in scope -->
<TodoItem v-for="todo in todos" :key="todo.id" />

<!-- Inside TodoItem.vue: this.todo or todo is undefined! -->
```

```html
<!-- WRONG: Key provided but no data passed -->
<UserCard
  v-for="user in users"
  :key="user.id"
/>
<!-- UserCard has no user data to display -->
```

**正确：**
```html
<!-- CORRECT: Explicitly pass the item as a prop -->
<TodoItem
  v-for="todo in todos"
  :key="todo.id"
  :todo="todo"
/>
```

```html
<!-- CORRECT: Pass multiple pieces of data -->
<UserCard
  v-for="(user, index) in users"
  :key="user.id"
  :user="user"
  :index="index"
  :is-first="index === 0"
/>
```

```vue
<!-- Child component: UserCard.vue -->
<script setup>
defineProps({
  user: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  isFirst: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="user-card">
    <span>{{ index + 1 }}. {{ user.name }}</span>
    <span v-if="isFirst">(First User)</span>
  </div>
</template>
```

## 为什么要显式props？

1. **清晰的数据流**：使依赖关系明确且可追踪
2. **可重用性**：组件可以在任何地方工作，而不仅仅是在特定的 v-for 循环内
3. **类型安全**：可以通过类型和所需的检查来验证props
4. **可维护性**：更容易理解组件需要哪些数据

## 参考
- [Vue.js 列表渲染 - v-for 带组件](https://vuejs.org/guide/essentials/list.html#v-for-with-a-component)
