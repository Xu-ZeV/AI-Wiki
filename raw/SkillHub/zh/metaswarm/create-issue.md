---
title: 自包含 GitHub Issue 生成
slug: create-issue
archived_at: 2026-10-10
archived_from: wiki/SkillHub/skills/create-issue.md
origin_repo: dsifry/metaswarm
source_note: 本页为中文归纳稿；逐段全译见 skills/create-issue/SKILL.md
archive_reason: metaswarm 框架专有，Codex 原生子代理工作流不适用
---
# 自包含 GitHub Issue 生成

> [!note] 归档原始资料
> 本文是 metaswarm 框架技能文档的中文归纳稿。因框架专有（BEADS 任务库、`bd` / `gtg` CLI、插件 marketplace、GitHub Issue 到 PR 的全自动流水线、Claude / Gemini 平台适配）且本机不适用，已于 2026-10-10 从 `wiki/SkillHub` 下架，移入 raw 原始资料层留存。
> 文中机制在本机不存在，请勿按此执行；Codex 原生子代理协作方案见项目内 `.agents/skills/`。

> [!info] Skill 元信息
> 原始名称：`create-issue`  
> 原始标题：Create GitHub Issue Skill  
> 功能分类：多Agent团队协作  
> 原始文件：本页为中文归纳稿；逐段全译见 [skills/create-issue/SKILL.md](./skills/create-issue/SKILL.md)  
> 上游仓库：[dsifry/metaswarm](https://github.com/dsifry/metaswarm)  
> 许可证：MIT

## 中文含义与用途

中文含义：生成带 TDD 计划、验收标准与 Agent 自主运行指令的完整 GitHub Issue。  
核心用处：把 Issue 变成一份**自包含的工作包**，让 Agent 无需追问即可从实现一路走到合并。每份 Issue 都包含问题/特性说明、技术规范（类型、Schema、API 设计）、TDD 实现计划、验收标准清单，以及覆盖“实现 → 评审 → 合并”全生命周期的 Agent Instructions。

## 交互流程

`/create-issue` 依次询问 5 项信息，然后套用对应模板生成 Issue：

1. **Issue 类型**：Feature（新功能）/ Bug（缺陷）/ Refactor（重构）；
2. **简要描述**：1–2 句话；
3. **复杂度评估**：Simple（< 1 天）/ Medium（2–5 天）/ Complex（> 1 周）；
4. **上下文收集**：相关文件、服务或 Issue，或回答 `explore codebase` 让 Agent 自行调研；
5. **生成 Issue**。

## 三类模板

| 模板 | 差异 |
| --- | --- |
| **Feature** | 完整结构：Summary → Problem（Evidence / Scope：IN SCOPE 与 OUT OF SCOPE）→ Architecture Decision → Technical Specification → TDD Implementation Plan（Cycle 1 正常路径 / Cycle 2 错误处理 / Cycle 3 边界 / Cycle 4 集成）→ Error Handling 表 → Implementation Phases → Files to Create/Modify → Acceptance Criteria → Agent Instructions |
| **Bug** | 沿用 Feature 模板，标题用 `fix: ...`；把 “Problem” 换成 Bug Report（Priority P0–P3、受影响用户、首次报告时间、Expected / Actual Behavior、复现步骤、根因分析、证据）；把 TDD 计划换成两条测试用例（验证修复 + 回归测试） |
| **Refactor** | 沿用 Feature 模板，标题用 `refactor: ...`；在 Summary 之后补 Background 与被处理的评审反馈引用（原始 PR、评论人）；在验收标准中追加“公共 API 无破坏性变更、既有测试不改动仍全绿、性能不劣化” |

## 验收标准清单

Issue 模板里的 Acceptance Criteria 是可直接勾选的真实条目：

- [ ] 全部 TDD 周期已实现且测试通过
- [ ] TypeScript 零错误（`pnpm typecheck`）
- [ ] Lint 零告警（`pnpm lint`）
- [ ] 全部测试通过（`pnpm test --run`）
- [ ] 所有新增/修改的服务都补充了 **JSDoc 文档**
- [ ] 若新增或改动服务，**`docs/SERVICE_INVENTORY.md`** 已更新
- [ ] 若新增服务，**mock 工厂**已新增或更新
- [ ] PR 已创建且全部 CI 检查通过
- [ ] **全部代码评审意见已处理**（见 Agent Instructions）
- [ ] 所有评审线程已 resolve
- [ ] PR 已批准并合并

## Agent Instructions 五阶段

Issue 中嵌入的指令明确标注：**CRITICAL——PR 未完成全部步骤就不算完成。**

| 阶段 | 内容 |
| --- | --- |
| **Phase 0：Research（写代码之前）** | 先读 `docs/SERVICE_INVENTORY.md` 查重、看 `src/test-utils/factories/` 复用 mock 模式、找相似服务（如 `*-orchestrator*.ts`、`*-persistence*.ts`）。理由是复用既有服务与模式能省时、保持一致性并避免重复代码 |
| **Phase A：Implementation** | 从 main 切 `feat/[short-name]` 分支 → 严格按 TDD 周期实现 → 为所有新增/修改服务补 JSDoc → 跑 `pnpm lint && pnpm typecheck && pnpm test --run` → 更新服务清单 → 用 `/create-pr` 创建 PR |
| **Phase B：Code Review Iteration** | 必须等评审再来，推送代码后**不得**自行判定完成。每轮拉取**全部**评论（含琐碎、挑刺、超范围），按 Critical/Major、Medium/Minor、Trivial/Nitpick（也要修）、Out-of-scope（往往是最有价值的信息）分类处理：< 1 天工作量就在本 PR 内实现，> 1 天或涉及架构则新建 Issue 并回链，不同意则附技术理由回复。改完重新本地校验并推送，然后**逐条**回复每个评论线程，等待下一轮评审，重复直到评审确认满意 |
| **Phase C：Thread Resolution** | 仅在评审批准之后，重新拉取线程 ID，用 GraphQL `resolveReviewThread` 逐个 resolve，并确认无遗留 |
| **Phase D：Merge Readiness** | 合并就绪必须同时满足：CI 全绿、每个评审意见都已处理（含琐碎与超范围）、每个线程都有单独回复、所有线程已 resolve、超过 1 天的延后工作已建 Issue、无待回复的评审意见 |
| **Phase E：Squash Merge and Cleanup** | **始终使用 squash merge，绝不用普通 merge**：`gh pr merge $PR_NUMBER --squash --delete-branch`；确认分支已删除；`git checkout main && git pull origin main` |

## 创建后

生成内容后先向用户展示预览、按需修改，再用 `gh issue create` 创建并打标签（Feature → `enhancement` + `complexity:[level]`；Bug → `bug` + `priority:[level]`；Refactor → `refactor` + `complexity:[level]`），最后把 Issue 编号回报用户。

## 关键原则

1. **自包含**：Issue 应包含 Agent 自主工作所需的全部信息；
2. **TDD 优先**：先有测试规格，再有实现；
3. **全生命周期**：Agent Instructions 覆盖从实现到合并的全过程；
4. **不走捷径**：包括琐碎项与挑刺在内的所有评审意见都必须处理；
5. **超范围即金矿**：标记为 out-of-scope 的意见往往含最佳洞见；
6. **迭代到底**：所有线程 resolve 之前，PR 都不算完成。

## 原始描述摘要

Create comprehensive GitHub issues with TDD plans, acceptance criteria, and agent instructions for autonomous PR lifecycle management.

## 相关 Skill

- `design-review-gate`
- `plan-review-gate`
- `handling-pr-comments`
- `pr-shepherd`
