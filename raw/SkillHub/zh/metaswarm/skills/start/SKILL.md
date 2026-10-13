---
name: start
description: 在开始任何任务时使用；当用户提到 metaswarm 时使用；当用户希望开启可追踪的开发工作时使用
auto_activate: true
triggers:
  - "work on issue"
  - "start issue"
  - "start task"
  - "use metaswarm"
  - "@metaswarm"
  - "agent-ready label"
---

# BEADS 多Agent编排技能

本技能协调一个由专职 AI 智能体组成的群体（swarm），自主处理 GitHub Issue，从创建一路走到 PR 合入。

---

## 快速开始

### 开始处理一个 GitHub Issue

```bash
# 用户可通过以下任一方式触发：
@beads start #123
bd start 123
/beads-start 123
```

### 查看 BEADS 状态

```bash
bd ready          # 显示可以开始做的任务
bd list           # 显示全部任务
bd stats          # 显示项目统计
bd doctor         # 检查系统健康度
```

---

## Agent 角色名册

| Agent | 角色 | 生成时机 |
| --------------------- | ------------------------------ | ---------------------------------- |
| **Issue Orchestrator**（Issue 编排者） | 每个 Issue 的主协调者 | Issue 被打上 `agent-ready` 标签时 |
| **Researcher Agent**（调研 Agent） | 代码库探查 | 编排者创建调研任务时 |
| **Architect Agent**（架构 Agent） | 实现方案规划 | 调研完成时 |
| **Product Manager Agent**（产品经理 Agent） | 用例与用户收益评审 | 设计门禁（并行） |
| **Designer Agent**（设计师 Agent） | UX/API 设计评审 | 设计门禁（并行） |
| **Security Design Agent**（安全设计 Agent） | 安全威胁建模 | 设计门禁（并行） |
| **CTO Agent**（CTO Agent） | TDD 就绪度与方案评审 | 设计门禁（并行） |
| **Coder Agent**（编码 Agent） | TDD 实现 | 设计门禁通过后 |
| **Code Review Agent**（代码评审 Agent） | 内部代码评审 | 实现完成时 |
| **Security Auditor**（安全审计 Agent） | 安全评审（代码层） | 实现完成时 |
| **Release Engineer Agent**（发布工程师 Agent） | 从合入到上线的安全交付 | QA 通过 PR、PR 达到可合入状态时 |
| **PR Shepherd**（PR 监护者） | PR 生命周期管理 | PR 创建时 |

各 Agent 的详细定义见 `./agents/` 目录。

---

## 设计评审门禁（新增）

对于经由头脑风暴产出的复杂特性，自动 **设计评审门禁** 会在实现前把关质量：

```
设计文档创建完成
        │
        ▼
┌─────────────────────────────────────────────────┐
│              设计评审门禁                         │
│                                                  │
│  并行生成：                                       │
│  • 架构 Agent（技术架构）                          │
│  • 设计师 Agent（UX/API 设计）                     │
│  • UX 评审者（用户流程、集成工作单元）              │
│  • CTO Agent（TDD 就绪度）                        │
│                                                  │
│  全部通过才可继续                                  │
└─────────────────────────────────────────────────┘
        │
        ├── 有任何 NEEDS_REVISION？→ 迭代修改设计（最多 3 次）
        │
       全部通过
        │
        ▼
   创建 BEADS Epic → 开始实现
```

### 触发设计评审门禁

门禁会在以下情况自动触发：

- `superpowers:brainstorming` 完成并提交设计文档时
- 用户运行 `/review-design <design.md 路径>` 时

### 各 Agent 的评审要点

| Agent | 关注领域 |
| --------------- | ---------------------------------------------------------- |
| 产品经理 | 用例清晰度、用户收益、范围、成功度量 |
| 架构师 | 服务架构、依赖、模式、集成 |
| 设计师 | API 设计、UX 流程、开发者体验、一致性 |
| 安全设计 | 威胁建模、认证/授权、数据保护、OWASP Top 10 |
| UX 评审者 | 用户流程、文字线框图、集成工作单元、空态/错误态 |
| CTO | TDD 就绪度、与代码库的一致性、完整性、风险 |

### 迭代协议

