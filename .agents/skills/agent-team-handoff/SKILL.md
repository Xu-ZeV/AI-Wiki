---
name: agent-team-handoff
description: 当会话即将结束、上下文将被压缩、切换会话或机器，或用户要求 handoff/交接/续作时必须使用本 skill，用于产出自包含交接文档
license: MIT
metadata:
  author: AI-Wiki
  version: "1.0.0"
  source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-handoff/SKILL.md
  adapted_for: Codex 原生子代理多模型协作
  upstream_note: 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw/SkillHub/zh/metaswarm/original-en/，MIT 许可
---

# 零上下文交接（Handoff）

把一个**没有任何父会话历史的新子代理**继续工作所需的全部上下文，固化到一份自包含 Markdown 文档中，并用一句无歧义的收尾句完成交接：

> **Read `docs/handoffs/<file>.md` and do `<the next concrete action>`.**

---

## 何时使用

在以下情况使用本 skill：

- 会话即将结束。
- 上下文即将被压缩。
- 要切换机器、会话或执行环境。
- 用户明确要求 handoff、交接、保存当前状态或让另一个代理继续工作。
- 一个长任务需要派发全新子代理，而子代理无法看到编排者的历史消息。

不要在以下情况使用本 skill：

- 只是临时回答一个独立问题。
- 工作目标、完成标准、当前状态和下一步都已经写入当前任务的可见消息中，且不需要新代理接手。
- 用户没有要求交接，也没有出现上下文即将丢失的信号。

在 Codex 原生协作中，子代理默认**不带**父会话历史。因此，交接文档不是“辅助材料”，而是把编排者脑内上下文传给新子代理的唯一手段。除非用户、`AGENTS.md` 或本 skill 明确要求，否则不得派子代理；调用本 skill 即视为用户已授权派子代理。

---

## 输出契约

本 skill 只产出两份东西：

1. **一份交接文档**，路径为 `docs/handoffs/handoff-<YYYY-MM-DD-HHmm>.md`。目录不存在时先创建。文档必须自包含，并链接或直接引用下一位接手者必读的所有内容。
2. **一句收尾句**，且交接文档写完之后不再追加其他内容。格式如下：

   ```text
   Read docs/handoffs/handoff-2026-06-17-1432.md and do <YYY>.
   ```

   其中 `<YYY>` 是一个具体、可立即开始的下一步动作。合适的例子是“在 `src/config.ts:84` 实现 `parseConfig` 校验，并让 `tests/config.test.ts` 通过”。不合适的例子是“继续工作”或“看一下配置”。

---

## 八步方法

| 步骤 | 目标 | 必须完成的内容 |
|---|---|---|
| 1. 还原任务 | 明确“我们在做什么” | 用一到两句说明目标；列出可验证的完成标准；记录任务动机，避免后续代理重新争论已定决策。 |
| 2. 读取通用落盘状态 | 合并已有状态，不重复抄写 | 读取 `docs/plans/active-plan.md`、`docs/plans/project-context.md`、`docs/plans/execution-state.md`；有活跃计划时必须在交接文档中显式引用，并说明当前阶段。 |
| 3. 确认当前状态 | 区分“已完成”“未验证”“进行中”“未开始” | 已完成项必须给出证据，例如通过的测试、构建结果或提交 SHA；同时记录未提交改动、stash 和分支是否已推送。 |
| 4. 列出必读清单 | 让接手者先读对的材料 | 列出规格、设计文档、计划、代码锚点、测试和配置/质量门；每个条目说明“为什么重要”和“要看什么”。优先用 `file:line` 精确指针。 |
| 5. 选定唯一下一步 | 确定收尾句中的 `<YYY>` | 下一步必须可执行、具体、有边界。不要把整段剩余路线塞进下一步。 |
| 6. 写入交接文档 | 使用十节模板 | 每一节都要填写；确实不适用时写“无”，不要删除该节。 |
| 7. 输出交接句 | 给出唯一入口 | 输出一行且只有一行：`Read <文件> and do <动作>.`。不要再加评论。 |
| 8. 交接前自检 | 以零上下文读者的视角复核 | 确认仅凭这一份文档就能开始工作，所有引用真实有效，下一步清晰，决策不会丢失，质量门和验证命令完整。 |

---

## 交接文档十节模板

