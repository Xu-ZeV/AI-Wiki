---
title: Andrej Karpathy
category: entities
tags:
  - 人物
  - AI
  - LLM
aliases:
  - Karpathy
  - 卡帕西
sources:
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
summary: Andrej Karpathy 在 LLM Wiki gist 中把 LLM 辅助知识库描述为由 raw source、wiki 和 schema 组成的持久化维护模式。
created: 2026-05-26T08:31:00+08:00
updated: 2026-05-26T08:31:00+08:00
---

# Andrej Karpathy

Andrej Karpathy 是 AI 研究者和工程实践者。他在公开 gist 中提出的 [[wiki/concepts/llm-wiki|LLM Wiki]] 模式，把 LLM 的角色从“临时问答器”转向“持续维护知识库的编译器”。

## 与本 wiki 的关系

- 他的 LLM Wiki 思路为本项目的 `raw/`、`wiki/`、`AGENTS.md` 分层提供了理论来源。
- 本项目将该思路落地为：原始资料进入 raw source 层，蒸馏后的中文说明进入 wiki 层，维护约束写入 schema 层。

## 相关页面

- [[wiki/concepts/llm-wiki|LLM Wiki]]
- [[wiki/references/karpathy-llm-wiki-gist|Karpathy LLM Wiki Gist]]
- [[wiki/synthesis/karpathy-wiki-layering-for-ai-wiki|Karpathy Wiki 分层在 AI-Wiki 中的落地]]
