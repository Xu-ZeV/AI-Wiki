---
name: vue-best-practices
description: 必须用于 Vue.js 任务。强烈推荐使用 `<script setup>` 和 TypeScript 作为标准方法的 Composition API。涵盖 Vue 3、SSR、Volar、vue-tsc。使用 Vue 加载任何 Vue、.vue 文件、Vue Router、Pinia 或 Vite。除非项目明确需要选项 API，否则始终使用组合 API。
license: MIT
metadata:
  author: github.com/vuejs-ai
  version: "18.0.0"
---

# Vue 最佳实践工作流程

使用此技能作为指令集。按顺序遵循工作流，除非用户明确要求不同的顺序。

## 核心原则
- **保持状态可预测：** 事实来源之一，导出其他一切。
- **使数据流明确：** 大多数情况下，props向下，事件向上。
- **青睐小型、集中的组件：**更易于测试、重用和维护。
- **避免不必要的重新渲染：** 明智地使用计算属性和侦听器。
- **可读性很重要：**编写清晰、自记录的代码。

## 1）编码前确认架构（必填）

- 默认堆栈：Vue 3 + Composition API + `<script setup lang="ts">`。
- 如果项目明确使用选项 API，则加载 `vue-options-api-best-practices` 技能（如果可用）。
- 如果项目明确使用 JSX，请加载 `vue-jsx-best-practices` 技能（如果可用）。

### 1.1 必读核心参考文献（必填）

- 在实现任何 Vue 任务之前，请确保阅读并应用这些核心参考资料：
  - `references/reactivity.md`
  - `references/sfc.md`
  - `references/component-data-flow.md`
  - `references/composables.md`
- 将这些参考资料保留在整个任务的活动工作环境中，而不仅仅是在出现特定问题时。

### 1.2 编码前规划组件边界（必填）

在实现任何重要功能之前创建一个简短的组件图。

- 用一句话定义每个组件的单一职责。
- 默认情况下，将条目/根和路由级视图组件保留为合成表面。
- 将功能 UI 和功能逻辑移出条目/根/视图组件，除非该任务是故意的小型单文件演示。
- 为地图中的每个子组件定义 props/emits 契约。
- 添加多个组件时，首选功能文件夹布局（`components/<feature>/...`、`composables/use<Feature>.ts`）。

## 2) 应用必要的 Vue 基础（必需）

这些都是必不可少的、必须了解的基础知识。使用 `1.1` 部分中已加载的核心引用将它们全部应用到每个 Vue 任务中。

### 响应式

- `1.1` 的必读参考文献：[响应式](references/reactivity.md)
- 保持源状态最小（`ref`/`reactive`），使用 `computed` 导出一切可能的内容。
- 如果需要的话，使用侦听器来观察副作用。
- 避免在模板中重新计算昂贵的逻辑。

### SFC 结构和模板安全

- 必须阅读 `1.1` 的参考文献：[sfc](references/sfc.md)
- 按以下顺序保留 SFC 部分：`<script>` → `<template>` → `<style>`。
- 保持证监会职责的重点；拆分大型组件。
- 保持模板声明性；将分支/派生移至脚本。
- 应用 Vue 模板安全规则（`v-html`、列表渲染、条件渲染选择）。

### 保持组件的焦点

当组件具有**多个明确的职责**（例如数据编排 + UI，或多个独立的 UI 部分）时，拆分组件。

- 更喜欢**较小的组件+可组合**而不是一个“大型组件”
- 将**UI 部分**移动到子组件中（props输入，事件输出）。
- 将 **状态/副作用** 移至可组合函数 (`useXxx()`)。

应用目标分割触发器。如果**任何**条件为真，则拆分组件：

- 它拥有多个部分的编排/状态和大量的表示标记。
- 它有 3 个以上不同的 UI 部分（例如：表单、过滤器、列表、页脚/状态）。
- 模板块重复或可以重复使用（项目行、卡片、列表条目）。

入口/根及路由查看规则：

- 保持入口/根和路由视图组件的精简：应用程序外壳/布局、提供程序连接和功能组合。
- 当条目/根/视图组件包含独立部分时，不要将完整的功能实现放在这些组件中。
- 对于 CRUD/列表功能（待办事项、表格、目录、收件箱），至少分为：
  - 功能容器组件
  - 输入/表单组件
  - 列表（和/或项目）组件
  - 页脚/操作或过滤器/状态组件
