---
name: cross-linker
description: >
  Scan the Obsidian wiki and automatically discover missing cross-references between pages.
  Use this skill when the user says "link my pages", "find missing links", "cross-reference",
  "connect my wiki", "add wikilinks", "what pages should be linked", or after any large ingestion
  to ensure new pages are woven into the existing knowledge graph. Also trigger when the user
  mentions "orphan pages" in the context of wanting to connect them, or says things like
  "my wiki feels disconnected" or "pages aren't linked well". This is a write-heavy skill —
  it actually modifies pages to add links, unlike wiki-lint which just reports issues.
---

# 交叉链接器 — 自动维基交叉引用

通过在应该互相引用但目前没有互相引用的页面之间查找并插入缺失的 `[[wikilinks]]`，您可以将 wiki 的知识图编织得更紧密。

**按照 `llm-wiki/SKILL.md` 中的检索基元表进行操作。** 在步骤 1 中通过仅 grep frontmatter（而不是整页）构建注册表。为未链接提及检测通道保留完整的 `Read`，即使在那里，也只读取其摘要/标题使其成为合理链接目标的页面。该框架旨在避免盲目的全库读取。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `OBSIDIAN_LINK_FORMAT`（默认值：`wikilink`）。
2. 阅读 `index.md` 以获得页面的完整清单及其一行描述
3. 浏览 `log.md` 以查看最近摄取的内容（将链接工作重点放在新页面上）

在步骤 4 中插入链接时，使用 `OBSIDIAN_LINK_FORMAT` 值应用 `llm-wiki/SKILL.md`（链接格式部分）中的链接格式。当`OBSIDIAN_LINK_FORMAT=markdown`时，计算从**正在编辑的文件**到目标页面的相对`.md`路径。

## 步骤 1：构建页面注册表

全局显示 Vault 中的所有 `.md` 文件（不包括 `_archives/`、`.obsidian/`）。对于每个页面，提取：

- **文件名**（不带 `.md`） — 这是 wikilink 目标
- **标题**来自 frontmatter
- 来自 frontmatter 的 **别名**（如果有）
- **标签**来自 frontmatter
- 来自 frontmatter 或目录推断的 **类别**
- **单行摘要** — 第一句话或 `title` 字段

建立一个查找表：

```
page_name → { path, title, aliases, tags, summary }
```

这是您的“词汇表”——该表中的每个条目都是有效的维基链接目标。

## 第 2 步：扫描丢失的链接

对于库中的每个页面：

1. **阅读全文**
2. **提取现有的 wiki 链接** — 查找所有已存在的 `[[...]]` 引用
3. **搜索未链接的提及** — 检查页面文本是否包含其中任何内容，而不包含在 `[[...]]` 中：
   - 页面文件名（例如，出现“MyProject”一词，但缺少 `[[projects/my-project/my-project]]`）
   - 来自 frontmatter 的页面标题
   - 来自 frontmatter 的别名
   - 注册表中的实体名称、项目名称、概念名称

4. **检查语义连接** — 共享多个标签或位于同一项目目录但不相互链接的页面

### 匹配规则

- **名称不区分大小写的匹配**（例如，“my-project”匹配页面 `MyProject`）
- **不区分变音符号的匹配** — 在比较之前使用 Unicode NFKD 规范化页面名称和正文（将重音字符分解为基本字符 + 组合标记，去除组合标记）。这可确保正文文本“Muller”与页面 `[[entities/müller]]` 匹配，反之亦然。
- **跳过自引用** - 页面不应链接到自身
- **跳过常用词** - 不要链接“the”、“and”等通用术语。仅匹配独特的名称
- **首选最短明确的 wikilink 路径** — 当名称在vault中唯一时，使用 `[[page-name]]` 而不是 `[[full/path/to/page-name]]`
- **不要链接到代码块**或 frontmatter 内部
- **不要双重链接** — 如果 `[[foo]]` 已出现在页面上，请勿添加另一个

## 步骤 3：评分和排名建议

