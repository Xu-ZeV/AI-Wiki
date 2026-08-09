---
title: LangChain 结构化输出教学
category: skills
tags:
  - LangChain
  - 教程
  - 结构化输出
level: 进阶
sources:
  - "[[wiki/references/langchain-official-documentation|LangChain 官方文档]]"
  - https://docs.langchain.com/oss/python/langchain/structured-output
summary: LangChain 结构化输出教学，覆盖 Pydantic schema、response_format、ProviderStrategy、ToolStrategy、校验失败和重试。
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
# LangChain 结构化输出教学

## 学习目标

- 理解 [[wiki/concepts/structured-output|Structured Output]]。
- 能用 Pydantic 定义输出 schema。
- 能通过 `response_format` 让 agent 返回结构化结果。
- 能解释 ProviderStrategy 与 ToolStrategy 的区别。
- 能处理 schema 校验失败和多结构输出错误。

## 先修知识

- 已完成 [[wiki/skills/langchain-basic|LangChain 基础教学]]。
- 会写 Python 类型标注。
- 了解 JSON 和 Pydantic 的基础用法。

## 核心概念

结构化输出适合把 agent 结果交给程序继续处理。LangChain 会把最终结构化结果放在 `structured_response` 中。直接传入 schema 类型时，LangChain 会根据模型能力选择供应商原生结构化输出或工具调用策略。

## 最小代码

```python
from pydantic import BaseModel, Field
from langchain.agents import create_agent

class ContactInfo(BaseModel):
    name: str = Field(description="联系人姓名")
    email: str = Field(description="邮箱地址")
    phone: str | None = Field(default=None, description="电话号码")

agent = create_agent(
    model="openai:gpt-5-mini",
    tools=[],
    response_format=ContactInfo,
    system_prompt="你负责从文本中提取联系人信息。",
)

result = agent.invoke({
    "messages": [{
        "role": "user",
        "content": "张三，邮箱 zhangsan@example.com，电话 13800000000"
    }]
})

print(result["structured_response"])
```

用于 RAG 答案的结构：

```python
class RagAnswer(BaseModel):
    answer: str
    sources: list[str]
    confidence: float = Field(ge=0, le=1)
```

## 常见错误

- 字段描述过于抽象，模型不知道如何填。
- schema 太复杂，初学阶段难以调试。
- 把结构化输出当成事实校验；它只保证格式，不保证内容真实。
- 忽略 `structured_response`，仍从最后一条自然语言消息解析 JSON。
- 使用不支持结构化输出或工具调用的模型，却没有准备 fallback。

## 练习

1. 定义一个 `TodoItem` schema，抽取任务、负责人、截止日期。
2. 定义一个 `RagAnswer` schema，要求输出答案和来源列表。
3. 故意输入缺少字段的文本，观察模型如何补全或失败。
4. 给字段加枚举类型，比较输出稳定性。

## 检查清单

- 是否能用 Pydantic 写出清晰 schema。
- 是否能从 `result["structured_response"]` 读取结构化结果。
- 是否能解释 ProviderStrategy 和 ToolStrategy。
- 是否知道结构化输出不等于事实正确。
- 是否能把结构化输出用于 RAG 或业务接口。

## Sources

- Wiki 来源页：[[wiki/references/langchain-official-documentation|LangChain 官方文档]]
- 原始资料：[Structured output](https://docs.langchain.com/oss/python/langchain/structured-output)