- 最多 **3 次迭代**，超出则升级给人类
- 每次迭代：修改设计 → 重跑全部评审者
- 升级时可选项：Override（强制继续）/ Defer（推迟）/ Cancel（取消）

完整细节见 `design-review-gate` 技能。

---

## 团队模式协作

当同一仓库上有多个 Claude Code 会话同时活跃时（例如并行 worktree），metaswarm 会自动进入 **团队模式**。在团队模式下，Agent 作为持久队友工作，跨会话保留上下文，并可相互直接发消息协调。模式检测依据是否存在并发会话，自动完成。

完整的团队模式协议（消息路由、上下文共享、冲突解决）见 `./guides/agent-coordination.md`。

---

## 方案评审门禁

架构师产出实现方案之后、进入设计评审门禁之前，方案要先经过 **方案评审门禁**。三位对抗性评审者会各自独立校验方案：

| 评审者 | 关注点 |
| --- | --- |
| **可行性** | 技术可实现性、依赖风险、资源约束 |
| **完整性** | 缺失的工作单元、未覆盖的边界用例、完成定义的缺口 |
| **范围与对齐** | 方案是否守住 Issue 范围、是否符合代码库惯例 |

三者全部 APPROVE 后方案才可继续。完整技能定义见 `plan-review-gate` 技能。

---

## 编排式执行

设计评审通过后，实现阶段按 **四阶段执行循环** 逐个工作单元推进。它用严格的独立验证与对抗性评审，取代了原先「先实现、后评审」的线性流程。

### 核心原则

**什么都不信。一切都要验证。以对抗方式评审。**

### 方案校验（起飞前检查）

在提交设计评审门禁之前，编排者会跑一遍起飞前清单，覆盖架构、依赖图、API 契约、安全、UI/UX 与外部依赖。这能在把 Agent 周期花在评审上之前，先抓出结构性问题（缺少服务层、依赖图有误、工作单元过大等）。

### 四阶段循环

对每个工作单元（一个离散的、由规格驱动的变更，带完成定义条目）：

1. **IMPLEMENT（实现）** —— 编码子代理依照规格、携带项目上下文文档，用 TDD 执行
2. **VALIDATE（验证）** —— 编排者亲自运行质量门禁（tsc、eslint、vitest，以及 `.coverage-thresholds.json` 的覆盖率强制）。**绝不采信子代理的自述。** 质量门禁是 **阻塞式的状态迁移**，不是建议
3. **ADVERSARIAL REVIEW（对抗性评审）** —— 全新的评审子代理对照规格契约检查。二值 PASS/FAIL，必须给出 file:line 证据。使用 `adversarial-review-rubric.md`。配置了外部工具时走跨模型评审，确保写代码的人总是被另一个不同的 AI 模型评审（见下文「外部工具」一节）
4. **COMMIT（提交）** —— 只有在对抗性评审 PASS 之后才提交。更新 `SERVICE-INVENTORY.md` 与项目上下文文档

FAIL 时：修复 → 重新验证 → 生成 **全新** 评审者（最多 3 次重试，之后升级给人类）。从 FAIL 到 COMMIT 没有任何绕开重试循环的路径。

### 何时使用编排式执行

- 任务有 **书面规格**，完成定义条目可枚举
- 实现包含 **多个工作单元**（3 个以上逻辑变更）
- 你需要 **独立验证** —— 子代理的自述不够
- 变更是 **高风险** 的（Schema 变更、安全、新的架构模式）
- 你希望 **在预定评审点设置人类检查点**

### 何时不要使用

- 单文件缺陷修复或文案修改
- 没有书面规格或完成定义条目的任务
- 快速原型或探索性工作
- 拆解本身的开销超过工作量的任务

简单任务走标准线性流程（实现 → 代码评审 → PR）即可。

### 关键概念

**工作单元拆解**：把实现方案拆成离散的工作单元，每个包含：
- 一段规格与可枚举的完成定义条目
- 声明的文件范围（允许修改哪些文件）
- 对其他工作单元的依赖
- 可选的人类检查点标记

**独立验证**：编排者直接运行 `tsc`、`eslint`、`vitest`，而不是问编码子代理「测试过了吗？」然后接受它的回答。

