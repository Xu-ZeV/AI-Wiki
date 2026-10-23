---
title: Vue 测试最佳实践
skill: vue-testing-best-practices
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/categories/vue-engineering/vue-testing-best-practices/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# Vue 测试最佳实践

> [!info] Skill 元信息
> 原始名称：`vue-testing-best-practices`  
> 原始标题：Vue.js testing best practices, patterns, and common gotchas.  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/vue-engineering/vue-testing-best-practices/SKILL.md)

## 中文含义与用途

中文含义：Vue 3 组件、composable 和端到端测试实践。  
核心用处：指导 Vue 项目选择和编写 Vitest、Vue Test Utils、组件测试、composable 测试、Pinia 测试、异步测试、Teleport 测试和 Playwright E2E 测试。

## 适用场景

当用户要求为 Vue 组件、页面、composable、Pinia store、异步组件、Teleport 弹层或完整用户流程添加、修复或评审测试时使用。

## 关键能力

- 推荐 Vue 3 项目的 Vitest 与 Vue Test Utils 测试基础设施
- 强调黑盒组件测试，减少因内部重构导致的脆弱测试
- 正确处理 `nextTick`、`flushPromises`、async setup 和 Suspense
- 为依赖生命周期、provide/inject 或 Pinia 的 composable/组件搭建测试 wrapper
- 避免只依赖 snapshot 测试掩盖行为缺陷
- 在需要真实浏览器事件、样式或完整流程时选择 Playwright E2E

## 使用边界与注意事项

- 它提供测试策略和常见坑位，不替代具体业务验收标准。
- 组件测试应优先验证用户可观察行为，而不是内部实现细节。
- 若测试失败源于响应式、Router 或 Pinia 问题，应同时参考对应专项 skill。

## 原始描述中文摘要

用于 Vue.js 测试，覆盖 Vitest、Vue Test Utils、组件测试、mock、测试模式和 Playwright 端到端测试。

## 原始文档章节

- Testing
- Reference

## 相关 Skill

- [[wiki/SkillHub/skills/vue-best-practices|Vue 3 最佳实践工作流]]
- [[wiki/SkillHub/skills/vue-pinia-best-practices|Pinia 状态管理最佳实践]]
- [[wiki/SkillHub/skills/vue-router-best-practices|Vue Router 4 最佳实践]]
- [[wiki/SkillHub/skills/vue-debug-guides|Vue 3 调试指南]]
