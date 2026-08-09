---
name: llm-wiki
description: >
  The foundational knowledge distillation pattern for building and maintaining an AI-powered Obsidian wiki.
  Based on Andrej Karpathy's LLM Wiki architecture. Use this skill whenever the user wants to understand the
  wiki pattern, set up a new knowledge base, or needs guidance on the three-layer architecture (raw sources →
  wiki → schema). Also use when discussing knowledge management strategy, wiki structure decisions, or how
  to organize distilled knowledge. This is the "theory" skill — other skills handle specific operations
  (ingesting, querying, linting).
---

# LLM Wiki — 知识蒸馏模式

您正在维护一个持久的、复合的知识库。维基不是聊天机器人——它是一个**编译的工件**，其中知识被提取一次并保持最新，而不是在每次查询时重新派生。

## 三层架构

### 第 1 层：原始源（不可变）

用户的原始文档 - 文章、论文、笔记、PDF、对话日志、书签、**和图像**（屏幕截图、白板照片、图表、幻灯片截图）。这些永远不会被系统修改。它们位于用户放置的任何位置（通过 `.env` 中的 `OBSIDIAN_SOURCES_DIR` 配置）。图像是一流的来源：摄取技能通过阅读工具的视觉支持来读取它们，并将其解释的内容视为推断的内容，除非它是逐字转录的文本。图像摄取需要具有视觉功能的模型——没有视觉支持的模型应该跳过图像源并报告跳过了哪些文件。

将原始来源视为“源代码”——权威但难以直接查询。

### 第 2 层：Wiki（LLM维护）

按类别组织的互连的Obsidian兼容 Markdown 文件的集合。这是编译后的知识——综合的、交叉引用的、可导航的。每个页面有：

- YAML frontmatter（标题、类别、标签、来源、时间戳）
- Obsidian `[[wikilinks]]` 连接相关概念
- 清晰的出处——每项主张均可追溯到来源

wiki 位于通过 `.env` 中的 `OBSIDIAN_VAULT_PATH` 配置的路径中。

### 第 3 层：架构（此技能 + 配置）

管理 wiki 结构的规则 — 类别、约定、页面模板和操作工作流程。该模式告诉LLM“如何”维护维基。

## 维基组织

vault有两个层次的结构：**类别**（什么样的知识）和**项目**（知识来自哪里）。

### 类别

将页面组织到以下默认类别（可在 `.env` 中自定义）：

|类别 |目的|示例|
|---|---|---|
| `concepts/` |想法、理论、心智模型 | `concepts/transformer-architecture.md` |
| `entities/` |人员、组织、工具、项目 | `entities/andrej-karpathy.md` |
| `skills/` |操作知识、流程 | `skills/fine-tuning-llms.md` |
| `references/` |具体来源摘要| `references/attention-is-all-you-need.md` |
| `synthesis/` |跨来源的横切分析| `synthesis/scaling-laws-debate.md` |
| `journal/` |带时间戳的观察结果、会话日志 | `journal/2024-03-15.md` |

### 项目

知识通常属于特定项目。 `projects/` 目录反映了这一点：

```
$OBSIDIAN_VAULT_PATH/
├── projects/
│   ├── my-project/
│   │   ├── my-project.md      ← project overview (named after project)
│   │   ├── concepts/          ← project-scoped category pages
│   │   ├── skills/
│   │   └── ...
│   ├── another-project/
│   │   └── ...
│   └── side-project/
│       └── ...
├── concepts/                   ← global (cross-project) knowledge
├── entities/
├── skills/
└── ...
```

**当知识是特定于项目的**（一种仅适用于一个代码库的调试技术、特定于项目的架构决策）时，请将其放在 `projects/<project-name>/<category>/` 下。

**当知识具有通用性时**（像“React Server Components”这样的概念，像“Andrej Karpathy”这样的人，一种广泛适用的技能），把它放在全局类别目录中。

