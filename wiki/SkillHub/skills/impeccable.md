---
title: Impeccable 前端设计工作流
skill: impeccable
category: 高级前端 UI 设计与重构
category_slug: frontend-ui-design
source: raw/SkillHub/impeccable/SKILL.md
tags:
  - SKILL
  - SKILL/frontend-ui-design
---
# Impeccable 前端设计工作流

> [!info] Skill 元信息
> 原始名称：`impeccable`  
> 原始标题：Impeccable  
> 功能分类：高级前端 UI 设计与重构  
> 原始文件：[SKILL.md](../../../raw/SkillHub/impeccable/SKILL.md)

## 中文含义与用途

中文含义：用一套可执行的命令、参考文档和检测脚本，把 agent 约束成更严格的前端设计审计与迭代助手。  
核心用处：在设计、重设计、审计、打磨、响应式适配、动效、文案、颜色、布局和浏览器实时迭代中，持续读取项目上下文、设计系统和具体命令参考，减少泛泛建议和常见 AI UI 痕迹。

## 适用场景

当用户要设计或改进网站、落地页、仪表盘、产品 UI、应用外壳、组件、表单、设置页、入门流程、空状态和其他前端界面时使用。它也适合已有项目的设计审计、可访问性与响应式检查、最终发布前 polish，以及需要在浏览器中选择元素并实时生成视觉变体的场景。

## 关键能力

- 通过 `init` 建立 `PRODUCT.md` 和可选 `DESIGN.md`，让后续设计命令共享用户、品牌、受众、语气和组件约束
- 按命令路由读取 `reference/<command>.md`，覆盖 shape、craft、audit、critique、polish、harden、layout、typeset、colorize、animate、live 等工作流
- 区分品牌/营销页面与产品/工具界面，分别读取 `brand.md` 或 `product.md`，避免把所有前端任务套成同一种风格
- 内置检测脚本，识别过度模板化的 AI 视觉模式、对比度问题、响应式问题、字体和布局反模式
- 支持 live 浏览器迭代、元素级变体、手动编辑回放和子 agent 资产生成
- 明确禁止渐变文字、默认玻璃拟态、嵌套卡片、过圆卡片、廉价阴影、模板化 hero 指标等高频 AI UI 痕迹

## 使用边界与注意事项

- 它只适合前端和 UI 相关任务，不用于纯后端、数据管道或非界面问题。
- 原始 skill 强依赖 `.agents/skills/impeccable/scripts/*` 和 `reference/*`，迁移时必须保留完整目录结构。
- Codex hook 属于项目级配置，不是 skill 本体；本 raw 目录当前只保留 skill 本体。
- `live` 模式需要正在运行的开发服务器和浏览器环境，不能把它当作离线文档命令使用。
- 它的设计规则较强势；落地时仍应优先尊重项目已有设计系统、品牌色、组件约定和用户明确需求。

## 原始描述中文摘要

Impeccable 是一个面向生产级前端界面的设计与迭代 skill。它把一个总入口拆成多组命令：先建立项目产品与设计上下文，再按任务读取专门参考文件，结合自动检测脚本、浏览器实时迭代和严格反模板规则，帮助 agent 产出更具体、更稳定、更少 AI 味的前端界面。

## 原始文档章节

- Setup
- Design guidance
- General rules
- New projects only
- Absolute bans
- The AI slop test
- Commands
- Routing rules
- Pin / Unpin
- Hooks

## 主要命令

- `init`：初始化产品与设计上下文。
- `shape` / `craft`：先规划 UX/UI，再端到端构建。
- `critique` / `audit`：从 UX、可访问性、性能、响应式和反模式角度审计界面。
- `polish` / `harden`：做发布前打磨、错误状态、边界数据、i18n 和溢出处理。
- `layout` / `typeset` / `colorize` / `animate`：分别处理布局、字体、颜色和动效。
- `live`：在浏览器中选择元素并生成可比较的视觉变体。

## 相关 Skill

- [[wiki/SkillHub/skills/design-taste-frontend|高级前端设计品味]]
- [[wiki/SkillHub/skills/redesign-existing-projects|现有项目高级 UI 改造]]
- [[wiki/SkillHub/skills/high-end-visual-design|高端视觉设计与动效编排]]
