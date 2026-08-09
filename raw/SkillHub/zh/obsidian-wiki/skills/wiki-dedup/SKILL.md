---
name: wiki-dedup
description: >
  Scan the Obsidian wiki for page-level identity collisions — different pages covering the same
  concept under different names (e.g. "RSC" vs "React Server Components") — and merge them.
  Use this skill when the user says "dedup my wiki", "find duplicate pages", "merge duplicates",
  "identity resolution", "consolidate my wiki", "I have duplicate pages", or "my wiki has two pages
  for the same thing". Distinct from wiki-lint (which checks structure) and cross-linker (which adds
  links) — this skill makes destructive page-level merges and requires careful confirmation.
---

# Wiki Dedup — 身份解析和页面级重复数据删除

您正在查找并合并以不同名称涵盖相同概念的 wiki 页面。这是一种写入量大、具有潜在破坏性的技能——页面合并无法自动撤消。在合并模式下操作之前请仔细工作并确认。

**遵循 `llm-wiki/SKILL.md` 中的检索基元表。** 候选检测过程仅使用 frontmatter 和标题（便宜）。仅打开已确认的候选对的整页正文。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `OBSIDIAN_LINK_FORMAT`。
2. 阅读 `index.md` 以获得带有一行描述和标签的整页库存。
3. 简要阅读 `log.md` — 如果刚刚运行了重复数据删除，请记下已合并的内容。

## 模式

|模式|旗帜|行为 |
|---|---|---|
| **审计** | *（默认）* |仅报告候选人——无写入|
| **合并** | `--merge` |显示每个已确认的对，在合并之前要求确认 |
| **自动合并** | `--auto` |以非交互方式合并所有高置信度对 (`score ≥ 0.90`) |

如果用户未指定，则在 **审核** 模式下运行并在询问是否继续之前显示结果。

## 步骤 1：构建页面注册表

全局显示vault中的所有 `.md` 文件（不包括 `_archives/`、`_raw/`、`.obsidian/`、`index.md`、`log.md`、`hot.md`、 `_insights.md`，以及在其 frontmatter 中包含 `redirects_to:` 的任何文件 - 这些已经是合并的重定向存根）。

对于剩余的每个页面，从 frontmatter 中提取：
- `node_id` — 从库根开始的相对路径，没有 `.md`
- `title` — frontmatter `title` 字段
- `aliases` — frontmatter `aliases` 列表（可能不存在）
- `tags` — frontmatter `tags` 列表
- `category` — 目录前缀

建立一个查找表：`node_id → {title, aliases, tags, category, summary}`。

## 步骤 2：检测候选对

对于注册表中的每一对页面，使用以下信号计算**相似性分数**：

### 2a。标题相似度信号

|信号|如何评估|最大贡献 |
|---|---|---|
| **token重叠** |小写标题单词标记的 Jaccard 相似度（按空格、连字符、下划线、标点符号分割）| 0.65 | 0.65
| **编辑距离** |小写标题的标准化编辑距离：`1 - (edits / max(len_a, len_b))` | 0.40 | 0.40
| **子字符串包含** |一个标题是另一个标题的子字符串（例如“RSC”⊂“React Server Components”）| 0.50 | 0.50
| **别名交叉匹配** |页面A的标题出现在页面B的`aliases`中，反之亦然 | 0.65 | 0.65

综合标题分数 = `min(max(token_overlap, edit_distance, substring), 0.65) + alias_cross_bonus`。

您不需要精确的算术——对相似程度做出自信的判断。

**标题提取说明：** 某些页面使用 YAML 块标量（`title: >-` 或 `title: |`）。当 `title:` 值为 `>-`、`>`、`|` 或 `|-` 时，实际标题位于下一个缩进行 - 从那里读取。切勿将文字字符串 `>-` 与标题进行比较。

### 2b。语义信号（廉价通行证）

|信号|积分|
|---|---|
|相同的 `category` 目录 | +0.10 |
|标签重叠 ≥ 3 个共享标签 | +0.15 |
|标签重叠 ≥ 2 个共享标签 | +0.05 |
|相同的第一个标签（主导标签）| +0.05 |

### 2c。阈值

将综合得分 ≥ **0.75** 的对标记为 **候选**。得分 0.90 以上的配对是**高置信度**。

