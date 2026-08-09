---
title: LangGraph 官方文档
category: references
tags:
  - 来源摘要
  - LangGraph
sources:
  - https://docs.langchain.com/oss/python/langgraph/overview
  - https://docs.langchain.com/oss/python/migrate/langgraph-v1
summary: LangGraph 官方文档说明了低层状态图运行时、持久化、streaming、human-in-the-loop、memory 和生产级 agent 编排能力。
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
# LangGraph 官方文档

来源：[LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview)

## 摘要

LangGraph 官方文档将 LangGraph 定位为低层 agent 编排框架和运行时。它可以独立使用，也常与 LangChain 组件结合。LangChain 的 `create_agent` 构建在 LangGraph 之上，因此能获得持久化、checkpoint、streaming、human-in-the-loop 和更细粒度状态控制。

## 关键内容

- LangGraph 使用状态图组织节点、边和状态更新。
- 它适合长时间运行、可恢复、状态化、多步骤的 agent 工作流。
- LangGraph 不负责抽象 prompt 或 agent 架构，而是提供运行基础设施。
- v1 迁移资料指出 `create_react_agent` 转向 LangChain 的 `create_agent`。
- 初学者应先掌握 LangChain agent，再在复杂编排场景下学习 LangGraph。

## 原始资料

- [LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph v1 migration guide](https://docs.langchain.com/oss/python/migrate/langgraph-v1)

## 相关页面

- [[wiki/entities/langgraph|LangGraph]]
- [[wiki/synthesis/langchain-ecosystem-map|LangChain 生态边界图谱]]
- [[wiki/synthesis/langchain-v1-learning-path|LangChain v1 自学路径]]

