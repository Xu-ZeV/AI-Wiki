---
name: wiki-rebuild
description: >
  Archive existing wiki knowledge and rebuild from scratch, or restore from a previous archive.
  Use this skill when the user wants to start fresh, rebuild the wiki from all sources, archive current
  knowledge before a major change, or restore an older version. Triggers on "rebuild the wiki",
  "start over", "archive and rebuild", "restore from archive", "nuke and repave", "clean rebuild".
  Also use when the wiki has drifted too far from sources and incremental fixes won't cut it.
---

# Wiki 重建 — 存档、重建、恢复

您正在维基上执行破坏性操作。始终先存档，并在继续之前始终与用户确认。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这提供了 `OBSIDIAN_VAULT_PATH` 和可选的 QMD 设置，例如 `QMD_WIKI_COLLECTION`
2.读取`.manifest.json`了解当前状态
3. **确认用户意图。** 该技能支持三种模式：
   - **仅存档** — 快照当前 wiki，无需重建
   - **存档 + 重建** — 快照，然后从头开始重新处理所有源
   - **恢复** — 恢复以前的存档

## 档案系统

档案直播地址：`$OBSIDIAN_VAULT_PATH/_archives/`。每个存档都是一个带时间戳的目录，其中包含当时 wiki 状态的完整副本。

```
$OBSIDIAN_VAULT_PATH/
├── _archives/
│   ├── 2026-04-01T10-30-00Z/
│   │   ├── archive-meta.json
│   │   ├── concepts/
│   │   ├── entities/
│   │   ├── skills/
│   │   ├── references/
│   │   ├── synthesis/
│   │   ├── journal/
│   │   ├── projects/
│   │   ├── index.md
│   │   ├── log.md
│   │   └── .manifest.json
│   └── 2026-03-15T08-00-00Z/
│       └── ...
├── concepts/          ← live wiki
├── entities/
└── ...
```

### 存档-meta.json

```json
{
  "archived_at": "2026-04-06T10:30:00Z",
  "reason": "rebuild",
  "total_pages": 87,
  "total_sources": 42,
  "total_projects": 6,
  "vault_path": "/Users/name/Knowledge",
  "manifest_snapshot": ".manifest.json"
}
```

## 模式 1：仅存档

当用户想要快照当前状态而不重建时。

### 步骤：

1.创建存档目录：`_archives/YYYY-MM-DDTHH-MM-SSZ/`
2. 将所有类别目录 `index.md`、`log.md`、`.manifest.json` 和 `projects/` 复制到存档中
3.写入`archive-meta.json`，原因为`"snapshot"`
4. 追加到`log.md`：
   ```
   - [TIMESTAMP] ARCHIVE reason="snapshot" pages=87 destination="_archives/2026-04-06T10-30-00Z"
   ```
5. 如果对 `log.md` 进行了索引并且配置了 `QMD_WIKI_COLLECTION`，则可以选择刷新 QMD（请参阅“实时 Wiki 更改后刷新 QMD”）。
6. 报告：“已存档 87 页。当前 wiki 未受影响。”

## 模式 2：存档 + 重建

当用户想要重新开始时。这是完整的序列：

### 第 1 步：存档当前状态

与上面的模式 1 相同，但原因为 `"rebuild"`。

### 第 2 步：清除实时 wiki

删除类别目录（`concepts/`、`entities/`、`skills/` 等）和 `projects/` 目录中的所有内容。保留：
- `_archives/`（显然）
- `.obsidian/`（Obsidian配置）
- `.env`（如果存在于vault中）

将 `index.md` 重置为空模板。仅使用重建条目重置 `log.md`。删除 `.manifest.json`（它将在摄取过程中重新创建）。

### 第 3 步：重建

告诉用户vault已清除并准备好完全重新摄取。他们现在可以运行：

1. `wiki-status` — 将所有来源视为“新”
2. `claude-history-ingest` — 重新处理 Claude 历史记录
3. `codex-history-ingest` — 重新处理 Codex 会话历史记录
4. `wiki-ingest` — 重新处理文档
5. `data-ingest` — 重新处理任何其他数据

其中每一个都会在运行时重建清单。

**重要提示：** 不要自己自动运行摄取。用户应该选择重新摄取什么以及以什么顺序。有些来源可能不再相关。

### 步骤 4：记录重建

