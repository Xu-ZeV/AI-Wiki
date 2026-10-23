---
title: 四阶段原生子代理编排闭环
skill: agent-team-orchestration
category: 多Agent团队协作
category_slug: multi-agent-orchestration
source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-orchestration/SKILL.md
tags:
  - SKILL
  - SKILL/multi-agent-orchestration
---
# 四阶段原生子代理编排闭环

> [!info] Skill 元信息
> skill 名称：`agent-team-orchestration`  
> 上游英文标题：Orchestrated Execution Skill  
> 功能分类：多Agent团队协作  
> 源文件：[SKILL.md](../../../raw/SkillHub/categories/multi-agent-orchestration/agent-team-orchestration/SKILL.md)  
> 来源说明：由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw 原始资料层。

## 中文含义与用途

中文含义：Codex 原生子代理协作中的核心生产执行引擎——围绕工作单元（Work Unit）的四阶段编排执行闭环。
核心用处：贯彻"**Trust nothing. Verify everything. Review adversarially.**（不盲信、全验证、对抗性审查）"原则，用「实现 → 独立验证 → 对抗审查 → 提交」的刚性循环，取代"模型写完代码即默认成功"的线性流程。

## 适用与不适用

- **适用**：可拆成多个工作单元的复杂任务；带 Written Spec 与 Definition of Done（DoD）条目的任务；多 Agent 编排中需要对子 Agent 产出做验证的场景；自述"它能跑"不足以采信的高风险改动。
- **不适用**：单文件缺陷修复、文案调整，或任何没有 spec 的任务。

## 核心方法论

### 方案预检（Plan Validation）

在把方案提交设计评审门禁之前，编排者必须先逐项核对预检清单，避免在根本性缺陷的方案上浪费昂贵的评审轮次。

| 清单类别 | 代表性检查项 |
| --- | --- |
| Architecture | 数据访问一律经服务层（路由/处理器不直连数据库）；每个工作单元单一职责（约 ≤ 5 个文件）；错误处理策略明确（类型化错误层级、跨层传递方式）；无硬编码配置（外部服务配置一律走环境变量） |
| Dependency Graph | 每个 WU 依赖最小化；可并行的 WU 不被串行化；无循环依赖；存在把组件接入应用外壳的集成 WU（而不是把组件孤立地造出来） |
| API Contract | 每个 HTTP 端点写明 method、path、请求 Schema、全部响应状态码与错误响应结构；WebSocket 双向消息类型表齐全；协议关注点（心跳、重连、确认策略）已记录；响应码显式（写"返回 201 与创建后的 todo"，而不是"返回 todo"） |
| Security | 信任边界已识别；每个端点的输入校验（Schema、最大体积）已指定；昂贵操作（AI API 调用、文件上传）已指定限流；认证授权要求已记录；密钥管理已记录（.env 模式并核对 .gitignore） |
| UI/UX | 用户流程含触发、步骤与可见结果；每个界面有文字线框图；空态、加载态、错误态已定义；显式建立把组件接入应用外壳的集成 WU；组件层级已记录 |
| External Dependencies | 全部外部服务已识别；所需凭证与配置（环境变量名、获取方式）已记录；依赖外部服务的 WU **之前**安排了人类检查点；缺少凭证时的优雅降级已指定；`.env.example` 覆盖全部必需变量 |
| Completeness | spec 中的人类检查点全部纳入；spec 中的每个特性至少对应一个 WU；工具链一致（同一包管理器、配置文件匹配）；没有 WU 超过约 5 个文件或约 3 项关注点；过大的 WU 已拆分并建立显式依赖 |

**任何一项不通过，都要先修方案，再提交设计评审门禁。**

方案还必须包含以下必需小节：Work Unit Decomposition（含 DoD、文件范围、依赖）、API Contract（如适用）、Security Considerations（信任边界、输入校验表、限流表、密钥管理）、User Flows（如有 UI，含文字线框图与交互流程）、External Dependencies、Human Checkpoints。

