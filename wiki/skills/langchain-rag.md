---
title: LangChain RAG 教学
category: skills
tags:
  - LangChain
  - RAG
  - 教程
level: 进阶
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/retrieval
summary: LangChain RAG 教学，覆盖 loader、splitter、embedding、vector store、retriever、2-step RAG、Agentic RAG 和 Hybrid RAG。
provenance:
  extracted: 0.79
  inferred: 0.21
  ambiguous: 0.0
base_confidence: 0.87
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangChain RAG 教学

## 学习目标

- 理解 [[wiki/concepts/retrieval-augmented-generation|Retrieval-Augmented Generation]]。
- 能描述 RAG 的基础组件。
- 能搭建最小 2-step RAG。
- 能判断何时使用 Agentic RAG。
- 能把 Tavily 或 wiki 文档作为外部知识来源。

## 先修知识

- 已完成 [[wiki/skills/langchain-basic|LangChain 基础教学]]。
- 了解 embedding 和向量相似度搜索的基本含义。
- 会处理本地文本或 Markdown 文档。

## 核心概念

RAG 的目标不是让模型“记住所有资料”，而是在问题发生时检索相关上下文，再把上下文提供给模型。LangChain 文档把检索组件拆成 document loaders、text splitters、embedding models、vector stores 和 retrievers。

三种常见架构：

- 2-step RAG：固定先检索再生成。
- Agentic RAG：agent 自己决定是否检索、调用哪个检索工具、是否多次检索。
- Hybrid RAG：在固定检索和 agent 决策之间加入验证、重排或补充检索。

## 最小代码

下面是概念化示例，实际 vector store 和 embedding 包按项目选择安装。

```python
from langchain.chat_models import init_chat_model

model = init_chat_model("openai:gpt-5-mini")

def retrieve(query: str) -> list[str]:
    """Return relevant chunks from a local knowledge base."""
    return [
        "LangChain v1 的主入口是 create_agent。",
        "LangGraph 是底层状态图运行时。",
    ]

question = "LangChain 和 LangGraph 有什么区别？"
docs = retrieve(question)
context = "\n\n".join(docs)

response = model.invoke([
    {"role": "system", "content": "只基于给定上下文回答。"},
    {"role": "user", "content": f"上下文：\n{context}\n\n问题：{question}"},
])

print(response.content)
```

把检索器作为 agent 工具：

```python
from langchain.agents import create_agent
from langchain.tools import tool

@tool
def search_wiki(query: str) -> str:
    """Search local wiki pages for LangChain knowledge."""
    return "\n".join(retrieve(query))

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[search_wiki],
    system_prompt="回答前先判断是否需要搜索 wiki。",
)
```

## 常见错误

- chunk 太大，导致检索结果塞不进上下文。
- 没有保存来源，回答不可追溯。
- 检索结果版本混乱，把过期文档和当前文档混用。
- 把所有文档都传给模型，失去 RAG 的意义。
- Agentic RAG 没有限制工具调用次数，导致延迟和成本失控。

## 练习

1. 用 3 个本地 Markdown 文件构造一个最小知识库。
2. 手写一个关键词检索器，先验证 2-step RAG 流程。
3. 换成向量检索器，并比较结果差异。
4. 把检索器注册成工具，让 agent 决定是否调用。
5. 在输出中强制包含来源字段。

## 检查清单

- 是否能解释 loader、splitter、embedding、vector store、retriever 的职责。
- 是否能跑通一次 2-step RAG。
- 是否知道 Agentic RAG 的延迟和不确定性风险。
- 是否给检索结果保留来源。
- 是否能把检索器作为 LangChain 工具接入 agent。

## Sources

- Wiki 来源页：[[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- 原始资料：[Retrieval](https://docs.langchain.com/oss/python/langchain/retrieval)

