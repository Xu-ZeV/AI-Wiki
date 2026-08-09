---
name: wiki-digest
description: >
  Generate a periodic knowledge digest — a human-readable newsletter-style summary of what was
  learned, updated, and connected in your wiki over a specified period (day/week/month). Use when
  the user says "what did I learn this week", "give me a digest", "weekly summary", "knowledge
  report", "what's new in my wiki", "/wiki-digest [period]", "summarize my recent learning", or
  wants a readable overview of recent wiki activity. Distinct from wiki-status (which reports
  ingestion delta of sources) — wiki-digest summarizes *knowledge*, not sources.
---

# Wiki Digest — 知识通讯生成器

您正在生成最近 wiki 活动的人类可读摘要：学到了什么、更新了什么、正在出现什么主题以及值得回顾的内容。这项技能总结了“知识”，而不是来源——将其视为每周回顾会议，而不是摄取状态报告。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `OBSIDIAN_LINK_FORMAT`。
2. **从用户请求中解析句点**：
   - “每日”/“今天”/“昨天”→ 过去 24 小时
   - “每周”/“本周”/无参数（默认）→ 过去 7 天
   - “每月”/“本月”→ 过去 30 天
   - ISO 日期，如“自 2026-05-01”→ 自该日期以来更新的页面
   - 明确的数字，如“过去 14 天”→ 那么多天
3. 读取 `$OBSIDIAN_VAULT_PATH/log.md` — 最后 200 行 — 以查找该时间段内的条目（时间戳是 ISO-8601 前缀行）。
4. 读取 `$OBSIDIAN_VAULT_PATH/hot.md` 以了解当前会话上下文。
5. 如果 `$OBSIDIAN_VAULT_PATH/_insights.md` 存在，请阅读其 **锚页面** 表 - 稍后您将使用它来识别哪些新页面成为中心。

## 步骤1：收集该时段内的活跃页面

全局查找 `$OBSIDIAN_VAULT_PATH` 下的所有 `.md` 文件。跳过特殊/系统文件：
- `index.md`, `log.md`, `hot.md`, `AGENTS.md`, `_insights.md`
- `_meta/`、`_archives/`、`_raw/` 下的任何内容
- 期刊摘要页面本身（`journal/digest-*.md`）

对于剩余的每一页，阅读其前言：
- `created` — 首次写入页面时
- `updated` — 上次修改时间

分类：
- **新页面**：`created`在期限内
- **更新页面**：`updated` 在该期间内，但 `created` 在其之前
- **不变**：两个日期都不在期间内 → 跳过

如果活跃页面少于 5 个，请记下并提供扩大范围：*“过去 7 天内只有 3 个页面活跃 - 想要每月摘要吗？”* 在此停止，除非用户说继续。

对于每个活动页面，收集：`title`、`category`、`tags`、`summary`（frontmatter 字段）、`lifecycle`、正文中的任何 `^[ambiguous]` 或 `^[inferred]` 标记。

## 第 2 步：确定主题

从所有活动页面的标签中，统计主题频率：

```
For each tag across new + updated pages:
  count how many active pages carry it
Sort descending, take top 5
```

另请阅读 `$OBSIDIAN_VAULT_PATH/_meta/taxonomy.md`（如果存在）。标记步骤 1 中**未出现**在分类中的任何标签 - 这些是这一时期出现的新词汇。

注意哪些类别增长最多（概念/、实体/、技能/、综合/、参考/等）。

## 步骤 3：寻找值得注意的新联系

扫描新页面和更新页面以获取跨类别维基链接 - 连接不同知识层的链接。这些是这一时期最具智力意义的成果。

对于每个活动页面，提取所有 `[[wikilink]]` 目标。按目标的类别前缀对每个链接进行分类。标记跨类别的链接（例如，链接到 `entities/` 页面的 `concepts/` 页面，或桥接两个主题的 `synthesis/` 页面）。

按兴趣程度对候选人进行排名：
- **+3** 如果链接跨越两个很少连接的类别（如果可用，请使用 `_insights.md` 桥接数据）
- **+2** 如果目标页面是前 10 名中心（根据 `_insights.md` 锚点）
- **+2** 如果链接出现在 `synthesis/` 页面中（故意交叉）
- **+1** 如果源页面标记为 `^[inferred]` （合成连接，未直接说明）

选取前 3-5 个连接。将每个句子写成简单的英语句子：不仅仅是“A → B”，而是*为什么*这种联系很有趣。

## 步骤 4：表面开放线程

扫描活动页面和 `_raw/` 来查找未解决的工作：

- **草稿**：带有 `lifecycle: draft` 或 `lifecycle: stub` 的页面
- **不明确的声明**：计算所有活动页面中的 `^[ambiguous]` 标记（不要列出每个标记 - 仅列出计数以及哪些页面最多）
- **未暂存的笔记**：计算 `$OBSIDIAN_VAULT_PATH/_raw/` 中的文件数量（此处的任何内容均未升级）
- **分类差距**：步骤 2 中不在 `_meta/taxonomy.md` 中的标签

## 步骤 5：选择推荐的重读内容

鉴于本周的新背景，从*现有*（前期）页面中确定 2-3 个值得重新访问的页面。

启发式：查找与步骤 1 中的活动页面共享最多标签的前期页面。这些是基础页面，其主题在此期间得到扩展 - 新页面建立在它们的基础上，但用户可能没有重新访问基础页面。

还包括现在有 2 个以上来自活动页面的新传入链接的任何前期页面（它只是变得更加连接 - 这表明它具有承重能力）。

