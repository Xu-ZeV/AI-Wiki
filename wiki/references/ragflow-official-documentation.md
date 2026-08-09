---
title: RAGFlow 官方文档
category: references
tags:
  - 来源摘要
  - RAGFlow
sources:
  - https://ragflow.io/docs/v0.26.0/
  - https://ragflow.io/docs/v0.26.0/category/datasets
  - https://ragflow.io/docs/v0.26.0/configure_knowledge_base
  - https://ragflow.io/docs/v0.26.0/select_pdf_parser
  - https://ragflow.io/docs/v0.26.0/configure_child_chunking_strategy
  - https://ragflow.io/docs/v0.26.0/run_retrieval_test
  - https://ragflow.io/docs/v0.26.0/start_chat
  - https://ragflow.io/docs/v0.26.0/ai_search
  - https://ragflow.io/docs/v0.26.0/llm_api_key_setup
  - https://ragflow.io/docs/v0.26.0/configurations
  - https://ragflow.io/docs/v0.26.0/acquire_ragflow_api_key
  - https://ragflow.io/docs/v0.26.0/http_api_reference
  - https://ragflow.io/docs/v0.26.0/python_api_reference
summary: RAGFlow 官方 v0.26.0 文档说明了本地 Docker 部署、模型配置、数据集与文档解析、检索测试、AI Chat/Search，以及 HTTP/Python API 接入方式。
provenance:
  extracted: 0.88
  inferred: 0.12
  ambiguous: 0.0
base_confidence: 0.95
lifecycle: draft
lifecycle_changed: 2026-06-16
tier: supporting
created: 2026-06-16T13:25:35+08:00
updated: 2026-06-16T13:25:35+08:00
---
# RAGFlow 官方文档

来源：[RAGFlow Docs v0.26.0](https://ragflow.io/docs/v0.26.0/)

## 摘要

RAGFlow 官方文档把 RAGFlow 定位为基于深度文档理解的开源 RAG 引擎。`v0.26.0` 的核心路径是：部署本地服务，配置模型，创建数据集，上传或关联文件，选择解析与分块策略，运行 retrieval test，再创建 AI Chat、AI Search 或通过 API 集成到应用。

## 关键内容

- Quickstart 覆盖本地启动、创建数据集、干预文件解析和基于数据集建立 AI Chat。官方 Docker 部署主要面向 x86 CPU 与 Nvidia GPU，ARM 平台需要自行构建镜像。
- 部署前置条件包括 4 核以上 x86 CPU、16 GB 以上内存、50 GB 以上磁盘、Docker 24.0.0 以上、Docker Compose v2.26.1 以上；使用 code executor sandbox 时还需要 gVisor。
- Docker 配置集中在 `.env`、`service_conf.yaml`、`docker-compose.yml` 等文件中，涉及 Elasticsearch/Infinity、MySQL、MinIO、Redis、RAGFlow 服务端口、镜像版本、embedding 服务和时区等。
- 模型配置可在启动前写入 `service_conf.yaml.template`，也可登录后在 Model providers 页面添加模型 API Key、base URL 和默认系统模型。
- 数据集是聊天助手和 Agent 的主要知识来源。数据集配置包括 chunking method、embedding model、文件上传或文件系统关联、文件解析、chunk 查看与人工修正。
- embedding 模型一旦用于已有 chunks，就不能直接替换；若要切换 embedding 模型，需要先删除数据集中的既有 chunks，避免不同向量空间混用。
- 文档解析同时承担布局分块、embedding 索引和全文关键词索引。RAGFlow 支持查看分块结果，并对 chunk 添加关键词、问题、标签或手工修改内容。
- PDF 解析可选择 DeepDoc、Naive、MinerU、Docling、OpenDataLoader 或第三方视觉模型；普通文本型 PDF 可用 Naive 减少解析耗时，复杂版式或图片型 PDF 需要视觉模型。
- Parent-child chunking 用父 chunk 保留上下文完整性，用子 chunk 做精确召回，解决细粒度检索与生成上下文完整性之间的冲突。
- Retrieval test 用于正式聊天前验证目标 chunks 是否能被召回，可调节 similarity threshold、vector similarity weight、rerank model、knowledge graph 和 cross-language search。
- Chat 是基于一个或多个数据集的多轮问答，可配置提示词、数据集、混合检索参数、知识图谱、引用展示、模型和采样参数。
- AI Search 是单轮搜索式问答，使用预定义的混合检索策略和系统默认聊天模型，适合调试默认模型设置和检索策略。
- API 接入需要先在 RAGFlow UI 中申请 RAGFlow API Key；官方提供 HTTP API、Python API、OpenAI-compatible API，以及 MCP 相关入口。

## 原始资料

- [Quickstart](https://ragflow.io/docs/v0.26.0/)
- [Datasets](https://ragflow.io/docs/v0.26.0/category/datasets)
- [Configure dataset](https://ragflow.io/docs/v0.26.0/configure_knowledge_base)
- [Select PDF parser](https://ragflow.io/docs/v0.26.0/select_pdf_parser)
- [Configure child chunking strategy](https://ragflow.io/docs/v0.26.0/configure_child_chunking_strategy)
- [Run retrieval test](https://ragflow.io/docs/v0.26.0/run_retrieval_test)
- [Start AI chat](https://ragflow.io/docs/v0.26.0/start_chat)
- [Search](https://ragflow.io/docs/v0.26.0/ai_search)
- [Configure model API key](https://ragflow.io/docs/v0.26.0/llm_api_key_setup)
- [Configuration](https://ragflow.io/docs/v0.26.0/configurations)
- [Acquire RAGFlow API key](https://ragflow.io/docs/v0.26.0/acquire_ragflow_api_key)
- [HTTP API](https://ragflow.io/docs/v0.26.0/http_api_reference)
- [Python API](https://ragflow.io/docs/v0.26.0/python_api_reference)

## 相关页面

- [[wiki/entities/ragflow|RAGFlow]]
- [[wiki/skills/ragflow-basic|RAGFlow 基础使用]]
- [[wiki/concepts/retrieval-augmented-generation|Retrieval-Augmented Generation]]
