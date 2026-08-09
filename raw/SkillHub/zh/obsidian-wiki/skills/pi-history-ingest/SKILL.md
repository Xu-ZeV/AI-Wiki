---
name: pi-history-ingest
description: >
  Ingest Pi coding agent session history into the Obsidian wiki. Use this skill when the user wants to mine
  their past Pi sessions for knowledge, import their ~/.pi/agent/sessions folder, extract insights from
  previous coding sessions, or says things like "process my Pi history", "add my Pi sessions to the wiki",
  "ingest ~/.pi", or "what have I worked on in Pi". Also triggers when the user mentions Pi sessions,
  Pi agent history, ~/.pi/agent/sessions, or Pi conversation logs.
---

# Pi 历史摄取 — 会话挖掘

您正在从用户的 Pi 编码代理会话中提取知识，并将其提炼到 Obsidian wiki 中。 Pi 会话存储为具有树形布局的结构化 JSONL — 您的工作是跟踪活动分支，提取持久知识并编译它。

该技能可以直接调用，也可以通过`wiki-history-ingest`路由器（`/wiki-history-ingest pi`）调用。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `PI_HISTORY_PATH` （默认为 `~/.pi/agent/sessions`）
2. 读取vault根目录中的 `.manifest.json` 以检查已摄取的内容
3. 阅读库根目录中的 `index.md` 以了解 wiki 已包含的内容

## 摄取模式

### 附加模式（默认）

检查每个源文件的 `.manifest.json`。唯一过程：

- 文件不在清单中（新会话）
- 清单中修改时间晚于 `ingested_at` 的文件

使用此模式进行定期同步。

### 完整模式

处理一切，无论清单如何。在 `wiki-rebuild` 之后或用户明确要求完全重新摄取时使用。

## Pi 数据布局

Pi将会话存储在`~/.pi/agent/sessions/`（或`PI_CODING_AGENT_SESSION_DIR`设置的路径）下。

```
~/.pi/agent/sessions/
├── --<cwd-path>--/                    # Working directory with / replaced by -
│   └── <timestamp>_<uuid>.jsonl       # Session JSONL file
└── ...
```

会话文件名包含 ISO 时间戳和 UUID。父目录对创建会话的工作目录进行编码。

### 会话 JSONL 格式

每个 `.jsonl` 文件都是 JSON 对象序列。第一行始终是 `session` 标头；随后的行是带有 `id` 和 `parentId` 的树条目。

按键输入类型：

| `type` |目的|摄取？ |
|---|---|---|
| `session` |带有 `cwd`、`version`、`id`、`timestamp` 的标头 |仅元数据 |
| `message` |对话轮（`user`、`assistant`、`toolResult`、`bashExecution` 等）| **主要来源** |
| `session_info` |通过 `/name` 设置显示名称 |对于会议标题 |
| `compaction` |上下文压缩总结 | **高信号** |
| `branch_summary` |通过`/tree`切换分支时的总结 | **高信号** |
| `model_change` |型号切换事件|跳过|
| `thinking_level_change` |思维层面的改变|跳过|
| `custom` |扩展状态（不在LLM上下文中）|跳过|
| `custom_message` |扩展注入消息 |仅上下文 |
| `label` |用户书签/标签|跳过|

### `message` 条目中的消息角色

- `user` — 用户输入； `content` 是字符串或 `(TextContent \| ImageContent)[]`
- `assistant` — 助理响应； `content` 是 `(TextContent \| ThinkingContent \| ToolCall)[]`
- `toolResult` — 工具执行结果； `content` 是 `(TextContent \| ImageContent)[]`
- `bashExecution` — bash 命令+输出； `command`、`output`、`exitCode`
- `branchSummary` — 分支交换机摘要； `summary` 字符串
- `compactionSummary` — 压实摘要； `summary` 字符串

### 按价值排名的关键数据源

1. **`message` 条目 (`user` + `assistant`)** — 完整对话记录；富有但吵闹
2. **`compaction` 条目** — 旧上下文的预先综合摘要；黄金
3. **`branch_summary` 条目** — 废弃分支的摘要；信号好
4. **`bashExecution` 条目** — 具体命令运行；对于工作流程模式有用
5. **`session_info` 条目** — 主题推理的会话名称

跳过 `model_change`、`thinking_level_change`、`custom`（扩展状态）和 `label` 条目。

## 第 1 步：调查并计算 Delta

扫描 `PI_HISTORY_PATH` 并与 `.manifest.json` 进行比较：

```bash
# List all session files
find ~/.pi/agent/sessions -name "*.jsonl" -type f

# Or with custom path
find "$PI_HISTORY_PATH" -name "*.jsonl" -type f
```

建立库存。对于每个会话文件，记录：
- `path` — 绝对路径
- `cwd` — 从父目录名称解码 (`--<path>--` → `/path`)
- `session_name` — 来自最新的 `session_info` 条目（如果有）
- `modified_at` — 文件修改时间
- `already_ingested` — 存在于 `.manifest.json`

