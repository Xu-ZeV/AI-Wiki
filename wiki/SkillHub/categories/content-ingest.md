---
title: 内容采集与导入
category_slug: content-ingest
tags:
  - SKILL/category
---
# 内容采集与导入

把网页、文档、原始文本、当前会话或项目知识蒸馏进 Obsidian wiki。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[defuddle]] | Defuddle 网页正文提取 | `defuddle` | 使用 Defuddle CLI 从普通网页中提取干净 Markdown，去除导航、广告和页面杂质，降低后续处理 token 成本。 |
| [[ingest-url]] | URL 页面蒸馏入库 | `ingest-url` | 抓取一个 URL，并把网页内容蒸馏成 Obsidian wiki 中的结构化知识页。 |
| [[wiki-ingest]] | 文档知识蒸馏入库 | `wiki-ingest` | 把文档、目录、文章、论文、笔记或 raw staging 内容蒸馏成互联的 Obsidian wiki 页面。 |
| [[data-ingest]] | 通用文本数据导入 | `data-ingest` | 处理不属于标准文档或特定 agent 历史的原始文本数据，例如聊天导出、日志、会议纪要、CSV、书签或邮件归档。 |
| [[obsidian-wiki-ingest]] | obsidian-wiki 项目自动导入 | `obsidian-wiki-ingest` | 在 obsidian-wiki 项目上下文中自动运行 wiki-ingest 管线，处理文档导入、去重、frontmatter 和交叉链接。 |
| [[wiki-update]] | 项目知识同步到 Wiki | `wiki-update` | 从任意当前项目中提取正在工作的知识，并同步到 Obsidian wiki。 |
| [[wiki-research]] | 多轮网页研究入库 | `wiki-research` | 围绕一个主题自主进行多轮网页搜索、综合发现，并把结构化研究结果写入 Obsidian wiki。 |
| [[wiki-capture]] | 当前会话保存为 Wiki 笔记 | `wiki-capture` | 把当前对话改写成永久、结构化的 wiki 知识页，而不是保存聊天流水。 |

## 使用建议

- 先判断来源类型：网页用 ingest-url/defuddle，文档目录用 wiki-ingest，混杂文本用 data-ingest，当前会话用 wiki-capture。
- 大批量导入后建议运行 cross-linker、wiki-lint 或 wiki-synthesize。
