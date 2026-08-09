---
title: v-model 忽略初始 HTML 属性
impact: HIGH
impactDescription: v-model ignores value, checked, and selected HTML attributes - initial state must be set in JavaScript
type: capability
tags: [vue3, v-model, forms, input, checkbox, select, initialization]
---

# v-model 忽略初始 HTML 属性

**影响：高** - 使用 v-model 时，通过 HTML `value`、`checked` 或 `selected` 属性设置初始值没有效果。该表单将显示为空或处于意外状态，使用户感到困惑并可能导致数据丢失。

Vue 的 v-model始终将绑定的 JavaScript 状态视为单一事实来源。 HTML 中的任何初始属性都将被完全忽略。这是从纯 HTML 表单迁移或复制 HTML 模板时常见的错误。

## 任务清单

- [ ] 使用 v-model 时切勿依赖 HTML `value`、`checked` 或 `selected` 属性
- [ ] 始终使用 `ref()` 或 `reactive()` 在 JavaScript 中声明初始值
- [ ] 将纯 HTML 表单迁移到 Vue 时，将所有默认值移至 JavaScript 状态
- [ ] 审核现有表单中可能被默默忽略的硬编码 HTML 默认值

**错误：**
```html
<script setup>
import { ref } from 'vue'

const username = ref('')  // Empty!
const isSubscribed = ref(false)  // Not checked!
const country = ref('')  // No default selection!
</script>

<template>
  <!-- WRONG: These HTML attributes are completely ignored -->
  <input v-model="username" value="default_user">

  <input type="checkbox" v-model="isSubscribed" checked>

  <select v-model="country">
    <option value="us" selected>United States</option>
    <option value="uk">United Kingdom</option>
  </select>
</template>
```

**正确：**
```html
<script setup>
import { ref } from 'vue'

// CORRECT: Set initial values in JavaScript
const username = ref('default_user')
const isSubscribed = ref(true)
const country = ref('us')
</script>

<template>
  <!-- HTML attributes not needed - JavaScript state controls everything -->
  <input v-model="username">

  <input type="checkbox" v-model="isSubscribed">

  <select v-model="country">
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
  </select>
</template>
```

```javascript
// Options API equivalent
export default {
  data() {
    return {
      username: 'default_user',
      isSubscribed: true,
      country: 'us'
    }
  }
}
```

## 参考
- [Vue.js 表单输入绑定](https://vuejs.org/guide/essentials/forms.html)
