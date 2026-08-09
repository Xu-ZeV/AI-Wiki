---
title: Vue JSX 最佳实践
skill: vue-jsx-best-practices
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/vuejs-ai-skills/skills/vue-jsx-best-practices/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# Vue JSX 最佳实践

> [!info] Skill 元信息
> 原始名称：`vue-jsx-best-practices`  
> 原始标题：Vue JSX best practices and differences from React JSX.  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/vuejs-ai-skills/skills/vue-jsx-best-practices/SKILL.md)

## 中文含义与用途

中文含义：Vue 中使用 JSX/TSX 的语法实践。  
核心用处：帮助区分 Vue JSX 与 React JSX 的属性、事件和配置差异，避免把 React 的 `className` 等约定错误迁移到 Vue JSX。

## 适用场景

当 Vue 项目明确使用 JSX/TSX、render function，或用户正在从 React JSX 迁移代码到 Vue 并遇到属性类型、事件处理或 Vite/TypeScript 配置问题时使用。

## 关键能力

- 识别 Vue JSX 使用 HTML 属性名而非 React 属性名的差异
- 处理 `class`、`for`、事件监听和其他 JSX 属性差异
- 检查 Vue JSX 所需的 TypeScript 与 Vite 配置
- 帮助从 React JSX 迁移时减少语法和类型错误

## 使用边界与注意事项

- 它只在 Vue 项目明确使用 JSX/TSX 时需要；普通 SFC 模板任务不必加载。
- Vue JSX 与 React JSX 不能简单机械替换，尤其是属性名和事件约定。
- 涉及 render function 的复杂问题可同时参考 vue-debug-guides。

## 原始描述中文摘要

覆盖 Vue 中 JSX 语法，例如 `class` 与 `className` 的差异，以及 JSX 插件配置。

## 原始文档章节

- JSX

## 相关 Skill

- [[wiki/SkillHub/skills/vue-best-practices|Vue 3 最佳实践工作流]]
- [[wiki/SkillHub/skills/vue-debug-guides|Vue 3 调试指南]]
