---
title: LangChain
category: entities
tags:
  - 工具
  - AI
  - Agent
  - Python
aliases:
  - LangChain v1
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/overview
  - https://docs.langchain.com/oss/python/langchain/quickstart
summary: LangChain 是面向 LLM 应用和 AI Agent 的开源框架，v1 主线以 create_agent、标准模型接口、工具、middleware 和 LangGraph 运行时为核心。
provenance:
  extracted: 0.84
  inferred: 0.16
  ambiguous: 0.0
base_confidence: 0.9
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangChain

LangChain 是一个用于构建 LLM 应用和 AI Agent 的开源框架。当前 v1 主线不再把学习重点放在旧式 chains 上，而是围绕 `create_agent`、标准模型接口、工具调用、结构化输出、memory、streaming 和 middleware 组织。

## 核心定位

LangChain 的价值是把模型、工具、消息、运行时和观测组织成一个可组合的 agent harness。开发者可以从最小 agent 开始，逐步加入工具、检索、结构化输出、上下文控制和可观测性。

在当前生态中：

- [[wiki/entities/langchain|LangChain]]：提供高层 agent 框架、模型/工具接口和常见应用组件。
- [[wiki/entities/langgraph|LangGraph]]：提供底层状态图运行时，用于更复杂、长时间运行、可恢复的 agent 工作流。
- [[wiki/entities/langsmith|LangSmith]]：提供 trace、debug、evaluation、monitoring 和部署相关能力。

## v1 学习重点

- `create_agent`：构建 agent 的主入口。
- `init_chat_model`：通过统一接口初始化不同模型供应商。
- `messages`：用标准消息结构表达系统指令、用户输入、AI 回复和工具结果。
- `tools`：让模型调用外部函数、数据库、检索系统或业务动作。
- `response_format`：让 agent 返回可校验的结构化结果。
- `checkpointer` 和 `thread_id`：保存单个对话线程的短期记忆。
- `middleware`：在 agent 循环中插入日志、guardrails、重试、fallback、动态模型选择等逻辑。

## 与本 wiki 的关系

本 wiki 将 LangChain 拆成实体、概念、来源摘要、实践教程和学习路径五层。学习入口是 [[wiki/synthesis/langchain-v1-learning-path|LangChain v1 自学路径]]；综合项目是 [[wiki/skills/langchain-capstone-rag-agent|LangChain 综合项目：RAG Agent]]。

## 相关页面

- [[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- [[wiki/concepts/langchain-agent-harness|LangChain Agent Harness]]
- [[wiki/skills/langchain-basic|LangChain 基础教学]]
- [[wiki/synthesis/langchain-ecosystem-map|LangChain 生态边界图谱]]

