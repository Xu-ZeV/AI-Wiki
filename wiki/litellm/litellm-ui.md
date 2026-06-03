---
title: LiteLLM Admin UI 教学
tags:
  - LiteLLM
  - 教学
level: 实践
source:
  - https://docs.litellm.ai/docs/proxy/ui
  - https://docs.litellm.ai/docs/proxy/admin_ui_sso
  - https://docs.litellm.ai/docs/proxy/ui_credentials
  - https://docs.litellm.ai/docs/proxy/ui_model_management
  - https://docs.litellm.ai/docs/proxy/teams
  - https://docs.litellm.ai/docs/proxy/ui_logs
---
# LiteLLM Admin UI 教学

LiteLLM 的 UI 主要指 Proxy Server 自带的 Admin UI。它不是独立于 Proxy 的前端项目，而是服务于模型、密钥、团队、预算、日志和用量治理的管理界面。学习它时，应先把 LiteLLM 当作统一 LLM 网关，再理解 UI 只是这个网关的可视化控制台。

## 1. 适用场景

Admin UI 适合以下场景：

- 团队需要统一管理多个模型供应商，而不是让每个业务系统各自保存供应商 API Key。
- 需要给不同团队、项目或用户发放 Virtual Key。
- 需要查看请求日志、成本、用量和失败情况。
- 需要按团队或模型设置预算、限流和访问权限。
- 需要非开发人员参与模型开通、Key 管理或用量审计。

如果只是本地用 Python SDK 临时调用模型，通常不需要先学习 UI；如果要把 LiteLLM 做成团队网关，Admin UI 就是核心入口之一。

## 2. 启动前提

Admin UI 依赖 LiteLLM Proxy。最小流程是：

1. 安装并启动 LiteLLM Proxy。
2. 准备 `config.yaml`，至少声明一个可用模型。
3. 配置主密钥或管理凭据。
4. 打开 Proxy 对应的 Web 地址进入 UI。

示例配置：

```yaml
model_list:
  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
```

启动示例：

```bash
litellm --config config.yaml
```

Proxy 默认常见端口是 `4000`。启动后通常通过 `http://localhost:4000/ui` 进入管理界面。生产环境中应放在受控网络、反向代理或 SSO 后面，不要直接暴露到公网。

## 3. UI 核心功能

Admin UI 的学习重点不是页面按钮，而是背后的治理对象。

| 功能 | 作用 | 学习重点 |
| --- | --- | --- |
| 模型管理 | 新增、查看和调整 Proxy 暴露的模型 | 区分对外 `model_name` 与真实供应商模型 |
| Provider Credentials | 保存和复用供应商凭据 | 避免把明文密钥散落在业务系统中 |
| Virtual Keys | 给调用方发放 OpenAI 兼容 API Key | 绑定模型权限、预算、过期时间和团队 |
| Teams | 按团队组织用户、Key、预算和模型权限 | 让不同业务线独立治理成本和访问范围 |
| Logs / Usage | 查看调用日志、成本和用量 | 排查失败、审计成本、定位高消耗调用 |
| SSO / RBAC | 管理登录身份和角色权限 | 生产环境必须关注管理员边界 |

## 4. 推荐上手路径

先用一个最小模型配置启动 Proxy，确认 UI 可以打开；然后在 UI 中观察模型列表是否与 `config.yaml` 一致。第二步创建一个 Virtual Key，用该 Key 通过 OpenAI SDK 调用 Proxy，确认调用方不再需要真实供应商密钥。

接着创建团队，把 Virtual Key 归属到团队，并设置较小预算。用几次请求观察 Usage 和 Logs 页面，理解请求、token、成本和错误如何被记录。最后再学习 SSO、RBAC 和 Provider Credentials，把它们用于生产环境的身份和密钥治理。

## 5. Virtual Key 实践

Virtual Key 是 Admin UI 最常用的对象。它解决的是“谁可以调用哪些模型、能花多少钱、什么时候失效”的问题。

建议规则：

- 每个业务系统使用独立 Virtual Key。
- 开发、测试、生产环境使用不同 Key。
- 给临时实验 Key 设置过期时间。
- 给高成本模型设置更严格的预算和访问范围。
- 不把供应商真实 API Key 发给业务调用方。

调用侧示例：

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

print(response.choices[0].message.content)
```

这里的 `api_key` 是 LiteLLM 发放的 Virtual Key，不是 OpenAI、Anthropic 或其他供应商的原始密钥。

## 6. Provider Credentials

Provider Credentials 用来集中管理供应商凭据。它适合在 UI 中维护多组供应商认证信息，再让模型配置引用这些凭据。

实践上要注意：

- 凭据应该按供应商、环境和用途命名，避免后期无法判断来源。
- 生产凭据不要和测试凭据混用。
- 凭据轮换后，要验证依赖该凭据的模型仍能正常调用。
- 如果组织已有密钥管理系统，应优先与既有安全流程对齐。

## 7. 团队、预算与权限

团队治理是 Admin UI 从“个人工具”变成“组织网关”的关键。

常见设计方式：

- 按业务线建 Team，例如 `search`、`support`、`analytics`。
- 每个 Team 只开放实际需要的模型。
- 每个 Team 设置独立预算，避免一个团队耗尽全局额度。
- 管理员只负责平台级配置，团队管理员负责本团队 Key 和成员。

预算不是替代监控的工具。预算用于硬性约束成本，日志和告警用于解释成本为什么发生。

## 8. 日志与排障

Logs / Usage 页面适合回答这些问题：

- 某个 Key 最近是否在调用。
- 哪个模型成本最高。
- 请求失败是供应商错误、鉴权错误、限流错误还是配置错误。
- Fallback 是否发生。
- 某个团队是否接近预算上限。

排障时先按时间、Key、模型和错误类型缩小范围。若 UI 显示请求已经进入 Proxy，但供应商失败，应继续检查供应商密钥、模型名称、区域、配额和网络连通性。

## 9. 生产部署注意事项

- Admin UI 应启用身份认证，团队环境优先接入 SSO。
- 管理员权限要最小化，避免所有人都能修改模型和凭据。
- Proxy 和 UI 不应裸露在公网。
- 供应商密钥、主密钥和数据库连接信息应通过环境变量或密钥管理系统注入。
- 启用日志留存和成本统计前，应确认是否会记录敏感内容。
- 变更模型、凭据或预算后，应通过低风险请求验证。

## 10. 学习检查清单

- 能否启动 Proxy 并打开 Admin UI。
- 能否在 UI 中看到配置的模型。
- 能否创建 Virtual Key 并用 OpenAI SDK 调用 Proxy。
- 能否把 Key 归属到 Team 并设置预算。
- 能否通过 Logs / Usage 找到一次调用记录。
- 能否解释供应商真实 API Key、LiteLLM Master Key、Virtual Key 的区别。
- 能否说明为什么生产环境需要 SSO / RBAC。
