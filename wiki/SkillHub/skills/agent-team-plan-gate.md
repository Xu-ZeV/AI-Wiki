---
title: 方案对抗性审查门禁
skill: agent-team-plan-gate
category: 多Agent团队协作
category_slug: multi-agent-orchestration
source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-plan-gate/SKILL.md
tags:
  - SKILL
  - SKILL/multi-agent-orchestration
---
# 方案对抗性审查门禁

> [!info] Skill 元信息
> skill 名称：`agent-team-plan-gate`  
> 上游英文标题：Plan Review Gate  
> 功能分类：多Agent团队协作  
> 源文件：[SKILL.md](../../../raw/SkillHub/categories/multi-agent-orchestration/agent-team-plan-gate/SKILL.md)  
> 来源说明：由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw 原始资料层。

## 中文含义与用途

中文含义：任何实现方案呈报用户之前的 3 角色对抗性审查门禁。
核心用处：贯彻"**未经过独立对抗审视的方案，不得呈报用户**"这一原则。方案起草完成后，并行启动可行性、完整性、范围与对齐三位对抗评审员，各自为全新子代理实例，产出二元的 PASS / FAIL 结论并附证据。三者全 PASS 才可上呈；任一 FAIL 则由方案作者消化全部反馈后，交给**全新**评审实例复审，直到达成共识或触及迭代上限。

## 适用与不适用

- **适用**：实现方案被起草完成（由规划者、探索者或编排者产出）；方案需**至少 2 个工作单元或触及 3 个以上文件**才值得走门禁；用户显式要求对方案做评审。
- **不适用**：琐碎改动（单文件缺陷修复、文案修改、配置微调）。

## 核心方法论

### 三位对抗评审员

每位评审员只读代码库，输出二元 PASS / FAIL，只给结论不给改进建议。

#### Reviewer 1：Feasibility（可行性）——方案能否真的落地到真实代码库

| 检查项 | 分类 | 判定标准 |
| --- | --- | --- |
| 文件路径存在 | 伪造即 BLOCKING | 方案引用的每个文件路径都必须真实存在（用 glob/grep 验证） |
| 依赖顺序正确 | 循环依赖或前向引用即 BLOCKING | 工作单元只依赖已存在或先于它创建的东西 |
| 技术路线与代码库匹配 | 不兼容即 BLOCKING | 采用的模式、库与约定与代码库实际用法一致 |
| 无隐含假设 | 关键假设即 BLOCKING | 不得静默依赖不存在的服务、环境变量或基础设施 |
| 文件范围现实 | WARNING | 每个工作单元的文件规模可在不发生连锁改动的前提下完成 |

#### Reviewer 2：Completeness（完整性）——方案是否覆盖用户请求的每个方面

| 检查项 | 分类 | 判定标准 |
| --- | --- | --- |
| 全部需求已映射 | 存在缺口即 BLOCKING | 每条用户需求都至少对应一个方案条目 |
| 已定义验证步骤 | 缺失即 BLOCKING | 每项改动都有验证其生效的方式（测试、手动核对或断言） |
| 已考虑边界用例 | 明显缺口即 BLOCKING | 错误场景、空状态、边界条件均已覆盖 |
| 回滚 / 向后兼容 | WARNING | 方案考虑了改动需要回退时会怎样 |
| 跨文件集成点 | 缺失即 BLOCKING | 导入或依赖被改文件的其它文件已被纳入考虑 |

#### Reviewer 3：Scope & Alignment（范围与对齐）——方案是否与用户真实诉求匹配

| 检查项 | 分类 | 判定标准 |
| --- | --- | --- |
| 匹配用户请求 | 偏离即 BLOCKING | 方案解决的是被要求的问题，而非规划者更感兴趣的题目 |
| 无范围蔓延 | 存在即 BLOCKING | 没有请求之外的多余功能、抽象或重构 |
| 无范围不足 | 存在即 BLOCKING | 请求的显然推论没有被遗漏 |
| 复杂度相称 | WARNING | 方案复杂度与问题复杂度相称 |
| 无更简方案被忽略 | WARNING | 存在显著更简单且等效的做法时不算通过 |

