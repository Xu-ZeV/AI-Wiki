---
title: Obsidian CLI 操作与插件调试
skill: obsidian-cli
category: Obsidian 基础能力与文件格式
category_slug: obsidian-basic
source: raw/SkillHub/obsidian-skills/skills/obsidian-cli/SKILL.md
tags:
  - SKILL
  - SKILL/obsidian-basic
---
# Obsidian CLI 操作与插件调试

> [!info] Skill 元信息
> 原始名称：`obsidian-cli`  
> 原始标题：Obsidian CLI  
> 功能分类：Obsidian 基础能力与文件格式  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-skills/skills/obsidian-cli/SKILL.md)

## 用途

通过 obsidian CLI 与正在运行的 Obsidian vault 交互，读取、创建、搜索、追加、管理属性和任务，也支持插件或主题开发调试。

## 适用场景

当需要从命令行操作 vault、检索笔记、修改属性、管理日记任务，或调试 Obsidian 插件和主题时使用。

## 关键能力

- 读取、创建、追加和搜索笔记
- 设置属性、查询任务、标签和反向链接
- 指定 vault、file 或 path 定位目标文件
- 重载插件、查看错误、执行 JS、截屏并检查 DOM/CSS

## 使用边界与注意事项

- Obsidian 必须处于打开状态。
- 参数用 key=value，布尔开关不带值。

## 原始描述摘要

Interact with Obsidian vaults using the Obsidian CLI to read, create, search, and manage notes, tasks, properties, and more. Also supports plugin and theme development with commands to reload plugins, run JavaScript, capture errors, take screenshots, and inspect the DOM. Use when the user asks to interact with their Obsidian vault, manage notes, search vault content, perform vault operations from the command line, or develop and debug Obsidian plugins and themes.

## 原始文档章节

- Command reference
- Syntax
- File targeting
- Vault targeting
- Common patterns
- Plugin development

## 相关 Skill

- [[wiki/SkillHub/skills/obsidian-markdown|Obsidian Markdown 笔记语法]]
- [[wiki/SkillHub/skills/wiki-setup|Obsidian Wiki 初始化]]
- [[wiki/SkillHub/skills/graph-colorize|Obsidian 图谱颜色分组]]