分数范围 → 置信度标签：

|分数 |标签|
|---|---|
| ≥ 0.90 |高——几乎可以肯定是同一个概念|
| 0.75–0.89 |中 — 可能相同，请验证 |
| 0.60–0.74 |低——可能的缩写或专业化；除非用户询问，否则跳过 |

仅将 HIGH 和 MEDIUM 候选者带入步骤 3。

### 2d。快速退出规则

如果vault的页数少于 10 页，请跳过配对循环并报告“vault太小，无法进行有意义的重复”。如果库有超过 500 页，则以 50 对为一组处理候选者 - 暂停并报告批次之间的进度。

## 步骤 3：语义判断

对于每个候选对（按分数降序排序）：

1. 完整阅读两页（整页阅读 - 合理，因为候选池很小）。
2. 问：这些页面涵盖**相同的概念**，还是不同的？

指定三个判决之一：

|判决 |意义|
|---|---|
| `merge` |相同的概念 - 不同的名称、缩写、别名或意外重复。可以安全合并。 |
| `keep-separate` |相关但又不同——例如“服务器操作”与“服务器组件”是相关的 React 功能，而不是重复的。 |
| `needs-review` |模棱两可——大量重叠，但也存在有意义的差异。标志由用户决定。 |

为每个判决附上简短的理由（一句话）。这会出现在报告和日志中。

## 步骤 4：审核报告

始终生成此报告，即使在合并/自动合并模式下也是如此（以便用户看到会发生什么）：

```markdown
## Wiki Dedup Report

### High-Confidence Candidates (score ≥ 0.90): N pairs

| Score | Page A | Page B | Verdict | Reason |
|---|---|---|---|---|
| 0.95 | `concepts/rsc.md` | `concepts/react-server-components.md` | merge | "RSC" is the abbreviation; both pages cover identical material |
| 0.91 | `entities/vaswani-2017.md` | `references/attention-is-all-you-need.md` | keep-separate | One is a person stub, one is a paper reference |

### Medium-Confidence Candidates (score 0.75–0.89): N pairs

| Score | Page A | Page B | Verdict | Reason |
|---|---|---|---|---|
| 0.82 | `concepts/fine-tuning.md` | `concepts/finetuning.md` | merge | Same concept, hyphenation variant |

### Needs Human Review: N pairs

| Score | Page A | Page B | Reason |
|---|---|---|---|
| 0.78 | `concepts/agents.md` | `concepts/autonomous-agents.md` | Substantial overlap but "agents" may intentionally be broader |

### Summary
- Pages scanned: N
- Candidate pairs found: M
- Recommended merges: X
- Keep separate: Y
- Needs review: Z
```

在 **审核模式** 下，停在这里并询问：“运行 `--merge` 以交互方式合并推荐对，或 `--auto` 自动合并所有高置信度对？”

## 步骤 5：合并

对于每个 `merge` 判决对（在合并或自动合并模式下）：

在**合并模式**：显示配对和判决，然后询问：“将 `[Page A]` 合并到 `[Page B]` 中？（是/跳过/审核）”。跳过“是”以外的任何内容。

在**自动合并模式**：仅处理高置信度（`score ≥ 0.90`）合并而不提示。

### 5a：选择规范页面

按顺序应用这些决胜局，直到获胜：

1. **更多传入的 wiki 链接** — grep 库中的 `[[node_id]]` 参考文献；计数越高获胜
2. **更丰富的内容** - 更长的页面主体（更多行）获胜
3. **更多来源** — 更大的 `sources:` 列表获胜
4. **标题长度** — 更长、更具描述性的标题获胜（例如“React Server Components”击败“RSC”）
5. **按字母顺序** — 较早的冠军获胜

规范页面是**幸存者**。另一个页面成为**辅助**（将被合并，然后用重定向存根替换）。

### 5b：将内容合并到规范页面中

阅读两页。更新规范页面：