**交叉引用：** 项目页面应 `[[wikilink]]` 到全局页面，反之亦然。项目的概述页面应链接到与该项目相关的关键概念、技能和实体页面 - 无论它们位于项目下还是全球范围内。

**命名规则：** 项目概览文件必须命名为`<project-name>.md`，而不是`_project.md`。 Obsidian 的图形视图使用文件名作为节点标签 - `_project.md` 使每个项目在图形中显示为 `_project`，使其不可读。所以`projects/my-project/my-project.md`、`projects/another-project/another-project.md`等

每个项目目录都有一个概述页面，结构如下：

```markdown
---
title: My Project
category: project
tags: [ai, web, backend]
source_path: ~/.claude/projects/-Users-name-Documents-projects-my-project
created: 2026-03-01T00:00:00Z
updated: 2026-04-06T00:00:00Z
---

# My Project

One-paragraph summary of what this project is.

## Key Concepts
- [[concepts/some-api]] — used for core functionality
- [[projects/my-project/concepts/main-architecture]] — project-specific architecture

## Related
- [[entities/some-service]] — deployment platform
```

## 特殊文件

每个 wiki 的根目录下都有这些文件：

### `index.md`
按类别组织的面向内容的目录。每个条目都有一行摘要和标签。每次摄取操作后重建它。格式：

```markdown
# Wiki Index

## Concepts
- [[transformer-architecture]] — The dominant architecture for sequence modeling ( #ml #architecture)
- [[attention-mechanism]] — Core building block of transformers ( #ml #fundamentals)

## Entities
- [[andrej-karpathy]] — AI researcher, educator, former Tesla AI director ( #person #ml)
```
**格式规则**：在开头`(`和标签后添加一个空格。
❌ 不要：`description (#tag)` — 破坏标签解析
✅ 执行：`description ( #tag)` — 适当的间距和标签解析

### `log/YYYY/MM/DD/*.md`
项目运行日志位于根`log/`目录下，按年、月、日分组。该项目为每次写入操作保留一个 Markdown 文件，而不是附加到根级 `log.md`。路径应使用 `log/YYYY/MM/DD/HHMM-short-topic.md`； frontmatter 标签必须包含 `日志`，正文应记录操作时间、型号、操作类型、可点击范围链接、摘要、检查目的和下一步迭代方向。

```markdown
---
title: Wiki ingest operation
tags:
  - 日志
time: 2024-03-15 10:30:00 +08:00
model: GPT-5 Codex
type:
  - Ingest
scope:
  - "[[wiki/index|Wiki Index]]"
---

## Operation Summary

Ingested `papers/attention.pdf`; updated 12 pages and created 3 pages in append mode.

## Check Purpose

Confirm the ingest updated the wiki index, manifest, links, and project log directory consistently.

## Next Iteration

Review new pages for missing cross-links and stale summaries.
```

### `.manifest.json`
跟踪已摄取的每个源文件 - 路径、时间戳、它生成的 wiki 页面。这是 Delta 系统的支柱。有关完整架构，请参阅 `wiki-status` 技能。

该清单能够：
- **增量计算** — 自上次摄取以来新增或修改的内容
- **追加模式** — 仅处理增量，而不处理所有内容
- **审核** — 哪个来源生成了哪个 wiki 页面
- **过时检测** — 源已更改，但 wiki 页面尚未更新

## 页面模板

创建新的 wiki 页面时，请使用以下结构：

```markdown
---
title: Page Title
category: concepts
tags: [ml, architecture]
aliases: [alternate name]
relationships:
  - target: "[[concepts/related-concept]]"
    type: extends
sources: [papers/attention.pdf]
summary: One or two sentences, ≤200 chars, so a reader (or another skill) can preview this page without opening it.
provenance:
  extracted: 0.72
  inferred: 0.25
  ambiguous: 0.03
base_confidence: 0.65
lifecycle: draft
lifecycle_changed: 2024-03-15
tier: supporting
created: 2024-03-15T10:30:00Z
updated: 2024-03-15T10:30:00Z
---

# Page Title

One-paragraph summary of what this page covers.

## Key Ideas

- The source's central claim, paraphrased directly.
- A generalization the source implies but doesn't state outright. ^[inferred]
- A figure two sources disagree on. ^[ambiguous]

Use [[wikilinks]] to connect to related pages.

## Open Questions

Things that are unresolved or need more sources.

## Sources

- [[references/attention-is-all-you-need]] — Original paper
```

