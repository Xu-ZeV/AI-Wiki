---
title: 未声明的发出导致双重事件触发
impact: HIGH
impactDescription: Native events re-emitted without declaration fire twice - once from emit() and once from native listener on root element
type: gotcha
tags: [vue3, emits, defineEmits, events, native-events, fallthrough]
---

# 未声明的发出导致双重事件触发

**影响：高** - 当组件重新发出本机 DOM 事件（如 `click`）而未在 `emits` 中声明它时，该事件可能会触发两次。发生这种情况是因为未声明的事件侦听器成为 `$attrs` 的一部分，并落入根元素，它们在根元素中侦听本机事件，同时您的 `emit()` 调用也会触发。

这是包装原生元素或从 Vue 2 迁移到 Vue 3 时的常见错误。

## 任务清单

- [ ] 在 `defineEmits()` 或 `emits` 选项中声明所有发出的事件
- [ ] 重新发出原生事件（点击、输入、更改等）时要特别注意
- [ ] 如果组件包装原生元素，则检查双重触发
- [ ] 了解未声明的侦听器会落入 `$attrs`

## 问题

**不正确 - 未声明的emits导致双重触发：**
```vue
<!-- MyButton.vue -->
<script setup>
// NO defineEmits declaration!
</script>

<template>
  <!-- Native click listener from parent falls through to button -->
  <!-- PLUS we re-emit click -->
  <button @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <!-- This handler fires TWICE on each click! -->
  <MyButton @click="handleClick">Click me</MyButton>
</template>

<script setup>
function handleClick() {
  console.log('clicked') // Logs twice!
}
</script>
```

**发生了什么：**
1. 用户点击按钮
2. 原生点击事件在按钮元素上触发
3. `@click` 落入按钮（因为“点击”不在emits中），触发 `handleClick`
4. 按钮的 `@click="$emit('click', $event)"` 也会触发，发出组件事件
5、Parent的`@click="handleClick"`收到发出的事件，再次触发`handleClick`

## 解决方案

**正确 - 声明发出：**
```vue
<!-- MyButton.vue -->
<script setup>
// Declare 'click' as a component event
const emit = defineEmits(['click'])
</script>

<template>
  <!-- Now @click="handleClick" in parent only listens to emit() -->
  <button @click="emit('click', $event)">
    <slot></slot>
  </button>
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <!-- Now fires only once -->
  <MyButton @click="handleClick">Click me</MyButton>
</template>
```

当您在 `emits` 中声明 `click` 时：
- Vue 知道组件上的 `@click` 正在监听组件事件
- 监听器不会到达根元素
- 只有您的显式 `emit('click')` 才会触发父级的处理程序

## 选项 API 版本

**正确 - 使用发出选项：**
```vue
<script>
export default {
  emits: ['click', 'input', 'change'],

  methods: {
    handleClick(event) {
      this.$emit('click', event)
    }
  }
}
</script>
```

## 常见场景

### 包装表单输入

```vue
<!-- CustomInput.vue -->
<script setup>
// Declare all events you re-emit
const emit = defineEmits(['input', 'change', 'focus', 'blur'])
</script>

<template>
  <input
    @input="emit('input', $event)"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  />
</template>
```

### 包装组件

```vue
<!-- IconButton.vue -->
<script setup>
const emit = defineEmits(['click'])
</script>

<template>
  <button @click="emit('click', $event)">
    <Icon :name="icon" />
    <slot></slot>
  </button>
</template>
```

## 替代方案：不要重新emits，让它掉落

如果您的组件有一个根元素并且您想要本机事件行为：

```vue
<!-- MyButton.vue -->
<script setup>
// Don't declare 'click' - let it fall through naturally
const emit = defineEmits(['custom-action'])
</script>

<template>
  <!-- Native @click from parent falls through to this button -->
  <button>
    <slot></slot>
  </button>
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <!-- This native click falls through to the button -->
  <MyButton @click="handleClick">Click me</MyButton>
</template>
```

这是有效的，因为：
- 您没有明确地重新发出“点击”
- 本机点击侦听器落入单个根按钮
- 单击按钮时本机单击会触发一次

## 调试双重射击

```vue
<script setup>
function handleClick(event) {
  console.log('Event type:', event?.type)
  console.log('Is native:', event instanceof Event)
  console.trace('Click handler called')
}
</script>
```

如果您看到两个具有不同来源的堆栈跟踪，则存在双重触发问题。

## 参考
- [Vue 3 迁移 - 发出选项](https://v3-migration.vuejs.org/breaking-changes/emits-option)
- [Vue.js 组件事件](https://vuejs.org/guide/components/events.html)
- [Vue.js Fallthrough 属性](https://vuejs.org/guide/components/attrs.html)
