---
title: 复选框真值/假值未在表单中提交
impact: MEDIUM
impactDescription: true-value and false-value attributes don't affect form submission - unchecked boxes send nothing
type: capability
tags: [vue3, v-model, forms, checkbox, form-submission]
---

# 复选框真值/假值未在表单中提交

**影响：中** - Vue 的 `true-value` 和 `false-value` 属性仅影响 JavaScript 绑定，而不影响实际的表单提交。无论 `false-value` 是什么，浏览器提交的表单中都不会包含未选中的复选框。

这是浏览器限制，而不是 Vue 问题。如果您需要提交两个值之一（例如“是”/“否”或“活动”/“非活动”），请使用单选按钮而不是复选框。

## 任务清单

- [ ] 不要依赖 `false-value` 进行表单提交 - 它不会被发送
- [ ] 当您需要提交两个值之一时使用单选按钮
- [ ] 请记住 `true-value`/`false-value` 仅适用于 JavaScript 状态
- [ ] 对于具有自定义值的表单提交，在服务器端或提交处理程序中处理转换

**问题 - 未提交假值：**
```html
<script setup>
import { ref } from 'vue'

const status = ref('no')  // JavaScript value works correctly
</script>

<template>
  <form action="/api/update" method="POST">
    <!-- PROBLEM: When unchecked, nothing is submitted for this field -->
    <!-- Server receives no "status" field at all, not "no" -->
    <input
      type="checkbox"
      v-model="status"
      true-value="yes"
      false-value="no"
      name="status"
    >
    <label>Active</label>

    <!-- status.value correctly shows "yes" or "no" in Vue -->
    <!-- But form submission only sends "status=yes" when checked -->
    <!-- When unchecked, "status" field is completely missing -->
  </form>
</template>
```

**解决方案 1 - 使用单选按钮进行二值提交：**
```html
<script setup>
import { ref } from 'vue'

const status = ref('no')
</script>

<template>
  <form action="/api/update" method="POST">
    <!-- CORRECT: Radio buttons always submit a value -->
    <label>
      <input type="radio" v-model="status" value="yes" name="status">
      Active
    </label>
    <label>
      <input type="radio" v-model="status" value="no" name="status">
      Inactive
    </label>

    <!-- Form always submits "status=yes" or "status=no" -->
  </form>
</template>
```

**解决方案 2 - 在提交处理程序中处理（针对 SPA/AJAX）：**
```html
<script setup>
import { ref } from 'vue'

const isActive = ref(false)

async function submitForm() {
  // Transform checkbox state to desired value before sending
  const payload = {
    status: isActive.value ? 'yes' : 'no'
  }

  await fetch('/api/update', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}
</script>

<template>
  <!-- For AJAX submission, checkbox is fine - transform in handler -->
  <input type="checkbox" v-model="isActive">
  <label>Active</label>

  <button @click="submitForm">Save</button>
</template>
```

**解决方案 3 - 隐藏输入回退：**
```html
<template>
  <form action="/api/update" method="POST">
    <!-- Hidden input provides fallback value -->
    <input type="hidden" name="status" value="no">
    <!-- Checkbox overrides with "yes" when checked -->
    <input type="checkbox" name="status" value="yes" v-model="isActive">
    <label>Active</label>
  </form>
</template>
```

## 参考
- [Vue.js 表单输入绑定 - 复选框](https://vuejs.org/guide/essentials/forms.html#checkbox)
