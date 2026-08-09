---
name: openclaw-history-ingest
description: >
  Ingest OpenClaw agent history into the Obsidian wiki. Use this skill when the user wants to mine
  their past OpenClaw sessions for knowledge, import their ~/.openclaw folder, extract insights from
  previous OpenClaw conversations, or says things like "process my OpenClaw history", "add my OpenClaw
  sessions to the wiki", "ingest ~/.openclaw", or "what have I worked on in OpenClaw". Also triggers
  when the user mentions OpenClaw session logs, MEMORY.md, daily notes, or ~/.openclaw/workspace.
---

# OpenClaw 历史摄取 — 会话和内存挖掘

您正在从用户的 OpenClaw 代理历史记录中提取知识并将其提炼到 Obsidian wiki 中。 OpenClaw 存储结构化的长期 MEMORY.md 和每个会话的 JSONL 转录本 - 专注于持久知识，而不是操作遥测。

该技能可以直接调用，也可以通过`wiki-history-ingest`路由器（`/wiki-history-ingest openclaw`）调用。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `OPENCLAW_HISTORY_PATH` （默认为 `~/.openclaw`）
2. 读取vault根目录中的 `.manifest.json` 以检查已摄取的内容
3. 阅读库根目录中的 `index.md` 以了解 wiki 已包含的内容

## 摄取模式

### 附加模式（默认）

检查每个源文件的 `.manifest.json`。唯一过程：

- 不在清单中的文件（新的会话日志、更新的 MEMORY.md 或每日笔记）
- 清单中修改时间晚于 `ingested_at` 的文件

使用此模式进行定期同步。

### 完整模式

处理一切，无论清单如何。在 `wiki-rebuild` 之后或用户明确要求完全重新摄取时使用。

## OpenClaw 数据布局

OpenClaw 将所有本地工件存储在 `~/.openclaw/` 下。

```
~/.openclaw/
├── openclaw.json                          # Global config
├── credentials/                           # Auth tokens (skip entirely)
├── workspace/                             # Agent workspace
│   ├── MEMORY.md                          # Long-term memory (loaded every session)
│   ├── DREAMS.md                          # Optional dream diary / summaries
│   └── memory/
│       ├── YYYY-MM-DD.md                  # Daily notes (today + yesterday auto-loaded)
│       └── ...
└── agents/
    └── <agentId>/
        ├── agent/
        │   └── models.json                # Agent config (skip)
        └── sessions/
            ├── sessions.json              # Session index
            └── <sessionId>.jsonl          # Session transcript (JSONL, append-only)
```

### 按价值排名的关键数据源

1. `workspace/MEMORY.md`——最高信号；代理商积累的长期持久事实
2. `workspace/memory/YYYY-MM-DD.md`——日常笔记；最近的条目通常包含活动的项目上下文
3. `agents/*/sessions/<id>.jsonl`——会议记录；富有但吵闹
4. `agents/*/sessions/sessions.json` — 库存和时间戳的会话索引
5. `workspace/DREAMS.md`——可选摘要；摄入（如果存在）

完全跳过 `credentials/`。跳过 `agents/*/agent/models.json`（运行时配置，不是用户知识）。

## 第 1 步：调查并计算 Delta

扫描 `OPENCLAW_HISTORY_PATH` 并与 `.manifest.json` 进行比较：

- `~/.openclaw/workspace/MEMORY.md`
- `~/.openclaw/workspace/DREAMS.md`（如果存在）
- `~/.openclaw/workspace/memory/*.md`
- `~/.openclaw/agents/*/sessions/sessions.json`
- `~/.openclaw/agents/*/sessions/*.jsonl`

对每个文件进行分类：

- **新** - 不在清单中
- **已修改** — 在清单中，但文件比 `ingested_at` 新
- **未改变** — 已被摄入且未改变

在深度解析之前报告简明的增量摘要。

## 步骤2：首先解析MEMORY.md

`MEMORY.md` 是最高价值的来源。它是简单的Markdown、人类可读和可编辑的。它通常包含：

- 关于用户偏好、环境和重复模式的持久事实
- 代理被告知要记住的决定和背景
- 代理在多次会议中积累的针对特定项目的笔记

完整阅读并提取概念级知识。不要为每个 MEMORY.md 条目创建一个 wiki 页面 - 按主题集群。

## 第三步：解析每日笔记

`workspace/memory/YYYY-MM-DD.md` 文件包含当天会话的时间戳记。优先考虑最近的文件（最近 30-90 天）。摘录：

- 活跃的项目背景和做出的决策
- 发现的模式或技术
- 反复出现的阻碍或已解决的问题

较旧的每日笔记的信号逐渐减弱——批量总结而不是逐行提取。

## 步骤 4：安全解析会话 JSONL

每个会话文件都是 JSONL（仅附加，每行一个 JSON 对象）：

```json
{"role": "user",      "content": "...", "timestamp": "..."}
{"role": "assistant", "content": "...", "timestamp": "..."}
{"role": "tool",      "name": "...",   "content": "...", "timestamp": "..."}
```

