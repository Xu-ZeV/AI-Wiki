# GitHub Copilot CLI 数据格式 — 详细参考

## 会话状态目录

`~/.copilot/session-state/` 包含用户使用 GitHub Copilot CLI 运行的每个会话一个目录。每个目录都以 UUID 命名。

### `workspace.yaml`

最小会话元数据文件，始终存在：

```yaml
id: <session-uuid>
cwd: /path/to/project
summary_count: 3
created_at: 2026-04-02T14:28:13.304Z
updated_at: 2026-04-29T12:00:00.000Z
```

`summary_count`反映了写入了多少个检查点。与 `summary_count: 0` 的会话要么非常短，要么在没有检查点的情况下完成 - 无论如何检查 `events.jsonl` 的内容。

### `vscode.metadata.json`

VS Code 上下文，当会话与 VS Code 工作区关联时写入：

```json
{
  "workspaceFolder": {
    "folderPath": "c:\\Users\\name\\git\\my-project",
    "timestamp": 1773245818098
  },
  "writtenToDisc": true,
  "repositoryProperties": {
    "repositoryPath": "c:\\Users\\name\\git\\my-project",
    "branchName": "feature/my-branch",
    "baseBranchName": "origin/main"
  },
  "customTitle": "User-written session label or system-set title"
}
```

`customTitle` 是最易读的会话标签 - 在创建会话派生的 wiki 内容时将其用作标题。可能缺席较早的会议。

### `events.jsonl`

一个会话的完整事件日志。每一行都是一个 JSON 对象，表示会话中的一个事件。

#### 事件：`session.start`

```json
{
  "type": "session.start",
  "data": {
    "sessionId": "09371a50-9a50-484a-8743-5c696de1623a",
    "version": 1,
    "producer": "copilot-agent",
    "copilotVersion": "0.0.420",
    "startTime": "2026-03-02T15:10:04.678Z",
    "context": {
      "cwd": "C:\\Users\\name\\git\\my-project",
      "gitRoot": "C:\\Users\\name\\git\\my-project",
      "branch": "master"
    }
  },
  "id": "<event-uuid>",
  "timestamp": "2026-03-02T15:10:04.817Z",
  "parentId": null
}
```

`data.context.cwd` 和 `data.context.branch` 建立项目上下文。请务必先阅读 `session.start`。

#### 事件：`user.message`

```json
{
  "type": "user.message",
  "data": {
    "content": "review my staged but uncommitted changes for issues",
    "transformedContent": "<current_datetime>...</current_datetime>\n\nreview my staged...",
    "attachments": [],
    "interactionId": "9352571e-a0b9-4774-8ecb-40bc58f86e94"
  },
  "id": "<event-uuid>",
  "timestamp": "2026-03-02T15:10:45.058Z",
  "parentId": "<parent-event-uuid>"
}
```

使用 `data.content`（不是 `data.transformedContent`）——转换后的版本包含注入的系统上下文，这对于 wiki 来说是噪音。

#### 事件：`assistant.message`

```json
{
  "type": "assistant.message",
  "data": {
    "messageId": "<uuid>",
    "content": "I'll review the staged changes in those three files.",
    "toolRequests": [
      {
        "toolCallId": "tooluse_...",
        "name": "report_intent",
        "arguments": { "intent": "Reviewing staged changes" },
        "type": "function"
      },
      {
        "toolCallId": "tooluse_...",
        "name": "powershell",
        "arguments": {
          "command": "git --no-pager diff --cached --stat",
          "description": "Show staged diff"
        },
        "type": "function"
      }
    ],
    "interactionId": "9352571e-a0b9-4774-8ecb-40bc58f86e94",
    "reasoningOpaque": "<base64-encrypted-reasoning>",
    "reasoningText": "The user wants me to review staged git changes..."
  },
  "id": "<event-uuid>",
  "timestamp": "2026-03-02T15:10:50.235Z",
  "parentId": "<parent-event-uuid>"
}
```

**提取策略：**