> 注意：Codex 原生子代理默认不带父会话历史（`fork_context=false`）。方案类子代理的 prompt 必须自包含，包含用户原始请求、约束与期望产出格式；子代理以文本返回方案时，需要编排者自己把方案写入持久化文档。

### 工作单元分解

工作单元是编排执行的原子单位。进入四阶段循环之前，先把实现方案拆成工作单元。

| 字段 | 说明 | 示例 |
| --- | --- | --- |
| **ID** | 唯一标识 | `WU-001` |
| **Title** | 人类可读名称 | "实现 auth 中间件" |
| **Spec** | 书面规范与验收标准 | 指向设计文档小节 |
| **DoD Items** | 可枚举、可验证的完成标准 | `[ ] 中间件拒绝过期令牌` |
| **Dependencies** | 必须先完成的其他工作单元 | `[WU-000]` |
| **File Scope** | 本单元允许改动的文件 | `src/middleware/auth.ts`、`src/middleware/auth.test.ts` |
| **Human Checkpoint** | 完成后是否暂停等待人类复核 | 高风险改动为 `true` |

工作单元构成有向无环图（DAG），分解规则：

1. 每个工作单元只有**单一职责**（一次逻辑变更）；
2. 并行工作单元的**文件范围不得重叠**；
3. 依赖必须**显式声明**，不允许隐含顺序假设；
4. 同层且互不依赖的工作单元**并行执行**；
5. 每条 DoD 都必须**可独立验证**（不能是"代码看起来不错"）。

### 四阶段执行循环

**Phase 1: IMPLEMENT（实现）**

编排者 spawn 编码子 Agent，注入**工作单元 spec、DoD 条目、文件范围与 Project Context Document**。子 Agent 按 TDD 实现（先写失败测试，再实现使其通过），报告完成——但**编排者不采信这份自述**。

注入给编码 Agent 的硬性规则：不得修改文件范围以外的文件；不得自我认证；绝不使用 `--no-verify`（若项目有 pre-commit 钩子则遵守）；绝不 `git push --force`；绝不用 `eslint-disable`、`@ts-ignore`、`as any` 压制 linter/类型错误；绝不跳过测试或声称"测试通过"而实际没跑。

**Phase 2: VALIDATE（确定性校验）**

**由编排者本人独立运行**，绝不通过编码子 Agent 代跑：

1. 类型检查；
2. Lint；
3. **全量**测试（不只跑新增测试）；
4. 覆盖率检查（若项目存在覆盖率门禁则执行，低于阈值即 VALIDATION FAIL）；
5. 用 `git diff --name-only` 核对文件范围未被越界。

**Phase 3: ADVERSARIAL REVIEW（对抗性审查）**

由**独立的评审子 Agent**对照 spec 契约做对抗式验证，与协作式代码评审有本质区别：

| 协作式评审 | 对抗式评审 |
| --- | --- |
| APPROVED / CHANGES REQUIRED | PASS / FAIL |
| 主观质量评价 | 二元的 spec 符合性检查 |
| 评审员提出改进建议 | 评审员找出契约违反 |
| 同一评审员可复审 | 复审**必须**用全新评审员 |

编排者动作：spawn **全新**评审子 Agent（对抗模式），传入 **spec、DoD 条目与 diff——不传编码子 Agent 的自我评估**；评审员逐条核对 DoD 并给出 `file:line` 证据。任一 BLOCKING 问题即整体 FAIL。

**全新评审员规则**：复审时**必须** spawn 新实例，绝不把上一轮发现传给新评审员，绝不复用同一评审实例——以消除锚定偏差。

**Phase 4: COMMIT（提交）**

仅在对抗审查 PASS 之后：只暂存工作单元文件范围内的文件，提交信息中引用工作单元并写入 DoD 验证结果，然后更新项目上下文文档。

### 质量门禁是阻断式状态跃迁

**跃迁规则（是 MUST，不是 SHOULD）**：

