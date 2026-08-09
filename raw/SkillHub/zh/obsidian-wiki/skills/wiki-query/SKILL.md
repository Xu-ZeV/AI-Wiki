---
name: wiki-query
description: >
  Answer questions by searching the compiled Obsidian wiki. Use this skill when the user asks a question
  about their knowledge base, wants to find information across their wiki, asks "what do I know about X",
  "find everything related to Y", or wants synthesized answers with citations from their wiki pages.
  Also use when the user wants to explore connections between topics in their wiki. Works from any project.
  Includes an index-only fast mode triggered by "quick answer", "just scan", "don't read the pages",
  "fast lookup" — returns answers from page summaries and frontmatter without reading page bodies.
---

# Wiki 查询 — 知识检索

您正在回答针对已编译的Obsidian Wiki的问题，而不是原始源文档。wiki包含预先综合的、交叉引用的知识。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。首选 `~/.obsidian-wiki/config` 进行跨项目查询（如果存在），即使它是指向库 `.env` 的符号链接。这给出了 `OBSIDIAN_VAULT_PATH` 和任何 QMD 变量。适用于任何项目目录。
2. **在决定检索策略之前，从已解析的配置中加载 QMD 设置。如果设置了 `QMD_WIKI_COLLECTION`，则仅根据下面的运输/工具检查将 QMD 视为可用。如果它为空或未设置，请简要说明为什么在使用 grep/page 读取之前跳过 QMD。
3. 如果 `$OBSIDIAN_VAULT_PATH/hot.md` 存在，请先阅读它 - 它为您提供有关最近活动的即时上下文。如果用户的问题是关于最近摄取的某些内容，hot.md 可能会在您打开 `index.md` 之前回答它。
4. 阅读 `$OBSIDIAN_VAULT_PATH/index.md` 以了解 wiki 的范围和结构

## 可见性过滤器（可选）

默认情况下，**返回所有页面**，无论可见性标签如何。这保留了现有的行为——除非用户要求，否则不会发生任何改变。

如果用户的查询包含诸如**“仅公开”**、**“面向用户”**、**“无内部内容”**、**“用户会看到的”这样的短语，或 **“排除内部”**，则激活 **过滤模式**：

- 构建**被阻止的标签集**：`{visibility/internal, visibility/pii}`
- 在索引通道（步骤 2）中，跳过其 frontmatter 标签包含被阻止标签的任何候选者
- 在部分/完整阅读通行证（步骤 3-4）中，请勿阅读或引用任何被阻止的页面
- 仅从允许的页面合成答案 - 不要提及存在排除的页面

始终包含没有 `visibility/` 标记或标记为 `visibility/public` 的页面。

在过滤模式下，记下步骤 6 日志条目中的过滤器：`mode=filtered`。

## 检索协议

**遵循 `llm-wiki/SKILL.md` 中的检索基元表。** 阅读是此技能的主要成本 - 使用能够回答问题的最便宜的基元，只有在无法回答问题时才升级。切勿直接跳至整页阅读。

### 第 1 步：理解问题

对查询类型进行分类：
- **事实查找** — “X 是什么？” → 查找相关页面
- **关系查询** — “X 与 Y 有何关系？” /“什么与X相矛盾？” → 找到这两页、它们的交叉引用以及它们的 `relationships:` frontmatter 块（用于键入边缘）
- **综合查询** — “目前对 X 的想法是什么？” → 找到所有接触X的页面，合成
- **差距查询** — “关于 X，我不知道什么？” → 查找缺少的内容，检查未解决的问题部分

还决定 **模式**：
- **仅索引模式** — 由“快速回答”、“仅扫描”、“不阅读页面”、“快速查找”触发。停在步骤 3。仅来自 frontmatter + `index.md` 的答案。
- **普通模式** — 下面的完整分层管道。

### 第 2 步：索引通行证（便宜）

构建候选集*无需打开任何页面主体*：

- 您已经阅读了上面的 `index.md` - 将其用作第一个过滤器。它列出了每个页面，并带有一行描述和标签。
- 使用 `Grep` 扫描页面 **仅限 frontmatter** 以查找标题、标签、别名和摘要匹配。像 `^(title|tags|aliases|summary):` 这样的模式用于保管 `.md` 文件，比内容 grep 便宜得多。
- 收集排名前 5-10 名的候选页面路径：
  1. 标题或别名完全匹配
  2. 标签匹配
  3. 摘要字段包含查询词
  4. `index.md`条目包含查询词
