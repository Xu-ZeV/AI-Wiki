---
name: agent-team-external-cli
description: 当需要跨模型委托实现或评审任务、要求实现与评审分离、做异构评审或对抗性审查、或需要按路由升级链在多个模型之间调度子代理时必须使用本 skill（触发关键词：跨模型委托、异构评审、实现与评审分离、对抗性审查、路由升级链、子代理委托）。
license: MIT
metadata:
  author: AI-Wiki
  version: "1.0.0"
  source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-external-cli/SKILL.md
  adapted_for: Codex 原生子代理多模型协作
  upstream_note: 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw/SkillHub/zh/metaswarm/original-en/，MIT 许可
---

# 跨模型委托与模型路由（External CLI）

## 何时使用

在下列任一情况出现时，必须使用本 skill：

- 任务需要**跨模型委托**：把实现或评审工作交给与编排者不同的模型完成。
- 任务需要**异构评审**或**对抗性审查**：由写代码之外的另一个模型审查改动，以消除单模型盲区。
- 任务要求**实现与评审分离**：实现者绝不评审自己的产出，评审者不参与实现。
- 需要按**路由升级链**在多个模型之间调度子代理：一次失败后换模型重试，而不是原地重复。
- 需要为某个子任务挑选更便宜、更擅长该任务类型的模型。

下列情况不适用：

- 单文件、低风险、一次就能说清的改动，编排者自己做完更省时。
- 任务本身就是"问一个问题"，没有可评审的产物。
- 需要联网检索、需要人做产品决策等无法委托的环节。
- 用户明确要求"不要派子代理"或"只用当前模型完成"。

**授权说明**：Codex 官方对 `spawn_agent` 的约束是"除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理"。调用本 skill 即视为用户已明确授权派发子代理，并按本 skill 的模型路由规则执行；无需在每次派发前重复征求授权，但人类检查点与预算熔断仍然有效。

---

## 目的与三条核心原则

本 skill 把实现和评审任务委托给**不同的模型**，用更便宜的模型降低成本，用跨模型对抗性评审消除单模型盲区。每一次交互都遵守三条原则：

1. **一次调用只干一件事**：每次 `spawn_agent` 只承担一个角色，要么实现，要么评审，绝不自我验证、绝不"实现完顺手给自己打分"。
2. **最小权限与最小上下文**：子代理默认继承父会话的工具权限，不需要额外注入密钥；同时默认 `fork_context=false`，只拿到完成本职所需的最小上下文。若子代理需要外部凭证，编排者必须先在人类检查点确认凭证已配置。
3. **编排者独立验证**：子代理只汇报事实，编排者独立跑质量门并判定通过与否，绝不采信子代理的自我结论。

---

## 前置条件

### 本机可用模型

| 模型（`spawn_agent` 的 `model` 取值） | 显示名 | 上下文 | 可用 `reasoning_effort` |
|---|---|---|---|
| `DeepSeek-V4.1-Flash` | DeepSeek-V4.1-Flash | 256K | `low` / `medium` / `high` / `xhigh` |
| `ccs-glm-5-3-flash/GLM-5.3-Flash` | GLM-5.3-Flash | 1M | `low` / `high` / `max` |

两个模型都不是可选项之外的兜底：本机只有这两条路由，因此异构度只有**二元**。同一模型只换 `reasoning_effort` 属于**降级方案**，不算异构评审，使用它时必须在结论里显式标注"本轮评审为同模型降级方案"。

### 配置

不再有框架专有的配置文件。配置以本 skill 的默认值 + 编排者在任务开始时的显式声明为准，至少需要确认三件事：

```yaml
routing:
  default_implementer: "cheapest-available"      # 见"路由逻辑"
  escalation_order: ["DeepSeek-V4.1-Flash", "ccs-glm-5-3-flash/GLM-5.3-Flash", "orchestrator"]
budget:
  per_task_tokens: 400000        # 单任务累计 token 上限（熔断）
  per_session_tokens: 2000000    # 单会话累计 token 上限（熔断）
  per_task_usd: 2.00             # 可选，若已知计费口径则同时启用
  per_session_usd: 20.00
timeout:
  default_wait_ms: 600000        # wait_agent 默认等待上限
```

### 降级行为

