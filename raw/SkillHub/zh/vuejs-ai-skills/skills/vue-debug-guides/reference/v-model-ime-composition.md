---
title: v-model 在 IME 组合期间不更新
impact: MEDIUM
impactDescription: v-model won't capture intermediate input for Chinese, Japanese, Korean and other IME languages
type: capability
tags: [vue3, v-model, forms, input, ime, internationalization, i18n, cjk]
---

# v-model 在 IME 组合期间不更新

**影响：中** - 当用户输入需要输入法编辑器的语言（中文、日文、韩文等）时，v-model 在合成完成之前不会更新。这会破坏国际用户的实时验证、字符计数器和实时搜索功能。

IME（输入法编辑器）允许用户通过键入多个按键来组成复杂的字符。在这个组合阶段，v-model 故意等待，直到用户确认他们的选择后再更新。这通常是所希望的，但可能会破坏需要每次击键的功能。

## 任务清单

- [ ] 如果您的应用程序为 CJK（中文、日文、韩文）用户提供服务，则使用 IME 输入测试表单
- [ ] 对于实时功能（实时搜索、字符计数器），使用手动事件绑定而不是 v-model
- [ ] 设计时考虑这两种行为 - 有时等待合成完成是正确的
- [ ] 记录国际用户的预期行为

**问题 - v-model 等待组合：**
```html
<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const charCount = ref(0)
</script>

<template>
  <!-- PROBLEM: During IME composition, searchQuery won't update -->
  <!-- Chinese user types "ni hao" -> sees no results until they press space/enter -->
  <input v-model="searchQuery" placeholder="Live search...">
  <p>{{ searchQuery.length }} characters</p>

  <!-- Character counter stays at 0 during IME input -->
</template>
```

**解决方案-手动事件绑定以进行实时更新：**
```html
<script setup>
import { ref } from 'vue'

const searchQuery = ref('')

// This captures EVERY input event, including during IME composition
function handleInput(event) {
  searchQuery.value = event.target.value
}
</script>

<template>
  <!-- CORRECT: Manual binding captures all input, including IME composition -->
  <input
    :value="searchQuery"
    @input="handleInput"
    placeholder="Live search..."
  >
  <p>{{ searchQuery.length }} characters</p>
</template>
```

```html
<!-- Shorter inline version -->
<input
  :value="searchQuery"
  @input="event => searchQuery = event.target.value"
>
```

**当 v-model行为正确时：**
```html
<!-- For form submission, waiting for composition IS usually better -->
<!-- User expects to confirm their character selection before it's "official" -->
<input v-model="formName" placeholder="Enter your name">

<!-- The final composed characters will be submitted, not intermediate states -->
```

## 参考
- [Vue.js 表单输入绑定](https://vuejs.org/guide/essentials/forms.html)
