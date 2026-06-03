---
title: LiteLLM 基础教学
tags:
  - LiteLLM
  - 教学
level: 基础
source:
  - https://docs.litellm.ai/docs/
  - https://docs.litellm.ai/docs/proxy/quick_start
  - https://docs.litellm.ai/docs/proxy/configs
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

## 5. 基础学习路线

建议按以下顺序学习：

1. 先用 Python SDK 跑通一次单模型调用。
2. 再用 Proxy Server 跑通 OpenAI SDK 到 LiteLLM Proxy 的调用。
3. 学会用 `config.yaml` 暴露多个模型。
4. 理解环境变量密钥管理，避免把真实 API Key 写死进仓库。
5. 进入进阶阶段后，再学习路由、Fallback、预算、限流和日志。

## 6. 常见错误

- 模型名写错：区分对外 `model_name` 和真实 `litellm_params.model`。
- 环境变量未加载：`os.environ/KEY_NAME` 依赖启动进程能读取该变量。
- 供应商参数混用：Azure、OpenAI、Anthropic 等供应商需要的参数不完全相同。
- Proxy 地址错误：业务 SDK 的 `base_url` 要指向 LiteLLM Proxy，而不是供应商原始地址。

## 7. 基础检查清单

- 能否用 SDK 直接调用一个模型。
- 能否通过 Proxy 调用同一个模型。
- `config.yaml` 是否只保存环境变量引用，不保存明文密钥。
- 对外模型名是否易懂、稳定。
- 是否记录了官方文档链接，方便后续升级时复查。
