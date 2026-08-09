---
name: copilot-history-ingest
description: >
  Ingest GitHub Copilot CLI session history into an Obsidian wiki as distilled knowledge pages. Use this skill
  when the user wants to capture their Copilot CLI sessions into a personal wiki — extracting architecture
  decisions, debug notes, and patterns into searchable Obsidian pages. Triggers on phrases like "ingest my
  copilot sessions into obsidian", "add my copilot history to my wiki", "pull my copilot session history into
  the vault", "capture what I've learned from copilot into obsidian", "just the new sessions since last time",
  or "mine patterns across my copilot sessions". Also triggers when the user mentions session-store.db,
  ~/.copilot/session-state, or VS Code copilot-chat transcripts in the context of building a wiki or knowledge
  base. Does NOT trigger for general copilot usage questions, searching sessions, or backing up history.
---

# Copilot 历史摄取 — 对话挖掘

您正在从用户过去的 GitHub Copilot CLI 对话中提取知识，并将其提炼到 Obsidian wiki 中。对话内容丰富但混乱——你的工作是找到信号并对其进行编译。

该技能可以直接调用，也可以通过`wiki-history-ingest`路由器（`/wiki-history-ingest copilot`）调用。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`、`COPILOT_HISTORY_PATH`（默认为 `~/.copilot/session-state`）和 `COPILOT_VSCODE_STORAGE_PATH`（VS 代码 `workspaceStorage`；特定于平台 - 询问用户是否存在）
2. 在vault根读取 `.manifest.json` 以检查已摄取的内容
3. 阅读库根目录中的 `index.md` 以了解 wiki 已包含的内容

## 摄取模式

### 附加模式（默认）

检查每个源文件的 `.manifest.json`（事件 JSONL、转录 JSONL、检查点、会话存储 DB）。唯一过程：

- 不在清单中的会话（新会话）
- `updated_at` 比清单中的 `ingested_at` 新的会话

这通常是您想要的 - 用户运行了一些新会话并希望捕获增量。

### 完整模式

处理一切，无论清单如何。在 `wiki-rebuild` 之后或用户明确要求时使用。

## GitHub Copilot 数据布局

Copilot 将数据存储在三个位置。扫描**全部三个**。

### 来源 1：`~/.copilot/session-state/`（CLI 会话）

```
~/.copilot/session-state/
├── <session-uuid>/
│   ├── workspace.yaml           # Session metadata (id, cwd, summary_count, created_at, updated_at)
│   ├── vscode.metadata.json     # VS Code context (workspaceFolder, repositoryProperties, customTitle)
│   ├── events.jsonl             # Full event log — all turns, tool calls, reasoning
│   ├── session.db               # Per-session SQLite (todos/todo_deps only — skip for ingestion)
│   ├── index.md                 # Session summary written at session end
│   ├── checkpoints/             # Checkpoint JSON files (mid-session summaries)
│   │   └── <uuid>.json          # title, overview, history, work_done, technical_details,
│   │                            #   important_files, next_steps
│   ├── files/                   # Artifacts produced during session (plans, diagrams, etc.)
│   └── research/                # Research artifacts
└── ...
```

### 来源 2：`~/.copilot/session-store.db`（全局 SQLite）

规范的跨会话数据库。这是**最高价值**来源：结构化、可查询且预先汇总。

```
sessions       — id, cwd, repository, branch, summary, created_at, updated_at, host_type
turns          — session_id, turn_index, user_message, assistant_response, timestamp
checkpoints    — session_id, checkpoint_number, title, overview, history, work_done,
                 technical_details, important_files, next_steps, created_at
