---
title: 跨模型任务委托与对抗审查
skill: agent-team-external-cli
category: 多Agent团队协作
category_slug: multi-agent-orchestration
source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-external-cli/SKILL.md
tags:
  - SKILL
  - SKILL/multi-agent-orchestration
---
# 跨模型任务委托与对抗审查

> [!info] Skill 元信息
> skill 名称：`agent-team-external-cli`  
> 上游英文标题：External Tools Skill  
> 功能分类：多Agent团队协作  
> 源文件：[SKILL.md](../../../raw/SkillHub/categories/multi-agent-orchestration/agent-team-external-cli/SKILL.md)  
> 来源说明：由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw 原始资料层。

## 中文含义与用途

中文含义：在 Codex 原生子代理协作中，把实现与评审任务委托给**不同模型**的子代理。
核心用处：通过**跨模型对抗评审**消除单模型盲区。三条贯穿始终的原则是：**一次调用只干一件事**（子代理要么实现要么评审，绝不自我验证）、**最小权限**（prompt 自包含，只带该子代理完成任务所需的信息）、**编排者独立验证**（子代理只报告事实，通过与否由编排者判定）。

## 适用与不适用

- **适用**：需要跨模型评审消除盲区的场景；实现与评审需要不同模型视角的高风险改动；需要在编排流水线中委派独立子代理执行与审查的场景。
- **不适用**：单文件缺陷修复、文案调整等不需要对抗审查的琐碎任务；模型资源不足以支持真正异构评审的场景。

## 核心方法论

### 可用模型与路由

本机支持三个可用模型：

| 模型 | reasoning_effort 可选值 | 职能定位 |
| --- | --- | --- |
| `DeepSeek-V4.1-Flash`（256K 上下文） | low / medium / high / xhigh | 本地部署。主力代码实现、边界条件审查 |
| `ccs-glm-5-3-flash/GLM-5.3-Flash`（显示名 GLM-5.3-Flash，1M 上下文） | low / high / max | 本地部署。大上下文工程实现、架构与安全推演（`max`） |
| `ccs-gmini/gemini-3.8-flash`（显示名 gemini-3.8-flash，1049K 上下文） | low / medium / high | CC-Switch 代理。极速对抗审查、敏捷复核、真异构视角 |

路由原则：实现者与评审员**必须**使用不同模型；当只有两个模型时，第二个评审员只能与实现者或第一位评审员共享模型、通过不同 reasoning_effort 区分，属于降级方案。

### 四阶段工作流

1. **Phase 0 模型可用性确认**：确认两个模型的可用状态。子代理模型是 Codex 桌面版内置的，通常始终可用，但显示名与 reasoning_effort 组合需在 spawn 时验证。
2. **Phase 1 IMPLEMENT**：spawn 实现者子 Agent（模型 A），prompt 自包含（任务、验收标准、上下文、编码规范）。完成后只捕获事实（改动文件、diff 统计、耗时），**绝不采信实现者自述**。
3. **Phase 2 VALIDATE（永远由编排者执行）**：类型检查、Lint、全量测试、覆盖率检查（若项目存在覆盖率门禁则执行）、用 `git diff --name-only` 核对文件范围。**绝不通过实现者子 Agent 代跑。**
4. **Phase 3 ADVERSARIAL REVIEW（跨模型）**：spawn 评审员子 Agent（模型 B，与实现者不同），只传 spec、DoD 与 diff，不传实现者的自我评估。写代码的模型，永远由**另一个模型**来审。

| 实现者 | 评审员 1 | 评审员 2（第二轮复审） |
| --- | --- | --- |
| `DeepSeek-V4.1-Flash` | `ccs-gmini/gemini-3.8-flash` | `ccs-glm-5-3-flash/GLM-5.3-Flash` |
| `ccs-glm-5-3-flash/GLM-5.3-Flash` | `DeepSeek-V4.1-Flash` | `ccs-gmini/gemini-3.8-flash` |
| `ccs-gmini/gemini-3.8-flash` | `DeepSeek-V4.1-Flash` | `ccs-glm-5-3-flash/GLM-5.3-Flash` |

5. **Phase 4 COMMIT**：记录会话供自省 → 在提交信息中写入 DoD 验证结果。

### Prompt 文件格式与 token 预算

prompt 是编排者与子代理之间的核心接口，必须**自包含**（子代理看不到父会话历史与知识库）。固定小节：`# Task`、`## Acceptance Criteria`、`## Context`、`## Coding Standards`、`## Test Expectations`、`## Previous Attempt (if retry)`、`## Prior Model's Attempt (if escalation)`。

预算规则：优先级为改动文件 > 测试文件 > 导入 > 周边上下文；按模型上下文窗口截断；重试时只带评审反馈摘要而非上一轮完整输出；升级时只带前一个模型的分支 diff 摘要而非整条分支。

