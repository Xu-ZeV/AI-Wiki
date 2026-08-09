---
title: LangChain v1 与 langchain-classic 学习取舍
category: synthesis
tags:
  - 综合分析
  - LangChain
  - 迁移
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/migrate/langchain-v1
summary: 本页说明为什么新学习路径优先 LangChain v1，并把旧版 chains、LCEL、retrievers 和 classic 功能作为遗留项目迁移背景处理。
provenance:
  extracted: 0.75
  inferred: 0.25
  ambiguous: 0.0
base_confidence: 0.86
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: supporting
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangChain v1 与 langchain-classic 学习取舍

LangChain 早期教程大量围绕 chains、LCEL、memory 模块和 community re-export 展开。当前 v1 文档已经把 `langchain` 命名空间收缩到 agent 核心构件，新学习路径应优先 v1。

## v1 主线

新项目优先学习：

- `langchain.agents.create_agent`
- `langchain.chat_models.init_chat_model`
- `langchain.messages`
- `langchain.tools`
- structured output
- short-term memory
- middleware
- retrieval/RAG
- LangSmith tracing/evaluation

## classic 的位置

`langchain-classic` 适合维护旧项目或迁移旧代码。典型对象包括旧式 chains、部分 retrievers、indexing API、hub、旧 memory 组件和曾经从 `langchain-community` re-export 的功能。

## 学习取舍

- 如果目标是自学并做新项目：从 [[wiki/synthesis/langchain-v1-learning-path|LangChain v1 自学路径]] 开始。
- 如果目标是维护旧项目：先读迁移文档，再识别哪些 import 需要迁到 `langchain-classic`。
- 如果看到旧教程：先判断代码是否使用 `LLMChain`、`ConversationChain`、旧 memory 或旧 retriever 路径。
- 不要为了学习 LangChain 而同时深挖所有历史 API，这会拖慢主线。

## 迁移提醒

- 新项目不要把 `LLMChain` 当作入口。
- 旧代码迁移时先锁定依赖版本，再逐步替换 import。
- 工具调用、structured output、runtime context 和 state 的写法以 v1 文档为准。
- LangGraph v1 中旧的预构建 ReAct agent 也转向 LangChain 的 `create_agent`。

## 相关页面

- [[wiki/entities/langchain|LangChain]]
- [[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- [[wiki/synthesis/langchain-ecosystem-map|LangChain 生态边界图谱]]

