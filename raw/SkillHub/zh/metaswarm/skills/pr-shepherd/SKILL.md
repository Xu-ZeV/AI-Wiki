---
name: pr-shepherd
description: 把 PR 监护到合入 —— 自动处理 CI 失败、评审评论与线程解决，直到全部检查通过
---

# pr-shepherd（PR 监护）

在 PR 已创建、需要被监护到合入时使用 —— 自动处理 CI 失败、评审评论与线程解决，直到全部检查通过、所有线程都已解决。

**重要**：本技能面向的是**在工作区（worktree）中干活的 Agent**，不是编排者。Agent 自己负责监护自己的 PR，从而让编排者保持空闲去处理其它工作。

## 协调模式说明

本技能同时支持两种协调模式：

- **Task Mode（默认）**：以单个长驻 `Task()` 运行，参数为 `run_in_background: true`。编排者通过 `TaskOutput(block: false)` 查询。
- **Team Mode**：作为 `issue-{number}` 团队中的常驻 `shepherd` teammate 运行。通过 `SendMessage` 异步上报状态（CI 失败、评审评论、全绿、PR 已合入）。编排者可以回传指令（例如「那条评论先延后，改成建一个 Issue」）。收到 `shutdown_request` 时优雅退出。

两种模式下的监控、修复与评审处理逻辑完全一致。模式检测方式见 `./guides/agent-coordination.md`。

---

## 何时激活

下列任一条件为真时激活本技能：

- Agent 刚用 `gh pr create` 创建了 PR
- 用户要求「shepherd」「monitor」或「see through」某个 PR
- 用户调用 `/pr-shepherd <pr-number>`
- 用户要求「watch this PR」或「handle this PR until it's merged」
- 编排者带着「监护某个 PR」的指令把你派出来
- **自动激活**：使用了 `bin/create-pr-with-shepherd.sh`（它会输出 shepherd 指令）

### 通过包装脚本自动激活

当 `bin/create-pr-with-shepherd.sh` 创建 PR 时，它会输出 shepherd 指令：

```text
==========================================
  PR Shepherd Active for PR #123
==========================================

The pr-shepherd skill will:
  - Monitor CI/CD status
  - Auto-fix lint, type, and test issues
  - Handle review comments
  - Resolve threads after addressing feedback
  - Report when PR is ready to merge

To manually invoke shepherd later:
  /pr-shepherd 123
```

看到这段输出时，**立即用其中显示的 PR 编号调用 pr-shepherd 技能**。

## 开始时先声明

「我正在使用 pr-shepherd 技能把这个 PR 监护到合入。我会盯 CI/CD、处理评审评论，并在问题出现时修复。」

## 给编排者：派出带 PR 监护职责的 Agent

当派出一个在工作区中干活的 Agent 时，把 PR 监护写进任务提示词：

```text
Work in worktree at /path/to/worktree on branch feature/xyz.

Task: [describe the implementation task]

After creating the PR:
1. Use the pr-shepherd skill to monitor it through to merge
2. Handle CI failures and review comments autonomously
3. Only escalate to orchestrator for complex issues requiring user input
4. Report back when PR is ready to merge or if blocked

Run in background so I can continue other work.
```

**核心原则**：Agent 拥有自己的 PR 生命周期。编排者只管派发，需要时再通过 `AgentOutputTool` 回来查看。

## 状态机

Agent 始终处于以下状态之一：

```text
MONITORING → FIXING → MONITORING → WAITING_FOR_USER → FIXING → MONITORING → DONE
```

| 状态 | 发生什么 | 何时退出 |
| --- | --- | --- |
| `MONITORING` | 后台每 60 秒轮询 CI 与评审 | CI 失败、出现新评论、全部完成，或需要帮助 |
| `FIXING` | 按 TDD 修复问题，并跑本地校验 | 本地校验通过，或需要用户指导 |
| `HANDLING_REVIEWS` | 调用 `handling-pr-comments` 技能 | 评论已处理完，或需要用户输入 |
| `WAITING_FOR_USER` | 呈现选项，等待用户决定 | 用户回复 |
| `DONE` | 所有 CI 绿灯 + 所有线程已解决 | 成功退出 |