## 出处标记

维基页面上的每个声明都具有三种来源状态之一。将它们标记为内联，以便读者（以及未来的摄取过程）可以区分信号和合成。

|状态 |标记|意义|
|---|---|---|
| **提取** | *（无标记 - 默认）* |对消息来源实际所说内容的释义。 |
| **推断** | `^[inferred]` 后缀 |LLM综合主张——来源未直接说明的联系、概括或暗示。 |
| **模棱两可** | `^[ambiguous]` 后缀 |消息来源不同意，或者来源不清楚。 |

示例：

```markdown
- Transformers parallelize across positions, unlike RNNs.
- This is why they scale better on modern hardware. ^[inferred]
- GPT-4 was trained on roughly 13T tokens. ^[ambiguous]
```

**为什么这个语法：**
- `^[...]` 是 Obsidian 中的脚注相邻 — 渲染干净且不会与 `[[wikilinks]]` 发生冲突。
- 内联（后缀），因此单个项目符号保持单个项目符号。
- 默认=提取意味着没有标记的现有页面仍然有效。

**Frontmatter 摘要：** 可以选择在页面级别显示粗略的组合，以便用户可以扫描大量猜测的页面而无需阅读它们：

```yaml
provenance:
  extracted: 0.72   # rough fraction of sentences/bullets with no marker
  inferred: 0.25
  ambiguous: 0.03
```

这些是摄取技能在创建/更新时写入的尽力而为的数字。 `wiki-lint` 重新计算它们并标记漂移。该块是可选的——没有它的页面按照惯例被视为完全提取。

## 类型化关系

页面正文中的普通 `[[wikilinks]]` 没有语义权重 - 它们表示“相关”，但不表示“如何”。可选的 `relationships:` frontmatter 块向知识图添加类型化的方向边。

### `relationships:` 块

```yaml
relationships:
  - target: "[[Transformer Architecture]]"
    type: extends
  - target: "[[LSTM]]"
    type: contradicts
  - target: "[[Attention Mechanism]]"
    type: implements
```

每个条目都有两个必填字段：
- `target` — 相关页面的 wiki 链接（使用与 `OBSIDIAN_LINK_FORMAT` 相同的格式）
- `type` — 以下允许的语义类型之一

### 允许的关系类型

|类型 |意义|示例|
|---|---|---|
| `extends` |此页面建立在目标 | 的基础上或概括了目标 | GPT 扩展了 Transformer 架构 |
| `implements` |此页面是目标概念的具体实现 | BERT 实现屏蔽语言建模 |
| `contradicts` |本页的主张与目标相冲突或反驳 |证据 A 与证据 B 相矛盾 |
| `derived_from` |此页面基于或改编自目标 |微调源自迁移学习|
| `uses` |此页面取决于或依赖于目标 | RAG 使用矢量数据库 |
| `replaces` |此页面取代或弃用目标 | GPT-4 取代 GPT-3 |
| `related_to` |包罗万象：相关但没有更强的方向类型适用 |概念 A 与概念 B 相关 |

### 规则

- **可选字段** — 如果不知道类型关系，则完全省略该块。未标记的 wiki 链接仍然有效，并被 `wiki-export` 视为 `related_to`。
- **不要重复** — 如果 `[[foo]]` 已经作为内联 wiki 链接出现，则 `relationships:` 条目只是用类型来丰富它；它不是第二个链接。
- **方向很重要** — 声明条目是*来源*的页面； `target` 是目的地。仅从本页的角度声明关系。
- **不要捏造** - 仅当源材料使关系方向和类型明确时才添加键入的条目。如有疑问，请使用 `related_to` 或省略。

