---
title: 无法在 DefineEmits 中混合运行时和类型声明
impact: HIGH
impactDescription: Using both array/object syntax AND TypeScript generics in defineEmits causes compile errors
type: gotcha
tags: [vue3, defineEmits, typescript, compilation-error, script-setup]
---

# 不能在defineEmits中混合运行时和类型声明

**影响：高** - `defineEmits` 支持两种声明样式：运行时（数组/对象语法）和基于类型（TypeScript 泛型）。您不能同时使用两者。尝试这样做会导致编译时错误。

这是使用 TypeScript 学习 Vue 3 时的常见错误。

## 任务清单

- [ ] 选择一种声明样式：运行时或基于类型
- [ ] 对于 TypeScript 项目，更喜欢基于类型的声明
- [ ] 对于 JavaScript 项目，使用运行时（数组/对象）声明
- [ ] 使用泛型类型参数时切勿传递参数

## 问题

**不正确 - 混合两种风格：**
```vue
<script setup lang="ts">
// ERROR: Cannot use both type argument and runtime argument
const emit = defineEmits<{
  submit: [data: FormData]
}>(['submit'])  // This array argument causes the error!
</script>
```

**编译器错误：**
```
defineEmits() cannot accept both type and non-type arguments at the same time.
Use one or the other.
```

**同样不正确：**
```vue
<script setup lang="ts">
// ERROR: Same problem with object syntax
const emit = defineEmits<{
  submit: [data: FormData]
}>({
  submit: (data) => !!data
})
</script>
```

## 正确：基于类型的声明 (TypeScript)

```vue
<script setup lang="ts">
// CORRECT: Type argument only, no runtime argument
const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
  'update:modelValue': [value: string]
}>()

emit('submit', formData)  // TypeScript validates this
emit('cancel')
emit('unknown')  // TypeScript error: unknown event
</script>
```

**替代调用签名语法：**
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'submit', data: FormData): void
  (e: 'cancel'): void
  (e: 'update:modelValue', value: string): void
}>()
</script>
```

## 正确：运行时声明（JavaScript 或简单情况）

**数组语法：**
```vue
<script setup>
// CORRECT: Runtime array, no type argument
const emit = defineEmits(['submit', 'cancel', 'update:modelValue'])

emit('submit', formData)
emit('cancel')
</script>
```

**带验证的对象语法：**
```vue
<script setup>
// CORRECT: Runtime object for validation
const emit = defineEmits({
  submit: (data) => {
    if (!data?.email) {
      console.warn('Missing email')
      return false
    }
    return true
  },
  cancel: null  // No validation
})
</script>
```

## 为基于类型的发出添加验证

如果您想要 TypeScript 类型和运行时验证，请单独定义验证器：

```vue
<script setup lang="ts">
interface FormData {
  email: string
  message: string
}

// Type-based declaration for TypeScript
const emit = defineEmits<{
  submit: [data: FormData]
}>()

// Separate validation function
function emitSubmit(data: FormData) {
  if (!data.email.includes('@')) {
    console.warn('Invalid email format')
    return
  }
  emit('submit', data)
}
</script>

<template>
  <button @click="emitSubmit(formData)">Submit</button>
</template>
```

## 选择风格

|风格|使用时间 |好处 |
|-------|----------|----------|
|基于类型 | TypeScript 项目 |编译时检查、IDE 支持 |
|数组| JavaScript、简单事件 |简单，无需类型 |
|对象|需要运行时验证 |在运行时验证有效负载 |

**建议：** 在 TypeScript 项目中，使用基于类型的声明。它通过自动完成和类型检查提供最佳的开发者体验。

## 同样的规则适用于defineProps

此限制也适用于 `defineProps`：

```vue
<script setup lang="ts">
// ERROR: Cannot mix
const props = defineProps<{ name: string }>({ name: String })

// CORRECT: Type-based only
const props = defineProps<{ name: string }>()

// CORRECT: Runtime only
const props = defineProps({ name: String })
</script>
```

## 参考
- [Vue.js SFCscript setup-defineEmits](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)
- [带有 Composition API 的 Vue.js TypeScript](https://vuejs.org/guide/typescript/composition-api.html#typing-component-emits)
