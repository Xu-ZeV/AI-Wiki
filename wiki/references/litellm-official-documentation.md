---
title: LiteLLM 官方文档
category: references
tags:
  - 来源摘要
  - LiteLLM
sources:
  - https://docs.litellm.ai/docs/
  - https://docs.litellm.ai/docs/proxy/quick_start
  - https://docs.litellm.ai/docs/proxy/configs
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
summary: LiteLLM 官方文档说明了 SDK、Proxy Server、Admin UI、Virtual Keys、路由、缓存、日志和团队治理等能力。
provenance:
  extracted: 0.86
  inferred: 0.14
  ambiguous: 0.0
base_confidence: 0.95
lifecycle: draft
lifecycle_changed: 2026-06-03
tier: supporting
created: 2026-06-03T18:48:00+08:00
updated: 2026-06-03T18:48:00+08:00
---
# LiteLLM 官方文档

来源：[LiteLLM Documentation](https://docs.litellm.ai/docs/)

## 摘要

LiteLLM 官方文档将 LiteLLM 定位为统一的多模型调用层：Python SDK 让应用用统一接口调用不同供应商模型，Proxy Server 则作为自托管 LLM Gateway，对外提供 OpenAI 兼容接口，并集中管理模型、Virtual Key、成本、日志和 Admin UI。

## 关键内容

- SDK 部分强调用统一的 `completion()` 接口调用 OpenAI、Anthropic、Vertex AI、Bedrock、Ollama、Azure OpenAI 等供应商。
- Proxy Server 部分强调自托管网关能力：OpenAI 兼容调用、统一模型配置、供应商密钥隔离、成本追踪、Virtual Keys 和 Admin UI。
- 路由与负载均衡文档用于理解同名模型多后端部署、Fallback 和供应商故障切换。
- Admin UI 相关文档覆盖模型管理、供应商凭据、Virtual Key、Teams、用量日志、SSO / RBAC 等生产治理入口。
- 缓存、日志和观测文档用于生产环境的成本控制、故障排查和审计。

## 原始资料

- [LiteLLM Documentation](https://docs.litellm.ai/docs/)
- [Proxy Quick Start](https://docs.litellm.ai/docs/proxy/quick_start)
- [Configuration](https://docs.litellm.ai/docs/proxy/configs)
- [Routing](https://docs.litellm.ai/docs/routing)
- [Virtual Keys](https://docs.litellm.ai/docs/proxy/virtual_keys)
- [Admin UI](https://docs.litellm.ai/docs/proxy/ui)
- [Admin UI SSO](https://docs.litellm.ai/docs/proxy/admin_ui_sso)
- [Provider Credentials](https://docs.litellm.ai/docs/proxy/ui_credentials)
- [Model Management](https://docs.litellm.ai/docs/proxy/ui_model_management)
- [Teams](https://docs.litellm.ai/docs/proxy/teams)
- [Logs / Usage](https://docs.litellm.ai/docs/proxy/ui_logs)
- [Caching](https://docs.litellm.ai/docs/proxy/caching)
- [Logging / Observability](https://docs.litellm.ai/docs/proxy/logging)

## 相关页面

- [[wiki/skills/litellm-basic|LiteLLM 基础教学]]
- [[wiki/skills/litellm-advanced|LiteLLM 进阶教学]]
- [[wiki/skills/litellm-interview-questions|LiteLLM 面试问题]]
