---
title: Tavily 基础使用
category: skills
tags:
  - Tavily
  - 教程
  - API
sources:
  - "[[wiki/references/tavily-official-documentation|Tavily 官方文档]]"
  - https://docs.tavily.com/documentation/quickstart
  - https://docs.tavily.com/documentation/api-reference/endpoint/search
  - https://docs.tavily.com/sdk/python/quick-start
  - https://docs.tavily.com/sdk/javascript/quick-start
summary: Tavily 基础使用教程，覆盖 API Key、Python/JavaScript SDK、Search/Extract/Crawl/Map/Research 能力和常用接入建议。
provenance:
  extracted: 0.82
  inferred: 0.18
  ambiguous: 0.0
base_confidence: 0.9
lifecycle: draft
lifecycle_changed: 2026-06-06
tier: supporting
created: 2026-06-06T22:48:26+08:00
updated: 2026-06-06T22:48:26+08:00
---
# Tavily 基础使用

## 1. Tavily 解决什么问题

Tavily 适合给 AI Agent、RAG 和自动化研究流程补上网页检索能力。它把搜索结果、网页内容抽取、站点抓取和多步研究整理成 API，减少应用自己处理搜索结果、抓网页、清洗正文和压缩上下文的工作量。

如果任务只需要调用大模型回答静态知识，Tavily 不是必需项；如果任务需要最近资料、官方网页、新闻、产品文档或带来源的回答，就可以把 Tavily 放在模型调用之前作为检索层。

## 2. 最小准备

1. 注册 Tavily 账号并在平台中创建 API Key。
2. 在本地或部署环境中把密钥放入环境变量，避免写死到代码仓库。
3. 根据项目语言安装 SDK，或直接调用 HTTP API。

Python SDK：

```bash
pip install tavily-python
```

JavaScript SDK：

```bash
npm i @tavily/core
```

## 3. Python 最小搜索

```python
from tavily import TavilyClient

tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")
response = tavily_client.search("Who is Leo Messi?")

print(response)
```

常见生产写法应从环境变量读取密钥：

```python
import os
from tavily import TavilyClient

tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
response = tavily_client.search("Tavily 是什么？")

print(response)
```

## 4. JavaScript 最小搜索

```javascript
const { tavily } = require("@tavily/core");

async function main() {
  const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
  const response = await tvly.search("Who is Leo Messi?");

  console.log(response);
}

main();
```

在 Node.js 项目中同样建议从环境变量读取：

```javascript
const { tavily } = require("@tavily/core");

async function main() {
  const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
  const response = await tvly.search("Tavily 是什么？");

  console.log(response);
}

main();
```

## 5. Search API 常用参数

Search 是最常用入口。HTTP 方式可以直接调用 `/search`：

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tvly-YOUR_API_KEY" \
  -d '{
    "query": "Tavily Search API 是什么？",
    "search_depth": "basic",
    "max_results": 5,
    "include_answer": true
  }'
```

常用参数：

- `query`：检索问题或关键词。
- `search_depth`：在延迟和相关性之间取舍，常见值为 `basic` 或 `advanced`。
- `max_results`：限制返回结果数量，上限由官方 API 约束控制。
- `topic`：可选择 `general`、`news` 或 `finance`。
- `time_range`、`start_date`、`end_date`：按发布日期或更新时间过滤结果。
- `include_answer`：让 Tavily 返回一个基于结果生成的简短答案。
- `include_raw_content`：返回清洗后的网页正文，适合直接放进 RAG 或上下文。
- `include_domains`、`exclude_domains`：限定或排除来源域名。

## 6. 其他核心能力

- `extract(url)`：已知 URL 时抽取网页正文，适合处理官方文档、百科页面或指定文章。
- `crawl(url, instructions=...)`：从某个站点入口开始抓取内容，适合整理文档站。
- `map(url)`：只发现 URL 结构，不直接抽取大量正文，适合抓取前做站点摸底。
- `research(question)`：让 Tavily 执行更完整的多步研究任务，适合复杂主题调研。

## 7. 接入建议

- 先用 Search 获取候选来源，再按需要用 Extract 抽取高价值页面。
- 做文档站采集时，先 Map 再 Crawl，避免盲目抓取无关页面。
- 给 Agent 使用时，把 Tavily 返回的 `results` 和来源 URL 一起传给模型，方便生成可追溯回答。
- 查询近期事件时显式设置 `topic`、`time_range` 或日期范围。
- 查询官方资料时使用 `include_domains` 限定官网域名，减少无关内容。
- 不要把 `TAVILY_API_KEY` 写入 wiki、源码或日志。

## 8. 基础检查清单

- 是否能用 SDK 跑通一次 `search()`。
- 是否确认 API Key 从环境变量读取。
- 是否根据任务选择了 Search、Extract、Crawl、Map 或 Research。
- 是否保存了来源 URL，方便后续回答和审计。
- 是否对时间敏感问题设置了时间范围。
- 是否对官方资料检索设置了域名范围。

## Sources

- Wiki 来源页：[[wiki/references/tavily-official-documentation|Tavily 官方文档]]
- 原始资料：[Quickstart](https://docs.tavily.com/documentation/quickstart)
- 原始资料：[Tavily Search](https://docs.tavily.com/documentation/api-reference/endpoint/search)
- 原始资料：[Python SDK Quickstart](https://docs.tavily.com/sdk/python/quick-start)
- 原始资料：[JavaScript SDK Quickstart](https://docs.tavily.com/sdk/javascript/quick-start)