### 提取规则

- 优先考虑陈述结论、决定或模式的助理轮流
- 从高信号转向中提取用户意图；跳过低信息后续行动
- 工具调用是上下文，而不是主要知识 - 仅当结果包含可重用的见解时才进行提取
- 在打开各个成绩单之前交叉引用 `sessions.json` 索引以获取会话名称/标签

### 关键隐私过滤器

会话记录可以包括注入的指令、工具负载和敏感文本。不要逐字摄取。

- 删除 API 密钥、token、密码、凭据
- 编辑私人标识符，除非相关且经过用户批准
- 总结；不要逐字引用原始记录

## 步骤 5：按主题聚类

不要为每个会话或每个 MEMORY.md 条目创建一个 wiki 页面。

- 按稳定主题（概念、工具、项目、技术）分组
- 将混合会议分成单独的主题
- 合并跨日期和代理的重复模式
- 使用会话 `cwd` 或工作空间路径来推断项目范围（如果可用）

## 步骤 6：提炼成 Wiki 页面

使用现有的 wiki 约定路由提取的知识：

- 项目特定架构/流程 → `projects/<name>/...`
- 一般概念 → `concepts/`
- 重复技术/调试手册 → `skills/`
- 工具/服务/框架 → `entities/`
- 跨会话模式 → `synthesis/`

对于每个受影响的项目，创建/更新 `projects/<name>/<name>.md`。

### 写作规则

- 提炼知识，而不是按时间顺序
- 避免“在日期 X 我们讨论过……”，除非日期上下文是必要的
- 在每个新/更新的页面上添加 `summary:` frontmatter（1-2 个句子，≤ 200 个字符）
- 将置信度和生命周期字段添加到每个新页面：
  ```yaml
  base_confidence: 0.42
  lifecycle: draft
  lifecycle_changed: <ISO date today>
  ```
  更新时保持 `lifecycle` 不变。
- 添加出处标记：
  - `^[extracted]` 当直接基于显式会话/内存内容时
  - 在多个会话中合成模式时为 `^[inferred]`
  - 当会话冲突时 `^[ambiguous]`
- 为每个更改的页面添加/更新 `provenance:` frontmatter mix

## 步骤 7：更新清单、日志和索引

### 更新`.manifest.json`

对于每个已处理的源文件：

- `ingested_at`, `size_bytes`, `modified_at`
- `source_type`: `openclaw_memory` | `openclaw_daily_note` | `openclaw_session` | `openclaw_dreams`
- `agent_id`：代理目录名称（如果适用）
- `pages_created`, `pages_updated`

添加/更新顶级摘要块：

```json
{
  "openclaw": {
    "source_path": "~/.openclaw/",
    "last_ingested": "TIMESTAMP",
    "memory_updated_at": "TIMESTAMP",
    "daily_notes_ingested": 14,
    "sessions_ingested": 23,
    "pages_created": 6,
    "pages_updated": 18
  }
}
```

### 更新特殊文件

更新`index.md`和`log.md`：

```
- [TIMESTAMP] OPENCLAW_HISTORY_INGEST memory=updated daily_notes=N sessions=M pages_updated=X pages_created=Y mode=append|full
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用一行摘要更新 **最近活动** - 例如“吸收了 OpenClaw MEMORY.md 和 14 个日常笔记；浮现了自动化模式和多代理协调知识。”保留最后 3 次操作。更新 `updated` 时间戳。

## 隐私和合规性

- 蒸馏和合成；避免原始内存或转录转储
- 默认对任何看起来敏感的内容进行编辑
- 在存储个人或敏感详细信息之前询问用户
- 尽量减少对他人的提及并有目的

## 参考

有关字段级注释和解析指南，请参阅 `references/openclaw-data-format.md`。

## Vault 写入后 QMD 刷新

QMD 是一个搜索索引，而不是事实来源。如果 `$QMD_WIKI_COLLECTION` 为空或未设置，则跳过此步骤。仅在该技能写入或重写了Vault Markdown后才运行它。如果 QMD 刷新失败，请勿回滚vault更改；单独报告 QMD 状态。

如果设置，则使用 `$QMD_CLI`；否则使用 `qmd`。

```bash
${QMD_CLI:-qmd} update
```

如果输出表明需要向量或嵌入可能已过时，请运行：

```bash
${QMD_CLI:-qmd} embed
```

使用以下任一方法验证集合：

```bash
${QMD_CLI:-qmd} ls "$QMD_WIKI_COLLECTION"
```

或者，当特定页面路径已知时：

```bash
${QMD_CLI:-qmd} get "qmd://$QMD_WIKI_COLLECTION/<page>.md" -l 5
```

记录以下之一：
- `QMD refreshed: update + embed + verified`
- `QMD refreshed: update only + verified`
- `QMD skipped: QMD_WIKI_COLLECTION unset`
- `QMD skipped: qmd CLI unavailable`
- `QMD failed: <short error summary>`