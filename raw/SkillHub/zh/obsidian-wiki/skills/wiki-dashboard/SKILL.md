---
name: wiki-dashboard
description: >
  Create dynamic, queryable dashboard views of the Obsidian vault using Obsidian Bases or Dataview.
  Use this skill when the user says "create a dashboard", "vault dashboard", "show all X as a table",
  "dynamic view", "query my vault", "build a content index", "show me all concepts/entities/projects",
  or wants a structured, auto-updating view of their wiki content.
  Bases is native to Obsidian 1.8+ (no plugin needed). Dataview requires the community plugin.
---

# Wiki 仪表板 — 动态 Vault 视图

提供两种工具：**Obsidian Bases**（本机，GUI 驱动，无插件）和 **Dataview**（社区插件，类似 SQL，更强大）。检查用户拥有并喜欢哪些基数，除非他们要求使用 Dataview 或需要 GROUP BY / 计算列。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`。
2.阅读`$OBSIDIAN_VAULT_PATH/index.md`以了解存在哪些类别和页面。
3. 询问用户如果没有指定他们想要查看什么——文件夹、标签、类别、日期范围？
4. 如果您不确定要使用哪个工具，请询问他们是否安装了 Dataview。

---

## 选项 A — ObsidianBases（`.base` 文件）

基础是定义库注释实时视图的 YAML 文件。原生于 Obsidian 1.8+，无需插件。

### 官方规范模式

顶级键：

```yaml
filters:      # Global filter applied to all views (expression strings under and/or/not)
formulas:     # Named computed properties — referenced as formula.<name>
properties:   # Display config per property — sets displayName for column headers
summaries:    # Aggregation formulas (e.g. mean, sum)
views:        # Array of view definitions (required)
```

`views:`中的每一项：

```yaml
views:
  - type: table          # table | list | cards | map
    name: "View Name"    # display label
    limit: 50            # optional max rows
    order:               # column display order (list of property/formula names)
      - file.name
      - note.updated
    groupBy:             # grouping — goes INSIDE the view, NOT at top level
      property: note.tags
      direction: ASC     # ASC | DESC
    filters:             # view-specific filter (merges with global filters)
      and:
        - 'note.status != "done"'
    summaries:
      formula.myFormula: Average
```

### 过滤器语法 — 关键

**过滤器使用表达式字符串，而不是类型化对象。** 始终包装在 `and:`、`or:` 或 `not:` 中 - 裸列表会导致“可能只有一个和/或/没有键”解析错误。

```yaml
# CORRECT
filters:
  and:
    - file.inFolder("concepts")

# WRONG — typed objects (parse error)
filters:
  - type: folder
    folder: concepts
```

过滤器支持嵌套：
```yaml
filters:
  or:
    - file.hasTag("book")
    - and:
        - file.inFolder("concepts")
        - file.hasTag("research")
    - not:
        - file.hasTag("archived")
```

### 属性名称约定

不同的上下文使用不同的命名——从 Obsidian 的自动重新格式化行为得到证实：

|背景 | Frontmatter 领域 `tags` |文件名 |公式|
|---|---|---|---|
| `properties:` 按键 | `note.tags` | `file.name` | `formula.<name>` |
| `order:` 值 | `tags`（裸）| `file.name` | `formula.<name>` |
| `groupBy.property:` | `tags`（裸）| `file.name` | — |
| `filters:` 表达式 | `file.hasTag(...)` / `note.tags` | `file.name` | `formula.<name>` |
| `formulas:` 表达式 | `note.tags`、`note.updated` | `file.name` | — |

### 基本表——文件夹过滤器

```yaml
filters:
  and:
    - file.inFolder("concepts")
properties:
  file.name:
    displayName: Page
  note.tags:
    displayName: Tags
  note.summary:
    displayName: Summary
  note.updated:
    displayName: Updated
views:
  - type: table
    name: Table
    order:
      - file.name
      - tags
      - summary
      - updated
```

### 卡片视图 — 文件夹过滤器

```yaml
filters:
  and:
    - file.inFolder("entities")
properties:
  file.name:
    displayName: Entity
  note.title:
    displayName: Full Name
  note.tags:
    displayName: Tags
  note.summary:
    displayName: Summary
views:
  - type: cards
    name: Cards
    order:
      - file.name
      - title
      - tags
      - summary
