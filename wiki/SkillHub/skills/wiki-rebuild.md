---
title: Wiki 归档、重建与恢复
skill: wiki-rebuild
category: 维护、治理与知识质量
category_slug: maintenance-governance
source: raw/SkillHub/categories/maintenance-governance/wiki-rebuild/SKILL.md
tags:
  - SKILL
  - SKILL/maintenance-governance
---
# Wiki 归档、重建与恢复

> [!info] Skill 元信息
> 原始名称：`wiki-rebuild`  
> 原始标题：Wiki Rebuild — Archive, Rebuild, Restore  
> 功能分类：维护、治理与知识质量  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/maintenance-governance/wiki-rebuild/SKILL.md)

## 用途

归档现有 wiki 知识并从源材料重新构建，或从旧归档中恢复版本。

## 适用场景

当用户要 rebuild、start over、archive and rebuild、restore from archive、clean rebuild，或增量修复已经不可靠时使用。

## 关键能力

- 归档当前 wiki
- 从源材料重新构建知识库
- 从历史归档恢复
- 处理知识库严重漂移后的重置流程

## 使用边界与注意事项

- 这是高影响操作，执行前应确认范围和备份。
- 常在 wiki 与 source 偏离过大时使用。

## 原始描述摘要

Archive existing wiki knowledge and rebuild from scratch, or restore from a previous archive. Use this skill when the user wants to start fresh, rebuild the wiki from all sources, archive current knowledge before a major change, or restore an older version. Triggers on "rebuild the wiki", "start over", "archive and rebuild", "restore from archive", "nuke and repave", "clean rebuild". Also use when the wiki has drifted too far from sources and incremental fixes won't cut it.

## 原始文档章节

- Before You Start
- The Archive System
- Mode 1: Archive Only
- Mode 2: Archive + Rebuild
- Mode 3: Restore from Archive
- Available Archives
- QMD Refresh After Live Wiki Changes
- Safety Rules

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-status|Wiki 状态与增量审计]]
- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-setup|Obsidian Wiki 初始化]]
