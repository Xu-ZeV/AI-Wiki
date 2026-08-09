---
name: graph-colorize
description: >
  Color-code the Obsidian graph view by rewriting `.obsidian/graph.json` colorGroups.
  Use this skill when the user says "color my graph", "color code obsidian", "colorize
  the graph", "color the graph by tag", "color by category", "highlight visibility
  in graph", "make the graph colorful", "distinguish tags in graph", or wants nodes
  in Obsidian's graph view tinted by tag, folder, or visibility. Generates a
  `colorGroups` array from the vault's actual tags/categories and merges it into the
  existing graph.json without clobbering other graph settings. Always backs up first.
---

# Graph Colorize — 对Obsidian图形视图进行颜色编码

您正在重写 `$OBSIDIAN_VAULT_PATH/.obsidian/graph.json`，以便 Obsidian 的图形视图按标签、文件夹或可见性对节点进行着色。

Obsidian 将图形设置存储在 `<vault>/.obsidian/graph.json` 中。 `colorGroups` 数组是 `{query, color}` 对的列表；每个节点第一个匹配的查询获胜。查询使用 Obsidian 的搜索语法：`tag:#foo`、`path:"concepts"`、`file:foo` 等。颜色为 `{"a": 1, "rgb": <packed-int>}`，其中 int 为 `(R << 16) | (G << 8) | B`。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`。
2.确认`$OBSIDIAN_VAULT_PATH/.obsidian/`存在。如果没有，则表明vault从未在Obsidian中打开过 - 告诉用户在Obsidian中打开vault一次，然后重新运行。
3. **如果 Obsidian 可能打开，则警告用户**：Obsidian 在关闭时覆盖 `graph.json`。告诉他们首先关闭vault，或者准备重新加载 (Cmd/Ctrl+R)，并且在重新加载之前不要触摸图形设置。

## 第 1 步：选择模式

从用户的措辞推断模式。如果不明确，默认为**按标签**。

|用户意图 |模式|
|---|---|
| “按标签着色”、“为我的图表着色”、“使其变得丰富多彩”（默认）| `by-tag` |
| “按文件夹颜色”、“按类别颜色”、“按目录颜色”| `by-category` |
| “突出显示可见性”、“在图表中显示内部/pii”、“可见性颜色”| `by-visibility` |
|用户提供显式映射（`tag:#foo = red` 或 JSON blob）| `custom` |
| “结合标签和可见性”/“两者”| `combined`（首先是可见性，然后是标签）|

## 步骤 2：构建 `colorGroups` 数组

### 调色板（10 种不同的、色盲友好的颜色）

按顺序使用。如果组数多于颜色，则循环并通过第二遍将亮度划分为约 20% 来添加亮度偏移，或者仅将上限设置为 10，并告诉用户其余标签共享“其他”颜色。

| ＃|十六进制 | RGB（封装整数）|角色 |
|---|---|---|---|
| 0 | `#4E79A7` | `5142951` |蓝色|
| 1 | `#F28E2B` | `15896107` |橙色|
| 2 | `#E15759` | `14767961` |红色|
| 3 | `#76B7B2` | `7780786` |青色 |
| 4 | `#59A14F` | `5873999` |绿色|
| 5 | `#EDC948` | `15583048` |黄色|
| 6 | `#B07AA1` | `11565217` |紫色|
| 7 | `#FF9DA7` | `16751527` |粉红色|
| 8 | `#9C755F` | `10253663` |棕色|
| 9 | `#BAB0AC` | `12234924` |灰色 |

每种颜色都包装为 `{"a": 1, "rgb": <int>}`。

### 模式：`by-tag`

1. 全局 `$VAULT_PATH/**/*.md` 不包括 `_archives/`、`_raw/`、`.obsidian/`、`node_modules/`、`index.md`、`log.md`、 `_insights.md`。
2. 解析每个页面的 frontmatter `tags`。计算每个标签的使用情况。
3. **从频率列表中删除 `visibility/*` 标签** - 它们是保留的系统标签，仅在 `by-visibility` 或 `combined` 模式下处理。
4. 按使用情况获取前 10 个标签。如果唯一标签少于 10 个，请使用全部。
5. 对于索引 `i` 处的每个标签 `T`：发出 `{"query": "tag:#T", "color": palette[i]}`。
6. 或者，在末尾附加未标记页面的最终包罗万象的条目：`{"query": "-[\"tag\":]", "color": palette[9]}` — 如果颜色槽 9 已被真实标记占用，则**跳过**。

### 模式：`by-category`

按此固定顺序使用七个 Vault 顶级文件夹，以便颜色在运行中保持稳定：

|文件夹|色彩指数|
|---|---|
| `concepts` | 0（蓝色）|
| `entities` | 1（橙色）|
| `skills` | 2（红色）|
| `references` | 3（青色）|
| `synthesis` | 4（绿色）|
| `projects` | 5（黄色）|
| `journal` | 6（紫色）|

