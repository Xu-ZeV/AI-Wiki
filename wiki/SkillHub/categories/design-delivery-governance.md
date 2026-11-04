---
title: 设计交付、系统化与输出约束
category_slug: design-delivery-governance
tags:
  - SKILL/category
---
# 设计交付、系统化与输出约束

面向设计系统交付、Stitch 语义规则生成、需求方案压力盘问和完整输出约束的辅助 skill，解决生成结果不成体系、隐性假设过多、代码省略或交付格式不稳定的问题。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[grill-me]] | 方案与需求压力盘问 | `grill-me` | 在实施前对需求与技术方案进行苏格拉底式单步压力盘问，收敛决策树并消除隐性假设。 |
| [[stitch-design-taste]] | Stitch 高级设计系统规则 | `stitch-design-taste` | 为 Google Stitch 生成 agent 友好的 DESIGN.md，沉淀字体、颜色、布局、组件、动效和反模板规则。 |
| [[full-output-enforcement]] | 完整输出强制规则 | `full-output-enforcement` | 禁止用省略号、TODO、占位注释替代完整交付，适合要求完整代码、完整文件或完整清单的任务。 |

## 使用建议

- 需求模糊、存在大量技术分叉或用户要求严格压力测试方案时用 grill-me 进行单步盘问与基线收敛。
- 需要把视觉规范交给 Google Stitch 或类似屏幕生成工具时用 stitch-design-taste。
- 当模型容易跳过中间代码、只给骨架或用占位注释时，叠加 full-output-enforcement。
- 这类 skill 更适合作为交付质量约束，与设计或实现 skill 配合使用。
