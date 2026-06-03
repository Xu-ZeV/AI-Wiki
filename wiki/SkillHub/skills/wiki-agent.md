---
title: 跨 Agent 定向历史检索导入
skill: wiki-agent
category: AI 会话历史导入
category_slug: agent-history
source: raw/SkillHub/obsidian-wiki/skills/wiki-agent/SKILL.md
tags:
  - SKILL
  - SKILL/agent-history
---
# 跨 Agent 定向历史检索导入

> [!info] Skill 元信息
> 原始名称：`wiki-agent`  
> 原始标题：Wiki Agent — Targeted Cross-Agent History Search + Ingest  
> 功能分类：AI 会话历史导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/wiki-agent/SKILL.md)

## 用途

按主题从指定 AI agent 的原始历史中检索相关会话，只导入命中的内容，并立即返回可用综合答案。

## 适用场景

当用户问某个 agent 以前是否处理过某主题、要从另一个 agent 历史里拉取某问题经验，或调用 /wiki-claude、/wiki-codex 等指令时使用。

## 关键能力

- 按 agent 和主题检索历史
- 导入少量相关会话而非全量归档
- 生成面向当前任务的综合回答
- 支持跨工具知识补全

## 使用边界与注意事项

- 和 wiki-history-ingest 的区别：wiki-agent 是定向检索加导入，wiki-history-ingest 是批量增量导入。
- 适合找“以前在某工具里怎么解决过 X”。

## 原始描述摘要

Query-driven targeted ingest from a specific AI agent's raw history. Use this skill when the user invokes /wiki-claude, /wiki-codex, /wiki-hermes, /wiki-openclaw, /wiki-copilot, /wiki-pi — with or without a search topic. Different from wiki-history-ingest (which bulk-ingests everything new): this skill finds sessions about a SPECIFIC TOPIC in a specific agent's history and ingests just those, then returns a synthesized answer immediately usable in the current session. Primary use case: you're working in agent A and want to pull in how you solved X in agent B's history. Cross-referencing, not archiving. Also trigger on: "what did I work on in codex about X", "search my claude sessions for Y", "pull in hermes knowledge about Z", "find that conversation where I did X in codex".

## 原始文档章节

- Command Routing
- Before You Start
- Step 1: Locate the Agent's History Root
- Step 2: Build Session Inventory
- Step 3: Score Sessions Against the Query
- Step 4: Extract the Relevant Blob
- Step 5: Distill Blobs into Wiki Pages
- Step 6: Return Synthesized Answer
- From <agent> history: "<query>"
- Step 7: Update Tracking Files
- Cross-Agent Use Patterns
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/memory-bridge|跨工具记忆浏览与差异比较]]
- [[wiki/SkillHub/skills/wiki-query|Wiki 知识检索问答]]
- [[wiki/SkillHub/skills/wiki-history-ingest|统一会话历史导入路由]]
