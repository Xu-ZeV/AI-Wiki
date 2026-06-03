---
title: AI 会话历史导入
category_slug: agent-history
tags:
  - SKILL/category
---
# AI 会话历史导入

从 Claude、Codex、Copilot、Hermes、OpenClaw、Pi 等工具历史中挖掘可复用知识。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[wiki-history-ingest]] | 统一会话历史导入路由 | `wiki-history-ingest` | 作为会话/agent 历史导入的统一入口，根据用户指定的来源分发到 Claude、Codex、Copilot、Pi 等专用 skill。 |
| [[wiki-agent]] | 跨 Agent 定向历史检索导入 | `wiki-agent` | 按主题从指定 AI agent 的原始历史中检索相关会话，只导入命中的内容，并立即返回可用综合答案。 |
| [[claude-history-ingest]] | Claude 历史会话导入 | `claude-history-ingest` | 从 Claude Code 的本地会话历史中挖掘知识，并导入 Obsidian wiki。 |
| [[codex-history-ingest]] | Codex 历史会话导入 | `codex-history-ingest` | 从 Codex CLI 的本地会话记录中提取知识，并写入 Obsidian wiki。 |
| [[copilot-history-ingest]] | GitHub Copilot 会话历史导入 | `copilot-history-ingest` | 把 GitHub Copilot CLI 或 VS Code Copilot Chat 的会话历史蒸馏为 Obsidian wiki 知识页。 |
| [[hermes-history-ingest]] | Hermes 历史与记忆导入 | `hermes-history-ingest` | 从 Hermes agent 的历史、记忆和 skill 日志中挖掘知识，并导入 Obsidian wiki。 |
| [[openclaw-history-ingest]] | OpenClaw 会话与记忆导入 | `openclaw-history-ingest` | 从 OpenClaw agent 历史、MEMORY.md、daily notes 和 workspace 数据中提取知识并写入 Obsidian wiki。 |
| [[pi-history-ingest]] | Pi Agent 会话历史导入 | `pi-history-ingest` | 从 Pi coding agent 的本地 sessions 目录中挖掘知识，并导入 Obsidian wiki。 |

## 使用建议

- 全量或增量归档用 wiki-history-ingest 路由到专用 skill；按主题找旧经验用 wiki-agent。
- 导入多个 agent 后，可用 memory-bridge 比较不同工具的知识覆盖。
