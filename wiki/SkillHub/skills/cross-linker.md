---
title: 自动交叉链接补全
skill: cross-linker
category: 维护、治理与知识质量
category_slug: maintenance-governance
source: raw/SkillHub/categories/maintenance-governance/cross-linker/SKILL.md
tags:
  - SKILL
  - SKILL/maintenance-governance
---
# 自动交叉链接补全

> [!info] Skill 元信息
> 原始名称：`cross-linker`  
> 原始标题：Cross-Linker — Automated Wiki Cross-Referencing  
> 功能分类：维护、治理与知识质量  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/maintenance-governance/cross-linker/SKILL.md)

## 用途

扫描 wiki 页面，发现缺失的交叉引用，并实际修改页面添加 wikilinks，让知识图谱更连通。

## 适用场景

当用户说 link my pages、find missing links、connect my wiki、add wikilinks，或大批量导入后需要织入知识图谱时使用。

## 关键能力

- 发现页面间潜在引用
- 补充缺失 wikilinks
- 改善孤立页连接
- 增强知识图谱连通性

## 使用边界与注意事项

- 这是写入型 skill，会修改页面。
- 如果只想报告健康问题，应使用 wiki-lint。

## 原始描述摘要

Scan the Obsidian wiki and automatically discover missing cross-references between pages. Use this skill when the user says "link my pages", "find missing links", "cross-reference", "connect my wiki", "add wikilinks", "what pages should be linked", or after any large ingestion to ensure new pages are woven into the existing knowledge graph. Also trigger when the user mentions "orphan pages" in the context of wanting to connect them, or says things like "my wiki feels disconnected" or "pages aren't linked well". This is a write-heavy skill — it actually modifies pages to add links, unlike wiki-lint which just reports issues.

## 原始文档章节

- Before You Start
- Step 1: Build the Page Registry
- Step 2: Scan for Missing Links
- Step 3: Score and Rank Suggestions
- Step 4: Apply Links
- Related
- Step 5: Score Misc Page Affinity
- Step 6: Report
- Cross-Link Report
- Step 7: Update Log and Hot Cache
- Tips
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
- [[wiki/SkillHub/skills/wiki-synthesize|跨主题合成页发现]]
