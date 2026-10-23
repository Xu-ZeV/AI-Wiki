---
title: 通用文本数据导入
skill: data-ingest
category: 内容采集与导入
category_slug: content-ingest
source: raw/SkillHub/categories/content-ingest/data-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/content-ingest
---
# 通用文本数据导入

> [!info] Skill 元信息
> 原始名称：`data-ingest`  
> 原始标题：Data Ingest — Universal Text Source Handler  
> 功能分类：内容采集与导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/content-ingest/data-ingest/SKILL.md)

## 用途

处理不属于标准文档或特定 agent 历史的原始文本数据，例如聊天导出、日志、会议纪要、CSV、书签或邮件归档。

## 适用场景

当用户说 ingest 这批数据、处理这些日志、导入某平台聊天记录或添加原始文本导出到 wiki 时使用。

## 关键能力

- 接收任意非结构化文本来源
- 识别可蒸馏的概念、决策、模式和事实
- 转化为 Obsidian wiki 页面
- 作为其他专用 ingest skill 之外的兜底入口

## 使用边界与注意事项

- 如果来源是 Claude/Codex/Copilot 等已支持 agent 历史，应优先使用对应 history ingest。
- 适合来源格式混杂但内容以文本为主的场景。

## 原始描述摘要

Ingest any raw text data, conversation logs, chat exports, or unstructured documents into the Obsidian wiki. Use this skill when the user wants to process data that isn't standard documents or Claude history — things like ChatGPT exports, Slack threads, Discord logs, meeting transcripts, journal entries, CSV data, browser bookmarks, email archives, or any raw text dump. Triggers on "ingest this data", "process these logs", "add this export to the wiki", "import my chat history from X". This is the catch-all for any text source not covered by the more specific ingest skills.

## 原始文档章节

- Before You Start
- Content Trust Boundary
- Step 1: Identify the Source Format
- Step 2: Extract Knowledge
- Step 3: Cluster and Deduplicate
- Step 4: Distill into Wiki Pages
- Step 5: Update Manifest and Special Files
- Tips
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-history-ingest|统一会话历史导入路由]]
- [[wiki/SkillHub/skills/wiki-capture|当前会话保存为 Wiki 笔记]]
