---
title: 完整输出强制规则
skill: full-output-enforcement
category: 设计交付、系统化与输出约束
category_slug: design-delivery-governance
source: raw/SkillHub/categories/design-delivery-governance/output-skill/SKILL.md
tags:
  - SKILL
  - SKILL/design-delivery-governance
---
# 完整输出强制规则

> [!info] Skill 元信息
> 原始名称：`full-output-enforcement`  
> 原始标题：Full-Output Enforcement  
> 功能分类：设计交付、系统化与输出约束  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/design-delivery-governance/output-skill/SKILL.md)

## 中文含义与用途

中文含义：强制 agent 完整输出，不用占位符偷懒。  
核心用处：在需要完整代码、完整文件、完整组件、完整章节或完整清单时，禁止用 `TODO`、省略号、占位注释或“其余类似”替代实际内容。

## 适用场景

适合用户明确要求完整实现、完整文件、批量组件、长表格、完整配置、完整迁移步骤或模型此前出现过截断和省略的任务。

## 关键能力

- 先计算任务要求的交付物数量
- 禁止代码块和说明文字中的省略、占位和跳过模式
- 输出前核对交付物是否齐全
- 长输出接近限制时在干净断点暂停，而不是压缩剩余内容
- 让设计或代码生成任务更适合直接落地

## 使用边界与注意事项

- 它只约束输出完整性，不保证业务设计本身正确。
- 在交互式编码环境中，完整输出仍应服从项目文件编辑和测试流程。
- 如果任务要求简短回答，不需要主动使用它。

## 原始描述中文摘要

覆盖默认 LLM 截断和省略行为的 skill，强制完整代码生成，禁止占位模式，并在 token 限制附近按清晰断点拆分。

## 原始文档章节

- Baseline
- Banned Output Patterns
- Execution Process
- Handling Long Outputs
- Quick Check

## 相关 Skill

- [[wiki/SkillHub/skills/stitch-design-taste|Stitch 高级设计系统规则]]
- [[wiki/SkillHub/skills/image-to-code|图片优先的网站设计到代码]]
- [[wiki/SkillHub/skills/design-taste-frontend|高级前端设计品味]]
