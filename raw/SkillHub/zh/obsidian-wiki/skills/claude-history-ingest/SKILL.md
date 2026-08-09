---
name: claude-history-ingest
description: >
  Ingest Claude Code conversation history into the Obsidian wiki. Use this skill when the user wants to mine
  their past Claude conversations for knowledge, import their ~/.claude folder, extract insights from
  previous coding sessions, or says things like "process my Claude history", "add my conversations to the wiki",
  "what have I discussed with Claude before". Also triggers when the user mentions their .claude folder,
  Claude projects, session data, past conversation logs, local-agent-mode sessions, or audit logs.
---

# Claude History Ingest — 对话挖掘

您正在从用户过去的 Claude Code 对话中提取知识，并将其提炼到 Obsidian wiki 中。对话内容丰富但混乱——你的工作是找到信号并对其进行编译。

该技能可以直接调用，也可以通过`wiki-history-ingest`路由器（`/wiki-history-ingest claude`）调用。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `CLAUDE_HISTORY_PATH` （默认为 `~/.claude`）
2. 在vault根读取 `.manifest.json` 以检查已摄取的内容
3. 阅读库根目录中的 `index.md` 以了解 wiki 已包含的内容

## 摄取模式

### 附加模式（默认）

检查每个源文件（对话 JSONL、内存文件）的 `.manifest.json`。唯一过程：

- 不在清单中的文件（新对话、新内存文件、新项目）
- 修改时间比清单中的 `ingested_at` 新的文件

这通常是您想要的 - 用户运行了一些新会话并希望捕获增量。

### 完整模式

处理一切，无论清单如何。在 `wiki-rebuild` 之后或用户明确要求时使用。

## Claude 代码数据布局

Claude Code 将数据存储在两个位置。扫描**两者**。

### 来源 1：`~/.claude/`（CLI 会话）

```
~/.claude/
├── projects/                          # Per-project directories
│   ├── -Users-name-project-a/         # Path-derived name (slashes → dashes)
│   │   ├── <session-uuid>.jsonl       # Conversation data (JSONL)
│   │   └── memory/                    # Structured memories
│   │       ├── MEMORY.md              # Memory index
│   │       ├── user_*.md              # User profile memories
│   │       ├── feedback_*.md          # Workflow feedback memories
│   │       └── project_*.md           # Project context memories
│   ├── -Users-name-project-b/
│   │   └── ...
├── sessions/                          # Session metadata (JSON)
│   └── <pid>.json                     # {pid, sessionId, cwd, startedAt, kind, entrypoint}
├── history.jsonl                      # Global session history
├── tasks/                             # Subagent task data
├── plans/                             # Saved plans
└── settings.json
```

### 来源 2：`~/Library/Application Support/Claude/local-agent-mode-sessions/`（桌面应用程序代理会话）

Claude 桌面应用程序在此处存储本地代理模式会话。该结构是深度嵌套的：

```
~/Library/Application Support/Claude/local-agent-mode-sessions/
└── <outer-uuid>/
    └── <inner-uuid>/
        ├── local_<session-uuid>.json          # Session metadata
        └── local_<session-uuid>/
            ├── audit.jsonl                    # Audit log — tool calls, file reads, commands run
            └── .claude/
                └── projects/
                    └── <path-encoded-name>/   # Same path-encoding as ~/.claude/projects/
                        └── <uuid>.jsonl       # Conversation transcript (same JSONL format as CLI)
```

**如何查找所有本地代理模式会话：**

```bash
# Find all session metadata files
find ~/Library/Application\ Support/Claude/local-agent-mode-sessions -name "local_*.json" -maxdepth 4

# Find all audit logs
find ~/Library/Application\ Support/Claude/local-agent-mode-sessions -name "audit.jsonl"

# Find all conversation transcripts
find ~/Library/Application\ Support/Claude/local-agent-mode-sessions -name "*.jsonl" -path "*/.claude/projects/*"
```

