---
title: Wiki 健康检查与修复
skill: wiki-lint
category: 维护、治理与知识质量
category_slug: maintenance-governance
source: raw/SkillHub/categories/maintenance-governance/wiki-lint/SKILL.md
tags:
  - SKILL
  - SKILL/maintenance-governance
---
# Wiki 健康检查与修复

> [!info] Skill 元信息
> 原始名称：`wiki-lint`  
> 原始标题：Wiki Lint — Health Audit  
> 功能分类：维护、治理与知识质量  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/maintenance-governance/wiki-lint/SKILL.md)

## 用途

审计 Obsidian wiki 健康度，发现孤立页、断链、矛盾、陈旧内容、标签问题和结构异常。

## 适用场景

当用户要求 clean up、health check、audit notes、find orphan pages、fix broken wikilinks 或 wiki 有问题时使用。

## 关键能力

- 检查孤立页、断链和陈旧内容
- 识别矛盾和生命周期状态问题
- 可在 consolidate 模式下执行修复
- 生成报告或 dry-run 预览

## 使用边界与注意事项

- 默认偏审计；写入修复需要明确模式和确认。
- 和 cross-linker 区别：lint 覆盖健康问题，cross-linker 专注补链。

## 原始描述摘要

Audit and maintain the health of the Obsidian wiki. Use this skill when the user wants to check their wiki for issues, find orphaned pages, detect contradictions, identify stale content, fix broken wikilinks, or perform general maintenance on their knowledge base. Also triggers on "clean up the wiki", "what needs fixing", "audit my notes", or "wiki health check". Add --consolidate to switch from report-only to act-and-report mode (the "dream cycle"): fixes broken links, adds missing cross-references for orphans, corrects lifecycle states, demotes stale peripheral pages, normalizes tag aliases, and adds contradiction callouts — all with a dry-run preview and explicit user confirmation before any writes.

## 原始文档章节

- Before You Start
- Lint Checks
- Output Format
- Wiki Health Report
- After Linting
- Consolidate Mode (\`--consolidate\`)
- Summary
- Broken Link Fixes
- Cross-References Added (orphan rescue)
- Lifecycle Updates
- Tier Demotions
- Tag Normalizations
- Contradiction Callouts
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/cross-linker|自动交叉链接补全]]
- [[wiki/SkillHub/skills/tag-taxonomy|受控标签分类体系]]
- [[wiki/SkillHub/skills/wiki-dedup|Wiki 页面级去重与身份解析]]