session_files  — session_id, file_path, tool_name, turn_index, first_seen_at
session_refs   — session_id, ref_type (commit/pr/issue), ref_value, turn_index, created_at
search_index   — FTS5 virtual table (content, session_id, source_type, source_id)
```

### 来源 3：VS Code 工作区存储 (`<workspaceStorage>/<hash>/GitHub.copilot-chat/`)

VS Code 扩展数据，由工作区哈希键控。该路径是特定于平台的，并且必须来自 `.env` 或用户输入。

```
<hash>/GitHub.copilot-chat/
├── transcripts/
│   └── <session-uuid>.jsonl     # Conversation transcripts (same JSONL format as events.jsonl)
├── memory-tool/
│   └── memories/
│       └── <base64-session-id>/ # Per-session saved artifacts (plan.md, etc.)
│           └── plan.md
└── codebase-external.sqlite     # Codebase index (skip — no conversation knowledge)
```

### 按价值排名的关键数据源：

1. **检查点**（`session-store.db` `checkpoints` 表 + 每个会话 `checkpoints/*.json`） - `overview`、`work_done`、`technical_details` 的预提取摘要， `important_files`，`next_steps`。金子。
2. **会议摘要** (`session-store.db` `sessions.summary` + `index.md`) — 每个会议的一段概要。
3. **轮次** (`session-store.db` `turns` 表 + `events.jsonl` / 记录 JSONL) — 完整对话。丰富但冗长。
4. **记忆工件**（`memory-tool/memories/<id>/plan.md` 等）— 用户明确保存的预先编写的计划和结构化注释。值得逐字导入（或简单总结）。
5. **文件访问模式**（`session_files` 表 + `tool.execution_*` 事件）— 代理重复接触哪些文件 — 揭示高价值的项目文件。
6. **会话参考**（`session_refs` 表）— 与会话相关的提交、PR 和问题。
7. **`vscode.metadata.json`** — 工作区文件夹路径、分支、`customTitle`（用户设置会话标签）。对于分组和命名很有用。

## 第 1 步：调查并计算 Delta

扫描所有三个数据位置并与 `.manifest.json` 进行比较：

```bash
# --- Source 1: per-session directories ---
# Find all session directories (each has workspace.yaml)
ls ~/.copilot/session-state/

# For each session, read workspace.yaml for id/cwd/updated_at
# and vscode.metadata.json for customTitle / repositoryProperties

# --- Source 2: global database ---
# Query session-store.db with sqlite3 (or Python sqlite3)
SELECT s.id, s.cwd, s.repository, s.branch, s.summary, s.updated_at,
       COUNT(DISTINCT t.turn_index) AS turn_count,
       COUNT(DISTINCT c.id)         AS checkpoint_count
FROM sessions s
LEFT JOIN turns t ON t.session_id = s.id
LEFT JOIN checkpoints c ON c.session_id = s.id
GROUP BY s.id
ORDER BY s.updated_at DESC;

# --- Source 3: VS Code workspace storage ---
# For each <hash> directory under workspaceStorage, check for GitHub.copilot-chat/
# Find transcript files
ls <workspaceStorage>/<hash>/GitHub.copilot-chat/transcripts/
```

构建统一清单（每个会话 UUID 一个条目）并进行分类：

- **新** — 不在清单中 → 需要摄取
- **修改** - 在清单中，但 `updated_at` 较新 → 需要重新摄取
- **未更改** — 在清单中且未修改 → 在追加模式下跳过

向用户报告：“在会话状态中找到 X 个会话，在 session-store.db 中发现 Y 个会话，Z VS 代码转录文件。检查点：A。增量：B 新的，C 修改的。”

## 步骤 2：首先提取检查点和摘要

检查点已经被提炼出来——在接触原始转弯之前对其进行处理。

### 来自 `session-store.db`：

```sql
SELECT s.id, s.cwd, s.repository, s.branch, s.summary,
       c.checkpoint_number, c.title, c.overview, c.work_done,
       c.technical_details, c.important_files, c.next_steps,
       c.created_at
FROM checkpoints c
JOIN sessions s ON c.session_id = s.id
ORDER BY s.updated_at DESC, c.checkpoint_number ASC;
```

### 来自每个会话 `checkpoints/*.json`：

每个检查点文件有：`title`、`overview`、`history`、`work_done`、`technical_details`、`important_files`、`next_steps`。

阅读 `index.md`（如果存在）作为会话级摘要 - 它通常写在会话结束时并且已经很简洁。

### 提取什么：

- `overview` → 会议完成内容的高级描述
- `work_done` → 完成的具体任务（适用于技能/项目页面）
- `technical_details` → 实现细节（适用于概念页面）
- `important_files` → 项目中的高价值文件（适用于项目页面）
- `next_steps` → 开放线程（适合链接到正在进行的项目工作）

## 步骤 3：解析会话回合

从 `session-store.db`（首选 - 已解析）或从 `events.jsonl` / 转录 JSONL 读取轮次。

### 来自 `session-store.db`：

```sql
SELECT turn_index, user_message, assistant_response, timestamp
FROM turns
WHERE session_id = '<uuid>'
ORDER BY turn_index ASC;
```

### 来自 `events.jsonl` / 成绩单 JSONL：

每个文件都是一个会话。每一行都是一个 JSON 事件。有关完整架构，请参阅 `references/copilot-data-format.md`。

**相关事件类型：**

| `type` |它是什么 |值得一读吗？                            |
| --------------------- | --------------------------------------- | ----------------------------------------- |
| `session.start` |会话元数据（cwd、分支、版本）|是 - 建立项目背景 |
| `user.message` |用户转|是的 — `data.content` |
| `assistant.message` |助理转|是 — `data.content`（文本）+ `data.toolRequests` |
| `tool.execution_start`|工具调用|浏览 — 揭示使用了哪些文件/命令 |
| `tool.execution_end` |工具结果 |不——通常是噪音|

**`assistant.message` 的提取策略：**

- `data.content` 是助手的文本响应 — 提取此内容
- `data.reasoningText` 是内部推理 — 跳过（这是解压后的 `reasoningOpaque` 字段）
- `data.toolRequests` 列出工具调用 — 浏览工具名称和文件访问模式的参数
- 完全跳过 `type: "tool.execution_end"`

## 步骤 3b：处理内存伪影

对于 VS Code 工作区存储中具有 `memory-tool/memories/<base64-id>/` 目录的每个会话，读取其中保存的任何 Markdown 文件（通常为 `plan.md`）。这些是用户明确保存的文档 - 将它们视为高质量的、用户创作的内容。

解码base64目录名以获取会话UUID：

```python
import base64
session_id = base64.b64decode(dir_name).decode('utf-8')
```

内存工件映射到项目 `skills/` 或 `concepts/` 页面，具体取决于内容类型。

## 步骤 3c：提取文件和引用模式

来自 `session-store.db`：

```sql
-- Most-touched files per project
SELECT repository, file_path, COUNT(*) AS touch_count
FROM session_files
GROUP BY repository, file_path
ORDER BY touch_count DESC;

-- Linked commits/PRs/issues per session
SELECT session_id, ref_type, ref_value, turn_index
FROM session_refs
ORDER BY session_id, turn_index;
```

**文件访问模式**揭示了哪些文件在架构上很重要 - 在项目页面上记下它们。

**会话参考** 将 Copilot 会话链接到 git 历史记录 — 对于将 wiki 知识与具体代码更改连接起来非常有用。

## 步骤 4：按主题聚类

不要为每个会话创建一个 wiki 页面。相反：

- 跨会话**按主题**对提取的知识进行分组
- 关于“调试身份验证 + 设置 CI”的单个会话 → 两个单独的主题
- 不同日期的三场关于“React 性能”的会议 → 一个合并主题
- `cwd` / `repository` 给您自然的一级分组； `vscode.metadata.json` 的 `customTitle` 提供了人类可读的会话标签

## 步骤 5：提炼成 Wiki 页面

每个 Copilot 项目都映射到 Vault 中的一个项目目录。从 `cwd` 或 `repository` 得出项目名称：

```
C:\Users\name\git\my-project   → my-project
/Users/name/code/another-app   → another-app
```

如果可用，请优先选择 `session-store.db` 中的 `repository`（例如 `owner/repo`），而不是原始 `cwd`。

### 特定项目知识与全球知识

|你发现了什么 |它去哪儿了|示例|
| ----------------------------------- | --------------------------- | ---------------------------------------------------- |
|项目架构决策| `projects/<name>/concepts/` | `projects/my-project/concepts/main-architecture.md` |
|项目特定的调试模式 | `projects/<name>/skills/` | `projects/my-project/skills/api-rate-limiting.md` |
|用户学到的一般概念 | `concepts/`（全球）| `concepts/react-server-components.md` |
|跨项目反复出现的问题 | `skills/`（全球）| `skills/debugging-hydration-errors.md` |
|使用的工具/服务 | `entities/`（全球）| `entities/vercel-functions.md` |
|跨多个会话的模式 | `synthesis/`（全球）| `synthesis/common-debugging-patterns.md` |

对于包含内容的每个项目，在 `projects/<name>/<name>.md` 处创建或更新项目概述页面 — **以项目命名，而不是 `_project.md`**。 Obsidian 的图形视图使用文件名作为节点标签，因此 `_project.md` 使每个项目在图形中显示为 `_project`。将其命名为 `<name>.md` 为每个项目提供了一个独特的、可读的节点名称。

**重要提示：** 提炼_知识_，而不是对话。不要写“在 3 月 15 日的一次会话中，用户询问了 X”。编写知识本身，以会话作为源属性。

**在每个新/更新的页面上写一个 `summary:` frontmatter 字段** — 1-2 个句子，≤200 个字符，回答“此页面是关于什么的？”对于还没有打开它的读者。 `wiki-query` 的廉价检索路径读取此字段以避免打开页面主体。

**将置信度和生命周期字段**添加到每个新页面的 frontmatter：
```yaml
base_confidence: 0.42
lifecycle: draft
lifecycle_changed: <ISO date today>
```
更新时保持 `lifecycle` 不变。

**根据 `llm-wiki` 中的约定标记出处**（出处标记部分）：

- **检查点和index.md**由系统预先提取 - 将检查点派生的声明视为提取的（系统根据观察到的操作编写它们）。
- **内存工件**是用户创作的 - 视为提取。
- **对话转蒸馏**多为推断。你正在从许多回合中综合出一个连贯的主张。将 `^[inferred]` 自由地应用于合成模式、跨会话的概括以及“用户真正的意思”解释。
- 当用户在会话中改变方向或会话结束时未解决时，使用 `^[ambiguous]`。
- 在每个新/更新的页面上写一个 `provenance:` frontmatter 块，总结粗略的组合。

## 步骤 6：更新清单、日志和特殊文件

### 更新`.manifest.json`

对于处理的每个会话，添加/更新其条目：

- `ingested_at`, `session_id`, `updated_at`
- `source_type`：`"copilot_session"`、`"copilot_checkpoint"`、`"copilot_transcript"`、`"copilot_memory_artifact"` 之一
- `project`：解码后的项目名称
- `pages_created` 和 `pages_updated` 列表

还要更新清单的 `projects` 部分：

```json
{
  "project-name": {
    "repository": "owner/repo",
    "cwd": "C:\\Users\\name\\git\\project-name",
    "vault_path": "projects/project-name",
    "last_ingested": "TIMESTAMP",
    "sessions_ingested": 5,
    "sessions_total": 8,
    "checkpoints_ingested": 12,
    "memory_artifacts_ingested": 3
  }
}
```

### 创建日记条目+更新特殊文件

按照标准流程更新 `index.md` 和 `log.md`：

```
- [TIMESTAMP] COPILOT_HISTORY_INGEST projects=N sessions=M checkpoints=C pages_updated=X pages_created=Y mode=append|full
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用一行摘要更新 **最近活动** - 例如“参加了 2 个项目的 5 次 Copilot 会议；揭示了 API 设计和测试策略中的模式。”保留最后 3 次操作。如果现在可以更好地理解任何正在进行的项目，请更新**活动线程**。更新 `updated` 时间戳。

## 隐私

- 提炼和综合——不要逐字复制原始对话文本
- 跳过任何看起来像秘密、API 密钥、密码、token的内容
- 助理事件中的 `data.reasoningOpaque` / `data.reasoningText` 是内部推理 - 完全跳过，切勿复制到 wiki
- 如果您遇到个人/敏感内容，请在添加之前询问用户
- 用户的对话可能会引用其他人 - 仔细考虑 wiki 中的内容

## 参考

有关详细数据结构文档，请参阅 `references/copilot-data-format.md`。

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