- 提取 `data.content` — 助手的可见文本响应
- `data.toolRequests` — 文件/命令模式的浏览工具名称和描述参数；忽略 `report_intent` 呼叫
- **完全跳过 `data.reasoningOpaque`** — 加密/编码的内部推理
- **完全跳过 `data.reasoningText`** — 解密推理；仅限内部，用户不可见

#### 事件：`assistant.turn_start`

```json
{
  "type": "assistant.turn_start",
  "data": { "turnId": "0", "interactionId": "..." },
  "id": "...",
  "timestamp": "..."
}
```

标记助理回合的开始。对于转弯边界检测很有用；没有可提取的内容。

#### 事件：`tool.execution_start`

```json
{
  "type": "tool.execution_start",
  "data": {
    "toolCallId": "tooluse_...",
    "toolName": "powershell",
    "arguments": { "command": "dotnet build ...", "description": "Build project" }
  },
  "id": "...",
  "timestamp": "..."
}
```

显示调用了哪些工具（文件读取、命令、搜索）。直接读取事件时，与文件相关的工具（`view`、`edit`、`create`）及其路径对于 `session_files` 等效工具值得注意。

#### 事件：`tool.execution_end`

包含原始工具输出。通常是噪音——除非诊断错误，否则请跳过。

### `checkpoints/<uuid>.json`

课程中期进度摘要，随着课程进展自动写入：

```json
{
  "title": "Implementing auth module",
  "overview": "Working on JWT authentication for the API...",
  "history": "1. Analyzed existing auth code\n2. Created IAuthService...",
  "work_done": "- Created IAuthService interface\n- Implemented JwtAuthService",
  "technical_details": "Uses RS256 signing. Token expiry configurable via settings...",
  "important_files": "- src/Auth/IAuthService.cs\n- src/Auth/JwtAuthService.cs",
  "next_steps": "- Wire up to DI container\n- Add refresh token support"
}
```

这是每个会话目录中价值最高的结构化内容——相当于克劳德的内存文件。

### `index.md`

会话结束摘要以 Markdown 文件形式编写。通常用 1-3 段总结所完成的工作。内容因会话长度和复杂程度而异。在打开 `events.jsonl` 之前阅读此内容，以确定会话是否值得深度处理。

---

## 全局会话存储 (`session-store.db`)

SQLite 数据库位于 `~/.copilot/session-store.db`。规范的跨会话记录。

### 架构

#### `sessions`

|专栏 |类型 |笔记|
| ----------- | ---- | ------------------------------------------ |
| `id` |文本 |会话 UUID (PK) |
| `cwd` |文本 |工作目录 |
| `repository`|文本 | `owner/repo` 格式可用 |
| `branch` |文本 | Git 分支名称 |
| `summary` |文本 |一段会议摘要 |
| `created_at`|文本 | ISO 8601 时间戳 |
| `updated_at`|文本 | ISO 8601 时间戳 — 用于增量检查 |
| `host_type` |文本 | `"vscode"`、`"cli"` 或类似 |

#### `turns`

|专栏 |类型 |笔记|
| ------------------- | ------- | ------------------------------ |
| `id` |整数| PK |
| `session_id` |文本 | FK → `sessions.id` |
| `turn_index` |整数|从 0 开始的回合序列 |
| `user_message` |文本 |原始用户消息 |
| `assistant_response`|文本 |助理短信回复 |
| `timestamp` |文本 | ISO 8601 时间戳 |

注意：这里的`user_message`是转换前的内容——使用这个，而不是`events.jsonl`中的`transformedContent`。

#### `checkpoints`

|专栏 |类型 |笔记|
| ------------------- | ------- | ------------------------------ |
| `id` |整数| PK |
| `session_id` |文本 | FK → `sessions.id` |
| `checkpoint_number` |整数| 1 为基础 |
| `title` |文本 |短标题 |
| `overview` |文本 |高层总结|
| `history` |文本 |一步一步发生的事情 |
| `work_done` |文本 |已完成项目 |
| `technical_details` |文本 |实施细节|
| `important_files` |文本 |触及的关键文件 |
| `next_steps` |文本 |打开线程 |
| `created_at` |文本 | ISO 8601 时间戳 |

