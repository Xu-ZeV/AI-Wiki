---
title: SkillHub 索引表格修复
tags:
  - 日志
---

# SkillHub 索引表格修复

- 操作时间：2026-05-25 15:39:27 +08:00
- 操作模型：GPT-5 Codex
- 操作类型：Query、Lint、Iteration
- 操作范围：
  - [[wiki/SkillHub/index|SkillHub 中文索引]]
  - [[log/2026/05/25/1539-skillhub-index-table|本次操作日志]]
- 操作摘要：修复 `wiki/SkillHub/index.md` 中“分类索引”表格的列数错误，将表头改为三列，并转义表格内 wikilink alias 分隔符，避免 `[[路径|别名]]` 被 Markdown 表格拆成额外列。
- 检查目的：确认顶层索引仍只链接分类页，表格结构保持三列，且不会因 wikilink 中的 `|` 破坏表格渲染。
- 下次迭代方向：优先检查其它 wiki 表格中是否也存在未转义的 Obsidian alias wikilink，必要时统一修复。
