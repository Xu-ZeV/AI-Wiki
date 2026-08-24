---
title: html-ppt SkillHub 完整导入
tags:
  - 日志
date: 2026-08-18
time: 11:37:54
model: GPT-5 Codex
type:
  - Ingest
  - Query
  - Lint
  - Iteration
scope:
  - "[html-ppt Skill](../../../../raw/SkillHub/.agents/skills/html-ppt/SKILL.md)"
  - "[skills-lock.json](../../../../raw/SkillHub/skills-lock.json)"
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/presentation-web-slides|演示文稿与网页幻灯片]]"
  - "[[wiki/SkillHub/skills/html-ppt|HTML PPT 工作室]]"
---

# html-ppt SkillHub 完整导入

## 操作时间

2026-08-18 11:37:54 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Ingest
- Query
- Lint
- Iteration

## 操作摘要

- 在 `raw/SkillHub` 中执行 `npx skills@latest add https://github.com/lewislulu/html-ppt-skill --skill html-ppt`，将 `html-ppt` 安装到 `.agents/skills/html-ppt`。
- `skills-lock.json` 已新增 `html-ppt` 条目，记录上游仓库 `lewislulu/html-ppt-skill`、`SKILL.md` 路径和内容哈希。
- 阅读并蒸馏本地安装后的 `SKILL.md`、README 和中文 README，新增 `wiki/SkillHub/skills/html-ppt.md`。
- 将 `html-ppt` 纳入“演示文稿与网页幻灯片”分类，并把 SkillHub 顶层索引中该分类数量从 1 更新为 2。
- 保留它与 `guizang-ppt-skill` 的并存关系：`html-ppt` 偏主题、模板、布局、动效和 Presenter Mode，`guizang-ppt-skill` 偏双视觉系统与归藏网页 PPT 工作流。

## 检查目的

- 确认 `npx skills@latest list --json` 能识别 `html-ppt`。
- 确认 `raw/SkillHub/.agents/skills/html-ppt/SKILL.md`、`wiki/SkillHub/skills/html-ppt.md` 和 `raw/SkillHub/skills-lock.json` 真实存在且内容可解析。
- 确认 SkillHub 顶层索引只链接分类页、分类页使用短 wikilink、详情页不反向链接分类页，并且详情页的原始来源链接指向真实文件。
- 确认 `wiki/SkillHub` 未新增旧标签 `skillhub` 或英文 `index` 标签。
- 已检查 `wiki/SkillHub/index.md`；因新增 skill 和分类数量变化，本次已同步更新生成日期、分类数量和功能范围描述。

## 下次迭代方向

- 使用 `html-ppt` 生成一份小型测试 deck，实际验证主题切换、Presenter Mode、notes 抽屉、键盘导航和 PNG 导出流程。
- 在 Windows 环境中验证或改造 `scripts/render.sh` 的 Chrome 路径，避免默认 macOS Chrome 路径影响本机 PNG 导出。
- 后续更新该 skill 时，优先用 `skills` CLI 重新同步 raw 层，再判断中文详情页是否需要随上游内容更新。
