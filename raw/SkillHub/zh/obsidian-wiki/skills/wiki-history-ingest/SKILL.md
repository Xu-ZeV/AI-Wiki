---
name: wiki-history-ingest
description: >
  Unified wiki-history-ingest entrypoint for conversation/session sources. Use this when the user says
  "/wiki-history-ingest claude", "/wiki-history-ingest copilot", "/wiki-history-ingest codex",
  "/wiki-history-ingest pi", or asks to ingest agent history without naming the underlying skill.
  This router dispatches to the specialized history skill.
---

# 统一历史记录摄取路由器

这是一个瘦路由器，仅用于**历史源**。它不会替换文档的 `wiki-ingest`。

## 子命令

如果用户调用 `/wiki-history-ingest <target>` （或等效文本命令），则直接分派：

|子命令 |路线至 |
|---|---|
| `claude` | `claude-history-ingest` |
| `copilot` | `copilot-history-ingest` |
| `codex` | `codex-history-ingest` |
| `hermes` | `hermes-history-ingest` |
| `openclaw` | `openclaw-history-ingest` |
| `pi` | `pi-history-ingest` |
| `auto` |使用以下规则从上下文推断 |

## 路由规则

1. 如果用户明确指定 `claude`、`copilot`、`codex`、`hermes`、`openclaw` 或 `pi`，则直接路由。
2. 如果用户提供路径/源：
   - `~/.claude` 或 Claude 内存/会话 JSONL 工件 -> `claude-history-ingest`
   - `~/.copilot`、`session-store.db`、VS Code 副驾驶聊天记录 -> `copilot-history-ingest`
   - `~/.codex` 或部署/会话索引工件 -> `codex-history-ingest`
   - `~/.hermes` 或 Hermes 记忆/会话工件 -> `hermes-history-ingest`
   - `~/.openclaw` 或 OpenClaw MEMORY.md/session JSONL 工件 -> `openclaw-history-ingest`
   - `~/.pi/agent/sessions` 或 Pi 会话 JSONL 工件 -> `pi-history-ingest`
3. 如果有歧义，请进行简短的澄清：
   - “我应该提取 `claude`、`copilot`、`codex`、`hermes`、`openclaw` 或 `pi` 历史记录吗？”

## 执行合约

- 路由完成后，准确执行目标技能的工作流程。
- 不要在此文件中复制目标逻辑。
- 将清单/索引/日志更新语义留给目标技能。

## 用户体验约定

- 使用 `wiki-ingest` **文档/内容源**
- 使用 `wiki-history-ingest` 作为**代理历史记录源**

示例：

- `/wiki-history-ingest claude`
- `/wiki-history-ingest copilot`
- `/wiki-history-ingest codex`
- `/wiki-history-ingest hermes`
- `/wiki-history-ingest openclaw`
- `/wiki-history-ingest pi`
- `$wiki-history-ingest claude`（使用 `$skill` 调用的代理）
- `$wiki-history-ingest copilot`