```

### 按属性分组 — groupBy 进入视图内部

设置 `groupBy` 时，**从 `order:` 中省略该属性** — 它成为组标题行并将其添加为列也会导致重复。

```yaml
filters:
  and:
    - file.inFolder("concepts")
properties:
  file.name:
    displayName: Concept
  note.summary:
    displayName: Summary
  note.updated:
    displayName: Updated
views:
  - type: table
    name: By Domain
    groupBy:
      property: tags        # bare property name, no note. prefix
      direction: ASC
    order:
      - file.name           # do NOT include tags here — already the group header
      - summary
      - updated
```

### 标签过滤器

```yaml
filters:
  and:
    - file.hasTag("machine-learning")
properties:
  file.name:
    displayName: Page
  note.category:
    displayName: Category
  note.summary:
    displayName: Summary
views:
  - type: table
    name: Table
    order:
      - file.name
      - category
      - summary
```

### 多重过滤器（文件夹和标签）

```yaml
filters:
  and:
    - file.inFolder("projects")
    - file.hasTag("active")
properties:
  file.name:
    displayName: Project
  note.summary:
    displayName: Summary
  note.updated:
    displayName: Last Updated
views:
  - type: cards
    name: Cards
    order:
      - file.name
      - summary
      - updated
```

### OR 过滤器（两个文件夹）

```yaml
filters:
  or:
    - file.inFolder("concepts")
    - file.inFolder("entities")
properties:
  file.name:
    displayName: Page
  note.category:
    displayName: Category
  note.updated:
    displayName: Updated
views:
  - type: table
    name: Table
    order:
      - file.name
      - category
      - updated
```

### 通过公式计算列

```yaml
filters:
  and:
    - file.inFolder("concepts")
formulas:
  days_stale: "floor((now() - note.updated) / 86400000)"
properties:
  file.name:
    displayName: Page
  note.updated:
    displayName: Updated
  formula.days_stale:
    displayName: Days Stale
views:
  - type: table
    name: Stale
    order:
      - file.name
      - updated
      - formula.days_stale
```

### 过滤表达式参考

|表达|它有什么作用 |
|---|---|
| `file.inFolder("path")` |该文件夹中的页面 |
| `file.hasTag("tag")` |带有该标签的页面（无 `#` 前缀）|
| `file.hasLink("Note Name")` |链接到注释的页面|
| `file.name == "note-name"` |精确的文件名匹配 |
| `file.ext == "md"` |按扩展名过滤 |
| `note.propertyName` |任何 frontmatter 属性 |
| `formula.formulaName` |命名公式结果 |
| `now()` |当前时间戳（以毫秒为单位）|

> **在 Obsidian UI 生成的格式上：** 当 Obsidian 的 GUI 写入或重新格式化 `.base` 文件时，它可能会输出带有顶级 `columns:`、`sort:` 和 `view:` 键的简化简写，而不是规范模式。这种格式也有效——Obsidian 接受这两种格式。手动编写的文件应使用上面的规范架构。

---

## 选项 B — Dataview（社区插件）

Dataview 在任何注释中的 ` ```dataview ``` ` 代码块内使用类似 SQL 的查询语言。比用于计算列、GROUP BY 和跨文件夹查询的 Bases 更强大。

### 基本表——文件夹

````markdown
```dataview
TABLE
  tags AS "Tags",
  summary AS "Summary",
  file.mtime AS "Last Modified"
FROM "concepts"
SORT file.mtime DESC
```
````

### 带有可点击链接的表格（没有 ID 的表格）

````markdown
```dataview
TABLE WITHOUT ID
  file.link AS "Entity",
  tags AS "Tags",
  summary AS "Summary"
FROM "entities"
SORT file.name ASC
```
````

### GROUP BY — 分组后使用 `rows.` 前缀

在 `GROUP BY` 之后，各个文件属性必须以 `rows.` 为前缀 - 否则该列为空或出现错误。

````markdown
```dataview
TABLE WITHOUT ID
  rows.file.link AS "Concept",
  rows.summary AS "Summary"
FROM "concepts"
GROUP BY tags[0] AS "Domain"
```
````

### 过时页面 — 使用 `file.mtime` 进行日期数学