读取 `relationships:` 的技能：`wiki-export`（发出键入的边缘）、`cross-linker`（推断链接时写入键入的条目）、`wiki-query`（可能会在答案中显示键入）。

## 信心和生命周期

每个页面都带有两个正交信任信号以及一个可选的取代链接。

### 必填字段

```yaml
base_confidence: 0.65          # [0.0, 1.0] — time-independent quality estimate. Stored once, recomputed on content change.
lifecycle: draft               # draft | reviewed | verified | disputed | archived
lifecycle_changed: 2024-03-15  # ISO date of last state transition
# lifecycle_reason: "..."      # optional free-text — why the state changed; surfaced by wiki-query
# superseded_by: "[[new-page]]" # wikilink; only when lifecycle=archived
```

`lifecycle_reason` 和 `superseded_by` 是可选的。切勿捏造它们。

### 置信度公式

```
base_confidence = source_count_score * 0.5 + source_quality_score * 0.5

source_count_score   = min(distinct_source_ids / 3, 1.0)
source_quality_score = avg(quality score per distinct source_id)
```

**源质量分数**（使用最高匹配的存储桶）：

|桶|分数 |示例 |
|---|---|---|
| `paper` | 1.0 | arXiv，会议记录|
| `official` | 0.9 | 0.9 `*.gov`，供应商文档 |
| `documentation` | 0.85 | 0.85维护良好的第三方文档|
| `book` | 0.8 | 0.8书籍、技术参考|
| `repository` | 0.75 | 0.75 GitHub 自述文件、代码库 |
| `blog` | 0.55 | 0.55个人博客|
| `session_transcript` | 0.5 | 0.5对话历史 |
| `forum` | 0.4 | 0.4 Stack Overflow、HN、Reddit |
| `unknown` | 0.4 | 0.4包罗万象 |
| `llm_generated` | 0.3 | 0.3 LLM自我反思|

**`source_id`** 是稳定的每个源标识符 - 防止将同一博客的三个副本计为三个不同的源：

|来源类型|源 ID 规则 |
|---|---|
|学术论文| DOI > arXiv ID > `<author>-<year>-<slug>` |
| GitHub 存储库 | `github.com/<owner>/<repo>` |
|文档网站 | `<canonical-host>/<product>` |
|博客文章 | `<host>/<author>` |
|会议记录| `<agent>/<session-id>` |
|其他| `<canonical-url>` |

**每项技能默认值**（摄取技能会自动计算此值）：

|技能|基本置信度 |生命周期|
|---|---|---|
| `ingest-url` | `0.17 + 0.5 × classify(url)` | `draft` |
| `wiki-ingest`（单个文档）|每个源分类器 | `draft` |
| `wiki-ingest`（多文档）| `min(N/3,1)×0.5 + avg_q×0.5` | `draft` |
| `wiki-research` |各不相同，通常为 0.85+ | `draft` |
| `wiki-capture` | 0.42 | `draft` |
| `*-history-ingest` | 0.42 | `draft` |
| `wiki-update` | 0.59 | `draft` |
| `wiki-synthesize` | `min(input_pages.base_confidence)` | `draft` |
| `data-ingest` | 0.37 | `draft` |

### 生命周期状态机

五个州。 **`stale` 不是一个状态** — 它是一个计算叠加：`is_stale = (today − updated) > 90 days`。

|状态 |输入者 |笔记|
|---|---|---|
| `draft` |首次写入时的任何摄取技巧 |所有新页面的默认设置 |
| `reviewed` |仅限人工编辑 | |
| `verified` |仅限人工编辑 |时间永远不会降低经过验证的页面|
| `disputed` |仅限手动编辑 |覆盖显示中除 `archived` 之外的所有状态 |
| `archived` |手动编辑，或摄取技能设置 `superseded_by` |终端|