- **两个模型都可用**：完整跨模型委托与异构评审。
- **只有一个模型可用**：缩减为与编排者的互评链，并标注异构度下降。
- **没有可用子代理（工具不可用或用户禁用）**：本 skill 变为空操作，编排者按原有单模型流程完成，并可用"同模型 + 全新上下文"做一次降级评审。

---

## 快速参考

### 健康检查

子代理本身没有独立的健康检查接口，可用性检查改为：

1. 读取 `spawn_agent` 在派发失败时返回的可用模型与 `reasoning_effort` 列表；
2. 必要时先派发一个一句话探针任务，只验证"该模型此刻可路由"。

状态取值为 `ready` / `degraded` / `unavailable`：模型不可路由即 `unavailable`；可路由但上下文或速率受限即 `degraded`。

### 实现（派发一次，一个角色）

```text
spawn_agent(
  message="<自包含实现 prompt，见"子代理 prompt 格式">",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="high",
  fork_context=false
)
-> 记录 target（子代理 id），随后 wait_agent(targets=[target], timeout_ms=600000)
```

### 评审（另一次派发，另一个模型，只读）

```text
spawn_agent(
  message="<自包含评审 prompt：diff + 评审 rubric + 规格说明>",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="high",
  fork_context=false
)
-> wait_agent(targets=[reviewer], timeout_ms=600000)
```

子代理只返回事实（改动了哪些文件、diff 摘要、它跑了什么命令、观察到的结果）。判定通过与否是编排者的职责，子代理永远不给最终裁决。

---

## 工作流：路由与派发

### Phase 0：可用性发现（健康检查）

在派发任何任务**之前**，编排者先确定哪些模型此刻可用。健康检查是**每次派发前**执行，而不是只在会话开始时执行一次：凭证会中途失效、速率限制会重置、上下文余量会变化。五分钟前 `ready` 的模型现在可能是 `unavailable`。

```text
available_models = [m for m in models if m.health() == "ready"]
```

### Phase 1：IMPLEMENT（子代理或编排者）

若选中某个子代理作为实现者：

1. **隔离**：默认靠"子代理独立上下文 + 编排者独立跑校验"实现隔离。若任务涉及并发写同一仓库，则用 `git worktree` 建独立工作区，或让该子代理只读不写。
2. **打包上下文**：把相关文件、规格、验收标准写进自包含 prompt，按 token 预算裁剪以适配目标模型窗口。
3. **派发**：`spawn_agent(...)`，记下 target。
4. **取回**：`wait_agent(targets=[target], timeout_ms=...)`；失败或超时也先 `wait_agent` 取回，再决定重试还是换模型。
5. **范围检查**：核对所有文件改动都在声明的文件范围内，越界改动一律回退。
6. **记录事实**：只记录事实——退出状态、改动文件、diff 统计、token 用量、耗时。

若编排者自己被选为实现者（升级链末端或无可用子代理），按原有流程直接实现。

### Phase 2：VALIDATE（永远由编排者执行）

编排者独立跑全部质量门：

- `npm test` / `npx vitest run`
- `npx tsc --noEmit`
- `npx eslint <changed-files>`
- 若存在 `.coverage-thresholds.json`，则读取并据此执行覆盖率门槛；文件不存在时跳过，不视为失败
- 用 `git diff --name-only` 校验文件范围

无论实现者是子代理还是编排者本人，本阶段完全一致。**绝不相信实现者的自报结果。**

### Phase 3：ADVERSARIAL REVIEW（跨模型对抗性评审）

外部委托的核心价值：写代码的人，永远由**另一个模型**来审。

| 实现者 | 评审者 1 | 评审者 2（第二轮） |
|---|---|---|
| `DeepSeek-V4.1-Flash` | `ccs-glm-5-3-flash/GLM-5.3-Flash` | `DeepSeek-V4.1-Flash`（换 `reasoning_effort`） |
| `ccs-glm-5-3-flash/GLM-5.3-Flash` | `DeepSeek-V4.1-Flash` | `ccs-glm-5-3-flash/GLM-5.3-Flash`（换 `reasoning_effort`） |

第二轮换回实现者所属模型时，必须换一个 `reasoning_effort` 档位并使用全新上下文；这仍然属于**同模型降级方案**，只是补强，不能替代第一轮的异模型评审。

