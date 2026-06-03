---
title: Obsidian Wiki 初始化
skill: wiki-setup
category: 配置、自动化与多库管理
category_slug: setup-automation
source: raw/SkillHub/obsidian-wiki/skills/wiki-setup/SKILL.md
tags:
  - SKILL
  - SKILL/setup-automation
---
# Obsidian Wiki 初始化

> [!info] Skill 元信息
> 原始名称：`wiki-setup`  
> 原始标题：Obsidian Setup — Vault Initialization  
> 功能分类：配置、自动化与多库管理  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/wiki-setup/SKILL.md)

## 用途

初始化新的 Obsidian wiki vault，创建目录结构、特殊文件和配置文件，也可修复破损配置。

## 适用场景

当用户要 setup wiki、initialize obsidian、create new vault、get started 或重新配置现有 vault 时使用。

## 关键能力

- 创建标准 vault 结构
- 生成必要配置和 .env
- 初始化特殊索引/目录文件
- 辅助修复已有 wiki 配置

## 使用边界与注意事项

- 这是启动和配置入口，不负责导入具体来源。
- 初始化后通常接 wiki-ingest 或 wiki-update。

## 原始描述摘要

Initialize a new Obsidian wiki vault with the correct structure, special files, and configuration. Use this skill when the user wants to set up a new wiki from scratch, initialize the vault structure, create the .env file, or says things like "set up my wiki", "initialize obsidian", "create a new vault", "get started with the wiki". Also use when the user needs to reconfigure their existing vault or fix a broken setup.

## 原始文档章节

- Step 1: Create .env
- Step 2: Create Vault Directory Structure
- Step 3: Create Special Files
- Concepts
- Entities
- Skills
- References
- Synthesis
- Journal
- Recent Activity
- Active Threads
- Key Takeaways
- Flagged Contradictions
- Step 4: Create .obsidian Configuration
- Step 5: Recommend Obsidian Plugins
- Step 6: Verify Setup
- Optional: Refresh QMD After Setup

## 相关 Skill

- [[wiki/SkillHub/skills/llm-wiki|LLM Wiki 知识蒸馏架构]]
- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-switch|多 Wiki 配置切换]]
