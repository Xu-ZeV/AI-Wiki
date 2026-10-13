---
title: 修复 Skill 页死链：raw 归档去掉点目录前缀，并让 skill 页脱离上游仓库
tags:
  - 日志
date: 2026-10-10
time: 14:40:00
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
  - "[orchestrated-execution 原始归档（新路径）](../../../../raw/SkillHub/categories/multi-agent-orchestration/orchestrated-execution/SKILL.md)"
  - "[metaswarm 中文归纳归档](../../../../raw/SkillHub/zh/metaswarm/README.md)"
---

# 修复 Skill 页死链：raw 归档去掉点目录前缀，并让 skill 页脱离上游仓库

## 操作时间

2026-10-10 14:40:00 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Iteration
- Lint

## 操作摘要

用户反馈两件事：skill 详情页里的「原始文件」链接点了跳不过去；这批 skill 已脱离 `dsifry/metaswarm`，要求去掉上游仓库行。

- **定位根因**：`wiki/SkillHub/skills/*.md` 的原始文件链接写作 `../../../raw/SkillHub/.agents/skills/<slug>/SKILL.md`，目标文件在磁盘上确实存在，但路径经过点开头的 `.agents` 目录。Obsidian 不索引点目录，因此这类链接永远无法跳转；对照组 `raw/SkillHub/vuejs-ai-skills/…`、`raw/SkillHub/impeccable/…` 等非点目录链接一直可用。旁证：`.obsidian/workspace.json` 中从未出现过任何点目录文件路径。
- **结构修复**：把 raw 归档根目录 `raw/SkillHub/.agents/` 整体改名为 `raw/SkillHub/agents/`（去掉点前缀），共 544 个文件原样迁移，上游 `.agents/skills/<slug>/` 安装布局改为 `raw/SkillHub/agents/skills/<slug>/`。
- **引用同步**：全仓替换 `raw/SkillHub/.agents/skills/` → `raw/SkillHub/agents/skills/`，以及归档稿内的相对链接 `../../.agents/skills/` → `../../agents/skills/`，共 32 个文件被改写，覆盖 wiki 详情页、`raw/SkillHub/zh/metaswarm/` 归档稿、项目内 `.agents/skills/` 中文 skill 正文与评审量规、以及历史日志。
- **页内死链改造**：项目内 `.agents/skills/<slug>/SKILL.md` 是 Codex 侧的可加载 skill 文件，必须保留点目录，Obsidian 无法跳转，因此 6 个 A 级详情页 + `visual-review` 详情页里指向它的 Markdown 链接改为代码文本「加载路径：…」，不再产生无法解析的链接节点。
- **脱离上游**：`brainstorming-extension`、`design-review-gate`、`external-tools`、`handoff`、`orchestrated-execution`、`plan-review-gate`、`visual-review` 七页元信息块中删除「上游仓库：dsifry/metaswarm」超链接行与「许可证：MIT」行，合并为一行来源说明：已脱离上游编排框架，改写为 Codex 原生子代理协作协议；MIT 许可仅适用于对应的 raw 原始资料。`visual-review` 开头「与 metaswarm 框架解耦」一句同步改为「已与上游编排框架解耦」。
- **准则补充**：`wiki/SkillHub/index.md` 维护准则新增三条链接边界（链接路径不得经过点目录；上游 `.agents/skills/` 布局在本仓库落盘为 `raw/SkillHub/agents/skills/`；指向点目录的真实路径写成代码文本）与一条维护检查项。

## 检查目的

- 确认 `wiki/SkillHub/skills/*.md` 的原始文件链接在改路径后能解析到真实存在的 raw 文件。
- 确认改名后全仓库不再残留指向 `raw/SkillHub/.agents/` 的引用。
- 确认 wiki 详情页不再包含无法解析的 Markdown 链接，且这些页面已不含上游仓库行。
- 确认改名未丢失文件、未影响其它分类的既有链接。

