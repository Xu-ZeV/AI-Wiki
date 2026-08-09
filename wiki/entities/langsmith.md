---
title: LangSmith
category: entities
tags:
  - 工具
  - AI
  - 可观测性
  - Evaluation
aliases:
  - LangSmith Observability
sources:
  - "[[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]"
  - https://docs.langchain.com/langsmith/observability-quickstart
  - https://docs.langchain.com/langsmith/evaluation-quickstart
summary: LangSmith 是 LangChain 生态中的观测、调试、评估和监控平台，用于记录 LLM 应用执行轨迹并比较不同版本的质量。
provenance:
  extracted: 0.83
  inferred: 0.17
  ambiguous: 0.0
base_confidence: 0.9
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: supporting
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangSmith

LangSmith 是 LangChain 生态中的观测、调试、评估和监控平台。它可以记录一次 LLM 应用请求中的模型调用、工具调用、输入、输出、延迟、错误和中间状态，让开发者能复盘 agent 为什么这样回答。

## 核心能力

- Tracing：记录 LLM 应用和 agent 的完整执行轨迹。
- Debugging：定位 prompt、工具、检索、模型调用或状态更新的问题。
- Evaluation：用数据集、目标函数和 evaluator 比较不同版本输出质量。
- Monitoring：在生产环境中观察质量、延迟、失败率和用户反馈。

## 学习价值

LangChain 项目一旦进入工具调用、RAG 或多步 agent，单看最终回复很难判断问题来自哪里。LangSmith 的 trace 能把每一步拆开，让学习者理解 agent loop、工具参数、检索结果和结构化输出的实际行为。

## 与本 wiki 的关系

本 wiki 将 LangSmith 放在学习路径后半段：先能构建 agent，再用 LangSmith 观察和评估 agent。对应教程是 [[wiki/skills/langchain-langsmith-observability|LangChain LangSmith 可观测性教学]]。

## 相关页面

- [[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]
- [[wiki/skills/langchain-langsmith-observability|LangChain LangSmith 可观测性教学]]
- [[wiki/skills/langchain-capstone-rag-agent|LangChain 综合项目：RAG Agent]]

