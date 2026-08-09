---
title: 文本区域插值仅是单向的 - 使用 v-model 进行双向绑定
impact: HIGH
impactDescription: Using {{ text }} inside textarea displays initial value but user input does NOT update the ref
type: capability
tags: [vue3, v-model, forms, textarea, interpolation, template]
---

# 文本区域插值仅是单向的 - 使用 v-model 进行双向绑定

**影响：高** - 文本区域 (`{{ text }}`) 中的插值仅提供单向绑定 - 它显示初始值，但用户输入不会更新引用。这会造成令人困惑的脱节，文本区域显示内容，但编辑内容会默默丢失。

与提供双向绑定的 v-model 不同，插值仅将初始引用值渲染到文本区域中。当用户键入时，引用保持不变，从而使表单提交返回陈旧的数据。始终使用 v-model 在文本区域中进行双向绑定。

## 任务清单

- [ ] 切勿在文本区域标签内使用插值
- [ ] 始终使用 v-model 进行文本区域双向绑定
- [ ] 搜索代码库以查找可能被悄悄破坏的 `<textarea>{{` 模式
- [ ] 添加 linting 规则以捕获此模式（如果可能）

**错误：**
```html
<script setup>
import { ref } from 'vue'

const message = ref('Hello World')
</script>

<template>
  <!-- WRONG: One-way binding only! Shows initial value but edits don't update ref -->
  <textarea>{{ message }}</textarea>

  <!-- Also WRONG: User can type but changes are lost -->
  <textarea>{{ userBio }}</textarea>

  <!-- The textarea displays content but ref never updates -->
</template>
```

**正确：**
```html
<script setup>
import { ref } from 'vue'

const message = ref('Hello World')
</script>

<template>
  <!-- CORRECT: Use v-model for textarea -->
  <textarea v-model="message"></textarea>

  <!-- For read-only display, still use v-model or :value -->
  <textarea v-model="message" readonly></textarea>

  <!-- Or one-way binding with :value -->
  <textarea :value="message" readonly></textarea>
</template>
```

```html
<!-- With placeholder and other attributes -->
<textarea
  v-model="message"
  placeholder="Enter your message..."
  rows="5"
  maxlength="500"
></textarea>
```

## 参考
- [Vue.js 表单输入绑定 - 多行文本](https://vuejs.org/guide/essentials/forms.html#multiline-text)
