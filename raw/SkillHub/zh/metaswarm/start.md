---
title: BEADS 多Agent编排总入口
slug: start
archived_at: 2026-10-10
archived_from: wiki/SkillHub/skills/start.md
origin_repo: dsifry/metaswarm
source_note: 本页为中文归纳稿；逐段全译见 skills/start/SKILL.md
archive_reason: metaswarm 框架专有，Codex 原生子代理工作流不适用
---
# BEADS 多Agent编排总入口

> [!note] 归档原始资料
> 本文是 metaswarm 框架技能文档的中文归纳稿。因框架专有（BEADS 任务库、`bd` / `gtg` CLI、插件 marketplace、GitHub Issue 到 PR 的全自动流水线、Claude / Gemini 平台适配）且本机不适用，已于 2026-10-10 从 `wiki/SkillHub` 下架，移入 raw 原始资料层留存。
> 文中机制在本机不存在，请勿按此执行；Codex 原生子代理协作方案见项目内 `.agents/skills/`。

> [!info] Skill 元信息
> 原始名称：`start`  
> 原始标题：BEADS Multi-Agent Orchestration Skill  
> 功能分类：多Agent团队协作  
> 原始文件：本页为中文归纳稿；逐段全译见 [skills/start/SKILL.md](./skills/start/SKILL.md)  
> 上游仓库：[dsifry/metaswarm](https://github.com/dsifry/metaswarm)  
> 许可证：MIT

## 中文含义与用途

中文含义：BEADS 多智能体编排总入口。  
核心用处：协调一组分工明确的专业 AI Agent，自主完成 GitHub Issue 从认领到 PR 合入的全过程。它本身不写代码，而是定义角色名册、Issue 认领流程、两道审查门禁（设计门禁与方案门禁）、四阶段执行循环、跨模型委托、PR 监护以及人类升级协议。

## Agent 角色名册

| Agent | 职责 | 触发时机 |
| --- | --- | --- |
| Issue Orchestrator | 单 Issue 主协调者 | Issue 获得 `agent-ready` 标签 |
| Researcher Agent | 代码库调研 | 编排者创建调研任务 |
| Architect Agent | 实现方案设计 | 调研完成 |
| Product Manager Agent | 用例与用户价值评审 | 设计审查门禁（并行） |
| Designer Agent | UX/API 设计评审 | 设计审查门禁（并行） |
| Security Design Agent | 安全威胁建模 | 设计审查门禁（并行） |
| CTO Agent | TDD 就绪度与方案评审 | 设计审查门禁（并行） |
| Coder Agent | TDD 实现 | 设计审查门禁通过 |
| Code Review Agent | 内部代码评审 | 实现完成 |
| Security Auditor | 代码安全审计 | 实现完成 |
| Release Engineer Agent | 从合并到生产的交付 | QA 通过、PR 接近可合并 |
| PR Shepherd | PR 全生命周期管理 | PR 创建 |

角色定义文件位于 `./agents/` 目录。

## 快速开始与常用命令

```bash
@beads start #123
bd start 123
/beads-start 123

bd ready          # 展示可开工任务
bd list           # 展示全部任务
bd stats          # 项目统计
bd doctor         # 系统健康检查
```

触发关键词：`work on issue`、`start issue`、`start task`、`use metaswarm`、`@metaswarm`、`agent-ready label`。

## 两道审查门禁

- **Design Review Gate（设计审查门禁）**：本 skill 的定义中并行召集 **6 位**评审 Agent——产品经理、架构师、设计师、安全设计、**UX Reviewer**、CTO，全部批准才可进入实现。注意 `design-review-gate` skill 自身只定义了 5 位（不含 UX Reviewer），两处清单存在差异，详见 `design-review-gate`。
- **Plan Review Gate（方案审查门禁）**：可行性、完整性、范围与对齐 3 位对抗评审员，全部 APPROVE 方案方可上呈用户，详见 `plan-review-gate`。
- 两者迭代上限均为 3 轮，超限后升级人类决策（Override / Defer / Cancel）。

## 四阶段执行循环

1. **IMPLEMENT**：编码子 Agent 依据 spec 以 TDD 实现（携带 Project Context Document）。
2. **VALIDATE**：编排者独立运行质量门禁（tsc、eslint、vitest、覆盖率），**绝不采信子 Agent 自述**；门禁是阻断式状态跃迁，而不是建议。
3. **ADVERSARIAL REVIEW**：全新评审子 Agent 对照 spec 契约给出 PASS/FAIL 与 file:line 证据；配置外部工具时由不同模型交叉评审。
4. **COMMIT**：仅在对抗审查 PASS 后提交，并同步 `SERVICE-INVENTORY.md` 与 Project Context Document。

FAIL 路径为：修复 → 重新验证 → **全新**评审员，最多 3 轮后升级人类。详见 `orchestrated-execution`。

## 外部工具与视觉审查

- 外部 AI CLI（Codex / Gemini）可选接入。两个工具都可用时链路为 A(2) → B(2) → Claude(1) → 用户，最多 5 次尝试；仅一个可用时为 Tool(2) → Claude(1) → 用户，共 3 次。详见 `external-tools`。
- 视觉审查依赖 `npx playwright install chromium`；远程/无头环境通过 HTTP 文件服务器把截图交给用户本地浏览器查看。详见 `visual-review`。

## 工作流总览

```text
GitHub Issue #123 (agent-ready)
  → Issue Orchestrator 建 BEADS epic
  → Research（Researcher Agent 探索代码库）
  → Planning（Architect Agent 产出实现方案）
  → Plan Review Gate（3 位对抗评审，全票通过）
  → 外部依赖检测（扫描 spec 中的 API key / 凭证并提示用户配置）
  → Plan Validation 预检（架构、依赖图、API 契约、安全、UI/UX、外部依赖）
  → Design Review Gate（6 位评审并行，最多 3 轮）
  → Work Unit 分解 + 依赖图
  → 四阶段执行循环（逐个工作单元）
  → Final Comprehensive Review（跨单元集成 + 全量测试 + 类型检查）
  → PR 创建（bin/create-pr-with-shepherd.sh 自动唤起 PR Shepherd）
  → PR Shepherd 自动监护
  → 人类批准与合并
  → Release Engineer（合并前校验 → 合并 → CI → 部署 → 部署后 QA → 发布）
  → 关闭 Epic 并沉淀经验
```

**GTG（Good-To-Go）合并门禁**：`gtg <PR_NUMBER> --format json` 把 CI 状态、评论分类与线程解决情况合并成单一确定性信号，状态包括 `READY` / `ACTION_REQUIRED` / `UNRESOLVED_THREADS` / `CI_FAILING`，`action_items` 数组直接指出要修什么。GTG 只报告不动作，线程仍需 Agent 自行 resolve；CI 检查陈旧时可用 `gh workflow run gtg.yml -f pr_number=<PR_NUMBER>` 重新触发。

## 开始处理一个 Issue（4 步）

1. **校验 Issue 就绪**：`gh issue view 123 --json labels | jq '.labels[].name' | grep agent-ready`
2. **创建 BEADS epic**：`bd create "<title>" --type epic --issue 123 --json`
3. **留言认领**：`gh issue comment 123 --body "🤖 Agent claiming this issue. BEADS epic created."`
4. **拉起 Issue Orchestrator**：用 Task 工具启动，读取 `./agents/issue-orchestrator.md`，传入 epic ID 与 Issue 编号。

## 人类升级协议

触发条件：需求含糊、约束冲突、涉及安全或数据风险决策、阻塞超过 1 小时、连续 3 轮迭代失败。

```bash
bd update <task-id> --status blocked
bd label add <task-id> waiting:human
gh issue comment <number> --body "..."   # 附选项与 Agent 推荐
```

人类回复模式：`@beads approve <task-id>`、`@beads respond <task-id> <option>`、`@beads request-changes <task-id> "<说明>"`。

## 知识沉淀与递归编排

- **开工前必须 prime**：`bd prime --files "<files>" --keywords "<topic>" --work-type <type>`，输出 MUST FOLLOW / GOTCHAS / PATTERNS / DECISIONS 四类事实。
- **收工后自省**：`/self-reflect`、`bd compact`，或拉起 Knowledge Curator Agent 抽取可复用经验。
- **递归编排**：epic 任务超过 5-7 个，或横跨多个领域（前端 + 后端 + schema）时拆分子 epic；每个子 epic 拥有独立 orchestrator，父 orchestrator 只做进度监控与最终集成协调。

## 原始描述摘要

Use when starting work on any task, when the user mentions metaswarm, or when the user wants to begin tracked development work. Coordinates a swarm of specialized AI agents to autonomously handle GitHub Issues from creation to merged PR.

## 相关 Skill

- `setup`
- `status`
- `design-review-gate`
- `plan-review-gate`
- `orchestrated-execution`
- `pr-shepherd`
- `handoff`
