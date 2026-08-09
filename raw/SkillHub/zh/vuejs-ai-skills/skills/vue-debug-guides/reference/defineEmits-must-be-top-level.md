---
title: DefineEmits 必须在 script setup 的顶层使用
impact: HIGH
impactDescription: Using defineEmits inside functions causes compilation errors - macros must be at module scope
type: gotcha
tags: [vue3, defineEmits, script-setup, macros, composition-api]
---

# defineEmits 必须在 script setup 的顶层使用

**影响：高** - `defineEmits()` 宏只能在顶层的 `<script setup>` 中直接使用。它不能放置在函数、条件或任何其他嵌套范围内。 Vue 的编译器在编译期间将这些宏提升到模块范围。

这适用于所有 Vue 宏：`defineProps`、`defineEmits`、`defineExpose`、`defineOptions` 和 `defineSlots`。

## 任务清单

- [ ] 将 `defineEmits()` 直接放在 `<script setup>` 中，而不是在函数内部
- [ ] 不要将宏调用包装在条件或循环中
- [ ] 不要在宏参数中引用局部变量
- [ ] 存储emit函数并在整个组件中重用它

## 问题

**不正确 - 在函数内部：**
```vue
<script setup>
function useEvents() {
  // ERROR: defineEmits cannot be used inside a function
  const emit = defineEmits(['submit', 'cancel'])
  return emit
}

const emit = useEvents() // This fails at compile time
</script>
```

**不正确 - 在条件语句中：**
```vue
<script setup>
if (someCondition) {
  // ERROR: Cannot use defineEmits in conditional
  const emit = defineEmits(['eventA'])
} else {
  const emit = defineEmits(['eventB'])
}
</script>
```

**不正确 - 引用局部变量：**
```vue
<script setup>
const eventNames = ['submit', 'cancel']

// ERROR: Cannot reference local variables
const emit = defineEmits(eventNames)
</script>
```

## 正确用法

**正确 - 顶级声明：**
```vue
<script setup>
// CORRECT: defineEmits at top level of script setup
const emit = defineEmits(['submit', 'cancel', 'update'])

function handleSubmit() {
  emit('submit', data)
}

function handleCancel() {
  emit('cancel')
}
</script>
```

**正确 - 使用 TypeScript 类型：**
```vue
<script setup lang="ts">
// CORRECT: Type-based declaration at top level
const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
  'update:modelValue': [value: string]
}>()

function handleSubmit(data: FormData) {
  emit('submit', data)
}
</script>
```

**正确 - 使用常量数组（编译时常量）：**
```vue
<script setup>
// CORRECT: Literal array is fine
const emit = defineEmits(['submit', 'cancel'])
</script>
```

## 为什么存在此限制

Vue 的编译器在编译时而不是运行时处理 `<script setup>` 宏。参数必须是可静态分析的，以便 Vue 可以：

1. 生成正确的组件选项
2.提供TypeScript类型推断
3.启用IDE对事件自动完成的支持
4. 验证发出的事件

由于宏在编译期间被提升到 `<script setup>` 之外，因此它无法访问仅在运行时存在的任何内容。

## 在可组合函数中使用emits

如果您想在可组合函数中共享emits逻辑，请将emits函数作为参数传递：

**正确 - 将emits传递给可组合函数：**
```vue
<script setup>
const emit = defineEmits(['submit', 'cancel', 'validate'])

// Pass emit to composable
const { handleSubmit, handleCancel } = useFormEvents(emit)
</script>
```

```js
// composables/useFormEvents.js
export function useFormEvents(emit) {
  function handleSubmit(data) {
    emit('submit', data)
  }

  function handleCancel() {
    emit('cancel')
  }

  return { handleSubmit, handleCancel }
}
```

## ESLint 规则

`eslint-plugin-vue` 提供了捕获这些错误的 `vue/valid-define-emits` 规则：

```js
// eslint.config.js
export default [
  {
    rules: {
      'vue/valid-define-emits': 'error'
    }
  }
]
```

该规则报告：
- `defineEmits` 在函数内部使用
- `defineEmits` 引用局部变量
- 同一组件中多个 `defineEmits` 调用
- `defineEmits` 在外部使用 `<script setup>`

## 参考
- [Vue.js SFCscript setup](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)
- [ESLint vue/有效定义emits](https://eslint.vuejs.org/rules/valid-define-emits)
