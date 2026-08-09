---
title: LangChain Agent 与工具教学
category: skills
tags:
  - LangChain
  - Agent
  - 教程
level: 进阶
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/agents
  - https://docs.langchain.com/oss/python/langchain/tools
  - https://docs.langchain.com/oss/python/langchain/short-term-memory
  - https://docs.langchain.com/oss/python/langchain/streaming
  - https://docs.langchain.com/oss/python/langchain/middleware
summary: LangChain Agent 与工具教学，覆盖 create_agent、@tool、ToolRuntime、memory、streaming、middleware 和错误处理。
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
# LangChain Agent 与工具教学

## 学习目标

- 理解 [[wiki/concepts/langchain-agent-harness|LangChain Agent Harness]]。
- 能用 `@tool` 定义工具。
- 能让工具读取运行时 state/context。
- 能给 agent 加入短期 memory。
- 能解释 streaming 和 middleware 的用途。

## 先修知识

- 已完成 [[wiki/skills/langchain-basic|LangChain 基础教学]]。
- 会写 Python 函数和类型标注。
- 理解工具调用可能失败，需要错误处理。

## 核心概念

Agent 的循环是：模型读取 messages，决定是否调用工具，工具返回结果，模型继续推理，直到给出最终答复。工具的名称、参数和 docstring 会进入模型上下文，因此它们就是 prompt 的一部分。

`ToolRuntime` 用来访问 state、context、store、stream_writer 和执行信息。生产项目中，工具不应直接依赖全局变量来识别用户或会话，而应通过 runtime context 读取。

## 最小代码

```python
from dataclasses import dataclass

from langchain.agents import create_agent
from langchain.tools import ToolRuntime, tool
from langgraph.checkpoint.memory import InMemorySaver

@dataclass
class UserContext:
    user_id: str

@tool
def lookup_order(order_id: str, runtime: ToolRuntime[UserContext]) -> str:
    """Look up an order by order id."""
    user_id = runtime.context.user_id
    return f"user={user_id}, order={order_id}, status=shipped"

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[lookup_order],
    context_schema=UserContext,
    checkpointer=InMemorySaver(),
    system_prompt="你是订单客服助手，只能基于工具结果回答。",
)

result = agent.invoke(
    {"messages": [{"role": "user", "content": "订单 A100 到哪了？"}]},
    config={"configurable": {"thread_id": "order-demo"}},
    context=UserContext(user_id="u-123"),
)

print(result["messages"][-1].content_blocks)
```

## 常见错误

- 工具 docstring 太模糊，模型不知道何时调用。
- 工具返回过长原始文本，污染后续上下文。
- 把 `runtime`、`config` 等保留名作为普通工具参数。
- 忽略同一 `thread_id` 和 checkpointer 的对应关系。
- 对写操作缺少人工审批、权限检查或日志。
- middleware 过早复杂化，导致初学阶段难以定位问题。

## 练习

1. 写一个 `calculator(expression: str)` 工具，并限制只允许安全表达式。
2. 写一个读取 `runtime.context.user_id` 的用户资料工具。
3. 给 agent 加入 `InMemorySaver`，用同一个 `thread_id` 做两轮对话。
4. 让工具在失败时返回错误说明，再观察模型如何处理。
5. 阅读 middleware 文档，记录它适合插入哪些控制逻辑。

## 检查清单

- 是否能解释工具 schema 从哪里来。
- 是否能写出带类型标注和清晰 docstring 的工具。
- 是否能区分 state、context、store。
- 是否能通过 `thread_id` 保存多轮对话。
- 是否知道什么时候需要 middleware。

## Sources

- Wiki 来源页：[[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- 原始资料：[Agents](https://docs.langchain.com/oss/python/langchain/agents)
- 原始资料：[Tools](https://docs.langchain.com/oss/python/langchain/tools)
- 原始资料：[Short-term memory](https://docs.langchain.com/oss/python/langchain/short-term-memory)
- 原始资料：[Streaming](https://docs.langchain.com/oss/python/langchain/streaming)
- 原始资料：[Middleware](https://docs.langchain.com/oss/python/langchain/middleware)