> **判定原则**：只要命中任意一条 BLOCKING，整体即为 FAIL。拿不准时按 BLOCKING 处理。

### 评审员隔离规则（强制）

以下 5 条为强制规则，违反任意一条即本次评审无效：

1. **只用全新实例**：每位评审员都是新的子代理，从不复用，从不携带既有上下文。
2. **评审员之间互不可见**：任何评审员都不得看到另一位评审员的输出。
3. **代码库只读**：可读文件、可跑 grep/glob，但不得修改任何内容。
4. **复审不得携带历史发现**：迭代后的复审一律 spawn 全新实例，新评审员对上一轮的发现零知情。
5. **输入仅限**：方案正文、用户原始请求、代码库（通过只读工具）。

**为什么隔离如此重要**：看过旧发现的评审员会锚定在旧问题上，而非独立检索。全新实例可消除这种偏差，保证每一轮都是真正独立的检验。

### 工作流

```text
1. 方案起草完成
2. 并行 spawn 3 位对抗评审员（全新子代理实例）
3. 收集 3 份结论
4. 若全 PASS → 附带门禁通过摘要，把方案呈报用户
5. 若任一 FAIL →
   a. 方案作者阅读全部评审员的全部反馈
   b. 作者逐条 Fix（修改方案）或 Rebut（附证据说明该发现不成立）
   c. spawn 3 个全新评审实例（绝不复用）
   d. 回到第 3 步
6. 最多 3 轮 → 仍不通过则把方案连同遗留问题呈报用户决策
```

超过 3 轮未达成共识时的升级报告包含：三个维度的遗留阻塞项、迭代历史表（每轮的 Feasibility / Completeness / Scope 结果），以及四个可选项——**Override**（照原方案推进，遗留问题转为已知风险）/ **Revise**（继续人工迭代）/ **Simplify**（缩减争议范围）/ **Cancel**（放弃并按新起点重来）。

### 方案落盘

门禁通过**且用户批准**之后，必须把方案持久化到仓库内的一份 Markdown 文档（如 `docs/plans/active-plan.md`），并写入 `approved` 时间戳、`gate-iterations`、`user-approved: true`、`status: in-progress` 等元数据头。这样即使执行中途上下文被压缩，也能直接从磁盘恢复已批准方案，而无需重跑整个门禁。

### 反模式

| # | 反模式 | 为什么错 | 正确做法 |
| --- | --- | --- | --- |
| 1 | 复用评审实例，把上轮发现传下去 | 锚定偏差：评审员变成核对旧问题而非独立复查 | spawn 全新子代理实例，不带历史 |
| 2 | 交叉披露，把某位评审员的输出给另一位看 | 破坏独立性，评审员会趋同而不再各查各的 | 每位只可见方案、用户请求与代码库 |
| 3 | 把 FAIL 当建议——"评审没过但问题不大" | 等于取消门禁 | FAIL 即修订并复审，没有例外 |
| 4 | 以"这个方案很简单"为由跳过门禁 | 方案是否简单正是门禁要检验的 | 2 个以上工作单元或触及 3 个以上文件即走门禁 |
| 5 | 规划者自审 | 确认偏差，自己多半会批准自己 | 评审员必须是独立于规划者的全新子代理实例 |
| 6 | 无限迭代——"一直审到过为止" | 边际收益递减，3 轮后多半是方案本身有问题 | 最多 3 轮，随后携完整上下文升级用户 |
| 7 | 只重跑失败的那一位 | 修订后的方案可能让另两位也 FAIL | 每轮 3 位评审员全部以全新实例重跑 |

### 成功标准

- 三位评审员全部返回 PASS；
- 所有阻塞项均已携证据解决；
- 方案随门禁通过摘要一并呈报用户；
- 全程维持评审员隔离（全新实例、无交叉污染）；
- 门禁在 3 轮以内完成。

### 与其他门禁的关系

