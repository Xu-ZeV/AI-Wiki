---
title: LangChain LangSmith 可观测性教学
category: skills
tags:
  - LangChain
  - LangSmith
  - 教程
  - 可观测性
level: 进阶
sources:
  - "[[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]"
  - https://docs.langchain.com/langsmith/observability-quickstart
  - https://docs.langchain.com/langsmith/evaluation-quickstart
  - https://docs.langchain.com/langsmith/evaluation
summary: LangChain LangSmith 可观测性教学，覆盖 tracing、dataset、target function、evaluator、experiment 和版本比较。
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
# LangChain LangSmith 可观测性教学

## 学习目标

- 理解 [[wiki/entities/langsmith|LangSmith]] 在 LangChain 项目中的作用。
- 能开启 LangSmith tracing。
- 能用 trace 调试 agent 和工具调用。
- 能理解 dataset、target function、evaluator、experiment。
- 能用 evaluation 比较 prompt 或模型版本。

## 先修知识

- 已完成 [[wiki/skills/langchain-agents-tools|LangChain Agent 与工具教学]]。
- 能运行一个 LangChain agent。
- 拥有 LangSmith API Key。

## 核心概念

Tracing 解决“这次请求内部发生了什么”。Evaluation 解决“这个版本整体表现是否更好”。LangSmith 把模型调用、工具调用、输入输出和错误记录成 trace，并用 dataset 和 evaluator 运行实验。

## 最小代码

开启 tracing：

```bash
export LANGSMITH_TRACING="true"
export LANGSMITH_API_KEY="your-langsmith-key"
export LANGSMITH_PROJECT="langchain-study"
```

运行任意 LangChain agent 后，在 LangSmith 项目中检查：

- 模型输入和输出。
- 工具是否被调用。
- 工具参数是否正确。
- 检索结果是否进入上下文。
- 失败发生在哪一步。

最小 evaluation 概念结构：

```python
def target(inputs: dict) -> dict:
    result = agent.invoke({
        "messages": [{"role": "user", "content": inputs["question"]}]
    })
    return {"answer": result["messages"][-1].content}

def exact_or_contains(outputs: dict, reference_outputs: dict) -> bool:
    return reference_outputs["answer"] in outputs["answer"]
```

真实项目可用 LangSmith SDK 创建 dataset、写入 examples，再运行 evaluator。

## 常见错误

- 只看最终答案，不看 trace 中的工具参数和检索上下文。
- 没有给实验设置稳定 dataset，导致版本比较不可重复。
- 把单次成功当成整体质量提升。
- evaluator 标准太模糊，无法定位失败原因。
- 把包含隐私的原始输入直接发送到外部观测平台前未做评估。

## 练习

1. 开启 tracing，运行 [[wiki/skills/langchain-basic|LangChain 基础教学]] 的最小 agent。
2. 故意让工具返回错误，查看 trace 中错误如何呈现。
3. 准备 5 条问答样例，作为手工 dataset。
4. 比较两个 system prompt 的回答质量。
5. 记录一个失败案例，并说明下一版如何修复。

## 检查清单

- 是否能开启 LangSmith tracing。
- 是否能在 trace 中找到模型调用和工具调用。
- 是否能解释 dataset、target function、evaluator、experiment。
- 是否能用同一组样例比较两个版本。
- 是否考虑了隐私和数据保留问题。

## Sources

- Wiki 来源页：[[wiki/references/langsmith-official-documentation|LangSmith 官方文档]]
- 原始资料：[Tracing quickstart](https://docs.langchain.com/langsmith/observability-quickstart)
- 原始资料：[Evaluation quickstart](https://docs.langchain.com/langsmith/evaluation-quickstart)
- 原始资料：[LangSmith Evaluation](https://docs.langchain.com/langsmith/evaluation)

