---
name: wiki-setup
description: >
  Initialize a new Obsidian wiki vault with the correct structure, special files, and configuration.
  Use this skill when the user wants to set up a new wiki from scratch, initialize the vault structure,
  create the .env file, or says things like "set up my wiki", "initialize obsidian", "create a new vault",
  "get started with the wiki". Also use when the user needs to reconfigure their existing vault or
  fix a broken setup.
---

# Obsidian 设置 — Vault 初始化

您正在设置一个新的Obsidian Wikivault（或修复现有的vault）。

## 步骤 1：创建 .env

如果 `.env` 不存在，则从 `.env.example` 创建它。询问用户：

1. **vault应该住在哪里？** → `OBSIDIAN_VAULT_PATH`
   - 默认：`~/Documents/obsidian-wiki-vault`
   - 必须是绝对路径（扩展后）

2. **你的源文件在哪里？** → `OBSIDIAN_SOURCES_DIR`
   - 可以是多个路径，以逗号分隔
   - 默认：`~/Documents`

3. **想要导入克劳德历史记录吗？** → `CLAUDE_HISTORY_PATH`
   - 默认：从 `~/.claude` 自动发现
   - 如果克劳德数据在其他地方，则明确设置

4. **是否安装了QMD？** → `QMD_WIKI_COLLECTION` / `QMD_PAPERS_COLLECTION` / `QMD_TRANSPORT`
   - 可选。在 `wiki-query` 中启用语义搜索，并在 `wiki-ingest` 中启用源发现。
   - 默认为 `QMD_TRANSPORT=mcp` 除非用户希望代理直接调用本地 `qmd` CLI。
   - 如果使用CLI模式，默认设置`QMD_CLI_SEARCH_MODE=quality`；如果重新排名太慢，建议使用 `balanced`。
   - 如果不确定，请暂时跳过 - 两项技能都会自动回落到 `Grep`。
   - 安装说明：参见 `.env.example`（QMD 部分）。

5. **token预算警告阈值？** → `WIKI_TOKEN_WARN_THRESHOLD`
   - 默认值：`100000`（当完整维基阅读花费> 100Ktoken时发出警告）
   - 设置为 `0` 以完全禁用警告
   - `wiki-status` 显示token足迹表并自动发出此警告

6. **启用分阶段写入？** → `WIKI_STAGED_WRITES`
   - 默认值：未设置/`false`（页面直接写入其最终位置）
   - 设置为 `true` 用于团队 wiki、高风险域或任何人类希望对每个 LLM 编写的页面有最终决定权的库
   - 启用后：所有新/更新的页面首先登陆 `_staging/`；运行`/wiki-stage-commit`来审查和推广它们
   - 当文件正在等待时，`wiki-status` 显示“暂存写入挂起”计数

## 步骤 2：创建 Vault 目录结构

```bash
mkdir -p "$OBSIDIAN_VAULT_PATH"/{concepts,entities,skills,references,synthesis,journal,projects,_archives,_raw,_staging,.obsidian}
```

- `.obsidian/` — Obsidian 自己的配置。创建vault识别。
- `projects/` — 每个项目的知识（在摄取期间填充）。
- `_archives/` — 存储用于重建/恢复操作的 wiki 快照。
- `_raw/` — 未处理草稿的暂存区。在这里留下粗略的笔记； `wiki-ingest` 将把它们提升到正确的 wiki 页面并删除原件。
- `_staging/` — `WIKI_STAGED_WRITES=true` 时查看 LLM 写入页面的队列。此处的页面在通过 `/wiki-stage-commit` 提升之前在 Obsidian 图表中不可见。

## 步骤 3：创建特殊文件

### 索引.md

```markdown
---
title: Wiki Index
---

# Wiki Index

*This index is automatically maintained. Last updated: TIMESTAMP*

## Concepts

*No pages yet. Use `wiki-ingest` to add your first source.*

## Entities

## Skills

## References

## Synthesis

## Journal
```

### 日志.md

```markdown
---
title: Wiki Log
---

# Wiki Log

- [TIMESTAMP] INIT vault_path="OBSIDIAN_VAULT_PATH" categories=concepts,entities,skills,references,synthesis,journal
```

### 热.md

```markdown
---
title: Hot Cache
updated: TIMESTAMP
---

# Hot Cache

*A ~500-word semantic snapshot of recent activity. Updated after every major write operation.*

## Recent Activity

- [TIMESTAMP] INIT — vault created at OBSIDIAN_VAULT_PATH

## Active Threads

*None yet — start ingesting sources to populate.*

## Key Takeaways

*None yet.*

## Flagged Contradictions

*None yet.*
```

## 步骤 4：创建 .obsidian 配置

创建最小的Obsidian配置以获得良好的开箱即用体验：

### .obsidian/app.json
```json
{
  "strictLineBreaks": false,
  "showFrontmatter": false,
  "defaultViewMode": "preview",
  "livePreview": true
}
```

### .obsidian/appearance.json
```json
{
  "baseFontSize": 16
}
```

## 步骤 5：推荐Obsidian插件

告诉用户这些推荐的社区插件（它们是手动安装的）：

1. **Dataview** — 查询页面元数据，创建动态表。对于维基来说必不可少。
2. **图形分析** — 用于探索连接的增强图形视图。
3. **Templater** — 如果他们想使用模板手动创建页面。
4. **Obsidian Git** — 自动将vault备份到 git 存储库。

## 第 6 步：验证设置

运行快速健全性检查：
- [ ] Vault 目录存在：`concepts/`、`entities/`、`skills/`、`references/`、`synthesis/`、`journal/`、`projects/`、 `_archives/`, `_raw/`
- [ ] `index.md` 存在于vault根目录
- [ ] `log.md` 存在于vault根目录
- [ ] `hot.md` 存在于vault根目录
- [ ] `.env` 已设置 `OBSIDIAN_VAULT_PATH`
- [ ] `.obsidian/` 目录存在
- [ ] `_staging/` 目录存在（即使未设置 `WIKI_STAGED_WRITES` 也是必需的 — 在安装时创建以供将来使用）
- [ ] 源目录（如果配置）存在且可读

报告结果并告诉用户他们现在可以：
1.在Obsidian中打开Vault（文件→打开Vault→选择目录）
2. 运行 `wiki-status` 查看可摄取的内容
3. 运行 `wiki-ingest` 添加第一个源
4.运行`claude-history-ingest`来挖掘他们的Claude对话
5. 运行 `codex-history-ingest` 来挖掘他们的 Codex 会话（如果他们使用 Codex）
6. 随时再次运行 `wiki-status` 以检查增量

## 可选：设置后刷新 QMD

如果配置了 `QMD_WIKI_COLLECTION` 并且本地 QMD CLI 可用，请在初始vault文件存在后运行 `qmd update`，以便可以立即查询新的vault。设置时通常不需要嵌入通道，因为vault开始时是空的，因此除非您已经填充了页面，否则简单的更新就足够了。
