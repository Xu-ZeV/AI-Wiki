---
title: Hermes 历史与记忆导入
skill: hermes-history-ingest
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/obsidian-wiki/skills/hermes-history-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# Hermes 历史与记忆导入

> [!info] Skill 元信息
> 原始名称：`hermes-history-ingest`  
> 原始标题：Hermes History Ingest — Conversation & Memory Mining  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/hermes-history-ingest/SKILL.md)

## 用途

从 Hermes agent 的历史、记忆和 skill 日志中挖掘知识，并导入 Obsidian wiki。

## 适用场景

当用户提到 ~/.hermes、Hermes memories、Hermes sessions、~/.hermes/memories 或想处理 Hermes 历史时使用。

## 关键能力

- 读取 Hermes 会话和记忆目录
- 抽取项目经验与长期记忆
- 生成 wiki 知识页
- 辅助跨工具记忆比较

## 使用边界与注意事项

- 专用于 Hermes 生态数据。
- 导入后可通过 memory-bridge 和 wiki-query 浏览。

## 原始描述摘要

Ingest Hermes agent history into the Obsidian wiki. Use this skill when the user wants to mine their past Hermes sessions for knowledge, import their ~/.hermes folder, extract insights from previous Hermes conversations, or says things like "process my Hermes history", "add my Hermes memories to the wiki", "ingest ~/.hermes", or "what have I worked on in Hermes". Also triggers when the user mentions Hermes memories, Hermes sessions, ~/.hermes/memories, or Hermes skill logs.

## 原始文档章节

- Before You Start
- Ingest Modes
- Hermes Data Layout
- Step 1: Survey and Compute Delta
- Step 2: Parse Memories First
- Step 3: Parse Session JSONL Safely
- Step 4: Cluster by Topic
- Step 5: Distill into Wiki Pages
- Step 6: Update Manifest, Log, and Index
- Privacy and Compliance
- Reference
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-history-ingest|统一会话历史导入路由]]
- [[wiki/SkillHub/skills/wiki-agent|跨 Agent 定向历史检索导入]]
- [[wiki/SkillHub/skills/memory-bridge|跨工具记忆浏览与差异比较]]