仅摄取技能设置`draft`。所有其他转换都需要人工编辑。每当状态发生变化时更新 `lifecycle_changed`。

## 重要性分级

`tier:` 字段控制每次摄取过程中更新哪些页面及其检索优先级。随着 wiki 的发展，重新阅读每次摄取的每个页面都会浪费token——分层可以让摄取和查询技能将精力集中在最重要的地方。

### 三层

|等级 |意义|摄取行为 |查询优先级 |
|---|---|---|---|
| `core` |承载页面——许多其他页面依赖于它们（高传入链接计数或桥位置）。永远值得更新。 |即使来源有一定程度的相关性，也要始终更新 |在索引和完整阅读通行证中首次出现 |
| `supporting` *（默认）* |具有中等连接性的标准 wiki 页面 |当来源对此页面有明确的新声明时进行更新 |标准优先|
| `peripheral` |低连接性页面——很少链接，范围狭窄 |除非来源“主要”是关于该主题的，否则请跳过 |最后的手段；修剪上下文预算时跳过 |

### 赋值规则

- **新页面：** 默认为 `tier: supporting`
- **升级到 `core`：** 当页面累积 ≥5 个传入 wiki 链接 **或** 被 `wiki-status` 洞察模式标记为桥时
- **降级为 `peripheral`：** 当页面有 ≤1 个传入链接并且在 90 天内未更新时
- **人工覆盖总是获胜** — 手动编辑 `tier:` 以锁定任何级别的页面
- 没有 `tier:` 的现有页面被视为 `supporting`（向后兼容 - 无需迁移）

### 谁管理层级

- `wiki-ingest`读取`tier:`来决定是否更新当前pass上的页面
- `wiki-query` 使用 `tier:` 对索引通道中的候选者进行排序并根据上下文预算进行调整
- `wiki-status` 洞察模式计算图形指标并**建议**层分配 - 它永远不会自动写入它们
- `wiki-lint` 在新创建的页面上标记缺少 `tier:`（第 2 阶段实施，与 `base_confidence` 相同的时间表）

## 检索原语

读取vault是每个读取端技能的主要成本。使用可以回答问题的最便宜的原语，并且**仅当更便宜的原语不够时才升级**。任何需要库内容的技能都应该遵循此表，而不是直接跳到整页阅读。

|需要|原始|相对成本|
|---|---|---|
|页面存在吗？它的标题/类别/标签是什么？ |读取`index.md`； `Grep` frontmatter 块（范围具有针对文件头处的 `^---` 块的模式） **最便宜** |
|页面 1-2 句话预览 |阅读其 frontmatter 中的 `summary:` 字段 | **便宜** |
|页面内的特定声明或部分 | `Grep -A <n> -B <n> "<term>" <file>` — 仅返回匹配行和上下文 | **中** |
|整页内容| `Read <file>` | **昂贵**——最后的手段|
|跨页面关系 | `Grep "\[\[.*?\]\]"` 穿过vault，或从已知页面访问维基链接 |个案 |

**规则：**仅当更便宜的原语无法回答问题时才升级。如果您可以单独从 `summary:` 字段回答，请不要阅读页面正文。如果带有 `-A 10 -B 2` 的 grep 部分给出了您的声明，请不要阅读整个页面。打开一个 500 行的页面来读取 15 行，就浪费了 485 行token。

**为什么这很重要：** 20 页的vault可让您轻松进行完整vault扫描。 200 页的vault则不然。上面的原语是技能框架如何在没有数据库的情况下扩展到大型vault。

消耗此表的技能：`wiki-query`、`cross-linker`、`wiki-lint`、`wiki-status`（见解模式）。任何阅读vault的新技能都应该引用本节，而不是重新发明模式。

## QMD 指数新鲜度

QMD 是一个位于库顶部的可选搜索索引。 Markdown vault是事实的来源。任何写入 wiki markdown 的技能都应在库写入完成后刷新 QMD，但前提是配置了 `QMD_WIKI_COLLECTION` 并且本地 QMD 传输可用。如果 QMD 刷新失败，请保留vault更改并单独报告 QMD 状态。

