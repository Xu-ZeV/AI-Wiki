---
title: 指令最佳实践
impact: MEDIUM
impactDescription: Custom directives are powerful but easy to misuse; following patterns prevents leaks, invalid usage, and unclear abstractions
type: best-practice
tags: [vue3, directives, custom-directives, composition, typescript]
---

# 指令最佳实践

**影响：中** - 指令用于低级 DOM 访问。谨慎使用它们，确保它们的副作用安全，并且当您需要有状态或可重用的 UI 行为时，更喜欢组件或可组合函数。

## 任务列表

- 仅当需要直接访问 DOM 时才使用指令
- 不要改变指令参数或绑定对象
- 清理`unmounted`中的计时器、监听器和侦听器
- 在 `<script setup>` 中使用 `v-` 前缀注册指令
- 在 TypeScript 项目中，类型指令值和增强模板指令类型
- 更喜欢组件或可组合的复杂行为

## 将指令参数视为只读

指令绑定不是响应式存储。不要写信给他们。

```ts
const vFocus = {
  mounted(el, binding) {
    // binding.value is read-only
    el.focus()
  }
}
```

## 避免针对组件的指令

指令适用于 DOM 元素。当在组件上使用时，它们附加到根元素，如果根发生变化，它们可能会中断。

**不好：**
```vue
<MyInput v-focus />
```

**好：**
```vue
<!-- MyInput.vue -->
<script setup>
const vFocus = (el) => el.focus()
</script>

<template>
  <input v-focus />
</template>
```

## 清理 `unmounted` 中的副作用

必须删除任何计时器、侦听器或观察器以避免泄漏。

```ts
const vResize = {
  mounted(el) {
    const observer = new ResizeObserver(() => {})
    observer.observe(el)
    el._observer = observer
  },
  unmounted(el) {
    el._observer?.disconnect()
  }
}
```

## 更喜欢单钩指令的函数简写

如果只需要`mounted`/`updated`，则使用函数形式。

```ts
const vAutofocus = (el) => el.focus()
```

## 使用 `v-` 前缀和脚本安装注册

```vue
<script setup>
const vFocus = (el) => el.focus()
</script>

<template>
  <input v-focus />
</template>
```

## 在 TypeScript 项目中输入自定义指令

使用 `Directive<Element, ValueType>` 以便键入 `binding.value`，并增强 Vue 的模板类型，以便在 SFC 模板中识别指令。

**不好：**
```ts
// Untyped directive value and no template type augmentation
export const vHighlight = {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value
  }
}
```

**好：**
```ts
import type { Directive } from 'vue'

type HighlightValue = string

export const vHighlight = {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value
  }
} satisfies Directive<HTMLElement, HighlightValue>

declare module 'vue' {
  interface ComponentCustomProperties {
    vHighlight: typeof vHighlight
  }
}
```

## 使用 `getSSRProps` 处理 SSR

`mounted` 和 `updated` 等指令挂钩在 SSR 期间不会运行。如果指令设置影响渲染 HTML 的属性/类，请通过 `getSSRProps` 提供等效的 SSR 以避免水合不匹配。

**不好：**
```ts
const vTooltip = {
  mounted(el, binding) {
    el.setAttribute('data-tooltip', binding.value)
    el.classList.add('has-tooltip')
  }
}
```

**好：**
```ts
const vTooltip = {
  mounted(el, binding) {
    el.setAttribute('data-tooltip', binding.value)
    el.classList.add('has-tooltip')
  },
  getSSRProps(binding) {
    return {
      'data-tooltip': binding.value,
      class: 'has-tooltip'
    }
  }
}
```

## 尽可能首选声明性模板

如果标准属性或绑定有效，请使用它而不是指令。

## 在指令和组件之间做出决定

使用 DOM 级别行为的指令。当行为影响结构、状态或渲染时使用组件。
