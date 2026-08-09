---
title: RAGFlow 基础使用
category: skills
tags:
  - RAGFlow
  - 教程
  - RAG
  - API
sources:
  - "[[wiki/references/ragflow-official-documentation|RAGFlow 官方文档]]"
  - https://ragflow.io/docs/v0.26.0/
  - https://ragflow.io/docs/v0.26.0/configure_knowledge_base
  - https://ragflow.io/docs/v0.26.0/run_retrieval_test
  - https://ragflow.io/docs/v0.26.0/start_chat
  - https://ragflow.io/docs/v0.26.0/ai_search
  - https://ragflow.io/docs/v0.26.0/acquire_ragflow_api_key
  - https://ragflow.io/docs/v0.26.0/http_api_reference
  - https://ragflow.io/docs/v0.26.0/python_api_reference
summary: RAGFlow 基础使用路径，覆盖 Docker 部署、模型配置、数据集创建、文档解析、retrieval test、AI Chat/Search 和 HTTP/Python API 接入。
provenance:
  extracted: 0.84
  inferred: 0.16
  ambiguous: 0.0
base_confidence: 0.9
lifecycle: draft
lifecycle_changed: 2026-06-16
tier: supporting
created: 2026-06-16T13:25:35+08:00
updated: 2026-06-16T13:25:35+08:00
---
# RAGFlow 基础使用

## 1. RAGFlow 解决什么问题

RAGFlow 适合把企业文档、项目资料、PDF、表格和文件系统内容组织成可检索、可引用的 RAG 问答系统。它内置数据集、文档解析、分块、embedding、全文索引、检索测试、聊天助手和 API 接入，适合先通过 UI 调参验证，再把能力嵌入业务应用。

如果任务只是把少量纯文本放进 prompt，RAGFlow 不是必需项；如果任务需要持续维护文档、处理复杂格式、验证召回效果、展示引用或给系统提供 API，则可以把 RAGFlow 作为知识库问答平台。

## 2. 最小准备

官方 `v0.26.0` Docker 部署主要面向 x86 CPU 和 Nvidia GPU。基础环境建议：

- x86 CPU 4 核以上。
- 内存 16 GB 以上。
- 磁盘 50 GB 以上。
- Docker 24.0.0 以上，Docker Compose v2.26.1 以上。
- Python 3.13 以上。
- 只有使用 code executor sandbox 功能时才需要 gVisor。

Linux 快速启动入口：

```bash
git clone https://github.com/infiniflow/ragflow.git
cd ragflow/docker
git checkout -f v0.26.0
docker compose -f docker-compose.yml up -d
docker logs -f docker-ragflow-cpu-1
```

启动后通过浏览器访问服务器地址。若访问端口改动，需要同步检查 Docker `.env`、`docker-compose.yml` 与服务配置。

如果使用 Elasticsearch 相关服务，部署前还应按官方 Quickstart 检查 `vm.max_map_count`。该值过低时可能导致 Elasticsearch 集群连接失败。

## 3. 配置模型

RAGFlow 需要模型才能完成问答、检索增强和部分解析/推理能力。模型配置有两条路径：

1. 启动前配置：在 `docker/ragflow/service_conf.yaml.template` 中预置模型厂商、API Key 和 base URL，然后重启容器。
2. 登录后配置：进入右上角头像菜单的 Model providers 页面，添加模型 API Key、代理 base URL，并在 System Model Settings 中选择默认模型。

实践建议：

- 在线模型 Key 不要写入 wiki、源码或日志。
- 如果使用本地模型，可按官方文档通过 Ollama、Xinference、vLLM、SGLang、GPUStack 等框架接入。
- embedding 模型要谨慎选择；数据集已有 chunks 后不能直接替换 embedding 模型，切换前需要删除已有 chunks。

## 4. 创建数据集并导入文件

数据集是 RAGFlow 的知识来源。创建数据集后，需要配置 chunking method 和 embedding model，再上传或关联文件。

文件进入数据集有两种方式：

- 直接上传到数据集：操作简单，但删除数据集时相关文件副本会一起删除。
- 先上传到 RAGFlow File system，再链接到目标数据集：更适合长期维护，因为同一个文件可关联到多个数据集。

基础流程：

1. 创建数据集。
2. 选择适合文档版式的内置 chunking method，或使用自定义 ingestion pipeline。
3. 选择 embedding model。
4. 上传文件或从 File system 关联文件。
5. 启动文件解析，等待解析完成。
6. 打开 chunk 页面检查分块结果。

## 5. 选择解析和分块策略

RAGFlow 的文件解析不只是切文本，还会建立 embedding 索引和全文关键词索引。解析后应检查 chunk 是否语义完整、是否切错表格或标题、是否缺少关键上下文。

PDF 解析选择：

