---
title: 跨工具记忆浏览与差异比较
skill: memory-bridge
category: 知识检索与上下文复用
category_slug: retrieval-context
source: raw/SkillHub/categories/retrieval-context/memory-bridge/SKILL.md
tags:
  - SKILL
  - SKILL/retrieval-context
---
# 跨工具记忆浏览与差异比较

> [!info] Skill 元信息
> 原始名称：`memory-bridge`  
> 原始标题：Memory Bridge — Cross-Tool Knowledge Browser  
> 功能分类：知识检索与上下文复用  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/retrieval-context/memory-bridge/SKILL.md)

## 用途

按原始 AI 工具来源浏览和比较 wiki 知识，找出不同工具之间的记忆差异和盲点。

## 适用场景

当用户想看 Codex/Claude/Hermes 等工具各自知道什么、比较工具记忆、查找 unique to 某工具或 cross-tool memory 时使用。

## 关键能力

- 按来源工具过滤知识
- 比较不同 agent 的知识覆盖
- 发现某工具独有内容或缺口
- 从任意项目浏览 wiki 记忆

## 使用边界与注意事项

- 差异模式是核心能力，适合发现跨工具盲区。
- 通常依赖 history ingest 先把各工具历史导入。

## 原始描述摘要

Browse and compare wiki knowledge by which AI tool originally produced it. Use this skill when the user says "/memory-bridge", "browse codex memory", "what did codex know about X", "show me claude knowledge", "cross-tool memory", "what does hermes know that claude doesn't", "show me knowledge from <tool>", "compare my AI tool memories", or wants to explore knowledge gaps between tools. Works from any project. Diff mode ("what's different", "unique to codex", "gaps between tools") is the killer feature — it surfaces blind spots between tools that the user may not know exist.

## 原始文档章节

- Before You Start
- Commands
- Step 1: Build the Source Map
- Step 2: Execute the Mode
- Knowledge from <tool> (<N> pages)
- Memory Bridge Diff — <tool-a> vs <tool-b>
- Step 3: Spawn impl-validator (if available)
- Step 4: Log
- Output Conventions

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-agent|跨 Agent 定向历史检索导入]]
- [[wiki/SkillHub/skills/wiki-query|Wiki 知识检索问答]]
- [[wiki/SkillHub/skills/wiki-history-ingest|统一会话历史导入路由]]
