---
name: create-issue
description: 创建内容完整的 GitHub Issue，内含 TDD 计划、验收标准，以及用于自主 PR 生命周期管理的 Agent 指令
---

# 创建 GitHub Issue 技能

创建内容完整、结构良好、内嵌 Agent 指令的 GitHub Issue，用于自主完成 PR 全生命周期管理。

## 概述

本技能生成的 GitHub Issue 是自包含的工作包。每个 Issue 包含：

1. **问题/特性规格**，范围清晰
2. **技术规格**，含类型、Schema 与 API 设计
3. **TDD 实现计划**，含测试先行的循环
4. **验收标准** 清单
5. **Agent 指令**，覆盖完整 PR 生命周期（实现 → 评审 → 合入）

## 用法

```
/create-issue
```

## 交互流程

### 第 1 步：Issue 类型

询问用户：

```
这是什么类型的 issue？
1. Feature - 新功能
2. Bug - 有东西坏了
3. Refactor - 改进既有代码
```

### 第 2 步：简要描述

```
问题或特性的简要描述？（1-2 句）
```

### 第 3 步：复杂度评估

```
预估复杂度如何？
1. Simple（< 1 天）
2. Medium（2-5 天）
3. Complex（> 1 周）
```

### 第 4 步：上下文收集

```
有需要引用的相关文件、服务或 issue 吗？
（或者说「explore codebase」，我来自己调研）
```

### 第 5 步：生成 Issue

依据输入，用下面相应的模板生成完整 issue。

---

## Issue 模板

### 特性模板

````markdown
## Summary

[1-2 句描述]

**Complexity**: [simple|medium|complex]
**Estimated Effort**: [X 天]

---

## Problem

[这解决了什么问题？为什么需要它？]

### Evidence

[日志、指标、用户反馈或推理]

### Scope

- IN SCOPE：[包含什么]
- OUT OF SCOPE：[明确不包含什么]

---

## Architecture Decision

**Decision**: [将采取什么方案]
**Rationale**: [为什么选这个方案，为什么不选其他方案]

---

## Technical Specification

### Types/Interfaces

```typescript
// 关键类型定义
```
````

### Zod Schemas（若适用）

```typescript
// 校验 Schema
```

### API Endpoints（若适用）

| 方法 | 路径 | 说明 |
| ------ | ---- | ----------- |

### Database Changes（若适用）

[Schema 变更、需要的迁移]

---

## TDD Implementation Plan

### 循环 1：[正常路径]

```typescript
it("should [expected behavior]", async () => {
  // 测试代码
});
```

### 循环 2：[错误处理]

```typescript
it("should handle [error case]", async () => {
  // 测试代码
});
```

### 循环 3：[边界用例]

### 循环 4：[集成]

---

## Error Handling

| 场景 | 行为 | 日志 |
| -------- | -------- | ------- |

---

## Implementation Phases

### 阶段 1：[核心]（高优先级）

- [ ] 任务 1
- [ ] 任务 2

### 阶段 2：[增强]（中优先级）

- [ ] 任务 3

---

## Files to Create/Modify

- **NEW**: `path/to/new/file.ts`
- `path/to/existing/file.ts` - [变更内容]

---

## Acceptance Criteria

- [ ] 所有 TDD 循环均已实现且测试通过
- [ ] TypeScript 零错误（`pnpm typecheck`）
- [ ] lint 零告警（`pnpm lint`）
- [ ] 全部测试通过（`pnpm test --run`）
- [ ] 所有新增/修改的服务都补了 **JSDoc 文档**
- [ ] **`docs/SERVICE_INVENTORY.md`** 已更新（若有新增/修改服务）
- [ ] **Mock 工厂** 已新增/更新（若有新增服务）
- [ ] PR 已创建且全部 CI 检查通过
- [ ] **所有代码评审评论均已处理**（见 Agent Instructions）
- [ ] 所有评审线程均已解决
- [ ] PR 已批准并合入

---

## Agent Instructions