#### `session_files`

|专栏 |类型 |笔记|
| -------------- | ------- | -------------------------------------------------- |
| `session_id` |文本 | FK → `sessions.id` |
| `file_path` |文本 |文件的绝对路径 |
| `tool_name` |文本 | `"edit"`、`"create"`、`"view"` 等 |
| `turn_index` |整数|哪个回合触及了文件|
| `first_seen_at`|文本 | ISO 8601 时间戳 |

> ⚠️ 没有 `id` 列 — 使用 `COUNT(DISTINCT sf.file_path)` 而不是 `COUNT(DISTINCT sf.id)`。

按 `file_path` 跨会话进行聚合，以识别架构上重要的文件。

#### `session_refs`

|专栏 |类型 |笔记|
| ------------ | ------- | ------------------------------------------ |
| `id` |整数| PK |
| `session_id` |文本 | FK → `sessions.id` |
| `ref_type` |文本 | `"commit"`、`"pr"`、`"issue"` |
| `ref_value` |文本 |提交 SHA、PR 号、问题号 |
| `turn_index` |整数|哪个回合引用了它 |
| `created_at` |文本 | ISO 8601 时间戳 |

#### `search_index` (FTS5)

全文搜索索引。在调查大量历史记录时用于关键字发现：

```sql
SELECT content, session_id, source_type
FROM search_index
WHERE search_index MATCH 'auth OR authentication OR login'
LIMIT 20;
```

`source_type` 值：`"turn"`、`"checkpoint_overview"`、`"checkpoint_history"`、`"checkpoint_work_done"`、`"checkpoint_technical"`、`"checkpoint_files"`、`"checkpoint_next_steps"`、 `"workspace_artifact"`。

---

## VS Code 工作区存储

### 地点

`workspaceStorage` 目录是特定于平台的：

|平台|默认路径 |
| -------- | ------------------------------------------------------------------ |
|窗户 | `%APPDATA%\Code\User\workspaceStorage\` |
| macOS | `~/Library/Application Support/Code/User/workspaceStorage/` |
| Linux | `~/.config/Code/User/workspaceStorage/` |

每个 `<hash>/` 子目录对应一个特定的工作区（VS Code 文件夹）。哈希值源自工作空间路径 - 没有人类可读的映射，因此枚举所有 `<hash>/GitHub.copilot-chat/` 目录并使用 `transcripts/` JSONL 文件的 `session.start` 事件来识别每个目录属于哪个项目。

### 脚本 JSONL (`transcripts/<uuid>.jsonl`)

与源 1 中的 `events.jsonl` 格式相同。使用相同的事件类型处理程序进行解析。 `session.start` 事件的 `data.context.cwd` 告诉您这属于哪个项目。

### 记忆文物 (`memory-tool/memories/<base64-session-id>/`)

目录名称是编码为 base64 的会话 UUID。里面的文件是用户或系统在会话期间明确保存的 Markdown 文档 - 通常包含会话计划的 `plan.md`。

解码目录名称以将其链接到会话：

```python
import base64
# Pad to multiple of 4 before decoding
session_id = base64.b64decode(dir_name + '==').decode('utf-8')
```

---

## 处理订单

为了获得最大效率和信噪比：

1. **`session-store.db` 检查点** — 最快、信号最高。一次性全部查询。
2. **`session-store.db`sessions.summary** — 每个会话的一段概要。
3. **每会话 `checkpoints/*.json` + `index.md`** — 适用于 `session-store.db` 中尚未包含的会话或其他详细信息。
4. **内存伪影** (`memory-tool/memories/`) — 用户创作，高质量。
5. **`session-store.db` 转** — 完整对话，按主题选择性处理。
6. **`events.jsonl` / 转录 JSONL** — 仅当 `session-store.db` 不存在或不完整时。
7. **`session_files` / `session_refs`** — 用于文件模式和 git 链接元数据。
