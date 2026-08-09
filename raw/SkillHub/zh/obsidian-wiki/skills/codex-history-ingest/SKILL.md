---
name: codex-history-ingest
description: >
  Ingest Codex CLI conversation history into the Obsidian wiki. Use this skill when the user wants to mine
  their past Codex sessions for knowledge, import their ~/.codex folder, extract insights from previous coding
  sessions, or says things like "process my Codex history", "add my Codex conversations to the wiki", or
  "what have I discussed in Codex before". Also triggers when the user mentions .codex sessions, rollout files,
  session_index.jsonl, or Codex transcript logs.
---

# Codex History Ingest — 对话挖掘

您正在从用户过去的 Codex 会话中提取知识，并将其提炼到 Obsidian wiki 中。会话日志丰富但嘈杂：关注持久的知识，而不是操作遥测。

该技能可以直接调用，也可以通过`wiki-history-ingest`路由器（`/wiki-history-ingest codex`）调用。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `CODEX_HISTORY_PATH` （默认为 `~/.codex`）
2. 读取vault根目录中的 `.manifest.json` 以检查已摄取的内容
3. 阅读库根目录中的 `index.md` 以了解 wiki 已包含的内容

## 摄取模式

### 附加模式（默认）

检查每个源文件的 `.manifest.json`。唯一过程：

- 清单中没有的文件（新会话推出、新索引文件）
- 清单中修改时间晚于 `ingested_at` 的文件

使用此模式进行定期同步。

### 完整模式

处理一切，无论清单如何。在 `wiki-rebuild` 之后或用户明确要求完全重新摄取时使用。

## 法典数据布局

Codex 将本地工件存储在 `~/.codex/` 下。

```
~/.codex/
├── sessions/                          # Session rollout logs by date
│   └── YYYY/MM/DD/
│       └── rollout-<timestamp>-<id>.jsonl
├── archived_sessions/                 # Archived rollout logs
├── session_index.jsonl                # Lightweight index of thread id/name/updated_at
├── history.jsonl                      # Local transcript history (if persistence enabled)
├── config.toml                        # User config (contains history settings)
└── state_*.sqlite / logs_*.sqlite     # Runtime DBs (usually skip)
```

### 按价值排名的关键数据源

1. `session_index.jsonl` — ID、标题和新鲜度的最佳库存来源
2. `sessions/**/rollout-*.jsonl` — 丰富的结构化转录事件
3. `history.jsonl` — 有用的后备/时间线辅助（如果启用）

除非用户明确要求，否则避免摄取 SQLite 内部结构。

## 第 1 步：调查并计算 Delta

扫描 `CODEX_HISTORY_PATH` 并与 `.manifest.json` 进行比较：

- `~/.codex/session_index.jsonl`
- `~/.codex/sessions/**/rollout-*.jsonl`
- `~/.codex/archived_sessions/**`（可选；仅当用户要求存档历史记录时）
- `~/.codex/history.jsonl`（可选后备）

对每个文件进行分类：

- **新** - 不在清单中
- **已修改** — 在清单中，但文件比 `ingested_at` 新
- **未改变** — 已被摄入且未改变

在深度解析之前报告简明的增量摘要。

## 步骤 2：首先解析会话索引

`session_index.jsonl` 通常具有如下条目：

```json
{"id":"...","thread_name":"...","updated_at":"..."}
```

用它来：

- 建立规范的会话清单
- 优先考虑最近/高信号会话
- 将推出 ID 映射到人类可读的线程名称

## 步骤 3：安全解析 Rollout JSONL

每条 `rollout-*.jsonl` 行都是一个事件信封，其中包含：

```json
{
  "timestamp": "...",
  "type": "session_meta|turn_context|event_msg|response_item",
  "payload": { ... }
}
```

### 提取规则

- 优先考虑用户意图和助理可见的输出
- 支持包含用户/助理消息内容的 `response_item` 记录
- 有选择地使用 `event_msg` 来实现有意义的里程碑；忽略纯遥测
- 将 `session_meta` 视为元数据（cwd、模型、ids），而不是用户知识

### 跳过/噪声过滤器

- token记账事件
- 没有语义内容的工具管道
- 原始命令输出，除非它包含可重用的决策/模式
- 重复的计划快照，除非他们添加新的决策

### 关键隐私过滤器

推出日志可以包括注入的指令、工具负载和敏感文本。不要逐字获取系统/开发者提示或秘密。

- 删除 API 密钥、token、密码、凭据
- 编辑私人标识符，除非相关且获得批准
- 总结而不是引用原始记录

## 步骤 4：按主题聚类

不要为每个会话创建一个 wiki 页面。

- 按多个会议中的稳定主题进行分组
- 将混合会议分成单独的主题
- 合并跨日期/项目重复出现的概念
- 使用元数据中的 `cwd` 来推断项目范围

## 步骤 5：提炼成 Wiki 页面

使用现有的 wiki 约定路由提取的知识：

- 项目特定架构/流程 -> `projects/<name>/...`
- 一般概念 -> `concepts/`
- 重复技术/调试手册 -> `skills/`
- 工具/服务 -> `entities/`
- 跨会话模式 -> `synthesis/`

对于每个受影响的项目，创建/更新 `projects/<name>/<name>.md`（项目名称作为文件名，绝不是 `_project.md`）。

### 写作规则

- 提炼知识，而不是按时间顺序
- 避免“在日期 X 我们讨论过……”，除非日期上下文是必要的
- 在每个新/更新的页面上添加 `summary:` frontmatter（1-2 个句子，<= 200 个字符）
- 将置信度和生命周期字段添加到每个新页面：
  ```yaml
  base_confidence: 0.42
  lifecycle: draft
  lifecycle_changed: <ISO date today>
  ```
  更新时保持 `lifecycle` 不变。
- 添加出处标记：
  - `^[extracted]` 当直接基于明确的会话内容时
  - `^[inferred]` 跨事件/会话合成模式时
  - 当会话冲突时 `^[ambiguous]`
- 为每个更改的页面添加/更新 `provenance:` frontmatter mix

## 步骤 6：更新清单、日志和索引

### 更新`.manifest.json`

对于每个已处理的源文件：

- `ingested_at`, `size_bytes`, `modified_at`
- `source_type`: `codex_rollout` | `codex_index` | `codex_history`
- `project`：推断的项目名称（如果适用）
- `pages_created`, `pages_updated`

添加/更新顶级项目/会话摘要块：

```json
{
  "project-name": {
    "source_path": "~/.codex/sessions/...",
    "last_ingested": "TIMESTAMP",
    "sessions_ingested": 12,
    "sessions_total": 40,
    "index_updated_at": "TIMESTAMP"
  }
}
```

### 更新特殊文件

更新`index.md`和`log.md`：

```
- [TIMESTAMP] CODEX_HISTORY_INGEST sessions=N pages_updated=X pages_created=Y mode=append|full
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用一行摘要更新 **最近活动** - 例如“吸收了 12 个 Codex 会话；在 CLI 工具和 shell 脚本中发现了重复出现的模式。”保留最后 3 次操作。更新 `updated` 时间戳。

## 隐私和合规性

- 蒸馏和合成；避免原始转录本转储
- 默认对任何看起来敏感的内容进行编辑
- 在存储个人/敏感详细信息之前询问用户
- 尽量减少对他人的提及并有目的

## 参考

有关字段级解析注释和提取指南，请参阅 `references/codex-data-format.md`。

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