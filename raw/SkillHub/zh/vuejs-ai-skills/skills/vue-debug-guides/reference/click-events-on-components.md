---
title: 自定义组件上的单击事件需要发出或失败
impact: HIGH
impactDescription: Native click events on custom components won't work without proper emit declaration or attribute fallthrough
type: gotcha
tags: [vue3, events, components, emit, click, migration]
---

# 自定义组件上的单击事件需要发出或失败

**影响：高** - 与原生 HTML 元素不同，自定义 Vue 组件不会自动转发原生 DOM 事件，例如 `click`。您必须显式发出事件，依赖属性fallthrough到单个根元素，或者使用`.native`修饰符（仅限Vue 2，在Vue 3中删除）。这是混乱和迁移问题的常见根源。

## 任务清单

- [ ] 在子组件中使用 `defineEmits` 声明发出的事件
- [ ] 在需要时从子组件发出点击事件
- [ ] 了解单根组件自动将 attrs 转发到根
- [ ] 从 Vue 2 迁移到 Vue 3 时删除 `.native` 修饰符
- [ ] 对于多根组件，显式绑定 `$attrs` 或发出事件

**错误：**
```html
<!-- WRONG: Expecting native click to work on custom component -->
<template>
  <MyButton @click="handleClick">Click me</MyButton>
  <!-- This may not work as expected! -->
</template>
```

```html
<!-- WRONG: Vue 2 .native modifier doesn't exist in Vue 3 -->
<template>
  <MyButton @click.native="handleClick">Click me</MyButton>
  <!-- Error in Vue 3: .native modifier removed -->
</template>
```

```html
<!-- WRONG: Multi-root component with no attr binding -->
<!-- MyButton.vue -->
<template>
  <span>Icon</span>
  <button>{{ label }}</button>
  <!-- No root element to receive click! -->
</template>
```

**正确：**
```html
<!-- CORRECT: Child component emits the click event -->
<!-- MyButton.vue -->
<template>
  <button @click="$emit('click', $event)">
    <slot></slot>
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<!-- Parent.vue -->
<template>
  <MyButton @click="handleClick">Click me</MyButton>
</template>
```

```html
<!-- CORRECT: Single root element with automatic fallthrough -->
<!-- MyButton.vue -->
<template>
  <button>
    <slot></slot>
  </button>
  <!-- @click from parent automatically falls through to button -->
</template>

<!-- Parent.vue -->
<template>
  <MyButton @click="handleClick">Click me</MyButton>
</template>
```

```html
<!-- CORRECT: Multi-root component with explicit $attrs binding -->
<!-- MyButton.vue -->
<template>
  <span>Icon</span>
  <button v-bind="$attrs">
    <slot></slot>
  </button>
</template>

<script setup>
defineOptions({
  inheritAttrs: false
})
</script>
```

## 组件事件不会冒泡

```javascript
// Important: Component-emitted events do NOT bubble
// You can only listen to events from direct children

// WRONG: Trying to catch grandchild events
<GrandParent @child-event="handle">  <!-- Won't receive! -->
  <Parent>
    <Child @click="$emit('child-event')" />
  </Parent>
</GrandParent>

// CORRECT: Each level must relay the event
<GrandParent @child-event="handle">
  <Parent @child-event="$emit('child-event', $event)">
    <Child @click="$emit('child-event')" />
  </Parent>
</GrandParent>
```

## Vue 3 原生事件行为

```javascript
// In Vue 3, if you declare an event in emits:
defineEmits(['click'])

// Then @click on the component ONLY listens to emitted events
// NOT native click events

// If you don't declare 'click' in emits:
defineEmits(['custom-event'])

// Then @click on single-root component will:
// 1. Fall through to root element as native listener
// 2. Fire on native click
```

## 组合 API 发出模式

```vue
<script setup>
// Define what events this component emits
const emit = defineEmits(['click', 'update', 'delete'])

function handleClick(event) {
  // Do component logic
  processClick()

  // Then emit to parent
  emit('click', event)
}
</script>

<template>
  <button @click="handleClick">
    <slot></slot>
  </button>
</template>
```

## 从 Vue 2 迁移

```html
<!-- Vue 2: Used .native for native events on components -->
<MyComponent @click.native="handleClick" />

<!-- Vue 3: Remove .native, ensure component handles the event -->
<MyComponent @click="handleClick" />

<!-- Make sure MyComponent either:
     1. Has single root that receives fallthrough attrs
     2. Explicitly emits 'click' event
     3. Uses v-bind="$attrs" on intended element -->
```

## 参考
- [Vue.js 组件事件](https://vuejs.org/guide/components/events.html)
- [Vue.js Fallthrough 属性](https://vuejs.org/guide/components/attrs.html)
- [Vue 3 迁移 - .native 修饰符已删除](https://v3-migration.vuejs.org/breaking-changes/v-on-native-modifier-removed.html)
