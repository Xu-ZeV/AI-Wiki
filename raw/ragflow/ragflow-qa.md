# RAGFlow 知识问答文档

材料来源：基于 RAGFlow 官方 `v0.26.0` 文档与本仓库已整理的 RAGFlow wiki 页面生成。本文先作为 raw 原始问答素材保存，后续可再拆分进入 wiki 的实体、概念、技能或面试问答页面。

## 一、基础定位

### RAGFlow 是什么？

RAGFlow 是 InfiniFlow 开源的 RAG 引擎，官方将它定位为基于深度文档理解的检索增强生成系统。它把文档解析、分块、embedding、全文检索、混合召回、检索测试、聊天助手和 API 接入组织到同一个平台里。

### RAGFlow 主要解决什么问题？

RAGFlow 主要解决“把复杂文档变成可检索知识，并让大模型基于这些知识回答问题”的问题。它适合企业文档问答、项目知识库、PDF/表格资料问答、带引用的智能客服和需要 API 集成的 RAG 应用。

### RAGFlow 和普通聊天机器人有什么区别？

普通聊天机器人通常依赖模型自身知识或手动塞入上下文；RAGFlow 则先把外部文档解析成数据集，再通过检索把相关 chunks 提供给模型回答，并支持引用展示、召回调试和 API 接入。

### RAGFlow 和向量数据库有什么区别？

向量数据库主要负责向量存储和相似度检索。RAGFlow 覆盖更上层的应用流程，包括文件上传、文档解析、chunk 管理、embedding、全文索引、检索测试、聊天助手、搜索应用和 API 集成。

### RAGFlow 为什么强调 deep document understanding？

企业资料常见 PDF、表格、扫描件、论文、手册和法律文档等复杂版式。RAGFlow 不只做纯文本切分，还关注 OCR、表格结构识别、文档布局识别和 chunk 可解释性，从而减少错误分块对问答质量的影响。

## 二、部署与配置

### RAGFlow 官方 v0.26.0 推荐什么部署方式？

官方 Quickstart 主要说明使用 Docker 和 Docker Compose 部署本地 RAGFlow 服务。该版本主要支持 x86 CPU 和 Nvidia GPU 场景；ARM 平台可以使用源码构建镜像，但官方不维护 ARM Docker 镜像。

### 部署 RAGFlow 需要哪些基础资源？

官方文档建议至少准备 4 核以上 x86 CPU、16 GB 以上内存、50 GB 以上磁盘、Docker 24.0.0 以上、Docker Compose v2.26.1 以上和 Python 3.13 以上。只有使用 code executor sandbox 功能时才需要 gVisor。

### 为什么部署前要关注 vm.max_map_count？

RAGFlow 依赖 Elasticsearch 或类似检索服务时，`vm.max_map_count` 过低可能导致 Elasticsearch 集群连接失败。官方 Quickstart 针对 Linux、macOS 和 Windows/WSL 给出了调整方式。

### RAGFlow Docker 配置主要涉及哪些文件？

主要涉及 `.env`、`service_conf.yaml`、`service_conf.yaml.template` 和 `docker-compose.yml`。其中 `.env` 管理 Docker 环境变量，`service_conf.yaml` 管理服务配置，`docker-compose.yml` 管理 RAGFlow 及依赖服务。

### RAGFlow 依赖哪些基础服务？

官方 Docker Compose 方案会组织 RAGFlow 及其依赖，包括 Elasticsearch 或 Infinity、MySQL、MinIO、Redis 等。MinIO 用于对象存储，MySQL 用于元数据，Redis 用于缓存或队列类能力，检索引擎用于全文和向量相关检索。

### 修改 Docker 配置后需要做什么？

修改 `.env`、`service_conf.yaml` 或 `docker-compose.yml` 后，通常需要重启相关容器才能生效。部署时应确认端口映射、镜像版本、服务地址、数据库密码、对象存储账号和时区等配置。

## 三、模型配置

### RAGFlow 为什么需要配置模型？

RAGFlow 是 RAG 引擎，需要大模型生成回答，也可能需要 embedding 模型、rerank 模型、视觉模型或本地模型来完成检索、排序、文档解析和推理任务。

### RAGFlow 支持哪些模型接入方式？

RAGFlow 支持主流在线模型服务，也支持通过 Ollama、Xinference、vLLM、SGLang、GPUStack 等框架接入本地模型。具体支持范围以官方 Supported Models 页面为准。

### 模型 API Key 可以在哪里配置？

有两种方式：启动前在 `service_conf.yaml.template` 中配置模型厂商、API Key 和 base URL；或者登录 RAGFlow 后在 Model providers 页面添加模型 API Key 和 base URL。

### 为什么登录后再改 service_conf.yaml.template 可能不生效？

