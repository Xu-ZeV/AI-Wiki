---
title: Tavily 官方文档
category: references
tags:
  - 来源摘要
  - Tavily
sources:
  - https://docs.tavily.com/welcome
  - https://docs.tavily.com/documentation/quickstart
  - https://docs.tavily.com/documentation/api-reference/endpoint/search
  - https://docs.tavily.com/documentation/api-reference/endpoint/extract
  - https://docs.tavily.com/documentation/api-reference/endpoint/crawl
  - https://docs.tavily.com/documentation/api-reference/endpoint/map
  - https://docs.tavily.com/documentation/api-reference/endpoint/research
  - https://docs.tavily.com/sdk/python/quick-start
  - https://docs.tavily.com/sdk/javascript/quick-start
  - https://help.tavily.com/articles/4840311948-tavily-search-api
summary: Tavily 官方文档说明了面向 AI Agent 和 LLM 应用的 Search、Extract、Crawl、Map、Research API，以及 Python 和 JavaScript SDK 的接入方式。
provenance:
  extracted: 0.86
  inferred: 0.14
  ambiguous: 0.0
base_confidence: 0.95
lifecycle: draft
lifecycle_changed: 2026-06-06
tier: supporting
created: 2026-06-06T22:48:26+08:00
updated: 2026-06-06T22:48:26+08:00
---
# Tavily 官方文档

来源：[Tavily Docs](https://docs.tavily.com/welcome)

## 摘要

Tavily 官方文档将 Tavily 定位为面向开发者、AI Agent 和 LLM 应用的网页搜索与内容处理 API。它提供 Search、Extract、Crawl、Map 和 Research 等端点，也提供 Python SDK `tavily-python` 和 JavaScript SDK `@tavily/core`。

## 关键内容

- Search API 用于执行网页搜索，可控制 `search_depth`、`max_results`、`topic`、`time_range`、`include_answer`、`include_raw_content`、`include_images`、`include_domains` 和 `exclude_domains` 等参数。
- Extract API 用于从指定 URL 抽取正文内容，适合在已经知道目标网页时获取干净文本或 Markdown。
- Crawl API 用于从一个根 URL 开始抓取站点内容，可通过自然语言 `instructions`、深度、广度、路径和域名过滤控制采集范围。
- Map API 用于发现站点下的 URL 列表，适合在抓取前理解网站结构。
- Research API 用于围绕一个问题执行多轮搜索、来源分析和报告生成，适合复杂研究任务。
- SDK 文档给出 Python 和 JavaScript 的最小安装与调用方式，API Key 使用 `tvly-...` 形式传入客户端或 HTTP Bearer 认证头。

## 原始资料

- [Tavily Docs Welcome](https://docs.tavily.com/welcome)
- [Quickstart](https://docs.tavily.com/documentation/quickstart)
- [Tavily Search](https://docs.tavily.com/documentation/api-reference/endpoint/search)
- [Tavily Extract](https://docs.tavily.com/documentation/api-reference/endpoint/extract)
- [Tavily Crawl](https://docs.tavily.com/documentation/api-reference/endpoint/crawl)
- [Tavily Map](https://docs.tavily.com/documentation/api-reference/endpoint/map)
- [Tavily Research](https://docs.tavily.com/documentation/api-reference/endpoint/research)
- [Python SDK Quickstart](https://docs.tavily.com/sdk/python/quick-start)
- [JavaScript SDK Quickstart](https://docs.tavily.com/sdk/javascript/quick-start)
- [What is the Tavily Search API?](https://help.tavily.com/articles/4840311948-tavily-search-api)

## 相关页面

- [[wiki/entities/tavily|Tavily]]
- [[wiki/skills/tavily-basic|Tavily 基础使用]]

