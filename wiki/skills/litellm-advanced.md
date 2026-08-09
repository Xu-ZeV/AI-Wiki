---
title: LiteLLM 进阶教学
category: skills
tags:
  - LiteLLM
  - 教学
level: 进阶
sources:
  - "[[wiki/references/litellm-official-documentation|LiteLLM 官方文档]]"
  - https://docs.litellm.ai/docs/routing
  - https://docs.litellm.ai/docs/proxy/virtual_keys
  - https://docs.litellm.ai/docs/proxy/ui
  - https://docs.litellm.ai/docs/proxy/admin_ui_sso
  - https://docs.litellm.ai/docs/proxy/ui_credentials
  - https://docs.litellm.ai/docs/proxy/ui_model_management
  - https://docs.litellm.ai/docs/proxy/teams
  - https://docs.litellm.ai/docs/proxy/ui_logs
  - https://docs.litellm.ai/docs/proxy/caching
  - https://docs.litellm.ai/docs/proxy/logging
summary: LiteLLM Proxy 的路由、Fallback、Virtual Key、预算、Admin UI 治理、缓存和可观测性教程。
provenance:
  extracted: 0.8
  inferred: 0.2
  ambiguous: 0.0
base_confidence: 0.85
lifecycle: draft
lifecycle_changed: 2026-06-03
tier: supporting
created: 2026-06-03T15:40:43+08:00
updated: 2026-06-03T18:48:00+08:00
---
# LiteLLM 进阶教学

## 1. 从单模型调用到 LLM 网关

进阶使用 LiteLLM 的关键，不是多会调用几个模型，而是把它当成 LLM 网关来设计：

- 模型治理：统一暴露模型名，屏蔽供应商差异。
- 流量治理：按团队、用户、Key、模型控制预算和速率。
- 可靠性治理：通过路由、重试和 Fallback 降低供应商故障影响。
- 成本治理：记录用量，控制预算，必要时把请求路由到更便宜的模型。
- 可观测性：记录请求、响应、错误、延迟、成本和用户维度。

## 2. 路由与负载均衡

LiteLLM Router 用于在多个部署之间分配请求。典型场景包括：

- 同一个模型在多个供应商或多个区域都有部署。
- 
。
- 想按成本、可用性或延迟选择候选模型。

配置示例：

```yaml
model_list:
  - model_name: customer-support
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY
    rpm: 100

  - model_name: customer-support
    litellm_params:
      model: azure/gpt-4o-mini
      api_key: os.environ/AZURE_API_KEY
      api_base: os.environ/AZURE_API_BASE
      api_version: "2024-02-15-preview"
    rpm: 100
```

调用方仍然请求 `customer-support`，LiteLLM 负责在后端候选部署之间选择。

## 3. Fallback 与重试

生产环境里，LLM 供应商可能出现超时、限流、区域故障或模型不可用。Fallback 的目标是：主模型失败时，自动切到备用模型。

设计 Fallback 时要注意：

- 备用模型能力要接近主模型，否则响应质量会不稳定。
- 对结构化输出、函数调用、JSON Schema 等场景，要验证备用模型是否兼容。
- Fallback 不应隐藏所有错误；关键错误仍要进入日志和告警。
- 对高成本备用模型要设置预算，避免故障期间成本失控。

示例思路：

```yaml
litellm_settings:
  fallbacks:
    - gpt-4o:
        - gpt-4o-mini
```

含义是当 `gpt-4o` 出现可回退错误时，尝试使用 `gpt-4o-mini`。

## 4. Virtual Keys、用户与团队

LiteLLM Proxy 可以用 Virtual Keys 管理调用方，而不是把供应商密钥发给每个业务系统。Virtual Key 的作用包括：

- 识别调用方。
- 绑定可访问模型。
- 设置预算。
- 设置过期时间。
- 关联团队、用户、项目或标签。
- 支持审计和用量统计。

推荐实践：

- 每个业务系统使用独立 Virtual Key。
- 不同环境使用不同 Key，例如 dev、staging、prod。
- 对高成本模型设置更严格预算。
- 对离职、废弃服务或临时实验 Key 设置过期时间。

Admin UI 中的 Virtual Keys、Teams 和用户管理适合把这些规则落到日常运维流程里。推荐按业务线创建团队，例如 `search`、`support`、`analytics`；每个团队只开放实际需要的模型，并设置独立预算，避免一个团队耗尽全局额度。

## 5. 预算与限流

预算控制解决“能花多少钱”，限流解决“单位时间能打多少请求”。两者都需要：

- 按团队或服务拆分。
- 对高成本模型单独设阈值。
- 为突发场景留出合理余量。
- 将超过预算和触发限流的事件写入日志或告警。

常见维度：

- `max_budget`：总预算。
- RPM：每分钟请求数。
- TPM：每分钟 token 数。
- 按模型限制：限制某些 Key 访问昂贵模型。
- 按团队限制：让不同团队互不影响。

## 6. Admin UI 治理能力

在生产环境里，Admin UI 主要承担治理入口，而不是替代配置文件或自动化发布流程。它的重点对象包括：

