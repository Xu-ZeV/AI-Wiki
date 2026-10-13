---
title: Metaswarm 安装与配置诊断
slug: status
archived_at: 2026-10-10
archived_from: wiki/SkillHub/skills/status.md
origin_repo: dsifry/metaswarm
source_note: 本页为中文归纳稿；逐段全译见 skills/status/SKILL.md
archive_reason: metaswarm 框架专有，Codex 原生子代理工作流不适用
---
# Metaswarm 安装与配置诊断

> [!note] 归档原始资料
> 本文是 metaswarm 框架技能文档的中文归纳稿。因框架专有（BEADS 任务库、`bd` / `gtg` CLI、插件 marketplace、GitHub Issue 到 PR 的全自动流水线、Claude / Gemini 平台适配）且本机不适用，已于 2026-10-10 从 `wiki/SkillHub` 下架，移入 raw 原始资料层留存。
> 文中机制在本机不存在，请勿按此执行；Codex 原生子代理协作方案见项目内 `.agents/skills/`。

> [!info] Skill 元信息
> 原始名称：`status`  
> 原始标题：Status Skill  
> 功能分类：多Agent团队协作  
> 原始文件：本页为中文归纳稿；逐段全译见 [skills/status/SKILL.md](./skills/status/SKILL.md)  
> 上游仓库：[dsifry/metaswarm](https://github.com/dsifry/metaswarm)  
> 许可证：MIT

## 中文含义与用途

中文含义：Metaswarm 安装状态、项目配置与潜在问题的诊断报告。  
核心用处：跨 Claude Code、Codex、Gemini 三个平台核查 metaswarm 的插件版本、项目是否已完成配置、平台安装方式、命令 shim、旧版内嵌插件、BEADS 插件、`bd` / `gtg` CLI、外部工具、覆盖率阈值与 Node.js，最后汇总在一张报告表中并给出问题与建议。

本 skill 是纯诊断性质，永不致命失败：任一检查出错只报告该项错误并继续其余检查。

## 平台识别

- **Codex**：存在 `PLUGIN_ROOT` 或 `CODEX_HOME`，活动 manifest 为 `.codex-plugin/plugin.json`，或用户调用 `$status`。
- **Claude Code**：存在 `CLAUDE_PLUGIN_ROOT`，活动 manifest 为 `.claude-plugin/plugin.json`。
- **Gemini**：存在 `extensionPath`，活动 manifest 为 `gemini-extension.json`。

## 11 项诊断核查

| # | 检查项 | 关键点 |
| --- | --- | --- |
| 1 | 插件版本 | 读取当前平台 manifest 的 `version`；回退到 `package.json`；都没有则 `UNKNOWN` |
| 2 | 项目配置状态 | `.metaswarm/project-profile.json` 是否存在，已配置则报告 `distribution` / `metaswarm_version` / `language` / `framework` / `test_runner` |
| 3 | 平台安装状态 | 检查 `.codex-plugin/plugin.json`、`~/.codex/config.toml` 插件条目、`~/.codex/plugins/cache/` 等（Claude 对应 `~/.claude/plugins/cache/`） |
| 4 | Claude 命令 shim | `.claude/commands/` 下 6 个 shim（start-task / prime / review-design / self-reflect / pr-shepherd / brainstorm）；Codex 平台报告 `not applicable` |
| 5 | 旧版内嵌插件 | 检测 `.claude/plugins/metaswarm/.claude-plugin/plugin.json`，命中则提示运行 `$migrate`；与市场插件并存时报冲突 |
| 6 | BEADS 插件 | 扫描两个 cache 目录中 `"name": "beads"` 的插件；命中则注明 metaswarm 让渡 priming 给 BEADS |
| 7 | `bd` CLI | `command -v bd && bd --version`；缺失则说明知识 priming 与 self-reflect 需要它，核心编排不受影响 |
| 8 | `gtg` CLI | `command -v gtg`；缺失则 PR Shepherd 回退到手工 `gh` 检查 |
| 9 | 外部工具 | 读 `.metaswarm/external-tools.yaml`，逐适配器检查 `codex` / `gemini` 可执行文件 |
| 10 | 覆盖率阈值 | 读 `.coverage-thresholds.json`，报告 lines / branches / functions / statements 与强制命令 |
| 11 | Node.js | `node --version`；缺失则 `scripts/beads-*.ts` 不可用，核心编排不受影响 |

**不包含**：`gh` / `git` 连通性检查，也不展示 worktree 列表或 `docs/handoffs/` 交接文件。

## 输出格式

固定为一张 `## Metaswarm Status Report` 表格（Component / Status 两列，逐项列出活动平台、插件版本、项目配置、平台安装、命令 shim、旧版插件、BEADS 插件、bd、gtg、外部工具、覆盖率、Node.js），随后是 `### Issues Found` 与 `### Recommendations` 两个小节，无问题时都写 `- None`。

## 原始描述摘要

Diagnostic status report — shows metaswarm installation state, project setup, and potential issues across Claude Code, Codex, and Gemini. Useful for troubleshooting and verifying setup or migration.

## 相关 Skill

- `setup`
- `start`
- `migrate`
