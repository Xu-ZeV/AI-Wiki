---
title: Vue 3 最佳实践工作流
skill: vue-best-practices
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/vuejs-ai-skills/skills/vue-best-practices/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# Vue 3 最佳实践工作流

> [!info] Skill 元信息
> 原始名称：`vue-best-practices`  
> 原始标题：Vue Best Practices Workflow  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/vuejs-ai-skills/skills/vue-best-practices/SKILL.md)

## 中文含义与用途

中文含义：Vue 3 开发任务的默认工程实践工作流。  
核心用处：为所有 Vue、`.vue`、Vue Router、Pinia 或 Vite 相关任务提供默认约束，优先使用 Composition API、`<script setup lang="ts">` 和 TypeScript，并要求先确认架构、组件边界和数据流。

## 适用场景

当用户要求开发、修改、重构或检查 Vue 3 项目时使用。它适合作为 Vue 任务的总入口，再按需要叠加 Router、Pinia、测试、JSX 或 Options API 相关 skill。

## 关键能力

- 默认采用 Vue 3、Composition API、`<script setup lang="ts">` 和 TypeScript
- 在编码前确认组件边界、职责、props/emits 合约和 feature 目录拆分
- 约束响应式模型，保持源状态最小化，用 computed 派生数据
- 强化 SFC 结构、模板安全、组件聚焦和显式数据流
- 只在需求明确时使用 slots、fallthrough attrs、KeepAlive、Teleport、Suspense、动画、指令、异步组件、render function、plugin 或全局状态
- 在功能正确后再做性能优化和最终自检

## 使用边界与注意事项

- 它是 Vue 任务的默认入口，但不替代具体业务需求分析。
- 如果项目明确使用 Options API，应配合 vue-options-api-best-practices。
- 如果任务明确涉及 JSX、Router、Pinia、测试或调试，应配合对应专项 skill。
- 单文件实现只适合很小的临时 demo；非平凡功能应拆分组件和 composable。

## 原始描述中文摘要

必须用于 Vue.js 任务；强烈推荐 Composition API、`<script setup>` 和 TypeScript。覆盖 Vue 3、SSR、Volar、vue-tsc，并要求除非项目明确需要 Options API，否则始终使用 Composition API。

## 原始文档章节

- Core Principles
- 1) Confirm architecture before coding (required)
- 2) Apply essential Vue foundations (required)
- 3) Consider optional features only when requirements call for them
- 4) Run performance optimization after behavior is correct
- 5) Final self-check before finishing

## 相关 Skill

- [[wiki/SkillHub/skills/vue-options-api-best-practices|Vue 3 Options API 最佳实践]]
- [[wiki/SkillHub/skills/vue-router-best-practices|Vue Router 4 最佳实践]]
- [[wiki/SkillHub/skills/vue-pinia-best-practices|Pinia 状态管理最佳实践]]
- [[wiki/SkillHub/skills/vue-testing-best-practices|Vue 测试最佳实践]]
- [[wiki/SkillHub/skills/vue-debug-guides|Vue 3 调试指南]]