**关键**：实现本 issue 时遵循此协议。在全部步骤完成之前，PR 都不算完成。

### 阶段 0：调研（写任何代码之前）

**先读这些文件，避免重复造轮子：**

1. **服务清单** —— 检查是否已有服务能实现你要的功能：

   ```bash
   # 读取服务清单
   cat docs/SERVICE_INVENTORY.md
   # 或搜索具体功能
   grep -i "embedding\|search\|cache" docs/SERVICE_INVENTORY.md
   ```

2. **Mock 工厂** —— 审阅既有 mock，复用其模式：

   ```bash
   ls src/test-utils/factories/
   ```

3. **相似服务** —— 找出使用相似模式的服务：
   ```bash
   # 找编排者模式
   ls src/lib/services/*-orchestrator*.ts
   # 找持久化模式
   ls src/lib/services/*-persistence*.ts
   ```

**为什么重要**：复用既有服务与模式能节省时间、保持一致性、避免重复代码。

### 阶段 A：实现

1. 从 main 创建特性分支：`git checkout -b feat/[short-name]`
2. 严格按上文规定的 TDD 循环推进
3. 为所有新增/修改的服务 **补 JSDoc 文档**
4. 跑本地校验：`pnpm lint && pnpm typecheck && pnpm test --run`
5. **更新服务清单**（若有新增服务）
6. 用 `/create-pr` 创建带完整描述的 PR

### 阶段 B：代码评审迭代

**先等代码评审，再往下推进。不要在推完代码后就标记完成。**

对每一次代码评审迭代：

1. **抓取全部评论**（包括琐碎意见、吹毛求疵与范围外意见）：

   ```bash
   PR_NUMBER=XXX
   OWNER=$(gh repo view --json owner -q .owner.login)
   REPO=$(gh repo view --json name -q .name)
   gh api "repos/$OWNER/$REPO/pulls/$PR_NUMBER/comments" --paginate
   ```

2. **按类别处理全部评论**：

   | 类型 | 处理方式 |
   | ---------------------- | ---------------------------------------------------- |
   | Critical/Major | 立即修复 |
   | Medium/Minor | 合入前修复 |
   | **Trivial/Nitpick** | **这些也要修！** 不要跳过 |
   | **Out-of-scope** | **彻底调研** —— 往往是最好的洞见 |

3. **对每条评论**：
   - **工作量 < 1 天** → 在本 PR 中实现修复
   - **超过 1 天或属于架构性变更** → 新建一个 GitHub issue，并在回复中链接
   - **不同意** → 回复说明理由，给出技术论证

4. **改完之后**：

   ```bash
   pnpm lint && pnpm typecheck && pnpm test --run
   git add . && git commit -m "fix: address review feedback" && git push
   ```

5. **逐条回复每一个评论线程**：

   ```bash
   COMMENT_ID=XXX
   CURRENT_USER=$(gh api user -q '.login')
   gh api "/repos/$OWNER/$REPO/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies" \
     -X POST \
     -f body="Fixed in commit $(git rev-parse --short HEAD). [explanation]

   *(Response by Claude on behalf of @$CURRENT_USER)*"
   ```

6. **等待下一轮评审** —— 不要自己解决线程

7. **重复第 1-6 步**，直到评审者确认满意

### 阶段 C：解决线程

只有在评审者批准之后：

1. 重新抓取全部线程，获取当前 ID
2. 逐个解决线程：

   ```bash
   THREAD_ID="PRRT_xxx"
   gh api graphql -f threadId="$THREAD_ID" -f query='
     mutation($threadId: ID!) {
       resolveReviewThread(input: {threadId: $threadId}) {
         thread { id isResolved }
       }
     }'
   ```

3. 推进之前先确认所有线程均已解决

### 阶段 D：合入就绪

只有以下条件全部为真，PR 才可合入：

