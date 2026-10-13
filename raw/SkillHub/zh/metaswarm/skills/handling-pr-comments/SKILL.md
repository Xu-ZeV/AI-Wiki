---
name: handling-pr-comments
description: 系统化处理 PR 评审反馈 —— 抓取行内评论、评审正文，处理 diff 范围外的评论，带正确署名解决线程
---

# handling-pr-comments（处理 PR 评论）

在处理 PR 评审反馈时使用；收到来自 CodeRabbit、Cursor 或人类评审者的评审评论之后使用。它确保对每个评论线程都给出系统化回应，并带正确的署名与线程解决动作。

## 何时激活

下列任一条件为真时激活本技能：

- 用户要求「处理 PR 评论」或「处理评审反馈」
- 用户提到 CodeRabbit、Cursor bot 或评审者评论
- 用户正在处理 PR 评审中要求的修复
- 用户要求「看看 PR 评论」或「回复评审者」
- 为处理评审反馈做完修复之后

## 关键：完整工作流

**大多数开发者会忘掉第 4-6 步。本技能确保它们被执行。**

### 阶段 1：发现并过滤评论

运行过滤脚本，识别可执行的评论：

```bash
# 过滤出可执行与不可执行的评论
bin/pr-comments-filter.sh <PR_NUMBER>
```

该脚本会：

- 过滤掉不可执行的评论（确认、致谢、指纹标记）
- 按优先级（Critical → Low）对可执行评论分类
- 显示评论 ID 与详情，便于后续处理

### 阶段 2：对可执行评论做分级

过滤脚本按优先级分类：

| 优先级 | 标记 | 处理 |
| --------------- | -------------------------------------------------------- | ---------------- |
| CRITICAL | `_⚠️ Potential issue_ \| _🔴 Critical_` | 立即修复 |
| HIGH | `_⚠️ Potential issue_ \| _🟠 Major_` | 合入前修复 |
| MEDIUM | `_🟡 Minor_` 或 `_🛠️ Refactor suggestion_ \| _🟠 Major_` | 应当修复 |
| LOW | `_🔵 Trivial_` / `_🧹 Nitpick_` | 快就顺手修 |
| HUMAN | 非机器人评论 | 一律处理 |

对每条可执行评论，再进一步归类：

1. **Bug/Issue** —— 必须修
2. **Enhancement** —— 应当修
3. **Nitpick** —— 顺手修更好
4. **Question** —— 需要澄清
5. **Intentional** —— 说明理由后拒绝
6. **Out-of-Scope** —— 见阶段 2b

### 阶段 2b：从评审正文中提取「diff 范围外」评论（关键）

**最常被漏掉的一类**：CodeRabbit 会把「Outside diff range」（diff 范围外）评论发在 **评审正文** 里，而不是行内线程。这些是可执行的反馈，必须处理。

```bash
# 从评审正文中提取 diff 范围外的评论
PR_NUMBER=<number>
OWNER=$(gh repo view --json owner -q .owner.login)
REPO_NAME=$(gh repo view --json name -q .name)

echo "=== OUTSIDE DIFF RANGE COMMENTS ==="
gh api "repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/reviews" --paginate | \
  jq -r '.[] | select(.body | test("Outside diff range"; "i")) |
    "Review ID: \(.id)\n\(.body)\n---"'
```

**这些评论不在线程里** —— 无法行内回复。你必须：

1. 从评审正文中解析出文件路径与行号
2. 在代码里落实该反馈
3. 提交并推送
4. 在 PR 上留一条普通评论，说明你已处理

### 阶段 2c：处理其它范围外评论

运行范围外检测脚本：

```bash
# 检测范围外评论
bin/pr-comments-out-of-scope.sh <PR_NUMBER>
```

该脚本会检测：

- 引用了不在 PR diff 中的行的评论
- 被 GitHub 标记为「outdated」的评论（GraphQL `isOutdated` 标志）
- 一般性的 PR 讨论评论

**重要**：默认把范围外评论当作 **范围内** 处理。

#### 评估流程

用 **ultrathink** 逐条评估范围外评论：