**对抗性评审**：与协作式代码评审在本质上是两回事。评审者是一位独立审计员，只核对规格符合度，不是提改进建议的热心同事。结论为二值 PASS/FAIL。必须给出证据（file:line 引用）。

**全新评审者规则**：FAIL 后重审时，会生成一个对上一次评审毫无记忆的新评审者实例。这可以避免锚定偏差。

**人类检查点**：在关键边界（Schema 变更、安全代码、首次使用新模式）设置的预定暂停点。编排者会等待人类明确批准再继续。

**最终整体评审**：所有工作单元通过后，再做一次跨单元评审，捕捉单单元评审漏掉的集成问题。

完整模式（工作单元结构、并行执行、恢复协议、反模式）见 `orchestrated-execution` 技能。

---

## 外部 AI 工具（可选）

配置了外部 AI CLI 工具（`.metaswarm/external-tools.yaml`）之后，编排者可以把实现与评审任务委托给 OpenAI Codex CLI 与 Google Gemini CLI。这带来了两件事：用更便宜的模型省钱，以及用跨模型对抗性评审消除单模型的盲区。

### 如何集成

外部工具直接嵌入既有的四阶段执行循环：

- **阶段 1（IMPLEMENT）**：编排者可以委托给外部工具，而不生成 Claude 子代理。工具在隔离的 git worktree 中工作
- **阶段 2（VALIDATE）**：不变 —— 无论谁实现，编排者都独立运行全部质量门禁
- **阶段 3（ADVERSARIAL REVIEW）**：跨模型评审 —— 写代码的人总是被另一个模型评审（例如 Codex 写，Gemini + Claude 评）
- **阶段 4（COMMIT）**：不变 —— 所有阶段通过后合并 worktree 分支

### 升级链

编排者依据工具可用性自适应：

| 可用工具 | 升级链 | 最大尝试次数 |
|---|---|---|
| Codex + Gemini 都有 | A(2) → B(2) → Claude(1) → 用户 | 5 |
| 只有一个工具 | 工具(2) → Claude(1) → 用户 | 3 |
| 无工具 | Claude → 用户（既有行为） | 不变 |

每次升级后的模型都会拿到上一个模型的分支作为参考。完整技能定义见 `external-tools` 技能。

### 健康检查

```bash
/external-tools-health
```

检查所有已配置适配器的安装、认证与可达性。

---

## 视觉评审

`visual-review` 技能让 Agent 能用 Playwright 对网页、演示文稿与 UI 截图做视觉检查。这弥补了 Agent 看不见渲染结果的缺口。

### 用法

任务涉及视觉产出（Web UI、Reveal.js 演示文稿、落地页、邮件模板）时触发本技能。它按可配置的视口尺寸截图，Agent 据此分析布局、排版、颜色、间距与内容问题。

### 前置条件

```bash
npx playwright install chromium
```

在远程/无头环境中，本技能通过 HTTP 文件服务器提供截图，方便用户在本地浏览器查看。

完整工作流见 `visual-review` 技能。

---

## 工作流总览

