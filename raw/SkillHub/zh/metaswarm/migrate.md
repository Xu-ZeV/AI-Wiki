---
title: Metaswarm 框架迁移与精简
slug: migrate
archived_at: 2026-10-10
archived_from: wiki/SkillHub/skills/migrate.md
origin_repo: dsifry/metaswarm
source_note: 本页为中文归纳稿；逐段全译见 skills/migrate/SKILL.md
archive_reason: metaswarm 框架专有，Codex 原生子代理工作流不适用
---
# Metaswarm 框架迁移与精简

> [!note] 归档原始资料
> 本文是 metaswarm 框架技能文档的中文归纳稿。因框架专有（BEADS 任务库、`bd` / `gtg` CLI、插件 marketplace、GitHub Issue 到 PR 的全自动流水线、Claude / Gemini 平台适配）且本机不适用，已于 2026-10-10 从 `wiki/SkillHub` 下架，移入 raw 原始资料层留存。
> 文中机制在本机不存在，请勿按此执行；Codex 原生子代理协作方案见项目内 `.agents/skills/`。

> [!info] Skill 元信息
> 原始名称：`migrate`  
> 原始标题：Migration Skill  
> 功能分类：多Agent团队协作  
> 原始文件：本页为中文归纳稿；逐段全译见 [skills/migrate/SKILL.md](./skills/migrate/SKILL.md)  
> 上游仓库：[dsifry/metaswarm](https://github.com/dsifry/metaswarm)  
> 许可证：MIT

## 中文含义与用途

中文含义：从 npm 本地安装迁移到插件市场模式，并清理冗余框架文件。  
核心用处：旧版 `npx metaswarm init` 会把整套框架代码复制进项目目录，而市场插件已经直接提供这些 skills、commands、rubrics 与 guides。本 skill 用一套带安全检查的协议清理这些冗余副本，同时绝不触碰项目专属文件，且全程可逆。

**使用时机**：SessionStart hook 检测到 `.claude/plugins/metaswarm/.claude-plugin/plugin.json`（旧版内嵌插件）并建议执行迁移时。

## 安全叙事与语气（先于任何文件清单）

在展示任何迁移预览或文件列表**之前**，必须先给出这段框架说明：

- **这次迁移做了什么**：清理那些现在已由插件直接提供的冗余副本。
- **不会丢失任何东西**：项目专属文件（`CLAUDE.md`、`.coverage-thresholds.json`、`.beads/`、`bin/`、`scripts/`）永不被触碰。
- **完全可逆**：所有删除都用 `git rm` 暂存而非直接抹除；提交前 `git restore --staged . && git checkout -- .`，提交后 `git revert HEAD`。
- **不会自动提交**：由用户确认后再自行 commit。

语气要求：安抚而非恐吓。说“cleaning up XX redundant copies”，不说“deleting XX files”；说“these files now live in the plugin”，不说“these files will be removed”。

## 十个执行步骤

| 步骤 | 内容 |
| --- | --- |
| 1 | 预检：`project-profile.json` 已是 `"distribution": "plugin"` 则告知已完成；无旧版内嵌插件则无事可做 |
| 2 | 清点旧文件：`.claude/plugins/metaswarm/`、`.claude/rubrics/*.md`、`.claude/guides/*.md`、`.claude/commands/metaswarm-setup.md`、`.claude/commands/metaswarm-update-version.md` |
| 3 | 内容校验：SHA-256 比对，判定 unmodified / user-modified / unknown |
| 4 | 空跑预览 Dry Run |
| 5 | 用户确认（对 user-modified 文件逐个询问保留 / 移除 / 查看 diff） |
| 6 | Git 安全检查（有未提交改动时先提示 commit 或 stash） |
| 7 | 执行清理：只用 `git rm`，未跟踪文件才用 `rm -f` |
| 8 | 写入 6 个命令 shim（与 setup 一致） |
| 9 | 更新 profile：合并 `"distribution": "plugin"`、`migrated_at`、`migrated_from: "npm"` |
| 10 | 迁移后摘要与下一步 |

## SHA-256 校验协议

1. 读取文件内容 → 2. 归一化换行为 LF（`\r\n` / `\r` → `\n`）→ 3. 去掉每行行尾空白 → 4. 去掉结尾换行 → 5. 计算 SHA-256 → 6. 与插件自身目录（`rubrics/`、`guides/` 等）中同名文件的哈希比对。

哈希取自插件当前文件而非硬编码，因此不会随版本漂移。

| 结果 | 处理 |
| --- | --- |
| 哈希一致 | **Unmodified**，加入清理列表 |
| 哈希不一致 | **User-modified**，标记待用户决定，绝不自动删除 |
| 不在哈希清单中 | **Unknown file**，完全跳过 |

## 永不动清单

`CLAUDE.md`、`.coverage-thresholds.json`、`.metaswarm/project-profile.json`、`.beads/`、`bin/`、`scripts/`、`.github/workflows/`、`.claude/commands/` 下的 shim。

迁移结束后 `.claude/rubrics/` 与 `.claude/guides/` 若为空可删除，但 `.claude/commands/` 不可删除。

## 回滚手段

- 提交前整体撤销：`git restore --staged . && git checkout -- .`
- 提交后整体撤销：`git revert HEAD`
- 单文件恢复：`git checkout HEAD~1 -- <path>`
- 整体退回旧方案：`npx metaswarm install`

## 原始描述摘要

Migrate from npm-installed metaswarm to the marketplace plugin — removes redundant files with safety checks.

## 相关 Skill

- `setup`
- `status`