官方文档说明，登录 RAGFlow 后，应通过 Model providers 页面配置模型 API Key；此时再通过启动模板文件配置可能不会影响已经初始化的系统模型设置。

### embedding 模型为什么不能随便切换？

embedding 模型决定 chunks 所在的向量空间。一个数据集中已有 chunks 后，如果直接切换 embedding 模型，就会把不同向量空间的结果混在一起，导致相似度不可比。因此切换前需要删除已有 chunks 并重新解析。

### rerank 模型有什么作用？

rerank 模型用于对初步召回结果重新排序。启用 rerank 后，RAGFlow 会用关键词相似度和 rerank score 组合评分，而不是简单使用关键词相似度和向量余弦相似度组合评分。它通常能改善排序，但会增加响应时间。

## 四、数据集与文件管理

### RAGFlow 中的数据集是什么？

数据集是 RAGFlow 的知识来源。聊天助手、Agent 和搜索应用通常基于一个或多个数据集进行检索和回答。数据集会保存文件引用、解析后的 chunks、embedding 和全文索引。

### 创建数据集后要配置哪些关键项？

关键项包括 chunking method、embedding model、文件来源、解析策略和检索相关参数。配置质量会直接影响后续召回效果和回答质量。

### 文件可以怎样进入数据集？

文件可以直接上传到数据集，也可以先上传到 RAGFlow File system，再链接到目标数据集。后者更适合长期维护，因为同一个文件可以关联到多个数据集。

### 直接上传文件到数据集有什么风险？

直接上传到数据集更方便，但删除数据集时，直接上传到该数据集的文件副本会一起删除。若文件先存入 File system，再链接到数据集，删除数据集时原文件仍可保留。

### 数据集搜索在 v0.26.0 中支持什么能力？

官方文档说明，RAGFlow v0.26.0 的数据集搜索仍比较基础，主要支持按数据集名称搜索。

### 删除数据集会发生什么？

删除数据集会自动移除对应知识库目录。直接上传到数据集的文件会消失；从 File system 创建的文件引用会消失，但原始文件仍存在。

## 五、文档解析与分块

### RAGFlow 的文件解析包含哪些含义？

RAGFlow 的文件解析有两层含义：一是根据文件布局和解析策略切分成 chunks；二是基于 chunks 建立 embedding 索引和全文关键词索引。

### chunking method 为什么重要？

chunking method 决定文档如何被切分。错误的分块方式会造成语义丢失、表格错乱、上下文缺失或问答不匹配，最终影响检索召回和回答质量。

### RAGFlow 支持自定义 ingestion pipeline 吗？

支持。可以在 Agent 页面创建空白 agent，选择 Ingestion pipeline 并配置数据处理画布，然后在数据集配置中选择对应 pipeline 作为解析流程。

### 解析完成后为什么要检查 chunks？

因为复杂文档可能出现 OCR 错误、表格结构丢失、标题和正文切分不合理等问题。检查 chunk 页面可以提前发现问题，并通过人工修改、关键词、问题或标签进行干预。

### 可以手工干预 chunk 吗？

可以。RAGFlow 支持查看 chunk、快速预览快照，并对 chunk 文本、关键词、问题和标签做人工调整。给 chunk 添加关键词可以提高包含这些关键词的查询中的排序权重。

### PDF parser 有哪些选择？

官方 v0.26.0 文档提到的 PDF parser 包括 DeepDoc、Naive、MinerU、Docling、OpenDataLoader 和第三方视觉模型。选择取决于 PDF 是否为纯文本、是否包含图片、表格或复杂版式。

### DeepDoc 适合什么场景？

DeepDoc 是默认视觉模型，适合需要 OCR、表格结构识别和文档布局识别的复杂 PDF。代价是解析可能更耗时。

### Naive parser 适合什么场景？

Naive 会跳过 OCR、表格结构识别和布局识别，适合内容已经是纯文本的 PDF。它可以减少解析耗时，但不适合扫描件或复杂版式资料。

### Parent-child chunking 解决什么问题？

传统单层 chunk 同时承担精确召回和完整上下文两个目标，容易冲突。Parent-child chunking 用子 chunk 做精确召回，用父 chunk 补充完整上下文，从而兼顾召回精度和生成阶段的语义完整性。

## 六、检索测试与召回调优

### 为什么要在创建聊天助手前运行 retrieval test？

retrieval test 可以验证用户问题是否能召回预期 chunks。如果正确 chunk 都召回不到，后续 prompt 或模型参数再好也很难得到稳定答案。

### retrieval test 使用什么检索方式？

官方文档说明，普通 chunks 会使用混合搜索，组合关键词相似度与向量余弦相似度，或在启用 rerank 后组合关键词相似度与 rerank score。知识图谱构建出的 chunks 主要使用向量余弦相似度。

