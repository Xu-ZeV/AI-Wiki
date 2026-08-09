---
name: wiki-context-pack
description: >
  Produce a token-bounded context pack from the Obsidian wiki — a compact, structured slice of the most
  relevant pages for a topic or recent activity, designed for downstream consumption by another agent or skill.
  Use when the user says "/wiki-context-pack", "make a context pack", "give me a context slice for X",
  "pack the wiki for my agent", or "bounded context for Y". Different from wiki-query (which answers a
  question) — this produces reusable input material for a downstream task.
---

# Wiki 上下文包 — 有界token检索

您正在从 wiki 生成一个集中的、受token限制的上下文包。与 `wiki-query`（回答问题）不同，此技能将最相关的 wiki 知识打包到下游代理、技能或用户可以直接使用的单个 Markdown 块中。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和任何 QMD 变量。
2. 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果存在）— 提供有关最近活动的即时上下文。
3. 读取 `$OBSIDIAN_VAULT_PATH/index.md` — 整页库存。

## 调用表格

```
/wiki-context-pack "transformer attention mechanism" --budget 16000
/wiki-context-pack "my-project architecture decisions" --budget 8000
/wiki-context-pack --recent --budget 4000   # recent activity pack from hot.md
/wiki-context-pack "authentication patterns"          # default budget: 8000 tokens
```

解析用户的调用来提取：
- **topic** — 查询字符串（必需，除非 `--recent`）
- **`--budget N`** — token预算（默认值：`8000`；最大值：`100000`）
- **`--recent`** — 打包最近更新/摄取的页面而不是主题查询

## 算法

### 第 1 步：相关性通行证（便宜）

不打开页面主体：

1. 扫描 `index.md` 和 frontmatter 进行主题匹配。每页评分：
   - **+5** 标题或别名完全匹配
   - **+3** 标签匹配
   - **+2** `summary:` 字段包含查询词
   - **+1** `index.md` 条目描述包含查询词

2. 对于 `--recent` 模式：按 `updated:` frontmatter 降序排列页面。选取前20名作为候选人。

3.主题模式：按分数收集前20名候选者。如果配置了 QMD（设置了 `QMD_WIKI_COLLECTION`），则运行语义传递并与 frontmatter 分数合并（QMD 排名将 **+4** 添加到页面的分数）。

### 第 2 步：分层选择

在候选集中，按相关性分数排序，然后在每个分数桶内应用分层排序（请参阅 `llm-wiki/SKILL.md`，重要性分层部分）：

1. 所有 `core` 级别的比赛优先
2.然后`supporting`
3.然后`peripheral`（仅在预算允许的情况下）

在步骤 3 中填写预算时保持此顺序。

### 步骤 3：压缩

对于每个选定的页面（按层/相关性顺序），计算其**压缩表示** - 不是完整读取，而是结构化蒸馏：

1. **必填**：标题，`tier:`，`tags:`，`summary:`（来自frontmatter - 便宜，无需阅读正文）
2. **如果预算允许**：添加页面主体，但删除：
   - Frontmatter 块（上面已捕获）
   - `## Sources` 部分（将源名称保留在一行中）
   - 包含页面中已提及的重复维基链接
   - 样板标题后面没有内容
3. **重复删除重叠内容** — 如果两个选定的页面共享一个段落（或几乎相同的声明），则仅将其保留在更相关的页面中。标记删除：`_(content also in [[other-page]])_`。

将每个页面表示的标记估计为 `len(text_chars) / 4`。

### 步骤 4：预算执行

按层级/相关性顺序贪婪地填充包，直到预算用完：

1. 始终包含每个选定页面的前言摘要块，即使正文不合适。
2. 如果页面正文不完整，请包含压缩摘录：第一个非标题段落加上“关键想法”部分（如果有）。
3. 修剪时先删除`peripheral` 层页面。
4. 保持持续的token计数。当下一页超出预算时，停止添加页面。
5. 跟踪丢失的页面数量并在页眉中注明。

### 步骤 5：渲染输出

发出单个 Markdown 块：

```markdown
# Context Pack: <topic>
# Generated: <ISO timestamp>
# Budget: <budget> tokens | Actual: <actual> tokens | Pages: <N included> / <M candidates>
# Methodology: 4 chars/token estimate

---

## [[<category/page-name>]] (<tier>, ~<tokens> tokens)
tags: #tag1 #tag2
summary: <summary field text>

<compressed body or excerpt>

---

## [[<next-page>]] (<tier>, ~<tokens> tokens)
...
```

如果是 `--recent` 模式，则标头为：
```
# Context Pack: Recent Activity (last N pages)
```

**空结果：** 如果没有页面得分高于 0 并且 `--recent` 没有产生结果，则输出：
```
# Context Pack: <topic>
No relevant pages found. Consider running /wiki-ingest to add sources about this topic.
```

### 第 6 步：记录

附加到`$OBSIDIAN_VAULT_PATH/log.md`：
```
- [TIMESTAMP] CONTEXT_PACK topic="<topic>" budget=<N> actual_tokens=<M> pages_included=<K> pages_dropped=<D>
```

## 用例

- **输入 `/wiki-research`** — 将包作为上下文传递，以避免重新发现已知事实
- **传递到 `/wiki-synthesize`** — 特定综合任务的范围输入
- **通过 MCP 或剪贴板向外部代理提供** — 有界、结构化、可引用
- **在长时间的多步骤任务之前检查点上下文** - 在开始之前了解 wiki 已经知道的内容

## 注释

- `4 chars/token` 启发式匹配 `wiki-status` 的token足迹估计 — 跨技能一致
- 该包是一个快照；它不会写入vault。重新运行刷新。
- 对于非常大的预算（> 50K token），警告用户：“这个包很大。考虑缩小您的主题或使用 wiki 查询来获得有针对性的答案。”
