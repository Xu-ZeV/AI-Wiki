---
title: OpenClaw 会话与记忆导入
skill: openclaw-history-ingest
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/categories/agent-history/openclaw-history-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# OpenClaw 会话与记忆导入

> [!info] Skill 元信息
> 原始名称：`openclaw-history-ingest`  
> 原始标题：OpenClaw History Ingest — Session & Memory Mining  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/agent-history/openclaw-history-ingest/SKILL.md)

## 用途

从 OpenClaw agent 历史、MEMORY.md、daily notes 和 workspace 数据中提取知识并写入 Obsidian wiki。

## 适用场景

当用户提到 ~/.openclaw、OpenClaw session logs、MEMORY.md、daily notes 或 workspace 时使用。

## 关键能力

- 读取 OpenClaw 会话日志和记忆文件
- 抽取工作记录、经验和模式
- 组织为 wiki 页面
- 支持后续跨 agent 知识复用

## 使用边界与注意事项

- 适合 OpenClaw 历史沉淀，不适合作为通用文本导入器。
- 如果来源混杂，考虑 data-ingest。

## 原始描述摘要

Ingest OpenClaw agent history into the Obsidian wiki. Use this skill when the user wants to mine their past OpenClaw sessions for knowledge, import their ~/.openclaw folder, extract insights from previous OpenClaw conversations, or says things like "process my OpenClaw history", "add my OpenClaw sessions to the wiki", "ingest ~/.openclaw", or "what have I worked on in OpenClaw". Also triggers when the user mentions OpenClaw session logs, MEMORY.md, daily notes, or ~/.openclaw/workspace.

## 原始文档章节

- Before You Start
- Ingest Modes
- OpenClaw Data Layout
- Step 1: Survey and Compute Delta
- Step 2: Parse MEMORY.md First
- Step 3: Parse Daily Notes
- Step 4: Parse Session JSONL Safely
- Step 5: Cluster by Topic
- Step 6: Distill into Wiki Pages
- Step 7: Update Manifest, Log, and Index
- Privacy and Compliance
- Reference
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-history-ingest|统一会话历史导入路由]]
- [[wiki/SkillHub/skills/wiki-agent|跨 Agent 定向历史检索导入]]
- [[wiki/SkillHub/skills/memory-bridge|跨工具记忆浏览与差异比较]]
