---
title: LiteLLM 面试问题
tags:
  - LiteLLM
  - 面试
source:
  - https://docs.litellm.ai/docs/
  - https://docs.litellm.ai/docs/proxy/quick_start
  - https://docs.litellm.ai/docs/routing
  - https://docs.litellm.ai/docs/proxy/virtual_keys
---
# LiteLLM 面试问题

## 基础概念

### 1. LiteLLM 解决了什么问题？

LiteLLM 把不同 LLM 供应商的接口统一成 OpenAI 兼容风格，降低应用接入多个模型时的适配成本。它既可以作为 Python SDK 使用，也可以作为 Proxy Server 统一管理团队的模型调用。

### 2. LiteLLM SDK 和 LiteLLM Proxy 有什么区别？

SDK 是应用代码直接引入 LiteLLM 后调用模型，适合简单服务或脚本。Proxy 是独立网关，对外暴露 OpenAI 兼容接口，适合集中治理密钥、模型、预算、限流、日志、Fallback 和团队权限。

### 3. 为什么生产环境更常用 Proxy？

Proxy 可以避免把真实供应商 API Key 分发给多个业务系统，还能统一做审计、预算、路由和访问控制。对企业来说，它更像一个 LLM API 网关。

### 4. `model_name` 和 `litellm_params.model` 有什么区别？

`model_name` 是 LiteLLM Proxy 对调用方暴露的名字。`litellm_params.model` 是后端真实供应商模型。这样可以让调用方依赖稳定名称，而不是直接依赖供应商模型名。

### 5. LiteLLM 为什么说自己兼容 OpenAI API？

它让调用方可以使用类似 OpenAI 的请求参数和响应结构，例如 `messages`、`model`、`stream` 等，并且 Proxy 可以被 OpenAI SDK 通过自定义 `base_url` 调用。

## 配置与实践

### 6. 一个最小 `config.yaml` 需要什么？

至少需要 `model_list`，其中每个模型包含对外 `model_name` 和 `litellm_params`。`litellm_params` 中通常包含真实模型名和 API Key。

### 7. 为什么 API Key 推荐写成环境变量引用？

这样可以避免密钥进入 Git 仓库，也方便不同环境使用不同密钥。配置文件可以保留结构，敏感值由运行环境注入。

### 8. 如何让一个对外模型名对应多个后端部署？

在 `model_list` 中配置多个相同 `model_name` 的条目，每个条目指向不同供应商、区域或部署。LiteLLM Router 可以在候选部署之间分配请求。

### 9. Fallback 的作用是什么？

Fallback 在主模型失败时自动尝试备用模型，用来降低供应商故障、限流或超时对业务的影响。

### 10. Fallback 有什么风险？

备用模型可能能力不同，导致输出质量、结构化格式、函数调用能力或成本发生变化。因此上线前要验证兼容性，并对高成本备用模型设置预算。

## 生产治理

### 11. Virtual Key 是什么？

Virtual Key 是 LiteLLM Proxy 发给调用方使用的代理密钥。它不等于供应商真实 API Key，而是用于识别调用方、控制权限、设置预算和追踪用量。

### 12. Virtual Key 应该按什么粒度创建？

通常按业务系统、团队、环境或项目创建。不要所有服务共用一个 Key，否则很难做审计、限额和故障定位。

### 13. 预算和限流有什么区别？

预算控制总成本或可用额度，限流控制单位时间内的请求数或 token 数。预算偏成本治理，限流偏稳定性治理。

### 14. LiteLLM 缓存适合什么场景？

适合重复请求较多、答案稳定、实时性要求不高的场景，例如测试、分类、固定知识问答或批处理任务。不适合强实时、强个性化或隐私敏感场景。

### 15. 生产环境应该观测哪些指标？

至少观测请求量、失败率、延迟、token 用量、成本、模型维度、Key 或团队维度、Fallback 次数、缓存命中率和供应商错误类型。

## 故障排查

### 16. 调用 LiteLLM Proxy 返回模型不存在，怎么排查？

先确认请求里的 `model` 是否等于配置中的 `model_name`，再检查 `config.yaml` 是否被正确加载，最后检查 Proxy 是否重启或热加载了最新配置。

### 17. 返回供应商认证错误，怎么排查？

检查环境变量是否存在、Proxy 进程是否能读取该变量、供应商 Key 是否有效、模型是否允许该 Key 访问，以及 Azure 等供应商是否配置了正确的 `api_base` 和 `api_version`。

### 18. 为什么同样请求有时变慢？

可能是路由到了不同后端、供应商限流、模型冷启动、网络波动、Fallback 触发、流式响应未及时消费，或日志和缓存系统增加了额外延迟。

### 19. 成本突然升高如何定位？

按 Virtual Key、团队、模型和时间窗口拆分用量，检查是否有新模型开放、Fallback 切到更贵模型、缓存失效、批处理重复运行或某个调用方异常重试。

### 20. 面试中如何一句话总结 LiteLLM 的价值？

LiteLLM 是一个 OpenAI 兼容的多模型接入层，可以把模型调用、供应商适配、路由、预算、权限和观测集中到一个统一网关里管理。

## 追问准备

- 如果面试官问“为什么不用业务代码直接调用供应商”，重点回答治理、密钥安全、可观测性和供应商解耦。
- 如果面试官问“Fallback 是否一定提升可靠性”，重点回答它提升可用性，但必须验证质量、格式兼容和成本。
- 如果面试官问“如何设计企业内部 LLM 网关”，可以按模型目录、Virtual Key、预算限流、路由 Fallback、日志观测、配置发布流程来回答。