写下每条建议的具体原因：*“[[concepts/attention-mechanism]] - 您的基础页面；本周摄取的三篇新论文都扩展了它”*，而不仅仅是页面标题。

## 步骤 6：生成摘要

生成结构化、可扫描的 Markdown 报告。头条新闻部分是最重要的——它应该感觉像是一篇好的时事通讯的开头，综合了实际的见解，而不是列出页面名称。

使用 `OBSIDIAN_LINK_FORMAT` 应用 `llm-wiki/SKILL.md`（链接格式部分）中的链接格式。默认值为 `[[wikilink]]`。

```markdown
# Wiki Digest — [Period Label]
> [N new pages · M updated pages · period: YYYY-MM-DD to YYYY-MM-DD]

## Headlines

- [Concrete insight #1 — synthesize the actual knowledge, not just "learned about X"]
- [Concrete insight #2]
- [Concrete insight #3]

## New Knowledge

### New pages ([count])
| Page | Category | Summary |
|---|---|---|
| [[concepts/foo]] | concept | One-sentence summary from frontmatter |
| [[entities/bar]] | entity | One-sentence summary |

### Notable updates ([count])
| Page | What changed |
|---|---|
| [[skills/react-hooks]] | Added patterns for useCallback with async effects |

*(If no updates, omit this subsection.)*

## Emerging Themes

- **#[tag]** ([N pages]) — [One sentence on why this topic was active]
- **#[tag]** ([N pages]) — [...]
- **#[NEW TAG]** ([N pages]) ⭐ *New vocabulary — not yet in taxonomy*

Most active category: **[category/]** ([N pages added or updated])

## Key Connections Made

- [[concepts/A]] → [[entities/B]] — [Plain-English reason this connection is interesting]
- [[synthesis/X]] created — bridges [[concepts/Y]] and [[concepts/Z]] for the first time
- *(up to 5 connections)*

## Open Threads

- **Drafts to compile** ([count]): [[concepts/foo]], [[concepts/bar]] — still in draft lifecycle
- **Ambiguous claims**: [N] `^[ambiguous]` markers across [M] pages — run `/wiki-synthesize` to resolve
- **Unstaged notes**: [N] files in `_raw/` — run `/wiki-ingest _raw/` to promote them
- **Taxonomy gaps**: Tags `#newtag1`, `#newtag2` used but not in taxonomy — run `/tag-taxonomy`

*(Omit any subsection where count is 0.)*

## Recommended Re-reads

- [[concepts/X]] — [Specific reason: "3 new papers this week all extend this concept"]
- [[synthesis/Y]] — [Specific reason: "2 new pages created this week reference it"]
- [[skills/Z]] — [Specific reason: "now has 4 new incoming links — it's become a hub"]

---
*Generated by wiki-digest · [TIMESTAMP] · [N pages scanned in [VAULT_PATH]]*
```

**可见性**：如果页面标记为 `visibility/pii`，则将其从所有表和连接列表中排除（但将其计入总数，记为“+ N private”）。如果用户明确表示“包含私人页面”或“完整摘要”，请正常包含它们。

## 步骤 7：输出并可选择保存

**默认（聊天输出）：** 直接打印摘要。最后问：
*“要我将其另存为 `journal/digest-YYYY-MM-DD.md` 吗？”*

**如果用户以“保存”或“写入”为前缀**（例如，`/wiki-digest save` 或“生成并保存我的每周摘要”）：
- 写信至 `$OBSIDIAN_VAULT_PATH/journal/digest-YYYY-MM-DD.md`（每周/每月）或 `journal/digest-YYYY-MM-DD-daily.md`（每日）
- 添加前言：
  ```yaml
  ---
  title: "Wiki Digest — [Period Label]"
  category: journal
  tags: [digest, meta/review]
  sources: []
  created: TIMESTAMP
  updated: TIMESTAMP
  summary: "Weekly knowledge digest: [N new, M updated pages]. Top themes: [tag1], [tag2]."
  ---
  ```
- 使用日志下的新条目更新 `index.md`
- 不要**添加到 `.manifest.json`（摘要不是源摄取）

无论哪种方式，请附加到 `log.md`：
```
- [TIMESTAMP] DIGEST period="7d" new_pages=N updated_pages=M themes=T connections=C saved=false
```

## 边缘情况

|情况|处理|
|---|---|
|少于 5 个活动页面 |提议延长期限；仅当用户确认时才继续 |
|空库（根本没有页面）|告诉用户首先运行摄取；停止|
|没有 `_meta/taxonomy.md` |跳过分类差距检查；省略 Open Threads | 中的该行
|没有 `_insights.md` |跳过步骤 3 中基于中心的评分；仍然产生连接部分|
|所有页面均为 `visibility/pii` |报告“此期间有 N 个活跃的私人页面”，但不提供任何详细信息；提供完整模式|
|维基重建时期 |请注意摘要中的内容：“Wiki 在此期间重建 - 页面日期反映了重建后的状态”|

## 注释

- **标题就是回报。** 不要列出页面标题 - 综合实际的学习内容。如果有人本周了解了注意力机制，标题应该抓住洞察力，而不仅仅是说“添加了 3 个变压器页面”。
- **具体重读。**“此页面相关”是没有用的。 “本周的 3 篇论文都在本页引用了相同的主张”是可行的。
- **此技能只能读取。** 唯一的写入是可选的日记页和 `log.md` 附加。它不会修改现有的 wiki 页面。
- **不要重复维基状态。** 如果用户询问“需要摄取什么”或“增量是什么”，请路由至 `wiki-status`。该技能回答“我学到了什么”，而不是“待解决的问题”。

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