附加到`log.md`：
```
- [TIMESTAMP] REBUILD archived_to="_archives/2026-04-06T10-30-00Z" previous_pages=87
```

清除并记录实时 wiki 后刷新 QMD（请参阅“实时 Wiki 更改后的 QMD 刷新”），然后报告vault已准备好用于选定的重新摄取技能。

## 模式 3：从存档恢复

当用户想要返回到之前的状态时。

### 第 1 步：列出可用档案

读取`_archives/`目录。对于每个存档，请阅读 `archive-meta.json` 并呈现：

```markdown
## Available Archives

| Date | Reason | Pages | Sources |
|---|---|---|---|
| 2026-04-06 10:30 | rebuild | 87 | 42 |
| 2026-03-15 08:00 | snapshot | 65 | 31 |
```

### 步骤 2：确认要恢复的存档

询问用户他们想要哪个存档。警告他们恢复将覆盖当前的实时 wiki。

### 步骤 3：首先存档当前状态

在恢复之前，请存档当前状态（原因：`"pre-restore"`），这样就不会丢失任何内容。

### 第 4 步：恢复

1. 清除实时wiki（同模式2，步骤2）
2. 将所选存档中的所有内容复制回实时 wiki 目录中
3. 从存档中恢复 `index.md`、`log.md` 和 `.manifest.json`
4. 追加到`log.md`：
   ```
   - [TIMESTAMP] RESTORE from="_archives/2026-03-15T08-00-00Z" pages_restored=65
   ```

### 第 5 步：报告

恢复后刷新 QMD（请参阅“Live Wiki 更改后的 QMD 刷新”），然后告诉用户恢复了什么，并建议运行 `wiki-lint` 以检查恢复状态是否存在任何问题。

## Live Wiki 更改后 QMD 刷新

QMD 是一个搜索索引，而不是事实来源。如果 QMD 刷新失败，请勿回滚存档、重建或恢复工作；报告失败并保持Markdown库完好无损。

**GUARD：如果 `$QMD_WIKI_COLLECTION` 为空或未设置，则跳过此步骤。**

何时运行：

|模式|刷新 QMD？ |原因 |
|---|---|---|
|仅存档 |可选|除 `log.md` 外，实时 wiki 内容保持不变；如果 `log.md` 已建立索引且 QMD 已配置，则刷新。 |
|存档+重建|清除实时维基后需要 | QMD 必须忘记已删除的页面，否则将返回过时的搜索结果。稍后，随着源的重新处理，摄取技能将再次刷新。 |
|恢复 |恢复后需要 |实时 wiki 已替换为存档内容，因此 QMD 必须与恢复的状态匹配。 |

此刷新当前需要本地 QMD CLI。如果设置，则使用 `$QMD_CLI`；否则使用 `qmd`。如果 CLI 不可用，请报告 `QMD skipped: qmd CLI unavailable`。

对于 CLI 刷新：

```bash
${QMD_CLI:-qmd} update
```

如果输出显示新哈希需要向量，或者如果恢复替换的实时页面和嵌入可能已过时，请运行：

```bash
${QMD_CLI:-qmd} embed
```

验证 wiki 集合反映了该操作：

```bash
${QMD_CLI:-qmd} ls "$QMD_WIKI_COLLECTION"
```

对于恢复，如果存档具有已知的页面路径，则还要验证一个恢复的页面：

```bash
${QMD_CLI:-qmd} get "qmd://$QMD_WIKI_COLLECTION/<restored-page>.md" -l 5
```

在最终报告中将 QMD 刷新记录为以下之一：
- `QMD refreshed: update + embed + verified`
- `QMD refreshed: update only + verified`
- `QMD skipped: QMD_WIKI_COLLECTION unset`
- `QMD skipped: archive-only live content unchanged`
- `QMD skipped: qmd CLI unavailable`
- `QMD failed: <short error summary>`

## 安全规则

1. **始终在破坏性操作之前进行存档。** 无一例外。
2. **在清除实时维基之前，请务必与用户确认**。
3. **永远不要删除档案**，除非用户明确要求。档案是廉价的保险。
4. **`.obsidian/` 目录是神圣的。** 在存档/重建/恢复期间切勿触摸它 - 它包含用户的 Obsidian 设置、插件和主题。
5. 如果重建过程中出现问题，存档就在那里。告诉用户他们可以恢复。