评审通过 `spawn_agent` 派发，评审者默认只读、不写文件。编排者阅读评审者的原始输出并独立评估——评审者可以给 PASS/FAIL 建议，但最终裁决权在编排者。

### Phase 4：COMMIT

通过对抗性评审后：

1. 若使用了 `git worktree`，把该分支合回工作分支并清理工作区。
2. 用 `close_agent(target)` 释放本轮所有子代理。
3. 记录本轮会话事实（由编排者统一记录，子代理不写日志）。
4. 提交时在提交信息中写明完成度验证（DoD）结果。

---

## 升级模型（可用性感知）

编排者根据健康检查结果调整升级链。

### 场景 1：两个模型都可用（最多 5 次尝试）

```text
模型 A 实现（第 1 次）
  编排者验证 + 异构评审（B 评审，第二轮换回 A）
  FAIL -> 把评审反馈回传给 A

模型 A 实现（第 2 次，带评审反馈）
  编排者验证 + 异构评审
  FAIL -> 升级到模型 B

模型 B 实现（第 1 次，以 A 的分支为参考）
  编排者验证 + 异构评审（A 评审）
  FAIL -> 把评审反馈回传给 B

模型 B 实现（第 2 次，带评审反馈）
  编排者验证 + 异构评审
  FAIL -> 升级到编排者本人

编排者实现（以 A、B 两个分支为参考）
  编排者验证 + 异构评审（A 与 B）
  FAIL -> 连同全部分支、findings、CI 结果一起上报用户
```

**最坏情况：A(2) + B(2) + 编排者(1) = 5 次尝试后才上报用户。**

注意：编排者自己兜底实现时，若编排者与 A、B 属于同一模型，则这一轮属于同模型降级，必须在结论中显式标注。

### 场景 2：只有一个模型可用（最多 3 次尝试）

```text
模型 A 实现（第 1 次）
  编排者验证 + 评审（编排者评审，或用全新上下文的 A 评审）
  FAIL -> 把评审反馈回传给 A

模型 A 实现（第 2 次，带评审反馈）
  编排者验证 + 评审
  FAIL -> 升级到编排者本人

编排者实现（以 A 的分支为参考）
  编排者验证 + 评审（A 评审）
  FAIL -> 上报用户
```

**最坏情况：A(2) + 编排者(1) = 3 次尝试后才上报用户。**

### 场景 3：没有可用子代理

```text
原有单模型流程不变。
编排者直接实现。
用"同模型 + 全新上下文"做一次降级评审（可选）。
```

对当前工作流没有任何改变，本 skill 是空操作。

---

## 路由逻辑

编排者为每个任务挑选实现者，使用 `cheapest()` 选择：

```python
available_models = [m for m in models if m.health() == "ready"]

if len(available_models) == 2:
    implementer = cheapest(available_models)
    reviewers = [other_model, implementer_with_fresh_context]
    escalation = [implementer, other_model, orchestrator, user]
elif len(available_models) == 1:
    implementer = available_models[0]
    reviewers = [orchestrator, implementer_with_fresh_context]  # 互评，异构度下降
    escalation = [implementer, orchestrator, user]
else:
    # 纯单模型，无变化
    implementer = orchestrator
    reviewers = [orchestrator_with_fresh_context]
    escalation = [orchestrator, user]
```

**`cheapest()` 的挑选顺序**：

1. 先选单次调用估算成本更低的模型（按模型定价 + 本会话历史平均 token 用量估算）。
2. 平局时，优先选在该任务类型上历史成功率更高的模型。
3. 没有任何历史数据时，默认选 `DeepSeek-V4.1-Flash` 作为实现者，并把 `ccs-glm-5-3-flash/GLM-5.3-Flash` 安排为首位评审者；这个默认值必须在本机实际计费口径确认后修订，并在会话记录中注明依据。

---

## 子代理 prompt 格式

prompt 是编排者与子代理之间的关键接口。子代理**默认不带父会话历史**（`fork_context=false`），因此 prompt 必须**自包含**：它看不到知识库、看不到对话历史、看不到编排者已读过的任何文件。

固定小节格式如下：

