---
title: 切勿在同一元素上使用 v-if 和 v-for
impact: HIGH
impactDescription: Causes confusing precedence issues and Vue 2 to 3 migration bugs
type: capability
tags: [vue3, v-if, v-for, conditional-rendering, list-rendering, eslint]
---

# 切勿在同一元素上使用 v-if 和 v-for

**影响：高** - 在同一元素上使用 `v-if` 和 `v-for` 会产生 Vue 2 和 Vue 3 之间不同的不明确优先级。在 Vue 2 中，`v-for` 具有更高的优先级；在Vue 3中，`v-if`具有更高的优先级。这一重大更改会在迁移过程中导致细微的错误，并使代码意图不清楚。

ESLint 规则 `vue/no-use-v-if-with-v-for` 强制执行此最佳实践。

## 任务清单

- [ ] 切勿将 v-if 和 v-for 放在同一元素上
- [ ] 用于过滤列表项：使用过滤数组的计算属性
- [ ] 隐藏整个列表：用 `<template v-if>` 围绕 v-for
- [ ] 启用 eslint-plugin-vue 规则 `vue/no-use-v-if-with-v-for`

**错误：**
```html
<!-- WRONG: v-if and v-for on same element - ambiguous precedence -->
<template>
  <!-- Intent: show only active users -->
  <li v-for="user in users" v-if="user.isActive" :key="user.id">
    {{ user.name }}
  </li>
</template>
```

```html
<!-- WRONG: Hiding entire list conditionally -->
<template>
  <li v-for="user in users" v-if="shouldShowList" :key="user.id">
    {{ user.name }}
  </li>
</template>
```

```html
<!-- WRONG: Vue 3 precedence issue -->
<template>
  <!-- In Vue 3, v-if runs FIRST, so 'user' is undefined! -->
  <li v-for="user in users" v-if="user.isActive" :key="user.id">
    {{ user.name }}
  </li>
  <!-- Error: Cannot read property 'isActive' of undefined -->
</template>
```

**正确：**
```html
<!-- CORRECT: Filter with computed property -->
<template>
  <li v-for="user in activeUsers" :key="user.id">
    {{ user.name }}
  </li>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps(['users'])

const activeUsers = computed(() =>
  props.users.filter(user => user.isActive)
)
</script>
```

```html
<!-- CORRECT: Wrap with <template v-if> for conditional list -->
<template>
  <template v-if="shouldShowList">
    <li v-for="user in users" :key="user.id">
      {{ user.name }}
    </li>
  </template>
</template>
```

```html
<!-- CORRECT: v-if inside the loop (per-item condition) -->
<template>
  <ul>
    <template v-for="user in users" :key="user.id">
      <li v-if="user.isActive">
        {{ user.name }}
      </li>
    </template>
  </ul>
</template>
```

## Vue 2 与 Vue 3 优先级变化

```javascript
// Vue 2: v-for evaluated first
// <li v-for="user in users" v-if="user.isActive">
// Equivalent to: users.forEach(user => { if (user.isActive) render(user) })

// Vue 3: v-if evaluated first
// <li v-for="user in users" v-if="user.isActive">
// Equivalent to: if (user.isActive) users.forEach(user => render(user))
// Problem: 'user' doesn't exist yet when v-if runs!
```

## 为什么计算属性更好

```javascript
// Benefits of filtering via computed:
// 1. Clear separation of concerns (logic vs template)
// 2. Cached - only recalculates when dependencies change
// 3. Reusable - can be used elsewhere in component
// 4. Testable - can unit test the filtering logic
// 5. No ambiguity about intent

const activeUsers = computed(() =>
  users.value.filter(u => u.isActive)
)

// Can add more complex filtering
const filteredUsers = computed(() =>
  users.value
    .filter(u => u.isActive)
    .filter(u => u.role === selectedRole.value)
    .sort((a, b) => a.name.localeCompare(b.name))
)
```

## 参考
- [Vue.js 风格指南 - 避免使用 v-if 和 v-for](https://vuejs.org/style-guide/rules-essential.html#avoid-v-if-with-v-for)
- [Vue 3 迁移指南 - v-if 与 v-for 优先级](https://v3-migration.vuejs.org/breaking-changes/v-if-v-for)
- [ESLint 插件 Vue - no-use-v-if-with-v-for](https://eslint.vuejs.org/rules/no-use-v-if-with-v-for)