避免 `choice(updated, date(updated), file.mtime)` — `updated` frontmatter 中的混合日期格式会导致算术错误。 `file.mtime` 始终是有效的日期时间。

````markdown
```dataview
TABLE WITHOUT ID
  file.link AS "Page",
  category AS "Type",
  file.mtime AS "Last Modified",
  (date(today) - file.mtime).days + " days" AS "Age"
FROM "concepts" OR "entities" OR "projects"
WHERE file.name != file.folder
WHERE (date(today) - file.mtime).days > 30
SORT (date(today) - file.mtime).days DESC
```
````

### 多文件夹查询

````markdown
```dataview
TABLE
  summary AS "Summary",
  file.mtime AS "Last Modified"
FROM "projects"
WHERE file.name != file.folder
SORT file.mtime DESC
```
````

### 数据视图参考

|条款|用途 |
|---|---|
| `FROM "folder"` |文件夹中的所有笔记 |
| `FROM #tag` |所有带有标签 | 的笔记
| `FROM "a" OR "b"` |两个文件夹的并集 |
| `WHERE file.name != file.folder` |排除文件夹索引页 |
| `GROUP BY field AS "Label"` |对行进行分组 — 使用 `rows.` 作为此后的属性 |
| `SORT field DESC` |排序方向 |
| `file.link` |可点击的维基链接 |
| `file.mtime` |上次修改时间（始终有效的日期时间）|
| `(date(today) - file.mtime).days` |自上次修改以来的天数 |

---

## 第三步：写入文件

**基地：** 目标路径 `$OBSIDIAN_VAULT_PATH/_meta/<dashboard-name>.base`

**Dataview：** 将查询直接写入任何 `.md` 注释中。 `$OBSIDIAN_VAULT_PATH/_meta/dashboard.md` 上的专用仪表板注释非常适合多部分视图。

蛞蝓的例子：
-“所有概念”→ `_meta/concepts-index.base`
- “最近摄取”→ `_meta/recent-ingests.base`
- “项目概述”→ `_meta/projects-overview.base`
- “陈旧页面”→ `_meta/stale-pages.base`
- “完整仪表板”→ `_meta/dashboard.md`

如果 `_meta/` 尚不存在，则创建它。

## 步骤 4：嵌入碱基（可选）

要将 `.base` 嵌入注释中：

```markdown
## Entities
![[_meta/entities-tracker.base]]
```

在修改现有注释之前先询问。

## 步骤 5：更新跟踪

附加到`$OBSIDIAN_VAULT_PATH/log.md`：
```
- [TIMESTAMP] WIKI_DASHBOARD name="<slug>" tool=bases|dataview view=<type> filter="<description>"
```

不需要清单或索引更新 - 仪表板是实时查询，而不是静态页面。

## 常用仪表板配方

|仪表板 |最佳工具|它显示了什么 |
|---|---|---|
| **内容索引** |基础或数据视图 |所有页面按类别分组，按更新 | 排序
| **实体追踪器** |基地（卡）|实体页面作为视觉卡片库|
| **按领域划分的概念** |数据视图 |使用 GROUP BY | 按第一个标签分组的概念
| **摄取日志** |要么 |页面按 `created` 日期排序 |
| **过时的内容** |数据视图 |按天数计算，页面在 30 多天内没有被触及 |
| **项目概览** |要么 |带有上次同步日期的项目页面 |
| **研究跟踪器** |数据视图 |合成页面标记为 `research` |

## 质量检查表

- [ ] 基础：过滤器使用 `and:`/`or:`/`not:` 下的表达式字符串，从不键入对象
- [ ] 基础：`groupBy` 进入视图定义内部 - 不作为顶级键
- [ ] 基础：通过 `properties: <name>: displayName: "..."` 设置的列标题，而不是 `columns: [{title}]`
- [ ] 基数：`formulas:` 用于计算列，在顺序/属性中引用为 `formula.<name>`
- [ ] Dataview：GROUP BY 查询使用 `rows.property`，而不是裸露的 `property`
- [ ] Dataview：日期算术使用 `file.mtime`，而不是 `choice(updated, ...)`
- [ ] 文件写入 `_meta/` 并带有描述性段
- [ ] `log.md` 更新
- [ ] 用户告知如何嵌入 Bases (`![[_meta/<name>.base]]`) 或打开仪表板注释

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