## 检查结果

- 改名后 `raw/SkillHub/agents/` 下文件数与改名前一致（544 个），`raw/SkillHub/.agents` 已不存在。
- 全仓（wiki / raw/SkillHub/zh / 项目内 .agents / log）相对链接扫描共 644 条，32 条 BROKEN 全部是历史遗留（raw 英文文档里的示例占位路径、早期已改名目录的旧引用），无一条属于本次改写；本次涉及的 40 余个文件 0 BROKEN。
- 残留检查：`raw/SkillHub/.agents` 字符组合在仓库中已无命中；`../../../agents/skills/…` 这类被批量替换误伤的旧链接已被页面改造覆盖，无残留。
- web 侧影响检查：新增可索引文件均为 Markdown 与附件，未引入与 wiki 页面同名的 `README` / `SKILL` / `CONTRIBUTING` 短链接，短 wikilink 仍唯一解析到 `wiki/SkillHub/skills/*`。

## 下次迭代方向

- 后续再手工或脚本导入上游 skill 时，落盘目录不要使用点开头的名字；本次已把该约束写进 `wiki/SkillHub/index.md` 维护准则。
- `raw/SkillHub/skills-lock.json` 仍保留 `source: dsifry/metaswarm` 与上游 `skillPath` 字段，这是 raw 层的来源登记，不是启用声明；若希望 wiki 层彻底不出现该仓库痕迹，可再评估是否改写登记文件。
- 若项目内 `.agents/skills/<slug>/SKILL.md` 需要长期可点击查看，可评估把这些可加载副本另存一份到 vault 可见目录，或改用 Obsidian 的外部链接协议。

## 追加记录：可加载 skill 文件同样脱离上游（同日 14:35）

- 操作时间：2026-10-10 14:35:00 +08:00
- 操作类型：Iteration
- 触发：用户回看 `wiki/SkillHub/skills/orchestrated-execution` 页面截图，指出「skill 链接还是跳转不过去」，并要求去掉 `dsifry/metaswarm` 这个仓库；截图反映的是本轮改造完成前的旧状态。

### 操作摘要

- 页面侧复核：改名后 `wiki/SkillHub/skills/*.md` 的「原始文件」链接已全部可解析，`wiki/SkillHub` 目录内 72 条相对链接扫描 0 BROKEN，无需再改路径。
- 数据文件侧收尾：项目内可加载的 7 个中文 skill 文件，frontmatter 里原本写 `author: dsifry/metaswarm` 与 `adapted_by: AI-Wiki`，现改为 `author: AI-Wiki`，并新增 `upstream_note` 一行，说明已脱离上游编排框架、MIT 许可溯源仅保留在 raw 原始资料层。涉及清单：
  - 磁盘路径：`.agents/skills/orchestrated-execution/SKILL.md`
  - 磁盘路径：`.agents/skills/external-tools/SKILL.md`
  - 磁盘路径：`.agents/skills/plan-review-gate/SKILL.md`
  - 磁盘路径：`.agents/skills/design-review-gate/SKILL.md`
  - 磁盘路径：`.agents/skills/brainstorming-extension/SKILL.md`
  - 磁盘路径：`.agents/skills/handoff/SKILL.md`
  - 磁盘路径：`.agents/skills/visual-review/SKILL.md`
  - 上述路径均为点开头目录，不在 Obsidian 索引内，故以文本标注而非链接。
- 正文措辞同步：`external-tools/SKILL.md` 末尾「原作：dsifry/metaswarm（MIT），本文件由 AI-Wiki 改造为 Codex 原生子代理版本。」改为「本文件由 AI-Wiki 改造为 Codex 原生子代理版本，已脱离上游编排框架；MIT 许可溯源见 raw 原始资料。」

### 复核结果