**会话元数据 (`local_<uuid>.json`)** — 包含 `sessionId`、`cwd`、`startedAt`、`model`、`title` 等字段的 JSON 文件。在打开文字记录之前，请先阅读本文以了解会话上下文。

**审核日志 (`audit.jsonl`)** — 每一行都是一个代理操作的 JSON 记录：工具调用（读取、写入、Bash、编辑）、文件访问、执行的 shell 命令、MCP 调用。对于理解*代理实际上做了什么*很有用——通常比单独的对话文本更丰富的信号。字段：`type`、`toolName`、`input`、`output`、`timestamp`、`sessionId`。

**对话记录 (`.claude/projects/.../<uuid>.jsonl`)** — 与 CLI 对话 JSONL 的格式相同。解析方式与`~/.claude/projects/*/*.jsonl`相同。

### 按价值排名的关键数据源（两个地点合并）：

1. **内存文件** (`~/.claude/projects/*/memory/*.md`) — 预先蒸馏，已经对 wiki 友好。金子。
2. **对话 JSONL**（`~/.claude/projects/*/*.jsonl` 和桌面应用程序转录）- 完整的对话转录。富有但吵闹。
3. **审核日志**（桌面会话中的 `audit.jsonl`）— 已完成操作的工具调用级别记录。即使对话稀疏，也可用于提取具体操作、文件模式和命令模式。
4. **会话元数据**（`sessions/*.json` 和 `local_*.json`）— 告诉您哪个项目、时间以及 CWD。

## 第 1 步：调查并计算 Delta

扫描两个数据位置并与 `.manifest.json` 进行比较：

```bash
# --- Source 1: CLI sessions (~/.claude) ---
# Find all projects
Glob: ~/.claude/projects/*/

# Find memory files (highest value)
Glob: ~/.claude/projects/*/memory/*.md

# Find conversation JSONL files
Glob: ~/.claude/projects/*/*.jsonl

# --- Source 2: Desktop app local-agent-mode sessions ---
DESKTOP_SESSIONS="$HOME/Library/Application Support/Claude/local-agent-mode-sessions"

# Session metadata
find "$DESKTOP_SESSIONS" -name "local_*.json" -maxdepth 4

# Audit logs
find "$DESKTOP_SESSIONS" -name "audit.jsonl"

# Conversation transcripts
find "$DESKTOP_SESSIONS" -name "*.jsonl" -path "*/.claude/projects/*"
```

建立统一的清单并对每个文件进行分类：

- **新** — 不在清单中 → 需要摄取
- **修改** - 在清单中，但文件较新 → 需要重新摄取
- **未更改** — 在清单中且未修改 → 在追加模式下跳过

向用户报告：“找到 X 个 CLI 项目，Y 个桌面会话。内存文件：A. 对话：B. 审核日志：C. 增量：D 新的，E 修改的。”

## 步骤 2：首先摄取内存文件

内存文件已经用 YAML frontmatter 构建：

```markdown
---
name: memory-name
description: one-line description
type: user|feedback|project|reference
---

Memory content here.
```

对于每个内存文件：

- 阅读并解析前面的内容
- `user` 类型→输入有关用户的实体页面或有关其域的概念页面
- `feedback` 类型 → 输入技能页面（工作流程模式、什么有效、什么无效）
- `project` 类型 → 输入到项目的实体页面
- `reference` 类型→输入到指向外部资源的参考页面

每个项目中的 `MEMORY.md` 索引文件是一个快速摘要 - 首先阅读它以确定哪些单独的内存文件值得完整阅读。

## 步骤 3：解析会话 JSONL

每个 JSONL 文件都是一个对话会话。每一行都是一个 JSON 对象：

```json
{
  "type": "user|assistant|progress|file-history-snapshot",
  "message": {
    "role": "user|assistant",
    "content": "text string"
  },
  "uuid": "...",
  "timestamp": "2026-03-15T10:30:00.000Z",
  "sessionId": "...",
  "cwd": "/path/to/project",
  "version": "2.1.59"
}
```