```
GitHub Issue #123（agent-ready 标签）
        │
        ▼
┌─────────────────────────────────────┐
│        Issue 编排者                  │
│  创建 BEADS epic，分派工作            │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        调研阶段                      │
│  调研 Agent 探查代码库               │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        规划阶段                      │
│  架构 Agent 产出方案                 │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        方案评审门禁                  │
│  3 位对抗性评审者：                   │
│  可行性、完整性、范围与对齐            │
│  三者必须全部通过                     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   外部依赖探测                       │
│   扫描规格中的 API key/凭据          │
│   提示用户配置                       │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   方案校验（起飞前）                  │
│   架构、依赖、API 契约               │
│   安全、UI/UX、外部依赖              │
└─────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    设计评审门禁（并行）                                    │
│                                                                           │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────┐ │
│  │  产品   │ │  架构师   │ │  设计师   │ │  安全    │ │UX 评审 │ │  CTO  │ │
│  │（用户） │ │ （技术）  │ │（UX/API）│ │（威胁）  │ │（流程）│ │（TDD）│ │
│  └─────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ └───────┘ │
│                                                                           │
│  六者必须全部通过（最多 3 次迭代）                                         │
└──────────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       工作单元拆解                   │
│  把方案拆成带完成定义的工作单元        │
│  构建依赖图                          │
└─────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│           编排式执行循环（逐个工作单元）                        │
│                                                                │
│   ┌──────────┐    ┌──────────┐    ┌──────────────┐   ┌──────┐ │
│   │  实现    │───→│  验证    │───→│  对抗性评审  │──→│ 提交 │ │
│   │（编码）  │    │（编排者）│    │              │   │      │ │
│   └──────────┘    └──────────┘    └──────┬───────┘   └──────┘ │
│        ▲                                 │ FAIL                │
│        └─────────────────────────────────┘                     │
│                                                                │
│   什么都不信。一切都要验证。以对抗方式评审。                    │
└───────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   最终整体评审                       │
│   跨单元集成检查                     │
│   全量测试套件 + 类型检查             │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   PR 创建（自动监护）                │
│   bin/create-pr-with-shepherd.sh     │
│   → 自动调用 pr-shepherd 技能        │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       PR 监护者（自动）              │
│  监控 CI、处理评审、                  │
│  自动解决讨论线程                     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       人类批准与合入                  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       发布工程师                     │
│  合入前验证 → 合入 → CI →            │
│  部署 → 部署后 QA → 发布             │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│       关闭 Epic 并沉淀经验            │
└─────────────────────────────────────┘
```

### GTG（Good-To-Go）合入门禁

GTG 是最终的合入门禁。它把 CI 状态、评论分类与线程解决状态合并成一次确定性的检查。Agent 应把它当作首要的就绪信号：

```bash
# 检查 PR 是否可合入
gtg <PR_NUMBER> --format json \
  --exclude-checks "Merge Ready (gtg)" \
  --exclude-checks "CodeRabbit" \
  --exclude-checks "Cursor Bugbot" \
  --exclude-checks "claude"
```

**状态值**：`READY`（可合入）、`ACTION_REQUIRED`（需修评论）、`UNRESOLVED_THREADS`（需解决线程）、`CI_FAILING`（需修 CI）。`action_items` 数组会明确告诉 Agent 该改什么。

**GTG 只报告，Agent 负责行动**：GTG 不解决线程、也不改代码。处理完反馈后，Agent 必须自行按 `handle-pr-comments.md`（第 3 节：解决评审线程）中记录的 GraphQL mutation 解决线程。线程解决后，GTG 下次检查即会报告 `READY`。

若 CI 检查数据陈旧：`gh workflow run gtg.yml -f pr_number=<PR_NUMBER>`

### 自动 PR 评审循环

当 PR 经由 `bin/create-pr-with-shepherd.sh` 创建时，脚本会输出启动监控的指引：

1. **创建 PR**，带正确的标题与正文
2. **启动 pr-shepherd**：`/pr-shepherd <pr-number>`
3. **PR 监护者监控**：CI 状态、评审评论、线程解决
4. **自动修复**：你代码中的 lint、类型错误、测试失败
5. **就绪时报告**：全部 CI 通过、全部线程已解决

对于手工创建的 PR，运行 `/pr-shepherd <pr-number>` 启动监控循环。

---

## BEADS 命令参考

### Issue 管理

```bash
# 为 GitHub Issue 创建 epic
bd create "Feature: User Auth" --type epic --issue 123

# 在 epic 下创建任务
bd create "Research auth patterns" --type task --parent bd-abc123

# 添加依赖
bd dep add <blocked-task> <blocking-task>

# 更新状态
bd update <task-id> --status open|in_progress|blocked|closed

# 带原因关闭
bd close <task-id> --reason "Completed successfully"
```

### 任务发现

```bash
# 显示就绪（未被阻塞）的任务
bd ready --json

# 列出 epic 下的全部任务
bd list --parent <epic-id>

# 显示被阻塞的任务
bd blocked

# 显示任务详情
bd show <task-id> --json
```

### 用于自定义状态的标签

```bash
# 等待人类输入
bd label add <task-id> waiting:human

# 等待 CI
bd label add <task-id> waiting:ci

# Agent 失败，需要人工介入
bd label add <task-id> agent:failed

# 评审迭代计数
bd label add <task-id> review:iteration-1
```