```text
ultrathink: Analyze this out-of-scope review comment:
- What is the reviewer asking for?
- How complex is this change? (lines of code, files affected)
- Does it require refactoring other systems?
- Can I complete this in under 30 minutes?
- Are there any risks or dependencies?

Recommend: FIX_NOW or CREATE_ISSUE
```

#### 决策矩阵

| 判据 | 处理 |
| --------------------------------------------- | ----------------------------------------- |
| 简单修复（< 30 分钟、< 3 个文件、无需重构） | **FIX_NOW** —— 立刻改掉 |
| 中等复杂度（范围不清） | **ASK_USER** —— 摆出选项 |
| 大规模重构（涉及多个系统、有风险） | **CREATE_ISSUE** —— 记录为后续工作 |

#### FIX_NOW 的做法

1. 实施修复
2. 用描述性信息提交
3. 推到 PR 分支
4. 回复：「Fixed in commit <hash>. This was outside the original PR scope but straightforward to address.」
5. 解决该线程

#### CREATE_ISSUE 的做法

1. 创建带上下文的 GitHub issue
2. 回复：「Created issue #<number> to track this.」
3. 解决该线程

### 阶段 3：实施修复

修掉实际的代码问题。提交并推送。

### 阶段 4：逐条回复每个线程（最常被遗忘！）

**推送修复之后，逐条回复每一个评论线程：**

```bash
PR_NUMBER=<number>
OWNER=$(gh repo view --json owner -q .owner.login)
REPO_NAME=$(gh repo view --json name -q .name)
CURRENT_USER=$(gh api user -q '.login')
COMMENT_ID=<id-from-filter-script>

gh api "/repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments/$COMMENT_ID/replies" \
  -X POST \
  -f body="Fixed in commit $(git rev-parse --short HEAD).

*(Response by Claude on behalf of @$CURRENT_USER)*"
```

### 阶段 5：解决全部线程

**回复之后，每个线程都必须被解决。** 用 GraphQL 解决：

```bash
THREAD_ID="PRRT_kwDOK-xA485..."  # 来自 GraphQL 查询

gh api graphql -f query='mutation {
  resolveReviewThread(input: {threadId: "'"$THREAD_ID"'"}) {
    thread { id isResolved }
  }
}'
```

### 阶段 6：处理无法解决的线程

1. **询问评论作者**，请其给出具体后续要求
2. **不要留着不解决** —— 要么回复后解决，要么请求澄清
3. 若在等作者回复，标记为需要用户输入

### 阶段 7：推送后迭代检查（强制）

**头号工作流失误：在第 5-6 阶段就收工，没有检查新评论。**

自动化评审者（CodeRabbit、Cursor）会分析你推的每一个提交。它们会在自己的检查运行期间或之后发布 **新评论**。

```bash
# 第 1 步：等待全部 CI/CD 检查完成
PR_NUMBER=<number>
echo "Waiting for CI/CD checks to complete..."
gh pr checks $PR_NUMBER --watch

# 第 2 步：检查你上次回复之后是否出现新评论
OWNER=$(gh repo view --json owner -q .owner.login)
REPO_NAME=$(gh repo view --json name -q .name)
CURRENT_USER=$(gh api user -q '.login')

# 取你上次回复的时间戳
LAST_REPLY=$(gh api "repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments" --paginate | \
  jq -r "[.[] | select(.user.login == \"$CURRENT_USER\") | select(.in_reply_to_id)] | sort_by(.created_at) | last | .created_at")

# 处理用户此前没有任何回复的情况
if [ -z "$LAST_REPLY" ] || [ "$LAST_REPLY" = "null" ]; then
  echo "No previous replies found - checking all comments as new"
  LAST_REPLY="1970-01-01T00:00:00Z"  # Unix 纪元 - 把所有评论当作新评论
fi

# 检查该时间之后的新评论
NEW_COUNT=$(gh api "repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/comments" --paginate | \
  jq -r --arg time "$LAST_REPLY" '[.[] | select(.in_reply_to_id == null) | select(.created_at > $time)] | length')

# 第 3 步：同时检查评审正文中新的「diff 范围外」评论
NEW_REVIEWS=$(gh api "repos/$OWNER/$REPO_NAME/pulls/$PR_NUMBER/reviews" --paginate | \
  jq -r --arg time "$LAST_REPLY" '[.[] | select(.submitted_at > $time) | select(.body | test("Outside diff range"; "i"))] | length')

TOTAL_NEW=$((NEW_COUNT + NEW_REVIEWS))

if [ "$TOTAL_NEW" -gt 0 ]; then
  echo "$NEW_COUNT NEW INLINE COMMENT(S) + $NEW_REVIEWS NEW REVIEW BODY COMMENT(S) DETECTED"
  echo "ACTION: Return to Phase 1 and iterate"
else
  echo "No new comments - safe to proceed to verification"
fi
```

