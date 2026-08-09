---
title: Retrieval-Augmented Generation
category: concepts
tags:
  - LangChain
  - RAG
  - 检索
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - "[[wiki/references/ragflow-official-documentation|RAGFlow 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/retrieval
  - https://ragflow.io/docs/v0.26.0/
summary: Retrieval-Augmented Generation 是在生成前或生成过程中检索外部知识，让 LLM 使用当前、领域化、可追溯上下文回答问题的架构。
provenance:
  extracted: 0.79
  inferred: 0.21
  ambiguous: 0.0
base_confidence: 0.88
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-16T13:25:35+08:00
---
# Retrieval-Augmented Generation

Retrieval-Augmented Generation，简称 RAG，是让 LLM 在回答时使用外部检索结果的架构。它解决两个基础限制：模型上下文窗口有限，训练知识也会过期。

## 检索流水线

典型 RAG 流水线包括：

- Document loaders：把 PDF、网页、知识库或数据库内容加载为文档。
- Text splitters：把长文档切成适合检索和上下文窗口的片段。
- Embedding models：把文本转成向量。
- Vector stores：保存向量并按相似度搜索。
- Retrievers：按查询返回相关文档。
- Generation：把检索结果放入 prompt 或 agent 上下文中生成答案。

## 三种架构

- 2-step RAG：先检索，再生成。简单、稳定、延迟低，适合 FAQ 和文档问答。
- Agentic RAG：由 agent 决定何时检索、检索什么、是否多次检索。更灵活，但延迟和行为更不确定。
- Hybrid RAG：在固定检索和 agent 决策之间加入验证、重排或补充检索。

## 与 LLM Wiki 的关系

[[wiki/concepts/llm-wiki|LLM Wiki]] 更强调预先把资料编译成可维护页面；RAG 更强调查询时动态检索。两者可以结合：先把高价值资料写入 wiki，再用 RAG 检索 wiki 或外部文档。

## 工程化平台

[[wiki/entities/ragflow|RAGFlow]] 是 RAG 工程化平台案例。它把数据集、文档解析、分块、embedding、全文检索、混合召回、检索测试、引用展示和 API 接入组织到同一个系统中，适合从 UI 调参推进到业务系统集成。

## 相关页面

- [[wiki/skills/langchain-rag|LangChain RAG 教学]]
- [[wiki/skills/langchain-capstone-rag-agent|LangChain 综合项目：RAG Agent]]
- [[wiki/skills/ragflow-basic|RAGFlow 基础使用]]
- [[wiki/concepts/context-engineering|Context Engineering]]
