---
name: wiki-stage-commit
description: >
  Review and promote staged wiki pages to their final locations. Use when WIKI_STAGED_WRITES=true
  and the user says "/wiki-stage-commit", "review staged pages", "commit staged writes",
  "promote staged pages", "approve staged changes", or "what's waiting in staging".
  Shows each staged file, lets the user accept or reject it, and moves accepted files to
  their final wiki locations. Rejected files are moved back to _raw/ for manual editing.
---

# Wiki Stage Commit — 分阶段写入推广

您正在查看由 LLM 编写的页面，这些页面在 `_staging/` 中等待人工批准，然后才能进入实时 wiki。此技能仅在vault配置中为 `WIKI_STAGED_WRITES=true` 时才有用。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议。这给出了 `OBSIDIAN_VAULT_PATH` 和 `WIKI_STAGED_WRITES`。
2. 如果 `WIKI_STAGED_WRITES` 未设置或为 `false`，请告诉用户：“未启用分段写入模式。在 `.env` 中设置 `WIKI_STAGED_WRITES=true` 以使用此功能。”然后停下来。
3.读取`_staging/`目录清单。

## 调用表格

```
/wiki-stage-commit               # interactive review: show each file and ask accept/reject
/wiki-stage-commit --all         # accept all staged files without per-file review
/wiki-stage-commit --reject-all  # reject all staged files (move to _raw/ for manual editing)
/wiki-stage-commit --list        # list staged files with summary, no changes
```

## 第 1 步：清点暂存文件

Glob `$OBSIDIAN_VAULT_PATH/_staging/**/*.md` — 这些是待处理的页面。

还有 glob `$OBSIDIAN_VAULT_PATH/_staging/**/*.patch.md` — 这些是对现有页面的待决“更新”（显示建议的添加和删除的 diff 样式文件）。

报告库存：

```
Staged files: 4 new pages, 2 updates

New pages:
  _staging/concepts/attention-mechanism.md        (ingested 2 days ago)
  _staging/entities/andrej-karpathy.md            (ingested 2 days ago)
  _staging/skills/fine-tuning-llms.md             (ingested yesterday)
  _staging/references/attention-is-all-you-need.md (ingested 3 hours ago)

Updates (patch files):
  _staging/concepts/transformer-architecture.patch.md  (target: concepts/transformer-architecture.md)
  _staging/skills/prompt-engineering.patch.md          (target: skills/prompt-engineering.md)
```

如果 `_staging/` 为空，则报告：“没有任何暂存。所有写入均已提交，或者尚未生成任何暂存写入。”

## 第 2 步：按文件审阅（交互模式）

对于每个暂存文件（首先是新页面，然后是更新）：

### 对于新页面：

显示摘要：

```
--- New page: concepts/attention-mechanism.md ---
Title:    Attention Mechanism
Tags:     #ml #architecture
Summary:  Core building block of transformers — computes weighted sum of values based on query-key similarity.
Tier:     supporting
Confidence: 0.72
Sources:  papers/attention.pdf

[Preview first 20 lines of body]
...

Accept [a], Reject [r], Skip [s], Preview full [p]?
```

### 对于补丁文件：

显示结构化差异：

```
--- Update: concepts/transformer-architecture.md ---
Source: _staging/concepts/transformer-architecture.patch.md

Proposed additions (+):
+ Transformers outperform RNNs on tasks requiring long-range dependencies. ^[inferred]
+ New source: papers/survey-2026.pdf

Proposed deletions (-):
- The attention mechanism was first described in [Bahdanau 2015].  (to be replaced by updated claim)

⚠️  Conflict check: target page was modified 3 days after staging. Review carefully.

Accept [a], Reject [r], Skip [s], Preview full diff [p]?
```

如果设置了 `--all` 标志，则跳过提示并接受每个文件。
如果设置了 `--reject-all` 标志，则跳过提示并拒绝每个文件。
如果设置了 `--list` 标志，则在打印库存后停止（步骤 1）。

## 步骤 3：应用决策

### 接受新页面

1、移动`_staging/<category>/page.md`→`<category>/page.md`（最终位置）
2. 使用新页面条目更新 `index.md`
3.删除暂存文件

### 接受补丁/更新

1.读取目标路径当前页面
2.应用建议的增删改查（合并，不要只是覆盖）
3.更新`updated` frontmatter时间戳
4.如果摘要发生变化，则更新`index.md`
5.删除暂存的补丁文件

### 拒绝文件

将其移至 `$OBSIDIAN_VAULT_PATH/_raw/` 进行手动编辑：
- `_staging/concepts/page.md` → `_raw/rejected-concepts-page.md`
- `_staging/concepts/page.patch.md` → `_raw/rejected-patch-concepts-page.md`
- 前缀为 `rejected-` 以便用户识别

### 补丁接受冲突检测

在应用补丁之前，请检查目标页面的 `updated` frontmatter 是否比补丁文件自己的 `updated` 字段新：
- 如果目标在补丁发布后被修改，则警告：`⚠️ Conflict: target was updated since this patch was staged. Applying may lose recent changes.`
- 给用户一个中止的机会：`Apply anyway [y], Skip [s], Reject [r]?`

## 步骤 4：更新跟踪文件

处理完所有暂存文件后：

1. **`hot.md`** — 更新“近期活动”部分：“已提交 N 个暂存页面；已拒绝 M。”
2. **`log.md`** — 附加：
   ```
   - [TIMESTAMP] STAGE_COMMIT accepted=N rejected=M skipped=K
   ```

## 步骤 5：报告

```
Stage commit complete.

✅  Accepted (N):
  concepts/attention-mechanism.md     → now live
  entities/andrej-karpathy.md         → now live
  concepts/transformer-architecture.md → updated (patch applied)

❌  Rejected (M):
  skills/fine-tuning-llms.md          → moved to _raw/rejected-skills-fine-tuning-llms.md

⏭️  Skipped (K):
  references/attention-is-all-you-need.md → still in _staging/

Staging queue: K files remaining
```

## 注释

- 暂存文件使用与实时页面相同的页面模板 - 它们已准备好登陆，只是等待批准
- 补丁文件使用人类可读的差异格式：以 `+` 开头的行是添加，以 `-` 开头的行是删除
- `index.md` 和 `log.md` 始终在摄取后立即更新（它们是低风险跟踪文件）——只有类别页面经过暂存
- Obsidian 的图形视图不跟踪 `_staging/` 目录 - 页面仅在升级后出现在 wiki 中
