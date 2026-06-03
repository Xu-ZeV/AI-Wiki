---
title: LLM Wiki
category: concepts
tags:
  - 知识管理
  - LLM
  - wiki
aliases:
  - LLM 知识库
  - 卡帕西 Wiki
sources:
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
summary: LLM Wiki 是把原始资料一次性蒸馏成互联 Markdown 页面，并由 LLM 持续维护的知识库模式。
created: 2026-05-26T08:31:00+08:00
updated: 2026-05-26T08:31:00+08:00
---

# LLM Wiki

LLM Wiki 是 Andrej Karpathy 提出的知识库组织模式：不要每次问答时都临时检索原始文档片段，而是让 LLM 读取原始资料后，把知识编译成结构化、可链接、可维护的 Markdown wiki。

## 核心分层

- Raw Sources：原始资料层，保存网页、论文、笔记、聊天记录、图片等权威来源，不直接改写。
- Wiki：知识层，把原始资料蒸馏成概念、实体、来源摘要和综合分析页面。
- Schema：规则层，定义目录结构、frontmatter、标签、链接边界、维护流程和质量检查方式。

## 与 RAG 的区别

传统 RAG 更像“查询时临时读取资料”；LLM Wiki 更像“预先把资料编译成知识库”。它把重复理解的成本前移，后续查询主要使用已经整理好的 wiki 页面。

## 页面类型

- [[wiki/concepts/index|概念]]：理论、模型、模式和抽象关系。
- [[wiki/entities/index|实体]]：人、组织、工具、项目。
- [[wiki/references/index|来源摘要]]：对单个来源的可追溯总结。
- [[wiki/synthesis/index|综合分析]]：跨来源或跨页面形成的结论。

## 适用场景

- 长期维护个人或团队知识库。
- 需要让多个 AI agent 复用同一套上下文。
- 希望知识可以被人检查、被 Obsidian 图谱浏览、被后续任务增量更新。

## 相关页面

- [[wiki/entities/andrej-karpathy|Andrej Karpathy]]
- [[wiki/references/karpathy-llm-wiki-gist|Karpathy LLM Wiki Gist]]
- [[wiki/synthesis/karpathy-wiki-layering-for-ai-wiki|Karpathy Wiki 分层在 AI-Wiki 中的落地]]
