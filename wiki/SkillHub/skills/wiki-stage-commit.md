---
title: Staged Wiki 写入审核提交
skill: wiki-stage-commit
category: 配置、自动化与多库管理
category_slug: setup-automation
source: raw/SkillHub/categories/setup-automation/wiki-stage-commit/SKILL.md
tags:
  - SKILL
  - SKILL/setup-automation
---
# Staged Wiki 写入审核提交

> [!info] Skill 元信息
> 原始名称：`wiki-stage-commit`  
> 原始标题：Wiki Stage Commit — Staged Write Promotion  
> 功能分类：配置、自动化与多库管理  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/setup-automation/wiki-stage-commit/SKILL.md)

## 用途

在启用 WIKI_STAGED_WRITES=true 时，审核暂存 wiki 页面并把接受的页面提升到最终位置。

## 适用场景

当用户说 review staged pages、commit staged writes、promote staged pages、approve staged changes 或查看 staging 中内容时使用。

## 关键能力

- 列出 staged 文件
- 逐个展示待提交内容
- 接受后移动到最终 wiki 路径
- 拒绝后移回 _raw 供手工处理

## 使用边界与注意事项

- 用于分阶段写入流程，适合需要人工审核的 wiki 更新。
- 应保留拒绝内容以便后续修订。

## 原始描述摘要

Review and promote staged wiki pages to their final locations. Use when WIKI_STAGED_WRITES=true and the user says "/wiki-stage-commit", "review staged pages", "commit staged writes", "promote staged pages", "approve staged changes", or "what's waiting in staging". Shows each staged file, lets the user accept or reject it, and moves accepted files to their final wiki locations. Rejected files are moved back to _raw/ for manual editing.

## 原始文档章节

- Before You Start
- Invocation Forms
- Step 1: Inventory Staged Files
- Step 2: Per-File Review (interactive mode)
- Step 3: Apply Decisions
- Step 4: Update Tracking Files
- Step 5: Report
- Notes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-update|项目知识同步到 Wiki]]
- [[wiki/SkillHub/skills/wiki-status|Wiki 状态与增量审计]]
