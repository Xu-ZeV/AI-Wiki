---
title: LLM Wiki 知识蒸馏架构
skill: llm-wiki
category: 知识检索与上下文复用
category_slug: retrieval-context
source: raw/SkillHub/categories/retrieval-context/llm-wiki/SKILL.md
tags:
  - SKILL
  - SKILL/retrieval-context
---
# LLM Wiki 知识蒸馏架构

> [!info] Skill 元信息
> 原始名称：`llm-wiki`  
> 原始标题：LLM Wiki — Knowledge Distillation Pattern  
> 功能分类：知识检索与上下文复用  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/retrieval-context/llm-wiki/SKILL.md)

## 用途

解释和指导基于 LLM 的 Obsidian wiki 知识蒸馏模式，包括 raw sources、wiki、schema 三层架构。

## 适用场景

当用户要理解 wiki 方法论、搭建新知识库、讨论知识管理策略或决定 wiki 结构时使用。

## 关键能力

- 说明知识蒸馏架构
- 指导 raw 到 wiki 的转化原则
- 帮助做知识库结构决策
- 为其他 ingest/query/lint skill 提供理论框架

## 使用边界与注意事项

- 这是理论和架构 skill，不直接执行导入或查询。
- AI-Wiki 项目日志采用 `log/YYYY/MM/DD/*.md` 的年月日三层目录、一操作一文件约定，不使用根级 `log.md`。
- 需要实际操作时转向具体 operation skill。

## 原始描述摘要

The foundational knowledge distillation pattern for building and maintaining an AI-powered Obsidian wiki. Based on Andrej Karpathy's LLM Wiki architecture. Use this skill whenever the user wants to understand the wiki pattern, set up a new knowledge base, or needs guidance on the three-layer architecture (raw sources → wiki → schema). Also use when discussing knowledge management strategy, wiki structure decisions, or how to organize distilled knowledge. This is the "theory" skill — other skills handle specific operations (ingesting, querying, linting).

## 原始文档章节

- Three-Layer Architecture
- Wiki Organization
- Key Concepts
- Related
- Special Files
- Concepts
- Entities
- Log
- Page Template
- Key Ideas
- Open Questions
- Sources
- Provenance Markers
- Typed Relationships
- Confidence and Lifecycle
- Importance Tiering
- Retrieval Primitives
- QMD Index Freshness
- Core Principles
- Link Format
- Config Resolution Protocol
- Environment Variables
- Modes of Operation
- Reference

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-setup|Obsidian Wiki 初始化]]
- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-query|Wiki 知识检索问答]]
