---
title: 把多Agent团队协作 skill 重构为 Codex 原生子代理协作协议
tags:
  - 日志
date: 2026-10-10
time: 11:48:37
model: GPT-5 Codex
type:
  - Iteration
  - Lint
scope:
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/multi-agent-orchestration|多Agent团队协作]]"
  - "[[wiki/SkillHub/skills/orchestrated-execution|四阶段原生子代理编排闭环]]"
  - "[[wiki/SkillHub/skills/external-tools|跨模型任务委托与对抗审查]]"
  - "[[wiki/SkillHub/skills/plan-review-gate|方案对抗性审查门禁]]"
  - "[[wiki/SkillHub/skills/design-review-gate|设计多角色审查门禁]]"
  - "[[wiki/SkillHub/skills/brainstorming-extension|头脑风暴审查桥接扩展]]"
  - "[[wiki/SkillHub/skills/handoff|零上下文损耗会话交接]]"
  - "[[wiki/SkillHub/skills/visual-review|Playwright 视觉审查与页面截屏]]"
---

# 把多Agent团队协作 skill 重构为 Codex 原生子代理协作协议

## 操作时间

2026-10-10 11:48:37 +08:00

## 操作模型

GPT-5 Codex（编排者主会话）

本轮以 Codex 原生子代理并行施工，共 5 个产出子代理 + 2 个只读对抗评审子代理，模型在两组之间交替：

| 子代理 | 模型 | 职责 |
| --- | --- | --- |
| Bacon | `ccs-glm-5-3-flash/GLM-5.3-Flash`（high） | `orchestrated-execution` 中文 skill + 对抗评审量规 |
| Kepler | `DeepSeek-V4.1-Flash`（high） | `external-tools` 中文 skill + 评审量规 |
| Hilbert | `DeepSeek-V4.1-Flash`（medium） | `plan-review-gate` / `design-review-gate` / `brainstorming-extension` 中文 skill + 量规 |
| Curie | `ccs-glm-5-3-flash/GLM-5.3-Flash`（high） | `handoff` 与 `visual-review` 中文 skill |
| Ramanujan | `ccs-glm-5-3-flash/GLM-5.3-Flash`（high） | 6 个 A 级 wiki 详情页重写 |
| Banach（评审） | `DeepSeek-V4.1-Flash`（xhigh） | 第一轮对抗审查，判定 FAIL |
| Hubble（复审） | `ccs-glm-5-3-flash/GLM-5.3-Flash`（max） | 修复后复审判定 |

## 操作类型

- Iteration
- Lint

## 操作摘要

- 把 `raw/SkillHub/agents/skills/*` 下 metaswarm 原版 skill，从"metaswarm / Claude 框架说明书"重构为**可直接在 Codex 原生 `spawn_agent` / `wait_agent` / `send_input` / `close_agent` 上执行的中文协作协议**。
- 新增 7 个中文 skill 文件与 3 个中文评审量规，落盘在 `.agents/skills/<slug>/`：
  - `orchestrated-execution`（756 行）+ `references/adversarial-review-rubric.zh.md`
  - `external-tools`（562 行）+ `references/external-tool-review-rubric.zh.md`
  - `plan-review-gate`（502 行）+ `references/plan-review-rubric-adversarial.zh.md`
  - `design-review-gate`（603 行）
  - `brainstorming-extension`（241 行）
  - `handoff`（199 行）
  - `visual-review`（252 行）
- 剥离的 metaswarm 专有机制：BEADS 与 `bd` CLI、`.beads/` 状态目录、`.metaswarm/*.yaml` 配置、Claude Team Mode（`TeamCreate` / `SendMessage` / `shutdown_request`）、外部 CLI 适配器（`codex.sh` / `gemini.sh`）、强制 `gh` Issue/PR 流程、插件 marketplace 依赖。替换为 `docs/plans/` 通用落盘、Codex 原生子代理编排与"调用即授权"前提。
- 重写 6 个 A 级 wiki 详情页（orchestrated-execution / plan-review-gate / external-tools / handoff / design-review-gate / brainstorming-extension），统一补上 `> [!info] Skill 元信息` 块与指向 `raw/SkillHub/agents/skills/<slug>/SKILL.md` 的原始文件链接。
- 为 8 个 B/C 级页面加分层提示：C 级 7 页（start / setup / status / migrate / create-issue / pr-shepherd / handling-pr-comments）标注 `> [!warning] 归档：不在 Codex 中使用`；B 级 `visual-review` 标注 `> [!info] 独立可用`。