对于辅助消息，`content` 可能是内容块的数组：

```json
{
  "content": [
    {"type": "thinking", "text": "..."},
    {"type": "text", "text": "The actual response..."},
    {"type": "tool_use", "name": "Read", "input": {...}}
  ]
}
```

**从对话中提取什么：**

- 仅过滤至 `type: "user"` 和 `type: "assistant"` 条目
- 对于辅助条目，提取 `text` 块（跳过 `thinking` 和 `tool_use` — 这些都是噪音）
- `cwd` 字段告诉您此对话属于哪个项目
- 项目目录名称（例如，`-Users-name-Documents-projects-my-app`）告诉您项目路径

**跳过这些：**

- `type: "progress"` — 内部代理进度更新
- `type: "file-history-snapshot"` — 文件状态跟踪
- 子代理对话（在 `subagents/` 子目录下）——除非用户特别要求

## 步骤 3b：解析审核日志（仅限桌面会话）

对于`local-agent-mode-sessions/`下找到的每个`audit.jsonl`，逐行读取。每一行都是一个代理操作的 JSON 记录：

```json
{
  "type": "tool_call",
  "toolName": "Bash",
  "input": {"command": "npm test"},
  "output": "...",
  "timestamp": "2026-04-10T14:22:00Z",
  "sessionId": "..."
}
```

**从审核日志中提取什么：**

- **文件访问模式** — 代理重复读取或编辑哪些文件？这些是项目中的高价值文件。将它们记为项目参考。
- **Shell 命令** — 重复出现的 Bash 命令揭示了项目的 build/test/deploy 工作流程。将它们提取到 `skills/` 页面（例如“如何构建和测试该项目”）。
- **工具调用序列** — 如果代理始终以特定顺序执行“读取”→“编辑”→“Bash”，那么这是一个值得捕获的工作流程模式。
- **错误模式** - 失败的工具调用（非零退出代码、错误输出）揭示痛点、已知的粗糙边缘或重复出现的错误。
- **MCP 工具调用** — 对 MCP 工具的调用揭示了项目与哪些外部服务和 API 集成。

**跳过审核日志：**

- 例行文件读取无模式（例如读取配置文件一次）
- 工具输出只是噪音（长堆栈跟踪、详细日志）——总结错误类别，而不是完整输出
- 命令参数或输出中任何看起来像秘密、token或凭据的内容

**与对话记录交叉引用：** 审核日志告诉您*发生了什么*；对话告诉你*为什么*。当两者都可用于同一会话时，请一起使用它们 - 审核日志将对话建立在具体的操作基础上。

在处理审核日志之前读取配对的 `local_<uuid>.json` 会话元数据 — 它为您提供 `cwd`、`startedAt` 和 `title` 以将操作置于上下文中。

## 步骤 4：按主题聚类

不要为每个对话创建一个 wiki 页面。相反：

- 在对话中**按主题**对提取的知识进行分组
- 关于“调试身份验证 + 设置 CI”的单个对话 → 两个单独的主题
- 不同日期关于“React 性能”的三场对话 → 一个合并主题
- 项目目录名称给你一个自然的一级分组

## 步骤 5：提炼成 Wiki 页面

每个 Claude 项目都映射到 Vault 中的一个项目目录。 `~/.claude/projects/` 中的项目目录名称对原始路径进行编码 - 对其进行解码以获得干净的项目名称：

```
-Users/Documents/projects/my-Project   → myproject
-Users/Documents/projects/Another-app  → anotherapp
```

### 特定项目知识与全球知识

|你发现了什么 |它去哪儿了|示例|
| ---------------------------------- | --------------------------- | --------------------------------------------------- |
|项目架构决策| `projects/<name>/concepts/` | `projects/my-project/concepts/main-architecture.md` |
|项目具体调试| `projects/<name>/skills/` | `projects/my-project/skills/api-rate-limiting.md` |
|用户学到的一般概念 | `concepts/`（全球）| `concepts/react-server-components.md` |
|跨项目反复出现的问题 | `skills/`（全球）| `skills/debugging-hydration-errors.md` |
|使用的工具/服务 | `entities/`（全球）| `entities/vercel-functions.md` |
|许多对话中的模式| `synthesis/`（全球）| `synthesis/common-debugging-patterns.md` |

