---
title: 选择元素 iOS Bug - 始终包含禁用的占位符选项
impact: HIGH
impactDescription: On iOS, users cannot select the first option if v-model initial value doesn't match any option
type: capability
tags: [vue3, v-model, forms, select, ios, mobile, accessibility]
---

# 选择元素 iOS Bug - 始终包含禁用的占位符选项

**影响：高** - 当 `<select>` 元素的 v-model 初始值与任何选项都不匹配时，iOS 会将其呈现为“未选择”，并且用户无法选择第一项。当选择已经视觉选择的选项时，iOS 不会触发更改事件，从而使用户陷入困境。

这是一个特定于平台的错误，仅在 iOS Safari 上出现。桌面浏览器和 Android 可以很好地处理这个问题，因此在开发过程中很容易错过。修复方法很简单：始终包含禁用的占位符选项。

## 任务清单

- [ ] 始终添加具有空值的禁用占位符选项来选择元素
- [ ] 确保 v-model 初始值为空字符串以匹配占位符
- [ ] 在 iOS 设备或模拟器上测试选择输入
- [ ] 对于任何面向用户的表单，尤其是在移动优先的应用程序上，请考虑这一点

**问题 - iOS 用户无法选择第一个选项：**
```html
<script setup>
import { ref } from 'vue'

// Initial value is empty string, doesn't match any option
const selected = ref('')
</script>

<template>
  <!-- PROBLEM: On iOS, "Apple" appears selected but user cannot actually select it -->
  <!-- Tapping "Apple" does nothing because iOS doesn't fire change event -->
  <select v-model="selected">
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <option value="orange">Orange</option>
  </select>

  <!-- selected remains '' even though "Apple" appears highlighted -->
</template>
```

**解决方案 - 添加禁用的占位符选项：**
```html
<script setup>
import { ref } from 'vue'

const selected = ref('')  // Matches the placeholder option
</script>

<template>
  <!-- CORRECT: Disabled placeholder ensures user must actively select -->
  <select v-model="selected">
    <option disabled value="">Please select a fruit</option>
    <option value="apple">Apple</option>
    <option value="banana">Banana</option>
    <option value="orange">Orange</option>
  </select>
</template>
```

```html
<!-- Variant with required attribute for form validation -->
<select v-model="selected" required>
  <option disabled value="">-- Select an option --</option>
  <option value="a">Option A</option>
  <option value="b">Option B</option>
</select>
```

```html
<!-- If you MUST have a pre-selected default, set the initial value to match -->
<script setup>
import { ref } from 'vue'

// Set initial value to match an actual option
const country = ref('us')  // Pre-selects "United States"
</script>

<template>
  <select v-model="country">
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
    <option value="ca">Canada</option>
  </select>
</template>
```

## 参考
- [Vue.js 表单输入绑定 - 选择](https://vuejs.org/guide/essentials/forms.html#select)