## 阶段 1：初始化

```bash
# Get PR info
PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null)
OWNER=$(gh repo view --json owner -q .owner.login)
REPO=$(gh repo view --json name -q .name)

# If no PR on current branch, check if number was provided
if [ -z "$PR_NUMBER" ]; then
  echo "No PR found for current branch. Provide PR number."
  exit 1
fi

echo "Shepherding PR #$PR_NUMBER"
```

## 阶段 2：监控循环（后台）

每 60 秒运行一次 GTG，把它作为判断 PR 是否就绪的**唯一真相来源**：

### 主要检查：GTG（Good-To-Go）

GTG 把 CI 状态、评论分类与线程解决情况合并成一次调用。用它替代分散的多条 API 查询。

```bash
# Primary readiness check — structured JSON output
GTG_RESULT=$(gtg $PR_NUMBER --repo "$OWNER/$REPO" --format json \
  --exclude-checks "Merge Ready (gtg)" \
  --exclude-checks "CodeRabbit" \
  --exclude-checks "Cursor Bugbot" \
  --exclude-checks "claude" 2>&1)

STATUS=$(echo "$GTG_RESULT" | jq -r '.status')
ACTION_ITEMS=$(echo "$GTG_RESULT" | jq -r '.action_items[]?' 2>/dev/null)
CI_STATE=$(echo "$GTG_RESULT" | jq -r '.ci_status.state')
```

**GTG 状态：**

| 状态 | 含义 | Agent 动作 |
| --- | --- | --- |
| `READY` | 所有 CI 绿灯、所有线程已解决 | → DONE |
| `ACTION_REQUIRED` | 有可执行的评论需要修复 | → HANDLING_REVIEWS（使用 `action_items`） |
| `UNRESOLVED_THREADS` | 仍有未关闭的评审线程 | → HANDLING_REVIEWS |
| `CI_FAILING` | 一个或多个 CI 检查失败 | → FIXING |
| `ERROR` | 拿不到 PR 数据 | 60 秒后重试，重试 3 次后升级 |

**GTG 只报告，Agent 才动手**：GTG 不会解决线程，也不会改代码 —— 它只告诉你什么在阻塞。处理完反馈后，你必须自己用 `handle-pr-comments.md`（第 3 节）里的 GraphQL mutation 来解决线程。线程解决后，GTG 会在下一次轮询时报告 `READY`。

### 判断状态转移

```text
if STATUS == "READY":
  → DONE

if STATUS == "CI_FAILING":
  → Parse action_items for specific failures
  → if is_simple_failure(failure): FIXING
  → else: WAITING_FOR_USER

if STATUS == "ACTION_REQUIRED" or STATUS == "UNRESOLVED_THREADS":
  → HANDLING_REVIEWS (action_items tells you exactly what to fix)

if STATUS == "ERROR":
  → Retry, then escalate
```

### 兜底：手工检查

若 GTG 不可用（例如环境中没有安装），改用下面的手工查询：

```bash
# CI status
FAILED_CHECKS=$(gh pr checks $PR_NUMBER --json name,conclusion --jq '[.[] | select(.conclusion == "FAILURE")] | length')

# Unresolved threads
UNRESOLVED=$(gh api graphql -f query='
  query($owner: String!, $repo: String!, $pr: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $pr) {
        reviewThreads(first: 100) {
          nodes { isResolved }
        }
      }
    }
  }
' -f owner="$OWNER" -f repo="$REPO" -F pr="$PR_NUMBER" \
  --jq '[.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)] | length')
```

### 重新触发 GTG 的 CI 检查

当线程已解决、但 `Merge Ready (gtg)` 这个 GitHub Actions 检查状态陈旧时：

```bash
gh workflow run gtg.yml -f pr_number=$PR_NUMBER
```

## 阶段 3：修复问题

### 简单问题（自动修复）

下面这些无需用户批准即可修复：

- Lint 失败 → 跑 linter
- Prettier 失败 → 跑格式化工具
- 类型错误 → 修类型
- **你自己写的**代码里的测试失败 → 按 TDD 修复

### 复杂问题（需要批准）

下面这些在修复**之前**必须先取得用户输入：

