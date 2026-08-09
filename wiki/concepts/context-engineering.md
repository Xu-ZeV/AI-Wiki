---
title: Context Engineering
category: concepts
tags:
  - LangChain
  - Agent
  - 上下文工程
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/context-engineering
  - https://docs.langchain.com/oss/python/langchain/middleware
summary: Context Engineering 是为 agent 动态提供正确模型上下文、工具上下文和生命周期上下文的工程实践，是提高 agent 可靠性的核心手段。
provenance:
  extracted: 0.78
  inferred: 0.22
  ambiguous: 0.0
base_confidence: 0.86
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: supporting
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# Context Engineering

Context Engineering 是为 agent 提供正确上下文的工程实践。它关注的不只是 prompt，还包括 messages、工具列表、工具参数、检索结果、memory、结构化输出格式和 middleware。

## 三类上下文

- 模型上下文：system prompt、messages、检索片段、输出格式和模型参数。
- 工具上下文：工具 schema、工具选择、运行时 context、state、store 和工具结果。
- 生命周期上下文：一次请求的用户、权限、trace、thread、重试状态、人工审批和监控数据。

## 为什么重要

Agent 失败往往不是模型完全不会，而是拿到的上下文不对：工具太多、检索结果过长、历史消息过期、输出格式不清楚，或缺少业务约束。LangChain 的 middleware、tool runtime、memory 和 structured output 都是上下文工程的落点。

## 实践原则

- 明确每一类上下文为什么传入。
- 控制上下文长度，不要把所有历史和文档都塞给模型。
- 将可验证数据交给工具或检索器，而不是要求模型凭空计算。
- 对高风险动作加入人工审批、权限判断和日志。

## 相关页面

- [[wiki/concepts/tool-calling|Tool Calling]]
- [[wiki/concepts/retrieval-augmented-generation|Retrieval-Augmented Generation]]
- [[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]]