### Similarity threshold 是什么？

Similarity threshold 是召回过滤阈值。低于该相似度的 chunks 会被过滤。默认值为 `0.2`，表示相似度太低的结果不会进入最终候选。

### Vector similarity weight 是什么？

Vector similarity weight 控制向量相似度在综合分数中的权重。默认值为 `0.3`，另一部分通常由关键词相似度承担。调高它会更偏向语义相似，调低它会更偏向关键词匹配。

### retrieval test 中启用 rerank 会有什么影响？

启用 rerank 后，RAGFlow 会用 rerank score 参与综合评分，可能提升排序效果，但响应时间会显著增加。是否启用要结合延迟、成本和召回质量一起评估。

### Use knowledge graph 有什么作用？

启用知识图谱后，RAGFlow 会分析查询中的实体和关系，从图中召回相关实体、关系和社区报告，适合多跳问答。但它会增加 LLM 调用、token 消耗和响应时间。

### Cross-language search 适合什么场景？

Cross-language search 适合数据集包含多语言资料、用户查询语言和文档语言不一致的场景。它会把查询翻译到目标语言后检索，因此要确认目标语言确实存在于数据集中。

### retrieval test 调优后还要做什么？

如果在 retrieval test 页面临时调整了 similarity threshold、vector similarity weight 或其他参数，需要把有效参数应用到聊天助手或 Retrieval agent 组件中，否则不会自动影响最终聊天配置。

## 七、AI Chat 与 AI Search

### RAGFlow 的 AI Chat 是什么？

AI Chat 是基于一个或多个数据集的多轮聊天助手。每个助手可以配置数据集、提示词、检索参数、模型、引用展示和生成参数。

### 创建 AI Chat 前应完成哪些准备？

应先完成模型配置、数据集创建、文件上传、文件解析、chunk 检查和 retrieval test。这样可以确认知识来源和召回链路没有明显问题。

### Show quote 为什么重要？

Show quote 会让 RAGFlow 在回答中展示引用来源。它是 RAGFlow 的核心可解释性能力，可以帮助用户确认答案来自哪些文档或 chunks，而不是模型凭空生成。

### 未检索到答案时应该怎么配置？

如果希望回答严格限定在数据集中，应配置固定的未命中回复。如果留空，模型可能在未召回有效知识时自由发挥，从而增加幻觉风险。

### 多个数据集可以同时用于一个聊天助手吗？

可以，但要确保这些数据集使用相同的 embedding 模型。不同 embedding 模型生成的向量空间不可直接混用，否则会导致检索错误或系统报错。

### Top N 控制什么？

Top N 控制最多有多少个 chunks 被提供给 LLM 作为上下文。即使检索到更多结果，最终进入模型上下文的也只会是前 N 个。

### Multi-turn optimization 有什么作用？

Multi-turn optimization 会使用已有对话上下文优化当前用户查询，适合多轮追问。但它会额外消耗 LLM tokens，并可能增加回答延迟。

### Reasoning 配置有什么作用？

Reasoning 用于让支持推理的模型在遇到未知主题时进行更复杂的推理或 Deep research。它可以增强复杂问题处理能力，但也会增加耗时和成本。

### AI Search 和 AI Chat 有什么区别？

AI Search 是单轮搜索式问答，使用系统默认聊天模型和预定义混合检索策略，并把相关 chunks 按相似度列在答案下方。AI Chat 是可配置的多轮问答，可以选择模型、检索策略和高级 RAG 能力。

### 什么时候使用 AI Search？

AI Search 适合快速验证默认模型、数据集配置和基础检索策略。调试聊天助手时，可以先用 AI Search 对比基础召回效果。

### 什么时候使用 AI Chat？

AI Chat 适合正式问答场景，尤其是需要多轮对话、定制 prompt、引用展示、知识图谱、rerank、跨语言检索和具体模型参数的场景。

## 八、API 与集成

### RAGFlow API Key 有什么作用？

RAGFlow API Key 用于让 RAGFlow 服务端认证 HTTP、Python 或 MCP 请求。没有 API Key，就不能安全地从外部系统调用 RAGFlow 能力。

### 如何获取 RAGFlow API Key？

登录 RAGFlow UI 后，点击右上角头像进入配置页面，切换到 API 页面，然后生成或获取 API Key。API Key 应保存到环境变量或密钥管理系统中。

### RAGFlow 提供哪些 API 接入方式？

官方文档提供 HTTP API、Python API、OpenAI-compatible API 和 MCP 相关入口。HTTP API 适合跨语言系统调用，Python API 适合 Python 项目，OpenAI-compatible API 适合复用 OpenAI 风格客户端。

