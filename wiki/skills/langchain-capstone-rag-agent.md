---
title: LangChain 综合项目：RAG Agent
category: skills
tags:
  - LangChain
  - RAG
  - Agent
  - 项目
level: 项目
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - "[[wiki/references/langgraph-official-documentation|LangGraph 官方文档]]"
  - "[[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/quickstart
  - https://docs.langchain.com/oss/python/langchain/retrieval
  - https://docs.langchain.com/oss/python/langchain/structured-output
  - https://docs.langchain.com/langsmith/observability-quickstart
summary: LangChain 综合项目教学，目标是构建一个带检索工具、结构化输出、短期 memory 和 LangSmith trace 的学习型 RAG Agent。
provenance:
  extracted: 0.72
  inferred: 0.28
  ambiguous: 0.0
base_confidence: 0.84
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# LangChain 综合项目：RAG Agent

## 学习目标

- 把 LangChain 基础、工具调用、RAG、结构化输出和 LangSmith 串成一个项目。
- 构建一个能回答本 wiki LangChain 页面问题的学习型 agent。
- 输出结构化答案、来源和置信度。
- 用 trace 检查每次检索和工具调用。

## 先修知识

- [[wiki/skills/langchain-basic|LangChain 基础教学]]
- [[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]]
- [[wiki/skills/langchain-rag|LangChain RAG 教学]]
- [[wiki/skills/langchain-structured-output|LangChain 结构化输出教学]]
- [[wiki/skills/langchain-langsmith-observability|LangChain LangSmith 可观测性教学]]

## 核心概念

项目目标不是做一个复杂产品，而是把学习路径中的组件连接起来：

- Model：统一模型接口。
- Tool：搜索本地 wiki。
- RAG：把相关页面片段作为回答依据。
- Structured Output：返回 answer、sources、confidence。
- Memory：用 `thread_id` 保留学习对话。
- Trace：用 LangSmith 观察 agent 行为。

## 最小代码

```python
from pathlib import Path
from pydantic import BaseModel, Field

from langchain.agents import create_agent
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

class StudyAnswer(BaseModel):
    answer: str = Field(description="面向学习者的回答")
    sources: list[str] = Field(description="使用到的 wiki 页面路径")
    confidence: float = Field(ge=0, le=1, description="回答置信度")

@tool
def search_langchain_wiki(query: str) -> str:
    """Search LangChain study notes in the local wiki."""
    root = Path("wiki")
    hits: list[str] = []
    for path in root.rglob("*.md"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        if "LangChain" in text and any(term in text for term in query.split()):
            hits.append(f"{path}\n{text[:1200]}")
        if len(hits) >= 4:
            break
    return "\n\n---\n\n".join(hits) or "No matching wiki pages found."

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[search_langchain_wiki],
    response_format=StudyAnswer,
    checkpointer=InMemorySaver(),
    system_prompt=(
        "你是 LangChain 学习助手。回答前优先搜索本地 wiki。"
        "如果没有来源，降低 confidence，并说明不确定性。"
    ),
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "我应该先学 LangChain 还是 LangGraph？"}]},
    config={"configurable": {"thread_id": "langchain-study"}},
)

print(result["structured_response"])
```

## 常见错误

- 本地搜索工具过于粗糙，检索不到同义词。
- 输出 sources 写成自然语言，而不是可追踪路径。
- 没有开启 trace，无法确认 agent 是否真的检索。
- 把所有 wiki 页面一次性塞进上下文。
- 没有为回答不确定性设置格式和规则。

## 练习

1. 把 `search_langchain_wiki` 从关键词匹配改成向量检索。
2. 给输出 schema 增加 `next_steps: list[str]`。
3. 准备 10 个学习问题，用 LangSmith evaluation 比较两个 prompt。
4. 添加 Tavily 工具，让 agent 在本地 wiki 没有答案时搜索官方文档。
5. 写一页项目复盘，记录失败案例和改进方向。

## 检查清单

- 是否能从本地 wiki 检索 LangChain 页面。
- 是否能返回结构化 `StudyAnswer`。
- 是否能在 LangSmith trace 中看到工具调用。
- 是否能基于 sources 判断回答是否可信。
- 是否能用 evaluation 比较版本。

## Sources

- Wiki 来源页：[[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- Wiki 来源页：[[wiki/references/langgraph-official-documentation|LangGraph 官方文档]]
- Wiki 来源页：[[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]
- 原始资料：[Quickstart](https://docs.langchain.com/oss/python/langchain/quickstart)
- 原始资料：[Retrieval](https://docs.langchain.com/oss/python/langchain/retrieval)
- 原始资料：[Structured output](https://docs.langchain.com/oss/python/langchain/structured-output)
- 原始资料：[Tracing quickstart](https://docs.langchain.com/langsmith/observability-quickstart)