```markdown
# Task: [任务标题]

## Acceptance Criteria
- [ ] 验收标准 1
- [ ] 验收标准 2
- [ ] 验收标准 3

## Context
[相关文件内容，已按 token 预算裁剪]
[优先级：改动文件 > 测试文件 > 其依赖导入 > 周边上下文]

## Coding Standards
[从项目 AGENTS.md / 编码规范中提取]
[语言特定规则、命名约定、既有模式]

## Test Expectations
[实现完成后应当通过的测试]
[若存在 .coverage-thresholds.json，则写入其覆盖率要求]
[测试运行命令，例如 npx vitest run]

## Previous Attempt (if retry)
[上一次尝试的评审反馈——需要修什么]
[不要附上完整的历史输出，只摘要可执行的反馈]

## Prior Model's Attempt (if escalation)
[上一个模型分支的 diff 摘要——试过什么、为什么失败]
[不要附上整个分支，只摘要相关 diff]
```

### token 预算规则

- 按 `chars / 4` 估算每个文件的 token 数。
- 上下文优先级：改动文件 > 测试文件 > 其依赖导入 > 周边上下文。
- 裁剪到目标模型的上下文预算（GLM-5.3-Flash 为 1M，DeepSeek-V4.1-Flash 为 256K，注意给输出留出余量）。
- 重试时：只带上评审反馈摘要，不带完整历史输出。
- 升级时：只带上一个模型分支的 diff 摘要，不带完整分支。
- 评审 prompt 的预算是：diff + rubric + 规格说明，三者都必须放得下，放不下就先精简 diff。

---

## 错误处理

当一次派发返回失败（`spawn_agent` 拒绝、`wait_agent` 超时、子代理输出不可解析等），由错误类型决定编排者的响应动作：

| 错误类型 | 含义 | 编排者响应动作 |
|---|---|---|
| `tool_not_installed` | 目标模型不在本机可用模型列表中 | 跳过该模型，走升级链下一环 |
| `auth_expired` | 子代理调用被拒绝，凭证或权限已失效 | 升级到人类检查点，附上配置指引 |
| `auth_missing` | 需要的外部凭证尚未配置 | 升级到人类检查点，先确认凭证已配置 |
| `network_error` | 无法访问模型服务 | 指数退避重试，仍失败则跳过该模型 |
| `rate_limited` | 触发速率限制 | 等待后重试（若有 Retry-After 则遵循） |
| `timeout` | 超过等待上限仍未返回 | 先 `wait_agent` 取回现场，把 `timeout_ms` 提高后重试一次，再跳过该模型 |
| `context_too_large` | 输入超出上下文窗口 | 精简上下文（重新打包 prompt），再重试 |
| `cost_limit_exceeded` | 将超出预算 | 跳过该模型，并告知用户当前预算状态 |
| `tool_crash` | 子代理异常中止 | 重试一次，仍失败则跳过该模型 |
| `output_parse_error` | 子代理输出结构不符合约定 | 记录原始输出用于排查，按失败处理 |

**通用规则**：

- "跳过该模型"指移动到升级链的下一环，而不是中止整个任务。
- 所有错误都记录到编排者统一维护的会话记录中，用于后续路由情报积累。
- 凭证类错误一律升级到人类检查点，编排者无法替用户修凭证。
- 网络与速率限制错误按瞬时故障处理（退避 + 重试）。
- 子代理失败或超时，必须**先 `wait_agent` 取回**结果或现场，再决定是重试还是换模型；未取回就丢弃等于丢失证据。
- 每轮结束都调用 `close_agent(target)` 释放子代理，避免资源泄漏。

---

## 预算与熔断

两道熔断器防止成本失控。注意：**成本是事后度量，不是事前封顶**——预算只能拦住"下一跳"，拦不住正在进行的这一次调用。

### 单任务预算（`per_task_tokens` / `per_task_usd`）

每次派发前，编排者检查当前任务的累计成本：

```text
if task_cost_so_far + estimated_cost > per_task_budget:
    error_type = "cost_limit_exceeded"
    跳过该模型，走升级链下一环（或由编排者自己收尾）
```

默认：单任务 400,000 token（若已知计费口径，同时设 `$2.00`）。

### 单会话预算（`per_session_tokens` / `per_session_usd`）