- `DeepDoc`：默认视觉模型，适合复杂版式、OCR、表格结构识别和文档布局识别，但耗时可能更长。
- `Naive`：跳过 OCR、表格结构识别和布局识别，适合纯文本 PDF。
- `MinerU`、`Docling`、`OpenDataLoader`：实验性或外部解析能力，适合特定文档处理场景。
- 第三方视觉模型：适合图片型或复杂版式 PDF，需要先配置默认 VLM。

Parent-child chunking 适合需要兼顾精确召回和完整上下文的场景。子 chunk 用于更细粒度召回，父 chunk 用于补足生成阶段所需的上下文。

## 6. 干预解析结果

解析完成后，应该进入 chunk 页面做抽样检查。必要时可以对 chunk 做人工干预：

- 修改 chunk 文本，修正错误解析。
- 添加关键词，提高包含这些词的查询中的排序权重。
- 添加问题或标签，帮助后续检索和维护。
- 禁用不应进入问答的文件或片段。

这一步的目标不是追求每个 chunk 都手工修正，而是先发现明显的解析失败、切分失真和召回风险。

## 7. 运行 Retrieval Test

正式创建聊天助手前，应先运行 retrieval test，确认用户可能提出的问题能召回预期 chunks。测试页常用参数：

- `Similarity threshold`：过滤低相似度 chunks，默认值为 `0.2`。
- `Vector similarity weight`：控制向量相似度在综合分数中的占比，默认值为 `0.3`。
- `Rerank model`：启用后用 rerank score 替代向量余弦相似度参与混合评分，但响应耗时会增加。
- `Use knowledge graph`：把知识图谱生成的实体、关系和社区报告纳入检索，适合多跳问题，但会增加模型调用和耗时。
- `Cross-language search`：把查询翻译到目标语言后检索，适合多语言数据集。

如果 retrieval test 不能召回正确 chunk，应优先排查解析结果、chunking method、embedding model、相似度阈值、向量权重和 rerank 设置，而不是直接调整最终 prompt。

## 8. 创建 AI Chat 或 AI Search

AI Chat 是多轮聊天助手，适合正式问答场景。配置重点：

- 选择一个或多个数据集；多个数据集需要使用相同 embedding 模型。
- 保持 `Show quote` 开启，让回答展示引用来源。
- 设置未检索到答案时的固定回复；如果留空，模型可能自由发挥并增加幻觉风险。
- 配置 prompt、similarity threshold、Top N、rerank、knowledge graph、多轮优化、跨语言检索和模型参数。

AI Search 是单轮搜索式问答，使用系统默认聊天模型和预定义混合检索策略。它不包含知识图谱、auto-keyword、auto-question 等高级 RAG 策略，更适合作为调试默认模型和基础检索效果的参考。

## 9. API 接入

把 RAGFlow 接入业务系统前，需要先在 UI 里申请 RAGFlow API Key：

1. 点击右上角头像进入配置页。
2. 切换到 API 页面。
3. 生成并保存 RAGFlow API Key。

随后根据项目语言选择接口：

- HTTP API：适合任何后端服务、脚本或低代码系统调用。
- Python API：适合 Python 应用、数据处理脚本或自动化测试。
- OpenAI-compatible API：适合复用已有 OpenAI 风格客户端的集成路径。
- MCP：适合把 RAGFlow 暴露给支持 Model Context Protocol 的工具或 agent。

API Key 应放在环境变量或密钥管理系统中，不应写入仓库、wiki 页面或日志。

## 10. 基础检查清单

- Docker 服务是否启动成功，浏览器是否能访问 RAGFlow。
- Model providers 中是否配置了聊天模型、embedding 模型和必要的 VLM/rerank 模型。
- 数据集是否选择了正确的 chunking method 和 embedding model。
- 文件是否解析完成，chunk 页面是否能看到合理分块。
- PDF 是否根据版式选择了 DeepDoc、Naive 或其他 parser。
- retrieval test 是否能召回预期 chunk。
- AI Chat 是否开启引用展示，并设置了未检索到答案时的回复策略。
- AI Search 是否能作为基础检索策略的调试参考。
- HTTP/Python API 是否使用 RAGFlow API Key 认证。

## Sources

- Wiki 来源页：[[wiki/references/ragflow-official-documentation|RAGFlow 官方文档]]
- 原始资料：[Quickstart](https://ragflow.io/docs/v0.26.0/)
- 原始资料：[Configure dataset](https://ragflow.io/docs/v0.26.0/configure_knowledge_base)
- 原始资料：[Run retrieval test](https://ragflow.io/docs/v0.26.0/run_retrieval_test)
- 原始资料：[Start AI chat](https://ragflow.io/docs/v0.26.0/start_chat)
- 原始资料：[Search](https://ragflow.io/docs/v0.26.0/ai_search)
- 原始资料：[HTTP API](https://ragflow.io/docs/v0.26.0/http_api_reference)
- 原始资料：[Python API](https://ragflow.io/docs/v0.26.0/python_api_reference)
