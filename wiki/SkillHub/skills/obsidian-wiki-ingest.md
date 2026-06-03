---
title: obsidian-wiki 项目自动导入
skill: obsidian-wiki-ingest
category: 内容采集与导入
category_slug: content-ingest
source: raw/SkillHub/obsidian-wiki/skills/obsidian-wiki-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/content-ingest
---
# obsidian-wiki 项目自动导入

> [!info] Skill 元信息
> 原始名称：`obsidian-wiki-ingest`  
> 原始标题：Obsidian Wiki Ingest — Automation Skill  
> 功能分类：内容采集与导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/obsidian-wiki-ingest/SKILL.md)

## 用途

在 obsidian-wiki 项目上下文中自动运行 wiki-ingest 管线，处理文档导入、去重、frontmatter 和交叉链接。

## 适用场景

当用户在 obsidian-wiki 项目内要求导入文档或触发自动化 ingest 流程时使用。

## 关键能力

- 调用 wiki-ingest 管线
- 通过 manifest 避免重复导入
- 维护 frontmatter 和 cross-links
- 适配 obsidian-wiki 项目内的约定

## 使用边界与注意事项

- 这是项目专用自动化入口，不是通用网页或任意文本 ingest 的首选。
- 导入结果应结合状态和健康检查确认。

## 原始描述摘要

Automates ingestion of documents into the Obsidian wiki (obsidian-wiki) using the wiki-ingest pipeline. Handles deduplication via manifest, frontmatter, and cross-links; triggers on user request within the obsidian-wiki project context.

## 原始文档章节

- Trigger
- Responsibilities
- Inputs
- Outputs
- Probing and Safety
- Example Workflow (high level)
- Next Steps
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-status|Wiki 状态与增量审计]]
- [[wiki/SkillHub/skills/cross-linker|自动交叉链接补全]]
