---
title: 头脑风暴审查桥接扩展
skill: agent-team-brainstorm
category: 多Agent团队协作
category_slug: multi-agent-orchestration
source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-brainstorm/SKILL.md
tags:
  - SKILL
  - SKILL/multi-agent-orchestration
---
# 头脑风暴审查桥接扩展

> [!info] Skill 元信息
> skill 名称：`agent-team-brainstorm`  
> 上游英文标题：Brainstorming Extension - Mandatory Review Gate Bridge  
> 功能分类：多Agent团队协作  
> 源文件：[SKILL.md](../../../raw/SkillHub/categories/multi-agent-orchestration/agent-team-brainstorm/SKILL.md)  
> 来源说明：由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw 原始资料层。

## 中文含义与用途

中文含义：把头脑风暴接入 Codex 原生子代理质量流水线的强制桥接器。
核心用处：头脑风暴自带一个终态——"头脑风暴之后唯一要做的就是写方案"，这会造成流水线旁路，让未经审查的设计直接进入昂贵实现。本扩展在两者之间插入强制的设计审查门禁，把架构、安全与需求问题挡在编码之前。

**它是关键的工作流强制执行点，不是被动的扩展。**

## 适用与不适用

- **适用**：头脑风暴产出设计文档后、准备进入方案与实现阶段的场景；需要强制桥接设计审查门禁的编排流水线。
- **不适用**：没有经过头脑风暴的琐碎任务；设计与实现已在同一轮完成的一次性操作。

## 核心方法论

### 解决的核心问题

```text
没有本扩展（断裂流程）：
头脑风暴 → 提交设计文档 → 写方案（直接跳过审查！）
  → 编排执行 → 在未评审的设计上开始实现

有本扩展（正确流程）：
头脑风暴 → 提交设计文档
  → 强制设计审查门禁（5 个并行评审 Agent，全部 APPROVE）
  → 写方案 → agent-team-plan-gate → agent-team-orchestration
```

门禁不通过时回到设计迭代，最多 3 轮；3 轮后升级人类决策（Override / Defer / Cancel）。

### 强制执行是怎么落地的

frontmatter 里的 `auto_activate` 与 `triggers` 只是**元数据提示**——Codex 并不会自动强制它们。真正的约束来自两重冗余机制：

1. **AGENTS.md 模板（主）**：其中 "Workflow Enforcement (MANDATORY)" 章节明确写出"头脑风暴后 STOP → 运行设计审查门禁 → 等 5 个 Agent 全部 APPROVE → 才可继续"，这段指令随每次会话加载，优先级高于冲突的技能指令。
2. **本 skill 文档（参考）**：被加载时提供下面这套详细流程。

把协议写进 `AGENTS.md` 或调用对应 skill，即构成授权。

### 执行流程

1. **宣告门禁**：说明设计文档已提交，将启动 5 Agent 评审面板（产品经理 / 架构师 / 设计师 / 安全设计 / CTO）。
2. **调用设计审查门禁**：传入设计文档路径，并行拉起 5 个评审 Agent（见 [[agent-team-design-gate]]）。
3. **汇报结果**：
   - 全部 APPROVED → 输出结果表并给出下一步（写实现计划、过方案评审门禁、开始编排执行），询问是否继续。
   - 任一 NEEDS_REVISION → 列出 Blocking Issues 与待答问题，请用户修订设计文档后重跑（标注第 N 轮）。
4. **迭代或推进**：需要修订则协助改进后重跑（最多 3 轮）；3 轮失败后升级人类决策。

### 跳过条件

仅当三个条件同时成立才可跳过门禁：

- 用户明确要求跳过（"skip the review gate"）；
- 且 Agent 在跳过前与用户确认；
- 且设计确实简单（工作量 < 1 天、涉及文件 < 3 个）。

## Codex 原生落地

### 授权前提

Codex 官方限制：除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理。把本协议写进 `AGENTS.md`，或让用户显式调用对应 skill，即构成授权。

### 可用模型

本机可用模型只有两个：

| 模型 | reasoning_effort 可选值 |
| --- | --- |
| `DeepSeek-V4.1-Flash`（256K 上下文） | low / medium / high / xhigh |
| `ccs-glm-5-3-flash/GLM-5.3-Flash`（显示名 GLM-5.3-Flash，1M 上下文） | low / high / max |

子代理默认继承父代理模型，必须显式传 `model` 才是异构。**同模型只换 reasoning_effort 属于降级方案，不算真正异构评审。**

子代理默认不带父会话历史（`fork_context=false`），每次 spawn 的 prompt 必须自包含。

### spawn 参数示例

桥接器宣告门禁后，按设计审查门禁协议并行 spawn 5 个评审 Agent。以下展示其中两个角色的写法：

产品经理（DeepSeek）：

```text
spawn_agent(
  message="你是设计评审团中的产品经理。阅读以下设计文档，从用户用例、可度量收益、MVP 边界与成功标准角度评审，输出结构化 ReviewResult（verdict: APPROVED 或 NEEDS_REVISION，含 blockers/suggestions/questions）。设计文档：<...>",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="high"
)
```

安全设计（GLM，最高 reasoning_effort）：

```text
spawn_agent(
  message="你是设计评审团中的安全设计评审员。阅读以下设计文档，从认证授权信任边界、数据保护、服务端输入校验、API 安全与 OWASP Top 10 子集（A01/A02/A03/A04/A07）角度评审，输出结构化 ReviewResult（含 threat_model）。设计文档：<...>",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="max"
)
```

完整的五角色模型分配以 [[agent-team-design-gate]] 的「模型与角色分配」表为准：产品经理 / 设计师 / CTO 用 `DeepSeek-V4.1-Flash`（`high` / `high` / `xhigh`），架构师 / 安全设计用 `ccs-glm-5-3-flash/GLM-5.3-Flash`（`high` / `max`）。

### 编排顺序

1. 头脑风暴完成后，桥接器**宣告门禁**，确认设计文档路径。
2. **并行发出 5 个 `spawn_agent`** 调用（每个角色独立 prompt，互不引用彼此输出），显式传 `model`。
3. **`wait_agent`** 收集全部 5 份 ReviewResult。
4. 全 `APPROVED` → **`close_agent`** 关闭全部评审员，输出结果表并进入下一步（写方案 → 方案评审门禁 → 编排执行）。
5. 任一 `NEEDS_REVISION` → **`close_agent`** 关闭评审员，请用户修订设计文档后重跑（最多 3 轮）。
6. 3 轮后仍不通过则升级人类决策（Override / Defer / Cancel）。

## 中文 skill 文件

加载路径：`.agents/skills/agent-team-brainstorm/SKILL.md`（点开头目录不在 Obsidian 索引内，故以文本标注）。

## 相关 Skill

- [[agent-team-design-gate]]
- [[agent-team-plan-gate]]
- [[agent-team-orchestration]]
