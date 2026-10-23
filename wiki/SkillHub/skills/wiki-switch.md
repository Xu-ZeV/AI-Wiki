---
title: 多 Wiki 配置切换
skill: wiki-switch
category: 配置、自动化与多库管理
category_slug: setup-automation
source: raw/SkillHub/categories/setup-automation/wiki-switch/SKILL.md
tags:
  - SKILL
  - SKILL/setup-automation
---
# 多 Wiki 配置切换

> [!info] Skill 元信息
> 原始名称：`wiki-switch`  
> 原始标题：Wiki Switch — Manage Multiple Vault Profiles  
> 功能分类：配置、自动化与多库管理  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/setup-automation/wiki-switch/SKILL.md)

## 用途

管理多个 Obsidian wiki vault profile，通过命名配置切换当前 active wiki。

## 适用场景

当用户说 switch vault、list my wikis、which wiki am I on、add new wiki profile 或切换到工作/个人 wiki 时使用。

## 关键能力

- 列出和创建命名 vault 配置
- 切换当前 active wiki
- 管理 ~/.obsidian-wiki/config.NAME
- 通过 symlink 激活目标配置

## 使用边界与注意事项

- 适合多 vault 工作流。
- 切换后应确认当前配置指向的 vault 路径。

## 原始描述摘要

Switch between multiple Obsidian wiki vault profiles. Use this skill when the user says "/wiki-switch NAME", "switch to my work wiki", "switch vault", "change wiki", "which wiki am I on", "list my wikis", "show my vaults", "create a new vault config", or "add a new wiki profile". The skill manages named config files at ~/.obsidian-wiki/config.NAME and activates one by symlinking it to ~/.obsidian-wiki/config.

## 原始文档章节

- Dispatch
- Switch (default action)
- List
- Show
- New

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-setup|Obsidian Wiki 初始化]]
- [[wiki/SkillHub/skills/wiki-status|Wiki 状态与增量审计]]
- [[wiki/SkillHub/skills/wiki-update|项目知识同步到 Wiki]]
