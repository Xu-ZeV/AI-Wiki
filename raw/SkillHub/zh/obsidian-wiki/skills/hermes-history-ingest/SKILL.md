---
name: hermes-history-ingest
description: >
  Ingest Hermes agent history into the Obsidian wiki. Use this skill when the user wants to mine
  their past Hermes sessions for knowledge, import their ~/.hermes folder, extract insights from
  previous Hermes conversations, or says things like "process my Hermes history", "add my Hermes
  memories to the wiki", "ingest ~/.hermes", or "what have I worked on in Hermes". Also triggers
  when the user mentions Hermes memories, Hermes sessions, ~/.hermes/memories, or Hermes skill logs.
---

# Hermes 历史摄取 — 对话与记忆挖掘

您正在从用户的 Hermes 代理历史中提取知识并将其提炼到 Obsidian wiki 中。 Hermes 存储自由形式的记忆和结构化的会话记录——专注于持久的知识，而不是操作遥测。

该技能可以直接调用，也可以通过`wiki-history-ingest`路由器（`/wiki-history-ingest hermes`）调用。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `HERMES_HISTORY_PATH` （默认为 `~/.hermes`）
2. 读取vault根目录中的 `.manifest.json` 以检查已摄取的内容
3. 阅读库根目录中的 `index.md` 以了解 wiki 已包含的内容

## 摄取模式

### 附加模式（默认）

检查每个源文件的 `.manifest.json`。唯一过程：

- 不在清单中的文件（新内存文件、新会话日志）
- 清单中修改时间晚于 `ingested_at` 的文件

使用此模式进行定期同步。

### 完整模式

处理一切，无论清单如何。在 `wiki-rebuild` 之后或用户明确要求完全重新摄取时使用。

## Hermes 数据布局

Hermes 将所有本地工件存储在 `~/.hermes/` 下（或 `$HERMES_HOME` 对于非默认配置文件）。

```
~/.hermes/
├── memories/                          # Persistent agent memories (markdown or JSON)
│   └── *.md / *.json
├── skills/                            # Installed skills (read-only for ingest purposes)
│   └── <skill-name>/SKILL.md
├── sessions/                          # Session transcripts (if session logging is enabled)
│   └── YYYY-MM-DD/
│       └── <session-id>.jsonl
├── config.yaml                        # User config (model, theme, paths)
└── .hub/                              # Skills Hub state (lock.json, audit.log, quarantine/)
```

### 按价值排名的关键数据源

1. `memories/*.md` / `memories/*.json`——最高信号；策划代理积累的持久知识
2. `sessions/**/*.jsonl`——结构化逐轮转录本；富有但吵闹
3. `config.yaml` — 仅元数据（模型首选项、路径）；很少值得摄入

跳过 `.hub/` 内部结构（审核/隔离状态）和 `skills/` 目录（源材料，而不是用户知识）。

## 第 1 步：调查并计算 Delta

扫描 `HERMES_HISTORY_PATH` 并与 `.manifest.json` 进行比较：

- `~/.hermes/memories/`
- `~/.hermes/sessions/**/`（如果存在）

对每个文件进行分类：

- **新** - 不在清单中
- **已修改** — 在清单中，但文件比 `ingested_at` 新
- **未改变** — 已被摄入且未改变

在深度解析之前报告简明的增量摘要。

## 第二步：首先解析记忆

记忆是最高价值的来源。 Hermes 将它们写为：

- **Markdown** — 带有可选标题的结构化散文；直接摄取
- **JSON** — `{"content": "...", "created_at": "...", "tags": [...]}` 记录

对于每个记忆：

- 提取核心知识主张
- 注意 Hermes 附加的任何标签（它们通常映射到 wiki 类别）
- 合并到适当的 wiki 页面而不是创建一个内存 = 一页

## 步骤 3：安全解析会话 JSONL

每个会话 JSONL 行都是一个事件信封。常见形状：

```json
{"role": "user", "content": "..."}
{"role": "assistant", "content": "..."}
{"type": "tool_use", "name": "...", "input": {...}}
{"type": "tool_result", "content": "..."}
```

### 提取规则

- 优先考虑陈述结论、模式或决定的助理响应
- 从高信号转向中提取用户意图；跳过低信息后续行动
- 将 `tool_use` / `tool_result` 对视为上下文，而不是主要内容
- 跳过token会计、内部管道和重复的计划回声

### 关键隐私过滤器

会话日志可以包括注入的指令、工具负载和敏感文本。不要逐字摄取。

- 删除 API 密钥、token、密码、凭据
- 编辑私人标识符，除非相关且经过用户批准
- 总结；不要逐字引用原始记录

## 步骤 4：按主题聚类

不要为每个内存或会话创建一个 wiki 页面。

- 按稳定主题（概念、工具、项目、技术）对记忆进行分组
- 将混合会议分成单独的主题
- 合并跨日期和项目的重复模式
- 使用文件路径或会话 `cwd` 元数据来推断项目范围（如果可用）

## 步骤 5：提炼成 Wiki 页面

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
  - `^[extracted]` 当直接接地于显式内存/会话内容时
  - 跨多个存储器合成模式时为 `^[inferred]`
  - 当内存冲突时`^[ambiguous]`
- 为每个更改的页面添加/更新 `provenance:` frontmatter mix

## 步骤 6：更新清单、日志和索引

### 更新`.manifest.json`

对于每个已处理的源文件：

- `ingested_at`, `size_bytes`, `modified_at`
- `source_type`: `hermes_memory` | `hermes_session`
- `project`：推断的项目名称（如果适用）
- `pages_created`, `pages_updated`

添加/更新顶级摘要块：

```json
{
  "hermes": {
    "source_path": "~/.hermes/",
    "last_ingested": "TIMESTAMP",
    "memories_ingested": 42,
    "sessions_ingested": 7,
    "pages_created": 5,
    "pages_updated": 12
  }
}
```

### 更新特殊文件

更新`index.md`和`log.md`：

```
- [TIMESTAMP] HERMES_HISTORY_INGEST memories=N sessions=M pages_updated=X pages_created=Y mode=append|full
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用一行摘要更新 **最近活动** - 例如“摄取了 42 个 Hermes 记忆和 7 个会话；主导主题：推理策略、工具使用模式。”保留最后 3 次操作。更新 `updated` 时间戳。

## 隐私和合规性

- 蒸馏和合成；避免原始内存或转录转储
- 默认对任何看起来敏感的内容进行编辑
- 在存储个人或敏感详细信息之前询问用户
- 尽量减少对他人的提及并有目的

## 参考

有关字段级注释和提取指南，请参阅 `references/hermes-data-format.md`。

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