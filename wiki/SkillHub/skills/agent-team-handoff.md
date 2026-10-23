---
title: 零上下文损耗会话交接
skill: agent-team-handoff
category: 多Agent团队协作
category_slug: multi-agent-orchestration
source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-handoff/SKILL.md
tags:
  - SKILL
  - SKILL/multi-agent-orchestration
---
# 零上下文损耗会话交接

> [!info] Skill 元信息
> skill 名称：`handoff`  
> 上游英文标题：Handoff Skill  
> 功能分类：多Agent团队协作  
> 源文件：[SKILL.md](../../../raw/SkillHub/categories/multi-agent-orchestration/agent-team-handoff/SKILL.md)  
> 来源说明：由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw 原始资料层。

## 中文含义与用途

中文含义：会话交接（Handoff）——把「一个完全没有前情上下文的新 Agent」恢复工作所需的全部信息固化下来。
核心用处：分析当前会话，把目标、完成标准、当前状态、必读清单、关键决策、验证方式与下一步动作写进一份自包含的 Markdown 文档，并只留下一句无歧义的口令：

> **Read `docs/handoffs/<file>.md` and do `<the next concrete action>`.**

触发场景：会话即将结束、上下文即将被压缩、切换机器或会话，或用户明确提出交接请求。目标是**零上下文损耗**——接收方只读一个文件就能正确行动。

## 适用与不适用

- **适用**：会话即将结束或上下文即将被压缩；需要把任务从一个会话/子代理迁移到另一个；用户明确要求交接；编排流水线中需要把状态持久化以供恢复。
- **不适用**：任务已经完成且无需续跑；不需要持久化状态的琐碎一次性操作。

## 核心方法论

### 输出契约

本 skill 严格只产出两样东西：

1. **一份交接文档**，路径为 `docs/handoffs/handoff-<YYYY-MM-DD-HHmm>.md`（目录不存在则创建）。文档必须自包含，链接或直接引用下一个 Agent 需要读的每一份材料。
2. **一句收尾口令**，且在文档写完后不得再有任何其他内容，形式固定为：

```text
Read docs/handoffs/handoff-2026-06-17-1432.md and do <YYY>.
```

其中 `<YYY>` 必须是**一个具体的、可立即执行的下一步动作**（祈使句，而非模糊主题）。

| 质量 | 示例 |
| --- | --- |
| 合格 | 在 `src/config.ts:84` 实现 `parseConfig` 校验，并让 `tests/config.test.ts` 通过 |
| 不合格 | 「继续之前的工作」/「看看 config 那块」 |

这句口令是用户交给下一个 Agent 的凭据；文档才是让这句口令安全可执行的前提。

### 八步方法

| # | 步骤 | 关键动作 |
| --- | --- | --- |
| 1 | 重建任务本体 | 明确 Objective（一到两句话）、Definition of Done（可验证验收标准）、Why（动机，避免重开已决事项）。来源：用户原始请求、设计与方案文档、会话脉络。 |
| 2 | 装载持久化状态 | 读取仓库内的持久化方案文档与执行状态文档（若存在），汇总并链接，不重复粘贴。若存在活动方案，必须显式指向并说明当前进行到哪个工作单元/阶段。 |
| 3 | 确认当前状态 | 诚实区分四类：**已完成且有证据**（测试通过、构建绿色、commit SHA）/ **已完成但未验证** / **进行中**（正做到哪、为何停下）/ **尚未开始**。并记录工作区实况：`git branch --show-current`、`git status --short`、`git log --oneline -10`、`git diff --stat`，注明未提交改动、stash 与分支是否已推送。 |
| 4 | 列出必读清单 | 对下一 Agent 动工前必须读的每一份材料，说明**为什么读**与**看什么**。扫描类别：规格、设计文档、方案、代码（具体文件与 `file:line` 锚点）、测试（定义正确性的用例）、配置与门禁。优先给出精确指针（`src/foo.ts:120-145`）而非整文件引用；短而关键的片段直接引用进文档。 |
| 5 | 决定唯一下一步（YYY） | 选取最重要、最具体的一步，须满足：**可执行**（立即可动手）、**具体**（点名文件、函数或 DoD 条目）、**有界**（只是下一步，非全部剩余路线图；其余放进「剩余工作」）。 |
| 6 | 撰写文档 | 按下方十节模板创建 `docs/handoffs/handoff-<YYYY-MM-DD-HHmm>.md`，每节都要填写；确实不适用的写 `None` 而非删除该节。 |
| 7 | 输出交接口令 | 写完并自检（第 8 步）后，只输出那一行口令：确切的文件路径 + 具体动作，之后不得再追加任何评论。 |
| 8 | 交接前自检 | 以「一无所知的接收方」自查：能否只靠本文档开工？引用的路径是否真实（用 `ls`/`git` 抽查）？下一步是否无歧义且可立即开始？决策与理由是否已记录以免被推翻？质量门禁（测试、覆盖率、lint、构建命令）是否写明？收尾句是否点名确切文件与具体动作？ |