1. IMPLEMENT → VALIDATE：永远执行，无例外；
2. VALIDATE → REVIEW：**仅当**全部校验通过（测试退出码 0、覆盖率达标（若存在门禁）、类型通过、Lint 通过、文件范围合规）；
3. REVIEW → COMMIT：**仅当**对抗审查返回 PASS；
4. FAIL → 重试：修复后重跑**失败的那道门禁**，不得跳过；
5. 修复后复审：**必须** spawn 全新评审员；
6. 每道门禁最多重试 3 次，之后携完整失败历史升级人类。

**FAIL 后的强制复审协议**：修问题 → 重跑 Phase 2（**全部**质量门禁，不只失败那项）→ **强制** spawn 全新对抗评审员 → 仅当新评审员 PASS 才提交；最多 3 轮后升级。过程中要显式播报 "Re-review attempt 1/3" 之类的进度。

**编排者绝不能做**："覆盖率 92% 差不多，直接提交吧""审查发现了问题但都是小问题，先合了""修复很直接，跳过复审""已经 FAIL 5 次了，先做下一个工作单元""测试过了但覆盖率命令失败，继续吧"。

**编排者必须做**："VALIDATION FAIL：覆盖率 87%，阈值 100%，退回 IMPLEMENT""ADVERSARIAL REVIEW FAIL，为复审 spawn 全新评审员，第 2/3 次""WU-004 超过最大重试 3 次，携失败历史升级人类""修复已应用，重跑校验，并用全新评审员重跑对抗审查"。

### 并行工作单元执行

互不依赖的工作单元可并行，但要有结构化的汇合点：**扇出实现** → **汇合后统一校验** → **扇出评审** → **串行提交**（保持 git 历史干净）。任一 FAIL 时只重跑失败单元的四阶段循环，不重跑已通过单元。

并行子 Agent 的结果如果在编排者已推进到别处（例如已到检查点）之后才到达，用一句话简短确认即可，不要为每条陈旧通知都打印完整的"仍在等待"块——那会污染对话并浪费上下文。

### Project Context Document（项目上下文文档）

编排者必须维护一份随工作单元增长的项目上下文文档，并在每次 spawn 编码子 Agent 时一并传入，以防上下文丢失。结构包含 Tooling（包管理器、测试运行器、Linter、构建工具及各自配置文件）、Completed Work Units 表（WU / Title / Key Files / Services Created）、Established Patterns、Active Services。

更新时机：每次 Phase 4 提交后补齐已完成单元；每次 Phase 1 实现后若出现新模式则更新；每个检查点做一次快照。文档**必须**落盘到仓库内的一份 Markdown 文件（如 `docs/context/project-context.md`），以穿越上下文压缩与会话边界；它在执行期间**不提交 git**，任务完成后清理（若中断则留给下一个会话）。

### 上下文恢复与方案落盘

方案通过门禁与用户批准后，写入仓库内的一份持久化方案文档（如 `docs/plans/active-plan.md`，带 `approved` 时间戳、`gate-iterations`、`user-approved: true`、`status: in-progress` 元数据头）；执行状态写入一份执行状态文档（当前位置、工作单元状态表、阻塞与升级记录）。一旦代理在执行中途丢失上下文，可先读这两份文件恢复，再决定是续跑还是回到门禁，而不必重跑整个方案审查。执行状态**归档而非删除**，留作事后复盘。

### 人类检查点（主动设置）

在命名停顿点主动暂停并呈报：已完成工作单元、已作出的关键决策、下一步是什么、以及需要人类回答的问题。**不得**在人类未回复时继续越过检查点；若情况紧急，应升级而不是跳过。

### 最终综合评审

所有工作单元提交后必须再来一次综合评审：看合并后的整体 diff、跑全量测试、跨单元类型检查、跨单元 Lint、整体覆盖率（若存在门禁）、核对提交历史是否干净且逻辑清晰，并做跨单元集成检查。输出 `## Final Comprehensive Review` 报告，给出 Overall Verdict（PASS / FAIL）、工作单元汇总表、质量门禁结果、遗留问题与 `Ready for PR: YES / NO`。

### 知识沉淀

最终评审通过之后，趁实现上下文还鲜活，把实现洞见、调试发现与架构决策沉淀进知识库。理由是：任务结束时实现者的上下文往往已经消失（会话结束或上下文被压缩），而最丰富的洞见——为何选某方案、走过哪些调试死路、涌现了哪些模式——此刻最鲜活。

