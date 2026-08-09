---
name: obsidian-wiki
description: Obsidian wiki 工作流程 — 查询、更新、摄取、lint、状态。
commands:
  - name: wiki-query
    description: Answer questions from the compiled Obsidian wiki with [[wikilink]] citations.
    skill: .skills/wiki-query/SKILL.md
  - name: wiki-update
    description: Sync the current project's knowledge into the Obsidian wiki.
    skill: .skills/wiki-update/SKILL.md
  - name: wiki-ingest
    description: Ingest documents into the Obsidian wiki.
    skill: .skills/wiki-ingest/SKILL.md
  - name: wiki-status
    description: Show what's been ingested, what's pending, and the delta.
    skill: .skills/wiki-status/SKILL.md
  - name: wiki-lint
    description: Audit the wiki for orphans, broken links, stale content.
    skill: .skills/wiki-lint/SKILL.md
---

# Obsidian Wiki — 工作流程注册表

上面的每个命令都映射到 `.skills/` 中的 `SKILL.md`。当用户调用一个
对于这些命令，请阅读映射的技能文件并按照其说明进行操作
正是如此。这些技能处理vault路径解析、清单跟踪和
`[[wikilink]]` 自行连接。

有关完整的路由表（所有 15 个以上技能），请参阅存储库根目录中的 `AGENTS.md`。