每次派发前，编排者检查整个会话的累计成本：

```text
if session_cost_so_far + estimated_cost > per_session_budget:
    error_type = "cost_limit_exceeded"
    告知用户："会话预算已用尽，剩余任务停用子代理委托。"
    剩余工作全部由编排者自己完成
```

默认：单会话 2,000,000 token（若已知计费口径，同时设 `$20.00`）。

### 成本记录

成本在派发**之后**从子代理的返回结果中提取（输入/输出 token 数），再按已知模型定价换算。估算存在约 15%–30% 的偏差（不同模型分词器不同）。v1 没有事前成本预测——成本是执行后度量的，不是执行前封顶的。

---

## 反模式

| # | 反模式 | 为什么错 | 应该怎么做 |
|---|---|---|---|
| 1 | **信任子代理自报**——子代理说"测试全过"，编排者就信了 | 子代理可能幻觉、跳过步骤或误解结果；与"子代理不得自我认证"同源 | 编排者独立执行 Phase 2（VALIDATE）；子代理输出只含事实，绝不含裁决 |
| 2 | **跳过异构评审**——"另一个模型的代码看着没问题，直接提交" | 单模型盲区正是本 skill 存在的理由；跳过评审等于放弃它的全部价值 | 必须执行 Phase 3，且评审者与实现者必须是不同模型；只有两个模型时用对抗矩阵的第一轮 |
| 3 | **不设超时地派发**——`wait_agent` 不带 `timeout_ms` 无限等待 | 子代理可能卡在速率限制、网络问题或死循环上；无界等待会阻塞整条流水线 | 始终显式传 `timeout_ms`（默认 600000），并把超时当作可重试错误处理 |
| 4 | **无差别继承父会话上下文**——默认开 `fork_context=true` 或把父会话环境全量塞给子代理 | 制造锚定偏差，泄漏无关状态，放大 token 成本，还可能把不需要的凭证暴露给子代理 | 默认 `fork_context=false`，prompt 自包含、最小上下文；确需外部凭证时先在人类检查点确认凭证已配置 |
| 5 | **在主工作区里并发写文件**——让多个子代理直接在同一检出的目录里改代码 | 并发派发会互相破坏状态；失败尝试会留下脏文件；没有干净的回滚路径 | 每个写操作子代理在独立 `git worktree` 中工作，或让评审子代理只读；全部阶段通过后再合并 |

---

## 路由情报积累

每次派发都产生结构化会话记录（由编排者统一记录，子代理不写日志）：

```text
会话记录条目：
  - 时间戳、模型、reasoning_effort、角色（实现 / 评审）、尝试次数
  - prompt 内容哈希（我们问了什么）
  - 返回事实（改动文件、diff 统计、token 用量、耗时）
  - CI 质量门结果（编排者 Phase 2）
  - 评审输出（对抗性评审 Phase 3）
  - 结果：success | retry | escalated | user_alert
  - 成本（token 用量，可选折算金额）
```

这些记录是长期的路由情报来源。随知识库增长，"哪个模型擅长什么"会逐步变成可复用的判断依据：

- **擅长领域**："DeepSeek-V4.1-Flash 在单文件 TypeScript 实现上更稳。"
- **常见毛病**："GLM-5.3-Flash 在异步函数里容易漏掉错误处理。"
- **路由决策**："数据库迁移类任务直接交给编排者（子代理委托在这类任务上失败率约 80%）。"

后续的路由决策会随着记录积累自动改进。

---

## Codex 原生落地

本节给出两套可以直接照抄的路由写法。核心约束：**子代理默认继承父代理模型，必须显式传 `model` 才会异构**；**子代理默认不带父会话历史，prompt 必须自包含**。

### 写法 A：DeepSeek 实现 / GLM 评审

