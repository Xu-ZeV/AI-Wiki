---
title: GitHub Copilot 会话历史导入
skill: copilot-history-ingest
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/obsidian-wiki/skills/copilot-history-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# GitHub Copilot 会话历史导入

> [!info] Skill 元信息
> 原始名称：`copilot-history-ingest`  
> 原始标题：Copilot History Ingest — Conversation Mining  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/copilot-history-ingest/SKILL.md)

## 用途

把 GitHub Copilot CLI 或 VS Code Copilot Chat 的会话历史蒸馏为 Obsidian wiki 知识页。

## 适用场景

当用户要导入 Copilot sessions、session-store.db、~/.copilot/session-state 或 VS Code copilot-chat transcripts 时使用。

## 关键能力

- 读取 Copilot 会话存储
- 提取架构决策、调试笔记和常见模式
- 支持增量导入新会话
- 按知识主题组织成可检索页面

## 使用边界与注意事项

- 不适用于一般 Copilot 使用问题或单纯备份历史。
- 目标是知识库沉淀，不是聊天记录归档。

## 原始描述摘要

Ingest GitHub Copilot CLI session history into an Obsidian wiki as distilled knowledge pages. Use this skill when the user wants to capture their Copilot CLI sessions into a personal wiki — extracting architecture decisions, debug notes, and patterns into searchable Obsidian pages. Triggers on phrases like "ingest my copilot sessions into obsidian", "add my copilot history to my wiki", "pull my copilot session history into the vault", "capture what I've learned from copilot into obsidian", "just the new sessions since last time", or "mine patterns across my copilot sessions". Also triggers when the user mentions session-store.db, ~/.copilot/session-state, or VS Code copilot-chat transcripts in the context of building a wiki or knowledge base. Does NOT trigger for general copilot usage questions, searching sessions, or backing up history.

## 原始文档章节

- Before You Start
- Ingest Modes
- GitHub Copilot Data Layout
- Step 1: Survey and Compute Delta
- Step 2: Ingest Checkpoints and Summaries First
- Step 3: Parse Session Turns
- Step 3b: Process Memory Artifacts
- Step 3c: Extract File and Ref Patterns
- Step 4: Cluster by Topic
- Step 5: Distill into Wiki Pages
- Step 6: Update Manifest, Journal, and Special Files
- Privacy
- Reference
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-history-ingest|统一会话历史导入路由]]
- [[wiki/SkillHub/skills/wiki-agent|跨 Agent 定向历史检索导入]]
- [[wiki/SkillHub/skills/memory-bridge|跨工具记忆浏览与差异比较]]
