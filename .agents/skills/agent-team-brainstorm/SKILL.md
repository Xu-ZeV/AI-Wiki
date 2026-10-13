---
name: agent-team-brainstorm
description: 把头脑风暴/设计梳理流程强制接入设计评审门禁的桥接 skill：任何设计文档一旦产出，必须先跑完五角色评审并全部 APPROVED，才能进入计划与实施；触发关键词包括"头脑风暴完成""设计文档已提交""跳过评审"。
license: MIT
metadata:
  author: AI-Wiki
  version: "1.0.0"
  source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-brainstorm/SKILL.md
  adapted_for: Codex 原生子代理多模型协作
  upstream_note: 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw/SkillHub/zh/metaswarm/original-en/，MIT 许可
---

# 头脑风暴扩展 —— 强制评审门禁桥接

## 何时使用

以下任一情况发生时启用本 skill：

1. 头脑风暴/设计梳理环节产出了一份设计文档。
2. 设计文档被提交到 `docs/plans/*-design.md`。
3. 编排者在头脑风暴结束、准备进入计划阶段之前，需要一个强制检查点。
4. 用户说"跳过评审""直接开始实现"——此时本 skill 负责确认跳过条件是否成立。

**不适用场景**：琐碎改动不走门禁。若设计预计工作量不足 1 天、且只触及不到 3 个文件，则属于可以直接跳过评审的简单设计（见下文"跳过条件"）。只有当设计包含 **≥2 个工作单元** 或 **触及 ≥3 个文件** 时，本桥接才强制介入。

**授权说明**：调用本 skill 即视为用户已授权派子代理。官方默认规则要求"除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理"，本 skill 的显式调用满足该条件，桥接期间可以自由使用 `spawn_agent`。

## 目的

本 skill 把头脑风暴/设计梳理流程强制接入质量流水线：任何设计文档一旦创建，就必须先跑完设计评审门禁。没有这道桥接，头脑风暴会直接流入编写计划阶段，跳过五角色设计评审，从而让架构、安全和需求问题在昂贵的实施开始之前失去拦截机会。

**这是一个关键的工作流强制点，不是一个被动扩展。**

## 本 skill 解决的问题

上游的头脑风暴环节通常内置一个终止状态："头脑风暴之后唯一应该调用的环节是编写计划。"这就造成流水线旁路：

```text
没有本扩展时（错误流程）：

头脑风暴
    └── 提交设计文档
          └── 编写计划（直接进入——没有评审！）
                └── 执行计划
                      └── 在未经评审的设计上开始实施
```

```text
有本扩展时（正确流程）：

头脑风暴
    └── 提交设计文档
          │
          ▼
    ┌─────────────────────────────────────────┐
    │  强制设计评审门禁                        │
    │                                         │
    │  5 个并行评审（各自全新子代理实例）：     │
    │  • 产品经理（用例）                      │
    │  • 架构师（架构）                        │
    │  • 设计师（UX/API）                      │
    │  • 安全设计（威胁）                      │
    │  • CTO（TDD 就绪度）                     │
    │                                         │
    │  五者必须全部 APPROVED                   │
    └─────────────────────────────────────────┘
          │
          ▼
    全部 APPROVED？ ────否────► 迭代设计（最多 3 轮）
          │
         是
          │
          ▼
    编写计划 → 计划评审门禁 → 编排执行
```

## 强制机制如何生效

skill 自带的元数据触发标记只是提示，运行时不一定会自动执行。在 Codex 语境下，本强制点通过以下三重冗余机制落地：

### 1. 项目 `AGENTS.md` 约定（主要）

在项目的 `AGENTS.md` 中写入"工作流强制（必须）"一节，明确声明：

> 头脑风暴结束后：停下 → 运行设计评审门禁 → 等五位评审全部 APPROVED → 才可继续

该约定会随项目规则加载进每一次会话，并覆盖与之冲突的 skill 指令。

### 2. 编排者的阶段检查点（次要）

编排流程在进入计划阶段之前设置一个显式"强制交接"检查点：没有设计评审门禁的通过记录，不得进入编写计划环节。

### 3. 本 skill 文档（参考）

当本 skill 被加载（按名称调用或自动激活）时，它提供下述详细流程。

## 流程：头脑风暴完成之后

当上游环节提交了一份设计文档时：

### 第 1 步：宣告门禁

```markdown
## 设计评审门禁已激活

你的设计文档已提交。在进入实施之前，我会让它先通过五角色评审面板。

正在派发评审：
- 产品经理角色（用例/需求验证）
- 架构师角色（技术架构）
- 设计师角色（UX/API 设计）
- 安全设计角色（威胁建模/安全评审）
- CTO 角色（TDD 就绪度）
```

### 第 2 步：调用设计评审门禁

调用 `agent-team-design-gate` skill，并把设计文档路径传给它。它会在同一条消息里用 5 个 `spawn_agent` 调用并行派发全部五位评审，`fork_context=false`。

### 第 3 步：报告结果

**若全部 APPROVED：**

```markdown
## 设计评审门禁：通过

五位评审全部批准了你的设计！

| 评审角色 | 裁决 | 说明 |
| -------- | ---- | ---- |
| 产品经理 | APPROVED | 用例清晰，收益可度量 |
| 架构师 | APPROVED | 架构干净，遵循既有模式 |
| 设计师 | APPROVED | API 设计良好，错误状态清晰 |
| 安全设计 | APPROVED | 无高风险威胁，缓解措施到位 |
| CTO | APPROVED | TDD 规格齐全，可进入实施 |

异构度说明：本机仅有两个可用模型，存在同一模型被多个角色使用的情况，属于多视角而非完全异构。

### 后续步骤
1. 为该特性创建实施任务
2. 创建实施计划
3. 让计划通过计划评审门禁（3 位对抗式评审）
4. 为隔离开发建立独立工作区
5. 开始编排执行

是否继续？[是 / 否]
```

