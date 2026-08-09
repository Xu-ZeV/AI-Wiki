---
name: daily-update
description: >
  Run the daily wiki maintenance cycle: check all source freshness, update the index, and regenerate hot.md.
  Use this skill when the user says "/daily-update", "run the daily update", "update everything", "morning sync",
  "refresh the wiki index", or when triggered by the launchd cron at 9 AM. Also use to set up or verify the
  cron + terminal notification infrastructure for the first time ("set up the daily cron", "install the
  terminal notification", "how do I get the morning reminder?").
---

# 每日更新 — Wiki 维护周期

您在 wiki 上运行轻量级维护：检查源新鲜度、刷新索引、更新 hot.md 并写入终端通知读取的状态文件。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH` 和 `OBSIDIAN_WIKI_REPO`。
2. **派生vault范围内的状态目录** — 所有运行时状态的范围仅限于已解析的vault，而不是全局：
   ```bash
   VAULT_ID=$(echo "$OBSIDIAN_VAULT_PATH" | md5sum 2>/dev/null | cut -c1-8 || md5 -q - <<< "$OBSIDIAN_VAULT_PATH" | cut -c1-8)
   STATE_DIR="$HOME/.obsidian-wiki/state/$VAULT_ID"
   mkdir -p "$STATE_DIR"
   ```
3. 读取`$OBSIDIAN_VAULT_PATH/.manifest.json`。

## 模式

### 运行模式（默认 — 由 cron 或 `/daily-update` 触发）

执行维护周期：

**第 1 步：来源新鲜度检查**

将 `.manifest.json` 中的每个源与其文件的修改时间进行比较。分类为：
- **新鲜** — `mtime ≤ ingested_at`
- **陈旧** — `mtime > ingested_at`（新内容存在，尚未摄取）
- **丢失** — 源文件不再存在

**第2步：索引刷新**

读取 `$OBSIDIAN_VAULT_PATH/index.md`。如果索引中缺少vault中的任何页面（反之亦然），请更新索引。使用 `find $OBSIDIAN_VAULT_PATH -name "*.md" -not -path "*/_*"` 枚举vault页面，然后根据索引进行协调。

**第3步：hot.md更新**

读取 `hot.md`。如果基于其 `updated:` frontmatter，它的历史已超过 48 小时，请重新生成它：阅读最近修改的 10 个 wiki 页面，并编写 wiki 所涵盖内容的新的约 500 字语义快照。这可以使下一个会话的上下文保持温暖，而无需进行完整的vault爬行。

**第4步：写入状态**

写入“开始之前”中派生的vault范围的 `$STATE_DIR`：

```bash
date +%s > "$STATE_DIR/.last_update"
echo "<stale_count>" > "$STATE_DIR/.pending_delta"
echo "$OBSIDIAN_VAULT_PATH" > "$STATE_DIR/.vault_path"
```

**第 5 步：生成 impl-validator**

循环结束后，生成 `impl-validator` 作为子代理：

```
impl-validator check:
  goal: "Daily wiki maintenance — index reconciled, hot.md refreshed, state file written"
  artifacts:
    - $OBSIDIAN_VAULT_PATH/index.md
    - $OBSIDIAN_VAULT_PATH/hot.md
    - $STATE_DIR/.last_update
    - $STATE_DIR/.pending_delta
  checks:
    - Does .last_update contain a recent Unix timestamp (within the last 60 seconds)?
    - Does .pending_delta contain a non-negative integer?
    - Does hot.md have an updated: frontmatter field set to today?
    - Does index.md list at least as many pages as exist in the vault?
```

在记录之前应用任何失败。

**第 6 步：记录**

附加到`$OBSIDIAN_VAULT_PATH/log.md`：
```
- [TIMESTAMP] DAILY-UPDATE fresh=N stale=N missing=N index_added=N hot_refreshed=true|false
```

**第7步：向用户报告**

```
## Daily Wiki Update

- Sources: N fresh · N stale · N missing
- Index: N pages (N added, N removed)
- hot.md: refreshed / up to date

Stale sources (run to sync):
  /wiki-history-ingest claude   — N sessions since last ingest
  /wiki-history-ingest codex    — N sessions since last ingest
```

### 设置模式（由“设置每日 cron”或“安装终端通知”触发）

引导用户完成首次设置：

**第 1 步：验证脚本是否存在**

检查 `$OBSIDIAN_WIKI_REPO/scripts/daily-update.sh` 是否存在并且可执行。如果没有，请向用户指出它。

**步骤2：安装launchd plist**

```bash
# Replace placeholder in plist
sed "s|OBSIDIAN_WIKI_REPO|$OBSIDIAN_WIKI_REPO|g" \
  "$OBSIDIAN_WIKI_REPO/scripts/com.obsidian-wiki.daily-update.plist" \
  > "$HOME/Library/LaunchAgents/com.obsidian-wiki.daily-update.plist"

# Load it
launchctl load "$HOME/Library/LaunchAgents/com.obsidian-wiki.daily-update.plist"
```

**步骤3：安装终端通知（可选）**

询问用户：“当你的 wiki 过时时，你想要终端提醒吗？（y/n）”——如果他们说“不”，或者环境是无头/VPS，请跳过此步骤。

如果是，请检测用户的 shell 并定位正确的 rc 文件：

```bash
SHELL_NAME=$(basename "$SHELL")   # zsh, bash, fish, etc.
case "$SHELL_NAME" in
  zsh)  RC_FILE="$HOME/.zshrc" ;;
  bash) RC_FILE="$HOME/.bashrc" ;;
  *)    echo "Shell '$SHELL_NAME' not auto-detected. Add the source line manually to your shell rc file." ; return ;;
esac
```

检查 `wiki-notify.sh` 是否已在该 rc 文件中获取。如果没有，请附加：

```bash
echo "" >> "$RC_FILE"
echo "# obsidian-wiki terminal notification" >> "$RC_FILE"
echo "source $OBSIDIAN_WIKI_REPO/scripts/wiki-notify.sh" >> "$RC_FILE"
```

对于 Fish shell，源语法不同 - 提供手动说明：
```fish
# Add to ~/.config/fish/config.fish:
bass source $OBSIDIAN_WIKI_REPO/scripts/wiki-notify.sh
# (requires bass plugin, or copy the logic natively)
```

**第 4 步：运行脚本一次**

```bash
bash "$OBSIDIAN_WIKI_REPO/scripts/daily-update.sh"
```

这会初始化 `$STATE_DIR/.last_update`，以便终端通知立即生效。

**第五步：确认**

告诉用户：
- cron 每天上午 9 点运行（如果错过，则在下次登录时运行）
- 当 wiki 过时超过 20 小时时，会出现终端通知
- 状态存储在`~/.obsidian-wiki/state/<vault-id>/`中——独立支持多个Vault
- 他们可以随时运行 `/daily-update` 来强制同步
- 日志转到 `/tmp/obsidian-wiki-daily.log`

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