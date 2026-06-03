---
title: Claude 历史会话导入
skill: claude-history-ingest
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/obsidian-wiki/skills/claude-history-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# Claude 历史会话导入

> [!info] Skill 元信息
> 原始名称：`claude-history-ingest`  
> 原始标题：Claude History Ingest — Conversation Mining  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/claude-history-ingest/SKILL.md)

## 用途

从 Claude Code 的本地会话历史中挖掘知识，并导入 Obsidian wiki。

## 适用场景

当用户要处理 ~/.claude、Claude projects、session data、本地 agent mode 记录或询问以前和 Claude 讨论过什么时使用。

## 关键能力

- 读取 Claude 会话与审计日志
- 抽取编码会话中的决策、经验和模式
- 生成可搜索 wiki 页面
- 支持增量知识沉淀

## 使用边界与注意事项

- 专用于 Claude 历史，不应处理其他 agent 的会话格式。
- 导入后可用 memory-bridge 和 wiki-query 复查。

## 原始描述摘要

Ingest Claude Code conversation history into the Obsidian wiki. Use this skill when the user wants to mine their past Claude conversations for knowledge, import their ~/.claude folder, extract insights from previous coding sessions, or says things like "process my Claude history", "add my conversations to the wiki", "what have I discussed with Claude before". Also triggers when the user mentions their .claude folder, Claude projects, session data, past conversation logs, local-agent-mode sessions, or audit logs.

## 原始文档章节

- Before You Start
- Ingest Modes
- Claude Code Data Layout
- Step 1: Survey and Compute Delta
- Step 2: Ingest Memory Files First
- Step 3: Parse Conversation JSONL
- Step 3b: Parse Audit Logs (desktop sessions only)
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