### 同步操作

```bash
# 检查同步状态
bd sync --status

# 从 main 拉取更新
bd sync --from-main

# 导出为 JSONL
bd export
```

---

## 开始处理一个 Issue

### 第 1 步：确认 Issue 已就绪

```bash
# 检查 Issue 是否带 agent-ready 标签
gh issue view 123 --json labels | jq '.labels[].name' | grep agent-ready
```

### 第 2 步：创建 BEADS Epic

```bash
# 取 Issue 详情
ISSUE=$(gh issue view 123 --json title,body,number)

# 创建与 Issue 关联的 epic
bd create "$(echo $ISSUE | jq -r .title)" --type epic --issue 123 --json
```

### 第 3 步：发布认领声明

```bash
gh issue comment 123 --body "🤖 Agent claiming this issue. BEADS epic created."
```

### 第 4 步：生成 Issue 编排者

用 Task 工具生成 Issue 编排者 Agent：

```typescript
Task({
  subagent_type: "general-purpose",
  description: "Issue Orchestrator for #123",
  prompt: `You are the ISSUE ORCHESTRATOR agent.

Read the agent definition at:
./agents/issue-orchestrator.md

Your task:
- Epic ID: <epic-id>
- GitHub Issue: #123
- Begin the orchestration workflow

Follow the workflow phases exactly as specified.`,
});
```

---

## 人类升级协议

### 何时升级

1. **需求含糊**：Issue 描述不清楚
2. **约束冲突**：无法同时满足所有要求
3. **风险决策**：涉及安全或数据问题
4. **阻塞超过 1 小时**：需要外部依赖
5. **3 次迭代失败**：Agent 无法解决该问题

### 如何升级

```bash
# 把任务标记为等待
bd update <task-id> --status blocked
bd label add <task-id> waiting:human

# 发到 GitHub Issue
gh issue comment <number> --body "$(cat <<'EOF'
## 🤖 Agent Request: <type>

**Task**: <task-id>
**Question**: <clear question>

### Options
1. **Option A**: <description>
2. **Option B**: <description>

### Agent Recommendation
<recommendation>

---
Reply: `@beads approve <task-id>` or `@beads respond <task-id> <option>`
EOF
)"
```

### 人类回复方式

```bash
# 批准被阻塞的任务
@beads approve bd-abc123

# 给出选择
@beads respond bd-abc123 "Use option A"

# 要求修改
@beads request-changes bd-abc123 "Need more error handling"

# 推迟处理
@beads defer bd-abc123 "Discuss in Monday standup"
```

---

## Agent 生成模式

### 串行生成

```typescript
// 先生成调研 Agent
const researchResult = await Task({
  subagent_type: "general-purpose",
  description: "Research for issue #123",
  prompt: researcherPrompt,
});

// 再带着调研产出生成架构 Agent
const planResult = await Task({
  subagent_type: "general-purpose",
  description: "Planning for issue #123",
  prompt: architectPrompt + researchResult,
});
```

### 并行生成

```typescript
// 并行生成代码评审与安全审计
const [reviewResult, securityResult] = await Promise.all([
  Task({
    subagent_type: "general-purpose",
    description: "Code review for #123",
    prompt: codeReviewPrompt,
  }),
  Task({
    subagent_type: "general-purpose",
    description: "Security audit for #123",
    prompt: securityAuditPrompt,
  }),
]);
```

---

## 知识集成

### 关键：开工前先「预热」

**所有 Agent 在开始任何工作之前，必须先预热自己的上下文。** 这能避免错误假设，并确保与既有模式对齐。

```bash
# 通用预热（加载关键规则 + 坑点）
bd prime

# 针对将要修改的具体文件预热
bd prime --files "src/lib/services/*.ts" "src/api/routes/*.ts"

# 针对具体主题预热
bd prime --keywords "authentication" "jwt"

# 按工作类型预热
bd prime --work-type planning     # 规划之前
bd prime --work-type implementation  # 写代码之前
bd prime --work-type review       # 评审之前
bd prime --work-type research     # 探查之前

# 组合使用（最彻底）
bd prime --files "<files>" --keywords "<topic>" --work-type <type>
```

