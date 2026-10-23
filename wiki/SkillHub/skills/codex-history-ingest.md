---
title: Codex 历史会话导入
skill: codex-history-ingest
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/categories/agent-history/codex-history-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# Codex 历史会话导入

> [!info] Skill 元信息
> 原始名称：`codex-history-ingest`  
> 原始标题：Codex History Ingest — Conversation Mining  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/agent-history/codex-history-ingest/SKILL.md)

## 用途

从 Codex CLI 的本地会话记录中提取知识，并写入 Obsidian wiki。

## 适用场景

当用户提到 ~/.codex、rollout files、session_index.jsonl、Codex transcript logs 或想处理 Codex 历史时使用。

## 关键能力

- 读取 Codex CLI 会话索引和 transcript
- 提炼实现经验、调试过程和架构判断
- 沉淀到 wiki 页面
- 支持后续跨工具记忆比较

## 使用边界与注意事项

- 专用于 Codex CLI 历史，不等同于当前会话 capture。
- 如果只想找某个主题，可优先使用 wiki-agent 定向模式。

## 原始描述摘要

Ingest Codex CLI conversation history into the Obsidian wiki. Use this skill when the user wants to mine their past Codex sessions for knowledge, import their ~/.codex folder, extract insights from previous coding sessions, or says things like "process my Codex history", "add my Codex conversations to the wiki", or "what have I discussed in Codex before". Also triggers when the user mentions .codex sessions, rollout files, session_index.jsonl, or Codex transcript logs.

## 原始文档章节

- Before You Start
- Ingest Modes
- Codex Data Layout
- Step 1: Survey and Compute Delta
- Step 2: Parse Session Index First
- Step 3: Parse Rollout JSONL Safely
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
