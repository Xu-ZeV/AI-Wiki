---
title: SFC 脚本块必须仅使用默认导出
impact: HIGH
impactDescription: Named exports in SFC script blocks will fail silently or cause build errors - Vue expects exactly one default export
type: gotcha
tags: [vue3, sfc, export, script-block, composition-api]
---

# SFC 脚本块必须仅使用默认导出

**影响：高** - Vue 单文件组件期望从 `<script>` 块中精确导出一个默认导出。对组件使用命名导出将导致构建失败或运行时错误，因为 Vue 的工具旨在处理每个 `.vue` 文件的单个默认导出组件定义。

## 任务清单

- [ ] 始终在 `<script>` 块中使用 `export default`（选项 API）
- [ ] 使用 `<script setup>` 自动处理导出（Composition API）
- [ ] 将共享实用程序移动到单独的 `.js`/`.ts` 文件，而不是组件的脚本块
- [ ] 如果需要导出类型，请与 `<script setup>` 一起使用单独的 `<script>` 块

**有问题的代码：**
```vue
<!-- MyComponent.vue -->
<script>
// BAD: Named exports don't work for the component itself
export const MyComponent = {
  data() {
    return { count: 0 }
  }
}

// BAD: Exporting multiple things from component script
export const CONSTANT = 42
export function helper() { }
</script>

<template>
  <div>{{ count }}</div>
</template>
```

**正确代码：**
```vue
<!-- MyComponent.vue - Options API -->
<script>
// GOOD: Single default export
export default {
  data() {
    return { count: 0 }
  }
}
</script>

<template>
  <div>{{ count }}</div>
</template>
```

```vue
<!-- MyComponent.vue - Composition API with script setup -->
<script setup>
// GOOD: No export needed, component is auto-exported
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>{{ count }}</div>
</template>
```

## 与script setup一起导出类型

对于 TypeScript，使用单独的常规脚本块进行类型导出：

```vue
<script lang="ts">
// Regular script block for exports
export interface User {
  id: number
  name: string
}

export type Status = 'pending' | 'active' | 'inactive'
</script>

<script setup lang="ts">
// Setup script for component logic
import { ref } from 'vue'

const users = ref<User[]>([])
</script>

<template>
  <ul>
    <li v-for="user in users" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

## 跨组件共享实用程序

不要将共享代码放在组件脚本块中。创建单独的文件：

```typescript
// utils/constants.ts
export const ITEMS_PER_PAGE = 20
export const API_BASE_URL = '/api/v1'

// utils/helpers.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString()
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}
```

```vue
<!-- ProductList.vue -->
<script setup>
// GOOD: Import shared utilities from external files
import { ITEMS_PER_PAGE } from '@/utils/constants'
import { formatCurrency } from '@/utils/helpers'
import { ref } from 'vue'

const products = ref([])
</script>
```

## 为什么存在此限制

Vue 的 SFC 编译器和构建工具期望：

1. **每个文件一个组件**：`.vue` 文件格式专为单组件定义而设计
2. **可预测的结构**：Volar、vue-tsc 和捆绑器插件等工具假定默认导出
3. **热模块替换**：HMR 依赖于每个文件单个组件的约定

```javascript
// How Vue tooling processes SFCs internally
import MyComponent from './MyComponent.vue'
// ^ Always expects the default export to be the component
```

## 常见错误：通过 SFC 导出重用代码

```vue
<!-- BAD PATTERN: Trying to reuse code from components -->
<script>
// This won't work as expected
export const sharedLogic = () => { ... }

export default {
  // component definition
}
</script>
```

相反，使用可组合函数：

```typescript
// composables/useSharedLogic.ts
export function useSharedLogic() {
  // Shared reactive logic
  const state = ref(0)
  const increment = () => state.value++

  return { state, increment }
}
```

```vue
<!-- ComponentA.vue -->
<script setup>
import { useSharedLogic } from '@/composables/useSharedLogic'

const { state, increment } = useSharedLogic()
</script>
```

## 参考
- [Vue.js SFC规范](https://vuejs.org/api/sfc-spec.html)
- [Vue.js 组合 API - 可组合函数](https://vuejs.org/guide/reusability/composables.html)
