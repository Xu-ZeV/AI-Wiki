---
title: C 级框架专有 skill 移出 wiki 并归档到 raw 原始资料层
tags:
  - 日志
date: 2026-10-10
time: 13:59:00
model: GPT-5 Codex
type:
  - Iteration
  - Lint
scope:
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/multi-agent-orchestration|多Agent团队协作]]"
  - "[raw/SkillHub/zh/metaswarm/README.md](../../../../raw/SkillHub/zh/metaswarm/README.md)"
  - "[start 归档稿](../../../../raw/SkillHub/zh/metaswarm/start.md)"
  - "[handling-pr-comments 归档稿](../../../../raw/SkillHub/zh/metaswarm/handling-pr-comments.md)"
  - "[上一轮日志：修复多Agent协作 Skill 中文蒸馏页](../../../../log/2026/10/10/0900-repair-skillhub-distill-pages.md)"
---
# C 级框架专有 skill 移出 wiki 并归档到 raw 原始资料层

## 操作时间

2026-10-10 13:59:00 +08:00

## 操作模型

GPT-5 Codex（编排者）；评审子代理 Averroes（GLM-5.3-Flash, max）

## 操作类型

Iteration、Lint

## 操作摘要

用户指令：C 级框架专有 skill 从 wiki 去掉，把归纳好的 skill 放到 raw 原始资料中。

- **下架**：7 个 C 级页面从 `wiki/SkillHub/skills/` 移出，落到 `raw/SkillHub/zh/metaswarm/<slug>.md`：`start`、`setup`、`status`、`migrate`、`create-issue`、`pr-shepherd`、`handling-pr-comments`。
- **归档稿改造**：frontmatter 由 `title / skill / category / category_slug / source / tags` 改为 `title / slug / archived_at / archived_from / origin_repo / source_file / archive_reason`，剥离 wiki 标签体系；开头 `[!warning]` 换成 raw 层归档说明；原始文件相对链接由 `../../../raw/SkillHub/agents/skills/` 修正为 `../../agents/skills/`；正文内 21 处 `[[wikilink]]` 改为纯文本反引号，避免 raw 层向 wiki 层产生新的图谱边。
- **新增说明**：`raw/SkillHub/zh/metaswarm/README.md`，记录该目录定位、7 件清单、上游来源与相关 Codex 原生方案入口。
- **分类页**：`wiki/SkillHub/categories/multi-agent-orchestration.md` 的分层表中 C 级处理方式改为「已移出 wiki」；C 级小节标题改为「已移出 wiki」，表格第一列由短 wikilink 改为纯文本 slug；顶部引言与使用建议末条同步。
- **索引页**：`wiki/SkillHub/index.md` 本分类计数 14 → 7，功能范围描述与使用路径末条同步。
- **收尾一致性修正**：索引页「多Agent团队协作」章节引言仍残留 C 级 `pr-shepherd` 的卖点描述（「把 PR 监护到随时可合绿灯状态的自动化能力」），与已下架事实冲突，已改写为「编排框架的工程外壳已剥离，只保留可直接在 Codex 原生子代理上执行的多模型协作协议」。
- **死链修复**：3 份历史日志中 21 处指向已下架页面的失效 wikilink 改为指向 raw 归档稿的 Markdown 链接，涉及 `log/2026/10/10/0900-repair-skillhub-distill-pages.md`、`log/2026/10/09/1600-category-rename.md`、`log/2026/10/09/1500-metaswarm-skillhub.md`。
- **路径纠错**：首次用 apply_patch 创建 README 时误将文件写到仓库外层 `D:\work\AI-Wiki\raw\SkillHub\zh\metaswarm\README.md`，已删除该文件并逐层清理空目录，外层 `D:\work\AI-Wiki\raw` 恢复为原状（仅剩既有的 `cordis`）。

## 检查目的

- 确认 `wiki/SkillHub/skills/` 不再残留这 7 个 C 级页面，分类计数与实际页数一致。
- 确认全仓库不再存在指向这 7 个页面路径的 wikilink 死链。
- 确认归档稿内 wikilink、旧相对路径、wiki 标签均已清理，且相对链接目标真实存在。
- 确认误写到仓库外层的文件已彻底清除。

## 检查结果

- 7 个文件在 `wiki/SkillHub/skills/` 下均不存在；`raw/SkillHub/zh/metaswarm/` 下 7 个归档稿加 README 齐备。
- `rg "\[\[wiki/SkillHub/skills/(start|setup|status|migrate|create-issue|pr-shepherd|handling-pr-comments)\|"` 无命中。
- 归档稿内 `[[`、`../../../raw`、`tags:` 均无残留；`../../agents/skills/<slug>/SKILL.md` 目标均存在。
- 外层 `D:\work\AI-Wiki\raw\SkillHub` 已不存在，外层 `raw` 仅剩 `cordis`。
- **自查修正**：首次改写历史日志时把相对层级算成 3 层，实际 `log/YYYY/MM/DD/` 到仓库根需要 4 层。已将 `0900`、`1600`、`1500`、`1300` 四份日志中的 Markdown 链接由 `../../../` 修正为 `../../../../`，并用脚本按文件所在目录解析全部相对链接，结果 0 处 BROKEN。
- **独立评审**：评审子代理 Averroes（GLM-5.3-Flash, max）对 9 项断言逐条取证复核，全部 PASS、0 FAIL；主动反例搜索（frontmatter 残留、遗漏 wikilink、计数不一致、链接目标缺失）零命中，置信度约 95%。其提出的残留风险为两处解释性边界：分类页无显式数字计数（按活跃表条目数计）、`skills-lock.json` 仍保留 7 条指向 raw 源文件的注册项。
- **收尾复核补充**：评审断言覆盖计数、链接与 frontmatter，未覆盖索引页散文描述。收尾自查时发现并修正了上述引言残留（详见操作摘要末条），属评审范围之外的补充检查。

## 下次迭代方向

- 若上游 `dsifry/metaswarm` 更新，同步刷新 `raw/SkillHub/agents/skills/<slug>/SKILL.md` 英文原文与 `raw/SkillHub/zh/metaswarm/` 归档稿。
- 考虑在 `wiki/SkillHub/index.md` 维护准则中补一条：wiki 层页面下架并转入 raw 归档时，历史日志的 scope 链接需一并迁移，避免死链。
- raw 原始资料层目前尚无统一索引，后续如继续沉淀归档（如其它框架专有 skill），可评估是否需要在 `raw/SkillHub/` 下加一份索引。
