---
title: Vue Router 4 最佳实践
skill: vue-router-best-practices
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/vuejs-ai-skills/skills/vue-router-best-practices/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# Vue Router 4 最佳实践

> [!info] Skill 元信息
> 原始名称：`vue-router-best-practices`  
> 原始标题：Vue Router best practices, common gotchas, and navigation patterns.  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/vuejs-ai-skills/skills/vue-router-best-practices/SKILL.md)

## 中文含义与用途

中文含义：Vue Router 4 的路由与导航实践。  
核心用处：处理导航守卫、路由参数变化、组件生命周期、清理副作用和生产级 SPA 路由配置，减少 stale data、无限重定向和守卫异步错误。

## 适用场景

当 Vue 3 项目使用 Vue Router 4，或任务涉及路由配置、导航守卫、route params、route view 生命周期、同一路由参数切换和单页应用路由设计时使用。

## 关键能力

- 处理同一路由不同参数切换时守卫和组件生命周期不重新触发的问题
- 避免导航守卫中的无限重定向和未等待异步请求
- 正确使用 Vue Router 4 推荐的守卫返回值模式，避免过度依赖旧式 `next()`
- 在组件卸载或路由切换时清理事件监听等副作用
- 判断生产级单页应用何时应使用 Vue Router

## 使用边界与注意事项

- 它聚焦 Vue Router 4，不替代应用级权限、数据加载和缓存策略设计。
- 路由守卫中的状态读取若涉及 Pinia，应同时参考 vue-pinia-best-practices。
- 路由视图中的组件拆分、数据流和响应式仍应遵守 vue-best-practices。

## 原始描述中文摘要

覆盖 Vue Router 4 模式、导航守卫、路由参数和路由组件生命周期交互。

## 原始文档章节

- Navigation Guards
- Route Lifecycle
- Setup

## 相关 Skill

- [[wiki/SkillHub/skills/vue-best-practices|Vue 3 最佳实践工作流]]
- [[wiki/SkillHub/skills/vue-pinia-best-practices|Pinia 状态管理最佳实践]]
- [[wiki/SkillHub/skills/vue-debug-guides|Vue 3 调试指南]]