### 恢复协议

循环中出问题时按四步走：**DIAGNOSE**（记录哪一阶段失败、错误信息或 FAIL 原因、影响了哪些 DoD）→ **CLASSIFY**（归类失败性质）→ **RETRY**（最多 3 次）→ **ESCALATE**（输出 `## Escalation: Work Unit <wu-id> Failed After 3 Attempts`，含失败历史、根因评估、可选项与推荐方案）。

### 反模式

| # | 反模式 | 为什么错 | 正确做法 |
| --- | --- | --- | --- |
| 1 | **自我认证**——编码子 Agent 说"测试过了"你就信 | 子 Agent 会幻觉、跳步或误读结果 | 编排者独立运行验证命令 |
| 2 | **跳过对抗审查**——"代码看着没问题，提交吧" | 目视检查漏掉 spec 违反；确认偏差 | 一律对照 DoD 条目做对抗审查 |
| 3 | **复用评审员**——同一子 Agent 在 FAIL 后复审 | 锚定偏差：评审员记得上次的发现，只会专门去查那几条 | spawn 无任何既有上下文的新评审实例 |
| 4 | **把上轮发现传给新评审员**——"上次评审发现 X，你看看修没修" | 制造锚定偏差，新评审员应独立发现问题 | 只传 spec、DoD 条目与 diff，不提前次评审 |
| 5 | **采信子 Agent 的文件范围声明**——"我只改了范围内的文件" | 子 Agent 可能意外改动范围外文件 | 跑 `git diff --name-only` 逐个核对 |
| 6 | **合并阶段**——"实现和验证一步做完" | 抹掉了让验证有意义的那份独立性 | 每阶段独立执行并各自产出 |
| 7 | **越过检查点继续**——人类没回复就往下走 | 检查点就失去意义 | 等待；紧急则升级，不得跳过 |
| 8 | **跳过最终综合评审**——"每个单元都单独过了" | 单元级评审抓不到跨单元集成问题 | 所有单元提交后必须做最终评审 |
| 9 | **跳过覆盖率检查**——"测试过了，覆盖率不重要" | 覆盖率门禁存在的意义就是防止未测路径 | 若项目存在覆盖率门禁则执行，不达标即阻断 |
| 10 | **孤立地造 UI 组件**——组件都测过却从未接入应用 | 没被渲染的组件用户根本用不到 | 方案必须包含把组件接入应用外壳的集成工作单元 |
| 11 | **未确认外部凭证就开工**——做需要 API Key 的功能却没验证用户是否配好 | 功能会在运行时失败，用户往往在 10 多个提交后才发现 | 依赖外部服务的 WU 之前设置检查点确认凭证 |
| 12 | **把质量门禁当建议**——FAIL 只当提示而非阻断跃迁 | 摧毁整个信任模型，等同于取消门禁 | 质量门禁是状态跃迁：FAIL 就重试或升级，绝不跳过 |
| 13 | **使用 `--no-verify`**——绕过 pre-commit 钩子提交 | 钩子本可在进入历史前拦住 lint、类型与格式问题 | 永不使用，改为修复底层问题 |
| 14 | **头脑风暴后跳过设计评审门禁** | 昂贵的实现工作会建立在未经评审的设计上 | 在头脑风暴与写方案之间必须跑 5 角色设计评审门禁 |
| 15 | **跳过方案评审门禁**——未经对抗评审就把方案呈报用户 | 有可行性缺口、需求遗漏或范围蔓延的方案会直接进入实现 | 呈报任何方案之前先跑 3 评审员方案门禁 |

### 快速参考：编排者清单

**执行前（方案预检）**：跑预检清单（架构、依赖、API 契约、安全、UI/UX、外部依赖）；核对必需方案小节齐全；把清单失败项在提交设计评审门禁**之前**修好。

