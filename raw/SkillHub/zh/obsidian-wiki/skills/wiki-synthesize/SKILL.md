---
name: wiki-synthesize
description: >
  Systematically discover synthesis opportunities across the Obsidian wiki — pairs or clusters of
  concepts that co-occur frequently across pages but have no synthesis page connecting them. Creates
  new synthesis/ pages that draw explicit cross-cutting conclusions. Use when the user says "synthesize
  my wiki", "find connections", "what concepts keep coming up together", "/wiki-synthesize", or after
  a large ingest when the vault has grown significantly.
---

# Wiki Synthesize — 一流的综合发现

您正在扫描 wiki，查找在许多页面中同时出现的概念，但没有专门的综合页面连接它们。您的工作是找出这些空白，并用横切综合页面填补最有价值的空白。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `OBSIDIAN_LINK_FORMAT`（默认值：`wikilink`）。
2. 读取`index.md` 获取整页库存。
3. 读取 `hot.md`（如果存在）——它会显示最近的活动和可能已经指向综合机会的活动线程。
4. 阅读`_meta/taxonomy.md`，了解标签词汇。

在综合页面中编写内部链接时，请使用 `OBSIDIAN_LINK_FORMAT` 值应用 `llm-wiki/SKILL.md`（链接格式部分）中的链接格式。

## 步骤 1：构建共现图

扫描vault中的每个非特殊页面（跳过 `index.md`、`log.md`、`hot.md`、`_insights.md`、`_meta/*`、`_archives/*`、`_raw/*`）。

对于每个页面，收集：
- 它包含的所有 `[[wikilinks]]` （传出链接）
- 其 `tags` 正面内容
- 其 `category` 正面内容

构建共现矩阵：对于每对概念/实体页面（A、B），计算有多少其他页面链接到**A 和 B。这是它们的共现分数。

您无需详尽无遗 — 瞄准共现分数最高的 20-30 对。使用 Grep 有效地查找反向链接：

```bash
grep -rl "\[\[ConceptA\]\]" "$OBSIDIAN_VAULT_PATH" --include="*.md"
```

针对您的最佳候选概念运行此操作并与结果集相交。

## 步骤 2：过滤掉已经合成的对

检查 `synthesis/` 目录中是否存在现有页面。对于每个现有的综合页面：
- 阅读其 `sources` 的 frontmatter 或 `[[wikilinks]]` 的正文
- 将这些概念对标记为已涵盖

从候选列表中删除覆盖的对。

## 步骤 3：对候选人进行评分和排名

对于每个剩余的候选对（或 3+ 的簇），分配一个综合值分数：

|信号|积分|
|---|---|
|同现次数≥5| +3 |
|同现数 3-4 | +2 |
|同现计数 1-2 | +1 |
|概念属于不同类别（跨域） | +2 |
|概念共享标签但位于不同的文件夹中 | +1 |
|一个或两个概念在 `_insights.md` | 中被标记为集线器+1 |
|综合将解决已标记的矛盾 | +2 |

选出前 5 名候选人。如果用户询问特定主题（“综合有关可观察性的所有内容”），请首先过滤该域的候选者。

## 步骤 4：草稿综合页面

对于每个顶级候选者，使用以下模板在 `synthesis/` 中创建一个页面：

```markdown
---
title: <Concept A> × <Concept B>
category: synthesis
tags: [<shared tags>, <domain tags>]
sources: [<all pages that link to both>]
created: TIMESTAMP
updated: TIMESTAMP
summary: "Cross-cutting synthesis of how <A> and <B> interact, with implications for <domain>."
provenance:
  extracted: 0.2
  inferred: 0.7
  ambiguous: 0.1
base_confidence: <min(base_confidence of all input pages)>
lifecycle: draft
lifecycle_changed: TIMESTAMP_DATE
---

# <Concept A> × <Concept B>

## The Connection

*What makes these two concepts worth synthesizing together — the non-obvious relationship that pages about each individually don't capture.*

## Where They Co-occur

*The pages and contexts where both appear. What situations bring them together.*

## Cross-cutting Insight

*The conclusion that only becomes visible when you look at both together. This is the point of the page — the thing you couldn't see from either concept page alone.*

## Tensions and Trade-offs

*Where the two concepts pull in opposite directions. Unresolved contradictions. Cases where applying one undermines the other.*

## Open Questions

*What this synthesis surfaces that the wiki doesn't yet have an answer for. Good candidates for future research.*

## Related

- [[<Concept A>]]
- [[<Concept B>]]
- [[<other related pages>]]
```

**综合页面大多是 `^[inferred]`。** 您正在跨源绘制连接 - 这就是定义的综合。将 `^[inferred]` 应用于交叉结论，并在来源不一致的情况下应用 `^[ambiguous]`。

**标题格式为 `A × B`** — 这向读者表明这是一个综合页面，而不是单独关于任一概念的页面。

## 步骤 5：从源页面反向链接

对于您创建的每个综合页面，添加从其综合的两个（或更多）概念页面到该页面的链接。在概念页面中，添加到其 `## Related` 部分：

```markdown
- [[Concept A × Concept B]] — synthesis
```

如果概念页面没有 `## Related` 部分，请在底部添加一个。

## 步骤 6：报告未采取的综合机会

为前 5 名创建页面后，列出输出中的下 10 个候选者 - 得分较高但您没有为其编写页面的配对。这使用户可以了解 wiki 认为值得探索的内容，而无需强制一次运行中的所有合成。

格式：
```
Skipped (consider next time):
- [[Caching]] × [[Consistency]] — co-occurs in 4 pages, cross-domain
- [[Testing]] × [[Observability]] — co-occurs in 3 pages, shares tags
...
```

## 步骤 7：更新特殊文件

**`index.md`** — 为所有新综合页面添加条目。

**`log.md`** — 附加：
```
- [TIMESTAMP] WIKI_SYNTHESIZE pages_scanned=N synthesis_created=M candidates_skipped=K
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用合成内容更新**最近活动** - 例如“综合了 5 个横切页面：缓存 × 一致性、测试 × 可观察性，……”。使用综合中出现的任何未决问题更新**活动线程**。更新 `updated` 时间戳。

## 质量检查表

- [ ] 每个综合页都有一个 `summary:` 字段（≤200 个字符）
- [ ] 每个综合页面都链接回其源概念
- [ ] 源概念页面链接到综合页面
- [ ] 没有综合页面只是重申源页面上已有的内容 - 它必须添加横切见解
- [ ] `index.md` 和 `log.md` 更新
- [ ] `hot.md` 更新

## 提示

- **仅总结其来源的综合页面是无用的。** 价值在于连接 - 两个来源页面都没有明确说明的内容。
- **不要为了综合而综合。** 如果两个概念碰巧经常一起出现而没有真正的概念联系，请跳过它们。
- **三向综合很强大，但很少见。** 仅当三个概念形成真正的相互影响的三角形时才创建它们 - 不仅仅是因为所有三个概念都出现在同一个项目页面中。
- **首先检查 `_insights.md`。** wiki 状态技能可能已经在那里标记了合成候选者 - 在从头开始运行共现扫描之前从这些候选者开始。

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