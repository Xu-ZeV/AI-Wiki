# Adversarial Review Rubric

**使用者**：Code Review Agent（对抗模式）
**目的**：基于 Definition of Done 契约做二值规格符合性验证
**版本**：1.0

---

## 概览

本 rubric 用于**对抗性审查**。它与协作式代码审查是两种不同模式：你的职责是**找出失败**，不是帮助改进代码。你要检查实现是否满足书面契约（规格和 DoD 条目），而不是判断代码"是否优雅"。

**关键区别：**

- 协作式审查（`code-review-rubric.md`）："这段代码怎么变得更好？"
- 对抗性审查（本 rubric）："这段代码是否满足契约？请证明。"

---

## 判定

每次对抗性审查只产生一个判定：

| 判定 | 含义 | 标准 |
| --- | --- | --- |
| **PASS** | 实现满足契约 | 零 BLOCKING issues |
| **FAIL** | 实现违反契约 | 一条或多条 BLOCKING issues |

不存在"有保留地通过"，也不存在"建议修改"。只有 PASS 或 FAIL。

---

## 问题分级

每个发现都要分为 BLOCKING 或 WARNING：

| 分级 | 含义 | 对判定的影响 |
| --- | --- | --- |
| **BLOCKING** | 契约违约：规格说 X，代码不做 X | 导致 FAIL |
| **WARNING** | 质量关注点：不是规格违约，但值得记录 | 不导致 FAIL |

**拿不准时算 BLOCKING。**PASS 的门槛必须高；宁可偏向 FAIL，也不放过违约。

---

## 证据要求

每个发现——无论 PASS 还是 FAIL——都必须引用证据。没有证据的断言无效。

### PASS 示例（逐 DoD 条目）

```markdown
**DoD #1**: "Middleware rejects expired tokens"
**Verdict**: PASS
**Evidence**:
- Implementation: `src/middleware/auth.ts:34` — checks `token.exp < Date.now()`
- Test: `src/middleware/auth.test.ts:67` — test case "rejects expired token" asserts 401 response
```

### FAIL 示例（逐 DoD 条目）

```markdown
**DoD #3**: "Rate limiting returns 429 after 10 requests per minute"
**Verdict**: FAIL (BLOCKING)
**Expected**: Rate limiter triggers at 10 requests/minute and returns HTTP 429
**Found**: Rate limiter exists at `src/middleware/rate-limit.ts:12` but threshold is hardcoded to 100, not 10. No test verifies the 10-request threshold.
**Evidence**: `src/middleware/rate-limit.ts:12` — `const MAX_REQUESTS = 100`
```

### 无效证据

以下都会被拒绝：

- "The code looks correct"：没有文件:行引用。
- "Tests appear to cover this"：没有具体测试引用。
- "I believe this works"：没有证明的断言。
- "Similar to the pattern in other files"：相似性不是证据。

---

## 审查类别

### 1. Spec Compliance（BLOCKING 门槛）

主检查。对每个 DoD 条目：

| 检查 | 分级 | 标准 |
| --- | --- | --- |
| DoD 条目完整实现 | 缺失即 BLOCKING | 实现存在，且处理所有指定情况 |
| DoD 条目有测试 | 无测试即 BLOCKING | 至少一个测试直接验证该 DoD 条目的行为 |
| DoD 条目匹配规格语言 | 偏离即 BLOCKING | 实现做规格**说**的事，不是审查者认为它应该做的事 |

流程：

1. 逐字读取每个 DoD 条目。
2. 在 diff 中搜索实现。
3. 在 diff 中搜索验证该行为的测试。
4. 对实现和测试都引用文件:行。
5. 任一缺失即 BLOCKING FAIL。

### 2. Test Quality（BLOCKING / WARNING 门槛）