- **在每个排名桶中应用层级排序：** 当两个候选人得分相同时，优先选择 `tier: core`，而不是 `tier: supporting`，而不是 `tier: peripheral`。使用与其他字段相同的廉价 grep 读取 `tier:` frontmatter 字段。没有 `tier:` 字段的页面将被视为 `supporting`。

如果您处于**仅索引模式**，请在此停止。仅来自 `summary:` 字段、标题和 `index.md` 描述的答案。清楚地标记答案：**“（仅索引答案 - 未阅读页面正文；以下事实来自页面摘要，可能会忽略细微差别）”**。然后跳到步骤 5。

### 步骤 2b：QMD 语义传递（可选 - 解析配置中需要 `QMD_WIKI_COLLECTION`）

**GUARD：如果 `$QMD_WIKI_COLLECTION` 为空或在配置解析后未设置，请跳过整个步骤并继续执行步骤 3。在工作更新中提及缺少的变量。**

> **没有 QMD？** 跳到步骤 3 并直接在vault上使用 `Grep`。 QMD 速度更快且具有概念意识，但 grep 路径功能齐全。设置请参见 `.env.example`。

如果设置了 `QMD_WIKI_COLLECTION`，则在获取 `Grep` 之前运行 QMD，除非 `hot.md` 或 `index.md` 元数据已完全回答该问题。当问题是语义性的、特定于项目的、要求相关上下文或使用可能不会逐字出现在标题/前言中的术语时，QMD 是特别优选的。

从 `$QMD_TRANSPORT` 中选择 QMD 传输：

- `mcp`（默认）：使用代理中配置的 QMD MCP 工具。
- `cli`：运行本地 qmd CLI。如果设置，则使用 `$QMD_CLI`；否则使用 `qmd`。

有关详细的 CLI 命令选择、维护和 VM 警告，请使用本地
`$qmd-cli` 安装时的技能。

如果所选传输不可用（没有 MCP 工具、`qmd` 不在 PATH 上或命令错误），请跳过 QMD 并继续步骤 3。

对于 MCP 传输：

```
mcp__qmd__query:
  collection: <QMD_WIKI_COLLECTION>   # e.g. "knowledge-base-wiki"
  intent: <the user's question>
  searches:
    - type: lex    # keyword match — good for exact names, file paths, error messages
      query: <key terms>
    - type: vec    # semantic match — good for concepts, patterns, "what is X like"
      query: <question rephrased as a description>
```

对于 CLI 传输，请从 `$QMD_CLI_SEARCH_MODE` 中选择命令：

将类似于运算符或标点符号较多的标记保留在 `lex:` 行中，例如 `no-sudo`、`ansible_become=false` 和 `~/.local/bin`。将 `vec:` 行重写为纯自然语言，不带连字符的 `-term` 单词； QMD 将 `-term` 视为否定，并且 `vec`/`hyde` 查询中不支持否定。

- `quality`（默认）：最佳相关性； CPU 速度较慢。
  ```bash
  ${QMD_CLI:-qmd} query $'lex: <key terms>\nvec: <question rephrased as a description>' -c "$QMD_WIKI_COLLECTION" -n 8 --files
  ```
- `balanced`：混合搜索，无需LLM重新排名；当`quality`太慢时使用。
  ```bash
  ${QMD_CLI:-qmd} query $'lex: <key terms>\nvec: <question rephrased as a description>' -c "$QMD_WIKI_COLLECTION" -n 8 --no-rerank --files
  ```
- `fast`：仅语义调用，或者当确切名称、文件路径或错误消息很重要时改为 `search`。
  ```bash
  ${QMD_CLI:-qmd} vsearch "<question rephrased as a description>" -c "$QMD_WIKI_COLLECTION" -n 8 --files
  ```

当 CLI 输出提供文档时，使用 `${QMD_CLI:-qmd} get "#docid"` 按 docid 检索排名文档。

返回的片段或排名文件充当预读部分摘要。如果他们完全回答了问题，请跳过步骤 3，直接进入步骤 4（仅阅读 QMD 排名最高的页面）。如果没有，请使用排名文件列表来指导在步骤 3 中 grep 或读取哪些文件。

