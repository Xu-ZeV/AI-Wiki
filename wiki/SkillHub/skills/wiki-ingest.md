---
title: 文档知识蒸馏入库
skill: wiki-ingest
category: 内容采集与导入
category_slug: content-ingest
source: raw/SkillHub/categories/content-ingest/wiki-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/content-ingest
---
# 文档知识蒸馏入库

> [!info] Skill 元信息
> 原始名称：`wiki-ingest`  
> 原始标题：Obsidian Ingest — Document Distillation  
> 功能分类：内容采集与导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/content-ingest/wiki-ingest/SKILL.md)

## 用途

把文档、目录、文章、论文、笔记或 raw staging 内容蒸馏成互联的 Obsidian wiki 页面。

## 适用场景

当用户要把文件、文件夹、文章、论文、草稿或 _raw 内容加入知识库时使用。

## 关键能力

- 读取源文档并提取稳定知识
- 拆分成概念、实体、项目等 wiki 页面
- 生成链接和 frontmatter
- 支持 raw/staging 内容提升为正式 wiki 页面

## 使用边界与注意事项

- 目标不是保存原文，而是生成可复用的声明式知识。
- 产生项目文件修改时，应在根目录 `log/` 下按年月日三层目录新增一条 `log/YYYY/MM/DD/*.md` 项目日志，而不是追加根级 `log.md`。
- 大批量导入后通常需要 cross-linker、wiki-lint 或 wiki-synthesize。

## 原始描述摘要

Ingest documents into the Obsidian wiki by distilling their knowledge into interconnected wiki pages. Use this skill whenever the user wants to add new sources to their wiki, process a document or directory, import articles, papers, or notes into their knowledge base, or says things like "add this to the wiki", "process these docs", "ingest this folder". Also triggers when the user drops a file and wants it incorporated into their existing knowledge base. Also handles raw mode: "process my drafts", "promote my raw pages", or any reference to the _raw/ staging directory.

## 原始文档章节

- Before You Start
- Content Trust Boundary
- Ingest Modes
- The Ingest Process
- Recent Activity
- Active Threads
- Key Takeaways
- Flagged Contradictions
- Handling Multiple Sources
- Quality Checklist
- Reference

## 相关 Skill

- [[wiki/SkillHub/skills/data-ingest|通用文本数据导入]]
- [[wiki/SkillHub/skills/cross-linker|自动交叉链接补全]]
- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
