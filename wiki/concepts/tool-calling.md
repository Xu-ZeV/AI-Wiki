---
title: Tool Calling
category: concepts
tags:
  - LangChain
  - Agent
  - 工具调用
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/tools
  - https://docs.langchain.com/oss/python/langchain/agents
summary: Tool Calling 是让模型在推理过程中调用外部函数、API、数据库或业务动作的机制，LangChain 用工具 schema 和 ToolRuntime 管理输入、状态和上下文。
provenance:
  extracted: 0.8
  inferred: 0.2
  ambiguous: 0.0
base_confidence: 0.88
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: core
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# Tool Calling

Tool Calling 是让 LLM 在对话过程中选择并调用外部能力的机制。工具可以是搜索、计算、数据库查询、业务 API、RAG 检索器或写入操作。

## LangChain 中的工具

在 LangChain 中，工具通常是带类型标注和说明文档的 Python 函数。`@tool` 装饰器会把函数转换为模型可理解的工具 schema。

```python
from langchain.tools import tool

@tool
def search_database(query: str, limit: int = 5) -> str:
    """Search internal documents by query."""
    return f"Found {limit} results for {query}"
```

模型看到的不是 Python 实现细节，而是工具名称、描述和参数 schema。因此工具命名、参数命名和 docstring 必须清晰。

## ToolRuntime

`ToolRuntime` 是 v1 中访问运行时信息的主要接口，可用于读取：

- state：当前线程的短期状态，例如 messages。
- context：本次调用传入的不可变上下文，例如 user_id。
- store：跨线程保存的长期记忆。
- stream_writer：工具执行中的自定义流式进度。
- execution_info：thread、run、retry 等执行信息。

## 设计原则

- 工具应该小而明确，不要把多个无关动作塞进一个工具。
- 对写入、删除、发邮件、支付等高风险动作加入人工确认或 guardrails。
- 工具输出要短、结构清楚，避免把大量原始文本直接塞回上下文。
- 工具失败时返回可诊断信息，不要伪造成成功结果。

## 相关页面

- [[wiki/concepts/langchain-agent-harness|LangChain Agent Harness]]
- [[wiki/concepts/context-engineering|Context Engineering]]
- [[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]]

