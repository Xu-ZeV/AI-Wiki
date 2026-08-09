---
title: LangChain v1 自学路径
category: synthesis
tags:
  - 综合分析
  - LangChain
  - 教学路径
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - "[[wiki/references/langgraph-official-documentation|LangGraph 官方文档]]"
  - "[[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]"
summary: 本页把 LangChain v1 知识库页面组织成 10 阶段自学路径，从环境和模型调用推进到可观测 RAG Agent 项目。
provenance:
  extracted: 0.68
  inferred: 0.32
  ambiguous: 0.0
base_confidence: 0.86
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangChain v1 自学路径

本路径以 Python、LangChain v1 和可落地项目为主线。目标不是背 API，而是逐步构建一个能检索本 wiki、调用工具、返回结构化结果并可被 LangSmith 观察的 RAG Agent。

## 1. 环境与模型调用

- 目标：安装 LangChain，配置 API Key，跑通一次模型调用。
- 必读：[[wiki/skills/langchain-basic|LangChain 基础教学]]
- 练习：用 `init_chat_model` 让模型解释 LangChain 的用途。
- 验收：能通过 messages 调用模型，且 API Key 不进入代码。

## 2. Messages 与标准模型接口

- 目标：理解 system/user/AI/tool messages 和标准模型接口。
- 必读：[[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- 练习：分别用 string、dict message、message object 调用模型。
- 验收：能解释 message role、content 和 metadata 的用途。

## 3. 工具调用与最小 agent

- 目标：用 `create_agent` 和 `@tool` 构建最小工具 agent。
- 必读：[[wiki/concepts/langchain-agent-harness|LangChain Agent Harness]]、[[wiki/concepts/tool-calling|Tool Calling]]
- 练习：写一个天气、计算或搜索工具。
- 验收：能在 trace 或输出中确认工具被调用。

## 4. Memory、thread 与 streaming

- 目标：理解 `thread_id`、checkpointer、短期 memory 和 streaming。
- 必读：[[wiki/concepts/agent-memory|Agent Memory]]、[[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]]
- 练习：同一 `thread_id` 连续两轮对话，并观察历史影响。
- 验收：能解释短期 memory 和长期 store 的区别。

## 5. 结构化输出

- 目标：让 agent 返回可校验数据。
- 必读：[[wiki/concepts/structured-output|Structured Output]]、[[wiki/skills/langchain-structured-output|LangChain 结构化输出教学]]
- 练习：提取联系人、待办或 RAG 答案结构。
- 验收：能从 `structured_response` 读取 Pydantic 结果。

## 6. Retrieval 与 RAG

- 目标：掌握 loader、splitter、embedding、vector store、retriever 和 RAG 架构。
- 必读：[[wiki/concepts/retrieval-augmented-generation|Retrieval-Augmented Generation]]、[[wiki/skills/langchain-rag|LangChain RAG 教学]]
- 练习：用本地 Markdown 做 2-step RAG。
- 验收：回答包含来源，不把全部文档塞入上下文。

## 7. Middleware 与 context engineering

- 目标：理解上下文控制、工具选择、guardrails、重试和日志插入点。
- 必读：[[wiki/concepts/context-engineering|Context Engineering]]
- 练习：记录一次 agent 调用前后的输入输出，或限制工具选择。
- 验收：能说明一次失败是上下文、工具、模型还是检索问题。

## 8. LangGraph 何时介入

- 目标：判断何时从 LangChain agent 进入 LangGraph。
- 必读：[[wiki/entities/langgraph|LangGraph]]、[[wiki/references/langgraph-official-documentation|LangGraph 官方文档]]
- 练习：画出一个需要状态图的复杂流程。
- 验收：能解释 LangChain 与 LangGraph 的边界。

## 9. LangSmith trace 与 evaluation

- 目标：用 LangSmith 观察和评估 agent。
- 必读：[[wiki/entities/langsmith|LangSmith]]、[[wiki/skills/langchain-langsmith-observability|LangChain LangSmith 可观测性教学]]
- 练习：开启 tracing，准备 5 条 evaluation 样例。
- 验收：能基于 trace 解释一次失败，并比较两个 prompt 版本。

## 10. 综合 RAG Agent 项目

- 目标：构建可运行学习型 RAG Agent。
- 必读：[[wiki/skills/langchain-capstone-rag-agent|LangChain 综合项目：RAG Agent]]
- 练习：让 agent 回答“我应该先学 LangChain 还是 LangGraph？”并输出来源。
- 验收：项目具备检索工具、结构化输出、短期 memory 和 trace。

## 路径完成标准

- 能独立创建 LangChain agent。
- 能接入至少一个自定义工具。
- 能解释 RAG 三种架构取舍。
- 能让 agent 返回结构化结果。
- 能通过 LangSmith trace 定位问题。
- 能把本 wiki 页面作为学习和问答资料来源。

