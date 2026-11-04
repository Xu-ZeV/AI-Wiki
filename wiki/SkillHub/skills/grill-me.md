---
title: 方案与需求压力盘问
skill: grill-me
category: 设计交付、系统化与输出约束
category_slug: design-delivery-governance
source: raw/SkillHub/categories/design-delivery-governance/grill-me/SKILL.md
tags:
  - SKILL
  - SKILL/design-delivery-governance
---
# 方案与需求压力盘问

> [!info] Skill 元信息
> 原始名称：`grill-me`  
> 原始标题：Grill Me - Plan & Requirement Socratic Interrogation  
> 功能分类：设计交付、系统化与输出约束  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/design-delivery-governance/grill-me/SKILL.md)  
> 上游溯源：[RobMitt/grill-me-skill](https://github.com/RobMitt/grill-me-skill)

## 中文含义与用途

中文含义：在动手写代码前对用户的技术方案与需求做连珠炮式的多轮压力盘问（苏格拉底式提问），收敛决策树。  
核心用处：当需求模糊、架构选型未定、边界假设未澄清时，强制 agent 扮演严苛的首席架构师，逐一排除不确定性，消除隐性假设，输出自包含的设计基线后再进入实施。

## 适用场景

- 用户提出了模糊需求或初步设想，明确要求“grill me”、“审问我的方案”、“做压力测试”。
- 涉及复杂架构、多状态管理、关键业务边界的高风险任务，避免 agent 凭空猜测或草率编码。
- 希望在编写实施计划前，通过一问一答快速完成架构选型权衡。

## 关键能力

- **代码探索先行**：提问前必须先利用只读工具通读代码库；严禁向用户提问本地代码已有确定答案的问题。
- **单步推进与反多题轰炸**：每次仅提出 1 个聚焦问题，附带 2~4 个具象互斥选项及利弊说明，避免认知过载。
- **Codex 深度适配**：在 Plan Mode 下优先调用原生 `request_user_input` 交互卡片；在 Default Mode 下降级为规范 Markdown 单选题。
- **5 步决策树收敛**：目标边界 → 架构选型 → 异常边缘 → 交付验证 → 基线汇总。
- **快速退出与容错**：支持用户选择默认推荐方案跳出盘问，快速收敛转交实施。

## 使用边界与注意事项

- 本 Skill 适用于**人机交互澄清**（Agent 盘问人类）；若需要**多代理对抗审查代码与计划**，应配合使用 `agent-team-plan-gate` 或 `agent-team-orchestration`。
- 如果代码库现状已能完全推导所有实现细节，不得无端盘问打扰用户。
- 如果用户要求简短快速修复单文件，不要主动触发深入盘问流程。

## 原始描述中文摘要

针对计划或设计对用户进行无情但克制的连续盘问，每次一步，顺着决策树分支化解依赖与歧义，直至双方达成完全一致的共享认知与实施基线。

## 原始文档章节

- Core Philosophy & When to Use
- Exploration First
- How to Ask Questions
- 5-Stage Decision Tree
- Exit Hatch
- Anti-Patterns

## 相关 Skill

- [[full-output-enforcement]]
- [[stitch-design-taste]]
- [[agent-team-plan-gate]]
- [[agent-team-brainstorm]]
