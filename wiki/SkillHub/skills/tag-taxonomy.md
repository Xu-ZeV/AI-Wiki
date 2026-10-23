---
title: 受控标签分类体系
skill: tag-taxonomy
category: 维护、治理与知识质量
category_slug: maintenance-governance
source: raw/SkillHub/categories/maintenance-governance/tag-taxonomy/SKILL.md
tags:
  - SKILL
  - SKILL/maintenance-governance
---
# 受控标签分类体系

> [!info] Skill 元信息
> 原始名称：`tag-taxonomy`  
> 原始标题：Tag Taxonomy — Controlled Vocabulary for Wiki Tags  
> 功能分类：维护、治理与知识质量  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/maintenance-governance/tag-taxonomy/SKILL.md)

## 用途

用受控词表维护 Obsidian wiki 标签一致性，规范标签命名、别名、层级和使用场景。

## 适用场景

当用户要求 fix tags、normalize tags、tag audit、tag taxonomy，或创建/更新 wiki 页面需要选择标签时使用。

## 关键能力

- 检查并规范标签
- 维护标签词表
- 为新页面选择合适标签
- 处理标签别名和混乱分类

## 使用边界与注意事项

- 给 wiki 页面分配标签前应查阅该 skill 的 taxonomy 文件。
- 适合和 wiki-lint 的标签检查配合使用。

## 原始描述摘要

Enforce consistent tagging across the Obsidian wiki using a controlled vocabulary. Use this skill when the user says "fix my tags", "normalize tags", "clean up tags", "tag audit", "what tags should I use", "tag taxonomy", or whenever you're creating or updating wiki pages and need to choose the right tags. Also trigger when the user asks about tag conventions, wants to add a new tag to the taxonomy, or says "my tags are a mess". Always consult this skill's taxonomy file before assigning tags to any wiki page.

## 原始文档章节

- Before You Start
- The Taxonomy File
- Reserved System Tags
- Mode 1: Tag Audit
- Tag Audit Report
- Mode 2: Tag Normalization
- Mode 3: Tagging a New Page
- Mode 4: Adding a New Tag
- After Any Tag Operation
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-dashboard|Wiki 动态仪表盘]]