| 检查 | 分级 | 标准 |
| --- | --- | --- |
| 测试验证行为，不是存在性 | BLOCKING | 不能用 `toBeDefined()` 作为 DoD 关键行为的唯一断言 |
| 测试覆盖错误路径 | WARNING | 若 DoD 提到错误，只测 happy path 不足 |
| 测试不测试 mock 行为 | BLOCKING | 测试必须执行真实逻辑，不只是验证 mock 被调用 |
| 测试确定性 | WARNING | 不得有依赖时间、顺序或 flaky 模式 |

### 3. Type Safety（BLOCKING / WARNING 门槛）

| 检查 | 分级 | 标准 |
| --- | --- | --- |
| 无 `any` 类型 | BLOCKING | 新代码中出现 `any` 始终是契约违约 |
| 无不安全类型断言 | WARNING | 无类型守卫的 `as` cast 记录为 WARNING |
| 类型匹配运行时行为 | BLOCKING | 类型说 X，但运行时可能产生 Y |

### 4. File Scope（BLOCKING 门槛）

| 检查 | 分级 | 标准 |
| --- | --- | --- |
| 改动在声明文件范围内 | 违反即 BLOCKING | 工作单元只能修改声明范围内的文件 |
| 无无关改动 | BLOCKING | 不允许"顺手改" |

检查方法：

```bash
# Get actual changed files
git diff main..HEAD --name-only

# Compare against declared file scope
# Every changed file must be in the work unit's declared file scope
```

### 5. Security（BLOCKING 门槛）

| 检查 | 分级 | 标准 |
| --- | --- | --- |
| 无注入漏洞 | BLOCKING | SQL、NoSQL、命令注入 |
| 无 XSS 漏洞 | BLOCKING | 输出中未转义用户输入 |
| Auth/authz 被强制执行 | BLOCKING | 若规格提到访问控制，必须实现 |
| 无密钥进入代码 | BLOCKING | 无硬编码凭证、API key、token |
| 有输入校验 | WARNING | 若规格提到校验，必须存在 |

---

## 输出格式

对抗性审查必须按这个格式输出：

```markdown
## Adversarial Review: Work Unit <wu-id>

### Verdict: PASS | FAIL

### DoD Verification

| # | DoD Item | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | <item text> | PASS | impl: `file:line`, test: `file:line` |
| 2 | <item text> | FAIL (BLOCKING) | Expected: <X>, Found: <Y> at `file:line` |

### BLOCKING Issues

1. **DoD #2 not met**: <description with evidence>
2. **`any` type introduced**: `src/services/foo.ts:45` — `const data: any = ...`

### WARNINGS

1. <warning with evidence>

### Files Reviewed

- `src/middleware/auth.ts` (modified, in scope)
- `src/middleware/auth.test.ts` (added, in scope)
```

---

## Reviewer Conduct Rules

1. **按规格判定，不按个人偏好。**规格说"use callbacks"且代码用 callbacks，就是 PASS——即使你更想要 promises。
2. **不建议。**这不是协作式审查。只报告 PASS 或 FAIL 及证据。
3. **不宽松。**"差不多"就是 FAIL。规格是契约。
4. **无锚定。**若你在 FAIL 后复审，必须没有上一轮审查知识。若你有，就不是全新评审者，必须向编排者报告。
5. **有证据才说话。**不能引用文件:行，就不能下结论。

---

## 协作式审查与对抗性审查对比

| 维度 | Collaborative（`code-review-rubric.md`） | Adversarial（本 rubric） |
| --- | --- | --- |
| **目标** | 改进代码质量 | 验证契约符合性 |
| **判定** | APPROVED / CHANGES REQUIRED | PASS / FAIL |
| **问题严重度** | CRITICAL / HIGH / MEDIUM / LOW | BLOCKING / WARNING |
| **契约** | 一般编码标准 | 规格中的具体 DoD 条目 |
| **证据** | 有帮助但可选 | 强制（文件:行） |
| **建议** | 鼓励 | 禁止 |
| **复审** | 同一评审者可以 | 必须全新评审者 |
| **语气** | 协作伙伴 | 独立审计者 |
| **使用时机** | 最终交付前 | 编排执行循环中 |