- `.agents/skills/*/SKILL.md` 中 `dsifry` 命中数归零。
- 7 个文件 frontmatter 结构一致，均为 `author: AI-Wiki` 开头、`upstream_note` 收尾，未破坏 Codex skill 加载所需的 `name` / `description` / `license` 字段。
- 有意保留：`raw/SkillHub/zh/metaswarm/` 归档稿的 `origin_repo` 与「上游仓库」行、`raw/SkillHub/skills-lock.json` 的 `source: dsifry/metaswarm` 登记，以及 `wiki/SkillHub/categories/multi-agent-orchestration.md` 正文里「本分类最初蒸馏自…已在本轮重构中剥离」的历史说明。这几处属 raw 原始资料层的准确溯源与设计决策叙述，不是 wiki 导航层的挂靠链接；若后续要求 wiki 层完全零出现，可再单独评估。

## 追加记录：清理 metaswarm 框架专有 skill 的 raw 落盘（同日 14:50）

- 操作时间：2026-10-10 14:50:00 +08:00
- 操作类型：Iteration
- 触发：用户询问 `raw/SkillHub/agents/skills/` 下放的是什么技能、是否都来自 metaswarm，并要求只保留刚汉化的几个，其余删掉。

### 调查结论

该目录是 skills CLI 的通用安装落盘位，共 17 个 slug、544 个文件，**并非全部来自 metaswarm**：

- 7 个已汉化且保留 wiki 页面：`brainstorming-extension`、`design-review-gate`、`external-tools`、`handoff`、`orchestrated-execution`、`plan-review-gate`、`visual-review`
- 7 个 metaswarm 框架专有（此前已从 wiki 下架，中文归纳稿在 `raw/SkillHub/zh/metaswarm/`）：`create-issue`、`handling-pr-comments`、`migrate`、`pr-shepherd`、`setup`、`start`、`status`
- 3 个非 metaswarm 来源：`guizang-ppt-skill`（op7418）、`html-ppt`（lewislulu）、`huashu-design`（alchaincyf），各自在 `wiki/SkillHub/skills/` 有独立页面

### 操作摘要

- 先校验 7 个目标的解析绝对路径均在 `raw/SkillHub/agents/skills/` 内，再逐目录删除 metaswarm 框架专有的 7 个 skill，共移除 72 个文件，`agents/skills/` 由 544 个文件降为 472 个。
- 英文原文删除后，`raw/SkillHub/zh/metaswarm/` 下 7 篇归纳稿的 `source_file` 字段改为 `source_note`，「原始文件：SKILL.md」链接改为文本说明，不再指向已删路径。
- `raw/SkillHub/zh/metaswarm/README.md` 的「英文原始文档」一行同步改为「已随框架专有 skill 一并移除，本目录的中文归纳稿是留存版本」。
- `raw/SkillHub/skills-lock.json` 移除这 7 个 slug 的登记项，条目数由 17 降为 10，JSON 仍可正常解析。
- 未删除 3 个非 metaswarm 来源的 skill：它们与本次「清理 metaswarm 残留」的目标无关，且在 wiki 有独立页面与历史日志引用。

### 复核结果

- `raw/SkillHub/agents/skills/` 剩余 10 个 slug：7 个已汉化 + 3 个非 metaswarm，共 472 个文件。
- 全仓扫描已无任何指向这 7 个已删 slug 的引用（`log/` 与 `raw/SkillHub/agents/` 自身除外）。
- 链接扫描覆盖 `wiki/SkillHub` + `raw/SkillHub/zh` + 本日日志共 364 条相对链接，20 条 BROKEN 全部位于 `raw/SkillHub/zh` 的其他历史子目录（`obsidian-wiki`、`taste-skills` 的示例占位路径），无一条来自本次改动的 `raw/SkillHub/zh/metaswarm/`。
- 待用户确认：`guizang-ppt-skill`、`html-ppt`、`huashu-design` 这 3 个非 metaswarm 的 skill 是否也要清理；按用户「是 metaswarm 的就处理」的条件，本轮未动它们。
