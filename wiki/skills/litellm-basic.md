---
title: LiteLLM 基础教学
category: skills
tags:
  - LiteLLM
  - 教学
level: 基础
sources:
  - "[[wiki/references/litellm-official-documentation|LiteLLM 官方文档]]"
  - https://docs.litellm.ai/docs/
  - https://docs.litellm.ai/docs/proxy/quick_start
  - https://docs.litellm.ai/docs/proxy/configs
  - https://docs.litellm.ai/docs/proxy/ui
summary: LiteLLM 的 SDK、Proxy Server、基础配置和 Admin UI 入门教程。
provenance:
  extracted: 0.82
  inferred: 0.18
  ambiguous: 0.0
base_confidence: 0.85
lifecycle: draft
lifecycle_changed: 2026-06-03
tier: supporting
created: 2026-06-03T15:40:43+08:00
updated: 2026-06-03T18:48:00+08:00
---
# LiteLLM 基础教学

## 1. LiteLLM 是什么

LiteLLM 的核心价值是把不同大模型供应商的接口统一成 OpenAI 兼容风格。应用侧可以用相近的 `messages`、`model`、`temperature`、`stream` 等参数调用 OpenAI、Azure OpenAI、Anthropic、Google、AWS Bedrock、Cohere、Ollama 等模型，减少多供应商接入时的适配成本。

LiteLLM 常见有两种使用方式：

- Python SDK：适合在 Python 应用里直接调用模型。
- LiteLLM Proxy Server：适合作为团队或组织的统一 LLM 网关，对外暴露 OpenAI 兼容 API，并集中管理模型、密钥、预算、日志、路由和权限。

## 2. 最小调用模型

Python SDK 的基本思路是：安装 LiteLLM，配置供应商密钥，然后调用 `completion`。

```python
from litellm import completion

response = completion(
    model="openai/gpt-4o-mini",
    messages=[
        {"role": "user", "content": "用三句话解释 LiteLLM。"}
    ],
)

print(response.choices[0].message.content)
```

关键点：

- `model` 通常由供应商前缀和模型名组成，例如 `openai/...`、`anthropic/...`。
- `messages` 使用 OpenAI Chat Completions 风格。
- 返回结构尽量保持 OpenAI 兼容，便于复用已有业务代码。

## 3. Proxy Server 入门

Proxy Server 是 LiteLLM 在生产场景更常见的入口。它让业务系统不用直接保存各供应商密钥，而是调用一个内部网关。

典型流程：

1. 安装 LiteLLM。
2. 编写 `config.yaml`，声明模型列表和供应商参数。
3. 启动 `litellm --config config.yaml`。
4. 应用用 OpenAI SDK 或 HTTP 请求调用 LiteLLM Proxy。

最小 `config.yaml` 示例：

```yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
```

启动后，业务侧可以把 OpenAI SDK 的 `base_url` 指向 LiteLLM Proxy。

```python
from openai import OpenAI

client = OpenAI(
    api_key="anything-or-virtual-key",
    base_url="http://localhost:4000",
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "你好"}],
)
```

## 4. 配置文件的基本结构

LiteLLM Proxy 的配置核心是 `model_list`。每个条目通常包含：

- `model_name`：对外暴露给调用方的模型名。
- `litellm_params.model`：真实供应商模型名。
- `litellm_params.api_key`：供应商 API Key，推荐从环境变量读取。
- 其他供应商参数：例如 `api_base`、`api_version`、`rpm`、`tpm` 等。

示例：

```yaml
model_list:
  - model_name: fast-chat
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

  - model_name: strong-chat
    litellm_params:
      model: anthropic/claude-3-5-sonnet-latest
      api_key: os.environ/ANTHROPIC_API_KEY
```

这样应用侧只需要选择 `fast-chat` 或 `strong-chat`，不必理解背后的供应商细节。

## 5. Admin UI 入门

LiteLLM Proxy 自带 Admin UI。它不是独立的调用方式，而是 Proxy 的可视化管理入口，用来查看模型、创建 Virtual Key、观察用量和做基础管理。学习顺序上，应先跑通 Proxy，再打开 UI。

最小前提：

1. 已经能通过 `litellm --config config.yaml` 启动 Proxy。
2. `config.yaml` 中至少有一个可用模型。
3. 已配置管理密钥或登录方式。
4. 浏览器打开 `http://localhost:4000/ui`。

示例配置可以在基础 `model_list` 之外增加主密钥：

```yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

上手时重点看三个对象：

- Models：确认 UI 中显示的模型是否与 `config.yaml` 一致。
- Virtual Keys：给业务调用方创建 LiteLLM 侧的 API Key。
- Usage / Logs：确认一次请求是否被记录，并查看 token、成本和错误信息。

调用侧仍然使用 OpenAI 兼容 SDK，只是 `api_key` 换成 LiteLLM 发放的 Virtual Key，`base_url` 指向 Proxy。

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-litellm-virtual-key",
    base_url="http://localhost:4000",
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "用一句话解释 LiteLLM Admin UI"}],
)
```

这里的 Virtual Key 不是 OpenAI、Anthropic 或其他供应商的真实 API Key。它由 LiteLLM Proxy 管理，用于识别调用方并承载后续预算、权限和审计规则。

## 6. 基础学习路线

建议按以下顺序学习：

1. 先用 Python SDK 跑通一次单模型调用。
2. 再用 Proxy Server 跑通 OpenAI SDK 到 LiteLLM Proxy 的调用。
3. 学会用 `config.yaml` 暴露多个模型。
4. 打开 Admin UI，确认模型列表，并创建一个 Virtual Key。
5. 理解环境变量密钥管理，避免把真实 API Key 写死进仓库。
6. 进入进阶阶段后，再学习路由、Fallback、预算、限流和日志。

## 7. 常见错误

- 模型名写错：区分对外 `model_name` 和真实 `litellm_params.model`。
- 环境变量未加载：`os.environ/KEY_NAME` 依赖启动进程能读取该变量。
- 供应商参数混用：Azure、OpenAI、Anthropic 等供应商需要的参数不完全相同。
- Proxy 地址错误：业务 SDK 的 `base_url` 要指向 LiteLLM Proxy，而不是供应商原始地址。
- 把密钥类型混淆：供应商 API Key、LiteLLM Master Key、Virtual Key 的用途不同。

## 8. 基础检查清单

- 能否用 SDK 直接调用一个模型。
- 能否通过 Proxy 调用同一个模型。
- 能否打开 Admin UI 并看到配置的模型。
- 能否创建 Virtual Key，并用它通过 OpenAI SDK 调用 Proxy。
- `config.yaml` 是否只保存环境变量引用，不保存明文密钥。
- 对外模型名是否易懂、稳定。
- 是否记录了官方文档链接，方便后续升级时复查。

## Sources

- Wiki 来源页：[[wiki/references/litellm-official-documentation|LiteLLM 官方文档]]
- 原始资料：[LiteLLM Documentation](https://docs.litellm.ai/docs/)
- 原始资料：[Proxy Quick Start](https://docs.litellm.ai/docs/proxy/quick_start)
- 原始资料：[Configuration](https://docs.litellm.ai/docs/proxy/configs)
- 原始资料：[Admin UI](https://docs.litellm.ai/docs/proxy/ui)
