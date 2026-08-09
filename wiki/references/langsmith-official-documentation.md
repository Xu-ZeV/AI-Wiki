---
title: LangSmith 官方文档
category: references
tags:
  - 来源摘要
  - LangSmith
  - 可观测性
sources:
  - https://docs.langchain.com/langsmith/observability-quickstart
  - https://docs.langchain.com/langsmith/evaluation-quickstart
  - https://docs.langchain.com/langsmith/evaluation
summary: LangSmith 官方文档说明了 LLM 应用 tracing、debug、dataset、evaluator、experiment 和在线/离线 evaluation 工作流。
provenance:
  extracted: 0.88
  inferred: 0.12
  ambiguous: 0.0
base_confidence: 0.95
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: supporting
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangSmith 官方文档

来源：[LangSmith tracing quickstart](https://docs.langchain.com/langsmith/observability-quickstart)

## 摘要

LangSmith 官方文档覆盖 LLM 应用的 tracing、debug、evaluation 和 monitoring。Tracing 用来记录一次请求中的完整执行轨迹；Evaluation 用数据集、目标函数和 evaluator 比较不同 prompt、模型或应用版本的质量。

## 关键内容

- LangChain 或 LangGraph 应用可通过环境变量启用 LangSmith tracing。
- Trace 记录模型调用、工具调用、输入、输出、错误和延迟。
- Evaluation 需要 dataset、target function 和 evaluators。
- Offline evaluation 适合发布前比较版本；online evaluation 适合生产监控。
- 对学习者而言，LangSmith 能帮助观察 agent loop 和 RAG 失败点。

## 原始资料

- [Tracing quickstart](https://docs.langchain.com/langsmith/observability-quickstart)
- [Evaluation quickstart](https://docs.langchain.com/langsmith/evaluation-quickstart)
- [LangSmith Evaluation](https://docs.langchain.com/langsmith/evaluation)

## 相关页面

- [[wiki/entities/langsmith|LangSmith]]
- [[wiki/skills/langchain-langsmith-observability|LangChain LangSmith 可观测性教学]]
- [[wiki/skills/langchain-capstone-rag-agent|LangChain 综合项目：RAG Agent]]

