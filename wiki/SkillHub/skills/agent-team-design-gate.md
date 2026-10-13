---
title: 设计多角色审查门禁
skill: agent-team-design-gate
category: 多Agent团队协作
category_slug: multi-agent-orchestration
source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-design-gate/SKILL.md
tags:
  - SKILL
  - SKILL/multi-agent-orchestration
---
# 设计多角色审查门禁

> [!info] Skill 元信息
> skill 名称：`agent-team-design-gate`  
> 上游英文标题：Design Review Gate  
> 功能分类：多Agent团队协作  
> 源文件：[SKILL.md](../../../raw/SkillHub/categories/multi-agent-orchestration/agent-team-design-gate/SKILL.md)  
> 来源说明：由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw 原始资料层。

## 中文含义与用途

中文含义：设计文档完成后的五角色并行评审质量门禁。
核心用处：头脑风暴产出设计文档后触发，避免带着架构缺陷进入编码阶段。门禁并行启动 5 位职责明确的设计评审 Agent，全员给出 `APPROVED` 才可转入实现；任一方返回 `NEEDS_REVISION` 则退回设计修订。

## 适用与不适用

- **适用**：头脑风暴产出设计文档后；设计文档被提交后需要评审的场景；用户显式要求对设计文档做多角色评审。
- **不适用**：琐碎改动（单文件缺陷修复、文案修改、配置微调）；没有设计文档的任务。

## 核心方法论

### 五角色评审团

| Agent | 评审视角 | 附加输出 |
| --- | --- | --- |
| Product Manager（产品经理） | 用例是否遵循 WHO / WANTS / SO THAT / WHEN 格式、用户收益是否可度量、MVP 边界与成功标准是否用户导向 | `use_case_analysis`：用例总数、清晰数、待改数、缺失场景 |
| Architect（架构师） | 是否遵循既有代码库模式、服务放置是否正确、依赖方向、API 契约、错误处理、性能、集成点与重复功能 | — |
| Designer（设计师） | API/接口的直觉性与参数命名一致性、用户流程与边界状态、开发者体验（类型设计、可 mock 程度、文档完整度） | — |
| Security Design（安全设计） | 认证与授权信任边界、数据保护与 PII 加密、服务端输入校验、API 安全（限流、暴力破解、IDOR）、**OWASP Top 10 子集** | `threat_model`：high_risk / medium_risk / mitigations_required |
| CTO | TDD 就绪度（测试规格、RED-GREEN-REFACTOR 周期、边界用例枚举、mock 基础设施）、代码库对齐、完整性、风险与依赖 | — |

安全评审采用的是 **OWASP Top 10 子集**，只覆盖 A01 越权访问控制、A02 加密失败、A03 注入、A04 不安全设计、A07 认证失败五项，并非 STRIDE 威胁建模；`threat_model` 也只是风险清单，不是 STRIDE 分类。

### 触发条件

1. 设计文档被起草完成并提交；
2. 头脑风暴 skill 执行完成；
3. 用户显式要求对设计文档做评审。

### 四阶段工作流

1. **Phase 1 并行 spawn 评审 Agent**：一次性启动 5 个全新子代理实例，分别注入产品经理 / 架构师 / 设计师 / 安全设计 / CTO 评审 prompt。
2. **Phase 2 聚合结果**：收集 5 份结构化 `ReviewResult`。
3. **Phase 3 判定门禁**：5 票全 `APPROVED` → 进入实现阶段；否则整合反馈 → 呈报用户 → 修订设计 → 重跑门禁（**最多 3 轮**）。
4. **Phase 4 人类升级**：3 轮迭代仍不通过时，汇总残余阻塞项，请人类在 Override / Defer / Revise / Cancel 中决策。

### ReviewResult 结构

```typescript
interface ReviewResult {
  agent: "product-manager" | "architect" | "designer" | "security-design" | "cto";
  verdict: "APPROVED" | "NEEDS_REVISION";
  blockers: string[];    // 实现前必须修复
  suggestions: string[]; // 可选改进
  questions: string[];   // 需要澄清的问题
  use_case_analysis?: { /* 仅产品经理 */ };
  threat_model?: { /* 仅安全设计 */ };
}
```

裁决口径固定为 `APPROVED` / `NEEDS_REVISION` 两种，不存在 APPROVE / REQUEST_CHANGES 之类的第三种写法。

### 迭代与升级协议

