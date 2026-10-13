---
title: 修正 agent-team 套件中两个子代理模型的上下文窗口参数
tags:
  - 日志
date: 2026-10-10
time: 16:05:57
model: GPT-5 Codex
type:
  - Iteration
  - Lint
scope:
  - "[[wiki/SkillHub/categories/multi-agent-orchestration|多Agent团队协作]]"
  - "[多代理套件说明书](../../../../raw/SkillHub/categories/multi-agent-orchestration/README.md)"
  - "[skills-lock.json](../../../../raw/SkillHub/skills-lock.json)"
---

# 修正 agent-team 套件中两个子代理模型的上下文窗口参数

## 操作时间

2026-10-10 16:05:57 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Iteration
- Lint

## 操作摘要

用户指出套件里写的模型参数有误：`GLM-5.3-Flash` 是 **1M** 上下文，不是 128K；`DeepSeek-V4.1-Flash` 是 **256K** 上下文，此前在部分表格里写成了「上下文见本机配置」或「以本机实际配置为准」这类占位表述。本轮把 raw 原始层、项目内可加载副本、wiki 蒸馏层三处全部校正，并补上此前缺失的 DeepSeek 上下文数值。

## 修改明细

| 位置 | 修改前 | 修改后 |
| --- | --- | --- |
| 模型参数表（plan-gate、design-gate、external-cli） | `上下文见本机配置` / `以本机实际配置为准` | `256K` |
| 同一批表格 | `128K` | `1M` |
| external-cli 上下文裁剪规则 | `GLM-5.3-Flash 为 128K` | `GLM-5.3-Flash 为 1M，DeepSeek-V4.1-Flash 为 256K` |
| external-cli 路由示例注释 | `128K 上下文` / `128K 窗口` | `1M 上下文` / `1M 窗口` |
| orchestration 模型说明段 | `GLM-5.3-Flash 上下文为 128K` | `GLM-5.3-Flash 为 1M；DeepSeek-V4.1-Flash 为 256K` |
| handoff、visual-review 模型清单 | `上下文窗口 128K` | `上下文窗口 1M` |
| wiki 7 页模型表 | GLM 行 `128K 上下文`，DeepSeek 行无上下文 | GLM 行 `1M 上下文`，DeepSeek 行 `256K 上下文` |

涉及三个副本，内容保持一致：

- raw 原始层：`raw/SkillHub/categories/multi-agent-orchestration/agent-team-*/SKILL.md`（6 个文件有改动）。
- 项目内可加载副本：`.agents/skills/agent-team-*/SKILL.md`（同样 6 个）。
- wiki 蒸馏层：`wiki/SkillHub/skills/agent-team-*.md`（7 页，brainstorm 页只有模型表需要同步）。

另有两处增值补充：

- [多代理套件说明书](../../../../raw/SkillHub/categories/multi-agent-orchestration/README.md) 新增「本机可用模型」表，把两个模型的标识、显示名、上下文和 reasoning_effort 档位一次写清。
- [多Agent团队协作分类页](../../../../wiki/SkillHub/categories/multi-agent-orchestration.md) 同步新增同一张表，作为 wiki 层的权威模型规格入口。

## 连带修正

- `agent-team-external-cli/SKILL.md` 的 H1 由裸 slug 改为「跨模型委托与模型路由（External CLI）」，与其余 6 个 skill 的中文标题风格统一。
- 因 raw 下 6 个 `SKILL.md` 内容变更，重算并回写 `skills-lock.json` 中对应的 `computedHash`（brainstorm 未改动，哈希保持原值）。

## 检查目的

- 验证套件内不再出现 `128K`、`上下文见本机配置`、`以本机实际配置为准` 这三类错误或占位表述。
- 验证 raw 与 `.agents` 两份副本的模型参数完全一致。
- 验证 `skills-lock.json` 的本地登记哈希与磁盘文件一致。

## 复核结果

- `rg '128K'` 在 `.agents`、`raw/SkillHub/categories`、`wiki/SkillHub` 范围内零命中。
- `rg '上下文见本机配置|以本机实际配置为准'` 在同一范围零命中。
- `skills-lock.json` 的 7 条 `sourceType: local` 条目与磁盘文件 SHA256 逐一比对，全部 OK，失配数为 0。
- 未调用 `~/.codex/skills` 下任何 skill。

## 下次迭代方向

- 模型上下文与 reasoning_effort 档位如有变化，需同时更新三处：raw 分类目录、`.agents/skills` 副本、wiki 页；只改一处会造成三份资料互相矛盾。
- 若后续新增第三个可用模型，「本机可用模型」表与各 skill 的异构路由表都要同步扩充。
- `raw/SkillHub/categories` 与 `.agents/skills/agent-team-*` 在 git 中仍为未跟踪状态，建议尽快提交一次，避免再次出现无法回溯的改名与内容变更。