- [ ] 所有 CI 检查通过（绿色）
- [ ] **每一条** 代码评审评论都已处理（包括琐碎意见与范围外意见）
- [ ] **每一个** 线程都有单独回复
- [ ] 所有线程均已解决（在评审者批准之后）
- [ ] 对任何推迟的工作（> 1 天）都已创建 GitHub issue
- [ ] 没有待回复的评审者评论

### 阶段 E：压缩合入与清理

**重要**：始终使用 squash merge，绝不用普通 merge。

1. **压缩并合入** PR（把所有提交合并成一个干净提交）：

   ```bash
   # 通过 GitHub CLI
   gh pr merge $PR_NUMBER --squash --delete-branch

   # 或通过 GitHub 网页界面：
   # 点击 "Squash and merge"（不是 "Merge"，也不是 "Rebase and merge"）
   ```

2. **删除特性分支**（`--delete-branch` 会自动完成）：

   ```bash
   # 若分支未被自动删除：
   git push origin --delete feat/[branch-name]
   git branch -d feat/[branch-name]
   ```

3. **更新本地 main**：

   ```bash
   git checkout main
   git pull origin main
   ```

### 参考

详细协议见 `/metaswarm:handle-pr-comments` 命令。

---

## Related Issues

- [相关 issue 链接]

## References

- [相关文档、规格或 PR 链接]

````

---

### 缺陷模板

沿用特性模板，做以下修改：

**标题格式**：`fix: [简要描述]`

**把「Problem」一节替换为**：

```markdown
## Bug Report

**Priority**: [P0-Critical|P1-High|P2-Medium|P3-Low]
**Affected Users**: [影响范围]
**First Reported**: [日期/来源]

### Expected Behavior

[应该发生什么]

### Actual Behavior

[实际发生了什么]

### Steps to Reproduce

1. 第 1 步
2. 第 2 步
3. 第 3 步

### Root Cause Analysis

[若已知，解释为什么会这样]

### Evidence

[日志、堆栈、截图]
````

**把「TDD Implementation Plan」替换为**：

````markdown
## Test Cases

### 测试 1：验证所报问题的修复

```typescript
it("should [correct behavior] when [condition]", async () => {
  // 复现该缺陷场景
  // 验证现在已修复
});
```
````

### 测试 2：回归测试

```typescript
it("should not regress [related functionality]", async () => {
  // 确保修复没有破坏其它功能
});
```

````

---

### 重构模板

沿用特性模板，做以下修改：

**标题格式**：`refactor: [简要描述]`

**在「Summary」之后追加**：

```markdown
## Background

[为什么需要这次重构？是什么触发的？]

### Review Feedback Being Addressed

> [引用促成这次工作的评审评论]

- Original PR: #XXX
- Comment by: @reviewer
````

**在「Acceptance Criteria」中追加**：

```markdown
- [ ] 公共 API 无破坏性变更
- [ ] 所有既有测试无需修改仍能通过
- [ ] 性能未退化（若适用）
```

---

## 生成之后

生成 issue 内容之后：

1. **给用户看预览**
2. 若有需要，**询问要改什么**
3. **创建 issue** 并打上相应标签：

   ```bash
   # 特性
   gh issue create --title "feat: [title]" --body "[content]" \
     --label "enhancement" --label "complexity:[level]"

   # 缺陷
   gh issue create --title "fix: [title]" --body "[content]" \
     --label "bug" --label "priority:[level]"

   # 重构
   gh issue create --title "refactor: [title]" --body "[content]" \
     --label "refactor" --label "complexity:[level]"
   ```

4. **把 issue 编号报告给用户**

---

## 关键原则

1. **自包含**：Issue 应当包含 Agent 自主工作所需的一切
2. **TDD 优先**：始终在实现之前给出测试规格
3. **完整生命周期**：Agent 指令覆盖从实现到合入的全过程
4. **不抄近路**：所有评审评论都必须处理，包括琐碎意见与吹毛求疵
5. **范围外即金矿**：标记为范围外的评论往往包含最好的洞见
6. **迭代到完成**：所有线程解决之前，PR 都不算完成
