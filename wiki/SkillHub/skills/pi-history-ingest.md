---
title: Pi Agent 会话历史导入
skill: pi-history-ingest
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/categories/agent-history/pi-history-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# Pi Agent 会话历史导入

> [!info] Skill 元信息
> 原始名称：`pi-history-ingest`  
> 原始标题：Pi History Ingest — Session Mining  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/agent-history/pi-history-ingest/SKILL.md)

## 用途

从 Pi coding agent 的本地 sessions 目录中挖掘知识，并导入 Obsidian wiki。

## 适用场景

当用户提到 ~/.pi/agent/sessions、Pi sessions、Pi agent history 或想处理 Pi 历史时使用。

## 关键能力

- 读取 Pi agent 会话记录
- 提炼 coding session 中的知识
- 生成结构化 wiki 页面
- 与其他 agent 记忆统一检索

## 使用边界与注意事项

- 专用于 Pi 会话，不处理其他聊天平台导出。
- 导入后建议运行状态或 lint 检查。

## 原始描述摘要

Ingest Pi coding agent session history into the Obsidian wiki. Use this skill when the user wants to mine their past Pi sessions for knowledge, import their ~/.pi/agent/sessions folder, extract insights from previous coding sessions, or says things like "process my Pi history", "add my Pi sessions to the wiki", "ingest ~/.pi", or "what have I worked on in Pi". Also triggers when the user mentions Pi sessions, Pi agent history, ~/.pi/agent/sessions, or Pi conversation logs.

## 原始文档章节

- Before You Start
- Ingest Modes
- Pi Data Layout
- Step 1: Survey and Compute Delta
- Step 2: Parse Session JSONL
- Step 3: Cluster by Topic
- Step 4: Distill into Wiki Pages
- Step 5: Update Manifest, Log, and Index
- Privacy and Compliance
- Reference
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-history-ingest|统一会话历史导入路由]]
- [[wiki/SkillHub/skills/wiki-agent|跨 Agent 定向历史检索导入]]
- [[wiki/SkillHub/skills/memory-bridge|跨工具记忆浏览与差异比较]]
