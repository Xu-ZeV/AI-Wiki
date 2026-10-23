---
title: 可适配 Vue Composable 创建
skill: create-adaptable-composable
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/categories/vue-engineering/create-adaptable-composable/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# 可适配 Vue Composable 创建

> [!info] Skill 元信息
> 原始名称：`create-adaptable-composable`  
> 原始标题：Create Adaptable Composable  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/vue-engineering/create-adaptable-composable/SKILL.md)

## 中文含义与用途

中文含义：创建支持多种响应式输入形态的 Vue composable。  
核心用处：设计库级 `useXxx()` 函数，使调用方可以传入普通值、`ref`、`shallowRef`、`computed` 或 getter，并在 `watch`、`watchEffect` 等响应式 effect 内用 `toValue()` 或 `toRef()` 正确归一化。

## 适用场景

当用户要求创建可复用 composable，且输入可能来自普通值、ref、computed、getter 或 DOM/Element target 时使用。尤其适合公开库 API、跨项目复用 composable 或需要兼容 maybe-reactive 输入的场景。

## 关键能力

- 区分 `MaybeRef<T>` 与 `MaybeRefOrGetter<T>` 的适用范围
- 为只读、computed-friendly 输入选择 `MaybeRefOrGetter`
- 为可写或双向输入选择 `MaybeRef`
- 避免把回调、predicate 或 comparator 当作 getter 意外执行
- 在 watcher source 等响应式场景中使用 `toRef()`，在取普通值时使用 `toValue()`
- 设计清晰的 composable 输入、输出和副作用边界

## 使用边界与注意事项

- 它聚焦 composable API 设计，不负责组件拆分、界面实现或测试策略。
- 如果参数本身可能是函数值，应谨慎使用 `MaybeRefOrGetter`，避免把业务回调误当 getter 调用。
- DOM target 需要支持 computed 或派生目标时，可以使用 `MaybeRefOrGetter`。
- 需要完整 Vue 任务上下文时，应与 vue-best-practices 配合使用。

## 原始描述中文摘要

创建库级 Vue composable，接受 maybe-reactive 输入，让调用方可以传普通值、ref 或 getter，并在 reactive effect 内使用 `toValue()` / `toRef()` 保持行为可预测和响应式。

## 原始文档章节

- Core Type Concepts
- Type Utilities
- Policy and Rules
- Examples

## 相关 Skill

- [[wiki/SkillHub/skills/vue-best-practices|Vue 3 最佳实践工作流]]
- [[wiki/SkillHub/skills/vue-debug-guides|Vue 3 调试指南]]
- [[wiki/SkillHub/skills/vue-testing-best-practices|Vue 测试最佳实践]]
