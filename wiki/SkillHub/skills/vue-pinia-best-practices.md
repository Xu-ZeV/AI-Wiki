---
title: Pinia 状态管理最佳实践
skill: vue-pinia-best-practices
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/vuejs-ai-skills/skills/vue-pinia-best-practices/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# Pinia 状态管理最佳实践

> [!info] Skill 元信息
> 原始名称：`vue-pinia-best-practices`  
> 原始标题：Pinia best practices, common gotchas, and state management patterns.  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/vuejs-ai-skills/skills/vue-pinia-best-practices/SKILL.md)

## 中文含义与用途

中文含义：Vue 3 项目中 Pinia store 的状态管理实践。  
核心用处：处理 Pinia 安装时机、setup store 状态暴露、store 解构响应式、方法绑定、URL 状态归属和生产级应用状态管理。

## 适用场景

当 Vue 3 项目使用 Pinia，或任务涉及全局/跨功能状态、store 初始化、SSR、DevTools、过滤器状态、store 解构和测试中的 Pinia 注入时使用。

## 关键能力

- 修复 `getActivePinia was called` 等 Pinia 安装顺序或调用时机问题
- 确保 setup store 返回所有应被 DevTools、SSR 和插件识别的状态
- 使用 `storeToRefs` 等模式避免解构 store 破坏响应式
- 识别模板调用中 store 方法上下文丢失的问题
- 区分 URL 中的临时过滤状态和 Pinia 中的应用级共享状态

## 使用边界与注意事项

- 它不要求所有 Vue 状态都进入 Pinia；局部状态仍应保留在组件或 composable 中。
- 路由守卫内使用 store 时，需要同时确认 Vue Router 与 Pinia 的安装顺序。
- 测试 Pinia store 或依赖 store 的组件时，应配合 vue-testing-best-practices。

## 原始描述中文摘要

覆盖 Pinia store、状态管理模式、store 设置和 store 响应式。

## 原始文档章节

- Store Setup
- Reactivity
- State Patterns

## 相关 Skill

- [[wiki/SkillHub/skills/vue-best-practices|Vue 3 最佳实践工作流]]
- [[wiki/SkillHub/skills/vue-router-best-practices|Vue Router 4 最佳实践]]
- [[wiki/SkillHub/skills/vue-testing-best-practices|Vue 测试最佳实践]]