### API Key 应该如何保存？

API Key 不应写入 wiki、源码、日志或公开配置。推荐使用环境变量、部署平台密钥、Vault 或其他密钥管理方案。

### iframe 集成适合什么场景？

RAGFlow 支持将创建好的聊天助手通过 iframe 嵌入第三方网页。它适合快速把聊天能力嵌入内部系统或门户页面，但正式生产集成仍要考虑鉴权、权限和数据边界。

### HTTP API 和 Python API 应如何选择？

如果系统不是 Python，或需要跨语言服务调用，优先考虑 HTTP API。如果应用本身是 Python，且希望用 SDK 风格管理数据集、文件、会话和聊天能力，可以考虑 Python API。

## 九、实践排查

### RAGFlow 回答不准确时应该先排查哪里？

先排查 retrieval test 是否能召回正确 chunks。如果召回失败，应检查文件解析、分块方法、embedding 模型、相似度阈值、向量权重、rerank 和知识图谱设置。如果召回正确但回答错误，再排查 prompt、模型能力和生成参数。

### 文档解析很慢可能是什么原因？

可能是文档体积大、PDF 版式复杂、使用 DeepDoc 或第三方视觉模型、需要 OCR/表格结构识别、硬件资源不足或外部解析服务响应慢。纯文本 PDF 可考虑 Naive parser。

### PDF 解析效果不好怎么办？

先判断 PDF 是纯文本、扫描件还是复杂版式。纯文本可试 Naive，复杂版式可试 DeepDoc 或其他视觉解析模型。解析后要检查 chunks，必要时手工修正或调整分块策略。

### 检索召回不到正确内容怎么办？

检查文档是否成功解析、目标内容是否存在于 chunk 中、chunk 是否过大或过小、embedding 模型是否适合文档语言、similarity threshold 是否过高、关键词是否缺失，以及是否需要 rerank 或 parent-child chunking。

### 多语言资料检索效果差怎么办？

检查 embedding 模型是否支持相关语言，确认数据集中实际存在目标语言内容，并在 retrieval test 或聊天配置中尝试 cross-language search。

### 回答没有引用来源怎么办？

检查聊天助手是否开启 Show quote，确认问题确实召回了数据集中的 chunks。如果没有召回内容，模型可能无法展示有效引用。

### 模型出现幻觉怎么办？

优先设置未命中固定回复，避免模型在没有检索结果时自由发挥；其次调优 retrieval test，提高正确 chunks 的召回；再优化 prompt，要求模型只基于引用内容回答。

## 十、学习路线

### 新手学习 RAGFlow 应按什么顺序？

建议顺序是：完成 Docker 启动，配置模型，创建一个小数据集，上传少量典型文档，选择分块和解析方式，运行 retrieval test，创建 AI Chat，最后再尝试 AI Search、API 和更多高级能力。

### 学 RAGFlow 时最应该关注哪些概念？

最重要的是数据集、chunking method、embedding model、PDF parser、hybrid search、similarity threshold、vector similarity weight、rerank、knowledge graph、Show quote 和 API Key。

### RAGFlow 和 LLM Wiki 可以怎样结合？

LLM Wiki 负责把高价值资料先整理成稳定 Markdown 知识页面；RAGFlow 可以把这些 Markdown 或原始资料作为数据集，提供检索、问答和引用展示能力。前者强调知识整理，后者强调运行时问答。

### 一个 RAGFlow 最小可用验证应包含什么？

最小验证应包含：服务能启动，模型 Key 可用，数据集能创建，文件能解析，retrieval test 能召回正确 chunk，AI Chat 能基于引用回答，外部系统能通过 API Key 调用至少一个接口。

## 十一、资料来源

### 这些问答基于哪些资料？

- RAGFlow Quickstart：https://ragflow.io/docs/v0.26.0/
- RAGFlow Configure dataset：https://ragflow.io/docs/v0.26.0/configure_knowledge_base
- RAGFlow Select PDF parser：https://ragflow.io/docs/v0.26.0/select_pdf_parser
- RAGFlow Configure child chunking strategy：https://ragflow.io/docs/v0.26.0/configure_child_chunking_strategy
- RAGFlow Run retrieval test：https://ragflow.io/docs/v0.26.0/run_retrieval_test
- RAGFlow Start AI chat：https://ragflow.io/docs/v0.26.0/start_chat
- RAGFlow Search：https://ragflow.io/docs/v0.26.0/ai_search
- RAGFlow API Key：https://ragflow.io/docs/v0.26.0/acquire_ragflow_api_key
- RAGFlow HTTP API：https://ragflow.io/docs/v0.26.0/http_api_reference
- RAGFlow Python API：https://ragflow.io/docs/v0.26.0/python_api_reference
