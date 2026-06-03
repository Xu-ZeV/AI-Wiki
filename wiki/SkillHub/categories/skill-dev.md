---
title: Skill 开发与验证
category_slug: skill-dev
tags:
  - SKILL/category
---
# Skill 开发与验证

创建、优化、评估 skill，并对实现结果做结构化质量验证。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[skill-creator]] | Skill 创建、优化与评估 | `skill-creator` | 创建新 skill、修改已有 skill、优化触发描述，并通过 evals 和 benchmark 衡量 skill 表现。 |
| [[impl-validator]] | 实现结果质量验证 | `impl-validator` | 对某个实现是否满足目标给出第二意见，返回 pass/warn/fail 结构化结论和具体可执行问题。 |

## 使用建议

- 创建或优化 skill 用 skill-creator；完成后用 impl-validator 检查目标、产物和风险是否一致。
- 修改触发描述时要关注误触发和漏触发两类问题。