对每个文件进行分类：
- **新** - 不在清单中
- **已修改** — 在清单中，但文件比 `ingested_at` 新
- **未改变** — 已被摄入且未改变

在深度解析之前报告简明的增量摘要：
>“在 K 个项目中找到 N 个 Pi 会话。Delta：X 是新的，Y 是修改的。”

## 步骤 2：解析会话 JSONL

对于每个选定的会话文件，逐行读取它。由于会话使用树结构，因此首先构建活动分支：

1.将所有条目按`id`解析成一个map
2.查找当前叶子（没有子项的条目，或最后一个`message`条目）
3.从叶子到根遍历`parentId`链以获得活动路径
4. 颠倒路径，使其按时间顺序排列

### 提取规则

从活动路径中提取：

- **`session` 标头** — `cwd`、`timestamp`、`parentSession`（如果分叉）
- **`session_info`** — 用于会话标题/主题推断的 `name` 字段
- **`message` 条目与 `role: "user"`** — 提取 `content` 文本（跳过图像）
- **`message` 条目与 `role: "assistant"`** — 提取 `text` 内容块；跳过 `thinking` 块（噪声）；注意 `toolCall` 块（它们揭示了代理实际做了什么）
- **`message` 条目与 `role: "toolResult"`** — 总结结果，而不是完整输出
- **`message` 条目与 `role: "bashExecution"`** — 提取命令 + 退出代码；重复命令揭示了 build/test/deploy 工作流程
- **`compaction` 条目** — 逐字读取 `summary`；它已经被蒸馏了
- **`branch_summary` 条目** — 逐字读取 `summary`；捕捉废弃的进场

### 跳过/噪声过滤器

- `thinking` 内容块——内部推理，非持久知识
- 图像内容块 - 除非用户明确要求图像转录，否则跳过
- 原始工具输出超过 500 个字符 - 总结结果
- token记账（`usage` 字段）— 仅元数据
- 重复计划回显或状态更新

### 关键隐私过滤器

会话日志可以包括注入的指令、工具负载和敏感文本。不要逐字摄取。

- 删除 API 密钥、token、密码、凭据
- 编辑私人标识符，除非相关且经过用户批准
- 总结包含路径、环境变量或秘密的 bash 输出
- 如果原始 `toolCall` 参数包含敏感数据，请勿逐字引用它们

## 步骤 3：按主题聚类

不要为每个会话创建一个 wiki 页面。

- 在许多课程中按稳定主题对知识进行分组
- 将混合会议分成单独的主题
- 合并跨日期和项目的重复模式
- 使用会话标头中的 `cwd` 来推断项目范围
- 使用 `session_info.name` 作为主题提示（如果可用）

## 步骤 4：提炼成 Wiki 页面

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
  - `^[extracted]` 直接基于显式会话内容（压缩/分支摘要、显式辅助语句）
  - `^[inferred]` 跨多个会话合成模式或从工具调用推断时
  - `^[ambiguous]` 当会话冲突或压缩摘要与后续回合相矛盾时
- 为每个更改的页面添加/更新 `provenance:` frontmatter mix

**根据 `llm-wiki` 中的约定标记出处**：
- `compaction` 和 `branch_summary` 条目已预先提取 - 大部分视为 `^[extracted]`
- 对话蒸馏主要是 `^[inferred]` — 你是从对话中合成的
- 当用户在会话中改变主意或压缩摘要与后续对话轮次不一致时，使用 `^[ambiguous]`

## 步骤 5：更新清单、日志和索引

### 更新`.manifest.json`

对于每个已处理的源文件：

- `ingested_at`, `size_bytes`, `modified_at`
- `source_type`: `pi_session`
- `project`：从解码的 `cwd` 推断出项目名称
- `pages_created`, `pages_updated`

添加/更新顶级摘要块：

```json
{
  "pi": {
    "source_path": "~/.pi/agent/sessions/",
    "last_ingested": "TIMESTAMP",
    "sessions_ingested": 12,
    "sessions_total": 40,
    "pages_created": 5,
    "pages_updated": 12
  }
}
```

### 更新特殊文件

更新`index.md`和`log.md`：

```
- [TIMESTAMP] PI_HISTORY_INGEST sessions=N pages_updated=X pages_created=Y mode=append|full
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用一行摘要更新 **最近活动** - 例如“在 3 个项目中吸收了 12 个 Pi 会话；在 CLI 工具和 API 设计中浮现出模式。”保留最后 3 次操作。更新 `updated` 时间戳。

## 隐私和合规性

- 蒸馏和合成；避免原始转录本转储
- 默认对任何看起来敏感的内容进行编辑
- 在存储个人或敏感详细信息之前询问用户
- 尽量减少对他人的提及并有目的

## 参考

有关字段级解析注释和提取指南，请参阅 `references/pi-data-format.md`。

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