| 门禁 | 校验对象 | 评审阵容 | 裁决形式 |
| --- | --- | --- | --- |
| [[agent-team-design-gate]] | 设计文档（做什么） | 5 位专家：PM / Architect / Designer / Security / CTO | APPROVED / NEEDS_REVISION |
| 本门禁 | 实现方案（怎么做） | 3 位对抗评审员：Feasibility / Completeness / Scope & Alignment | PASS / FAIL |
| [[agent-team-orchestration]] | 是否被正确实现 | 每个工作单元一位全新对抗评审员 | PASS / FAIL |

三者是互补的不同阶段门禁：设计门禁验"做什么"，方案门禁验"怎么做"，编排执行验"是否真的做到了"。

## Codex 原生落地

### 授权前提

Codex 官方限制：除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理。把本协议写进 `AGENTS.md`，或让用户显式调用对应 skill，即构成授权。

### 可用模型

本机支持三个可用模型：

| 模型 | reasoning_effort 可选值 | 职能专长 |
| --- | --- | --- |
| `DeepSeek-V4.1-Flash`（256K 上下文） | low / medium / high / xhigh | 本地部署。代码边界、细致挑错、范围防蔓延（`xhigh`） |
| `ccs-glm-5-3-flash/GLM-5.3-Flash`（显示名 GLM-5.3-Flash，1M 上下文） | low / high / max | 本地部署。架构设计、需求完整性（1M 窗口全量通读） |
| `ccs-gmini/gemini-3.8-flash`（显示名 gemini-3.8-flash，1049K 上下文） | low / medium / high | CC-Switch 代理。技术可行性筛查、快速异构复核、高吞吐 |

子代理默认继承父代理模型，必须显式传 `model` 并严格解耦 `reasoning_effort`。三模型架构下达成 **100% 独立三方真异构对抗**。若云端代理离线，自动优雅降级为本地双模型多视角模式并如实标注。

子代理默认不带父会话历史（`fork_context=false`），每位评审员的 spawn prompt 必须自包含。

### spawn 参数示例

Reviewer 1（可行性，Gemini）：

```text
spawn_agent(
  message="你是对抗性方案评审员，只负责可行性维度。逐条检查以下方案：文件路径是否存在、依赖顺序是否正确、技术路线是否与代码库匹配、有无隐含假设、文件范围是否现实。输出二元 PASS/FAIL，只给结论与证据，不给改进建议。方案：<...>",
  model="ccs-gmini/gemini-3.8-flash",
  reasoning_effort="high"
)
```

Reviewer 2（完整性，GLM）：

```text
spawn_agent(
  message="你是对抗性方案评审员，只负责完整性维度。逐条检查以下方案是否覆盖用户请求的每个方面：需求映射、验证步骤、边界用例、回滚兼容、跨文件集成点。输出二元 PASS/FAIL，只给结论与证据。方案：<...>。用户原始请求：<...>",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="high"
)
```

Reviewer 3（范围与对齐，DeepSeek，不同 reasoning_effort）：

```text
spawn_agent(
  message="你是对抗性方案评审员，只负责范围与对齐维度。逐条检查以下方案：是否匹配用户请求、有无范围蔓延、有无范围不足、复杂度是否相称、有无更简方案被忽略。输出二元 PASS/FAIL，只给结论与证据。方案：<...>。用户原始请求：<...>",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="xhigh"
)
```

### 编排顺序

1. 方案起草完成后，**并行**发出 3 个 `spawn_agent` 调用（各自独立 prompt，互不引用彼此输出）。
2. **`wait_agent`** 收集全部 3 份结论。
3. 全 PASS → 把方案呈报用户。任一 FAIL → 方案作者消化反馈后修订方案。
4. **`close_agent`** 关闭本轮 3 位评审员。
5. 对修订后的方案，**重新并行 spawn 3 位全新评审实例**（绝不复用），回到第 2 步。
6. 最多 3 轮；仍不通过则携完整迭代历史升级用户决策。

## 中文 skill 文件

加载路径：`.agents/skills/agent-team-plan-gate/SKILL.md`（点开头目录不在 Obsidian 索引内，故以文本标注）。

## 相关 Skill

- [[agent-team-design-gate]]
- [[agent-team-orchestration]]
- [[agent-team-brainstorm]]