- 不是你写的代码里的测试失败
- 基础设施 / 配置类失败
- 含义含糊的错误
- 任何你拿不准的情况

### FIXING 状态规则

1. **使用 TDD** —— 代码改动调用 `superpowers:test-driven-development`
2. **杀掉残留的测试进程** —— 跑测试前先执行 `pkill -f vitest 2>/dev/null || true`
3. **绿灯之前不离开** —— 直到 `pnpm lint && pnpm typecheck && pnpm test --run && pnpm test:coverage` 全部通过才离开 FIXING
4. **验证过才推送** —— 绝不推送本地校验或覆盖率门槛不通过的代码
5. **推送后回到 MONITORING** —— 让 CI 跑起来，继续监控

```bash
# Kill stale vitest processes before running tests
pkill -f vitest 2>/dev/null || true

# After fixing, always validate locally (including coverage)
pnpm lint && pnpm typecheck && pnpm test --run && pnpm test:coverage

# Only push if all pass (including coverage thresholds)
git add -A && git commit -m "fix: <description>" && git push
```

## 阶段 4：处理评审

检测到新的评审评论时：

1. 调用 `handling-pr-comments` 技能
2. 该技能负责分类、修复、回复与线程解决
3. **关键：handling-pr-comments 技能内含一个迭代循环**
4. 回到 MONITORING 之前，**所有线程都必须已解决**
5. 若某个线程无法解决（需要评审者澄清），就向评论作者提问请求跟进
6. 只有满足以下条件才回到 MONITORING：
   - 所有线程都已解决，并且
   - 推送后的验证确认没有出现新评论

### 强制迭代

**头号失败模式**：只走了一轮、没有检查新评论就回到 MONITORING。

`handling-pr-comments` 技能的阶段 7（推送后迭代检查）必须成功完成，才能退出 HANDLING_REVIEWS 状态。该技能会自动迭代：

```text
HANDLING_REVIEWS:
  → handling-pr-comments skill (Phases 1-7)
  → IF Phase 7 finds new comments: skill re-runs Phases 1-7
  → IF Phase 7 confirms no new comments: exit to MONITORING
```

**不要**手动覆盖或跳过阶段 7。如果你发现自己想跳过迭代，那你正要犯下头号错误。

### 范围外的评论

评审者可能会对 PR diff 之外的代码留下评论。`handling-pr-comments` 技能会处理这些，但要点是：

- **默认把范围外当作范围内** —— 尊重评审者反馈
- 用 **ultrathink** 评估修复是否足够快（< 30 分钟、< 3 个文件）
- 若简单：立即修复，并说明它原本在范围之外
- 若复杂：创建一个 GitHub Issue，并在该线程回复中链接它
- **始终回复并解决** —— 绝不让范围外的线程悬着

## 阶段 5：等待用户

需要用户输入时，永远：

1. **清晰地呈现情况**
2. **给出 2–4 个带利弊的选项**
3. **说明你的推荐**
4. **允许用户选择，或提出他们自己的方案**

### 模板

```text
[Describe what happened]

**Options:**

1. **[Option name]** (Recommended)
   - [What it involves]
   - Pros: [benefits]
   - Cons: [drawbacks]

2. **[Option name]**
   - [What it involves]
   - Pros: [benefits]
   - Cons: [drawbacks]

3. **[Option name]**
   - [What it involves]
   - Pros: [benefits]
   - Cons: [drawbacks]

Which approach would you like? (Or describe a different approach)
```

### 用户回复之后

- 若用户选了编号选项 → 按该方案推进 → FIXING
- 若用户描述了替代方案 → 按用户方案推进 → FIXING

## 阶段 6：软超时（4 小时）

已过 4 小时时，暂停并做一次 checkpoint：

```text
**PR Shepherd Checkpoint** (4 hours elapsed)

Current status:
- CI: [status]
- Threads: [X] resolved, [Y] unresolved
- Commits: [N] fix commits pushed

**Options:**

1. **Keep monitoring** (Recommended)
   - Continue for another 4 hours
   - Pros: PR may get reviewed soon
   - Cons: Ties up agent resources

2. **Exit with handoff**
   - Save status report, exit cleanly
   - Pros: Frees resources
   - Cons: Must manually re-invoke later

3. **Set shorter check-in**
   - Check back in 1 hour instead of 4
   - Pros: More frequent checkpoints
   - Cons: More interruptions

What would you like to do? (Or describe a different approach)
```

