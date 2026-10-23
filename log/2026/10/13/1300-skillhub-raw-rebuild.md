---
title: 重构建 SkillHub raw 层：上游包按功能分类迁入 categories
tags:
  - 日志
date: 2026-10-13
time: 13:25:00
model: GPT-5 Codex
type:
  - Iteration
  - Lint
scope:
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/frontend-ui-design|高级前端 UI 设计与重构]]"
  - "[[wiki/SkillHub/categories/multi-agent-orchestration|多Agent团队协作]]"
  - "[raw/SkillHub/README.md](../../../../raw/SkillHub/README.md)"
  - "[raw/SkillHub/categories/](../../../../raw/SkillHub/categories/)"
  - "[raw/SkillHub/LICENSES/](../../../../raw/SkillHub/LICENSES/)"
  - "[raw/SkillHub/categories/design-delivery-governance/output-skill/research/](../../../../raw/SkillHub/categories/design-delivery-governance/output-skill/research/)"
  - "[wiki/SkillHub/skills/](../../../../wiki/SkillHub/skills/)"
  - "[AGENTS.md](../../../../AGENTS.md)"
---

# 重构建 SkillHub raw 层：上游包按功能分类迁入 categories

## 操作时间

2026-10-13 13:25:00 +08:00

## 操作模型

GPT-5 Codex（编排者）＋ DeepSeek-V4.1-Flash（实现子代理 2 个）＋ GLM-5.3-Flash（计划门禁与对抗评审子代理各 1 个）

## 操作类型

- Iteration（重构）
- Lint（校验）

## 操作范围

- [raw/SkillHub/README.md](../../../../raw/SkillHub/README.md)：重写目录结构与「上游溯源」表，新增 `LICENSES/` 行与「拆包时保留的非 skill 内容」小节。
- [raw/SkillHub/categories/](../../../../raw/SkillHub/categories/)：新建 11 个分类目录，75 个 canonical skill 迁入，41 个冗余副本收进 `<slug>/versions/<variant>/`。
- [raw/SkillHub/LICENSES/](../../../../raw/SkillHub/LICENSES/)：新增 5 个上游包级 MIT `LICENSE`。
- [raw/SkillHub/categories/design-delivery-governance/output-skill/research/](../../../../raw/SkillHub/categories/design-delivery-governance/output-skill/research/)：恢复原 `taste-skills/research/` 的 12 个调研文档。
- [wiki/SkillHub/skills/](../../../../wiki/SkillHub/skills/)：62 个页面各更新 2 行（`source:` 与正文原始文件链接）。
- [AGENTS.md](../../../../AGENTS.md)：日志 scope 示例链接由旧包路径改为 `content-ingest/defuddle`。
- 移除项：`.gitmodules`、3 个 submodule gitlink（`obsidian-skills`、`obsidian-wiki`、`ui-ux-pro-max-skill`）、`.git/config` 的 `submodule.*` 段、6 个包内嵌套 `.git`。

## 操作摘要

按用户选定「方案 A（技能级拆分）」重构建 `raw/SkillHub/`：把顶层 6 个上游包目录（`impeccable`、`obsidian-skills`、`obsidian-wiki`、`taste-skills`、`ui-ux-pro-max-skill`、`vuejs-ai-skills`）全部解除 submodule 并拆散，按功能迁入 `categories/<分类>/<slug>/`；顶层现只剩 `categories/`、`LICENSES/`、`zh/`、`README.md`、`skills-lock.json`。

关键结果：

- 分类目录 14 个（HEAD 原有 3 个 + 新建 11 个），slug 目录 86 个（既有 11 + 迁入 75），`categories/**/SKILL.md` 共 127 个（含 41 个冗余副本）。
- 冗余副本不丢弃：`versions/dot-skills/` 33 个、`versions/tasteskill/` 4 个、`versions/top-level/` 4 个。
- 73 个 wiki skill 页的 `source:` 与正文原始文件链接全部指向新路径，`Test-Path` 全通过；62 个文件各 `+2/−2`，编码与换行未变。
- 3 个 gitlink 从索引移除，`.gitmodules` 与本地 `submodule.*` 配置清空，`git submodule status` 为空，无残留嵌套 `.git`。
- 迁移后从 CDN 按锁定 commit 补齐 `frontend-ui-design/ui-ux-pro-max/` 下 34 个（`data` 31 + `scripts` 3）上游 symlink 指向的真实文件。

## 检查目的

- 确认 116 个来源 skill 全部落盘、无内容丢失（TSV 逐条 `Test-Path`、20 条 HEAD blob 哈希逐字节比对、3 个上游包 CDN 抽查）。
- 确认 submodule 真正解除（`.gitmodules`、索引 `160000`、`.git/config`、嵌套 `.git`、`.git/modules` 五处均为空）。
- 确认无 slug 冲突、wiki 路径全部可跳转、README 分类表与磁盘一致。
- 确认无越界改动：`zh/`、`skills-lock.json`、`.agents/`、`.obsidian/` 零改动，`wiki/` 只动 `skills/*.md`。
- 对抗评审门禁（GLM-5.3-Flash，只读）对实际 diff 做二值判定：`VERDICT: PASS`，10 项全过。

## 下次迭代方向

- 13 个 raw-only skill（`banner-design`、`brand`、`design`、`design-system`、`obsidian-layout-adjustment`、`session-brain`、`session-search`、`slides`、`ui-styling`、`ui-ux-pro-max`、`vault-skill-factory`、`wiki-import`、`wiki-narrate`）尚无中文 wiki 页，可按需蒸馏补齐。
- `raw/SkillHub/zh/` 镜像层未跟随本次重组重生成（本次按计划只处理顶层 6 个上游包目录，`zh/` 作为中文归档层保持零改动）；其中至少 `zh/obsidian-wiki/SETUP.md` 第 5 行仍链接到已删除的 `raw/SkillHub/obsidian-wiki/README.md#agent-compatibility`。如需可再跑一轮 `zh/` 同步，统一清理该层的旧包路径引用（全库仅剩这 1 处，其余 38 处都在历史 `log/` 中）。
- `skills-lock.json` 中 `guizang-ppt-skill`、`html-ppt`、`huashu-design` 三条 SHA-256 与磁盘不符（本次未改动该文件），建议单独修订。
- 上游许可证仅保留包级 MIT 文本；如需面向分发合规，可再补各 skill 内部嵌套许可证的归属说明。