**每个工作单元**：spawn 编码子 Agent 并注入 spec、DoD、文件范围与 **Project Context Document** → 等实现完成 → **独立**运行类型检查、Lint、全量测试与覆盖率检查（若存在门禁；不要问子 Agent）→ 用 `git diff --name-only` 核对文件范围 → spawn **全新**对抗评审员（传 spec 与 DoD）→ PASS 就带 DoD 验证写入提交信息，FAIL 就修复 → 重新校验 → spawn **新**评审员（最多 3 次后升级）→ 有检查点就呈报并等待 → 更新项目上下文文档。

**质量门禁**：VALIDATE → REVIEW 仅当全部检查通过（测试、覆盖率（若存在门禁）、类型、Lint、文件范围）；REVIEW → COMMIT 仅当对抗审查 PASS；任一门禁 FAIL 就重试（最多 3 次）再升级，绝不跳过；修复后的复审**必须**用全新评审员。

**全部工作单元完成后**：跑最终综合评审（含覆盖率检查，若存在门禁）→ 呈报最终报告 → 趁上下文鲜活沉淀经验到知识库 → 进入后续流程。

## Codex 原生落地

### 授权前提

Codex 官方限制：除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理。把本协议写进 `AGENTS.md`，或让用户显式调用对应 skill，即构成授权。

### 可用模型

本机支持三个可用模型：

| 模型                                                            | reasoning_effort 可选值        | 职能定位 |
| ------------------------------------------------------------- | --------------------------- | --- |
| `DeepSeek-V4.1-Flash`（256K 上下文） | low / medium / high / xhigh | 本地部署。主力代码实现、底层边界挑错、对抗审查 |
| `ccs-glm-5-3-flash/GLM-5.3-Flash`（显示名 GLM-5.3-Flash，1M 上下文） | low / high / max | 本地部署。大上下文工程实现、架构审查、安全推演（max） |
| `ccs-gmini/gemini-3.8-flash`（显示名 gemini-3.8-flash，1049K 上下文） | low / medium / high | CC-Switch 代理。极速对抗审查、敏捷复核、真异构 |

子代理默认继承父代理模型，必须显式传 `model` 才是异构。**同模型只换 reasoning_effort 属于降级方案，不算真正异构评审。**

### spawn 参数示例

实现者（DeepSeek）：

```text
spawn_agent(
  message="实现工作单元 WU-001：<title>。Spec：<...>。DoD：<...>。文件范围：<...>。按 TDD 先写失败测试再实现。",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="high"
)
```

对抗评审员（GLM）：

```text
spawn_agent(
  message="你是对抗性代码评审员。对照以下 spec 与 DoD 逐条检查 diff，输出二元 PASS/FAIL，只给结论与 file:line 证据，不给改进建议。Spec：<...>。DoD：<...>。Diff：<...>",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="high"
)
```

### 编排顺序

1. **spawn 实现者**（`model="DeepSeek-V4.1-Flash"`，`reasoning_effort="high"`），prompt 自包含（spec、DoD、文件范围、项目上下文）。
2. **`wait_agent`** 等实现者完成。
3. 编排者**独立**跑类型检查、Lint、全量测试与覆盖率检查（若存在门禁），用 `git diff --name-only` 核对文件范围。
4. **spawn 全新对抗评审员**（`model="ccs-glm-5-3-flash/GLM-5.3-Flash"`，`reasoning_effort="high"`），只传 spec、DoD 与 diff，不传实现者自述。
5. **`wait_agent`** 收集评审结论。PASS → **`close_agent`** 关闭评审员，进入 Phase 4 提交。FAIL → **`close_agent`** 关闭评审员，修复后回到第 3 步，再 spawn 全新评审员（最多 3 次）。
6. 可并行的工作单元在第 1-5 步中扇出；汇合后统一校验，串行提交。
7. 所有单元提交后跑最终综合评审。

## 中文 skill 文件

加载路径：`.agents/skills/agent-team-orchestration/SKILL.md`（点开头目录不在 Obsidian 索引内，故以文本标注）。

## 相关 Skill

- [[agent-team-plan-gate]]
- [[agent-team-external-cli]]
- [[agent-team-handoff]]
- [[agent-team-design-gate]]
- [[agent-team-brainstorm]]