并非所有可能的链接都值得添加。使用复合信号对每个候选者进行评分，然后用置信度标签对其进行标记。

### 评分

|信号|积分|示例|
|---|---|---|
| **文本中的名称完全匹配** | +4 | “MyProject”出现在正文中 → 链接到 my-project.md |
| **共享标签（2+）** | +2 |两者都标记为 `#ai #agent`，但它们之间没有链接 |
| **同一项目，无链接** | +2 |两者都在 `projects/my-project/` 下，但不互相引用 |
| **提到的实体/概念** | +2 |页面提到“知识图” → 链接至 `[[concepts/knowledge-graphs]]` |
| **跨品类连接** | +2 |源位于 `concepts/`，目标位于 `entities/`（或 `skills/` ↔ `synthesis/`）——不同的知识层使此链接在架构上更具价值 |
| **外围→枢纽到达** | +2 |源页面总共有 ≤ 2 个链接（外围），但目标页面有 ≥ 8 个（中心）——将松散页面连接到承重概念 |
| **部分名称匹配** | +1 | “图表”出现，但页面是 `knowledge-graphs` — 看似合理但不明确 |

### 置信度标签

根据每个候选者的分数为其添加置信度标签：

|分数 |标签|行动|
|---|---|---|
| ≥ 6 | **提取** |链接实际上是确定的——准确提及或非常强的匹配。内联应用。 |
| 3-5 | 3-5 **推断** |链接是一个合理的推论——共享上下文、跨类别、外围→枢纽。应用内联或作为相关部分。 |
| 1-2 | 1-2 **模棱两可** |弱匹配或部分匹配。除非用户特别要求连接松散页面，否则请跳过。 |

仅对 **EXTRACTED** 和 **INFERRED** 候选人采取行动。在交叉链接报告中包含置信度标签，以便用户可以在信任链接之前查看推断的链接。

## 步骤 4：应用链接

对于每个缺少链接的页面：

### 4a：内联链接（首选）

找到正文中第一次自然提及该术语并将其包含在维基链接中：

**之前：**
```markdown
This project uses knowledge graphs to connect entities.
```

**之后：**
```markdown
This project uses [[concepts/knowledge-graphs|knowledge graphs]] to connect entities.
```

当 wiki 链接路径与显示文本不同时，请使用 `[[path|display text]]` 格式。

### 4b：相关部分（后备）

如果正文中没有自然提及该术语，但页面在语义上相关（共享标签、同一项目），请在页面底部添加 `## Related` 部分：

```markdown
## Related

- [[projects/my-project/my-project]] — Also uses AI agents for research automation
- [[concepts/knowledge-graphs]] — Core technique used in this project
```

如果 `## Related` 部分已存在，则追加到它。不要重复现有条目。

### 4c：推断和写入关系类型

对于添加的每个 EXTRACTED 或 INFERRED 链接（内联或相关部分），从周围的句子上下文推断语义关系类型并将其写入页面的 `relationships:` frontmatter 块。跳过不明确的链接。

**类型推理规则** — 扫描包含提及的句子（或者，对于相关部分链接，扫描页面标题和共享标签上下文）：

|句型 |推断类型 |
|---|---|
| “X 扩展/构建/概括 Y”| `extends` |
| “X 实现/是 Y 的实现” | `implements` |
| “X 与 Y 相矛盾/反对/反驳/不一致”| `contradicts` |
| “X 源自/基于/改编自 Y”| `derived_from` |
| “X 使用/依赖/依赖/需要 Y”| `uses` |
| “X 取代/取代/弃用 Y”| `replaces` |
|共享标签或没有方向提示的跨类别推理 | `related_to` |

如果周围上下文不明确或链接来自共享标签匹配（没有正文提及），则默认为 `related_to`。

**写块：**

阅读该页面的 YAML frontmatter。如果 `relationships:` 块已存在，则附加新条目而不重复现有目标。如果该块不存在，请将其添加到 `aliases:` 后面（或者当 `aliases:` 缺失时添加到 `tags:` 后面）。

