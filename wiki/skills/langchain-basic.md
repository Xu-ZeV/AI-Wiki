---
title: LangChain 基础教学
category: skills
tags:
  - LangChain
  - 教程
  - Python
level: 基础
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/install
  - https://docs.langchain.com/oss/python/langchain/quickstart
  - https://docs.langchain.com/oss/python/langchain/models
  - https://docs.langchain.com/oss/python/langchain/messages
summary: LangChain v1 基础教学，覆盖安装、API Key、init_chat_model、messages 和最小 create_agent。
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
# LangChain 基础教学

## 学习目标

- 理解 [[wiki/entities/langchain|LangChain]] v1 的核心定位。
- 能安装 LangChain 和模型供应商集成包。
- 能用 `init_chat_model` 调用模型。
- 能区分 messages、model、tools 和 agent。
- 能创建一个最小 `create_agent`。

## 先修知识

- 会运行 Python 3.10+。
- 理解环境变量和 API Key。
- 了解 LLM 的基本聊天接口。

## 核心概念

LangChain v1 的入门顺序是：模型调用 -> messages -> 工具 -> agent。不要从旧版 chains 开始学。新项目优先使用 `create_agent` 和标准模型接口。

安装基础包：

```bash
pip install -U langchain
pip install -U "langchain[openai]"
```

常用环境变量：

```bash
export OPENAI_API_KEY="your-api-key"
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="your-langsmith-key"
```

## 最小代码

先直接调用模型：

```python
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage

model = init_chat_model("openai:gpt-5-mini")

messages = [
    SystemMessage("你是一个简洁的 Python 教学助手。"),
    HumanMessage("用三句话解释 LangChain v1。"),
]

response = model.invoke(messages)
print(response.content)
```

再创建最小 agent：

```python
from langchain.agents import create_agent

def get_weather(city: str) -> str:
    """Get weather for a city."""
    return f"{city}: sunny"

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[get_weather],
    system_prompt="你是一个会调用工具的助手。",
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "查询北京天气"}]
})

print(result["messages"][-1].content_blocks)
```

## 常见错误

- 把真实 API Key 写进代码或 wiki。
- 使用旧教程里的 `LLMChain` 作为新项目入口。
- 忘记安装模型供应商集成包。
- messages 结构混乱，把 system 指令和用户输入混在一个字符串里。
- 期待模型不用工具也能精确计算、检索或读取外部文件。

## 练习

1. 用 `init_chat_model` 调用一次模型，让它解释本地项目目标。
2. 写一个 `get_time_zone(city: str)` 假工具，并让 agent 调用它。
3. 修改 system prompt，让 agent 输出更短或更正式的回答。
4. 尝试开启 LangSmith tracing，观察一次 agent 调用记录。

## 检查清单

- 是否能安装 `langchain` 和一个模型供应商集成包。
- 是否能通过环境变量读取 API Key。
- 是否能用 messages 调用模型。
- 是否能创建并调用最小 agent。
- 是否理解 LangChain v1 不应从旧版 chains 入门。

## Sources

- Wiki 来源页：[[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- 原始资料：[Install LangChain](https://docs.langchain.com/oss/python/langchain/install)
- 原始资料：[Quickstart](https://docs.langchain.com/oss/python/langchain/quickstart)
- 原始资料：[Models](https://docs.langchain.com/oss/python/langchain/models)
- 原始资料：[Messages](https://docs.langchain.com/oss/python/langchain/messages)

