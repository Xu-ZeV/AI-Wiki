---
title: 默认情况下，提供/注入值不具有响应式
impact: HIGH
impactDescription: Provided primitive values lose reactivity, causing injecting components to not update when the source value changes
type: gotcha
tags: [vue3, provide-inject, reactivity, composition-api, options-api]
---

# 默认情况下提供/注入值不是响应式的

**影响：高** - 一个常见的误解是提供/注入会自动保持响应式。默认情况下，提供的原始值不是响应式的。如果提供者中提供的值发生变化，注入组件将不会更新。

## 任务清单

- [ ] 在提供之前始终将原始值包装在 `ref()` 中
- [ ] 在选项 API `provide()` 中使用 `computed()` 获取反应数据
- [ ] 提供时切勿解构引用 - 直接传递引用
- [ ] 了解提供的引用不会在注入器中自动展开

## 陷阱：基元失去响应式

**错误 - 原语失去响应式：**
```vue
<!-- Provider.vue -->
<script setup>
import { ref, provide } from 'vue'

const count = ref(0)

// WRONG: Providing the unwrapped value loses reactivity
provide('count', count.value) // Provides 0, not a reactive value

function increment() {
  count.value++ // Injector will NOT see this change
}
</script>
```

```vue
<!-- Injector.vue -->
<script setup>
import { inject } from 'vue'

const count = inject('count') // Gets 0, forever static
</script>

<template>
  <!-- This will always show 0 -->
  <div>Count: {{ count }}</div>
</template>
```

**正确 - 提供参考本身：**
```vue
<!-- Provider.vue -->
<script setup>
import { ref, provide } from 'vue'

const count = ref(0)

// CORRECT: Provide the ref, not the value
provide('count', count)

function increment() {
  count.value++ // Injector WILL see this change
}
</script>
```

```vue
<!-- Injector.vue -->
<script setup>
import { inject } from 'vue'

// The ref is injected as-is, maintaining reactivity
const count = inject('count')
</script>

<template>
  <!-- Access .value in script, auto-unwrapped in template -->
  <div>Count: {{ count }}</div>
</template>
```

## 选项 API：使用计算（）来实现响应式

在选项 API 中，具有普通属性的 `provide` 选项不是响应式的：

**错误 - 没有计算的选项 API：**
```js
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  // WRONG: This is NOT reactive
  provide() {
    return {
      message: this.message // Provides 'Hello' as a static string
    }
  }
}
```

**正确 - 在选项 API 中使用计算（）：**
```js
import { computed } from 'vue'

export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  provide() {
    return {
      // CORRECT: Wrap in computed for reactivity
      message: computed(() => this.message)
    }
  }
}
```

## 了解注入中的引用行为

当您提供引用时，它会按原样注入，而不是自动解包：

```vue
<!-- Provider.vue -->
<script setup>
import { ref, provide } from 'vue'

const user = ref({ name: 'John' })
provide('user', user)
</script>
```

```vue
<!-- Injector.vue -->
<script setup>
import { inject } from 'vue'

const user = inject('user')

// In script, access with .value
console.log(user.value.name) // 'John'

function updateName(newName) {
  user.value.name = newName // Works, but mutations should be in provider
}
</script>

<template>
  <!-- In template, auto-unwrapped at top level -->
  <div>{{ user.name }}</div>
</template>
```

## 提供响应式对象

响应式对象（使用 `reactive()` 创建）在提供时保持响应式：

```vue
<!-- Provider.vue -->
<script setup>
import { reactive, provide } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello'
})

provide('state', state)
</script>
```

```vue
<!-- Injector.vue -->
<script setup>
import { inject } from 'vue'

const state = inject('state')
// state.count and state.message are reactive
</script>
```

## 常见错误：解构破坏响应式

**错误 - 解构提供反应状态：**
```vue
<script setup>
import { inject } from 'vue'

// WRONG: Destructuring loses reactivity
const { count, message } = inject('state')
// count and message are now static values
</script>
```

**正确 - 保持参考完整：**
```vue
<script setup>
import { inject, toRefs } from 'vue'

const state = inject('state')
// Use state.count and state.message directly

// Or use toRefs if you need destructured reactive refs
const { count, message } = toRefs(state)
</script>
```

## 调试技巧

如果您注入的值没有更新：

1. 检查您是否提供了 `ref.value` 而不是 `ref`
2. 检查是否解构了反应对象
3. 在选项 API 中，确保您使用的是 `computed()`
4. 使用 Vue DevTools 检查提供的值

## 参考
- [Vue.js 提供/注入 - 处理响应式](https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity)
- [如何使提供/注入反应 - LogRocket 博客](https://blog.logrocket.com/how-to-make-provide-inject-reactive/)
- [GitHub问题：注入/提供不是响应式的](https://github.com/vuejs/vue/issues/7017)
