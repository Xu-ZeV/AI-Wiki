---
title: Tavily
category: entities
tags:
  - 工具
  - AI
  - 搜索
  - API
aliases:
  - Tavily Search API
  - Tavily API
sources:
  - "[[wiki/references/tavily-official-documentation|Tavily 官方文档]]"
  - https://docs.tavily.com/welcome
  - https://help.tavily.com/articles/4840311948-tavily-search-api
summary: Tavily 是面向开发者、AI Agent 和 LLM 应用的网页搜索与内容处理 API，用于把实时网页信息整理成适合模型消费的结构化结果。
created: 2026-06-06T22:48:26+08:00
updated: 2026-06-06T22:48:26+08:00
---
# Tavily

Tavily 是一个面向 AI 应用的网页搜索和网页内容处理工具。它通常不是直接面向终端用户的搜索产品，而是通过 API 给 [[wiki/concepts/llm-wiki|LLM Wiki]]、RAG 系统、AI Agent 或自动化研究流程提供实时网页资料。

## 核心定位

Tavily 的价值在于把“搜索、抓取、过滤、排序、抽取”压缩到更适合程序调用的一层接口。普通搜索 API 往往只返回链接和片段，后续还需要应用自己抓取网页、清洗内容、控制上下文长度；Tavily 则更强调把结果整理成 LLM 更容易使用的结构化数据。

## 主要能力

- Search：按查询检索网页，返回排序后的结果、摘要内容，并可选择返回生成式简短答案。
- Extract：从一个或多个指定 URL 抽取网页正文，输出 Markdown 或纯文本。
- Crawl：从一个起始 URL 出发按规则抓取站点内容，适合整理文档站或知识库。
- Map：发现一个站点下的 URL 结构，适合先摸清文档或网页集合。
- Research：围绕一个问题执行多步研究，汇总来源并生成研究报告。

## 适用场景

- 给 AI Agent 增加实时网页搜索能力。
- 为 RAG 流水线补充外部网页资料。
- 自动整理官方文档、新闻、产品资料或竞品信息。
- 在回答时需要带来源、需要限定时间范围或限定域名的检索任务。

## 与本 wiki 的关系

Tavily 适合作为后续 wiki 自动采集和网页研究工作流的外部检索工具。对于本项目，它属于“工具/项目”类实体，因此记录在 `wiki/entities/`；官方资料摘要记录在 `wiki/references/`；基础接入教程记录在 `wiki/skills/`。

## 相关页面

- [[wiki/references/tavily-official-documentation|Tavily 官方文档]]
- [[wiki/skills/tavily-basic|Tavily 基础使用]]

