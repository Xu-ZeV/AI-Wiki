---
title: log date hierarchy
tags:
  - 日志
time: 2026-05-26 11:35:49 +08:00
model: GPT-5 Codex
type:
  - Iteration
  - Lint
scope:
  - "[[agent|Agent 行为准则]]"
  - "[[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]"
  - "[[wiki/SkillHub/skills/llm-wiki|LLM Wiki 知识蒸馏架构]]"
  - "[[log/2026/05/25/1539-skillhub-index-table|旧日志迁移示例]]"
  - "[[log/2026/05/26/1106-log-directory-convention|日志目录约定修正]]"
---

## 操作摘要

将项目日志约定从扁平 `log/*.md` 调整为按年月日三层目录组织的 `log/YYYY/MM/DD/*.md`；迁移现有三条日志到对应日期目录，并同步更新 agent 规则、raw Obsidian wiki 说明和中文 SkillHub skill 页面。

## 检查目的

确认后续 agent 修改项目文件时会在日期分层目录中新增日志，而不是继续写入 `log/` 根目录；同时检查本次未涉及 SkillHub 分类新增、删除、重命名或导航调整，因此 `wiki/SkillHub/index.md` 无需更新。

## 下次迭代方向

继续扫描其他 wiki 维护 skill 是否仍使用旧的扁平 `log/*.md` 表述，并在需要时补充自动化校验规则，避免新日志落回根目录。
