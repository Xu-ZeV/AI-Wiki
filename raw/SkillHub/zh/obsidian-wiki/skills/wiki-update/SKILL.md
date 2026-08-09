---
name: wiki-update
description: >
  Sync the current project's knowledge into the Obsidian wiki. Use this skill from any project
  when the user says "update wiki", "sync to wiki", "save this to my wiki", "update obsidian",
  or wants to distill what they've been working on into their knowledge base. This is the
  cross-project skill that lets you push knowledge from wherever you are into the vault.
---

# Wiki 更新 — 将任何项目同步到您的 Wiki

您正在将当前项目中的知识提炼到用户的 Obsidian wiki 中。此技能适用于任何项目目录，而不仅仅是 obsidian-wiki 存储库。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这将提供 `OBSIDIAN_VAULT_PATH`、`OBSIDIAN_WIKI_REPO`、`OBSIDIAN_LINK_FORMAT`（`wikilink` 默认值或 `markdown`）以及可选的 QMD 设置，例如 `QMD_WIKI_COLLECTION`。适用于任何项目目录。
3. 读取`$OBSIDIAN_VAULT_PATH/.manifest.json`，检查该项目是否已同步过。
4. 阅读 `$OBSIDIAN_VAULT_PATH/index.md` 了解 wiki 已包含的内容。

在步骤 4-5 中写入内部链接时，请使用 `OBSIDIAN_LINK_FORMAT` 值应用 `llm-wiki/SKILL.md`（链接格式部分）中的链接格式。

## 第 1 步：了解项目

通过扫描当前工作目录找出这个项目是什么：

- `README.md`、docs/、任何 Markdown 文件
- 源结构（框架、语言、关键抽象）
- `package.json`、`pyproject.toml`、`go.mod`、`Cargo.toml` 或任何定义项目的内容
- Git 日志（重点关注表示决策的提交消息，而不是“修复拼写错误”的内容）
- Claude 内存文件（如果存在）（项目中的 `.claude/`）

从目录名称派生一个干净的项目名称。

## 步骤 2：计算 Delta

检查此项目的 `.manifest.json`：

- **第一次？** 全面扫描。一切都是新的。
- **之前同步过？** 看看 `last_commit_synced`。在计算增量之前，请验证存储的 SHA 是否仍然可达：
  ```bash
  git merge-base --is-ancestor <last_commit_synced> HEAD
  ```
  - **0号出口（祖先）：** 安全。运行 `git log <last_commit_synced>..HEAD --oneline` 查看发生了什么变化。
  - **退出 1（不是祖先 — 发生变基或强制推送）：** 存储的 SHA 不再在此分支的历史记录中。警告用户：*“存储的提交 `<sha>` 不再可达 - 分支可能已被重新定基或强制推送。回退到完全扫描。”* 然后视为首次同步：重新扫描所有内容，并在步骤 6 结束时将 `last_commit_synced` 更新为当前 HEAD SHA。

如果自上次同步以来没有发生任何有意义的变化，请告诉用户并停止。

## 第 3 步：决定提取什么

这是卡帕蒂模式的核心问题：**如果您在 3 个月内以零上下文回来，您想了解该项目的哪些信息？**

值得提炼的：

- 架构决策以及做出这些决策的“原因”
- 构建时发现的模式（否则你会再次谷歌的东西）
- 项目依赖哪些工具、服务、API 以及它们如何连接在一起
- 关键抽象，它们如何联系，心智模型是什么
- 评估的权衡、选择的内容以及原因
- 在构建过程中学到的东西在阅读代码中并不明显

不值得提炼：

- 显而易见的文件列表、样板文件、配置
- 个别错误修复，没有更广泛的教训
- 依赖版本，锁定文件内容
- 实现细节代码已经说得很清楚了
- 任何人都可以从差异中读取常规更改

启发式：**如果阅读代码库可以回答问题，请不要对其进行wiki。如果您必须通过阅读 20 个提交中的 gitblame 来重新推导推理，请对其进行 wiki。**

## 步骤 4：提炼成 Wiki 页面

### 项目特定知识

位于 `$VAULT/projects/<project-name>/` 下：

```
projects/<project-name>/
├── <project-name>.md          ← project overview (named after the project, NOT _project.md)
├── concepts/                  ← project-specific ideas, architectures
├── skills/                    ← project-specific how-tos, patterns
└── references/                ← project-specific source summaries
```

概述页面 (`<project-name>.md`) 应具有：
- 项目是什么（一段）
- 关键概念及其联系方式
- 指向特定项目和全球维基页面的链接

### 全球知识

非特定于项目的事物属于全局类别：

|你发现了什么 |它去哪儿了|
|---|---|
|学到的一般概念 | `concepts/` |
|可重复使用的模式或技术| `skills/` |
|工具/服务/人| `entities/` |
|跨项目分析| `synthesis/` |

### 页面格式

每个页面都需要 YAML frontmatter：

