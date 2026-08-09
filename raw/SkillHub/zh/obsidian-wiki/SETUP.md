# 设置

基于技能的 AI 编码代理框架 — Claude Code、Cursor、Windsurf、Pi、Gemini CLI、Google Antigravity、Codex、Hermes、OpenClaw、OpenCode、Aider、Factory Droid、Trae / Trae CN、Kiro、GitHub Copilot（CLI + VS Code Chat） — 使用 Karpathy 的 LLM Wiki 模式构建和维护 Obsidian wiki。没有脚本，没有API密钥——代理**是**LLM。

> 运行 `bash setup.sh` 连接每个支持的代理：项目本地技能符号链接（`.claude/skills/`、`.cursor/skills/`、`.windsurf/skills/`、`.agents/skills/`、`.kiro/skills/`）、全局符号链接(`~/.claude/skills/`、`~/.gemini/skills/`、`~/.codex/skills/`、`~/.hermes/skills/`、`~/.openclaw/skills/`、`~/.copilot/skills/`、`~/.trae/skills/`、`~/.trae-cn/skills/`、 `~/.kiro/skills/`、`~/.agents/skills/`）和始终开启的规则文件（`CLAUDE.md`、`GEMINI.md`、`AGENTS.md`、`.hermes.md`、`.cursor/rules/…`、 `.windsurf/rules/…`、`.kiro/steering/…`、`.agent/rules/…`、`.agent/workflows/…`、`.github/copilot-instructions.md`）。有关完整矩阵，请参阅 [README.md 中的代理兼容性表](raw/SkillHub/obsidian-wiki/README.md#agent-compatibility)。

## 快速入门

### 1.设置你的vault路径

```bash
cp .env.example .env
```

打开 `.env` 并将 `OBSIDIAN_VAULT_PATH` 设置为您的Obsidian vault：

```
OBSIDIAN_VAULT_PATH=/path/to/your/vault
```

这是唯一需要的配置。

### 2. 向客服人员指出技能

在编码代理中打开此项目并告诉它您想要什么：

|你说什么|技能触发|
|---|---|
| “设置我的维基” | `wiki-setup` |
| “从 ~/research 获取我的文档”| `wiki-ingest` |
| “/wiki-history-ingest 克劳德”或“/wiki-history-ingest 法典”| `wiki-history-ingest` |
| “导入我的克劳德历史” | `claude-history-ingest` |
| “导入我的 Codex 历史记录”| `codex-history-ingest` |
| “导入我的 Pi 历史记录” | `pi-history-ingest` |
| “处理此 ChatGPT 导出”| `data-ingest` |
| “我的维基的状态如何？” | `wiki-status` |
| “我对X了解多少？” | `wiki-query` |
| “审核我的维基” | `wiki-lint` |
| “从头开始重建” | `wiki-rebuild` |

代理从 `.skills/` 读取技能，读取 `.env` 作为您的vault路径，然后执行工作。

### 3. 在Obsidian中打开

在 Obsidian 中打开您的 Vault 目录（文件 → 打开 Vault）。 wiki 页面、wiki 链接和图表视图都可以在本地运行。

## 它能摄取什么？

任何基于文本的内容：

|来源 |技能|读什么 |
|---|---|---|
| Markdown、PDF、文本文件 | `wiki-ingest` |任何文档目录 |
|克劳德·代码历史 | `claude-history-ingest` | `~/.claude/` — 对话、回忆、会议 |
| Codex CLI 历史 | `codex-history-ingest` | `~/.codex/` — 会话、部署、历史索引 |
| Pi 代理会话 | `pi-history-ingest` | `~/.pi/agent/sessions/` — 树形结构 JSONL |
| ChatGPT 导出 | `data-ingest` | ChatGPT 导出的 `conversations.json` |
| Slack/Discord 日志 | `data-ingest` |通道导出 JSON 文件 |
|会议记录| `data-ingest` |任何文字记录 |
|原始文本转储 | `data-ingest` |任何内容 — CSV、日志、日记、笔记 |

## 跟踪和增量

该框架通过vault根中的 `.manifest.json` 跟踪其摄取的所有内容。这使得：

- **状态视图** — “摄入了什么？有什么新内容？发生了什么变化？”
- **Delta 摄取** — 仅处理新的/修改的源，跳过 wiki 中已有的内容
- **出处** — 哪个来源产生了哪个维基页面
- **过时检测** — 源已更改，但 wiki 页面尚未更新

### 典型工作流程

```
"What's the status?"     → wiki-status computes the delta
"Ingest the new stuff"   → wiki-ingest processes only the delta (append mode)
"What's the status now?" → wiki-status confirms everything is up to date
```

### 当事情偏离太远时

```
"Archive and rebuild"    → wiki-rebuild archives current wiki to _archives/, clears, ready for fresh ingest
"Restore the old one"    → wiki-rebuild restores from a previous archive
```

存档位于 `$VAULT/_archives/` 并包含完整快照。没有什么是永远不会失去的。

## vault结构

```
$OBSIDIAN_VAULT_PATH/
├── concepts/           # Global knowledge — ideas, theories, mental models
├── entities/           # People, orgs, tools
├── skills/             # How-to knowledge, procedures
├── references/         # Source summaries
├── synthesis/          # Cross-cutting analysis
├── journal/            # Timestamped logs
├── projects/           # Per-project knowledge
│   ├── my-project/
│   │   ├── _project.md
│   │   ├── concepts/
│   │   └── skills/
│   └── another-project/
│       └── ...
├── _archives/          # Wiki snapshots for rebuild/restore
├── index.md            # Auto-maintained catalog
├── log/                # Project operation logs grouped as YYYY/MM/DD/*.md
└── .manifest.json      # Ingest tracking ledger
```

特定于项目的知识位于 `projects/<name>/` 下。通用知识位于全局类别目录中。两者均与 `[[wikilinks]]` 交叉引用。

## 可选配置

|变量|它有什么作用 |默认 |
|---|---|---|
| `OBSIDIAN_SOURCES_DIR` |包含要摄取的文档的目录（以逗号分隔）| *（空 - 特定文件的点代理）* |
| `OBSIDIAN_CATEGORIES` |维基页面类别 | `concepts,entities,skills,references,synthesis,journal` |
| `OBSIDIAN_MAX_PAGES_PER_INGEST` |每次摄取更新的最大页数 | `15` |
| `CLAUDE_HISTORY_PATH` |哪里可以找到克劳德数据 | *从 `~/.claude` 自动发现* |
| `CODEX_HISTORY_PATH` |哪里可以找到法典数据 | *默认为 `~/.codex`* |
| `PI_HISTORY_PATH` |在哪里可以找到 Pi 会话 | *默认为 `~/.pi/agent/sessions`* |
| `LINT_SCHEDULE` | Wiki 健康检查频率 | `weekly` |

## 技能参考

|技能|目的|
|---|---|
| `llm-wiki` |核心模式——三层架构、页面模板、项目组织|
| `wiki-setup` |初始化Vault结构，创建索引/日志，配置Obsidian |
| `wiki-ingest` |将源文档提取到 wiki 页面（追加或完整模式） |
| `wiki-history-ingest` |统一历史记录摄取路由器（`claude`、`codex`、`pi`）|
| `data-ingest` |摄取任何原始文本 - 聊天导出、日志、文字记录等任何内容 |
| `claude-history-ingest` |将 `~/.claude` 对话和记忆挖掘到 wiki 页面 |
| `codex-history-ingest` |挖掘 `~/.codex` 会话并将日志推出到 wiki 页面 |
| `pi-history-ingest` |将 `~/.pi/agent/sessions` JSONL 历史记录挖掘到 wiki 页面 |
| `wiki-status` |审核：已摄取的内容、待处理的内容、增量、建议操作 |
| `wiki-rebuild` |存档当前 wiki、从头开始重建或从存档恢复 |
| `wiki-query` |通过引用回答已编译的 wiki 中的问题 |
| `wiki-lint` |查找孤儿、损坏的链接、陈旧内容、矛盾 |
| `wiki-update` |将当前项目的知识同步到库中（适用于任何项目）|
| `skill-creator` |创造新技能来扩展框架 |

## 它是如何工作的

没有脚本，没有依赖项。这些技能是 Markdown 文件，告诉 AI 代理*如何*在您的Obsidian vault上进行操作：

1. 代理读取 `.env` 作为vault路径
2. Agent读取`.manifest.json`以了解已经完成了什么
3. Agent阅读相关技能指令
4.代理使用其内置工具（读、写、搜索）来完成工作
5.代理更新`.manifest.json`以跟踪它做了什么
6. 输出是标准的Obsidian兼容Markdown，带有 frontmatter 和 `[[wikilinks]]`

**维基是神器。代理是维护者。Obsidian是侦听器。**

## 扩展

想要新的工作流程吗？使用`skill-creator`技能：

>“创建一项技能，从我的日记条目中生成每周摘要”

它引导您完成 `.skills/` 中的起草、测试和完善新技能。
