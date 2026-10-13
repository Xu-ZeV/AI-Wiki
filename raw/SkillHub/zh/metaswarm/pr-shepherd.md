---
title: PR 全生命周期自主监护
slug: pr-shepherd
archived_at: 2026-10-10
archived_from: wiki/SkillHub/skills/pr-shepherd.md
origin_repo: dsifry/metaswarm
source_note: 本页为中文归纳稿；逐段全译见 skills/pr-shepherd/SKILL.md
archive_reason: metaswarm 框架专有，Codex 原生子代理工作流不适用
---
# PR 全生命周期自主监护

> [!note] 归档原始资料
> 本文是 metaswarm 框架技能文档的中文归纳稿。因框架专有（BEADS 任务库、`bd` / `gtg` CLI、插件 marketplace、GitHub Issue 到 PR 的全自动流水线、Claude / Gemini 平台适配）且本机不适用，已于 2026-10-10 从 `wiki/SkillHub` 下架，移入 raw 原始资料层留存。
> 文中机制在本机不存在，请勿按此执行；Codex 原生子代理协作方案见项目内 `.agents/skills/`。

> [!info] Skill 元信息
> 原始名称：`pr-shepherd`  
> 原始标题：pr-shepherd  
> 功能分类：多Agent团队协作  
> 原始文件：本页为中文归纳稿；逐段全译见 [skills/pr-shepherd/SKILL.md](./skills/pr-shepherd/SKILL.md)  
> 上游仓库：[dsifry/metaswarm](https://github.com/dsifry/metaswarm)  
> 许可证：MIT

## 中文含义与用途

中文含义：把 PR 从创建一路监护到合并的自主守护流程。  
核心用处：在**工作区（worktree）中干活的 Agent 自己**监护 PR——自动监控 CI、定位并修复失败、响应评审意见、resolve 线程，直到所有检查通过、所有线程解决。设计初衷是让编排者（orchestrator）保持空闲去处理其它工作，而不是替 Agent 盯 PR。

> **口径说明**：SKILL.md 的 DONE 条件写的是 “PR squash-merged to main（不只是 ready to merge，而是真的已合并）”；但它同时定义了 `WAITING_FOR_USER` 状态，最终报告也写的是 “**The PR is ready for final approval and merge**”。也就是说，**合并本身仍需人类批准**，Agent 负责把 PR 推到“随时可合”的绿灯状态。

## 两种协调模式

- **Task Mode（默认）**：以单个长驻 `Task(run_in_background: true)` 运行，编排者通过 `TaskOutput(block: false)` 查询。
- **Team Mode**：以 `issue-{number}` 团队中的常驻 `shepherd` teammate 运行，通过 `SendMessage` 异步上报（CI 失败、评审意见、全绿、PR 已合并），编排者可回指令（例如“那条评论先延后，改成建 Issue”），收到 `shutdown_request` 后优雅退出。

## 状态机

```text
MONITORING → FIXING → MONITORING → WAITING_FOR_USER → FIXING → MONITORING → DONE
```

| 状态 | 做什么 | 退出条件 |
| --- | --- | --- |
| `MONITORING` | 后台每 60 秒轮询 CI 与评审 | CI 失败、出现新评论、全部完成或需要帮助 |
| `FIXING` | 按 TDD 修复并跑本地校验 | 本地校验通过，或需要用户指导 |
| `HANDLING_REVIEWS` | 调用 `handling-pr-comments` skill | 评论处理完，或需要用户输入 |
| `WAITING_FOR_USER` | 给出选项并等待用户决定 | 用户回复 |
| `DONE` | 所有 CI 绿灯 + 所有线程已 resolve | 成功退出 |

## 各阶段

1. **Phase 1 初始化**：取当前分支 PR 编号、owner 与 repo；没有 PR 就报错退出。
2. **Phase 2 监控循环**：以 `gtg <PR> --repo <owner/repo> --format json` 作为**唯一就绪信号源**（可 `--exclude-checks` 排除 `Merge Ready (gtg)`、`CodeRabbit`、`Cursor Bugbot`、`claude` 等自身检查），解析 `status` 与 `action_items`。
   - `READY` → DONE；`ACTION_REQUIRED` / `UNRESOLVED_THREADS` → HANDLING_REVIEWS；`CI_FAILING` → 简单失败进 FIXING，否则 WAITING_FOR_USER；`ERROR` → 重试，3 次后升级。
   - **GTG 只报告不动作**：它不会 resolve 线程或改代码，线程仍需 Agent 自己用 GraphQL 处理。
   - **手工兜底**：GTG 不可用时改用 `gh pr checks` 与 GraphQL `reviewThreads` 统计未解决线程；`Merge Ready (gtg)` 检查陈旧时用 `gh workflow run gtg.yml -f pr_number=<PR>` 重新触发。
3. **Phase 3 修复**：可自动修的直接修（lint、格式化、类型、自己写的代码里的测试失败）；需要批准的（他人代码的测试失败、基础设施/配置失败、含糊错误、拿不准的情况）必须先问。FIXING 状态规则：用 TDD、跑测试前 `pkill -f vitest` 清掉残留、必须 `pnpm lint && pnpm typecheck && pnpm test --run && pnpm test:coverage` 全过才推送、推送后回到 MONITORING。
4. **Phase 4 处理评审**：一律委派给 `handling-pr-comments` skill（含其 Phase 7 迭代循环），**所有线程 resolve 且推送后确认无新评论**才回到 MONITORING。超范围评论默认视为范围内，用 ultrathink 判断。
5. **Phase 5 等待用户**：呈现情况 → 给出 2–4 个带利弊的选项 → 给出推荐 → 允许用户自选或另提方案。
6. **Phase 6 软超时（4 小时）**：到 4 小时就暂停并 checkpoint——展示当前 CI 状态、已 resolve/未 resolve 线程数、已推送修复提交数，然后给出三个选项：继续监护另外 4 小时（推荐）/ 带交接退出 / 改成一小时后回来检查。
7. **Phase 7 合并后验证与兜底知识沉淀**：确认 PR 已合并（`gh pr view <PR> --json merged`），创建知识沉淀任务并作为 epic 的阻塞项（epic 在沉淀完成前不能关闭）。首选路径是 `/self-reflect` 已在建 PR **之前**跑过、知识库改动已随 PR 一起提交；若没有（例如 PR 出自编排流程之外），此时作为兜底补跑。若本 PR 关闭了一个 **epic**，还必须额外沉淀**对话历史**中的经验——架构取舍、调试发现、非显而易见的坑。

## 强制完成前检查

与 `handling-pr-comments` 一致：

```bash
bin/pr-comments-check.sh <PR_NUMBER>
```

退出码 0 表示所有评论已处理，退出码 1 表示仍有未处理项。任何顶层评论（`in_reply_to_id` 为 null）如果还没有回复，就说明 PR 尚未就绪。

## 退出与清理

- **成功（DONE）**：全部 CI 通过、**每一条**评审意见都已处理（修复或解释，无一被忽略）、所有线程已 resolve、无待答问题、PR 已 squash-merge 到 main。
- **合并后 RAM 清理**：PR 合并、知识沉淀任务创建完成后运行 `/auto-ram-cleanup`，清理 dev 过程中堆积的孤儿测试进程、构建 watcher、重复语言服务器等；Docker 容器与必要的 IDE 进程保留。

## 常见错误

1. **推送修复后没检查新评论就回到 MONITORING**（头号错误）——自动评审机器人会分析你推的每一个 commit，新评论常在推送后 1–2 分钟内出现；
2. 未通过本地校验就推送；
3. 对复杂问题擅自自动修复，而不是走 WAITING_FOR_USER；
4. 收到新评论时自己行内处理，而不是委派 `handling-pr-comments`；
5. 不给用户选项，只问“该怎么办”；
6. 本地校验未过就离开 FIXING 状态；
7. 跳过 `handling-pr-comments` 的迭代循环。

## 已知文档瑕疵

SKILL.md 正文中引用了一个 **`handle-pr-comments.md`（第 3 节）**，但 skill 目录中并不存在该文件；正确指向应是 `handling-pr-comments` skill。原文写作 `handle-pr-comments.md` 属笔误。

## 原始描述摘要

Monitor a PR through to merge — handle CI failures, review comments, and thread resolution automatically until all checks pass.

## 相关 Skill

- `handling-pr-comments`
- `orchestrated-execution`
- `create-issue`
- `handoff`
