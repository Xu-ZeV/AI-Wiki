---
title: Stitch 高级设计系统规则
skill: stitch-design-taste
category: 设计交付、系统化与输出约束
category_slug: design-delivery-governance
source: raw/SkillHub/taste-skills/skills/stitch-skill/SKILL.md
tags:
  - SKILL
  - SKILL/design-delivery-governance
---
# Stitch 高级设计系统规则

> [!info] Skill 元信息
> 原始名称：`stitch-design-taste`  
> 原始标题：Stitch Design Taste - Semantic Design System Skill  
> 功能分类：设计交付、系统化与输出约束  
> 原始文件：[SKILL.md](../../../raw/SkillHub/taste-skills/skills/stitch-skill/SKILL.md)

## 中文含义与用途

中文含义：为 Google Stitch 生成高级语义设计系统。  
核心用处：产出 agent 友好的 DESIGN.md，把视觉氛围、颜色、字体、组件、布局、响应式和动效规则写成 Stitch 能理解的自然语言设计规范。

## 适用场景

适合使用 Google Stitch 生成页面或屏幕前，先建立统一设计语言；也适合把 Taste Skill 的反模板化设计标准整理成可复用规范。

## 关键能力

- 分析项目意图并定义视觉氛围、密度、变化度和动效强度
- 为颜色、字体、hero、组件、布局和响应式规则写出语义描述
- 输出结构化 DESIGN.md，作为 Stitch 生成屏幕的单一设计来源
- 明确列出 AI 常见视觉模板和禁止项
- 支持和 Stitch MCP、Cursor、Antigravity、Gemini CLI 等流程衔接

## 使用边界与注意事项

- 它主要生成设计系统文档，不直接实现前端代码。
- 需要访问 Google Stitch 或兼容的设计生成流程才能发挥完整价值。
- 原目录还包含 DESIGN.md，可作为该 skill 输出格式的参考。

## 原始描述中文摘要

Google Stitch 兼容的语义设计系统 skill，用于生成高级、反模板化的 DESIGN.md，约束字体、颜色、非对称布局、微动效和性能规则。

## 原始文档章节

- Overview
- Prerequisites
- The Goal
- Analysis & Synthesis Instructions
- Define the Atmosphere
- Map the Color Palette
- Establish Typography Rules
- Define the Hero Section
- Describe Component Stylings
- Define Layout Principles
- Define Responsive Rules
- Encode Motion Philosophy
- List Anti-Patterns
- Output Format

## 相关 Skill

- [[wiki/SkillHub/skills/full-output-enforcement|完整输出强制规则]]
- [[wiki/SkillHub/skills/design-taste-frontend|高级前端设计品味]]
- [[wiki/SkillHub/skills/imagegen-frontend-web|网站分区视觉参考图生成]]
