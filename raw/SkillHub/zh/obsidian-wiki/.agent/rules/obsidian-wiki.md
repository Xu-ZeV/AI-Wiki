---
alwaysApply: true
description: Obsidian Wiki 基于技能的框架 — 路由、约定和核心规则。
---

# Obsidian Wiki — 代理上下文

该项目是一个用于构建和维护Obsidian知识库的**基于技能的框架**。

## 快速定位

1. 阅读 `~/.obsidian-wiki/config`（或本存储库中的 `.env`）以获取 `OBSIDIAN_VAULT_PATH` — 这是 wiki 所在的位置。
2. 读取vault根目录处的 `.manifest.json` 以查看已摄取的内容。
3.技能位于`.skills/`（也位于`.agents/skills/`）。每个子文件夹都有一个 `SKILL.md`。

## 何时使用技能

|用户说类似... |阅读此技能 |
|---|---|
| “设置我的维基”/“初始化”| `wiki-setup` |
| “摄取”/“将其添加到维基”| `wiki-ingest` |
| “导入我的克劳德历史” | `claude-history-ingest` |
| “导入我的 Codex 历史记录”| `codex-history-ingest` |
| “导入我的爱马仕历史”| `hermes-history-ingest` |
| “导入我的 OpenClaw 历史记录”| `openclaw-history-ingest` |
| “导入我的 Pi 历史记录” | `pi-history-ingest` |
| “处理此导出”/“摄取此数据”| `data-ingest` |
| “状态是什么”/“显示增量”| `wiki-status` |
| “我对X了解多少”| `wiki-query` |
| “审核”/“lint”/“查找损坏的链接”| `wiki-lint` |
| “重建”/“存档”/“恢复”| `wiki-rebuild` |
| “链接我的页面”/“交叉引用”| `cross-linker` |
| “修复我的标签” | `tag-taxonomy` |
| “更新 wiki”/“同步到 wiki”| `wiki-update` |
| “导出维基”/“导出图表”| `wiki-export` |

## 核心规则

- **编译，不检索** — 更新现有页面，不追加或重复。
- **跟踪一切** — 每次操作后更新 `.manifest.json`、`index.md` 和 `log.md`。
- **与 `[[wikilinks]]` 连接** — 每个页面都应链接到相关页面。
- **需要 Frontmatter** — 每页都需要 `title`、`category`、`tags`、`sources`、`created`、`updated`。

有关完整上下文，请阅读存储库根目录中的 `AGENTS.md`。
