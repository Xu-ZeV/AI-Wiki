---
title: Teleport 组件最佳实践
impact: MEDIUM
impactDescription: Teleport renders content outside the component's DOM position, which is essential for overlays but affects styling and layout
type: best-practice
tags: [vue3, teleport, modal, overlay, positioning, responsive]
---

# Teleport 组件最佳实践

**影响：中** - `<Teleport>` 在 DOM 中的不同位置渲染组件模板的一部分，同时保留 Vue 组件层次结构。将其用于叠加层（模态、toast、工具提示）或任何必须逃脱堆叠上下文、溢出或固定定位约束的 UI。

## 任务列表

- 将覆盖层Teleport到 `body` 或应用程序根目录之外的专用容器
- 为相似的 UI（`#modals`、`#notifications`）保留共享目标，并使用顺序或 z 索引控制分层
- 使用 `:disabled` 进行响应式布局，应在小屏幕上内联渲染
- 记住props、emits和提供/注入仍然可以通过Teleport进行工作
- 避免依赖父级堆叠上下文或Teleport UI 的转换

## 从变形容器中Teleport覆盖层

当祖先具有 `transform`、`filter` 或 `perspective` 时，固定位置叠加的行为就像它们位于本地一样。Teleport逃离了这种环境。

**不好：**
```vue
<template>
  <div class="animated-container">
    <button @click="open = true">Open</button>

    <!-- Broken: fixed positioning is scoped to the transformed parent -->
    <div v-if="open" class="modal">Modal</div>
  </div>
</template>

<style>
.animated-container {
  transform: translateZ(0);
}

.modal {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
</style>
```

**好：**
```vue
<template>
  <div class="animated-container">
    <button @click="open = true">Open</button>

    <Teleport to="body">
      <div v-if="open" class="modal">Modal</div>
    </Teleport>
  </div>
</template>
```

## `disabled` 的响应式布局

使用 `:disabled` 在移动设备上内联渲染并在更大的屏幕上Teleport：

```vue
<script setup>
import { useMediaQuery } from '@vueuse/core'

const isMobile = useMediaQuery('(max-width: 768px)')
</script>

<template>
  <Teleport to="body" :disabled="isMobile">
    <nav class="sidebar">Navigation</nav>
  </Teleport>
</template>
```

## 保留逻辑层次结构

Teleport 改变 DOM 位置，而不是 Vue 组件树。props、emits、插槽和提供/注入仍然有效：

```vue
<template>
  <Teleport to="body">
    <ChildPanel :message="message" @close="open = false" />
  </Teleport>
</template>
```

## 多次Teleport到同一目标

Teleport到同一目标并按声明顺序附加：

```vue
<template>
  <Teleport to="#notifications">
    <div>First</div>
  </Teleport>

  <Teleport to="#notifications">
    <div>Second</div>
  </Teleport>
</template>
```

使用共享容器来保持堆叠的可预测性，并仅在需要显式分层时应用 z-index。
