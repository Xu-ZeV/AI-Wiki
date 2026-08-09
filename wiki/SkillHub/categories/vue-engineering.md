---
title: Vue 3 工程实践
category_slug: vue-engineering
tags:
  - SKILL/category
---
# Vue 3 工程实践

面向 Vue 3 项目开发、维护和调试的工程实践 skill，覆盖 Composition API、`<script setup>`、TypeScript、Options API、Vue Router、Pinia、测试、JSX、运行时调试和可复用 composable 设计。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[vue-best-practices]] | Vue 3 最佳实践工作流 | `vue-best-practices` | Vue 任务的默认入口，强调 Composition API、`<script setup lang="ts">`、组件边界、响应式和数据流。 |
| [[vue-options-api-best-practices]] | Vue 3 Options API 最佳实践 | `vue-options-api-best-practices` | 处理仍使用 Options API 的 Vue 3 代码，覆盖 `data()`、`methods`、生命周期和 TypeScript `this` 上下文。 |
| [[vue-router-best-practices]] | Vue Router 4 最佳实践 | `vue-router-best-practices` | 处理 Vue Router 4 的导航守卫、路由参数变化、组件生命周期和生产级路由配置。 |
| [[vue-pinia-best-practices]] | Pinia 状态管理最佳实践 | `vue-pinia-best-practices` | 处理 Pinia store 安装时机、setup store 状态返回、store 解构响应式和状态归属。 |
| [[vue-testing-best-practices]] | Vue 测试最佳实践 | `vue-testing-best-practices` | 处理 Vue 组件、composable、Pinia、异步组件、Teleport 和端到端测试。 |
| [[vue-jsx-best-practices]] | Vue JSX 最佳实践 | `vue-jsx-best-practices` | 处理 Vue JSX 语法与 React JSX 的差异，尤其是属性命名和 Vite/TypeScript 配置。 |
| [[vue-debug-guides]] | Vue 3 调试指南 | `vue-debug-guides` | 诊断 Vue 3 运行时错误、警告、响应式异常、异步失败、SSR hydration 和性能问题。 |
| [[create-adaptable-composable]] | 可适配 Vue Composable 创建 | `create-adaptable-composable` | 创建支持普通值、ref、computed 或 getter 输入的库级 Vue composable。 |

## 使用建议

- 普通 Vue 3 开发任务优先使用 vue-best-practices，再按项目显式技术栈叠加 Router、Pinia、测试或 JSX skill。
- 只有项目明确使用 Options API 时才使用 vue-options-api-best-practices；新代码默认仍以 Composition API 和 `<script setup lang="ts">` 为主。
- 调试具体 Vue 问题时使用 vue-debug-guides；需要编写测试时使用 vue-testing-best-practices。
- 创建可复用 composable 且输入可能是普通值、ref、computed 或 getter 时使用 create-adaptable-composable。
