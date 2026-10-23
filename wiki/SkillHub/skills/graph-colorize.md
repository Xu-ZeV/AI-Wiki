---
title: Obsidian 图谱颜色分组
skill: graph-colorize
category: 可视化、仪表盘与导出
category_slug: visualization-export
source: raw/SkillHub/categories/visualization-export/graph-colorize/SKILL.md
tags:
  - SKILL
  - SKILL/visualization-export
---
# Obsidian 图谱颜色分组

> [!info] Skill 元信息
> 原始名称：`graph-colorize`  
> 原始标题：Graph Colorize — Color-code the Obsidian Graph View  
> 功能分类：可视化、仪表盘与导出  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/visualization-export/graph-colorize/SKILL.md)

## 用途

通过重写 .obsidian/graph.json 的 colorGroups，按标签、文件夹、分类或可见性为 Obsidian 图谱节点配色。

## 适用场景

当用户想 color graph、color by tag/category、highlight visibility 或让图谱更易区分时使用。

## 关键能力

- 读取实际 tags/categories
- 生成 graph.json colorGroups
- 合并现有 graph 设置
- 修改前自动备份

## 使用边界与注意事项

- 只应改动图谱配色相关设置，保留其他 graph 配置。
- 适合配合 tag-taxonomy 形成稳定分类配色。

## 原始描述摘要

Color-code the Obsidian graph view by rewriting `.obsidian/graph.json` colorGroups. Use this skill when the user says "color my graph", "color code obsidian", "colorize the graph", "color the graph by tag", "color by category", "highlight visibility in graph", "make the graph colorful", "distinguish tags in graph", or wants nodes in Obsidian's graph view tinted by tag, folder, or visibility. Generates a `colorGroups` array from the vault's actual tags/categories and merges it into the existing graph.json without clobbering other graph settings. Always backs up first.

## 原始文档章节

- Before You Start
- Step 1: Pick a Mode
- Step 2: Build the \`colorGroups\` Array
- Step 3: Merge into graph.json (Do Not Clobber)
- Step 4: Report and Log
- Edge Cases
- Notes

## 相关 Skill

- [[wiki/SkillHub/skills/tag-taxonomy|受控标签分类体系]]
- [[wiki/SkillHub/skills/wiki-dashboard|Wiki 动态仪表盘]]
- [[wiki/SkillHub/skills/wiki-export|知识图谱外部导出]]