```text
# 1) 实现者：DeepSeek-V4.1-Flash（高推理档）
impl = spawn_agent(
  message="""# Task: 为 X 模块补上 Y 行为

## Acceptance Criteria
- [ ] ...

## Context
...（相关文件内容，已按 chars/4 预算裁剪）

## Coding Standards
...（提取自 AGENTS.md）

## Test Expectations
运行 npx vitest run，且不新增失败用例
""",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="high",
  fork_context=false
)

# 2) 等待实现者返回（失败/超时也先取回）
wait_agent(targets=[impl], timeout_ms=600000)

# 3) 若需返工，用 send_input 把评审反馈回传给同一个实现者
send_input(
  target=impl,
  message="## Previous Attempt\n评审反馈摘要：...（只给可执行的反馈）",
  interrupt=false
)

# 4) 编排者独立跑 Phase 2 校验（在本地 shell 执行，不委托）

# 5) 评审者：GLM-5.3-Flash，只读，只看 diff + rubric + 规格
rev = spawn_agent(
  message="""你是代码评审者。依据下面的 rubric 与规格评审 git diff。

## Git Diff
[在此粘贴编排者取出的 diff；放不下时按优先级裁剪，只保留与验收标准相关的部分]

## Review Rubric
...（references/external-tool-review-rubric.zh.md 全文）

## Specification
...（任务规格与验收标准）

## Instructions
1. 逐条核对 rubric 的每一项。
2. 每条发现给出：判定（PASS/FAIL）、分类（BLOCKING/WARNING）、`file:line` 引用、理由。
3. 最后给出总体判定：存在 BLOCKING 即为 FAIL，只有 WARNING 或无问题即为 PASS。
4. 只输出结论与发现，不要修改任何文件。
""",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="high",
  fork_context=false
)

# 6) 第二评审轮：换回实现者模型，但换 reasoning_effort 并用全新上下文
rev2 = spawn_agent(
  message="<同上的评审 prompt，但换一个视角：重点审查边界条件与错误路径>",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="xhigh",   # 与实现轮的 high 不同
  fork_context=false
)

# 7) 收尾：编排者裁决，然后释放所有子代理
wait_agent(targets=[rev, rev2], timeout_ms=600000)
close_agent(impl); close_agent(rev); close_agent(rev2)
```

### 写法 B：GLM 实现 / DeepSeek 评审

```text
# 1) 实现者：GLM-5.3-Flash（1M 上下文，适合大体量上下文任务）
impl = spawn_agent(
  message="""# Task: ...

## Acceptance Criteria
- [ ] ...

## Context
...（可利用 1M 窗口容纳更多周边上下文，但仍按优先级裁剪）

## Coding Standards
...

## Test Expectations
...
""",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="high",
  fork_context=false
)

wait_agent(targets=[impl], timeout_ms=600000)

# 2) 编排者独立跑 Phase 2 校验

# 3) 评审者：DeepSeek-V4.1-Flash，只读
rev = spawn_agent(
  message="""你是代码评审者。依据下面的 rubric 与规格评审 git diff。
...（同上：Git Diff / Review Rubric / Specification / Instructions）""",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="xhigh",
  fork_context=false
)

# 4) 第二评审轮：换回 GLM，换档位、全新上下文
rev2 = spawn_agent(
  message="<同上评审 prompt，换一个视角>",
  model="ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort="max",
  fork_context=false
)

wait_agent(targets=[rev, rev2], timeout_ms=600000)
close_agent(impl); close_agent(rev); close_agent(rev2)
```

### 等待策略

- **默认长等**：`wait_agent(targets=[t], timeout_ms=600000)`；实现类任务通常比评审类任务慢，可分别给不同上限。
- **多目标合并等待**：两轮评审可以放进同一次 `wait_agent(targets=[rev, rev2], timeout_ms=600000)`，先返回的那个先处理。
- **快照模式**：只想知道"现在到哪一步了"时用 `wait_agent(targets=[...], timeout_ms=0)`，不阻塞。
- **超时后**：不要直接放弃。先 `wait_agent` 取回现场，再决定是提高 `timeout_ms` 重试、还是记录 `timeout` 并换模型。
- **中途干预**：需要补充信息时用 `send_input(target, message, interrupt=false)`；只有必须打断当前推理时才 `interrupt=true`。
- **强制收尾**：无论成功、失败还是上报用户，最后一律 `close_agent(target)` 释放子代理。

---

## 血缘与许可

本 skill 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作。英文原件归档于 [raw/SkillHub/zh/metaswarm/original-en/external-tools/](../../../../../raw/SkillHub/zh/metaswarm/original-en/external-tools/SKILL.md)，采用 MIT 许可。