```markdown
---
title: >-
    Page Title
category: concepts
tags: [tag1, tag2]
sources: [projects/<project-name>]
summary: >-
    One or two sentences (≤200 chars) describing what this page covers.
provenance:
  extracted: 0.6
  inferred: 0.35
  ambiguous: 0.05
base_confidence: 0.59
lifecycle: draft
lifecycle_changed: TIMESTAMP_DATE
created: TIMESTAMP
updated: TIMESTAMP
---

Use folded scalar syntax (summary: >-) for title and summary to keep frontmatter parser-safe across punctuation (:, #, quotes) without escaping rules.
Keep the title and summary contents indented by two spaces under summary: >-.

# Page Title

- A fact the codebase or a doc actually states.
- A reason the design works this way. ^[inferred]

Use [[wikilinks]] to connect to other pages.
```

**在每个新/更新的页面（1-2 个句子，≤200 个字符）上使用 `>-` 折叠样式编写 `summary:` frontmatter 字段**。对于项目同步，一个好的摘要可以回答“此页面告诉我关于该项目的什么信息，而我从其标题中猜不到？”该字段支持 `wiki-query` 的廉价检索。

**根据 `llm-wiki`（来源标记部分）应用来源标记**。特别是对于项目同步：

- **提取** — 代码、配置或文档/提交消息中可见的任何内容：文件结构、依赖项、函数签名、文件的用途。
- **推断** — *为什么*做出决定、设计原理、权衡、“团队选择 X 因为 Y” — 除非提交消息、文档或 ADR 明确说明。
- **不明确** - 当代码和文档不一致时，或者当明显正在进行迁移且两种模式并存时。

计算粗略分数并在每个新/更新的页面上写入 `provenance:` 块。

### 更新与创建

- 如果库中已存在页面，则**将**新信息合并到其中。不要创建重复项。
- 如果您要添加到现有页面，请更新 `updated` 时间戳并添加新源。
- 在创建新内容之前，检查 `index.md` 以查看已有内容。

## 第五步：交叉链接

创建/更新页面后：

- 将 `[[wikilinks]]` 从新页面添加到现有相关页面
- 将 `[[wikilinks]]` 从现有页面添加回相关的新页面
- 将项目概述链接到所有项目特定页面和相关全局页面

## 步骤 6：更新跟踪

### 更新`.manifest.json`

添加或更新该项目的条目：

```json
{
  "projects": {
    "<project-name>": {
      "source_cwd": "/absolute/path/to/project",
      "last_synced": "TIMESTAMP",
      "last_commit_synced": "abc123f",
      "pages_in_vault": ["projects/<project-name>/<project-name>.md", "..."]
    }
  }
}
```

### 更新`index.md`

为创建的任何新页面添加条目。

### 更新`log.md`

附加：
```
- [TIMESTAMP] WIKI_UPDATE project=<project-name> pages_updated=X pages_created=Y source_cwd=/path/to/project
```

### 更新`hot.md`

读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用刚刚同步的内容重写 **最近活动** - 最多 3 次操作。如果该项目是持续关注的焦点，请更新**活动线程**。使用同步期间出现的最重要的架构见解或决策来更新**关键要点**。更新 `updated` 时间戳。

从概念上写：“同步Obsidian Wiki——增加了维基捕获和维基研究技能，核心新功能是自主网络研究和对话捕获。”

## 步骤 7：刷新 QMD Wiki 索引（可选 — 需要 `QMD_WIKI_COLLECTION`）

**GUARD：如果 `$QMD_WIKI_COLLECTION` 为空或未设置，请跳过此步骤。** MarkdownVault 是事实来源； QMD只是一个搜索索引。

仅当`.manifest.json`、`index.md`、`log.md`、`hot.md`页面写入完毕后，才需要执行此步骤。如果步骤 2 发现没有有意义的更改并且同步提前停止，请不要刷新 QMD。

此刷新当前需要本地 QMD CLI。如果设置，则使用 `$QMD_CLI`；否则使用 `qmd`。如果 CLI 不可用或返回错误，请勿回滚 wiki 更新；报告 wiki 已更新，但 QMD 刷新被跳过或失败。

对于 CLI 刷新：

```bash
${QMD_CLI:-qmd} update
```

如果输出表明新的哈希值需要向量，或者如果创建/更新了页面并且嵌入可能已过时，请运行：

```bash
${QMD_CLI:-qmd} embed
```

验证至少一个已创建或重大更新的页面在 wiki 集合中可见：

```bash
${QMD_CLI:-qmd} get "qmd://$QMD_WIKI_COLLECTION/projects/<project-name>/<page>.md" -l 5
```

如果确切的 `qmd://` 路径不确定，请使用：

```bash
${QMD_CLI:-qmd} ls "$QMD_WIKI_COLLECTION" | grep "<project-name>"
```

在最终报告中将 QMD 刷新记录为以下之一：
- `QMD refreshed: update + embed + verified`
- `QMD skipped: QMD_WIKI_COLLECTION unset`
- `QMD skipped: qmd CLI unavailable`
- `QMD failed: <short error summary>`

## 提示

- **积极进行合并。** 如果项目使用 React Server 组件，并且 `concepts/react-server-components.md` 已存在，则不要创建新页面。更新现有项目并将该项目添加为源。
- **查阅标签分类法。** 读取 `$VAULT/_meta/taxonomy.md`（如果存在），并使用规范标签。
- **不要复制代码。** 提炼*知识*，而不是实现。 “该项目使用具有 300 毫秒延迟的去抖搜索模式”很有用。粘贴实际的去抖函数不是。
- **项目概述是锚点。** `<project-name>.md` 文件是您阅读以了解方向的文件。让它变得好起来。
