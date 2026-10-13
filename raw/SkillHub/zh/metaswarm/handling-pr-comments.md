---
title: 系统化 PR 评审反馈处理
slug: handling-pr-comments
archived_at: 2026-10-10
archived_from: wiki/SkillHub/skills/handling-pr-comments.md
origin_repo: dsifry/metaswarm
source_note: 本页为中文归纳稿；逐段全译见 skills/handling-pr-comments/SKILL.md
archive_reason: metaswarm 框架专有，Codex 原生子代理工作流不适用
---
# 系统化 PR 评审反馈处理

> [!note] 归档原始资料
> 本文是 metaswarm 框架技能文档的中文归纳稿。因框架专有（BEADS 任务库、`bd` / `gtg` CLI、插件 marketplace、GitHub Issue 到 PR 的全自动流水线、Claude / Gemini 平台适配）且本机不适用，已于 2026-10-10 从 `wiki/SkillHub` 下架，移入 raw 原始资料层留存。
> 文中机制在本机不存在，请勿按此执行；Codex 原生子代理协作方案见项目内 `.agents/skills/`。

> [!info] Skill 元信息
> 原始名称：`handling-pr-comments`  
> 原始标题：handling-pr-comments  
> 功能分类：多Agent团队协作  
> 原始文件：本页为中文归纳稿；逐段全译见 [skills/handling-pr-comments/SKILL.md](./skills/handling-pr-comments/SKILL.md)  
> 上游仓库：[dsifry/metaswarm](https://github.com/dsifry/metaswarm)  
> 许可证：MIT

## 中文含义与用途

中文含义：系统化处理 PR 评审反馈的完整流程。  
核心用处：在收到 CodeRabbit、Cursor 或人类评审意见后，确保**每条评论线程都获得具名回复并被 resolve**。SKILL.md 明确指出：“大多数开发者会漏掉第 4–6 步，本 skill 就是为了让这些步骤不被跳过。” 整个流程共 **7 个阶段**（其中阶段 2 含 2b、2c 两个分支）。

## 7 个阶段

| 阶段 | 名称 | 关键动作 |
| --- | --- | --- |
| **1** | Discover and Filter | 运行 `bin/pr-comments-filter.sh <PR_NUMBER>`，过滤掉确认、致谢、指纹类无效评论，并按优先级分类 actionable 评论 |
| **2** | Triage Actionable Comments | 按优先级表定位处理顺序，并把每条评论归入 Bug/Issue、Enhancement、Nitpick、Question、Intentional、Out-of-Scope 六类之一 |
| **2b** | Extract "Outside Diff Range" Comments（**CRITICAL**） | 用 `gh api repos/$OWNER/$REPO/pulls/$PR/reviews --paginate` 配合 `jq` 从 **review body** 中抽取 “Outside diff range” 评论。这类反馈**不在**线程里、无法行内回复，必须解析文件与行号 → 改代码 → 提交推送 → 在 PR 上留一条总评论确认已处理 |
| **2c** | Handle Other Out-of-Scope Comments | 运行 `bin/pr-comments-out-of-scope.sh <PR_NUMBER>` 找出不在 diff 中、被 GitHub 标记 `isOutdated`、或属通用讨论的评论。默认**把超范围评论视为范围内**；用 ultrathink 评估复杂度后在 FIX_NOW / ASK_USER / CREATE_ISSUE 中决策 |
| **3** | Make Fixes | 修复真实代码问题，提交并推送 |
| **4** | Respond to EACH Thread | **常被遗漏**。推送修复后，逐条用 `gh api .../comments/<id>/replies` 回复，并附上归属声明 |
| **5** | Resolve ALL Threads | 回复之后用 GraphQL `resolveReviewThread` 把每条线程标记为已解决 |
| **6** | Handle Unresolvable Threads | 无法直接解决的线程要追问评论人，绝不留下悬空线程要么回复后 resolve，要么标记为等待用户输入 |
| **7** | Post-Push Iteration Check（**MANDATORY**） | **第一大工作流故障点**。先 `gh pr checks <PR> --watch` 等 CI 跑完，再对比“自己最后一次回复的时间戳”检索新增的行内评论与 review body 评论；若总数大于 0，**回到阶段 1**，不得进入收尾 |

## 优先级分类

| 优先级 | 标记 | 处理要求 |
| --- | --- | --- |
| CRITICAL | `_⚠️ Potential issue_ \| _🔴 Critical_` | 立即修复 |
| HIGH | `_⚠️ Potential issue_ \| _🟠 Major_` | 合并前修复 |
| MEDIUM | `_🟡 Minor_` 或 `_🛠️ Refactor suggestion_ \| _🟠 Major_` | 应当修复 |
| LOW | `_🔵 Trivial_` / `_🧹 Nitpick_` | 好修就修 |
| HUMAN | 非机器人评论 | 一律处理 |

## 强制完成前检查

> **BLOCKING**：在宣布任何 PR 就绪之前，**必须**运行并展示下面这条命令的输出：

```bash
bin/pr-comments-check.sh <PR_NUMBER>
```

- 所有评论都已处理 → 退出码 0；
- 存在任何未处理评论 → 退出码 1。

脚本只要有未处理项，就说明工作**没有完成**：可执行的就去修并回复确认；超范围的回复说明延后并（必要时）建 Issue；不同意的附理由回复；**绝不允许静默忽略**。

## 响应模板

| 场景 | 模板 |
| --- | --- |
| 已修复 | `Fixed in commit <hash>.` 后附 `*(Response by Claude on behalf of @username)*` |
| 已知悉的挑刺 | `Acknowledged - this is a valid suggestion. Deferring to a future cleanup PR to keep this PR focused.` |
| 有意为之 | `This is intentional because [reason]. The [thing] is designed to [explanation].` |

## 验证清单

- [ ] 运行过 `bin/pr-comments-filter.sh <PR>`
- [ ] **已抽取 review body 中的 “Outside diff range” 评论（阶段 2b）**
- [ ] 运行过 `bin/pr-comments-out-of-scope.sh <PR>`
- [ ] 代码修复已提交并推送
- [ ] 每条评论线程都已回复
- [ ] “Outside diff range” 评论已用总评论确认处理
- [ ] **推送后检查**：等 CI 完成并检索新增评论
- [ ] 推送后检查确认**无新增评论**（有则迭代）
- [ ] **所有线程已 resolve**
- [ ] 所有回复都带归属声明
- [ ] 超范围评论要么已修复，要么已建 GitHub Issue

> 不要跳过 “Outside diff range” 检查（阶段 2b）——它是 PR 处理不完整的**第二大**原因。

## 激活时机

用户要求“处理 PR 评论 / 处理评审反馈”、提到 CodeRabbit 或 Cursor 机器人、正在做评审要求的修复、要求“检查 PR 评论 / 回复评审人”，或刚做完修复时激活。

## 原始描述摘要

Address PR review feedback systematically — fetch inline comments, review bodies, handle outside-diff-range comments, resolve threads with proper attribution.

## 相关 Skill

- `pr-shepherd`
- `create-issue`