### 错误类型与编排者响应

| Error Type | 含义 | 编排者动作 |
| --- | --- | --- |
| `model_unavailable` | 模型不可用 | 跳过该模型，试下一个可用模型 |
| `rate_limited` | 触发限流 | 等待后重试（遵守 Retry-After） |
| `timeout` | 超出时间限制 | 加大超时重试一次，仍失败则跳过 |
| `context_too_large` | 输入超出上下文窗口 | 缩减上下文后重试 |
| `output_parse_error` | 输出格式错误 | 记录原始输出供排查，按失败处理 |

通用规则："跳过模型"指移到升级链中的下一个模型而不是中止任务；所有错误记入会话日志供自省；限流类错误按瞬时故障处理（退避 + 重试）。

### 反模式

| # | 反模式 | 为什么错 | 正确做法 |
| --- | --- | --- | --- |
| 1 | 采信子 Agent 自述（"测试全过了"） | 子 Agent 会幻觉、跳步或误读结果 | 编排者独立跑 Phase 2 验证；子 Agent 输出只含事实、不含裁决 |
| 2 | 跳过跨模型评审 | 单模型盲区正是本 skill 存在的理由 | Phase 3 必用不同模型做评审，跨模型评审是强制的 |
| 3 | 无超时运行 | 子 Agent 可能因限流或死循环卡住，未受监控的调用会阻塞整条流水线 | 一律用 `wait_agent` 并设置合理超时 |
| 4 | 传递完整父会话上下文 | 子代理默认 `fork_context=false`，把父历史硬塞进 prompt 会制造锚定偏差 | prompt 只带任务所需的自包含上下文 |
| 5 | 同模型只换 reasoning_effort 当作异构评审 | 同模型的知识盲区相同，换 reasoning_effort 无法真正消除盲区 | 必须显式传不同 `model` 才算真正异构 |

## Codex 原生落地

### 授权前提

Codex 官方限制：除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理。把本协议写进 `AGENTS.md`，或让用户显式调用对应 skill，即构成授权。

### 可用模型

本机支持三个可用模型：

| 模型 | reasoning_effort 可选值 | 职能定位 |
| --- | --- | --- |
| `DeepSeek-V4.1-Flash`（256K 上下文） | low / medium / high / xhigh | 本地部署。主力代码实现、边界条件审查 |
| `ccs-glm-5-3-flash/GLM-5.3-Flash`（显示名 GLM-5.3-Flash，1M 上下文） | low / high / max | 本地部署。大上下文工程实现、架构与安全推演（`max`） |
| `ccs-gmini/gemini-3.8-flash`（显示名 gemini-3.8-flash，1049K 上下文） | low / medium / high | CC-Switch 代理。极速对抗审查、敏捷复核、真异构视角 |

子代理默认继承父代理模型，必须显式传 `model` 才是异构。**同模型只换 reasoning_effort 属于降级方案，不算真正异构评审。**

子代理默认不带父会话历史（`fork_context=false`），每次 spawn 的 prompt 必须自包含。

### spawn 参数示例

实现者（DeepSeek）：

```text
spawn_agent(
  message="# Task\n实现 <task>。\n## Acceptance Criteria\n<...>\n## Context\n<...>\n## Coding Standards\n<...>\n## Test Expectations\n<...>",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="high"
)
```

评审员（GLM）：

```text
spawn_agent(
  message="你是对抗性代码评审员。对照以下 spec 与 DoD 逐条检查 diff，输出二元 PASS/FAIL，只给结论与 file:line 证据。Spec：<...>。DoD：<...>。Diff：<...>",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="high"
)
```

### 编排顺序

1. **spawn 实现者**（`model="DeepSeek-V4.1-Flash"`，`reasoning_effort="high"`），prompt 自包含。
2. **`wait_agent`** 等实现者完成。
3. 编排者**独立**跑类型检查、Lint、全量测试与覆盖率检查（若存在门禁），用 `git diff --name-only` 核对文件范围。
4. **spawn 对抗评审员**（`model="ccs-glm-5-3-flash/GLM-5.3-Flash"`，`reasoning_effort="high"`），只传 spec、DoD 与 diff。
5. **`wait_agent`** 收集评审结论。PASS → **`close_agent`** 关闭评审员。FAIL → **`close_agent`**，修复后回到第 3 步，再 spawn 全新评审员（最多 3 次）。
6. 全部通过后进入 Phase 4 提交。

## 中文 skill 文件

加载路径：`.agents/skills/agent-team-external-cli/SKILL.md`（点开头目录不在 Obsidian 索引内，故以文本标注）。

## 相关 Skill

- [[agent-team-orchestration]]
- [[agent-team-plan-gate]]
- [[agent-team-design-gate]]
