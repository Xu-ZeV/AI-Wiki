---
title: Vue 3 调试指南
skill: vue-debug-guides
category: Vue 3 工程实践
category_slug: vue-engineering
source: raw/SkillHub/categories/vue-engineering/vue-debug-guides/SKILL.md
tags:
  - SKILL
  - SKILL/vue-engineering
---
# Vue 3 调试指南

> [!info] Skill 元信息
> 原始名称：`vue-debug-guides`  
> 原始标题：Vue 3 debugging and error handling for runtime issues, warnings, async failures, and hydration bugs.  
> 功能分类：Vue 3 工程实践  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/vue-engineering/vue-debug-guides/SKILL.md)

## 中文含义与用途

中文含义：Vue 3 运行时问题与常见陷阱调试指南。  
核心用处：按问题类型定位 Vue 3 的响应式、computed、watcher、组件、props/emits、模板、表单、生命周期、slots、provide/inject、SSR、Teleport、Suspense、性能和插件配置问题。

## 适用场景

当用户正在诊断或修复 Vue 3 错误、警告、异步失败、SSR hydration mismatch、响应式失效、组件事件异常、模板编译错误、表单同步问题或性能异常时使用。

## 关键能力

- 将 Vue 运行时问题按领域归类，快速定位到对应调试参考
- 覆盖响应式解构、ref `.value`、watch flush 时机、computed 副作用和数组 mutation 等常见坑
- 处理 props/emits、defineProps/defineEmits、模板指令、v-for key、v-model 和事件修饰符问题
- 识别生命周期、template refs、slots、provide/inject、fallthrough attrs 和 composable 调用位置错误
- 覆盖 SSR hydration、Teleport、Suspense、KeepAlive、Transition、render function、SFC、插件和 app 配置问题
- 补充性能诊断方向，如不稳定 props 和 computed 对象稳定性

## 使用边界与注意事项

- 它用于诊断和修复 Vue 问题，不是新功能开发的默认总入口；新开发仍应先使用 vue-best-practices。
- 它只在 skill 页保留原始来源链接，不把大量 reference 文档展开为 wiki 页面。
- 具体问题若涉及 Router、Pinia、测试或 JSX，应同时使用对应专项 skill。

## 原始描述中文摘要

Vue 3 调试和错误处理指南，覆盖运行时错误、警告、异步失败以及 SSR/hydration 问题。用于诊断或修复 Vue 问题。

## 原始文档章节

- Reactivity
- Computed
- Watchers
- Components
- Props & Emits
- Templates
- Template Refs
- Forms & v-model
- Events & Modifiers
- Lifecycle
- Slots
- Provide/Inject
- Attrs
- Composables
- Composition API
- Animation
- TypeScript
- Async Components
- Render Functions
- KeepAlive
- Transitions
- Teleport
- Suspense
- SSR
- Performance
- SFC (Single File Components)
- Plugins
- App Configuration

## 相关 Skill

- [[wiki/SkillHub/skills/vue-best-practices|Vue 3 最佳实践工作流]]
- [[wiki/SkillHub/skills/vue-router-best-practices|Vue Router 4 最佳实践]]
- [[wiki/SkillHub/skills/vue-pinia-best-practices|Pinia 状态管理最佳实践]]
- [[wiki/SkillHub/skills/vue-testing-best-practices|Vue 测试最佳实践]]
- [[wiki/SkillHub/skills/vue-jsx-best-practices|Vue JSX 最佳实践]]
