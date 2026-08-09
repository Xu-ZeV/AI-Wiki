---
title: LangChain 官方文档
category: references
tags:
  - 来源摘要
  - LangChain
sources:
  - https://docs.langchain.com/oss/python/langchain/overview
  - https://docs.langchain.com/oss/python/langchain/install
  - https://docs.langchain.com/oss/python/langchain/quickstart
  - https://docs.langchain.com/oss/python/langchain/agents
  - https://docs.langchain.com/oss/python/langchain/models
  - https://docs.langchain.com/oss/python/langchain/messages
  - https://docs.langchain.com/oss/python/langchain/tools
  - https://docs.langchain.com/oss/python/langchain/retrieval
  - https://docs.langchain.com/oss/python/langchain/structured-output
  - https://docs.langchain.com/oss/python/migrate/langchain-v1
summary: LangChain 官方文档说明了 v1 主线的 create_agent、标准模型接口、messages、tools、memory、streaming、structured output、retrieval 和迁移边界。
provenance:
  extracted: 0.9
  inferred: 0.1
  ambiguous: 0.0
base_confidence: 0.95
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangChain 官方文档

来源：[LangChain Python 文档](https://docs.langchain.com/oss/python/langchain/overview)

## 摘要

LangChain 官方文档将 v1 定位为面向 agent 的框架。核心入口是 `create_agent`，它把模型、工具、prompt、middleware 和 LangGraph 运行时组合成可配置的 agent harness。文档主线覆盖安装、Quickstart、Agents、Models、Messages、Tools、Memory、Streaming、Structured Output、Retrieval、Middleware、Context Engineering 和 v1 迁移。

## 关键内容

- 安装要求 Python 3.10+，基础包为 `langchain`，模型供应商通常通过独立集成包安装。
- `create_agent` 是构建 agent 的标准入口，agent 可以调用工具并通过 LangGraph 保存状态。
- `init_chat_model` 提供统一模型初始化入口，不同供应商通过标准接口调用。
- Messages 是模型上下文的基础单位，包含角色、内容和元数据。
- Tools 通过函数、类型标注、docstring 和 schema 暴露给模型。
- Structured Output 通过 Pydantic、dataclass、TypedDict 或 JSON Schema 让输出可校验。
- Retrieval 文档覆盖 loader、splitter、embedding、vector store、retriever 和 RAG 架构。
- v1 迁移文档强调旧功能迁往 `langchain-classic`，新项目应优先使用 v1 主线。

## 原始资料

- [LangChain overview](https://docs.langchain.com/oss/python/langchain/overview)
- [Install LangChain](https://docs.langchain.com/oss/python/langchain/install)
- [Quickstart](https://docs.langchain.com/oss/python/langchain/quickstart)
- [Agents](https://docs.langchain.com/oss/python/langchain/agents)
- [Models](https://docs.langchain.com/oss/python/langchain/models)
- [Messages](https://docs.langchain.com/oss/python/langchain/messages)
- [Tools](https://docs.langchain.com/oss/python/langchain/tools)
- [Retrieval](https://docs.langchain.com/oss/python/langchain/retrieval)
- [Structured output](https://docs.langchain.com/oss/python/langchain/structured-output)
- [LangChain v1 migration guide](https://docs.langchain.com/oss/python/migrate/langchain-v1)

## 相关页面

- [[wiki/entities/langchain|LangChain]]
- [[wiki/skills/langchain-basic|LangChain 基础教学]]
- [[wiki/synthesis/langchain-v1-learning-path|LangChain v1 自学路径]]