**若任一 NEEDS_REVISION：**

```markdown
## 设计评审门禁：需要修订

部分评审发现了必须处理的问题。

### BLOCKING 问题
[按角色列出问题]

### 需要回答的问题
[列出问题]

---

请修订设计文档，我会重跑评审门禁。
（第 1 轮 / 共 3 轮）
```

### 第 4 步：迭代或继续

- 若 NEEDS_REVISION：协助用户处理问题，重跑门禁（最多 3 轮）。
- 若全部 APPROVED：进入计划阶段。
- 3 轮仍未通过：升级为人类决策（覆盖 / 搁置 / 取消）。

## Codex 原生落地

### 编排顺序

1. **确认设计定稿**：拿到设计文档路径与正文，以及用户的原始请求。
2. **宣告门禁**：按第 1 步输出宣告，让用户知道接下来会发生什么。
3. **转交设计评审门禁**：调用 `agent-team-design-gate`，由它在同一条消息里派发 5 个全新子代理。
4. **汇总并报告**：等待 5 个 target 全部结束，按第 3 步格式报告。
5. **迭代或放行**：NEEDS_REVISION 时先 `close_agent` 关闭旧实例，再对修订稿派发全新实例；最多 3 轮。
6. **收尾**：全部通过或达到上限后，`close_agent` 关闭仍在运行的评审实例。

### `spawn_agent` 参数要点

本 skill 自身通常不直接派发子代理，而是把控制权交给 `agent-team-design-gate`。若需要在此处直接派发，参数与 `agent-team-design-gate` 一致：

- `message`：必须自包含（设计文档正文 + 用户原始请求 + 评审角色 + 输出格式）。
- `model`：在 `DeepSeek-V4.1-Flash` 与 `ccs-glm-5-3-flash/GLM-5.3-Flash` 之间交错分配。
- `reasoning_effort`：常规角色用 `high`；安全设计可用 GLM 的 `max`；CTO 可用 DeepSeek 的 `xhigh`。不要给 GLM 传 `xhigh`、不要给 DeepSeek 传 `max`。
- `fork_context=false`：保证评审是干净起点，满足隔离规则。

### 编排顺序示例

```text
# 头脑风暴产出设计文档后：
design_doc = "docs/plans/<feature>-design.md"
user_request = "<用户原始请求>"

# 转交设计评审门禁，由它派发 5 个全新实例：
pm   = spawn_agent(message=产品经理提示词, model="DeepSeek-V4.1-Flash", reasoning_effort="high", fork_context=false)
arch = spawn_agent(message=架构师提示词,   model="ccs-glm-5-3-flash/GLM-5.3-Flash", reasoning_effort="high", fork_context=false)
ux   = spawn_agent(message=设计师提示词,   model="DeepSeek-V4.1-Flash", reasoning_effort="high", fork_context=false)
sec  = spawn_agent(message=安全设计提示词, model="ccs-glm-5-3-flash/GLM-5.3-Flash", reasoning_effort="max", fork_context=false)
cto  = spawn_agent(message=CTO 提示词,     model="DeepSeek-V4.1-Flash", reasoning_effort="xhigh", fork_context=false)
results = wait_agent(targets=[pm, arch, ux, sec, cto], timeout_ms=900000)

# NEEDS_REVISION 时，先关闭再重新派发（不带历史发现）
close_agent(pm); close_agent(arch); close_agent(ux); close_agent(sec); close_agent(cto)
```

## 反模式

| # | 反模式 | 为什么错 | 正确做法 |
| --- | --- | --- | --- |
| 1 | **把元数据触发标记当自动执行**——以为写了触发条件就一定会跑 | 运行时不一定读取这些标记，门禁会被静默跳过 | 在 `AGENTS.md` 里写明强制约定，并设置显式阶段检查点 |
| 2 | **静默跳过门禁**——"设计很简单，我直接写计划" | 判断简单与否正是门禁要做的 | 若判定简单，明说理由与跳过条件，并取得用户确认 |
| 3 | **把评审发现传给下一轮** | 锚定偏差，破坏独立性 | 每轮派发全新 `spawn_agent` 实例，不带历史发现 |
| 4 | **只重跑失败的评审** | 其他评审也可能在修订稿上失败 | 每轮对全部 5 位评审重新派发全新实例 |
| 5 | **无限迭代** | 收益递减，3 轮后往往说明设计有根本问题 | 最多 3 轮，然后带上完整上下文升级给用户 |
| 6 | **把多实例当多模型**——声称"五路异构评审" | 同一模型的多实例不是异构，只是多视角 | 如实标注异构度受限于本机只有两个模型 |
| 7 | **绕开流水线直接实现**——跳过计划评审门禁 | 设计通过不等于计划可行 | 设计通过后仍要跑计划评审门禁（3 位对抗式评审） |

## 跳过条件

评审门禁**只**在以下条件全部满足时才能跳过：

- 用户明确要求跳过（"跳过这次评审门禁"）。
- 且 agent 在跳过前与用户再次确认。
- 且设计确实简单（工作量不足 1 天、只触及不到 3 个文件）。

## 相关 skill

- `agent-team-design-gate` —— 五角色评审的具体实现，本 skill 桥接的目标。
- `agent-team-plan-gate` —— 流水线中的下一个门禁（在编写计划之后）。

## 血缘与许可

本 skill 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作。英文原件归档于 [raw/SkillHub/zh/metaswarm/original-en/brainstorming-extension/](../../../raw/SkillHub/zh/metaswarm/original-en/brainstorming-extension/SKILL.md)，采用 MIT 许可。
