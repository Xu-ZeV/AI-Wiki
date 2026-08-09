---
name: wiki-agent
description: >
  Query-driven targeted ingest from a specific AI agent's raw history. Use this skill when the user
  invokes /wiki-claude, /wiki-codex, /wiki-hermes, /wiki-openclaw, /wiki-copilot, /wiki-pi — with or without a
  search topic. Different from wiki-history-ingest (which bulk-ingests everything new): this skill finds
  sessions about a SPECIFIC TOPIC in a specific agent's history and ingests just those, then returns a
  synthesized answer immediately usable in the current session. Primary use case: you're working in
  agent A and want to pull in how you solved X in agent B's history. Cross-referencing, not archiving.
  Also trigger on: "what did I work on in codex about X", "search my claude sessions for Y",
  "pull in hermes knowledge about Z", "find that conversation where I did X in codex".
---

# Wiki Agent — 有针对性的跨代理历史搜索 + 摄取

您正在从一个特定 AI 代理的原始对话历史记录中进行**查询驱动的定向摄取**。用户现在通常在“不同的”代理中工作，并且希望从另一个代理过去的会话中获取上下文。

这不是批量摄取。您可以找到有关特定主题的会话，提取相关的 blob，将它们提炼到 wiki 中，然后返回用户可以立即采取行动的综合答案。

## 命令路由

解析调用以确定目标代理和可选查询：

|命令 |目标|示例|
|---|---|---|
| `/wiki-claude [query]` |克劳德·代码历史 | `/wiki-claude "how did I set up auth middleware"` |
| `/wiki-codex [query]` | Codex CLI 历史 | `/wiki-codex "rust ownership patterns"` |
| `/wiki-hermes [query]` |爱马仕代理历史| `/wiki-hermes "memory architecture"` |
| `/wiki-openclaw [query]` | OpenClaw 历史 | `/wiki-openclaw "project planning approach"` |
| `/wiki-copilot [query]` |副驾驶聊天记录 | `/wiki-copilot "test strategy for API routes"` |
| `/wiki-pi [query]` | Pi代理历史| `/wiki-pi "how did I refactor the auth module"` |

