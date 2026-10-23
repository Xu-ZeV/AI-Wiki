---
title: Wiki 状态与增量审计
skill: wiki-status
category: 维护、治理与知识质量
category_slug: maintenance-governance
source: raw/SkillHub/categories/maintenance-governance/wiki-status/SKILL.md
tags:
  - SKILL
  - SKILL/maintenance-governance
---
# Wiki 状态与增量审计

> [!info] Skill 元信息
> 原始名称：`wiki-status`  
> 原始标题：Wiki Status — Audit & Delta  
> 功能分类：维护、治理与知识质量  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/maintenance-governance/wiki-status/SKILL.md)

## 用途

展示 wiki 当前状态、已导入内容、待处理来源、source 与 wiki 的差异，以及知识图谱结构洞察。

## 适用场景

当用户问状态、还有多少没处理、delta、最近变化、wiki dashboard、central pages 或结构洞察时使用。

## 关键能力

- 统计已导入与待处理来源
- 展示 source/wiki delta
- 辅助判断追加还是重建
- 分析中心页面、桥接页面和孤立邻近页面

## 使用边界与注意事项

- status 关注完整性和结构，不是知识摘要 newsletter。
- 知识摘要应使用 wiki-digest。

## 原始描述摘要

Show the current state of the wiki — what's been ingested, what's pending, and the delta between sources and wiki content. Use this skill when the user asks "what's the status", "how much is ingested", "what's left to process", "show me the delta", "what changed since last ingest", "wiki dashboard", or wants an overview of their knowledge base health and completeness. Also use before deciding whether to append or rebuild. Includes an insights mode triggered by "wiki insights", "what's central", "show me the hubs", "central pages", "what's connected", "wiki structure" — analyzes the shape of the wiki itself to surface top hubs, cross-domain bridges, and orphan-adjacent pages.

## 原始文档章节

- Before You Start
- The Manifest
- Step 1: Scan Current Sources
- Step 2: Compute the Delta
- Step 3: Report the Status
- Overview
- Delta (what's changed since last ingest)
- Summary
- Token Footprint (estimated)
- Step 3b: Compute Token Footprint
- Step 4: What to Do Next
- What to Do Next
- What to Do Next
- Insights Mode
- Anchor Pages (top 10 hubs)
- Bridge Pages (top 5)
- Tag Cluster Cohesion
- Surprising Connections (top 5)
- Orphan-Adjacent (dead-ends near hubs)
- Rough Clusters
- Graph Delta Since Last Run
- Tier Suggestions
- Questions Worth Asking
- Notes
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/daily-update|每日 Wiki 维护循环]]
- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
- [[wiki/SkillHub/skills/wiki-dashboard|Wiki 动态仪表盘]]
