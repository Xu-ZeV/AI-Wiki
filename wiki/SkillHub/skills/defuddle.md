---
title: Defuddle 网页正文提取
skill: defuddle
category: 内容采集与导入
category_slug: content-ingest
source: raw/SkillHub/obsidian-skills/skills/defuddle/SKILL.md
tags:
  - SKILL
  - SKILL/content-ingest
---
# Defuddle 网页正文提取

> [!info] Skill 元信息
> 原始名称：`defuddle`  
> 原始标题：Defuddle  
> 功能分类：内容采集与导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-skills/skills/defuddle/SKILL.md)

## 用途

使用 Defuddle CLI 从普通网页中提取干净 Markdown，去除导航、广告和页面杂质，降低后续处理 token 成本。

## 适用场景

当用户提供网页 URL、在线文档、文章或博客并需要阅读、分析或保存正文内容时使用。

## 关键能力

- 用 defuddle parse 提取 Markdown
- 保存提取结果到文件
- 读取网页 title、description、domain 等元数据
- 为后续 wiki ingest 提供清洁正文

## 使用边界与注意事项

- URL 以 .md 结尾时不需要 Defuddle，应直接读取 Markdown。
- 未安装时需要 npm install -g defuddle。

## 原始描述摘要

Extract clean markdown content from web pages using Defuddle CLI, removing clutter and navigation to save tokens. Use instead of WebFetch when the user provides a URL to read or analyze, for online documentation, articles, blog posts, or any standard web page. Do NOT use for URLs ending in .md — those are already markdown, use WebFetch directly.

## 原始文档章节

- Usage
- Output formats

## 相关 Skill

- [[wiki/SkillHub/skills/ingest-url|URL 页面蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-research|多轮网页研究入库]]