使用证明新内容可见的最便宜的验证路径：`qmd update`、`qmd embed`（仅当向量过时或丢失时），然后目标 `qmd get` 或 `qmd ls` 检查一个书面页面或集合根。只读技能不应刷新 QMD。

## 核心原则

1. **编译，不要检索。** wiki 是预编译的知识。当您提取源时，请更新每个相关页面 - 不要只是创建源的摘要。

2. **随着时间的推移而复合。** 每次摄取都应该使 wiki 变得更智能，而不仅仅是更大。将新信息合并到现有页面中，解决矛盾，加强交叉引用。

3. **出处很重要。** 每项声明都应追溯到来源。更新页面时，请注意提示更新的来源。

4. **标记推论。** 提取默认句子。 Mark 用 `^[inferred]` 合成索赔，并用 `^[ambiguous]` 有争议的索赔。隐藏猜测的维基会悄无声息地腐烂；标志着它值得信赖。

5. **LLM认为，是人类策划的。** 人类决定添加哪些来源以及提出哪些问题。LLM负责簿记——更新交叉引用、保持一致性、注意到矛盾。

6. **Obsidian 是 IDE。** 用户在 Obsidian 中浏览和探索 wiki。一切都必须是有效的ObsidianMarkdown和有效的维基链接。

## 链接格式

连接 wiki 页面的所有内部链接均由已解析配置中的 `OBSIDIAN_LINK_FORMAT` 控制（默认值：`wikilink`）。

|设置|语法 |示例|
|---|---|---|
| `wikilink` *（默认）* | `[[path/to/page]]` 或 `[[path/to/page\|display text]]` | `[[concepts/foo\|foo]]` |
| `markdown` | `[display text](relative/path.md)` | `[foo](../concepts/foo.md)` |

### 生成 markdown 格式的链接

当`OBSIDIAN_LINK_FORMAT=markdown`时：
1. 使用 `..` 计算从**当前文件目录**到**目标 `.md` 文件**的路径，并根据需要向上爬。
2. 使用页面标题或自然短语作为显示文本。
3. 始终包含 `.md` 扩展名。

|当前文件|目标|相关链接 |
|---|---|---|
| `index.md` | `concepts/foo.md` | `[foo](concepts/foo.md)` |
| `concepts/foo.md` | `entities/bar.md` | `[bar](../entities/bar.md)` |
| `projects/my-project/my-project.md` | `concepts/foo.md` | `[foo](../../concepts/foo.md)` |
| `projects/my-project/concepts/arch.md` | `entities/bar.md` | `[bar](../../../entities/bar.md)` |

`[[path\|display text]]` wikilink 表单在 Markdown 模式下映射到 `[display text](relative/path.md)`。

**范围：** 此设置仅影响新编写或更新的链接。现有的vault内容永远不会自动迁移 - 想要转换旧链接的用户可以运行 `cross-linker` 或 `wiki-lint` 技能。

每个写入技能在生成链接之前都会从配置中读取 `OBSIDIAN_LINK_FORMAT` 并应用正确的格式。

## 配置解析协议

**所有技能都必须使用此算法解析配置 - 不要直接硬编码 `.env` 或 `~/.obsidian-wiki/config`。** 这可确保单vault、多vault、项目本地和 VPS 设置都能正常工作。

### 决议顺序

1. **从 CWD 向上走** — 在当前目录中查找 `.env` 文件，然后查找每个父文件，直到 `$HOME`。在包含 `OBSIDIAN_VAULT_PATH` 的第一个 `.env` 处停止。
2. **全局配置** — 如果未找到本地 `.env`，请读取 `~/.obsidian-wiki/config`。
3. **提示设置** — 如果两者都不存在，则告诉用户：“未找到配置。运行 `wiki-setup` 来初始化您的 wiki。”