```yaml
relationships:
  - target: "[[concepts/knowledge-graphs]]"
    type: uses
```

对于 `relationships:` YAML 块中的 `target` 值，始终使用 wikilink 格式 (`[[path/to/page]]`) — 无论 `OBSIDIAN_LINK_FORMAT` 为何。 `OBSIDIAN_LINK_FORMAT` 设置控制正文内容； frontmatter 属性始终使用 wikilink 语法，以便 `wiki-export` 可以可靠地解析它们。

仅添加在此交叉链接器运行中添加的链接的条目 - 不要触及已存在的键入条目。

## 步骤 5：对其他页面亲和力进行评分

主链接传递后，更新 `misc/` 中所有页面的亲和力分数（在其 frontmatter 中带有 `promotion_status: misc` 的页面，或位于 `misc/` 目录下的页面）。

对于每个杂项页面：

1. **收集传出链接** — 页面正文中的所有 `[[wikilinks]]`
2. **收集传入链接** — grep 库中的 `[[misc/<slug>]]` 和 `[[<slug>]]` 引用
3. 对于每个链接页面（双向），检查它是否属于一个项目：
   - 生活在 `projects/<project-name>/` 之下
   - 具有与项目名称匹配的 `project:` frontmatter 字段
4. 按项目名称及总和分组：`outgoing_links + incoming_links`
5.更新misc页面上的`affinity` frontmatter块：

```yaml
affinity:
  obsidian-wiki: 3
  another-project: 1
```

6. 如果任何项目的分数≥3：将此页面标记为**促销候选**并记录在报告中

**效率说明：** 仅阅读杂项页面的完整正文 - 其他页面只需要 frontmatter grep 即可确定其项目成员资格。

## 第 6 步：报告

提出一个总结：

```markdown
## Cross-Link Report

### Links Added: 23 across 12 pages

| Page | Links Added | Confidence | Placement | Relationship Types |
|---|---|---|---|---|
| `projects/my-project/my-project.md` | 3 | EXTRACTED | 2 inline, 1 related | uses ×2, related_to ×1 |
| `entities/jane-doe.md` | 5 | INFERRED | 3 inline, 2 related | extends ×1, uses ×3, related_to ×1 |
| ... | | | | |

### Orphan Pages Remaining: 2
- `references/foo.md` — no incoming or outgoing links found
- `concepts/bar.md` — could not find related pages

### Misc Promotion Candidates: N
Pages in misc/ that have ≥ 3 connections to a single project — ready to be promoted:

| Page | Top Project | Score |
|---|---|---|
| `misc/web-martinfowler-articles-microservices.md` | `obsidian-wiki` | 4 |

To promote: move the page to `projects/<project-name>/references/` and update all backlinks.

### Pages Skipped: 3
- `index.md`, `log.md` — special files
- `_archives/*` — archived content
```

## 步骤7：更新日志和热缓存

附加到`log.md`：
```
- [TIMESTAMP] CROSS_LINK pages_scanned=N links_added=M typed_relations_written=T pages_modified=P orphans_remaining=Q misc_affinity_updated=R promotion_candidates=S
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用链接内容的一行摘要更新**最近活动**，例如“12 页中交叉链接了 23 处提及；还剩下 2 处孤儿。”保留最后 3 次操作。更新 `updated` 时间戳。

## 提示

- **每次摄取后运行。** 新页面几乎总是连接不良。这就是修复。
- **使用内联链接时要保守。** 仅链接第一个自然提及的内容，而不是每次出现的内容。
- **不要触摸 `_archives/` 中的页面。** 这些是冻结快照。
- **尊重现有结构。** 如果页面在 `## Key Concepts` 部分中仔细管理其链接，请添加到该部分，而不是创建单独的 `## Related`。
- **实体页面是链接磁铁。** 像 `jane-doe` 这样的实体应该从几乎每个项目页面链接。优先考虑这些。

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