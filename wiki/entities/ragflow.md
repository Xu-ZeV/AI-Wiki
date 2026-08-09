---
title: RAGFlow
category: entities
tags:
  - 工具
  - AI
  - RAG
  - 知识库
aliases:
  - RAGFlow
  - InfiniFlow RAGFlow
sources:
  - "[[wiki/references/ragflow-official-documentation|RAGFlow 官方文档]]"
  - https://ragflow.io/docs/v0.26.0/
  - https://ragflow.io/docs/v0.26.0/configure_knowledge_base
summary: RAGFlow 是基于深度文档理解的开源 RAG 引擎，用数据集、文档解析、混合检索、引用展示、聊天助手和 API 接入组织可追溯的知识库问答系统。
provenance:
  extracted: 0.86
  inferred: 0.14
  ambiguous: 0.0
base_confidence: 0.92
lifecycle: draft
lifecycle_changed: 2026-06-16
tier: supporting
created: 2026-06-16T13:25:35+08:00
updated: 2026-06-16T13:25:35+08:00
---
# RAGFlow

RAGFlow 是 InfiniFlow 开源的 RAG 引擎，重点是把复杂格式文档解析成可检索知识，并在问答时提供带引用来源的回答。它不是单纯的向量库或聊天 UI，而是围绕“数据集 -> 文档解析 -> 检索测试 -> 聊天/搜索/API”组织完整知识库问答流程。

## 核心定位

RAGFlow 的核心价值在于把文档理解、分块、索引、检索策略、引用展示和应用接入放在同一个系统里。官方文档强调它基于 deep document understanding，适合处理 PDF、表格、图片型文档、文件系统资料和多数据集问答。

在 RAGFlow 中，数据集是知识来源。文档上传或从文件系统链接到数据集后，会经过解析、分块、embedding 和全文索引。后续聊天助手、AI Search、Agent 或 API 都可以基于这些数据集检索上下文。

## 主要能力

- Docker 部署：官方 `v0.26.0` 文档提供 x86 CPU 与 Nvidia GPU 场景下的 Docker Compose 启动方式。
- 模型配置：可在启动前通过配置文件预置模型 API Key，也可登录后在 Model providers 页面添加在线模型或绑定本地模型。
- 数据集管理：创建数据集、配置分块方式、选择 embedding 模型、上传或关联文件、解析文件并查看 chunk。
- 文档解析：PDF 可选择 DeepDoc、Naive、MinerU、Docling、OpenDataLoader 或第三方视觉模型等解析方式。
- 检索测试：在正式配置聊天助手前验证目标 chunk 是否能被召回，并调节相似度阈值、向量相似度权重、rerank、知识图谱和跨语言检索。
- 聊天与搜索：Chat 支持多轮对话、提示词、数据集选择、引用展示和模型参数；AI Search 是单轮搜索式问答，适合调试默认模型与检索策略。
- API 接入：提供 RAGFlow API Key、HTTP API、Python API，以及 OpenAI-compatible API 相关入口。

## 适用场景

- 企业或项目内部文档问答，需要回答可追溯到原文引用。
- PDF、表格、法律、手册、论文等复杂格式资料的 RAG 数据准备。
- 先用 UI 调参与验证，再通过 HTTP/Python API 集成到业务系统。
- 对比不同分块方式、embedding、rerank 和知识图谱检索效果。

## 与本 wiki 的关系

RAGFlow 可作为 [[wiki/concepts/retrieval-augmented-generation|Retrieval-Augmented Generation]] 的工程化平台案例：它把 RAG 流水线中常见的 loader、splitter、embedding、index、retriever 和 generation 组织成可操作系统。

它也适合和 [[wiki/concepts/llm-wiki|LLM Wiki]] 结合：本 wiki 先把高价值资料整理成稳定 Markdown 页面，RAGFlow 再作为检索和问答层消费这些文档或相关原始资料。

## 相关页面

- [[wiki/references/ragflow-official-documentation|RAGFlow 官方文档]]
- [[wiki/skills/ragflow-basic|RAGFlow 基础使用]]
- [[wiki/concepts/retrieval-augmented-generation|Retrieval-Augmented Generation]]
