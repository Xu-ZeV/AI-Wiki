---
name: wiki-status
description: >
  Show the current state of the wiki — what's been ingested, what's pending, and the delta between sources
  and wiki content. Use this skill when the user asks "what's the status", "how much is ingested",
  "what's left to process", "show me the delta", "what changed since last ingest", "wiki dashboard",
  or wants an overview of their knowledge base health and completeness. Also use before deciding whether
  to append or rebuild. Includes an insights mode triggered by "wiki insights", "what's central",
  "show me the hubs", "central pages", "what's connected", "wiki structure" — analyzes the shape of
  the wiki itself to surface top hubs, cross-domain bridges, and orphan-adjacent pages.
---

# Wiki 状态 — 审计与 Delta

您正在计算 wiki 的当前状态：已摄取的内容、自上次摄取以来的新增内容以及增量是什么样的。这有助于用户决定是追加（摄取增量）还是重建（存档并重新处理所有内容）。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`、`OBSIDIAN_SOURCES_DIR`、`CLAUDE_HISTORY_PATH` 和 `CODEX_HISTORY_PATH`。
2. 在vault根读取 `.manifest.json` — 这是摄取跟踪分类帐

## 清单

该清单位于 `$OBSIDIAN_VAULT_PATH/.manifest.json`。它跟踪已摄取的每个源文件。如果它不存在，那么这就是一个没有被摄入任何东西的新鲜vault。

```json
{
  "version": 1,
  "last_updated": "2026-04-06T10:30:00Z",
  "sources": {
    "/absolute/path/to/file.md": {
      "ingested_at": "2026-04-06T10:30:00Z",
      "size_bytes": 4523,
      "modified_at": "2026-04-05T08:00:00Z",
      "source_type": "document",
      "project": null,
      "pages_created": ["concepts/transformers.md"],
      "pages_updated": ["entities/vaswani.md"]
    },
    "~/.claude/projects/-Users-name-my-app/abc123.jsonl": {
      "ingested_at": "2026-04-06T11:00:00Z",
      "size_bytes": 128000,
      "modified_at": "2026-04-06T09:00:00Z",
      "source_type": "claude_conversation",
      "project": "my-app",
      "pages_created": ["entities/my-app.md"],
      "pages_updated": ["skills/react-debugging.md"]
    }
  },
  "projects": {
    "my-app": {
      "source_path": "~/.claude/projects/-Users-name-my-app",
      "vault_path": "projects/my-app",
      "last_ingested": "2026-04-06T11:00:00Z",
      "conversations_ingested": 5,
      "conversations_total": 8,
      "memory_files_ingested": 3
    }
  },
  "stats": {
    "total_sources_ingested": 42,
    "total_pages": 87,
    "total_projects": 6,
    "last_full_rebuild": null
  }
}
```

## 步骤 1：扫描电流源

建立一个现在可以摄取的所有内容的清单：

### 文件（来自 `OBSIDIAN_SOURCES_DIR`）
```
Glob each directory in OBSIDIAN_SOURCES_DIR for all text files
Record: path, size, modification time
```

### 克劳德历史（来自 `CLAUDE_HISTORY_PATH`）
```
Glob: ~/.claude/projects/*/          → project directories
Glob: ~/.claude/projects/*/*.jsonl   → conversation files
Glob: ~/.claude/projects/*/memory/*.md → memory files
Record: path, size, modification time, parent project
```

### 法典历史（来自 `CODEX_HISTORY_PATH`）
```
Glob: ~/.codex/session_index.jsonl            → session inventory index
Glob: ~/.codex/sessions/**/rollout-*.jsonl    → session rollout transcripts
Glob: ~/.codex/history.jsonl                  → optional local history log
Glob: ~/.codex/archived_sessions/**/rollout-*.jsonl → archived rollouts (if user wants archive coverage)
Record: path, size, modification time, inferred project from cwd when available
```

### 用户之前指出的任何其他来源
检查清单中标准目录之外的源路径。

## 步骤 2：计算 Delta

将当前来源与清单进行比较。对每个源文件进行分类：

|状态 |意义|需要采取行动|
|---|---|---|
| **新** |文件存在于磁盘上，而不是在清单中 |需要摄取|
| **修改** |清单中的文件，哈希值与 `content_hash` 不同 |需要重新摄取|
| **感动** |清单中的文件，mtime 较新，但哈希值未更改 |跳过 — 内容相同，无需重新摄取 |
| **不变** |清单中的文件、mtime 和 hash 均匹配 |无事可做|
| **已删除** |在清单中，但文件不再存在于磁盘上 |请注意 — wiki 页面可能已经过时 |

当清单条目没有 `content_hash`（较旧的条目）时，仅回退到 mtime 比较。

特别是对于克劳德的历史，还需要计算：
- 新项目（`~/.claude/projects/` 中的目录不在清单中）
- 现有项目中的新对话
- 更新了内存文件

特别是对于法典历史，还需要计算：
- `sessions/**` 下的新部署文件
- 更新了 `session_index.jsonl` 条目（会话标题/新鲜度更改）
- 仅当请求存档覆盖范围时存档推出增量

## 步骤 3：报告状态

**可见性计数（呈现报告之前）：** 在所有vault `.md` 页面中查找 `visibility/internal` 和 `visibility/pii` 标签值的 Frontmatter。计数：
- `public` = 带有 `visibility/public` 标签的页面 **或** 根本没有 `visibility/` 标签
- `internal` = 带有 `visibility/internal` 标签的页面
- `pii` = 带有 `visibility/pii` 标签的页面

将此作为 `Page visibility: N public · M internal · K pii` 包含在概述部分中。如果所有页面均未标记（完全公共vault），请跳过该行。

给出一个清晰的总结：

```markdown
# Wiki Status

## Overview
- **Total wiki pages:** 87 across 6 categories
- **Page visibility:** 72 public · 11 internal · 4 pii
- **Total sources ingested:** 42
- **Projects tracked:** 6
- **Last ingest:** 2026-04-06T11:00:00Z
- **Staged writes pending:** 4 pages · 2 patches (oldest: 3 days ago)  ← only when WIKI_STAGED_WRITES=true

## Delta (what's changed since last ingest)

### New sources (never ingested): 12
| Source | Type | Size |
|---|---|---|
| ~/Documents/research/new-paper.pdf | document | 2.1 MB |
| ~/.claude/projects/-Users-.../session-xyz.jsonl | claude_conversation | 340 KB |
| ~/.codex/sessions/2026/04/12/rollout-...jsonl | codex_rollout | 220 KB |
| ... | | |

### Modified sources (need re-ingesting): 3
| Source | Last ingested | Last modified | Delta |
|---|---|---|---|
| ~/notes/architecture.md | 2026-04-01 | 2026-04-05 | 4 days newer |
| ... | | | |

### New projects (not yet in wiki): 2
- **tractorex** (3 conversations, 2 memory files)
- **papertech** (1 conversation, 0 memory files)

### Deleted sources (ingested but gone): 0

## Summary
- **Ready to ingest:** 12 new + 3 modified = 15 sources
- **Up to date:** 27 sources unchanged
- **Recommendation:** Append (delta is small relative to total)

## Token Footprint (estimated)

| Scope | Pages | ~Tokens |
|---|---|---|
| core tier | 12 | 18,400 |
| supporting tier | 87 | 94,200 |
| peripheral tier | 43 | 31,600 |
| **Full wiki (all)** | **142** | **144,200** |

Index-only pass (frontmatter + summaries): ~8,900 tokens
Typical query (index + 5 full pages):      ~14,200 tokens

⚠️  Full wiki exceeds 100K tokens. Consider:
  - Demoting peripheral pages (promote tier suggestions from wiki-status insights mode)
  - Running /wiki-lint --consolidate to merge near-duplicates
  - Using wiki-query fast mode for most queries
```

## 步骤 3b：计算token足迹

构建状态摘要后，计算token足迹估计：

1. **每层页面大小** — 全局显示所有 `.md` 页面。读取每个的 `tier:` frontmatter 字段（便宜的 grep）。按层值对页面进行分组（`core`、`supporting`、`peripheral`；未设置 → `supporting`）。

2. **估计token** - 对于每个页面，将token计数估计为 `file_size_bytes / 4`（4 个字符/token启发式 - 不需要实际的token生成器）。每层总和和总计。

3. **仅索引估计** — 估计仅索引传递的成本：每个页面 frontmatter 的总和 `len(title) + len(summary) + len(tags)`（平均每个页面约 100 个字符）除以 4。

4. **典型查询估算** — 仅索引估算 + 5 个页面的平均完整读取成本 (`total_chars / total_pages * 5 / 4`)。

5. **阈值检查** — 从配置中读取 `WIKI_TOKEN_WARN_THRESHOLD`（默认值：`100000`）。如果是 `0`，则跳过警告。如果完整 wiki token估计超过阈值，请发出 `⚠️` 警告，并提供上面模板中显示的三个补救建议。

6. **包含在每个标准状态运行中** - 正常模式和洞察模式。方法说明 (`4 chars/token heuristic`) 作为脚注显示在表下方。

## 第 4 步：下一步做什么

将旧的单行建议替换为排名**下一步做什么**部分。在渲染之前收集这些信号：

### 4a：收集信号

0. **分阶段写入挂起**（仅当 `WIKI_STAGED_WRITES=true` 时）— Glob `$OBSIDIAN_VAULT_PATH/_staging/**/*.md` 和 `**/*.patch.md`。分别计算新页面和补丁。报告最旧文件的年龄 (mtime)。如果存在任何暂存文件，这总是首先列出——它具有最高的意图信号（LLM已经完成了工作；人们只需要审查）。

1. **`_raw/` 文件** — 列出 `$OBSIDIAN_VAULT_PATH/_raw/` 中不是 `.gitkeep` 的每个文件。数一数并说出它们的名字。

2. **过时的核心页面** — 扫描所有vault `.md` 文件。当一个页面的 `updated` frontmatter 字段在今天日期之前 ≥90 天并且它有 ≥5 个传入 wiki 链接（即，它是“核心”——其他页面依赖于它）时，该页面就是“过时的”。按名称 + 最后更新日期列出它们。

3. **孤立页面** — 传入 wiki 链接为零的页面。计算：遍历所有 `.md` 页面，提取每个 `[[wikilink]]`，计算对每个页面的引用，收集具有 `incoming == 0` 的页面。最多显示 5 个姓名；报告总数。

4. **综合机会** — 检查 `hot.md` 是否有任何最近的 `/wiki-synthesize` 运行摘要。如果最后一次综合运行报告了 N 个机会，则表面计数。如果最近没有运行过综合（过去 14 天内不在 `hot.md` 或 `log.md` 中运行），则将其标记为“综合扫描过期”。

5. **源增量** — 来自步骤 2：准备摄取的新的 + 修改的源的计数。

6. **Lint 问题** — 检查 `log.md` 最近的 `/wiki-lint` 运行（过去 30 天内）。如果最近的运行记录了损坏的链接或缺少标题，请显示计数。如果日志中没有出现 lint 运行，则标记“lint 最近未运行”。

### 4b：排名和渲染

对每个类别进行评分并发出排名列表，**上限为 6 个项目**。始终按此优先顺序排名（如果计数为 0 或没有任何内容可报告，则跳过该类别）：

|优先|类别 |触发|
|---|---|---|
| 0 |暂存写入待处理 | `_staging/` 中的任何 `.md`/`.patch.md`（仅当 `WIKI_STAGED_WRITES=true` 时）|
| 1 | `_raw/` 文件等待 | `_raw/` | 中存在的任何文件
| 2 |过时的核心页面 |任何页面：更新时间≥90天前且≥5个传入链接 |
| 3 |孤儿页面 |任何传入 wiki 链接为零的页面 |
| 4 |合成机会|上次综合运行的 N 个机会，或扫描逾期 |
| 5 |新的/修改的来源 |从步骤 2 中的增量计数 |
| 6 |棉绒问题 |上次 lint 运行或 lint 过期的已知问题 |

渲染为：

```markdown
## What to Do Next

0. 📋  6 staged pages waiting for review (oldest: 3 days ago)
   → 4 new pages + 2 patches in _staging/
   run: /wiki-stage-commit

1. 📥  Ingest 3 files waiting in _raw/
   → architecture-notes.md, meeting-2026-05-10.md, paper-draft.pdf
   run: /wiki-ingest

2. 🔄  Refresh 2 stale core pages (not updated in 90+ days)
   → [[System Architecture]] (last updated 2026-02-10), [[API Design]] (2026-01-15)
   run: open these pages and re-run /wiki-update

3. 🔗  Link 7 orphan pages  →  run: /cross-linker
   Disconnected: [[Redis Caching]], [[JWT Tokens]], +5 more

4. 🧩  2 synthesis opportunities identified  →  run: /wiki-synthesize
   [[Redis Caching]] × [[Session Management]] (co-occur in 8 pages)

5. ✅  4 sources modified since last ingest  →  run: /wiki-ingest (append mode)

6. 🩺  Lint not run in 30+ days — run: /wiki-lint
```

**空状态：** 如果所有类别都没有任何可报告的内容（没有暂存文件、没有 `_raw/` 文件、没有孤立文件、没有陈旧页面、没有合成机会、没有新源、没有 lint 问题），则输出：

```markdown
## What to Do Next

✅  Wiki is healthy — nothing urgent.
    All sources up to date · no orphans · no stale core pages · no _raw/ files pending · no staged writes
```

**溢出：** 如果显示超过 6 个项目，请添加页脚行：`_(N more items available — run /wiki-status --full to see all)_`。 `--full` 标志尚未实现；这是设定期望的前瞻性文案。

## 洞察模式

当用户询问诸如“wiki 见解”、“我的 wiki 的核心是什么”、“显示中心”、“跨域桥梁”、“哪些页面最重要”或“wiki 结构”等问题时触发。这种模式是“附加的”——它不会取代增量报告，而是分析 wiki 本身的“形状”。

增量报告告诉用户什么是待处理的，洞察模式告诉他们他们已经构建了什么以及有趣的结构位于哪里。通过表面*有趣的结构*来补充 `wiki-lint`（发现*问题*）。

### 计算什么

**首先，构建 wikilink 图表。** 遍历所有 `.md` 页面，提取每个 `[[wikilink]]`，然后构建：
- `incoming[page]` = 链接到该页面的其他页面的计数
- `outgoing[page]` = 此页面链接到的页面数
- `tags[page]` = 来自 frontmatter 的标签集
- `category[page]` = 目录前缀（概念/、实体/、技能/等）

您将在下面的所有部分中重复使用此图表。

---

1. **锚页面（顶部中心）。** 具有最多传入链接的页面 - 承载概念。
   - 按 `incoming` 数量对所有页面进行排名，取前 10 名
   - 对于每个页面，记下传入和传出计数：传入*和*高传出的页面是连接器中心（最有价值）
   - 具有高传入但零传出的页面是接收器集线器 - 标记为交叉链接器候选者

2. **桥接页面。** 连接原本断开连接的标签集群的页面 - 删除它们将会对图进行分区。这些在结构上通常比原始枢纽数量所暗示的更重要。
   - 对于每个页面 P，找到页面对 (A, B)，其中：
     - A链接到P，B从P链接（反之亦然）
     - A 和 B 彼此共享**无标签**
     - P是A的标签簇和B的标签簇之间2跳以内的唯一路径
   - 按跨簇对P桥的数量排序；显示前 5 名
   - 每个标签：“`P` 桥 `[tag-cluster-A]` ↔ `[tag-cluster-B]`”

3. **标签簇内聚力。** 对于每个具有 ≥ 5 个页面的标签，对其内部页面的互连紧密程度进行评分：
   - `n` = 共享此标签的页面数
   - `actual_links` = 此标签组中任意两个页面之间的 wiki 链接数量
   - `cohesion = actual_links / (n × (n−1) / 2)` — 实际链接与最大可能链接的比率
   - **碎片集群**（内聚度 < 0.15，n ≥ 5）：这些页面共享一个主题，但没有交织在一起。将它们作为交联剂目标表面。
   - 按内聚力显示前 5 个标签（最强集群）和后 5 个标签（最分散）

4. **令人惊讶的连接。** 不明显的跨类别 wiki 链接 — 根据它们的意外程度来评分：
   - 对每个跨越类别边界的维基链接进行评分（例如，`concepts/` → `entities/`、`skills/` → `synthesis/`）：
     - **+3** 如果链接页面或声明标记为 `^[ambiguous]`（不确定连接，值得审查）
- **+2** 如果链接页面标记为 `^[inferred]` （合成的，未直接说明）
     - **+2** 如果类别位于不同的知识层（例如，`concepts` ↔ `entities` 比 `concepts` ↔ `concepts` 更令人惊讶）
     - **+2** 如果源页面的总链接数≤2（外围），但目标页面的链接数≥8（中心）——从边缘到中心的意外到达
   - 显示得分最高的 5 个连接，并附上每个连接的简单语言原因

5. **孤立相邻建议。** 从排名前 10 的中心链接的页面，但其自己的传出链接为零。高流量区域的死胡同——主要的交联剂候选者。

6. **粗略集群。** 按主导标签对锚点页面进行分组。 （简单的标签交叉——仅用于定向。）

7. **自上次运行以来的图增量。** 将当前链接图与先前 `_insights.md` 中存储的快照进行比较：
   - 读取前一个 `_insights.md` 底部的 `<!-- GRAPH_SNAPSHOT: ... -->` 行（如果存在）——它包含一个紧凑的 JSON 边缘列表
   - 计算：添加新页面、删除页面、创建新维基链接、删除维基链接
   - 标志：上次运行时被隔离但现在具有传入链接的页面（“新连接：X，Y”）
   - 标记：自上次运行以来丢失传入链接的页面（“链接目标可能已重命名：A、B”）
   - 如果不存在以前的快照，则跳过此部分

8. **层分配建议。** 在计算中心和网桥之后，建议 `tier:` 更改。切勿将 `tier:` 写入页面 - 仅提供表面建议，以便人们可以做出决定。
   - **升级到`core`：**具有≥5个传入链接的页面或当前具有`tier: supporting`或没有`tier:`字段的前5个桥位置
   - **降级到 `peripheral`：** 具有 ≤1 个传入链接且在 90 多天内未更新且当前具有 `tier: supporting` 或 `tier: core` 的页面
   - 最多显示 10 条建议（先升职，后降职），格式为：
     ```
     Tier Suggestions:
     ↑ core    [[concepts/attention-mechanism]] — 14 incoming links, currently tier=supporting
     ↑ core    [[entities/andrej-karpathy]]     — bridge (3 cluster pairs), currently unset
     ↓ peripheral [[concepts/old-concept]]       — 0 incoming, 120 days stale
     ```
- 如果所有高链接页面已经有 `tier: core` 并且所有低链接页面都有 `tier: peripheral`，则发出：“层分配看起来很健康 - 没有建议进行更改。”

9. **建议的问题。** 此 wiki 结构具有独特的定位来回答或揭示差距的问题：
   - 来自 `^[ambiguous]` 声明：“解决：`X` 和 `Y` 之间的确切关系是什么？”
   - 从桥页：“探索：为什么 `P` 将 `[cluster-A]` 连接到 `[cluster-B]`？”
   - 来自零传入链接的页面：“链接：`X` 没有传入链接 - 应该引用什么？”
   - 来自碎片集群（内聚度 < 0.15）：“审核：标签 `[T]` 是否应该拆分为更集中的子标签？”
   - 最多显示 7 个，优先考虑 AMBIGUOUS，然后桥接节点，然后隔离

---

### 输出

将结果写入vault根处的 `_insights.md`。自由覆盖——它是可再生的。最后，将紧凑的图形快照嵌入为 HTML 注释，以便下次运行可以对其进行比较。

```markdown
# Wiki Insights — <TIMESTAMP>

## Anchor Pages (top 10 hubs)
| Page | Incoming | Outgoing | Note |
|---|---|---|---|
| [[concepts/transformer-architecture]] | 23 | 8 | connector hub |
| [[entities/andrej-karpathy]] | 17 | 0 | sink hub — cross-linker candidate |

## Bridge Pages (top 5)
| Page | Bridges | Cross-cluster pairs |
|---|---|---|
| [[concepts/exponential-growth]] | #ml ↔ #economics | 4 pairs |

## Tag Cluster Cohesion
### Most cohesive (well-linked)
- **#ml** — 12 pages, cohesion 0.41
### Most fragmented (cross-linker targets)
- **#systems** — 7 pages, cohesion 0.06 ⚠️ run cross-linker on this tag

## Surprising Connections (top 5)
- [[concepts/scaling-laws]] → [[entities/gordon-moore]] — score 5
  - Reason: cross-layer (concepts ↔ entities), marked ^[inferred]
- ...

## Orphan-Adjacent (dead-ends near hubs)
- [[concepts/foo]] — linked from 3 hubs, 0 outbound links

## Rough Clusters
- **#ml** — transformer-architecture, attention-mechanism, scaling-laws
- **#systems** — distributed-consensus, raft, paxos

## Graph Delta Since Last Run
- +3 new pages, +11 new wikilinks
- Newly connected: [[concepts/bar]], [[entities/baz]]
- Lost incoming links: [[references/old-paper]] (target may have been renamed)

## Tier Suggestions
↑ core    [[concepts/attention-mechanism]] — 14 incoming links, currently tier=supporting
↑ core    [[entities/andrej-karpathy]]     — top bridge (4 cluster pairs), currently unset
↓ peripheral [[concepts/old-concept]]       — 0 incoming, 132 days stale

## Questions Worth Asking
1. Resolve: What is the exact relationship between `scaling-laws` and `moore's-law`? (^[ambiguous] claim)
2. Explore: Why does `exponential-growth` bridge #ml and #economics?
3. Link: `references/foo.md` has no incoming links — what should reference it?
4. Audit: Should tag `#systems` be split? (cohesion 0.06, 7 pages)

<!-- GRAPH_SNAPSHOT: {"nodes":["concepts/foo","entities/bar"],"edges":[["concepts/foo","entities/bar"]]} -->
```

写入文件后，追加到`log.md`：
```
- [TIMESTAMP] STATUS_INSIGHTS anchors=10 bridges=N cohesion_checked=T surprising=5 questions=7 delta="+N pages +M links" tier_suggestions=N
```

### 何时跳过

- Vault 的页数少于 20 — 图表结构不够。告诉用户并跳过。
- 新鲜的 `wiki-rebuild` 后 — 等待至少发生一次摄取。

## 注释

- 如果清单不存在，请将所有内容报告为“新”并建议完整摄取
- 此技能仅读取和报告 - 它不会修改任何内容（除了在见解模式下写入 `_insights.md` 之外，该模式是可再生的）
- 实际摄取工作由摄取技能完成（`wiki-ingest`、`claude-history-ingest`、`codex-history-ingest`、`data-ingest`）
- 这些技能负责在完成后更新清单

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