**若发现新评论**：回到阶段 1。不要进入验证环节。

**迭代循环**：

```text
REPEAT:
  阶段 1：发现评论
  阶段 2：分级
  阶段 3：修复
  阶段 4：回复
  阶段 5：解决线程
  阶段 6：处理不明确的线程
  阶段 7：推送后检查是否有新评论

  IF 发现新评论 → 回到阶段 1
  IF 没有新评论 → 进入验证
```

## 回复模板

### 已实施修复

```text
Fixed in commit <hash>.

*(Response by Claude on behalf of @username)*
```

### 已知悉的吹毛求疵

```text
Acknowledged - this is a valid suggestion. Deferring to a future cleanup PR to keep this PR focused.

*(Response by Claude on behalf of @username)*
```

### 有意为之的决定

```text
This is intentional because [reason]. The [thing] is designed to [explanation].

*(Response by Claude on behalf of @username)*
```

## 完成前的强制检查

**阻塞项：在宣称任何 PR 就绪之前，你必须运行此脚本并展示其输出：**

```bash
bin/pr-comments-check.sh <PR_NUMBER>
```

该脚本会：

- 若所有评论均已处理，返回退出码 0
- 若存在任何未处理评论，返回退出码 1
- 显示每条评论的状态

**若脚本显示任何未处理评论，你就没做完。** 逐条处理：

1. 若可执行 → 修掉并回复确认
2. 若属范围外 → 回复说明为何推迟（必要时创建 issue）
3. 若不同意 → 回复给出理由
4. **绝不静默忽略**

**你必须在回复中展示脚本输出**，作为所有评论均已处理的证据。例如：

```
Checking PR #908 for unaddressed comments...

=== Inline Code Review Comments ===
Comment 123 by cursor[bot] - 1 reply(s) [OK]
Comment 456 by coderabbitai[bot] - 1 reply(s) [OK]

=== General PR Discussion Comments ===
coderabbitai[bot]: <!-- summary -->...

All inline review comments have been addressed
```

在该脚本返回成功之前，PR 都不算就绪。

## 验证清单

在宣称 PR 评论已处理之前：

- [ ] 已运行 `bin/pr-comments-filter.sh <PR>` 识别可执行评论
- [ ] **关键**：已从评审正文中提取「diff 范围外」评论（阶段 2b）
- [ ] 已运行 `bin/pr-comments-out-of-scope.sh <PR>` 找出其它范围外反馈
- [ ] 代码修复已完成并推送
- [ ] 每个评论线程都已发布回复
- [ ] 「diff 范围外」评论已通过一条普通 PR 评论确认处理
- [ ] **推送后检查**：已等待 CI/CD 完成，并检查是否有新评论
- [ ] 推送后检查 **未发现新评论**（若发现则迭代）
- [ ] **所有线程均已解决**（无遗留未解决线程）
- [ ] 所有回复都带正确署名
- [ ] 范围外评论要么已修复，要么已创建 GitHub issue

**不要跳过「diff 范围外」检查（阶段 2b）—— 这是 PR 处理不完整的第二大原因。**

## 参考

包含全部边界情况与故障排查的完整详细工作流，见：
`/metaswarm:handle-pr-comments` 命令