## 退出条件

### 成功（DONE）

以下条件**全部**为真时才成功退出：

- 所有 CI 检查通过
- **每一条**代码评审评论都已处理（修复或解释 —— 一条都不能忽略）
- 所有评审线程已解决（未解决数为零）
- 没有待答问题
- PR 已 squash-merge 到 main（不只是「ready to merge」，而是真的已合入）

报告：

```text
**PR #[number] Ready to Merge**

- CI: All checks passing
- Reviews: All threads resolved
- Commits: [N] total ([M] fix commits)

The PR is ready for final approval and merge.
```

### 完成后的 RAM 清理

PR 合入、知识沉淀任务创建完成后，调用自动 RAM 清理以释放资源：

```text
/auto-ram-cleanup
```

**为什么**：开发过程中（测试进程、构建 watcher、语言服务器）会不断累积。合并后清理可为下一个任务腾出内存。

**保留运行的**：

- Docker 容器（数据库 / 服务需要）
- 必要的 IDE 进程

**会被清理的**：

- 孤儿的测试进程（vitest、jest）
- 不再需要的构建 watcher
- 重复的语言服务器实例
- 其它开发工具残留

## 阶段 7：合入后验证与兜底知识沉淀

**首选路径**：self-reflect 应当已在建 PR **之前**跑过（见 orchestrated-execution 第 8.5 节），知识库改动作为 PR 的一部分一并提交。本阶段负责验证这一点确实发生了，并处理兜底情况。

**兜底**：若建 PR 之前**没有**跑 self-reflect（例如该 PR 出自编排流程之外），则在合入后创建一个阻塞性的知识沉淀任务。

### 当 PR 已合入

检测到 PR 已合入（或用户手动合入）之后：

```bash
# Check if PR was merged
MERGED=$(gh pr view $PR_NUMBER --json merged -q .merged)

if [ "$MERGED" = "true" ]; then
  # Create a task for knowledge curation
  # Use your project's task tracking system
  echo "Create task: Curate learnings from PR #$PR_NUMBER"

  # If there's an associated epic, add this task as a blocker
  # (The epic can't close until learnings are extracted)
fi
```

**注意**：self-reflect（`/self-reflect`）本应在 PR 创建**之前**就跑过（见 orchestrated-execution 技能第 8.5 节）。若被跳过，现在就作为兜底补跑 —— 但更推荐在建 PR 之前、实现上下文最新鲜的时候跑。

### 向用户报告

创建沉淀任务时：

````text
**PR #[number] Merged Successfully**

Created blocking task: [CURATION_TASK_ID]
- Title: "Curate learnings from PR #[number]"
- Status: pending
- Blocker for: [epic if applicable]

To extract learnings, invoke:
```
/curate-pr-learnings [number]
```

The command will:
1. Fetch PR comments (deterministic script)
2. AI analyzes and extracts learnings (your job)
3. Store validated learnings (deterministic script)

Then close the task.
````

### 为什么这很重要

1. **安全**：Webhook 触发的代码执行是一个攻击面。CLI / Agent 调用更安全。
2. **阻塞任务**：epic 在经验被沉淀之前无法关闭，从而保证知识被捕获。
3. **Agent 自主**：Agent 可以接起沉淀任务并处理它。
4. **人工监督**：人类也可以通过 CLI 脚本手动运行沉淀。

### 完成 epic 时：从对话中沉淀经验

当这个 PR 完成了一个 **epic**（关闭最后一个阻塞任务）时，你还**必须**从对话历史中沉淀经验。特性开发里往往包含最丰富的架构讨论。

**检测 epic 完成：**

> **注意**：本模式假设单 epic 工作流。若有多个 epic 正在进行，
> `.[0]` 只会选中第一个，未必是与本 PR 相关的那个。
> 多 epic 项目请手动把 PR 的任务关联到它所属的阻塞 epic。