**当问题可能在 `_raw/` 中包含源材料时，另请搜索 `papers`：**

如果设置了 `QMD_PAPERS_COLLECTION` 并且用户询问可能包含在摄取论文中的主题（研究、理论、背景），则针对论文集合运行并行搜索。在您的答案中分别引用原始来源和已编译的 wiki 页面。

### 步骤 3：部分通过（中等成本 — 仅当步骤 2/2b 没有结果时）

对于每个最佳候选人，请拉出相关部分*而不阅读整页*：

- 使用 `Grep -A 10 -B 2 "<query-term>" <candidate-file>` 获取比赛周围的线条。
- 每次点击通常会返回 15-30 行，而不是 100-500 行。
- 如果 grep 部分给出了明确的答案，则直接转到步骤 5。

### 步骤 4：完整阅读（昂贵 - 最后的手段）

仅当步骤 2 和 3 不能回答问题时：

- `Read` 完整的前 **3** 候选人。选择读取哪 3 个页面时，请应用层排序：在 `supporting` 之前读取 `core` 页面，并跳过 `peripheral` 页面，除非它们是唯一匹配的页面。
- 如果答案需要交叉引用，则最多从这些页面跟踪 `[[wikilinks]]` 的一跳。
- **对于关系查询**（“X 如何与 Y 相关？”/“什么与 X 相矛盾？”）：另请阅读候选页面的 `relationships:` frontmatter 块。每个条目都提供有类型的定向边缘（`extends`、`implements`、`contradicts`、`derived_from`、`uses`、`replaces`、`related_to`）。在你的答案中明确地表达这些——“页面 A *矛盾*页面 B（打字边缘）”比“页面 A 链接到页面 B”更有用。
- 检查“开放问题”部分是否存在已知差距。
- 如果您仍然不够，**然后**退回到跨vault的广泛内容 grep。告诉用户你升级了——这是一条昂贵的途径，他们应该知道。

### 第 5 步：综合答案

根据 wiki 内容撰写您的答案：
- 使用 `[[page-name]]` 符号引用特定的 wiki 页面
- 注意答案来自哪一步（“在摘要中找到”与“grepped 部分”与“整页阅读”）——帮助用户理解信心
- 如果维基有矛盾，请提出双方
- 如果wiki没有涵盖某些内容，请明确说明
- 建议哪些来源可以填补空白

**页面信任注释：** 对于答案中引用的每个页面，检查其 `lifecycle` frontmatter 并计算 `is_stale = (today − updated) > 90 days`。内联注释有风险的页面，以便用户知道要验证哪些引用：

|状况 |注释|
|---|---|
| `lifecycle: archived` | `(ARCHIVED: superseded by [[target]])` — 使用后继者代替 |
| `lifecycle: disputed` | `(DISPUTED, marked <lifecycle_changed>: <lifecycle_reason or "reason unspecified">)` |
| `is_stale` + `lifecycle: verified` | `(VERIFIED but stale: last updated <updated>)` — 读者在依赖之前应重新验证 |
| `is_stale`（其他生命周期）| `(stale: last updated <updated>)` |

综合答案中的示例：
```
[[concept-page]] (stale: last updated 2026-01-15) — Original claim was X.
[[verified-page]] (VERIFIED but stale: last updated 2025-09-10) — Reader should reverify before relying.
[[disputed-page]] (DISPUTED, marked 2026-04-30: contradicted by [[new-source]]) — Earlier said Y, now uncertain.
[[old-page]] (ARCHIVED: superseded by [[new-page]]) — Use the successor.
```

没有生命周期字段的页面（模式之前的旧页面）的处理方式与 `draft` 相同 - 如果过时则进行注释，否则跳过。切勿制造 `lifecycle_reason`；如果该字段不存在，请在注释中省略原因。

### 第 6 步：记录查询

附加到`log.md`：
```
- [TIMESTAMP] QUERY query="the user's question" result_pages=N mode=normal|index_only|filtered escalated=true|false
```

## 答案格式

结构答案如下：

> **基于维基：**
>
> [您使用 [[wikilinks]] 到源页面的综合答案]
>
> **查阅页面：** [[page-a]]、[[page-b]]、[[page-c]]
>
> **差距：** [wiki未涵盖但可能相关的内容]
