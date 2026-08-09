---
title: Teleport目标在挂载之前必须存在
impact: HIGH
impactDescription: Teleport will fail silently or throw errors if target element doesn't exist when component mounts
type: gotcha
tags: [vue3, teleport, modal, dom, lifecycle]
---

# Teleport目标在挂载之前必须存在

**影响：高** - 安装 `<Teleport>` 组件时，Teleport `to` 目标必须已存在于 DOM 中。如果目标不存在，Vue 将抛出错误，并且Teleport的内容将不会呈现。

这是使用模态、工具提示或其他Teleport的 UI 元素时常见的错误来源，特别是在针对 Vue 渲染的元素时。

## 任务清单

- [ ] 在 `<Teleport>` 挂载之前确保Teleport目标存在于 DOM 中
- [ ] 将Teleport容器（例如，`#modals`、`#tooltips`）放置在 Vue 应用程序外部的 `index.html` 中
- [ ] 如果针对 Vue 渲染的元素，请确保它们在 Teleport 之前挂载
- [ ] 当目标稍后在同一组件树中渲染时，使用 Vue 3.5+ `defer` 属性

**错误：**
```vue
<template>
  <!-- ERROR: Target doesn't exist yet when Teleport mounts -->
  <Teleport to="#modal-container">
    <div class="modal">Modal content</div>
  </Teleport>

  <!-- Target is defined after the Teleport -->
  <div id="modal-container"></div>
</template>
```

**正确 - 选项 1：index.html 中的外部容器：**
```html
<!-- index.html -->
<body>
  <div id="app"></div>
  <!-- Container exists before Vue app mounts -->
  <div id="modals"></div>
  <div id="tooltips"></div>
</body>
```

```vue
<template>
  <!-- Safe: #modals exists before any Vue component mounts -->
  <Teleport to="#modals">
    <div v-if="showModal" class="modal">Modal content</div>
  </Teleport>
</template>
```

**正确 - 选项 2：Teleport到身体：**
```vue
<template>
  <!-- Safe: body always exists -->
  <Teleport to="body">
    <div v-if="showModal" class="modal">Modal content</div>
  </Teleport>
</template>
```

**正确 - 选项 3：Vue 3.5+ defer 属性：**
```vue
<template>
  <!-- Works in Vue 3.5+: defer resolves target after other parts mount -->
  <Teleport defer to="#late-container">
    <div class="modal">Modal content</div>
  </Teleport>

  <!-- Target rendered later in template -->
  <div id="late-container"></div>
</template>
```

## Defer Pro 限制（Vue 3.5+）

`defer` 属性仅等待在**相同的安装/更新标记**中渲染的元素：

```vue
<template>
  <!-- ERROR: defer won't help if target mounts asynchronously -->
  <Teleport defer to="#async-container">
    <div>Content</div>
  </Teleport>

  <!-- If this component loads asynchronously, defer won't work -->
  <Suspense>
    <AsyncComponent />  <!-- Contains #async-container -->
  </Suspense>
</template>
```

## 常见模式

### 推荐：集中Teleport容器
```html
<!-- index.html -->
<body>
  <div id="app"></div>

  <!-- Teleport destinations outside Vue app -->
  <div id="modals" aria-live="polite"></div>
  <div id="notifications" aria-live="assertive"></div>
  <div id="tooltips"></div>
</body>
```

## 参考
- [Vue.js Teleport - 与 Vue 渲染的目标一起使用](https://vuejs.org/guide/built-ins/teleport.html#using-with-vue-rendered-targets)
- [Vue.js Teleport - 延迟Teleport](https://vuejs.org/guide/built-ins/teleport.html#deferred-teleport)
