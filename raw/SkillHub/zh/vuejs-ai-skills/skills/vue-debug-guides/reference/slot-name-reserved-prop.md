---
title: 插槽名称已保留，不包含在插槽props中
impact: LOW
impactDescription: Expecting 'name' in scoped slot props when it's reserved causes confusion
type: gotcha
tags: [vue3, slots, scoped-slots, reserved-props, naming]
---

# 插槽名称已保留，不包含在插槽属性中

**影响：低** - 使用作用域插槽时，`<slot>` 元素上的 `name` 属性保留用于标识插槽。它不会作为 slot props 的一部分传递给父组件。

## 任务清单

- [ ] 不要指望 `name` 出现在插槽props中 - 它是保留的
- [ ] 如果需要传递名称值，请使用不同的props名称
- [ ] 记住只有显式绑定的属性才会成为插槽props

**不正确的期望：**
```vue
<!-- ChildComponent.vue -->
<template>
  <div>
    <slot name="header" title="Welcome"></slot>
  </div>
</template>
```

```vue
<!-- ParentComponent.vue -->
<ChildComponent>
  <template #header="props">
    <!-- props = { title: "Welcome" } -->
    <!-- 'name' is NOT included! -->
    {{ props.name }}  <!-- undefined -->
    {{ props.title }} <!-- "Welcome" -->
  </template>
</ChildComponent>
```

**如果您需要传递“名称”值：**
```vue
<!-- ChildComponent.vue -->
<template>
  <div>
    <!-- Use a different prop name like 'slotName' or 'label' -->
    <slot name="header" :label="slotLabel" :title="title"></slot>
  </div>
</template>

<script setup>
const slotLabel = 'header'
const title = 'Welcome'
</script>
```

```vue
<!-- ParentComponent.vue -->
<ChildComponent>
  <template #header="{ label, title }">
    <h2>{{ title }}</h2>
    <span>Section: {{ label }}</span>
  </template>
</ChildComponent>
```

## 什么被作为插槽props传递

| `<slot>` 上的属性 |传递给父级？ |
|----------------------|-------------------|
| `name` |否（保留用于插槽识别）|
| `:text="message"` |是的，如 `text` |
| `:count="5"` |是的，如 `count` |
| `v-bind="object"` |是的，传播对象属性 |
| `class="..."` |否（不受 `:` 约束）|

## 多个命名槽示例

```vue
<!-- TabPanel.vue -->
<template>
  <div class="tabs">
    <slot name="tab1" :active="activeTab === 1" :label="'First Tab'"></slot>
    <slot name="tab2" :active="activeTab === 2" :label="'Second Tab'"></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const activeTab = ref(1)
</script>
```

```vue
<!-- Usage -->
<TabPanel>
  <template #tab1="{ active, label }">
    <!-- 'name' not available, but 'label' is -->
    <button :class="{ active }">{{ label }}</button>
  </template>

  <template #tab2="{ active, label }">
    <button :class="{ active }">{{ label }}</button>
  </template>
</TabPanel>
```

## 参考
- [Vue.js 插槽 - 范围插槽](https://vuejs.org/guide/components/slots.html#scoped-slots)
