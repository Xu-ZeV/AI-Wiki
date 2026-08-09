---
title: Structured Output
category: concepts
tags:
  - LangChain
  - 结构化输出
  - JSON
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/structured-output
summary: Structured Output 是让 agent 按 Pydantic、dataclass、TypedDict 或 JSON Schema 返回可校验数据的机制，减少自由文本解析风险。
provenance:
  extracted: 0.82
  inferred: 0.18
  ambiguous: 0.0
base_confidence: 0.9
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# Structured Output

Structured Output 是让 agent 返回可校验结构化数据的机制。相比从自然语言中手工解析 JSON，它把输出 schema 交给 LangChain 和模型供应商处理，最终结果放在 agent state 的 `structured_response` 中。

## 常见 schema

- Pydantic model：适合 Python 项目，字段校验强。
- Dataclass：适合简单结构。
- TypedDict：适合轻量类型描述。
- JSON Schema：适合跨语言或已有 schema 的系统。

## 两种策略

- ProviderStrategy：模型供应商原生支持结构化输出时使用，可靠性更高。
- ToolStrategy：把结构化输出包装成工具调用，适合没有原生结构化输出能力的模型。

直接给 `create_agent(response_format=Schema)` 时，LangChain 会根据模型能力选择策略。

## 使用场景

- 信息抽取，例如从邮件中提取联系人和待办。
- 分类任务，例如把用户请求归为固定枚举。
- RAG 答案格式化，例如输出 answer、sources、confidence。
- Agent 工作结果交给后续程序处理。

## 相关页面

- [[wiki/skills/langchain-structured-output|LangChain 结构化输出教学]]
- [[wiki/skills/langchain-capstone-rag-agent|LangChain 综合项目：RAG Agent]]
- [[wiki/concepts/context-engineering|Context Engineering]]

