---
name: memory-bridge
description: >
  Browse and compare wiki knowledge by which AI tool originally produced it. Use this skill when the user
  says "/memory-bridge", "browse codex memory", "what did codex know about X", "show me claude knowledge",
  "cross-tool memory", "what does hermes know that claude doesn't", "show me knowledge from <tool>",
  "compare my AI tool memories", or wants to explore knowledge gaps between tools. Works from any project.
  Diff mode ("what's different", "unique to codex", "gaps between tools") is the killer feature — it surfaces
  blind spots between tools that the user may not know exist.
---

# Memory Bridge — 跨工具知识浏览器

您正在帮助用户浏览和比较他们的Obsidian Wiki知识，这些知识是通过最初生成它的 AI 工具过滤的。 wiki 跟踪 `.manifest.json` 和页面 `sources:` frontmatter 中的源出处 - 此技能将元数据显示为可导航视图。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`。
2. 阅读 `$OBSIDIAN_VAULT_PATH/.manifest.json` — 这是什么工具生成什么的真实来源。
3. 阅读 `$OBSIDIAN_VAULT_PATH/index.md` 了解页面标题和一行描述。

## 命令

解析用户的调用以确定模式：

|调用|模式|
|---|---|
| `/memory-bridge <tool>` | **浏览** — 列出源自 `<tool>` 的所有 wiki 页面 |
| `/memory-bridge <tool> "<topic>"` | **搜索** — 来自 `<tool>` 的提及 `<topic>` 的页面 |
| `/memory-bridge diff` | **差异** — 每个工具独有的页面；重叠;盲点|
| `/memory-bridge diff <tool-a> <tool-b>` | **差异** — 比较两个特定工具 |
| `/memory-bridge map` | **地图** — 完整的起源矩阵：每一页 × 接触过它的每个工具 |

识别的工具名称：`claude`、`codex`、`hermes`、`openclaw`、`copilot`、`pi`、`manual`（手写）、 `ingest`（wiki 摄取文档）。

## 第 1 步：构建源映射

读取 `.manifest.json`。对于每个源条目，提取：
- `source_type` — 映射到工具名称：
  - `claude_conversation`, `claude_memory`, `claude_audit_log`, `claude_desktop_session` → `claude`
  - `codex_rollout`, `codex_index`, `codex_history` → `codex`
  - `hermes_memory`, `hermes_session` → `hermes`
  - `openclaw_memory`, `openclaw_daily_note`, `openclaw_session`, `openclaw_dreams` → `openclaw`
  - `copilot_session`, `copilot_checkpoint`, `copilot_transcript`, `copilot_memory_artifact` → `copilot`
  - `pi_session` → `pi`
  - `document` → `ingest`
  - 其他任何东西 → `manual`
- `pages_created` 和 `pages_updated` — 来自此源的 wiki 页面

构建地图：

```
tool_pages = {
  "claude": set(pages created/updated by claude sources),
  "codex":  set(pages created/updated by codex sources),
  ...
}
```

如果有多个工具参与某个页面，则该页面可以出现在多个工具集中。

## 步骤2：执行模式

### 浏览模式

过滤 `tool_pages[<tool>]` 并显示为分组列表：

```
## Knowledge from <tool> (<N> pages)

### By category
- concepts/ — N pages
- entities/ — N pages
- skills/   — N pages
...

### Pages
| Page | Category | Tags | Last updated |
|------|----------|------|--------------|
| [[page-name]] | concept | tag1, tag2 | 2026-04-10 |
...
```

阅读所列页面的 frontmatter（grep for `^(title|category|tags|updated):`）——除非用户要求，否则不要阅读整页正文。

### 搜索模式

在过滤后的页面集中，运行：
```
grep -l "<topic>" <pages in tool set>
```
然后 grep 匹配项周围的节标题 (`^##`) 以提供上下文而无需完整读取。将结果显示为带有匹配摘录的排名列表。

### 差异模式

计算：
- `only_in_a` = `tool_pages[a]` − `tool_pages[b]`
- `only_in_b` = `tool_pages[b]` − `tool_pages[a]`
- `shared` = `tool_pages[a]` ∩ `tool_pages[b]`

如果没有给出特定工具，请逐对比较所有工具（仅限于重叠 >0 或唯一页面的对，以保持输出简洁）。

目前：

```
## Memory Bridge Diff — <tool-a> vs <tool-b>

### Only in <tool-a> (<N> pages)
These concepts exist in your wiki from <tool-a> sessions but <tool-b> has never touched them.
<list with one-line descriptions from index.md>

### Only in <tool-b> (<N> pages)
<list>

### Shared (<N> pages)
Both tools have contributed to these pages.
<list — only show if ≤15; otherwise just the count>

### Notable gaps
<highlight the most interesting asymmetries — e.g. "codex has 12 pages on build tooling that claude has never seen">
```

### 地图模式

建立一个矩阵，显示每个页面以及哪些工具接触过它。上限为 50 行；按贡献工具的数量降序排序（首先是大多数跨工具页面 - 这些是最丰富的节点）。

```
| Page | claude | codex | hermes | copilot | pi |
|------|--------|-------|--------|---------|----|
| [[react-patterns]] | ✓ | ✓ | — | ✓ | — |
| [[rust-ownership]] | — | ✓ | — | — | ✓ |
```

## 步骤 3：生成 impl-validator（如果可用）

生成输出后，如果 `impl-validator` 技能在当前环境中可用，则将其生成为子代理：

```
impl-validator check:
  goal: "Browse/diff wiki knowledge by source tool and surface cross-tool blind spots"
  artifacts: [the output you just generated]
  checks:
    - Did you correctly parse source_type from .manifest.json?
    - Are page counts plausible (not 0 unless vault is empty)?
    - Is the diff symmetric (a−b and b−a are disjoint)?
    - Did you avoid reading full page bodies when not needed?
```

在向用户呈现输出之前应用它出现的任何问题。

## 步骤 4：记录

附加到`$OBSIDIAN_VAULT_PATH/log.md`：
```
- [TIMESTAMP] MEMORY-BRIDGE mode=<browse|search|diff|map> tool=<tool> pages_shown=N
```

## 输出约定

- 始终显示页数，以便用户可以校准每个工具筒仓中的知识量。
- 使用 `[[wikilinks]]` 进行页面引用（如果设置了 `OBSIDIAN_LINK_FORMAT=markdown`，则使用标准 Markdown 链接）。
- 在差异模式下，明确指出最“令人惊讶”的不对称性——这就是用户想要的洞察力。
- 如果 `.manifest.json` 为空或缺失，请明确说明并建议先运行 `/wiki-history-ingest`。
