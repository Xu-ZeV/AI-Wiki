---
title: LangChain Agent Harness
category: concepts
tags:
  - LangChain
  - Agent
  - 概念
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/overview
  - https://docs.langchain.com/oss/python/langchain/agents
summary: LangChain v1 中的 agent harness 是模型循环外层的提示词、工具、middleware、状态和运行控制，主入口是 create_agent。
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
# LangChain Agent Harness

LangChain v1 可以用一个简化公式理解：

```text
Agent = Model + Tools + Harness
```

其中 Model 是语言模型，Tools 是模型可以调用的外部能力，Harness 是围绕模型循环的运行结构，包括 system prompt、工具列表、middleware、状态、memory、streaming 和终止条件。

## create_agent

`create_agent` 是当前 LangChain 构建 agent 的主入口。它创建一个基于 [[wiki/entities/langgraph|LangGraph]] 的 graph runtime，让模型在“读消息、决定是否调用工具、接收工具结果、继续推理或结束”的循环中工作。

最小结构：

```python
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"{city}: sunny"

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[get_weather],
    system_prompt="You are a helpful assistant.",
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "上海天气如何？"}]
})
```

## 学习要点

- 先理解 agent loop，再学习 middleware、memory 和 LangGraph。
- 工具名称、参数类型和 docstring 会影响模型是否正确调用工具。
- `create_agent` 已经足够覆盖很多项目；只有需要精细图编排时才进入 LangGraph。
- LangSmith trace 是理解 harness 行为的最佳辅助材料。

## 相关页面

- [[wiki/entities/langchain|LangChain]]
- [[wiki/concepts/tool-calling|Tool Calling]]
- [[wiki/concepts/agent-memory|Agent Memory]]
- [[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]]