```
find_config() {
  dir="$PWD"
  while [[ "$dir" != "$HOME" && "$dir" != "/" ]]; do
    [[ -f "$dir/.env" ]] && grep -q "OBSIDIAN_VAULT_PATH" "$dir/.env" && { echo "$dir/.env"; return; }
    dir="$(dirname "$dir")"
  done
  [[ -f "$HOME/.obsidian-wiki/config" ]] && { echo "$HOME/.obsidian-wiki/config"; return; }
  echo ""
}
```

### Vault 范围内的状态

写入运行时状态的技能（例如 `daily-update`）必须将该状态范围限定为已解析的vault，而不是全局路径。用途：

```
VAULT_ID=$(echo "$OBSIDIAN_VAULT_PATH" | md5sum 2>/dev/null || md5 -q - <<< "$OBSIDIAN_VAULT_PATH" | cut -c1-8)
STATE_DIR="$HOME/.obsidian-wiki/state/$VAULT_ID"
```

### 标准“开始之前”块

每个技能的设置部分应为：

> **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议。从 CWD 向上走至 `.env`，回落至 `~/.obsidian-wiki/config`，否则提示设置。这提供了 `OBSIDIAN_VAULT_PATH` 和任何特定于工具的路径覆盖。

## 环境变量

wiki 是通过环境变量配置的（参见 `.env.example`）。唯一需要的变量是vault路径——其他所有变量都有合理的默认值。

- `OBSIDIAN_VAULT_PATH` — wiki 所在的地方 **（必填）**
- `OBSIDIAN_SOURCES_DIR` — 原始源文档所在的位置
- `OBSIDIAN_CATEGORIES` — 逗号分隔的类别列表
- `CLAUDE_HISTORY_PATH` — 哪里可以找到克劳德对话数据
- `CODEX_HISTORY_PATH` — 在哪里可以找到 Codex 会话数据
- `HERMES_HOME` — 哪里可以找到 Hermes 代理商数据
- `OPENCLAW_HOME` — 哪里可以找到 OpenClaw 数据
- `COPILOT_HISTORY_PATH` — 在哪里可以找到 Copilot 会话数据
- `OBSIDIAN_LINK_FORMAT` — 内部链接语法：`wikilink`（默认）或 `markdown`
- `WIKI_TOKEN_WARN_THRESHOLD` — 当完整 wiki token估计超过此值时，在 `wiki-status` 中发出警告（默认值：`100000`）。设置为 `0` 以禁用。有关token足迹报告，请参阅 `wiki-status`。
- `WIKI_STAGED_WRITES` — 当 `true` 时，所有 LLM 编写的页面在升级前都会转到 `_staging/<category>/` 进行人工审核。详细信息请参见 `wiki-setup` 和 `wiki-stage-commit`。

不需要 API 密钥 - 运行这些技能的代理已经内置了 LLM 访问权限。

## 操作模式

wiki 支持三种摄取模式：

|模式|何时使用 |会发生什么 |
|---|---|---|
| **追加** |小增量，增量更新 |通过清单计算增量，仅摄取新的/修改的源 |
| **重建** |重大转变，需要新的开始|将当前wiki存档到`_archives/`，清除，重新处理所有来源|
| **恢复** |需要回去|返回以前的存档 |

使用 `wiki-status` 查看增量并获得建议。使用 `wiki-rebuild` 进行归档/重建/恢复操作。

## 参考

具体操作详见配套技能：
- **wiki-status** — 审核摄取的内容、计算增量、推荐追加与重建
- **wiki-rebuild** — 存档当前 wiki、从头开始重建或从存档恢复
- **wiki-ingest** — 将源文档提取到 wiki 页面
- **claude-history-ingest** — 摄取 Claude 对话历史记录
- **codex-history-ingest** — 摄取 Codex CLI 会话历史记录
- **数据摄取** — 摄取任何原始文本数据
- **wiki-query** — 回答针对 wiki 的问题
- **wiki-lint** — 审核和维护 wiki 健康状况
- **wiki-setup** — 初始化一个新的vault
