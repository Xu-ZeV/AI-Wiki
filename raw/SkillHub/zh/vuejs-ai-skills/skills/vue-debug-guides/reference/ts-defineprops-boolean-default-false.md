---
title: 布尔属性默认为 false，并非未定义
impact: MEDIUM
impactDescription: TypeScript expects optional boolean to be undefined but Vue defaults it to false, causing type confusion
type: gotcha
tags: [vue3, typescript, props, boolean, defineProps]
---

# 布尔属性默认为 false，并非未定义

**影响：中** - 使用基于类型的 `defineProps` 时，可选布尔属性（用 `?` 标记）的行为与 TypeScript 预期的不同。 Vue 特别对待布尔属性：缺少的布尔属性默认为 `false`，而不是 `undefined`。当 TypeScript 认为类型是 `boolean | undefined` 时，这可能会导致混乱。

## 任务清单

- [ ] 了解 Vue 的布尔转换会导致布尔值缺失 `false`
- [ ] 使用 `withDefaults()` 明确布尔默认值
- [ ] 如果 `undefined` 是有意义的状态，请考虑使用非布尔类型
- [ ] 为您的团队记录此特定于 Vue 的行为

## 陷阱

```vue
<script setup lang="ts">
interface Props {
  disabled?: boolean  // TypeScript sees: boolean | undefined
}

const props = defineProps<Props>()

// TypeScript thinks props.disabled could be undefined
if (props.disabled === undefined) {
  console.log('This will NEVER run!')
  // Vue's boolean casting means disabled is false, not undefined
}
</script>

<template>
  <!-- When used without the prop -->
  <MyComponent />
  <!-- disabled is false, NOT undefined -->
</template>
```

## 为什么会发生这种情况

Vue 具有从 HTML 布尔属性继承的特殊“布尔转换”行为：

```vue
<!-- All of these make disabled = true -->
<MyComponent disabled />
<MyComponent :disabled="true" />
<MyComponent disabled="" />

<!-- This makes disabled = false (NOT undefined) -->
<MyComponent />

<!-- Explicit false -->
<MyComponent :disabled="false" />
```

这是为了匹配 HTML 的工作方式而设计的：
```html
<!-- HTML: presence means true, absence means false -->
<button disabled>Can't click</button>
<button>Can click</button>
```

## 解决方案

### 解决方案 1：明确使用 withDefaults

明确你的意图：

```vue
<script setup lang="ts">
interface Props {
  disabled?: boolean
}

// Explicitly document the default
const props = withDefaults(defineProps<Props>(), {
  disabled: false  // Now it's clear this defaults to false
})
</script>
```

### 解决方案 2：使用三态类型

如果您确实需要区分“未设置”和“显式错误”：

```vue
<script setup lang="ts">
interface Props {
  // Use a union type instead of optional boolean
  state?: 'enabled' | 'disabled' | undefined

  // Or use undefined explicitly
  toggleState?: boolean | undefined
}

const props = withDefaults(defineProps<Props>(), {
  state: undefined,  // Can actually be undefined
  toggleState: undefined
})

// Now you can check for undefined
if (props.state === undefined) {
  // Use parent's state
} else if (props.state === 'disabled') {
  // Explicitly disabled
}
</script>
```

### 解决方案 3：使用 null 表示“未设置”

```vue
<script setup lang="ts">
interface Props {
  // null = not set, false = explicitly off, true = explicitly on
  selected: boolean | null
}

const props = withDefaults(defineProps<Props>(), {
  selected: null
})

// Three distinct states
if (props.selected === null) {
  console.log('Selection not specified')
} else if (props.selected) {
  console.log('Selected')
} else {
  console.log('Explicitly not selected')
}
</script>
```

## 布尔转换顺序

当布尔值和字符串都有效时，Vue 也有特殊的行为：

```typescript
// Order matters in runtime declaration!
defineProps({
  // Boolean first: empty string becomes true
  disabled: [Boolean, String]
})

// <MyComponent disabled /> → disabled = true
// <MyComponent disabled="" /> → disabled = true
```

```typescript
defineProps({
  // String first: empty string stays as string
  disabled: [String, Boolean]
})

// <MyComponent disabled /> → disabled = ''
// <MyComponent disabled="" /> → disabled = ''
```

对于基于类型的声明，布尔值始终优先处理缺失的 props。

## 常见错误模式

```vue
<!-- Parent.vue -->
<script setup lang="ts">
const userPreferences = ref({
  darkMode: undefined as boolean | undefined
})

// Fetch preferences...
onMounted(async () => {
  userPreferences.value = await fetchPreferences()
})
</script>

<template>
  <!-- Bug: undefined becomes false, not "inherit system preference" -->
  <ThemeToggle :darkMode="userPreferences.darkMode" />
</template>
```

**修复：**

```vue
<script setup lang="ts">
const userPreferences = ref<{
  darkMode: boolean | null
}>({
  darkMode: null  // Use null for "not yet loaded"
})
</script>

<template>
  <!-- Now ThemeToggle can distinguish between null and false -->
  <ThemeToggle :darkMode="userPreferences.darkMode" />
</template>
```

## TypeScript 类型准确性

Vue 类型系统可以处理这个问题，但它可能会令人困惑：

```typescript
interface Props {
  disabled?: boolean
}

const props = defineProps<Props>()

// At compile time: boolean | undefined
// At runtime: boolean (never undefined due to Vue's boolean casting)

// TypeScript is technically "wrong" here, but the withDefaults usage
// or explicit false default can help align expectations
```

## 参考
- [Vue.js props - 布尔转换](https://vuejs.org/guide/components/props.html#boolean-casting)
- [GitHub 问题：布尔属性默认为 false](https://github.com/vuejs/core/issues/8576)
- [TypeScript Vue 3 props](https://madewithlove.com/blog/typescript-vue-3-and-strongly-typed-props/)