对于包含内容的每个项目，在 `projects/<name>/<name>.md` 处创建或更新项目概述页面 — **以项目命名，而不是 `_project.md`**。 Obsidian 的图形视图使用文件名作为节点标签，因此 `_project.md` 使每个项目在图形中显示为 `_project`。将其命名为 `<name>.md` 为每个项目提供了一个独特的、可读的节点名称。

**重要提示：** 提炼_知识_，而不是对话。不要写“在 3 月 15 日的一次对话中，用户询问了 X”。写出知识本身，以对话作为来源归因。

**在每个新/更新的页面上写一个 `summary:` frontmatter 字段** — 1-2 个句子，≤200 个字符，回答“此页面是关于什么的？”对于还没有打开它的读者。 `wiki-query` 的廉价检索路径读取此字段以避免打开页面主体。

**将置信度和生命周期字段**添加到每个新页面的 frontmatter：
```yaml
base_confidence: 0.42
lifecycle: draft
lifecycle_changed: <ISO date today>
```
更新时，保持 `lifecycle` 和 `lifecycle_changed` 不变 - 只有人工编辑器才能转换生命周期状态。

**根据 `llm-wiki` 中的约定标记出处**（出处标记部分）：

- **内存文件**大部分被提取 - 用户手工编写它们并且它们已经被提炼。将源自内存的声明视为提取的，除非您将多个内存文件中的声明拼接在一起。
- **对话蒸馏**主要是推断。你从多次对话中综合出一个连贯的主张，通常会填充隐含的推理。将 `^[inferred]` 自由地应用于合成模式、跨会话的概括以及“用户真正的意思”解释。
- 当用户在会话中改变主意或助手和用户相互矛盾且解决方案不清楚时，请使用 `^[ambiguous]`。
- 在每个新/更新的页面上写一个 `provenance:` frontmatter 块，总结粗略的组合。

## 步骤 6：更新清单、日志和特殊文件

### 更新`.manifest.json`

对于处理的每个源文件，添加/更新其条目：

- `ingested_at`, `size_bytes`, `modified_at`
- `source_type`：`"claude_conversation"`、`"claude_memory"`、`"claude_audit_log"`、`"claude_desktop_session"` 之一
- `project`：解码后的项目名称
- `pages_created` 和 `pages_updated` 列表

还要更新清单的 `projects` 部分：

```json
{
  "project-name": {
    "source_path": "~/.claude/projects/-Users-...",
    "vault_path": "projects/project-name",
    "last_ingested": "TIMESTAMP",
    "conversations_ingested": 5,
    "conversations_total": 8,
    "memory_files_ingested": 3,
    "desktop_sessions_ingested": 2,
    "audit_logs_ingested": 2
  }
}
```

### 创建日记条目+更新特殊文件

按照标准流程更新 `index.md` 和 `log.md`：

```
- [TIMESTAMP] CLAUDE_HISTORY_INGEST projects=N conversations=M desktop_sessions=D audit_logs=A pages_updated=X pages_created=Y mode=append|full
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用一行摘要更新 **最近活动** - 例如“在 2 个项目中吸收了 5 次 Claude 对话；揭示了 API 设计和测试策略中的模式。”保留最后 3 次操作。如果现在可以更好地理解任何正在进行的项目，请更新**活动线程**。更新 `updated` 时间戳。

## 隐私

- 提炼和综合——不要逐字复制原始对话文本
- 跳过任何看起来像秘密、API 密钥、密码、token的内容
- 如果您遇到个人/敏感内容，请在添加之前询问用户
- 用户的对话可能会引用其他人 - 仔细考虑 wiki 中的内容

## 参考

有关数据结构的更多详细信息，请参阅 `references/claude-data-format.md`。

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