- **`aliases:`** — 添加辅助页面的标题及其所有别名（无重复）
- **`tags:`** — 合并两个标签列表（重复数据删除，上限为 5 个域标签 + 系统标签）
- **`sources:`** — 合并两个源列表（重复数据删除）
- **`relationships:`** — 合并两个关系列表（按目标删除重复项，优先使用类型化条目而不是非类型化条目）
- **`base_confidence`** — 使用源和 `llm-wiki/SKILL.md` 中的公式的并集重新计算
- **`updated`** — 设置为现在
- **`summary:`** — 如果辅助页面添加了新的内容，则重写以覆盖合并范围
- **正文内容** — 合并辅助页面中的独特部分和项目符号。不要盲目追加——整合内容。避免重复规范页面中已有的声明。在需要合成的地方使用 `^[inferred]` 标记。
- **`provenance:`** — 合并后重新计算

### 5c：在辅助页面路径写入重定向存根

```markdown
---
title: <secondary page title>
redirects_to: "[[<canonical node_id>]]"
aliases: [<secondary aliases>]
category: <secondary category>
tags: []
created: <secondary original created>
updated: <ISO timestamp now>
---

This page has been merged into [[<canonical page title>]].
```

`redirects_to:` 字段告诉任何阅读此页面的技能遵循重定向，而不是将其视为内容。

### 5d：重写整个vault的维基链接

Grep 整个库以查找指向辅助 slug 的任何链接：

- `[[secondary-slug]]` → `[[canonical-slug]]`
- `[[secondary-slug|display text]]` → `[[canonical-slug|display text]]`
- 如果 `OBSIDIAN_LINK_FORMAT=markdown`: `[text](../path/to/secondary.md)` → `[text](../path/to/canonical.md)`

**安全规则：**
- 切勿重写内部代码块（``` fences or `inline code`）
- 切勿在重定向存根本身内部进行重写（这是旧的 slug 应该保持清晰的地方）
- 切勿使用 `rm` 或破坏性的 shell 操作 - 仅使用编辑/写入工具
- 一次重写一个文件，在继续之前验证每个文件
- 如果文件出现零次，则跳过它

### 5e：更新跟踪文件

**`index.md`** — 删除辅助页面的条目。使用合并的摘要更新规范页面的条目。

**`.manifest.json`** — 对于辅助页面的源条目：将 `"merged_into": "<canonical node_id>"` 添加到每个条目。对于规范页面：合并到辅助页面的 `pages_created` 和 `pages_updated` 列表中。

**`hot.md`** — 更新最近的活动：“合并 N 个重复对；更新规范页面。”

### 5f：最终检查

完成所有合并后，在vault中 grep 查找任何剩余的 `[[secondary-slug]]` 引用（在非存根文件中）。如果有任何幸存下来，请报告它们 - 重写步骤可能错过了非标准链接格式。

## 第 6 步：记录

附加到`log.md`：
```
- [TIMESTAMP] DEDUP mode=audit|merge|auto-merge pages_scanned=N pairs_found=M merged=X kept_separate=Y needs_review=Z wikilinks_rewritten=W
```

## 重定向存根处理

其他技能应按如下方式处理重定向存根：

- **`wiki-export`** — 跳过 frontmatter 中带有 `redirects_to:` 的页面；它们不是内容节点
- **`wiki-query`** — 如果搜索命中重定向存根，请按照 `redirects_to:` 并阅读规范页面
- **`wiki-lint`** — 验证每个 `redirects_to:` wiki 链接是否解析为现有的非存根页面（重定向链 — 存根指向存根 — 是一个错误）
- **`cross-linker`** — 将重定向存根视为非目标；切勿添加指向存根页面的新 `[[wikilink]]`

## 提示

- **始终先审核。** 即使在自动合并模式下，也会显示审核报告。在相信结果之前先阅读它。
- **最后检查 `needs-review`。** 这些是困难的情况 - 不要用明显的合并来批处理它们。
- **缩写是最常见的情况。** “GPT”/“GPT-4”/“GPT4”、“RSC”/“React Server Components”、“LLM”/“Large Language Models”——这些在子字符串包含方面得分很高，并且几乎总是可以安全地合并。
- **不同版本不重复。** “GPT-3”和“GPT-4”相关但不同。 “微调”和“微调-LLMS”可能是不同的（技术与特定应用）。
- **重复数据删除后运行 `cross-linker`。** 重定向存根使图表处于稍微不一致的状态。交联剂会将其收紧。

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