---
title: 卸载元素时模板引用变为空
impact: MEDIUM
impactDescription: Refs become null when conditionally rendered elements are removed, causing errors if not handled
type: gotcha
tags: [vue3, template-refs, v-if, watchers, conditional-rendering]
---

# 卸载元素时模板引用变为空

**影响：中** - 将模板引用与 `v-if` 一起使用时，卸载元素后引用将变为 `null`。访问这些引用的侦听器和效果必须处理 null 情况以避免运行时错误。

这对于 `watchEffect` 尤其棘手，因为它会自动运行，并且可能在 ref 为空时执行。

## 任务清单

- [ ] 使用 v-if 时，在访问 ref 属性之前始终检查 null
- [ ] 在侦听器中，显式处理 null 情况（元素已卸载或尚未安装）
- [ ] 如果您需要持久的引用访问，请考虑 v-show 是否更合适
- [ ] 在不确定的上下文中访问 ref 属性时使用可选链接 (?.)

**错误：**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const inputEl = ref(null)
const showInput = ref(true)

// WRONG: No null check - will error when v-if is false
watchEffect(() => {
  inputEl.value.focus() // TypeError when showInput is false
})
</script>

<template>
  <input v-if="showInput" ref="inputEl" />
  <button @click="showInput = !showInput">Toggle</button>
</template>
```

**正确：**
```vue
<script setup>
import { ref, watchEffect } from 'vue'

const inputEl = ref(null)
const showInput = ref(true)

// CORRECT: Handle both mounted and unmounted states
watchEffect(() => {
  if (inputEl.value) {
    inputEl.value.focus()
  } else {
    // Element not mounted yet, or unmounted by v-if
    console.log('Input element not available')
  }
})
</script>

<template>
  <input v-if="showInput" ref="inputEl" />
  <button @click="showInput = !showInput">Toggle</button>
</template>
```

```vue
<script setup>
import { ref, watch } from 'vue'

const inputEl = ref(null)
const showInput = ref(true)

// CORRECT: Watch the ref and handle null explicitly
watch(inputEl, (el) => {
  if (el) {
    el.focus()
  }
})
</script>

<template>
  <input v-if="showInput" ref="inputEl" />
</template>
```

```vue
<script setup>
import { useTemplateRef, watchEffect } from 'vue'

// Vue 3.5+ approach
const input = useTemplateRef('my-input')

// CORRECT: Use optional chaining for safe access
watchEffect(() => {
  input.value?.focus()
})
</script>

<template>
  <input v-if="showInput" ref="my-input" />
</template>
```

```vue
<script setup>
import { ref, onMounted } from 'vue'

const inputEl = ref(null)
const showInput = ref(true)

// ALTERNATIVE: Use v-show if you need consistent ref access
// v-show keeps element in DOM, just hides it with CSS
</script>

<template>
  <!-- Element always exists in DOM, ref is never null -->
  <input v-show="showInput" ref="inputEl" />
</template>
```

## 参考
- [Vue.js 模板 ref](https://vuejs.org/guide/essentials/template-refs.html)
