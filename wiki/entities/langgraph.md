---
title: LangGraph
category: entities
tags:
  - 工具
  - AI
  - Agent
  - 编排
aliases:
  - LangGraph Runtime
sources:
  - "[[wiki/references/langgraph-official-documentation|LangGraph 官方文档]]"
  - https://docs.langchain.com/oss/python/langgraph/overview
summary: LangGraph 是 LangChain 生态中的低层 agent 编排框架和运行时，重点支持状态图、持久化、checkpoint、streaming 和 human-in-the-loop。
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
# LangGraph

LangGraph 是 LangChain 生态中的低层 agent 编排框架和运行时。它关注的是状态图、节点、边、持久化、checkpoint、streaming、人类介入和长时间运行工作流，而不是替开发者隐藏 agent 架构。

## 核心定位

如果 [[wiki/entities/langchain|LangChain]] 的 `create_agent` 是高层 agent harness，那么 LangGraph 就是支撑这个 harness 的底层运行时。LangChain 的 agent 构建在 LangGraph 之上，因此能继承持久化、恢复、流式更新和 human-in-the-loop 等能力。

## 适用场景

- agent 需要跨多轮对话保存状态。
- 工作流需要在失败后从 checkpoint 恢复。
- 需要把确定性步骤和 LLM 决策步骤组合成图。
- 需要对每个节点、状态更新和流式事件做精细控制。
- 需要人工审核、批准或修改 agent 的中间动作。

## 与 LangChain 的边界

初学者应先学习 [[wiki/entities/langchain|LangChain]] 的 `create_agent`。当高层 agent 无法表达复杂状态流、分支、循环、人工介入或生产级恢复逻辑时，再进入 LangGraph。

## 相关页面

- [[wiki/references/langgraph-official-documentation|LangGraph 官方文档]]
- [[wiki/synthesis/langchain-ecosystem-map|LangChain 生态边界图谱]]
- [[wiki/synthesis/langchain-v1-learning-path|LangChain v1 自学路径]]

