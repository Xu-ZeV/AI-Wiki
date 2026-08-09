---
name: wiki-lint
description: >
  Audit and maintain the health of the Obsidian wiki. Use this skill when the user wants to check their
  wiki for issues, find orphaned pages, detect contradictions, identify stale content, fix broken wikilinks,
  or perform general maintenance on their knowledge base. Also triggers on "clean up the wiki",
  "what needs fixing", "audit my notes", or "wiki health check". Add --consolidate to switch from
  report-only to act-and-report mode (the "dream cycle"): fixes broken links, adds missing cross-references
  for orphans, corrects lifecycle states, demotes stale peripheral pages, normalizes tag aliases, and adds
  contradiction callouts — all with a dry-run preview and explicit user confirmation before any writes.
---

# Wiki Lint — 健康审计

您正在Obsidian Wiki上执行健康检查。您的目标是发现并修复随着时间的推移而降低 wiki 价值的结构性问题。

**扫描任何内容之前：**遵循 `llm-wiki/SKILL.md` 中的检索基元表。与整页读取相比，更喜欢 frontmatter 范围的 grep 和部分锚定读取。在一个大的vault中，盲目地阅读每一页来检查代码正是这个框架的目的是要避免的。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`
2.阅读`index.md`获取整页库存
3. 阅读 `log.md` 了解最近的活动背景

## 棉绒检查

按顺序运行这些检查。随时报告调查结果。

### 1. 孤立页面

查找传入 wiki 链接为零的页面。这些是没有任何联系的知识孤岛。

**如何检查：**
- 全局查找vault中的所有 `.md` 文件
- 对于每一页，Grep vault的其余部分以查找 `[[page-name]]` 引用
- 传入链接为零的页面（`index.md` 和 `log.md` 除外）是孤立页面

**如何修复：**
- 确定哪些现有页面应链接到孤立页面
- 在适当的部分添加维基链接

### 2. 损坏的维基链接

查找指向不存在页面的`[[wikilinks]]`。

**如何检查：**
- 在所有页面上查找 `\[\[.*?\]\]`
- 提取链接目标
- 检查对应的`.md`文件是否存在

**如何修复：**
- 如果目标已重命名，请更新链接
- 如果目标存在，则创建它
- 如果链接有误，请删除或更正

### 3. 缺少 Frontmatter

每个页面都应该有：标题、类别、标签、来源、创建、更新。

**如何检查：**
- Grep frontmatter 块（范围为文件头的 `^---`），而不是完整读取每一页
- 标记页面缺少必填字段

**如何修复：**
- 添加具有合理默认值的缺失字段

### 3a。缺少摘要（软警告）

每个页面 *应该* 有一个 `summary:` frontmatter 字段 - 1-2 个句子，≤200 个字符。这就是廉价检索（例如 `wiki-query` 的仅索引模式）读取的内容，以避免打开页面主体。

**如何检查：**
- Grep frontmatter 跨越vault `^summary:`
- 标记没有它的页面，**但作为软警告，而不是错误** - 早于该字段的旧页面没问题；该检查的存在是为了推动摄取技能在新的写入中填充它。
- 还标记摘要超过 200 个字符的页面。

**如何修复：**
- 重新摄取页面，或手动编写简短摘要（页面内容的 1-2 句话）。

### 4. 过时的内容

`updated` 时间戳相对于其来源较旧的页面。

**如何检查：**
- 将页面 `updated` 时间戳与源文件修改时间进行比较
- 标记上次更新页面后源已被修改的页面

### 5.矛盾

跨页面冲突的声明。

**如何检查：**
- 这需要阅读相关页面并比较声明
- 重点关注共享标签或大量交叉引用的页面
- 寻找诸如“然而”、“相反”、“尽管”之类的短语，它们可能表明存在的已承认的矛盾与未承认的矛盾

**如何修复：**
- 添加“开放问题”部分，指出矛盾
- 参考来源及其声明

### 6. 索引一致性

验证 `index.md` 与实际页面库存是否匹配。

**如何检查：**
- 将 `index.md` 中列出的页面与磁盘上的实际文件进行比较
- 检查 `index.md` 中的摘要是否仍与页面内容匹配

### 7. 来源漂移

检查页面是否诚实地了解其内容的多少是推断的还是提取的。有关约定，请参阅 `llm-wiki` 中的来源标记部分。

**如何检查：**
- 对于带有 `provenance:` 块或任何 `^[inferred]`/`^[ambiguous]` 标记的每个页面，计算句子/项目符号以及以每个标记结尾的数量
- 计算粗分数（`extracted`、`inferred`、`ambiguous`）
- 应用这些阈值：
  - **模糊> 15%**：标记为“投机严重”——即使七分之一的声明确实不确定，也表明该页面需要更严格的采购或应移至 `synthesis/`
  - **推断 > 40%，frontmatter 中没有 `sources:`**：标记为“无源合成”——该页面正在建立连接，但没有任何可引用的内容
  - **中心页面**（按传入维基链接计数排名前 10 名），INFERRED > 20%：标记为“来源可疑的高流量页面”——中心页面上的错误会传播到链接到它们的每个页面
- **漂移**：如果页面有 `provenance:` frontmatter 块，则当任何字段与重新计算值相差超过 0.20 时对其进行标记
- **跳过**没有 `provenance:` frontmatter 且没有标记的页面 - 按惯例视为完全提取

**如何修复：**
- 对于模糊性严重：从来源重新摄取，解决不确定的声明，或将推测性内容拆分到 `synthesis/` 页面中
- 对于无源综合：将 `sources:` 添加到 frontmatter 或明确地将页面标记为综合
- 对于 INFERRED > 20% 的中心页面：优先考虑重新摄取 — 这里的错误具有最广泛的传播半径
- 对于漂移：更新 `provenance:` frontmatter 以匹配重新计算的值

### 8. 碎片标签簇

检查共享标签的页面是否确实相互链接。标签意味着一个主题簇；如果这些页面不互相引用，那么集群就会支离破碎——知识孤岛应该编织在一起。

**如何检查：**
- 对于出现在 ≥ 5 页上的每个标签：
  - `n` = 带有此标签的页面数
  - `actual_links` = 此标签组中任意两个页面之间的 wiki 链接计数（检查两个方向）
  - `cohesion = actual_links / (n × (n−1) / 2)`
- 标记内聚度 < 0.15 且 n ≥ 5 的任何标签组

**如何修复：**
- 针对碎片标签运行 `cross-linker` 技能 — 它将显示并插入缺失的链接
- 如果标签组很大（n > 15）并且仍然碎片化，请考虑将其拆分为更具体的子标签

### 9. 可见性标签一致性

检查 `visibility/` 标签是否正确应用，并且没有在重要的地方悄悄丢失。

**如何检查：**

- **未标记的 PII 模式：** Grep 页面正文，用于通常指示敏感数据的模式 — 包含 `password`、`api_key`、`secret`、`token`、`ssn`、`email:` 的行， `phone:` 后跟实际值（不是字段描述）。如果页面匹配但缺少 `visibility/pii` 或 `visibility/internal`，则将其标记为可能的错误分类。
- **`visibility/pii` 没有 `sources:`：** 标记为 `visibility/pii` 的页面应始终具有 `sources:` frontmatter 字段 - 如果没有出处，则无法验证分类。标记任何缺少 `sources:` 的 `visibility/pii` 页面。
- **分类中的可见性标签：** `visibility/` 标签是系统标签，不得**出现在 `_meta/taxonomy.md` 中。如果在那里找到，请将其标记为配置错误 - 它们将被计入包含它们的页面的 5 个标签限制。

**如何修复：**
- 对于未标记的 PII 模式：将 `visibility/pii`（如果是团队上下文而不是个人数据，则添加 `visibility/internal`）到页面的 frontmatter 标记
- 对于缺失的 `sources:`：添加出处或升级给用户 — 不要自动填充
- 对于分类污染：从 `_meta/taxonomy.md` 中删除 `visibility/` 条目

### 10. 其他促销候选人

在 `misc/` 中查找已积累足够项目亲和力以进行推广的页面。

**如何检查：**
- 全局 `$OBSIDIAN_VAULT_PATH/misc/*.md`
- 对于每一页，阅读 `affinity` frontmatter 字段
- 标记任何单个项目得分≥3的页面

**如何修复：**
- 如果亲和力分数看起来过时，请首先运行 `cross-linker` 技能（例如，在包含许多 wiki 链接的页面上使用 `affinity: {}`）
- 推广：将页面移至 `projects/<project-name>/references/`（或其他适当的类别），更新其 `category` frontmatter，删除 `promotion_status`，并 grep 库中的反向链接以更新它们

### 12. 置信度和生命周期模式

强制执行置信度 + 生命周期前沿架构（请参阅 `llm-wiki/SKILL.md`，置信度和生命周期部分）。

两种模式：
- **`--check`**（默认，只读）— 报告错误和警告
- **`--fix`** — 仅当检测到漂移时才可以重写 `base_confidence`（规则 12e）；从不重写 `lifecycle`

#### 规则 12a — `lifecycle` 枚举验证

**如何检查：** 所有页面上的 Grep frontmatter 为 `^lifecycle:`。标记不在 `{draft, reviewed, verified, disputed, archived}` 中的任何值。

**如何修复：** 不适用（只有人类应该设置生命周期状态）

#### 规则 12b — `base_confidence` 范围

**如何检查：** 所有页面上的 Grep frontmatter 为 `^base_confidence:`。标记 `[0.0, 1.0]` 之外的任何值或完全缺少该字段的任何页面。

**如何修复：** 不适用（错误的值意味着技能计算错误 - 手动校正的表面）

#### 规则 12c — 陈旧页面报告（计算覆盖）

过时状态永远不会被存储——它是在读取时计算的：`is_stale = (today − updated) > 90 days`。

**如何检查：** 对于每一页，从 frontmatter 读取 `updated:` 并计算 `is_stale`。如果过时，还请检查 `lifecycle:`。报告：
- 带有 `lifecycle: verified` 的过时页面，带有较大的注释（这些是最危险的 - 可能是错误的高信任页面）
- 所有其他过时页面作为标准警告

**如何修复：** `--fix` 不会**重写 `lifecycle`。当重新摄取达到 `updated` 时，陈旧状态会自动清除。

#### 规则 12d — 取代完整性

**如何检查：** 对于每个带有 `superseded_by: "[[target]]"` 的页面：
- 验证目标页面是否存在
- 验证目标页不是其本身 `archived`（无循环或链式取代）
- 验证没有循环（A 取代 B，B 又取代 A）
- 如果 `lifecycle != archived` 设置为 `superseded_by`，则发出警告（不一致状态）

**如何修复：** n/a — 人类分辨率标志

#### 规则 12e — 置信度漂移

**如何检查：** 对于 frontmatter 中同时包含 `base_confidence:` 和 `sources:` 的页面，使用 `llm-wiki/SKILL.md` 中的公式重新计算 `base_confidence`。如果存储的值与重新计算的值相差超过 0.05，则将其标记为漂移。

**如何修复（仅限 `--fix`）：** 将 `base_confidence` 字段重写为重新计算的值。这是自动改变 frontmatter 的**唯一规则**。

#### 迁移时间表

|相|当 |缺失字段的行为 |
|---|---|---|
|第一阶段：试运行 |初始公关 |仅警告 - 任何页面上缺少 `base_confidence` 或 `lifecycle` |
|第 2 阶段：强制实施新页面 | +2 周 |新创建的页面缺少字段时出错；即使在日常维护期间 `updated` 被碰撞，现有页面仍会发出警告 |
|第三阶段：全面执行 | +6 周，在单独的 PR 中交付的回填脚本上进行控制 |所有页面均出现错误 |

#### 输出添加

添加到 Wiki 健康报告：

```markdown
### Confidence/Lifecycle Issues (N found)
- `concepts/foo.md` — missing `lifecycle` field (warning: Phase 1)
- `entities/bar.md` — `lifecycle: stalestate` is not a valid enum value
- `concepts/scaling.md` — `base_confidence: 1.4` is out of range [0.0, 1.0]
- `synthesis/old-analysis.md` — STALE (last updated 2025-10-01, 182 days ago) lifecycle=verified ⚠️ HIGH PRIORITY
- `concepts/outdated.md` — STALE (last updated 2025-11-15, 137 days ago) lifecycle=draft
- `entities/tool-v1.md` — `superseded_by: [[entities/tool-v2]]` but lifecycle=draft (expected archived)
- `concepts/drift-example.md` — base_confidence drift: stored=0.80, recomputed=0.59 (delta=0.21)
```

附加到 `LINT` 日志条目：
```
- [TIMESTAMP] LINT ... lifecycle_issues=N
```

### 13.类型化关系的有效性

验证 `relationships:` frontmatter 块。跳过没有 `relationships:` 块的页面 - 该字段是可选的。

**允许的类型：** `extends`、`implements`、`contradicts`、`derived_from`、`uses`、`replaces`、`related_to`

**如何检查：**
- 所有vault页面上的 `^relationships:` 的 Grep frontmatter
- 对于每个具有 `relationships:` 块的页面，阅读其 frontmatter （不是完整的页面正文）
- 对于块中的每个条目：
  1. **类型验证** — 标记不在上述允许集中的任何 `type:` 值
  2. **损坏的目标** — 从 `target:` 字符串中剥离 `[[` and `]]`，规范化（小写、空格→连字符、剥离 `.md`），并检查 Vault 中是否存在该路径上的 `.md` 文件。标记未解决的目标。
  3. **自引用** — 标记已解析目标等于页面自己的节点 ID 的任何条目

**如何修复：**
- 无效类型：将值更正为最接近的允许类型，或在类型不明确时使用 `related_to`
- 损坏的目标：更新或删除条目；如果目标页面应该存在，请先创建它
- 自引用：删除条目

**输出添加：**

```markdown
### Typed Relationship Issues (N found)
- `concepts/foo.md` — relationships[1]: type "contradication" is not an allowed type (did you mean "contradicts"?)
- `concepts/bar.md` — relationships[0]: target "[[skills/nonexistent-skill]]" resolves to no page in vault
- `entities/baz.md` — relationships[2]: self-reference (target resolves to this page's own id)
```

附加到 `LINT` 日志条目：
```
... relationship_issues=N
```

### 11.综合差距

确定 wiki 缺少的高价值综合机会 - 在许多页面中同时出现但没有 `synthesis/` 页面连接它们的概念对。

**如何检查：**
- 列出 `synthesis/` 中的所有页面 — 收集每个页面已经涵盖的概念对（来自其 `[[wikilinks]]` 或标题）
- 从 `concepts/` 和 `entities/` 中挑选 10-15 个经常链接的概念
- 对于每一对，运行快速 grep 来计算链接到两者的页面：
  ```bash
  grep -rl "\[\[ConceptA\]\]" "$OBSIDIAN_VAULT_PATH" --include="*.md" > /tmp/a.txt
  grep -rl "\[\[ConceptB\]\]" "$OBSIDIAN_VAULT_PATH" --include="*.md" > /tmp/b.txt
  comm -12 <(sort /tmp/a.txt) <(sort /tmp/b.txt) | wc -l
  ```
- 标记没有现有综合页面的同现 ≥ 3 对

**如何修复：**
- 运行 `/wiki-synthesize` 自动发现并填补顶部空白

## 输出格式

以结构化列表的形式报告调查结果：

```markdown
## Wiki Health Report

### Orphaned Pages (N found)
- `concepts/foo.md` — no incoming links

### Broken Wikilinks (N found)
- `entities/bar.md:15` — links to [[nonexistent-page]]

### Missing Frontmatter (N found)
- `skills/baz.md` — missing: tags, sources

### Stale Content (N found)
- `references/paper-x.md` — source modified 2024-03-10, page last updated 2024-01-05

### Contradictions (N found)
- `concepts/scaling.md` claims "X" but `synthesis/efficiency.md` claims "not X"

### Index Issues (N found)
- `concepts/new-page.md` exists on disk but not in index.md

### Missing Summary (N found — soft)
- `concepts/foo.md` — no `summary:` field
- `entities/bar.md` — summary exceeds 200 chars

### Provenance Issues (N found)
- `concepts/scaling.md` — AMBIGUOUS > 15%: 22% of claims are ambiguous (re-source or move to synthesis/)
- `entities/some-tool.md` — drift: frontmatter says inferred=0.10, recomputed=0.45
- `concepts/transformers.md` — hub page (31 incoming links) with INFERRED=28%: errors here propagate widely
- `synthesis/speculation.md` — unsourced synthesis: no `sources:` field, 55% inferred

### Fragmented Tag Clusters (N found)
- **#systems** — 7 pages, cohesion=0.06 ⚠️ — run cross-linker on this tag
- **#databases** — 5 pages, cohesion=0.10 ⚠️

### Visibility Issues (N found)
- `entities/user-records.md` — contains `email:` value pattern but no `visibility/pii` tag
- `concepts/auth-flow.md` — tagged `visibility/pii` but missing `sources:` frontmatter
- `_meta/taxonomy.md` — contains `visibility/internal` entry (system tag must not be in taxonomy)

### Misc Promotion Candidates (N found)
Pages in misc/ that have ≥ 3 connections to a single project and are ready to be promoted:

| Page | Top Project | Affinity Score |
|---|---|---|
| `misc/web-martinfowler-articles-microservices.md` | `obsidian-wiki` | 4 |

### Typed Relationship Issues (N found)
- `concepts/foo.md` — relationships[1]: type "contradication" is not an allowed type
- `concepts/bar.md` — relationships[0]: target "[[skills/nonexistent]]" resolves to no page

### Synthesis Gaps (N found)
Concept pairs that co-occur frequently but have no synthesis page:

| Pair | Co-occurrence | Suggested Action |
|---|---|---|
| [[Caching]] × [[Consistency]] | 5 pages | Run `/wiki-synthesize` |
| [[Testing]] × [[Observability]] | 3 pages | Run `/wiki-synthesize` |
```

## 代码检查后

附加到`log.md`：
```
- [TIMESTAMP] LINT issues_found=N orphans=X broken_links=Y stale=Z contradictions=W prov_issues=P missing_summary=S fragmented_clusters=F visibility_issues=V promotion_candidates=C synthesis_gaps=G relationship_issues=R
```

主动解决问题或让用户决定解决哪个问题。

---

## 合并模式 (`--consolidate`)

由 `wiki-lint --consolidate` 触发。从仅报告切换到**行动并报告**——定期运行的“梦想周期”，以便维基自我修复。

### 安全协议

**始终先进行空运行。** 在编写任何内容之前：

1. 运行全部 12 项 lint 检查（上述步骤 1-12）。
2. 将计划的合并操作打印为结构化列表（请参阅下面的试运行输出）。
3.询问用户：`"Apply these N changes? [yes / no / select]"`。
4. 仅在明确确认后才继续写入。如果用户选择单独的操作，则仅应用这些操作。
5. 切勿合并页面 - 使用 `wiki-dedup` 进行合并。仅链接、升级、降级和标记。

### 合并行动（按顺序，确认后）

#### 行动 1：修复损坏的 wiki 链接

对于检查 2 中发现的每个损坏的 `[[Target]]`：
- 在库中搜索标题或文件名最接近模糊匹配的页面（在 `index.md` 标题中使用 `Grep`）
- 如果存在唯一的最佳匹配（编辑距离≤2个字符或相同的根词）：重写链接。注意重写：`[[Oringal]] → [[corrected-page]]`。
- 如果不匹配或不明确：转换为纯文本（`~~[[Target]]~~` → `Target`）并添加注释 `<!-- broken link: no match found -->`。
- 切勿仅仅为了满足损坏的链接而创建新页面。

#### 操作 2：为孤儿添加缺失的交叉引用

对于检查 1 中找到的每个孤立页面（零传入链接）：
- Grep 库正文文本以查找页面标题或别名的提及（不区分大小写）。
- 对于在另一个页面中找到的每个提及，添加 `[[wikilink]]` 替换纯文本提及。
- 每个孤立项最多插入 3 次 — 不要用链接淹没页面。
- 其范围仅限于孤儿（与广泛运行的 `cross-linker` 不同）。

#### 操作 3：正确的生命周期状态

自动应用这些规则（它们不需要人工判断——它们强制执行记录的状态机）：
- **推广 `draft` → `reviewed`：** `lifecycle: draft` 和 `created` > 30 天前和 `base_confidence > 0.7` 的页面。设置 `lifecycle: reviewed`、`lifecycle_changed: <today>`、`lifecycle_reason: "auto-promoted by wiki-lint --consolidate: age>30d, confidence>0.7"`。
- **降级 `verified` → `stale`：** 不是状态转换 - `stale` 是计算的覆盖，而不是生命周期值。相反：对于 `is_stale = (today − updated) > 180 days` 的已验证页面，请在页面正文顶部添加标注：`> ⚠️ **Stale**: This page was last updated <date>. Verify before relying on it.` 仅当标注尚不存在时才添加。
- **不要更改 `reviewed` → `verified` 或任何其他转换** - 这些仅限于人类。

#### 行动 4：等级降级

对于带有 `tier: supporting`（或未设置）且有 0 个传入链接且在 90 多天内未更新的页面：
- 设置 `tier: peripheral`。
- 发出降级列表供用户查看。
- 不要自动降级 `tier: core` 页面 - 这些页面是手动设置的。

#### 操作 5：标签标准化

读取 `_meta/taxonomy.md` 以获取别名映射（例如，`ml → machine-learning`）。对于每个页面，将 `tags:` frontmatter 字段中的已知别名标签替换为其规范形式。这是 `tag-taxonomy` 工作的一个子集 - 仅修复别名，没有完整审核。

#### 操作 6：矛盾标注

对于标记为相互矛盾的每对页面（通过 frontmatter 中的 `relationships: contradicts`，或在检查 5 中标记）：
- 检查相关声明附近是否已存在 `> ⚠️ Contradiction flagged with [[Other Page]]` 标注。
- 如果没有，请将其添加到“关键想法”部分的末尾（如果没有“关键想法”部分，则将其添加到“开放问题”之前）。保持简洁——一行。
——不解决矛盾；仅在视觉上标记它。

### 行动 7：撰写合并报告

完成所有操作后，写报告给`synthesis/consolidation-<YYYY-MM-DD>.md`：

```markdown
---
title: Consolidation Report <YYYY-MM-DD>
category: synthesis
tags: [maintenance, consolidation]
sources: []
summary: Auto-generated consolidation report from wiki-lint --consolidate run on <date>.
lifecycle: draft
lifecycle_changed: <date>
tier: peripheral
created: <ISO timestamp>
updated: <ISO timestamp>
---

# Consolidation Report — <YYYY-MM-DD>

## Summary
- Broken links fixed: N
- Cross-references added: M
- Lifecycle states updated: K
- Tier demotions: D
- Tags normalized: T
- Contradiction callouts added: C

## Broken Link Fixes
- `concepts/foo.md:12` — [[OldTarget]] → [[correct-target]]
- `entities/bar.md:8` — [[Missing]] → `Missing` (no match found)

## Cross-References Added (orphan rescue)
- `concepts/baz.md` — now linked from: [[concepts/alpha]], [[skills/beta]]

## Lifecycle Updates
- `concepts/old-draft.md` — draft → reviewed (age 45d, confidence 0.74)
- `synthesis/stale-verified.md` — stale callout added (last updated 2025-10-01)

## Tier Demotions
- `concepts/unused-concept.md` — supporting → peripheral (0 links, 120 days stale)

## Tag Normalizations
- `entities/some-tool.md` — `ml` → `machine-learning`

## Contradiction Callouts
- `concepts/scaling.md` — flagged contradiction with [[synthesis/efficiency]]
```

### 试运行输出（在任何写入之前显示）

```
wiki-lint --consolidate — Dry Run

Planned actions (N total):
[1] Fix broken link: concepts/foo.md:12 [[OldTarget]] → [[correct-target]]
[2] Add cross-ref: concepts/baz.md ← [[concepts/alpha]] (orphan rescue)
[3] Lifecycle: concepts/old-draft.md → reviewed (age 45d, confidence 0.74)
[4] Tier demotion: concepts/unused.md → peripheral (0 links, 112 days stale)
[5] Tag alias: entities/some-tool.md: ml → machine-learning
[6] Contradiction callout: concepts/scaling.md ↔ [[synthesis/efficiency]]

Apply these 6 changes? [yes / no / select by number]
```

### 合并模式的日志条目

```
- [TIMESTAMP] LINT_CONSOLIDATE links_fixed=N orphans_rescued=M lifecycle_updates=K tier_demotions=D tag_fixes=T contradiction_callouts=C report=synthesis/consolidation-YYYY-MM-DD.md
```

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