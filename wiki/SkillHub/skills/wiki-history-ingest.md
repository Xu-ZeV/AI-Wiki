---
title: 统一会话历史导入路由
skill: wiki-history-ingest
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/obsidian-wiki/skills/wiki-history-ingest/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# 统一会话历史导入路由

> [!info] Skill 元信息
> 原始名称：`wiki-history-ingest`  
> 原始标题：Unified History Ingest Router  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/wiki-history-ingest/SKILL.md)

## 用途

作为会话/agent 历史导入的统一入口，根据用户指定的来源分发到 Claude、Codex、Copilot、Pi 等专用 skill。

## 适用场景

当用户调用 /wiki-history-ingest claude/codex/copilot/pi，或泛泛要求导入 agent 历史但未直接点名具体 skill 时使用。

## 关键能力

- 识别目标 agent 来源
- 路由到专用历史导入 skill
- 统一调用习惯
- 避免用户记忆多个底层 skill 名称

## 使用边界与注意事项

- 这是路由器，本身不替代各 agent 的专用解析逻辑。
- 若用户明确说明来源，可直接使用对应 history ingest。

## 原始描述摘要

Unified wiki-history-ingest entrypoint for conversation/session sources. Use this when the user says "/wiki-history-ingest claude", "/wiki-history-ingest copilot", "/wiki-history-ingest codex", "/wiki-history-ingest pi", or asks to ingest agent history without naming the underlying skill. This router dispatches to the specialized history skill.

## 原始文档章节

- Subcommands
- Routing Rules
- Execution Contract
- UX Convention

## 相关 Skill

- [[wiki/SkillHub/skills/claude-history-ingest|Claude 历史会话导入]]
- [[wiki/SkillHub/skills/codex-history-ingest|Codex 历史会话导入]]
- [[wiki/SkillHub/skills/copilot-history-ingest|GitHub Copilot 会话历史导入]]
