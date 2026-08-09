---
title: Vue 3 Options API 最佳实践
skill: vue-options-api-best-practices
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/vuejs-ai-skills/skills/vue-options-api-best-practices/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# Vue 3 Options API 最佳实践

> [!info] Skill 元信息
> 原始名称：`vue-options-api-best-practices`  
> 原始标题：Vue.js Options API best practices, TypeScript integration, and common gotchas.  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/vuejs-ai-skills/skills/vue-options-api-best-practices/SKILL.md)

## 中文含义与用途

中文含义：Vue 3 Options API 风格代码的最佳实践。  
核心用处：在项目明确使用 Options API 时，指导 `data()`、`methods`、生命周期、computed、props、provide/inject 和 TypeScript `this` 上下文的正确写法。

## 适用场景

当现有 Vue 3 项目或组件明确采用 Options API，或用户要求维护 Options API 代码时使用。它不应作为新建 Vue 3 代码的默认首选，新代码默认仍由 vue-best-practices 引导到 Composition API。

## 关键能力

- 使用 `defineComponent` 改善 Options API 的 TypeScript 推断
- 处理 Options API 中 `this` 上下文的类型安全
- 正确声明复杂对象、数组 props 和事件处理函数类型
- 避免 methods 与生命周期钩子中的箭头函数导致实例上下文丢失
- 识别防抖函数等有状态方法在组件实例间共享状态的问题

## 使用边界与注意事项

- 每个 reference 都只给 Options API 解法，不应套用到 Composition API 代码。
- 只有项目已有 Options API 约束或迁移成本较高时使用。
- 与 vue-best-practices 同用时，应以项目既有架构为准，不强行改写为 Composition API。

## 原始描述中文摘要

面向 Vue 3 Options API 风格，覆盖 `data()`、`methods`、`this` 上下文和 TypeScript。每个参考条目都只展示 Options API 解决方案。

## 原始文档章节

- TypeScript
- Methods & Lifecycle

## 相关 Skill

- [[wiki/SkillHub/skills/vue-best-practices|Vue 3 最佳实践工作流]]
- [[wiki/SkillHub/skills/vue-debug-guides|Vue 3 调试指南]]
- [[wiki/SkillHub/skills/vue-testing-best-practices|Vue 测试最佳实践]]
