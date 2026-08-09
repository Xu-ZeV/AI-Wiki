---
title: 始终声明emits以进行文档记录和验证
impact: MEDIUM
impactDescription: Undeclared emits cause warnings, break TypeScript inference, and prevent event validation
type: best-practice
tags: [vue3, emits, defineEmits, component-events, typescript, documentation]
---

# 始终声明 Emits 以进行文档和验证

**影响：中度** - 使用 `defineEmits()` 或 `emits` 选项声明发出的事件在技术上是可选的，但强烈建议这样做。如果没有声明，Vue 会显示运行时警告，TypeScript 无法推断事件类型，并且您将失去验证事件有效负载的能力。

声明的发出还可以用作自文档，使组件可以发出哪些事件立即变得清晰。

## 任务清单

- [ ] 在`<script setup>`中使用`defineEmits()`来声明所有事件
- [ ] 不使用 `<script setup>` 时使用 `emits` 选项
- [ ] 为事件负载添加 TypeScript 类型
- [ ] 考虑为复杂的有效负载添加验证功能
- [ ] 记录每个事件的目的

## 警告

当您在未声明的情况下发出时：

```vue
<script setup>
// No defineEmits declaration
function handleClick() {
  emit('select', item) // Vue warns in dev mode
}
</script>
```

Vue 警告：
```
[Vue warn]: Component emitted event "select" but it is neither declared
in the emits option nor as an "onSelect" prop.
```

## 基本声明

**正确 - 数组语法：**
```vue
<script setup>
const emit = defineEmits(['submit', 'cancel', 'update'])

function handleSubmit() {
  emit('submit', formData)
}

function handleCancel() {
  emit('cancel')
}
</script>
```

**正确 - 选项 API：**
```js
export default {
  emits: ['submit', 'cancel', 'update'],

  methods: {
    handleSubmit() {
      this.$emit('submit', this.formData)
    }
  }
}
```

## TypeScript 类型化emits

**正确 - 基于类型的声明（推荐用于 TypeScript）：**
```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
}

const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
  'update:modelValue': [value: string]
  select: [user: User, index: number]
}>()

// Now TypeScript enforces correct payloads
emit('submit', formData) // OK
emit('submit') // Error: Expected 1 argument
emit('select', user) // Error: Expected 2 arguments
emit('unknown') // Error: Unknown event
</script>
```

**替代语法（Vue 3.3+）：**
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'submit', data: FormData): void
  (e: 'cancel'): void
  (e: 'update:modelValue', value: string): void
}>()
</script>
```

## 事件验证

您可以在运行时验证事件负载：

**正确 - 验证函数：**
```vue
<script setup>
const emit = defineEmits({
  // No validation, just declaration
  cancel: null,

  // Validate payload
  submit: (payload) => {
    if (!payload.email) {
      console.warn('Submit event requires email')
      return false
    }
    return true
  },

  // Validate with type checking
  click: (id) => typeof id === 'number'
})
</script>
```

从验证器返回 `false` 会记录控制台警告，但不会阻止事件的发出。

## 声明 Emit 的好处

### 1. Fallthrough属性分离

如果没有声明，本机事件侦听器将直接到达根元素：

```vue
<!-- ParentComponent.vue -->
<ChildComponent @click="handleClick" />
```

```vue
<!-- ChildComponent.vue - WITHOUT emits declaration -->
<template>
  <!-- Native click listener falls through to button -->
  <button>Click me</button>
</template>
```

通过声明，Vue 知道这是一个组件事件：

```vue
<script setup>
// Now Vue knows 'click' is a component event, not native
const emit = defineEmits(['click'])
</script>
```

### 2.自我记录

```vue
<script setup>
// Clear contract: this component emits these events
const emit = defineEmits<{
  'row-click': [row: TableRow]
  'row-select': [row: TableRow, selected: boolean]
  'page-change': [page: number]
  'sort-change': [column: string, direction: 'asc' | 'desc']
}>()
</script>
```

### 3.IDE支持

通过声明，您的 IDE 可以：
- 使用组件时自动完成事件名称
- 显示事件负载类型
- 警告事件名称中的拼写错误
- 导航至事件定义

## 模板中的$emit 与脚本中的emit

```vue
<script setup>
// $emit is available in template, but...
// emit() is needed in <script setup>
const emit = defineEmits(['submit'])

function handleSubmit() {
  // $emit doesn't work here - use emit()
  emit('submit', data)
}
</script>

<template>
  <!-- $emit works in template -->
  <button @click="$emit('submit', data)">Submit</button>

  <!-- Or use the declared emit function -->
  <button @click="emit('submit', data)">Submit</button>
</template>
```

## 参考
- [Vue.js 组件事件 - 声明发出的事件](https://vuejs.org/guide/components/events.html#declaring-emitted-events)
- [Vue.js 组件事件 - 事件验证](https://vuejs.org/guide/components/events.html#events-validation)
- [Vue 3 迁移 - 发出选项](https://v3-migration.vuejs.org/breaking-changes/emits-option)