## 操作范围

- 新增中文 skill：`.agents/skills/{orchestrated-execution,external-tools,plan-review-gate,design-review-gate,brainstorming-extension,handoff,visual-review}/`。
- 重写 wiki 详情页：[[wiki/SkillHub/skills/orchestrated-execution|四阶段原生子代理编排闭环]]、[[wiki/SkillHub/skills/external-tools|跨模型任务委托与对抗审查]]、[[wiki/SkillHub/skills/plan-review-gate|方案对抗性审查门禁]]、[[wiki/SkillHub/skills/design-review-gate|设计多角色审查门禁]]、[[wiki/SkillHub/skills/brainstorming-extension|头脑风暴审查桥接扩展]]、[[wiki/SkillHub/skills/handoff|零上下文损耗会话交接]]。
- 分类页：[[wiki/SkillHub/categories/multi-agent-orchestration|多Agent团队协作]]（A/B/C 三级分层表 + Codex 原生流转图）。
- 索引页：[[wiki/SkillHub/index|SkillHub 中文索引]]（多Agent表格行更新为 A6/B1/C7，补充「使用路径 → 多Agent团队协作」）。
- 原始来源：`raw/SkillHub/agents/skills/*/SKILL.md`（保留不动，只作对照与 `source:` 指向）。

## 检查目的

- 确认 7 个中文 `SKILL.md` 均存在、有合法 frontmatter（`name` / `description` / `license` / `metadata.source` / `adapted_for`），且正文是中文可执行协议。
- 确认剥离干净：7 个 skill 目录内不再出现 `bd`、`.beads/`、`TeamCreate`、`SendMessage`、`codex.sh`、`gemini.sh`、`gh`、marketplace 等可执行残留（仅保留作者署名与"已剥离"声明句）。
- 确认模型能力描述准确：GLM-5.3-Flash 只有 `low` / `high` / `max`，DeepSeek-V4.1-Flash 为 `low` / `medium` / `high` / `xhigh`，未出现给 GLM 传 `xhigh`、给 DeepSeek 传 `max` 的错误。
- 确认 SkillHub 分层链接规则：`skills/*.md` 无反向 `categories/*` 链接；原始文件相对链接指向真实存在的 `raw/SkillHub/**/SKILL.md`；全部 wikilink 可解析；分类计数 A6/B1/C7 = 14 与磁盘一致。
- 第一轮对抗审查（Banach，DeepSeek xhigh）判定 **FAIL**，暴露两类问题，已修复：
  1. `.agents/skills/visual-review/SKILL.md` 存在成段未翻译的英文正文（约 30 行，含整节 `## Common Mistakes`），已全文中文化。
  2. 安全设计评审员的模型分配在 skill 与 wiki 之间互相矛盾（skill 为 GLM/max，wiki 写成 DeepSeek/xhigh），已在 `wiki/SkillHub/skills/design-review-gate.md` 补「模型与角色分配」表并改正 spawn 示例，同时在 `wiki/SkillHub/skills/brainstorming-extension.md` 对齐为 GLM/`max`。

## 下次迭代方向

- 后续若上游 `dsifry/metaswarm` 更新 `SKILL.md`，需同步刷新 `.agents/skills/` 下对应中文 skill 与 wiki 蒸馏页，并复核模型能力表（GLM 不支持 `medium`、DeepSeek 不支持 `max`）。
- 现有中文 skill 尚未被实际任务验证过一轮；建议下一次真正用子代理做多模型协作时，按本日志记录的模型分工实跑一遍，回收实际耗时与失败模式，再回写「路由情报」小节。
- `.agents/skills/` 下的 7 个中文 skill 目前不在 `~/.codex/skills` 全局技能目录中，属项目内约定文档；若要被 Codex 自动加载，需评估是否建立软链或复制到全局技能目录。
- `wiki/SkillHub/index.md` 与分类页的计数本次已核对一致，无需再改；下次新增或归档 skill 时同步维护该处的 A/B/C 计数。
