---
title: 实现结果质量验证
skill: impl-validator
category: Skill 开发与验证
category_slug: skill-dev
source: raw/SkillHub/obsidian-wiki/skills/impl-validator/SKILL.md
tags:
  - SKILL
  - SKILL/skill-dev
---
# 实现结果质量验证

> [!info] Skill 元信息
> 原始名称：`impl-validator`  
> 原始标题：Implementation Validator — Quality Subagent  
> 功能分类：Skill 开发与验证  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/impl-validator/SKILL.md)

## 用途

对某个实现是否满足目标给出第二意见，返回 pass/warn/fail 结构化结论和具体可执行问题。

## 适用场景

当用户说 validate、review output、did you do this right、check implementation，或其他 skill 需要自检时使用。

## 关键能力

- 核对实现目标和实际产物
- 识别缺陷、遗漏和风险
- 给出结构化 verdict
- 作为其他复杂 skill 的质量子代理

## 使用边界与注意事项

- 它验证实现，不替代具体业务实现。
- 适合在重要写入、导入、生成完成后做复查。

## 原始描述摘要

Validate whether an implementation matches its stated goal. Use this skill when a skill or agent wants a second opinion on its own output, when the user says "check this implementation", "validate what you did", "is this correct?", "review the output", or "did you do this right?". Also spawned automatically as a subagent by other skills (memory-bridge, daily-update) to self-check their outputs before presenting to the user. Returns a structured pass/warn/fail verdict with specific actionable issues.

## 原始文档章节

- Input Format (Subagent Mode)
- Input Format (User Mode)
- Validation Protocol
- impl-validator Report
- What NOT to check
- Severity Guide

## 相关 Skill

- [[wiki/SkillHub/skills/skill-creator|Skill 创建、优化与评估]]
- [[wiki/SkillHub/skills/daily-update|每日 Wiki 维护循环]]
- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
