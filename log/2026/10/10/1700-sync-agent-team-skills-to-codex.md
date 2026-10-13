---
title: 把多代理协作 skill 同步进 Codex 用户级 skill 目录
tags:
  - 日志
date: 2026-10-10
time: 17:42:10
model: GPT-5 Codex
type:
  - Iteration
scope:
  - "[[wiki/SkillHub/categories/multi-agent-orchestration|多Agent团队协作]]"
  - "[同步脚本](../../../../scripts/sync-agent-team-skills.ps1)"
  - "[项目内可加载副本](../../../../.agents/skills/agent-team-orchestration/SKILL.md)"
---

# 把多代理协作 skill 同步进 Codex 用户级 skill 目录

## 操作时间

2026-10-10 17:42:10 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Iteration

## 操作摘要

用户要求把多代理协作 skill 同步到 Codex 中。此前这 7 个 `agent-team-*` skill 只存在于 Wiki 仓库的 `.agents/skills/` 下，Codex 用户级目录 `C:\Users\Administrator\.codex\skills` 中没有任何一份，因此在别的项目里无法加载。

本轮新增幂等同步脚本，并把 7 个 skill 首次装入 Codex 用户级目录。

## 新增文件

`scripts/sync-agent-team-skills.ps1`

事实源为 `.agents/skills/agent-team-*`，目标为 `$env:USERPROFILE\.codex\skills\<name>`。脚本特性：

- 幂等：每次同步先删除目标同名目录再整体复制，保证两边一致。
- 链接改写：把 `](../../../raw/SkillHub/` 这类仓库内相对链接改写为绝对路径。相对链接在 skill 被拷出仓库后必然失效，这是本次同步必须处理的关键点。
- 安全闸：目标路径必须严格落在 `.codex\skills` 之下，且目录名与源 skill 同名，否则直接抛错拒绝写入。
- 支持 `-WhatIf`、`-RepoRoot`、`-Destination`、`-Filter` 参数。

## 同步结果

| Skill | 文件数 | 改写链接数 |
| --- | --- | --- |
| agent-team-brainstorm | 1 | 1 |
| agent-team-design-gate | 1 | 1 |
| agent-team-external-cli | 2 | 1 |
| agent-team-handoff | 1 | 1 |
| agent-team-orchestration | 2 | 1 |
| agent-team-plan-gate | 2 | 2 |
| agent-team-visual-review | 1 | 1 |

共 9 个文件（7 个 `SKILL.md` + 2 个 references 量规，plan-gate 的 rubric 另外单独一份），全部落到 `C:\Users\Administrator\.codex\skills\`。

## 检查目的

- 验证 7 个 skill 目录及 `references/` 附件被完整复制，无遗漏。
- 验证复制后的内容与事实源逐字节一致，唯一差异是预期的链接改写。
- 验证复制后不再残留任何 `](../../` 形式的仓库内相对链接。
- 验证文件为无 BOM 的 UTF-8，避免中文 frontmatter 解析异常。

## 复核结果

- 目录比对：7 个 skill 共 9 个文件全部到位，`references/` 子目录随主目录一并复制。
- 内容比对：对每个文件按「源文件 + 链接改写规则」重算期望内容后与目标文件逐字节比较，7 个 skill 全部 `OK`，失配数为 0。
- 断链检查：在 7 个 skill 范围内检索 `](../../`，零命中。
- 编码检查：9 个文件均无 BOM。
- 血缘链接抽查：`agent-team-orchestration/SKILL.md` 第 755 行的归档链接已由 `../../../raw/...` 变为 `D:/work/AI-Wiki/AI-Wiki/raw/...`，在仓库外仍可点击。
- 未调用 `~/.codex/skills` 下任何 skill。

## 下次迭代方向

- 以后在 Wiki 里改动 `agent-team-*` 的任何内容后，必须重跑 `scripts/sync-agent-team-skills.ps1`，否则 Codex 用户级副本会与事实源脱节。
- 目前同步方向是单向的（Wiki → Codex）。如果将来在 Codex 侧直接手改了 skill，改动不会回流，需要在事实源补齐。
- 新开 Codex 会话才会加载本次新装的 skill；当前会话的 skill 清单已在启动时固化。
- `raw/SkillHub/categories` 与 `.agents/skills/agent-team-*` 在 git 中仍为未跟踪状态，建议尽快提交一次。