### 交接文档十节模板

| # | 小节 | 内容要求 |
| --- | --- | --- |
| 1 | Objective | 一到两句话说明在做什么、为什么 |
| 2 | Definition of Done | 可验证的验收标准清单 |
| 3 | Current Status | 已完成且有证据 / 已完成未验证 / 进行中（停在哪）/ 尚未开始，并附工作区纪实（分支、是否推送、未提交改动、近期 commit） |
| 4 | Required Reading | 表格：路径或引用 / 为何重要 / 重点看什么 |
| 5 | Key Decisions & Rationale | 已定决策及其理由与被否决的备选，标注「无正当理由不得推翻」 |
| 6 | Code Map | 关键 `file:line` 及其在本任务中的角色；可仿效的模式文件 |
| 7 | How to Verify | 测试、覆盖率、lint/构建命令，以及「绿色」的表现 |
| 8 | Open Questions / Blockers | 待用户回答的问题或外部依赖，没有则写 `None` |
| 9 | Next Action | 唯一的下一步（YYY）展开说明 |
| 10 | Remaining Work | 下一步之后的后续步骤序列 |

文档头部固定写明 `Date` / `Branch` / `Author session` 等元信息。

### 七条反模式

1. **下一步含糊**——「接着之前继续」毫无用处，必须点名文件与改动。
2. **假设共享记忆**——下一 Agent 没有任何前情；凡重要而未写进文档的，即已丢失。
3. **倾倒会话记录**——要综合提炼，40 行有导向的摘要胜过 4000 行粘贴。
4. **指针过期**——引用路径与行号前先核实其真实存在，代码可能已经移位。
5. **隐瞒未提交状态**——必须披露脏工作区、stash 与未推送的提交。
6. **出现多个「结束句」**——只能输出一行 `Read <file> and do <action>.`
7. **决策静默丢失**——凡已做出并敲定的选择，都要连理由一并记录，避免被重新翻案。

## Codex 原生落地

### 授权前提

Codex 官方限制：除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理。把本协议写进 `AGENTS.md`，或让用户显式调用对应 skill，即构成授权。

### 可用模型

本机支持三个可用模型：

| 模型 | reasoning_effort 可选值 | 职能定位 |
| --- | --- | --- |
| `DeepSeek-V4.1-Flash`（256K 上下文） | low / medium / high / xhigh | 本地部署。代码实现、边界条件、工程底线（`xhigh`） |
| `ccs-glm-5-3-flash/GLM-5.3-Flash`（显示名 GLM-5.3-Flash，1M 上下文） | low / high / max | 本地部署。系统架构设计、安全推演（`max`）、需求完整性 |
| `ccs-gmini/gemini-3.8-flash`（显示名 gemini-3.8-flash，1049K 上下文） | low / medium / high | CC-Switch 代理。敏捷需求、交互设计、可行性审查、快速复核 |

子代理默认继承父代理模型，必须显式传 `model` 并严格解耦 `reasoning_effort`。三模型架构下达成跨厂商真异构协同；若云端代理不可用，自动平滑降级为本地双模型多视角模式并如实标注。

子代理默认不带父会话历史（`fork_context=false`），每次 spawn 的 prompt 必须自包含。

### spawn 参数示例

父代理完成交接文档后，spawn 接收方子 Agent 恢复工作：

```text
spawn_agent(
  message="Read docs/handoffs/handoff-2026-06-17-1432.md and do <具体下一步动作>。",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="high"
)
```

用不同模型恢复（GLM）：

```text
spawn_agent(
  message="Read docs/handoffs/handoff-2026-06-17-1432.md and do <具体下一步动作>。",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="high"
)
```

### 编排顺序

1. 父代理分析当前会话，按八步方法撰写交接文档并落盘。
2. 父代理输出一行交接口令后结束或转入编排角色。
3. **spawn 接收方子 Agent**（显式传 `model`），prompt 即那一行口令（口令已含文件路径与动作，自包含）。
4. **`wait_agent`** 等接收方完成恢复后的下一步动作。
5. 接收方完成后 **`close_agent`** 关闭子 Agent。
6. 若需要再次交接，接收方变为新父代理，回到第 1 步。

## 中文 skill 文件

加载路径：`.agents/skills/agent-team-handoff/SKILL.md`（点开头目录不在 Obsidian 索引内，故以文本标注）。

## 相关 Skill

- [[agent-team-orchestration]]
- [[agent-team-plan-gate]]
- [[agent-team-design-gate]]