| 功能 | 作用 | 进阶关注点 |
| --- | --- | --- |
| 模型管理 | 新增、查看和调整 Proxy 暴露的模型 | 区分对外 `model_name` 与真实供应商模型 |
| Provider Credentials | 保存和复用供应商凭据 | 凭据按供应商、环境、用途命名，并纳入轮换流程 |
| Virtual Keys | 给调用方发放 OpenAI 兼容 API Key | 绑定模型权限、预算、过期时间和团队 |
| Teams | 按团队组织用户、Key、预算和模型权限 | 让不同业务线独立治理成本和访问范围 |
| Logs / Usage | 查看调用日志、成本和用量 | 排查失败、审计成本、定位高消耗调用 |
| SSO / RBAC | 管理登录身份和角色权限 | 限制管理员边界，避免所有人都能改模型和凭据 |

Provider Credentials 适合集中管理供应商密钥，再让模型配置或 UI 中的模型管理引用这些凭据。生产凭据不要和测试凭据混用；凭据轮换后，要验证依赖该凭据的模型仍能正常调用。

SSO / RBAC 是团队使用 Admin UI 的关键。Proxy 和 UI 不应裸露在公网；管理员权限要最小化；供应商密钥、主密钥和数据库连接信息应通过环境变量或密钥管理系统注入。

## 7. 缓存

缓存适合重复性高、确定性强、对实时性不敏感的请求。典型场景：

- 固定知识问答。
- 测试环境重复调用。
- 分类、抽取、改写等稳定任务。
- Prompt 和输入完全相同的批处理任务。

缓存设计要注意：

- 高温度生成内容不一定适合缓存。
- 涉及隐私、权限或强实时数据时要谨慎。
- 缓存命中能降成本，但也可能返回过期答案。
- 缓存 Key 应考虑模型、Prompt、参数和用户上下文。

## 8. 日志与可观测性

LiteLLM 的观测重点包括：

- 请求量、失败率、延迟。
- 每个模型、Key、团队、用户的 token 和成本。
- 供应商错误类型。
- Fallback 是否发生。
- 缓存命中率。
- 流式请求是否成功完成。

生产上建议接入日志、指标或第三方观测系统，并保留最少必要的请求上下文。对包含用户隐私的数据，应做脱敏或关闭内容日志。

Admin UI 的 Logs / Usage 页面适合快速回答这些问题：

- 某个 Key 最近是否在调用。
- 哪个模型成本最高。
- 请求失败是供应商错误、鉴权错误、限流错误还是配置错误。
- Fallback 是否发生。
- 某个团队是否接近预算上限。

排障时先按时间、Key、模型和错误类型缩小范围。若 UI 显示请求已经进入 Proxy，但供应商失败，应继续检查供应商密钥、模型名称、区域、配额和网络连通性。

## 9. 生产配置建议

- 对外模型名应稳定，不要直接暴露供应商内部部署名。
- 配置文件中只引用环境变量，不写明文密钥。
- 每个团队使用独立 Virtual Key。
- 主力模型至少配置一个兼容 Fallback。
- 为昂贵模型设置预算和访问权限。
- 为 Proxy 配置日志、错误告警和成本统计。
- Admin UI 应启用身份认证，团队环境优先接入 SSO。
- 管理员权限要最小化，避免所有人都能修改模型和凭据。
- 发布配置变更前，用低风险请求验证路由、Fallback 和权限。

## 10. 进阶练习

1. 配置同名模型的两个后端部署，验证路由是否工作。
2. 人为移除主模型密钥，验证 Fallback 是否触发。
3. 创建两个 Virtual Key，让它们访问不同模型。
4. 给测试 Key 设置低预算，观察预算耗尽后的行为。
5. 开启缓存，比较缓存前后的成本和延迟。
6. 接入日志系统，按模型和团队统计一天的用量。
7. 在 Admin UI 中创建团队、绑定 Key，并从 Logs / Usage 中追踪一次请求。

## Sources

- Wiki 来源页：[[wiki/references/litellm-official-documentation|LiteLLM 官方文档]]
- 原始资料：[Routing](https://docs.litellm.ai/docs/routing)
- 原始资料：[Virtual Keys](https://docs.litellm.ai/docs/proxy/virtual_keys)
- 原始资料：[Admin UI](https://docs.litellm.ai/docs/proxy/ui)
- 原始资料：[Admin UI SSO](https://docs.litellm.ai/docs/proxy/admin_ui_sso)
- 原始资料：[Provider Credentials](https://docs.litellm.ai/docs/proxy/ui_credentials)
- 原始资料：[Model Management](https://docs.litellm.ai/docs/proxy/ui_model_management)
- 原始资料：[Teams](https://docs.litellm.ai/docs/proxy/teams)
- 原始资料：[Logs / Usage](https://docs.litellm.ai/docs/proxy/ui_logs)
- 原始资料：[Caching](https://docs.litellm.ai/docs/proxy/caching)
- 原始资料：[Logging / Observability](https://docs.litellm.ai/docs/proxy/logging)
