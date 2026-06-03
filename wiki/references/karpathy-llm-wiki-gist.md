---
title: Karpathy LLM Wiki Gist
category: references
tags:
  - 来源摘要
  - LLM
  - wiki
source_url: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
summary: 该 gist 描述了一种由 LLM 增量维护的 Markdown wiki，用于替代每次查询时重新检索原始文档的工作流。
created: 2026-05-26T08:31:00+08:00
updated: 2026-05-26T08:31:00+08:00
---

# Karpathy LLM Wiki Gist

来源：[karpathy/442a6bf555914893e9891c11519de94f](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)

## 摘要

这份 gist 提出 [[wiki/concepts/llm-wiki|LLM Wiki]]：让 LLM 把原始资料编译为一个可被人和模型共同维护的 Markdown wiki。知识不再只在查询时临时从原文片段中抽取，而是沉淀为持久页面、链接和维护规则。

## 关键主张

- 原始资料应该保留为不可变或少变的 raw source。
- Wiki 页面是面向使用的编译产物，需要有结构、链接和来源追溯。
- Schema 负责约束 agent 如何维护页面，包括目录、标签、模板、日志和检查流程。
- Obsidian 这类 Markdown 工具适合作为可视化和人工审查界面。

## 对本项目的启发

本项目可以把 Karpathy 的通用模式映射为：

- `raw/`：存放原始来源。
- `wiki/`：存放中文蒸馏知识。
- `AGENTS.md`：存放 agent 维护规则。
- `log/`：仅在发生项目文件修改时记录操作痕迹。

## 相关页面

- [[wiki/entities/andrej-karpathy|Andrej Karpathy]]
- [[wiki/synthesis/karpathy-wiki-layering-for-ai-wiki|Karpathy Wiki 分层在 AI-Wiki 中的落地]]