| 轮次 | 动作 |
| --- | --- |
| Round 1 初次评审 | 并行 spawn 5 位评审；全 APPROVED 则放行，否则整合呈报 |
| Round 2-3 修订循环 | 呈报表决结果 → 人类修订设计文档 → 对更新后的文档重跑全部 5 位评审 |
| Round 4 升级 | 3 轮后仍有阻塞项时输出升级报告，请人类选择 Override（记录技术债）/ Defer / Revise / Cancel |

### 输出格式

- **通过**：`## Design Review Gate: APPROVED` 表格（Agent / Verdict / Blockers / Suggestions 四列）+ 安全威胁模型摘要 + 非阻塞建议清单 + Next Steps。
- **需修订**：`## Design Review Gate: NEEDS REVISION` 表格 + 按 Agent 分组的阻塞问题 + 威胁模型 + 待澄清问题 + `Iteration: N of 3`。

### 成功标准

- 5 位 Agent 全部返回 `APPROVED`；
- 所有阻塞问题已解决、所有澄清问题已答复；
- 设计文档已按修订更新；
- 安全威胁模型已复核且缓解措施到位；
- 具备进入实现阶段的条件。

### 与其他 Skill 的关系

- 本门禁校验**设计文档**（做什么），采用 5 位专家 + `APPROVED` / `NEEDS_REVISION` 裁决，详见 [[agent-team-plan-gate]] 中的对照说明。
- [[agent-team-orchestration]] 负责把方案正确实现。
- [[agent-team-brainstorm]] 负责把头脑风暴输出强制桥接到本门禁。

## Codex 原生落地

### 授权前提

Codex 官方限制：除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理。把本协议写进 `AGENTS.md`，或让用户显式调用对应 skill，即构成授权。

### 可用模型

本机可用模型只有两个：

| 模型 | reasoning_effort 可选值 |
| --- | --- |
| `DeepSeek-V4.1-Flash`（256K 上下文） | low / medium / high / xhigh |
| `ccs-glm-5-3-flash/GLM-5.3-Flash`（显示名 GLM-5.3-Flash，1M 上下文） | low / high / max |

子代理默认继承父代理模型，必须显式传 `model` 才是异构。**同模型只换 reasoning_effort 属于降级方案，不算真正异构评审。**只有两个模型时，5 个角色中必然有多个角色共享同一模型、通过不同 reasoning_effort 区分，属于降级方案。

子代理默认不带父会话历史（`fork_context=false`），每位评审员的 spawn prompt 必须自包含（设计文档正文 + 用户原始请求 + 评审角色说明）。

#### 模型与角色分配

| 评审角色 | `model` | `reasoning_effort` |
| --- | --- | --- |
| 产品经理 | `DeepSeek-V4.1-Flash` | `high` |
| 架构师 | `ccs-glm-5-3-flash/GLM-5.3-Flash` | `high` |
| 设计师 | `DeepSeek-V4.1-Flash` | `high` |
| 安全设计 | `ccs-glm-5-3-flash/GLM-5.3-Flash` | `max` |
| CTO | `DeepSeek-V4.1-Flash` | `xhigh` |

不要给 GLM 传 `xhigh`、不给 DeepSeek 传 `max`。

### spawn 参数示例

产品经理（DeepSeek）：

```text
spawn_agent(
  message="你是设计评审团中的产品经理。阅读以下设计文档，从用户用例、可度量收益、MVP 边界与成功标准角度评审，输出结构化 ReviewResult（verdict: APPROVED 或 NEEDS_REVISION，含 blockers/suggestions/questions）。设计文档：<...>",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="high"
)
```

架构师（GLM）：

```text
spawn_agent(
  message="你是设计评审团中的架构师。阅读以下设计文档，从代码库模式、服务放置、依赖方向、API 契约、错误处理、性能与集成点角度评审，输出结构化 ReviewResult。设计文档：<...>",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
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

### 编排顺序

1. 设计文档完成后，**并行**发出 5 个 `spawn_agent` 调用（各自独立 prompt，互不引用彼此输出）。
2. **`wait_agent`** 收集全部 5 份 ReviewResult。
3. 全 `APPROVED` → **`close_agent`** 关闭全部评审员，进入实现阶段。任一 `NEEDS_REVISION` → 整合反馈呈报用户，修订设计。
4. 对修订后的设计，**重新并行 spawn 5 位全新评审实例**（绝不复用），回到第 2 步。
5. 最多 3 轮；仍不通过则携完整迭代历史升级用户决策。

## 中文 skill 文件

加载路径：`.agents/skills/agent-team-design-gate/SKILL.md`（点开头目录不在 Obsidian 索引内，故以文本标注）。

## 相关 Skill

- [[agent-team-brainstorm]]
- [[agent-team-plan-gate]]
- [[agent-team-orchestration]]