如果未给出查询，则默认为**最近会话模式**：从该代理获取最后 5 个未处理的会话并返回所发现内容的摘要。这相当于仅针对该代理的聚焦 `wiki-history-ingest`。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`。
2. 阅读 `$OBSIDIAN_VAULT_PATH/.manifest.json` → 了解已经摄入的内容。
3. 阅读 `$OBSIDIAN_VAULT_PATH/hot.md`（如果存在）→ 最近 wiki 活动的温暖上下文。

---

## 步骤 1：找到代理的历史根目录

|代理|默认路径 |配置覆盖 |
|---|---|---|
| `claude` | `~/.claude` + `~/Library/Application Support/Claude/local-agent-mode-sessions/` | `CLAUDE_HISTORY_PATH` 在 `.env` |
| `codex` | `~/.codex` | `CODEX_HISTORY_PATH` 在 `.env` |
| `hermes` | `~/.hermes` |环境中的 `HERMES_HOME` 或 `.env` |
| `openclaw` | `~/.openclaw` | `OPENCLAW_HOME` 在 `.env` |
| `copilot` | `~/.copilot` | `COPILOT_HISTORY_PATH` 在 `.env` |
| `pi` | `~/.pi/agent/sessions` | `PI_HISTORY_PATH` 在 `.env` |

如果历史根目录不存在，则停止并告诉用户：“在 `<path>` 处找不到 `<agent>` 历史记录。您在本机上运行过 `<agent>` 吗？您可以在 `.env` 中使用 `<CONFIG_VAR>` 设置自定义路径。”

---

## 步骤 2：建立会话清单

为每个代理使用**最便宜的索引源** - 在知道哪些文件相关之前不要打开会话文件。

### 克劳德
```
Primary index:   ~/.claude/projects/  (directories = projects, files = sessions)
Session files:   ~/.claude/projects/*/*.jsonl
Desktop index:   find ~/Library/Application Support/Claude/local-agent-mode-sessions -name "local_*.json"
Signal fields:   sessionId, cwd, startedAt, title (in local_*.json)
```
构建会话列表：`{path, project_dir, modified_at, already_ingested}`。

### 法典
```
Primary index:   ~/.codex/session_index.jsonl
Session files:   ~/.codex/sessions/**/rollout-*.jsonl
Signal fields:   thread_id, name/title, updated_at (in session_index.jsonl)
```
读取 `session_index.jsonl` 作为库存。每行：`{thread_id, name, updated_at}`。通过匹配目录名称将线程 ID 映射到部署文件。

### 爱马仕
```
Primary index:   ~/.hermes/memories/*.md  (fast to scan)
Session files:   ~/.hermes/sessions/**/*.jsonl
Signal fields:   file names, memory titles, first 3 lines of each memory
```
首先扫描内存文件名（它们通常按主题命名）。返回到会话列表。

### 开爪
```
Primary index:   ~/.openclaw/workspace/memory/MEMORY.md  (structured long-term memory)
Daily notes:     ~/.openclaw/workspace/memory/YYYY-MM-DD.md
Session index:   ~/.openclaw/agents/*/sessions/sessions.json
Session files:   ~/.openclaw/agents/*/sessions/*.jsonl
```
首先阅读 `MEMORY.md` 部分 - 这是所有内容的预编译摘要。每日笔记给出了新近度信号。

### 副驾驶
```
Primary index:   session filenames / directory listing
Session files:   varies by client (VS Code: ~/.copilot/sessions/*.jsonl or similar)
Signal fields:   session timestamps, file names
```

### 圆周率
```
Primary index:   ~/.pi/agent/sessions/--<cwd>--/ directories
Session files:   ~/.pi/agent/sessions/--<cwd>--/<timestamp>_<uuid>.jsonl
Signal fields:   cwd (decoded from dir name), session_info.name, timestamp in filename
```
首先扫描会话目录。解码 `--<cwd>--` 以获取工作目录。读取第一行（会话标头）和会话名称的任何 `session_info` 条目。没有单独的索引文件——文件系统就是索引。

---

## 步骤 3：根据查询对会话进行评分

如果给出查询，则对清单中的每个会话进行评分，而无需打开完整的会话文件：

1. **名称/标题匹配** — 会话名称或话题标题是否包含查询术语？分数：+3
2. **CWD/项目匹配** — 工作目录是否建议正确的项目？分数：+2
3. **新近度** — 过去 90 天的会话得分高于较旧的会话。得分：每 30 天新近度等级 +1（最多 +3）
4. **已摄取** — 如果此会话之前已摄取并且 wiki 页面已涵盖查询（检查 `hot.md` + `index.md`），则标记为“已涵盖”但仍显示在结果中

按分数选择**前 3-5 个课程**。如果未给出查询，则选择最近 5 个未处理的会话。

---

## 步骤 4：提取相关 Blob

打开每个选定的会话文件并仅提取与查询相关的内容。 **如果会话很大，请勿读取完整会话 - 使用目标提取。**

### 每个代理的提取策略

**克劳德**（JSONL 对话）：
- 每行：`{role, content, timestamp, ...}`
- 搜索：`grep -i "<query terms>" <session.jsonl>` 查找相关行
- 摘录：周围的对话窗口（每次点击前 10 行 + 后 20 行）
- 特殊信号：工具调用（读/写/Bash/编辑）揭示实际完成的操作 - 如果它们位于相关窗口中，即使没有关键字匹配，也可以提取这些内容

**Codex**（推出 JSONL）：
- 每行：`{type: "session_meta|turn_context|event_msg|response_item", ...}`
- 过滤至 `type: "event_msg"`（用户转动）和 `type: "response_item"`（模型输出）
- 搜索：`grep -i "<query terms>" <rollout.jsonl>`
- 摘录：匹配回合+其父上下文（匹配之前的 `turn_context`）
- 跳过：`session_meta` 事件（操作元数据，而不是知识）

**Hermes**（内存文件+会话 JSONL）：
- 对于内存文件：阅读完整文件（它们很短 - 通常每个<500字）
- 对于会话 JSONL：`grep -i "<query terms>"` + 周围窗口
- 标题匹配的记忆文件→完整阅读；其他 → 仅 grep

**OpenClaw**（MEMORY.md + 每日笔记 + 会话 JSONL）：
- `MEMORY.md`：grep 包含查询项的节标题 → 提取该节
- 每日笔记：grep最近30天的查询词→提取匹配的段落
- 会话 JSONL：与 Claude 相同的 grep-window 方法
- 与会话 JSONL 相比，更喜欢 MEMORY.md/每日笔记（它们是预先合成的）

**副驾驶**（会话 JSONL）：
- 与 Claude 相同的 grep-window 方法
- 查找检查点文件（如果可用）（预先汇总）

**Pi**（具有树形布局的结构化 JSONL）：
- 每行都是一个树条目：`{type, id, parentId, timestamp, message?, ...}`
- 构建活动分支：按 `id` 映射条目，找到叶子（没有子节点的最后一个条目），将 `parentId` 走到根
- 搜索：`grep -i "<query terms>" <session.jsonl>` 以查找匹配的条目
- 提取：匹配条目+活动分支上的祖先（跟随父链）
- 特殊信号：助理消息中的 `toolCall` 块揭示了实际完成的操作 - 如果它们位于相关窗口中，即使没有关键字匹配，也可以提取这些内容
- 首选 `compaction` 和 `branch_summary` 条目（如果可用）——它们是预先合成的摘要
- 跳过 `thinking` 内容块（噪音）和 `model_change` / `thinking_level_change` 条目

---

## 步骤 5：将 Blob 提取到 Wiki 页面中

对于每个提取的 blob，确定它在 wiki 中的所属位置：

1. **检查 wiki 页面是否已涵盖此内容** — grep `index.md` 和该主题的页面 frontmatter。如果是，请更新现有页面而不是创建新页面。
2. **使用标准规则确定类别**（来自 `llm-wiki/SKILL.md`）：
   - 技术/操作方法 → `skills/`
   - 抽象概念/模式 → `concepts/`
   - 工具/库/人 → `entities/`
   - 跨领域洞察 → `synthesis/`
3. **使用所需的 frontmatter 编写或更新页面**：
   ```yaml
   ---
   title: <topic>
   category: skill|concept|entity|synthesis
   tags: [tag1, tag2]
   sources: [<agent>://<path/to/session>]
   created: <date>
   updated: <date>
   confidence: high|medium|low
   lifecycle: stable|draft
   ---
   ```
   将 `sources` 设置为代理前缀，以便 `memory-bridge` 稍后可以找到它。
4. **添加交叉链接**到 `index.md` 中找到的相关 wiki 页面。

蒸馏规则（与所有摄取技能相同）：
- 提取持久的知识，而不是操作遥测
- 每个概念一个维基页面，而不是每个会话一个维基页面
- 合并到现有页面而不是重复
- 保留信号：做出的决策、发现的模式、有效的技术、解释的错误

---

## 步骤 6：返回综合答案

摄取后，立即从新摄取的 + 现有的 wiki 内容中综合并返回答案：

```
## From <agent> history: "<query>"

**Found in:** <N> sessions (<session names/titles>)

**Key insights:**
<Synthesized answer — 3–5 bullet points of the most useful knowledge>

**Wiki pages updated/created:**
- [[page-name]] — <what was added>
- [[page-name]] — <what was added>

**Sessions ingested:**
| Session | Date | Relevance |
|---------|------|-----------|
| <name>  | <date> | <one-line why it was selected> |

**Gaps:** <What the sessions didn't cover that might be relevant>
```

如果给出查询但未找到相关会话，请明确说明：“在 `<agent>` 历史记录中找不到有关“<query>”的会话。涵盖的最新会话：<list topics from last 3 sessions>。”

---

## 步骤 7：更新跟踪文件

为处理的每个会话文件更新 `.manifest.json`：
```json
{
  "<path>": {
    "ingested_at": "<now>",
    "source_type": "<agent>_conversation",
    "modified_at": "<file mtime>",
    "pages_created": [...],
    "pages_updated": [...]
  }
}
```

附加到`log.md`：
```
- [TIMESTAMP] WIKI-AGENT agent=<agent> query="<query>" sessions_searched=N sessions_ingested=M pages_created=X pages_updated=Y
```

使用所摄取内容的一行摘要更新 `hot.md`。

---

## 跨代理使用模式

这些是该技能设计的主要用例：

**“我在 Codex 上。关于 Claude 中的 X，我发现了什么？”**
→ `/wiki-claude "X"` — 查找有关 X 的 Claude 会话，摄取它们，返回答案

**“上周我解决了 Hermes 中的一个错误。我现在需要 Claude Code 中的上下文。”**
→ `/wiki-hermes "bug description"` — 显示并摄取 Hermes 会话

**“我在所有工具中为 X 尝试过哪些方法？”**
→ 按顺序运行 `/wiki-claude "X"`、`/wiki-codex "X"`、`/wiki-hermes "X"` — 每个工具摄取其切片，wiki 累积跨代理图片，然后 `/memory-bridge diff` 显示每个工具的独特贡献

**没有查询 - 只是“让我了解最近的法典工作”**
→ `/wiki-codex` — 摄取最后 5 个 Codex 会话并返回摘要

**“我在 Claude Code 上。关于 Pi 中的 X，我发现了什么？”**
→ `/wiki-pi "X"` — 查找有关 X 的 Pi 会话，摄取它们，返回答案

**没有查询 - 只是“了解我最近的 Pi 工作”**
→ `/wiki-pi` — 摄取最后 5 个 Pi 会话并返回摘要

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