prime 命令输出的相关事实按以下分类：

- **MUST FOLLOW**：关键规则（NEVER/ALWAYS/MUST 类陈述）
- **GOTCHAS**：应当避免的常见坑
- **PATTERNS**：本代码库的最佳实践
- **DECISIONS**：架构取舍

### 完成工作之后

跑自我反思，沉淀经验：

```bash
# 抓取近期 PR 评论（metaswarm 专有的 GitHub 集成）
GITHUB_TOKEN=$(gh auth token) npx tsx scripts/beads-fetch-pr-comments.ts --days 7

# 用 self-reflect 技能评估并写入经验
/self-reflect

# 压缩已关闭的 issue（通过 beads 插件做语义摘要）
bd compact
```

或生成知识管理员 Agent：

```typescript
Task({
  subagent_type: "general-purpose",
  description: "Extract learnings from epic",
  prompt: `Review completed epic <epic-id> and extract learnings.

FIRST: Run \`bd prime --work-type review\` to load context.

Then analyze:
- What patterns were used?
- What gotchas were discovered?
- What should future agents know?

Use the knowledge capture service to store learnings.`,
});
```

---

## 递归编排

对于大型 epic，编排者可以生成子编排者。模式如下：

```text
Epic（Issue 编排者）
├── 子 Epic A（子编排者）
│   ├── 任务 A1
│   └── 任务 A2
├── 子 Epic B（子编排者）
│   ├── 任务 B1
│   └── 任务 B2
└── 集成任务（被 A + B 阻塞）
```

**何时拆解**：如果一个 epic 超过 5–7 个任务，或横跨多个领域（例如前端 + 后端 + Schema），就拆成子 epic。

```bash
# 在父 epic 下创建子 epic
bd create "Sub-Epic: API layer" --type epic --parent <parent-epic-id>
bd create "Sub-Epic: UI components" --type epic --parent <parent-epic-id>

# 每个子 epic 有各自的编排者
# 父编排者负责协调完成
```

每个子 epic 的编排者都独立走同一套工作流（调研 → 规划 → 评审 → 实现 → PR）。父编排者监控进度并协调最终集成。

---

## 成功标准清单

关闭 epic 之前，逐项确认：

- [ ] 设计评审之前已通过方案校验（起飞前检查）
- [ ] 已识别外部依赖，并已提示用户提供凭据
- [ ] 工作单元已拆解，带完成定义条目与文件范围
- [ ] 每个工作单元都通过了四阶段执行循环
- [ ] 所有质量门禁都作为阻塞式状态迁移执行（无建议性跳过）
- [ ] 覆盖率门槛按 `.coverage-thresholds.json` 达标
- [ ] 所有对抗性评审结论均为 PASS（重审时使用全新评审者）
- [ ] `SERVICE-INVENTORY.md` 已更新全部新增服务/工厂/模块
- [ ] 项目上下文文档已维护并传递给每个编码子代理
- [ ] 最终整体评审已完成（跨单元集成）
- [ ] 所有人类检查点均已确认
- [ ] epic 下所有 BEADS 任务均已关闭
- [ ] PR 已创建并关联到 GitHub Issue
- [ ] 所有 CI 检查通过
- [ ] 所有 PR 评论已处理
- [ ] 所有 PR 线程已解决
- [ ] 人类已批准合入
- [ ] PR 已合入 main
- [ ] GitHub Issue 已关闭
- [ ] 经验已沉淀到知识库

---

## 故障排查

### 任务卡在 in_progress

```bash
# 检查任务状态
bd show <task-id> --json

# 检查是否有孤儿 Agent
# 若 Agent 已失败，重置并重试
bd update <task-id> --status open
bd label remove <task-id> agent:failed
```

### 循环依赖

```bash
# 运行 doctor 检测
bd doctor

# 若发现，重构依赖关系
bd dep remove <task1> <task2>
```

### BEADS 同步问题

```bash
# 检查同步状态
bd sync --status

# 强制导出
bd export

