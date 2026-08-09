---
title: 在 Emits 中声明本机事件名称会阻止本机侦听器
impact: MEDIUM
impactDescription: Declaring native events like 'click' in emits prevents native DOM event listeners from working
type: gotcha
tags: [vue3, emits, native-events, click, event-collision]
---

# 在 Emits 中声明本机事件名称会阻止本机侦听器

**影响：中** - 当您在组件的 `emits` 选项中声明本机 DOM 事件名称（如 `click`、`input`、`focus`）时，该事件的侦听器将仅响应组件的 `emit()` 调用。它们将不再响应根元素上的实际本机 DOM 事件。

这可能会导致意外行为，即组件上的单击似乎停止工作。

## 任务清单

- [ ] 了解声明本机事件名称会更改侦听器行为
- [ ] 声明事件时始终发出事件
- [ ] 如果您想要失败行为，请不要声明本机事件
- [ ] 添加发出声明后测试点击/输入处理

## 问题

**不正确 - 声明但未发出：**
```vue
<!-- ClickableCard.vue -->
<script setup>
// Declared 'click' but never emit it!
const emit = defineEmits(['click', 'select'])
</script>

<template>
  <div class="card">
    <slot></slot>
  </div>
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <!-- This NEVER fires! Native clicks are blocked -->
  <ClickableCard @click="handleClick">
    Click me
  </ClickableCard>
</template>
```

**为什么失败：**
1、`click`在`emits`中声明
2.Vue将`@click`视为组件事件监听器
3.原生点击`<div>`不触发组件事件
4. 由于 `emit('click')` 从未被调用，因此处理程序永远不会触发

## 解决方案

**选项 1：显式发出事件：**
```vue
<!-- ClickableCard.vue -->
<script setup>
const emit = defineEmits(['click', 'select'])
</script>

<template>
  <!-- Explicitly emit click when div is clicked -->
  <div class="card" @click="emit('click', $event)">
    <slot></slot>
  </div>
</template>
```

**选项 2：不声明本机事件（使用fallthrough）：**
```vue
<!-- ClickableCard.vue -->
<script setup>
// Only declare custom events, not native ones
const emit = defineEmits(['select', 'custom-action'])
</script>

<template>
  <!-- Native @click from parent falls through to this div -->
  <div class="card">
    <slot></slot>
  </div>
</template>
```

```vue
<!-- Parent.vue -->
<template>
  <!-- Native click falls through and works -->
  <ClickableCard @click="handleClick">
    Click me
  </ClickableCard>
</template>
```

## 受影响的原生事件

这适用于您可能声明的任何本机 DOM 事件：

|活动 |声明时的行为 |
|-------|----------------------|
| `click` |只响应`emit('click')`，不响应原生点击 |
| `input` |只响应`emit('input')`，不响应原生输入 |
| `change` |只响应`emit('change')`，不原生改变|
| `focus` |只响应`emit('focus')`，不响应原生焦点 |
| `blur` |仅响应 `emit('blur')`，不响应原生模糊 |
| `submit` |只响应`emit('submit')`，不响应原生表单提交 |
| `keydown` |仅响应 `emit('keydown')`，不响应本机 keydown |

## 当这是故意的时

有时你想拦截本机事件：

```vue
<!-- CustomInput.vue -->
<script setup>
// Intentionally intercept 'input' to transform the value
const emit = defineEmits(['input', 'update:modelValue'])

function handleInput(event) {
  const transformedValue = event.target.value.toUpperCase()
  emit('input', transformedValue) // Emit transformed value, not raw event
  emit('update:modelValue', transformedValue)
}
</script>

<template>
  <input @input="handleInput" />
</template>
```

在这里，声明 `input` 是正确的，因为您希望在将本机事件传递给父级之前拦截并转换本机事件。

## 调试技巧

如果您的点击处理程序未触发：

1.检查事件是否在`emits`中声明
2. 如果已声明，请确保您在某处调用 `emit('click')`
3. 如果您想要本机行为，请从 `emits` 声明中删除
4. 使用 Vue DevTools 查看正在发出哪些事件

```vue
<script setup>
const emit = defineEmits(['click'])

function handleClick(event) {
  console.log('Native click received, now emitting component event')
  emit('click', event)
}
</script>

<template>
  <div @click="handleClick">Click me</div>
</template>
```

## 参考
- [Vue.js 组件事件](https://vuejs.org/guide/components/events.html)
- [Vue.js Fallthrough 属性](https://vuejs.org/guide/components/attrs.html)
