---
title: Wiki 页面级去重与身份解析
skill: wiki-dedup
category: 维护、治理与知识质量
category_slug: maintenance-governance
source: raw/SkillHub/categories/maintenance-governance/wiki-dedup/SKILL.md
tags:
  - SKILL
  - SKILL/maintenance-governance
---
# Wiki 页面级去重与身份解析

> [!info] Skill 元信息
> 原始名称：`wiki-dedup`  
> 原始标题：Wiki Dedup — Identity Resolution and Page-Level Deduplication  
> 功能分类：维护、治理与知识质量  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/maintenance-governance/wiki-dedup/SKILL.md)

## 用途

扫描并合并描述同一概念的重复页面，例如缩写页和全称页之间的身份冲突。

## 适用场景

当用户说 dedup、merge duplicates、identity resolution、consolidate wiki 或发现同一事物有多页时使用。

## 关键能力

- 识别页面级身份碰撞
- 判断概念别名与重复内容
- 提出或执行合并方案
- 维护链接和页面归属一致性

## 使用边界与注意事项

- 这是可能破坏性较高的合并操作，执行前应谨慎确认。
- 不同于 wiki-lint 的结构审计，也不同于 cross-linker 的补链。

## 原始描述摘要

Scan the Obsidian wiki for page-level identity collisions — different pages covering the same concept under different names (e.g. "RSC" vs "React Server Components") — and merge them. Use this skill when the user says "dedup my wiki", "find duplicate pages", "merge duplicates", "identity resolution", "consolidate my wiki", "I have duplicate pages", or "my wiki has two pages for the same thing". Distinct from wiki-lint (which checks structure) and cross-linker (which adds links) — this skill makes destructive page-level merges and requires careful confirmation.

## 原始文档章节

- Before You Start
- Modes
- Step 1: Build the Page Registry
- Step 2: Detect Candidate Pairs
- Step 3: Semantic Verdict
- Step 4: Audit Report
- Wiki Dedup Report
- Step 5: Merge
- Step 6: Log
- Redirect Stub Handling
- Tips
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
- [[wiki/SkillHub/skills/cross-linker|自动交叉链接补全]]
- [[wiki/SkillHub/skills/tag-taxonomy|受控标签分类体系]]
