---
name: wiki-capture
description: >
  Save the current conversation as a permanent, structured wiki note. Use this skill when the user
  says "save this", "/wiki-capture", "capture this", "file this conversation", "preserve this",
  "add this to my wiki", or wants to turn what was just discussed into lasting knowledge. The skill
  classifies the content, rewrites it as declarative knowledge (not a chat transcript), and places
  it in the correct vault category.
---

# Wiki Capture — 与 Wiki Note 的对话

您将当前对话中的知识保存为永久的维基注释。目标是提取“实质内容”——知识本身——而不是对所说内容的总结。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `OBSIDIAN_LINK_FORMAT`（默认值：`wikilink`）。
2.阅读`$OBSIDIAN_VAULT_PATH/index.md`以了解现有的wiki内容（避免重复）
3. 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果存在）——它提供了最近活动的背景信息

在步骤 5 中写入内部链接时，使用 `OBSIDIAN_LINK_FORMAT` 值应用 `llm-wiki/SKILL.md`（链接格式部分）中的链接格式。

## 步骤 1：确定哪些内容值得保留

扫描对话。问：这里出现的哪些知识在 3 个月内没有记忆这次聊天的情况下是有价值的？

值得保存：
- 做出的决定以及“为什么”做出这些决定
- 开发分析、框架、心智模型
- 技术发现、模式或程序
- 对某个主题的综合理解
- 对一个需要努力才能达到的概念的清晰解释
- 对话中讨论的来自外部来源的关键事实

跳过：
- 后勤、日程安排、寒暄
- 反复探讨但未得出结论
- wiki中已有的内容

如果没有出现任何材料，请告诉用户并停止。

## 步骤 2：对内容类型进行分类

分配五种类型之一 - 这决定了目标文件夹和音调：

|类型 |描述 |目标文件夹|
|---|---|---|
| `synthesis` |多步骤分析或需要推理的特定问题的答案 | `synthesis/` |
| `concept` |定义、框架或心智模型（事物*是什么*）| `concepts/` |
| `source` |所讨论的外部文档、文章或资源的摘要 | `references/` |
| `decision` |战略、架构或设计选择及其基本原理 | `synthesis/` |
| `session` |对话跨越多个主题时的完整讨论摘要 | `journal/` |

如果内容明显属于特定项目（从上下文或用户提及中检测到），请将其放在 `projects/<project-name>/<category>/` 下。

## 步骤 3：重写为陈述性知识

**不要**写对话摘要。用陈述性现在时写出知识本身：

- 不是：“用户询问 X，克劳德解释说……”
- 是的：“X 的工作原理是……”
- 不是：“我们决定使用 Y 因为......”
- 是：“Y 优于 Z，因为[原因]。[^[推断]如果隐含理由，未明确说明]”

根据 `llm-wiki` 应用来源标记：
- *摘录* — 在对话中明确说明（无标记）
- *推断* — 从对话中概括或综合 → `^[inferred]`
- *不明确* — 有争议、不确定或矛盾 → `^[ambiguous]`

## 步骤 4：生成 Slug 和标题

从内容中得出一个清晰的、描述性的标题。粘住它：
- 小写，单词之间用连字符分隔
- 最多 50 个字符
- 避免在 slug 中添加日期（frontmatter 有 `created`）

## 步骤 5：编写 Wiki 注释

在目标路径中创建包含所需 frontmatter 的文件：

```yaml
---
title: >-
  <Title>
category: <synthesis|concepts|references|journal|skills>
tags: [<2-5 domain tags from taxonomy>]
sources:
  - conversation:<ISO-date>
created: <ISO-8601 timestamp>
updated: <ISO-8601 timestamp>
summary: >-
  <1-2 sentences, ≤200 chars, answering "what knowledge does this page hold?">
provenance:
  extracted: 0.X
  inferred: 0.X
  ambiguous: 0.X
base_confidence: 0.42
lifecycle: draft
lifecycle_changed: <ISO date today>
---
```

车身结构按类型分类：

**综合/决定：**
```markdown
# Title

## Context
<What prompted this — the problem or question being addressed>

## Finding / Decision
<The core knowledge or conclusion>

## Reasoning
<Why this is the case or why this choice was made>

## Implications
<What follows from this — what to watch for, next steps, trade-offs>

## Related
<[[wikilinks]] to connected pages>
```

**概念：**
```markdown
# Title

<Definition in one clear sentence.>

## What It Is
<Explanation of the concept>

## How It Works
<Mechanism or structure>

## When to Use
<Applicability, conditions, trade-offs>

## Related
<[[wikilinks]]>
```

**来源：**
```markdown
# Title

> Source: <title or URL>

## What It Covers
<What the source is about>

## Key Points
<Bulleted claims with provenance markers>

## Open Questions
<What it raises but doesn't answer — omit if none>

## Related
<[[wikilinks]]>
```

**会议：**
```markdown
# Title

*Session captured: <date>*

## Topics Covered
<Brief list>

## Key Takeaways
<The 3-5 most important things that emerged>

## Decisions Made
<Any explicit decisions, with rationale>

## Open Questions
<What remains unresolved>

## Related
<[[wikilinks]]>
```

每个注释必须链接到至少 2 个现有 wiki 页面。写入前搜索`index.md`。如果存在的相关页面少于 2 个，请为引用的最重要概念创建最少的存根。

## 步骤 6：更新跟踪文件

**`index.md`** — 在其类别部分下添加新页面。

**`log.md`** — 附加：
```
- [TIMESTAMP] CAPTURE type=<type> page="<path>" title="<title>"
```

**`hot.md`** — 使用刚刚捕获的内容更新**近期活动**。如果注释引入了值得标记的内容，请更新**关键要点**。更新 `updated` 时间戳。

## 步骤7：向用户确认

报告保存的路径和标题：
```
Saved to: projects/<name>/synthesis/<slug>.md
Title: <Title>
Type: synthesis
```

## 质量检查表

- [ ] 内容重写为陈述性知识（不是聊天记录）
- [ ] 类型分类正确；目标路径位于正确的文件夹中
- [ ] Frontmatter 包含标题、类别、标签、来源、摘要、出处
- [ ] 至少有 2 个指向现有页面的 wiki 链接
- [ ] `index.md`、`log.md` 和 `hot.md` 更新
- [ ] 确认用户的保存路径

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