- 仅允许非常小的一次性演示使用单文件实现；如果选择，请明确说明为什么不需要拆分。

### 组件数据流

- 来自 `1.1` 的必读参考：[组件数据流](references/component-data-flow.md)
- 使用props向下、事件向上作为主要模型。
- 仅对真正的双向组件合约使用 `v-model`。
- 仅对深层树依赖项或共享上下文使用提供/注入。
- 保持合同明确，并根据需要使用 `defineProps`、`defineEmits` 和 `InjectionKey` 键入。

### 可组合函数

- 来自 `1.1` 的必读参考：[可组合函数](references/composables.md)
- 当逻辑被重用、有状态或副作用严重时，将逻辑提取到可组合函数中。
- 保持可组合 API 较小、类型化且可预测。
- 将功能逻辑与表示组件分开。

## 3) 仅在需要时才考虑可选功能

### 3.1 标准可选功能

默认情况下不要添加这些。仅当存在需求时才加载匹配的参考。

- 插槽：父级需要控制子级内容/布局 -> [组件插槽](references/component-slots.md)
- Fallthrough 属性：包装器/基础组件必须安全地转发 attrs/事件 -> [component-fallthrough-attrs](references/component-fallthrough-attrs.md)
- 用于状态视图缓存的内置组件 `<KeepAlive>` -> [component-keep-alive](references/component-keep-alive.md)
- 用于覆盖层/门户的内置组件 `<Teleport>` -> [组件Teleport](references/component-teleport.md)
- 用于异步子树后备边界的内置组件 `<Suspense>` -> [component-suspense](references/component-suspense.md)
- 动画相关功能：选择与所需运动行为相匹配的最简单方法。
  - 用于进入/离开效果的内置组件 `<Transition>` -> [transition](references/component-transition.md)
  - 用于动画列表突变的内置组件 `<TransitionGroup>` -> [transition-group](references/component-transition-group.md)
  - 基于类的非进入/离开效果动画 -> [animation-class-based-technique](references/animation-class-based-technique.md)
  - 用户输入驱动动画的状态驱动动画 -> [animation-state-driven-technique](references/animation-state-driven-technique.md)

### 3.2 不太常见的可选功能

仅当有明确的产品或技术需要时才使用这些。

- 指令：行为是 DOM 特定的，并且不是一个很好的可组合/组件配合 -> [指令](references/directives.md)
- 异步组件：重/很少使用的 UI 应该延迟加载 -> [component-async](references/component-async.md)
- 仅当模板无法表达需求时才渲染函数 -> [render-functions](references/render-functions.md)
- 必须在应用程序范围内安装行为时的插件 -> [插件](references/plugins.md)
- 状态管理模式：应用程序范围的共享状态跨越功能边界 -> [状态管理](references/state-management.md)

## 4) 行为正确后运行性能优化

绩效工作是一种后功能性的通行证。在实现和验证核心行为之前不要进行优化。

- 大列表渲染瓶颈 -> [perf-virtualize-large-lists](references/perf-virtualize-large-lists.md)
- 静态子树不必要地重新渲染 -> [perf-v-once-v-memo-directives](references/perf-v-once-v-memo-directives.md)
- 热列表路径中的过度抽象 -> [perf-avoid-component-abstraction-in-lists](references/perf-avoid-component-abstraction-in-lists.md)
- 昂贵的更新触发过于频繁 -> [updated-hook-performance](references/updated-hook-performance.md)

## 5) 完成前的最后自检

- 核心行为有效并符合要求。
- 所有必读参考文献均已阅读并应用。
- 反应模型最小且可预测。
- 遵循 SFC 结构和模板规则。
- 组件集中且精心设计，在需要时进行拆分。
- 入口/根和路线视图组件保留合成表面，除非有明确的小演示例外。
- 组件拆分决策明确且站得住脚（责任边界清晰）。
- 数据流契约是显式的和类型化的。
- 可组合函数用于重用/复杂性合理的地方。
- 将状态/副作用移至可组合函数（如果适用）
- 仅当需要时才使用可选功能。
- 仅在功能完成后才应用性能更改。
