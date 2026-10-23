---
title: JSON Canvas 画布文件
skill: json-canvas
category: Obsidian 基础能力与文件格式
category_slug: obsidian-basic
source: raw/SkillHub/categories/obsidian-basic/json-canvas/SKILL.md
tags:
  - SKILL
  - SKILL/obsidian-basic
---
# JSON Canvas 画布文件

> [!info] Skill 元信息
> 原始名称：`json-canvas`  
> 原始标题：JSON Canvas Skill  
> 功能分类：Obsidian 基础能力与文件格式  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/obsidian-basic/json-canvas/SKILL.md)

## 用途

创建和编辑 Obsidian JSON Canvas .canvas 文件，管理节点、边、分组、布局、颜色和连接关系。

## 适用场景

当任务涉及 Obsidian Canvas、.canvas 文件、思维导图、流程图、研究画布或可视化节点连接时使用。

## 关键能力

- 创建 text、file、link、group 节点
- 生成唯一 16 位十六进制 ID
- 添加和验证 edges 的 fromNode/toNode 引用
- 控制节点坐标、尺寸、层级、颜色和间距

## 使用边界与注意事项

- 写入后必须验证 JSON 可解析、ID 唯一、边引用存在。
- JSON 字符串中的换行应使用 
，而不是字面量 \n。

## 原始描述摘要

Create and edit JSON Canvas files (.canvas) with nodes, edges, groups, and connections. Use when working with .canvas files, creating visual canvases, mind maps, flowcharts, or when the user mentions Canvas files in Obsidian.

## 原始文档章节

- File Structure
- Common Workflows
- Nodes
- Edges
- Colors
- ID Generation
- Layout Guidelines
- Validation Checklist
- Complete Examples
- References

## 相关 Skill

- [[wiki/SkillHub/skills/obsidian-markdown|Obsidian Markdown 笔记语法]]
- [[wiki/SkillHub/skills/wiki-export|知识图谱外部导出]]
- [[wiki/SkillHub/skills/graph-colorize|Obsidian 图谱颜色分组]]
