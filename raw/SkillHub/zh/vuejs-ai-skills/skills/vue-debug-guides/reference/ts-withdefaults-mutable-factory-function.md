---
title: 将可变默认值包装在工厂函数中
impact: HIGH
impactDescription: Without factory functions, all component instances share the same mutable reference causing cross-contamination bugs
type: gotcha
tags: [vue3, typescript, props, withDefaults, mutable-types]
---

# 将可变默认值包装在工厂函数中

**影响：高** - 当将 `withDefaults()` 与基于类型的 props 声明一起使用时，可变类型（数组和对象）的默认值必须包装在工厂函数中。如果没有这个，所有组件实例都会共享相同的引用，从而导致在一个实例中修改 prop 会影响所有其他实例的错误。

## 任务清单

- [ ] 始终将数组默认值包装在工厂函数中：`() => []`
- [ ] 始终将对象默认值包装在工厂函数中：`() => ({})`
- [ ] 原始类型（字符串、数字、布尔值）不需要工厂函数
- [ ] 检查此模式的现有组件

## 问题：共享可变引用

**错误 - 跨实例共享引用：**
```vue
<script setup lang="ts">
interface Props {
  items?: string[]
  config?: { theme: string }
}

const props = withDefaults(defineProps<Props>(), {
  items: ['default'],           // WRONG! All instances share this array
  config: { theme: 'light' }    // WRONG! All instances share this object
})
</script>
```

当您有此组件的多个实例时：
```vue
<template>
  <!-- Both share the SAME items array! -->
  <MyComponent ref="comp1" />
  <MyComponent ref="comp2" />
</template>

<script setup>
// If comp1 modifies its items, comp2's items change too!
comp1.value.items.push('new item')  // comp2 also has 'new item' now
</script>
```

## 解决方案：工厂函数

**正确 - 每个组件都有唯一的实例：**
```vue
<script setup lang="ts">
interface Props {
  items?: string[]
  config?: { theme: string }
  nested?: { data: { values: number[] } }
}

const props = withDefaults(defineProps<Props>(), {
  items: () => ['default'],                      // Factory function!
  config: () => ({ theme: 'light' }),            // Factory function!
  nested: () => ({ data: { values: [] } })       // Factory function!
})
</script>
```

## 当需要工厂函数时

|类型 |工厂要求|默认示例 |
|------|-----------------|-----------------|
| `string` |没有 | `'hello'` |
| `number` |没有 | `42` |
| `boolean` |没有 | `false` |
| `string[]` | **是** | `() => []` |
| `number[]` | **是** | `() => [1, 2, 3]` |
| `object` | **是** | `() => ({})` |
| `Map` | **是** | `() => new Map()` |
| `Set` | **是** | `() => new Set()` |
| `Date` | **是** | `() => new Date()` |

## 完整示例

```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
}

interface Props {
  // Primitives - no factory needed
  title?: string
  count?: number
  disabled?: boolean

  // Mutable types - factory required
  items?: string[]
  users?: User[]
  metadata?: Record<string, unknown>
  selectedIds?: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
  // Primitives
  title: 'Default Title',
  count: 0,
  disabled: false,

  // Mutable types with factory functions
  items: () => [],
  users: () => [],
  metadata: () => ({}),
  selectedIds: () => new Set()
})
</script>
```

## Vue 3.5+ 响应式 Props 解构

Vue 3.5 引入了响应式 props 解构，它会自动处理这个问题：

```vue
<script setup lang="ts">
interface Props {
  items?: string[]
  config?: { theme: string }
}

// Vue 3.5+ - defaults work correctly without explicit factory functions
const {
  items = ['default'],        // Each instance gets its own array
  config = { theme: 'light' } // Each instance gets its own object
} = defineProps<Props>()
</script>
```

注意：在底层，Vue 3.5 会为您处理实例隔离。

## 常见错误模式

这个bug经常出现在列表/表格组件中：

```vue
<!-- ListItem.vue - BUGGY -->
<script setup lang="ts">
interface Props {
  selectedRows?: number[]
}

// All ListItems share the same selectedRows array!
const props = withDefaults(defineProps<Props>(), {
  selectedRows: []  // BUG: Missing factory function
})
</script>
```

用户报告：“在一个表中选择一行会在所有表中选择它！”

**修复：**
```typescript
const props = withDefaults(defineProps<Props>(), {
  selectedRows: () => []  // Now each instance has its own array
})
```

## 参考
- [带有 Composition API 的 Vue.js TypeScript - 默认props](https://vuejs.org/guide/typescript/composition-api.html#props-default-values)
- [Vue RFC - 响应式props解构](https://github.com/vuejs/rfcs/discussions/502)
