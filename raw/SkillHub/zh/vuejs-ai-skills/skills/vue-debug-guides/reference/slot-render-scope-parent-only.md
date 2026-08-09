---
title: 槽内容只能访问父组件范围
impact: HIGH
impactDescription: Attempting to access child component data in slot content results in undefined values or errors
type: gotcha
tags: [vue3, slots, scope, reactivity, common-mistake]
---

# 插槽内容只能访问父组件范围

**影响：高** - 槽内容在父组件的范围内编译，无法访问子组件中定义的数据。这遵循 JavaScript 的词法作用域规则，并且是常见的混淆来源。

当您为槽提供内容时，该内容在您的父模板中定义，并且只能访问父组件中可用的数据。除非通过作用域插槽显式传递，否则无法访问子组件的内部状态。

## 任务清单

- [ ] 请记住，槽内容是在父作用域中编译的
- [ ] 切勿尝试直接在槽内容中访问子组件数据
- [ ] 当子数据需要暴露给父级时使用作用域槽
- [ ] 检查所有模板表达式是否引用当前组件中可用的数据

**错误：**
```vue
<!-- Parent.vue -->
<script setup>
import SubmitButton from './SubmitButton.vue'
</script>

<template>
  <!-- BAD: Trying to access child's buttonText - this will be undefined -->
  <SubmitButton>{{ buttonText }}</SubmitButton>

  <!-- BAD: Trying to access child's isLoading state -->
  <SubmitButton>
    <span v-if="isLoading">Loading...</span>
    <span v-else>Submit</span>
  </SubmitButton>
</template>
```

```vue
<!-- SubmitButton.vue (Child) -->
<script setup>
import { ref } from 'vue'

const buttonText = ref('Click me')  // Not accessible in parent's slot content
const isLoading = ref(false)        // Not accessible in parent's slot content
</script>

<template>
  <button>
    <slot></slot>
  </button>
</template>
```

**正确 - 使用作用域插槽：**
```vue
<!-- SubmitButton.vue (Child) - Expose data via slot props -->
<script setup>
import { ref } from 'vue'

const buttonText = ref('Click me')
const isLoading = ref(false)
</script>

<template>
  <button>
    <!-- Pass child data as slot props -->
    <slot :text="buttonText" :loading="isLoading"></slot>
  </button>
</template>
```

```vue
<!-- Parent.vue -->
<script setup>
import SubmitButton from './SubmitButton.vue'
</script>

<template>
  <!-- GOOD: Receive child data via scoped slot -->
  <SubmitButton v-slot="{ text, loading }">
    <span v-if="loading">Loading...</span>
    <span v-else>{{ text }}</span>
  </SubmitButton>
</template>
```

**正确 - 使用父数据：**
```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import SubmitButton from './SubmitButton.vue'

// Define data in parent where slot content is compiled
const message = ref('Submit Form')
const isSubmitting = ref(false)
</script>

<template>
  <!-- GOOD: Using parent's own data in slot content -->
  <SubmitButton>
    <span v-if="isSubmitting">Processing...</span>
    <span v-else>{{ message }}</span>
  </SubmitButton>
</template>
```

## 函数类比

将插槽视为函数参数：

```javascript
// Slot content is like a callback defined in parent scope
function Parent() {
  const parentData = 'Hello'

  // This callback can only see parentData, not childData
  Child((slotProps) => {
    return parentData + (slotProps?.text || '')
  })
}

function Child(slotCallback) {
  const childData = 'World'  // Not visible to callback

  // Must explicitly pass data via slot props
  return slotCallback({ text: childData })
}
```

## 参考
- [Vue.js 插槽 - 渲染范围](https://vuejs.org/guide/components/slots.html#render-scope)
