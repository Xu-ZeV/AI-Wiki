---
title: LangChain 生态边界图谱
category: synthesis
tags:
  - 综合分析
  - LangChain
  - Agent
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - "[[wiki/references/langgraph-official-documentation|LangGraph 官方文档]]"
  - "[[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]"
summary: 本页梳理 LangChain、LangGraph、LangSmith 和 Deep Agents 的职责边界，帮助学习者判断每个组件何时使用。
provenance:
  extracted: 0.72
  inferred: 0.28
  ambiguous: 0.0
base_confidence: 0.86
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangChain 生态边界图谱

LangChain 生态可以按抽象层级理解：LangChain 是高层 agent 框架，LangGraph 是底层状态图运行时，LangSmith 是观测与评估平台，Deep Agents 是更“开箱即用”的高能力 agent harness。

## 边界表

| 组件 | 主要职责 | 何时学习 |
| --- | --- | --- |
| [[wiki/entities/langchain|LangChain]] | 模型接口、messages、tools、`create_agent`、structured output、RAG 组件 | 第一个学习 |
| [[wiki/entities/langgraph|LangGraph]] | 状态图、checkpoint、持久化、streaming、human-in-the-loop、复杂工作流 | agent 项目复杂后学习 |
| [[wiki/entities/langsmith|LangSmith]] | tracing、debug、evaluation、monitoring、实验比较 | 能跑 agent 后立即接入 |
| Deep Agents | 规划、子 agent、文件系统工具、上下文管理等内置能力 | 想快速获得更强默认能力时学习 |

## 推荐判断

- 想快速做一个带工具的 agent：用 LangChain `create_agent`。
- 想做复杂状态机、可恢复长任务或人工介入流程：引入 LangGraph。
- 想知道 agent 为什么失败：接入 LangSmith tracing。
- 想比较 prompt、模型或 RAG 版本：使用 LangSmith evaluation。
- 想快速获得规划、子任务和文件工具：研究 Deep Agents。

## 学习顺序

先学 [[wiki/skills/langchain-basic|LangChain 基础教学]]，再学 [[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]] 和 [[wiki/skills/langchain-rag|LangChain RAG 教学]]。只有在能解释 agent loop 后，再读 LangGraph；在能跑项目后，用 LangSmith 做观测和评估。

## 相关页面

- [[wiki/synthesis/langchain-v1-learning-path|LangChain v1 自学路径]]
- [[wiki/synthesis/langchain-v1-vs-classic|LangChain v1 与 langchain-classic 学习取舍]]
- [[wiki/skills/langchain-capstone-rag-agent|LangChain 综合项目：RAG Agent]]

