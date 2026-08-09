# Claude 代码数据格式 — 详细参考

## 项目目录

`~/.claude/projects/` 包含用户使用 Claude Code 打开的每个项目的一个目录。目录名称编码绝对路径：

```
/Users/name/Documents/projects/my-app → -Users/name/Documents/projects/my-app
```

要恢复原始路径：将前导 `-` 替换为 `/`，然后小心替换其余的 `-`（目录名称中也会出现破折号）。会话/对话数据中的 `cwd` 字段为您提供规范路径。

### 对话 JSONL 文件

位于`~/.claude/projects/<project-dir>/<session-uuid>.jsonl`。

每一行都是一个事件。相关事件类型：

| `type` |它是什么 |值得一读吗？                           |
| ----------------------- | --------------------------- | ---------------------------------------- |
| `user` |用户留言 |是的 - 这就是用户问/说的 |
| `assistant` |助理回应|是的 - 从内容中提取 `text` 块 |
| `progress` |工具执行进度 |否 — 内部管道 |
| `file-history-snapshot` |会话开始时的文件状态 |不——只是文件列表|

#### 用户消息结构

```json
{
  "type": "user",
  "message": { "role": "user", "content": "the user's message as a string" },
  "timestamp": "2026-03-15T10:30:00.000Z",
  "sessionId": "uuid",
  "cwd": "/Users/name/Documents/projects/my-app"
}
```

#### 助手消息结构

```json
{
  "type": "assistant",
  "message": {
    "role": "assistant",
    "content": [
      { "type": "thinking", "text": "internal reasoning (skip this)" },
      { "type": "text", "text": "The actual visible response" },
      {
        "type": "tool_use",
        "id": "...",
        "name": "Read",
        "input": { "file_path": "..." }
      }
    ]
  },
  "timestamp": "2026-03-15T10:30:05.000Z"
}
```

**提取策略：** 仅从辅助内容数组中提取 `text` 类型的块。 `thinking` 块是内部推理，而 `tool_use` 块是机械动作 - 两者都没有添加具有 wiki 价值的知识。

### 内存文件

位于`~/.claude/projects/<project-dir>/memory/`。

每个内存文件都有 YAML frontmatter：

```markdown
---
name: descriptive-name
description: one-line summary used for relevance matching
type: user|feedback|project|reference
---

The memory content. For feedback/project types, structured as:
rule/fact, then **Why:** and **How to apply:** lines.
```

**内存类型及其 wiki 值：**

|类型 |包含 |维基地图|
| ----------- | ---------------------------------------- | ------------------------------------------------------ |
| `user` |用户的角色、偏好、专业知识 |关于用户的实体页面或其他页面的上下文 |
| `feedback` |工作流程修正和确认|技能页面——“如何有效地工作”|
| `project` |积极的工作、目标、决定、截止日期|项目的实体页面 |
| `reference` |指向外部资源的指针|参考页|

每个内存目录中的`MEMORY.md`是一个单行摘要的索引。首先阅读它以进行分类。

### 会话元数据

位于`~/.claude/sessions/<pid>.json`。光元数据：

```json
{
  "pid": 12345,
  "sessionId": "uuid",
  "cwd": "/Users/name/Documents/projects/my-app",
  "startedAt": "2026-03-15T10:30:00.000Z",
  "kind": "interactive",
  "entrypoint": "cli"
}
```

对于建立用户何时从事什么工作的时间表很有用。

### 全球历史

`~/.claude/history.jsonl` — 所有会话的仅附加日志。用于时间线重建。

## 处理订单

为了获得最大效率：

1. **MEMORY.md 索引** — 快速分类每个项目所知道的内容
2. **单独的内存文件** — 预先提取的知识，最高的信噪比
3. **Conversation JSONL** — 丰富但冗长，选择性处理
4. **会话元数据** — 仅当您需要时间线上下文时
