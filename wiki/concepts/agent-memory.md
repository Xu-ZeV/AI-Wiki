---
title: Agent Memory
category: concepts
tags:
  - LangChain
  - Agent
  - Memory
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/short-term-memory
  - https://docs.langchain.com/oss/python/langchain/agents
summary: Agent Memory 是 agent 保存和使用历史信息的机制，LangChain v1 区分单个线程内的短期 memory、checkpoint 和跨会话的长期 store。
provenance:
  extracted: 0.8
  inferred: 0.2
  ambiguous: 0.0
base_confidence: 0.88
lifecycle: draft
lifecycle_changed: 2026-06-07
tier: supporting
created: 2026-06-07T19:00:54+08:00
updated: 2026-06-07T19:00:54+08:00
---
# Agent Memory

Agent Memory 是 agent 保存和使用历史信息的机制。LangChain v1 中应区分短期 memory、checkpoint 和长期 store。

## 短期 memory

短期 memory 保存一个线程中的对话历史和状态。调用 agent 时传入同一个 `thread_id`，并配置 checkpointer，就可以在多轮调用之间保留上下文。

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[],
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "study-thread"}}
```

## 长期 memory

长期 memory 保存跨会话可复用的信息，例如用户偏好、项目资料或历史总结。它通常通过 store 实现，生产环境应使用持久化后端，而不是内存对象。

## 常见风险

- 对话历史过长会增加成本、延迟和上下文干扰。
- 把隐私信息长期保存前需要明确权限和清理策略。
- memory 不是 RAG 的替代品；文档知识仍应进入检索系统或 wiki。

## 相关页面

- [[wiki/concepts/langchain-agent-harness|LangChain Agent Harness]]
- [[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]]
- [[wiki/synthesis/langchain-v1-learning-path|LangChain v1 自学路径]]

