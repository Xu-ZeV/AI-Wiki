---
title: wiki ingest log directory convention
tags:
  - 日志
time: 2026-05-26 11:06:34 +08:00
model: GPT-5 Codex
type:
  - Iteration
  - Lint
scope:
  - "[[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]"
  - "[[wiki/SkillHub/skills/llm-wiki|LLM Wiki 知识蒸馏架构]]"
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[raw wiki-ingest skill](../raw/SkillHub/obsidian-wiki/skills/wiki-ingest/SKILL.md)"
  - "[raw llm-wiki skill](../raw/SkillHub/obsidian-wiki/skills/llm-wiki/SKILL.md)"
  - "[raw Obsidian Wiki AGENTS](../raw/SkillHub/obsidian-wiki/AGENTS.md)"
  - "[raw Obsidian Wiki setup](../raw/SkillHub/obsidian-wiki/SETUP.md)"
---

## 操作摘要

将 `wiki-ingest` 及其依赖的 `llm-wiki` 说明从根级 `log.md` 约定修正为根目录 `log/YYYY/MM/DD/*.md` 项目日志目录约定；同步更新 raw 配套说明中的 vault 结构、写入步骤和检查清单，并在中文 SkillHub skill 页面补充 AInote 的日志约定。

## 检查目的

验证 ingest 与 LLM wiki 架构说明不会继续要求追加根级 `log.md`，而是要求每次项目文件修改后在 `log/` 下新增一条 Markdown 日志；同时检查 SkillHub 顶层索引只链接分类页，本次未新增、删除、重命名或调整分类导航，因此 `wiki/SkillHub/index.md` 无需更新。

## 下次迭代方向

继续检查其他 Obsidian wiki 相关 raw skill 是否仍继承旧的 `log.md` 说法，尤其是 `wiki-update`、`daily-update`、`wiki-status` 和 `wiki-rebuild` 等会写入或维护特殊文件的 skill。