# 从 main 拉取
bd sync --from-main
```

---

## 目录结构

```
skills/start/                   # 本技能（主编排）
├── SKILL.md                    # 本文件
├── agents/                     # Agent 定义
│   ├── issue-orchestrator.md   # 主协调者（驱动四阶段循环）
│   ├── researcher-agent.md     # 代码库探查
│   ├── architect-agent.md      # 实现方案规划
│   ├── product-manager-agent.md # 用例与用户收益评审
│   ├── designer-agent.md       # UX/API 设计评审
│   ├── security-design-agent.md # 安全威胁建模
│   ├── cto-agent.md            # TDD 就绪度评审
│   ├── coder-agent.md          # TDD 实现
│   ├── code-review-agent.md    # 内部代码评审（协作 + 对抗两种模式）
│   ├── security-auditor-agent.md # 安全评审（实现层）
│   ├── release-engineer-agent.md # 合入 → 部署 → 验证 → 发布
│   └── pr-shepherd-agent.md    # PR 生命周期管理
├── guides/                     # 开发指南
│   ├── agent-coordination.md   # 团队模式、Agent 间消息
│   ├── git-workflow.md         # 分支命名、提交约定
│   ├── testing-patterns.md     # TDD 工作流、mock 策略
│   ├── coding-standards.md     # 语言惯例、命名约定
│   ├── worktree-development.md # 用 worktree 并行开发
│   └── build-validation.md     # push 前检查、CI 流水线
├── rubrics/                    # 评审量规
│   ├── plan-review-rubric.md   # CTO Agent 使用
│   ├── code-review-rubric.md   # 代码评审 Agent 使用（协作模式）
│   ├── adversarial-review-rubric.md # 代码评审 Agent 使用（对抗模式）
│   ├── security-review-rubric.md # 安全审计 Agent 使用
│   └── release-engineering-rubric.md # 发布工程师 Agent 使用
└── references/                 # 其他工具的参考文档
    ├── codex-tools.md          # OpenAI Codex CLI 参考
    ├── cursor-tools.md         # Cursor 工具参考
    └── opencode-tools.md       # OpenCode 工具参考

skills/orchestrated-execution/  # 四阶段执行循环模式
└── SKILL.md

skills/design-review-gate/      # 设计评审门禁编排者
└── SKILL.md

skills/brainstorming-extension/  # 把头脑风暴接到评审门禁
└── SKILL.md

skills/plan-review-gate/        # 3 位对抗性评审者校验方案
└── SKILL.md

skills/external-tools/          # 外部 AI 工具委托
├── SKILL.md
├── adapters/
│   ├── _common.sh              # 共享适配器辅助函数（14 个）
│   ├── codex.sh                # OpenAI Codex CLI 适配器
│   └── gemini.sh               # Google Gemini CLI 适配器
└── rubrics/
    └── external-tool-review-rubric.md  # 跨模型对抗性评审使用

skills/visual-review/           # 基于 Playwright 的视觉评审
└── SKILL.md

commands/                       # 斜杠命令（以 /metaswarm:command-name 调用）
├── start-task.md               # /metaswarm:start-task
├── prime.md                    # /metaswarm:prime
├── review-design.md            # /metaswarm:review-design
├── self-reflect.md             # /metaswarm:self-reflect
├── pr-shepherd.md              # /metaswarm:pr-shepherd
├── handle-pr-comments.md       # /metaswarm:handle-pr-comments
├── create-issue.md             # /metaswarm:create-issue
└── metaswarm-setup.md          # /metaswarm:metaswarm-setup

templates/                      # 项目脚手架模板
├── CLAUDE.md                   # 新项目的完整 CLAUDE.md 模板
├── CLAUDE-append.md            # 追加到既有 CLAUDE.md 的 metaswarm 段落
├── UI-FLOWS.md                 # 用户流程与线框图文档模板
├── gitignore                   # 标准 Node.js/TypeScript 忽略项
├── SERVICE-INVENTORY.md        # 服务/工厂/模块跟踪模板
└── ci.yml                      # CI 流水线模板

.beads/                         # 运行时状态（在用户项目中）
├── beads.db                    # SQLite 数据库
├── issues.jsonl                # Issue/任务数据
└── knowledge/                  # 精选经验
    ├── codebase-facts.jsonl
    ├── patterns.jsonl
    └── anti-patterns.jsonl
```
