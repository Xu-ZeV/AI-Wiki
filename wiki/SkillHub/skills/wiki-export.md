---
title: 知识图谱外部导出
skill: wiki-export
category: 可视化、仪表盘与导出
category_slug: visualization-export
source: raw/SkillHub/categories/visualization-export/wiki-export/SKILL.md
tags:
  - SKILL
  - SKILL/visualization-export
---
# 知识图谱外部导出

> [!info] Skill 元信息
> 原始名称：`wiki-export`  
> 原始标题：Wiki Export — Knowledge Graph Export  
> 功能分类：可视化、仪表盘与导出  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/visualization-export/wiki-export/SKILL.md)

## 用途

把 Obsidian wiki 的知识图谱导出成 JSON、GraphML、Neo4j Cypher 和交互式 HTML 等外部工具可用格式。

## 适用场景

当用户说 export wiki/graph、export to JSON/Gephi/Neo4j、graphml、visualize wiki 或 knowledge graph export 时使用。

## 关键能力

- 生成 graph.json
- 生成 graph.graphml
- 生成 Neo4j cypher.txt
- 生成交互式 graph.html

## 使用边界与注意事项

- 输出目录通常位于 vault 根目录的 wiki-export/。
- 导出前可先运行 wiki-lint 和 cross-linker 提升图谱质量。

## 原始描述摘要

Export the Obsidian wiki's knowledge graph to structured formats for use in external tools. Use this skill when the user says "export wiki", "export graph", "export to JSON", "export to Gephi", "export to Neo4j", "graphml", "visualize wiki", "knowledge graph export", or wants to use their wiki data in another tool. Outputs graph.json, graph.graphml, cypher.txt (Neo4j), and graph.html (interactive browser visualization) into a wiki-export/ directory at the vault root.

## 原始文档章节

- Before You Start
- Visibility Filter (optional)
- Step 1: Build the Node and Edge Lists
- Step 2: Assign Community IDs
- Step 3: Write the Output Files
- Step 4: Print Summary
- Notes

## 相关 Skill

- [[wiki/SkillHub/skills/graph-colorize|Obsidian 图谱颜色分组]]
- [[wiki/SkillHub/skills/wiki-dashboard|Wiki 动态仪表盘]]
- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