| 节 | 标题 | 必须包含 |
|---|---|---|
| 1 | Objective | 用一到两句说明目标、动机和期望结果。 |
| 2 | Definition of Done | 用可核验的验收标准列表描述“完成”的样子。 |
| 3 | Current Status | 分别列出已完成且已验证、已完成但未验证、进行中、未开始；并记录工作树状态。 |
| 4 | Required Reading | 列出接手前必须阅读的所有材料、原因和关注点。 |
| 5 | Key Decisions & Rationale | 记录已定决策、理由和被否决的替代方案。 |
| 6 | Code Map | 给出关键文件、函数、模块及其在当前任务中的角色。 |
| 7 | How to Verify | 写明测试、覆盖率、lint、构建或运行命令，以及“绿色”的具体表现。 |
| 8 | Open Questions / Blockers | 列出需要用户确认或外部依赖的问题；没有则写“无”。 |
| 9 | Next Action | 展开收尾句中的唯一下一步，包含文件、路径和起始方式。 |
| 10 | Remaining Work | 列出下一步之后的剩余工作，按执行顺序编号。 |

模板正文如下：

````markdown
# Handoff: <short title of the work>

**Date**: <YYYY-MM-DD HH:mm> · **Branch**: `<branch>` · **Author session**: <model/agent>

## 1. Objective
<1-2 sentences: what we are trying to accomplish and why.>

## 2. Definition of Done
- [ ] <verifiable acceptance criterion>

## 3. Current Status
**Done & verified:**
- <item> (evidence: <tests/commit>)

**Done, not yet verified:**
- <item>

**In progress (stopped here):**
- <the exact thing being worked on, and where/why it paused>

**Not started:**
- <remaining item>

### Working tree
- Branch `<branch>`, <pushed/not pushed>
- Uncommitted changes: <git status --short summary, or "clean">
- Recent commits:
  - `<sha>` <subject>

## 4. Required Reading
| # | Path / reference | Why it matters | What to look for |
|---|---|---|---|
| 1 | `<path>` | <reason> | <specific thing> |
| 2 | `<path:line>` | <reason> | <specific thing> |

## 5. Key Decisions & Rationale
- **<decision>** — <why; what alternatives were rejected and why>. Do not undo without reason.

## 6. Code Map
- `<file:line>` — <what lives here / its role in this task>
- Pattern to imitate: `<file>` — <why>

## 7. How to Verify
```bash
<test command>           # 例如 npm test
<lint/build command>
```
Expected: <what green looks like>.

## 8. Open Questions / Blockers
- <question needing the user, or external dependency>  - or "None"

## 9. Next Action
<The single concrete next step, expanded with any detail the one-liner cannot hold.>

## 10. Remaining Work
1. <subsequent step>
2. <...>
````

---

## 反模式

1. **下一步含糊**：不要写“从上次停下的地方继续”。必须点名文件和具体变更。
2. **假设共享记忆**：新子代理没有父会话历史。它不在文档里，就会丢失。
3. **粘贴整段记录**：要综合提炼。一个 40 行的定向摘要胜过 4000 行原始记录。
4. **引用过期路径**：引用前用只读命令抽查路径和行号，代码可能已经移动。
5. **隐藏未提交状态**：必须披露脏工作树、stash 和未推送提交。
6. **出现多个收尾句**：只能有一行 `Read <file> and do <action>.`。
7. **决策静默丢失**：已确定的决策要连同理由记录，否则后续会被重新打开。

---

## 与其他 skill 的关系

- 与上下文更新类 skill 互补：后者把长期知识写入知识库，本 skill 把当前任务的瞬时状态序列化给下一个代理。
- 与只读复核类 skill 互补：交接前可以派一个只读子代理独立检查文档是否自包含；交接后则由接手代理按文档执行。
- 与实现类 skill 的关系：交接文档负责保留目标、状态、决策和验证方式；实现类 skill 负责按这些约束完成变更。

---

## Codex 原生落地

本 skill 的 Codex 执行方式：

1. 在写完交接文档后，派一个全新只读子代理做交接前自检：

   ```text
   spawn_agent(
     message="Read docs/handoffs/handoff-2026-06-17-1432.md and verify that a zero-context agent can start the next action. Check every path, decision, verification command, and the closing sentence.",
     model="DeepSeek-V4.1-Flash",
     reasoning_effort="medium",
     fork_context=false
   )
   ```

2. 用 `wait_agent` 等待复核结果；若复核者缺少必要上下文，用 `send_input` 补充；复核结束后用 `close_agent` 关闭。
3. 可用模型只有两个：

   - `DeepSeek-V4.1-Flash`，支持 `low`、`medium`、`high`、`xhigh`。
   - `ccs-glm-5-3-flash/GLM-5.3-Flash`，显示名 `GLM-5.3-Flash`，上下文窗口 1M，支持 `low`、`high`、`max`。

4. 只读复核代理不应改写仓库文件。它的职责是确认交接文档是否能独立驱动下一步，并把缺口报回编排者。

---

## 血缘与许可

本 skill 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作。英文原件归档于 [raw/SkillHub/zh/metaswarm/original-en/handoff/](../../../raw/SkillHub/zh/metaswarm/original-en/handoff/SKILL.md)，采用 MIT 许可。