每个存在且至少包含一个 `.md` 文件的文件夹发出一个条目。每个条目是：

```json
{"query": "path:\"<folder>\"", "color": {"a": 1, "rgb": <int>}}
```

### 模式：`by-visibility`

按此顺序发出正好三个条目（第一场比赛获胜，因此最严格的首先出现）：

1. `visibility/pii` → `#E15759`（红色，rgb 14767961）
2. `visibility/internal` → `#F28E2B`（橙色，rgb 15896107）
3. `visibility/public` → `#59A14F`（绿色，rgb 5873999）

```json
{"query": "tag:#visibility/pii", "color": {"a": 1, "rgb": 14767961}}
```

没有 `visibility/` 标签的页面保留Obsidian的默认颜色 - 不要添加包罗万象的颜色。

### 模式：`combined`

首先发出 `by-visibility` 条目，然后发出 `by-tag` 条目。可见性在冲突中获胜，因为它出现在列表中的第一位。

### 模式：`custom`

如果用户给出了明确的映射，请按字面意思尊重它们。使用 `int(hex_without_hash, 16)` 将它们给出的任何十六进制（例如 `#FF00FF`）转换为压缩整数。将每个包装为 `{"a": 1, "rgb": <int>}`。

## 步骤 3：合并到 graph.json （不要破坏）

1.读取现有的`$VAULT_PATH/.obsidian/graph.json`。如果它不存在，请从此最小默认值开始：

   ```json
   {
     "collapse-filter": true,
     "search": "",
     "showTags": false,
     "showAttachments": false,
     "hideUnresolved": false,
     "showOrphans": true,
     "collapse-color-groups": false,
     "colorGroups": [],
     "collapse-display": true,
     "showArrow": false,
     "textFadeMultiplier": 0,
     "nodeSizeMultiplier": 1,
     "lineSizeMultiplier": 1,
     "collapse-forces": true,
     "centerStrength": 0.518713248970312,
     "repelStrength": 10,
     "linkStrength": 1,
     "linkDistance": 250,
     "scale": 1,
     "close": true
   }
   ```

2. **先备份**：写入前将现有文件复制到`.obsidian/graph.json.backup-<YYYYMMDD-HHMM>`。如果存在同一分钟的备份，请重复使用它 - 不要堆积重复项。

3. **仅** `colorGroups` 字段替换为新阵列。保持其他所有字段不变。这保留了用户的缩放、物理、过滤、搜索和显示首选项。

4. 使用与原始文件相同的 JSON 样式写回文件（通常是紧凑的单行或 2 个空格缩进 — 保留其中的内容）。

## 步骤 4：报告和日志

打印如下摘要：

```
Graph colorized → .obsidian/graph.json
  Mode:    by-tag
  Groups:  7 color assignments
  Palette: blue, orange, red, teal, green, yellow, purple
  Backup:  .obsidian/graph.json.backup-20260424-1432

Reload Obsidian (Cmd/Ctrl+R) to see the new colors.
If Obsidian is currently open, close it first OR reload immediately — Obsidian
overwrites graph.json on close and can erase these changes.
```

附加到`$VAULT_PATH/log.md`：

```
- [TIMESTAMP] GRAPH_COLORIZE mode=<mode> groups=<N> backup=graph.json.backup-<stamp>
```

## 边缘情况

- `by-tag` 模式下 **vault中没有标签** → 回退到 `by-category` 并告诉用户。
- **用户想要撤消** → 从最新的 `graph.json.backup-*` 恢复并注意 `log.md` 中的内容。
- **用户想要清除所有颜色组** → 设置 `colorGroups: []`，备份，记录为 `GRAPH_COLORIZE mode=clear`。
- **`.obsidian/` 缺失** → Obsidian vault尚未打开。告诉用户打开它一次，然后重新运行。不要自己创建 `.obsidian/` — Obsidian 会在首次打开时填充许多文件。
- **查询语法陷阱**：带有空格的文件夹路径需要引用（`path:"my folder"`）；带有嵌套斜杠的标签按字面意思工作（`tag:#visibility/internal`）；不要进行 URL 编码。
- **Obsidian 在编辑期间打开**：暴露风险 - Obsidian 在启动时读取 graph.json 并 **在关闭时重写它**。如果用户正在实时编辑，请告诉他们首先关闭 Obsidian 或立即运行重新加载 (Cmd/Ctrl+R)，并避免在此之前打开图形设置。

## 注释

- 这是纯粹的配置编辑 - 没有页面内容更改，没有 frontmatter 写入。
- 重新运行是安全的：每次运行都会创建一个新的备份，仅重写 `colorGroups`。
- 如果用户想要保留手动策划的颜色组，请提供 `combined` 模式或在覆盖之前询问。
- 这里的调色板与 `wiki-export` 的 `graph.html` 社区颜色相匹配，因此Obsidian图和导出的可视化效果看起来一致。