```bash
# Check if this PR closes an epic (assumes single in-progress epic)
# Use your project's task tracking system to check epic status
```

**若 epic 正在完成：**

1. 创建一个用于对话沉淀的任务
2. 向用户报告该任务：

   ```text
   **Epic Completion Detected**

   This PR completes the epic. Created conversation extraction task.

   Before closing the epic, extract learnings from conversations.
   ```

**为什么要从对话中沉淀经验？**

- **战略洞见**：架构决策、讨论过的取舍
- **调试发现**：几小时排查后找到的根因
- **非显而易见的行为**：那些「原来是这样……」的时刻
- **集成怪癖**：引发问题的 API 行为

这些经验往往**不在**代码评审评论里 —— 它们在往复的对话之中。

### 带交接的超时

若用户在 checkpoint 选择退出：

```text
**PR #[number] Shepherd Handoff**

Status at exit:
- CI: [status]
- Threads: [X] resolved, [Y] unresolved
- Last activity: [timestamp]

To resume: `/pr-shepherd [number]`
```

## 调用的技能

| 场景 | 技能 |
| --- | --- |
| 出现新的评审评论 | `handling-pr-comments` |
| 需要代码改动 | `superpowers:test-driven-development` |
| 复杂调试 | `superpowers:systematic-debugging` |

## 强制完成前检查

**阻塞性**：在宣告任何 PR 就绪**之前**，你**必须**运行下面这个脚本并展示它的输出：

```bash
bin/pr-comments-check.sh <PR_NUMBER>
```

该脚本：

- 所有评论都已处理时返回退出码 0
- 只要存在任何未处理的评论就返回退出码 1
- 逐条显示每个评论的状态

**若脚本显示任何未处理的评论，你就没有完成。** 逐条处理这些评论：

对每一条尚未回复的顶层评论（`in_reply_to_id` 为 null）：

1. 若可执行 → 修复它，并回复确认已修复
2. 若在范围外 → 回复说明延后原因（必要时创建 Issue）
3. 若不同意 → 回复并说明理由
4. **绝不静默忽略**

在每一条顶层评论都得到回复之前，PR 都不算就绪。

## 验证清单

退出 DONE 状态之前：

- [ ] 所有 CI 检查绿灯
- [ ] 所有评审线程已解决
- [ ] 没有待答的用户问题
- [ ] 已向用户报告最终状态

PR 合入之后（阶段 7）：

- [ ] 已创建知识沉淀任务
- [ ] 已把该任务加为 epic 的阻塞项（若适用）
- [ ] 已向用户报告沉淀任务 ID
- [ ] 已确认 `/self-reflect` 在建 PR 前跑过（若没有，现在作为兜底补跑）

所有合入后任务完成之后：

- [ ] 已运行 `/auto-ram-cleanup` 释放开发资源
- [ ] 已确认 Docker 容器仍在运行（若需要）

## 常见错误

### 头号错误：没有检查新评论就回到 MONITORING

- 推送修复并回复线程之后，你**必须**运行阶段 7
- 自动评审机器人（CodeRabbit、Cursor）会分析每一个 commit
- 新评论常常在你推送后 1–2 分钟内出现
- 跳过阶段 7，你就会漏掉新评论并过早宣告完成

**未经本地校验就推送**

- 绝不推送未通过 `pnpm lint && pnpm typecheck && pnpm test --run && pnpm test:coverage` 的代码

**擅自自动修复复杂问题**

- 拿不准就问。复杂问题永远走 WAITING_FOR_USER。

**忘记调用 handling-pr-comments**

- 新评论到来时委派给该技能。不要自己行内处理评论。

**不给用户呈现选项**

- 永远给出 2–4 个带利弊的选项。绝不只是问「我该怎么办？」

**过早离开 FIXING 状态**

- 本地校验通过之前留在 FIXING。不要假设某个修复已经生效。

**跳过 handling-pr-comments 的迭代循环**

- 该技能有阶段 1–7 与一个明确的迭代循环
- 阶段 7 会在你推送修复后检查新评论
- 若阶段 7 发现新评论，技能会回到阶段 1 重新开始
- 不要提前退出 —— 让该技能走完完整迭代
