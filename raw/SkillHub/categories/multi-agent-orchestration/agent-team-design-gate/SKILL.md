---
name: agent-team-design-gate
description: 设计文档定稿后必须启用的评审门禁：为产品经理、架构师、设计师、安全设计、CTO 五个评审角色各派一个全新子代理并行评审，全部 APPROVED 才能进入实施；触发关键词包括"设计文档已提交""设计评审""design review"。
license: MIT
metadata:
  author: AI-Wiki
  version: "1.0.0"
  source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-design-gate/SKILL.md
  adapted_for: Codex 原生子代理多模型协作
  upstream_note: 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw/SkillHub/zh/metaswarm/original-en/，MIT 许可
---

# 设计评审门禁（Design Review Gate）

## 何时使用

以下任一情况发生时启用本 skill：

1. 一份设计文档被写入并提交到 `docs/plans/*-design.md`。
2. 上游的头脑风暴/设计梳理环节刚刚完成。
3. 用户显式要求："评审这份设计""跑一遍设计门禁""design review"。

**不适用场景**：琐碎改动不走门禁。若设计预计工作量不足 1 天、且只触及不到 3 个文件，则无需评审。只有当设计包含 **≥2 个工作单元** 或 **触及 ≥3 个文件** 时，才值得启用门禁评审。

**授权说明**：调用本 skill 即视为用户已授权派子代理。官方默认规则要求"除非用户或 `AGENTS.md`/skill 明确要求，否则不得派子代理"，本 skill 的显式调用满足该条件，评审期间可以自由使用 `spawn_agent`。

## 目的

当一份设计文档创建完成（通常来自头脑风暴环节）时，本 skill 自动启用。它通过派发五位专业评审角色，确保复杂特性在进入实施之前得到恰当评审：

1. **产品经理角色** —— 用例验证与用户收益评审
2. **架构师角色** —— 技术架构评审
3. **设计师角色** —— UX/API 设计质量评审
4. **安全设计角色** —— 安全威胁建模与防护评审
5. **CTO 角色** —— 代码库对齐与 TDD 就绪度评审

五位全部 APPROVED 之后，才可以进入实施阶段。

## 模型与角色分配（Codex 语境）

本机支持三个可用模型：

| 模型标识 | 显示名 | 规格 | 支持的 reasoning_effort | 职能专长 |
| --- | --- | --- | --- | --- |
| `DeepSeek-V4.1-Flash` | DeepSeek-V4.1-Flash | 256K | `low` / `medium` / `high` / `xhigh` | 本地部署。代码实现、边界条件、工程底线（CTO 角色，`xhigh`） |
| `ccs-glm-5-3-flash/GLM-5.3-Flash` | GLM-5.3-Flash | 1M | `low` / `high` / `max` | 本地部署。系统架构设计、深度安全推演（安全角色，`max`） |
| `ccs-gmini/gemini-3.8-flash` | gemini-3.8-flash | 1049K | `low` / `medium` / `high` | CC-Switch 代理。敏捷产品需求（PM 角色）、交互视觉设计（设计师角色） |

### 五角色模型分配与复审轮换矩阵

同一轮内，每个评审角色都必须是一个全新的子代理实例，模型跨三个可用模型合理分布：

| 评审角色 | 第 1 轮模型 | 第 2 轮模型（复审） | reasoning_effort | 评审侧重 |
| --- | --- | --- | --- | --- |
| **产品经理** | `ccs-gmini/gemini-3.8-flash` | `ccs-glm-5-3-flash/GLM-5.3-Flash` | `high` | 需求完整性、用户体验、用例闭环 |
| **架构师** | `ccs-glm-5-3-flash/GLM-5.3-Flash` | `DeepSeek-V4.1-Flash` | `high` / `xhigh` | 模块契约、技术规范契合度、可维护性 |
| **设计师** | `ccs-gmini/gemini-3.8-flash` | `DeepSeek-V4.1-Flash` | `medium` | 交互流畅度、视觉与状态一致性 |
| **安全设计** | `ccs-glm-5-3-flash/GLM-5.3-Flash` | `DeepSeek-V4.1-Flash` | `max` / `xhigh` | OWASP 风险、认证授权、信任边界推演 |
| **CTO** | `DeepSeek-V4.1-Flash` | `ccs-gmini/gemini-3.8-flash` | `xhigh` / `high` | 整体工程可行性、技术选型底线、最终放行 |

### 优雅降级机制（离线/代理不可用兜底）

若云端代理 `ccs-gmini/gemini-3.8-flash` 离线或不可用，系统自动平滑降级为**本地双模型模式**：
- 产品经理（`DeepSeek-V4.1-Flash` high）、架构师（`GLM` high）、设计师（`DeepSeek-V4.1-Flash` high）、安全设计（`GLM` max）、CTO（`DeepSeek-V4.1-Flash` xhigh）。
- 门禁报告中如实标注：“*已降级为本地双模型多视角审查，非完全异构*”。

## 激活触发条件

本 skill 在以下时机激活：

1. 一份设计文档被提交到 `docs/plans/*-design.md`。
2. 头脑风暴/设计梳理环节完成。
3. 用户显式请求："评审这份设计"。

## 工作流

### 阶段 1：派发评审（并行）

用同一条消息里的五个 `spawn_agent` 调用实现并行；`fork_context=false` 保证每个评审都是干净起点。

```text
spawn_agent(message=<产品经理评审提示词>, model="ccs-gmini/gemini-3.8-flash", reasoning_effort="high", fork_context=false)
spawn_agent(message=<架构师评审提示词>, model="ccs-glm-5-3-flash/GLM-5.3-Flash", reasoning_effort="high", fork_context=false)
spawn_agent(message=<设计师评审提示词>, model="ccs-gmini/gemini-3.8-flash", reasoning_effort="medium", fork_context=false)
spawn_agent(message=<安全设计评审提示词>, model="ccs-glm-5-3-flash/GLM-5.3-Flash", reasoning_effort="max", fork_context=false)
spawn_agent(message=<CTO 评审提示词>, model="DeepSeek-V4.1-Flash", reasoning_effort="xhigh", fork_context=false)
```

拿到返回的 target 后统一等待：

```text
wait_agent(targets=[产品经理, 架构师, 设计师, 安全设计, CTO], timeout_ms=900000)
```

### 阶段 2：汇总结果

每位评审返回一份结构化评审结果：

```typescript
interface ReviewResult {
  agent: "product-manager" | "architect" | "designer" | "security-design" | "cto";
  verdict: "APPROVED" | "NEEDS_REVISION";
  blockers: string[]; // MUST fix before implementation
  suggestions: string[]; // Nice to have
  questions: string[]; // Clarifications needed
  use_case_analysis?: {
    // 仅产品经理角色
    total_use_cases: number;
    clear: number;
    needs_work: number;
    missing_scenarios: string[];
  };
  threat_model?: {
    // 仅安全设计角色
    high_risk: string[];
    medium_risk: string[];
    mitigations_required: string[];
  };
}
```

### 阶段 3：判定门禁

```text
IF 五位评审全部 APPROVED:
  -> 进入实施阶段
  -> 为已批准的设计创建实施任务

ELSE:
  -> 汇总结论
  -> 呈现给用户
  -> 迭代设计
  -> 重跑门禁（最多 3 轮）
```

### 阶段 4：升级人类

经历 3 轮仍未通过后：

1. 汇总遗留的 BLOCKING 问题。
2. 请人类决定：覆盖（override）、搁置（defer）还是取消（cancel）。

## 评审隔离五规则

以下规则**强制生效**，违反任何一条即判定本次评审无效：

1. **只用全新实例。** 每位评审都是一个新 `spawn_agent` 实例——绝不复用、绝不续接、绝不给轮次之间的上下文。
2. **评审之间互不可见。** 任何一位评审都不得看到另一位评审的输出。永远不行。
3. **只读访问。** 评审可以读设计文档与代码库、可以跑 grep/glob，但不能修改任何东西。
4. **复审不带历史发现。** 迭代后重新评审时，必须派发完全全新的实例；新评审对之前评审发现了什么一无所知。
5. **输入仅限三项：** 设计文档正文、用户的原始请求、代码库（通过只读工具访问）。

**为什么隔离如此重要**：看过此前发现的评审会锚定在那些发现上，而不是独立复查。全新实例可以消除这种偏差，确保每一轮评审都是真正独立的检查。

## 评审提示词

### 产品经理角色提示词

```markdown
你是评审一份设计文档的「产品经理」角色。

## 你的任务
评审这份设计在用例清晰度与用户收益上的表现。

## 设计文档
<path>: {designDocPath}

## 评审标准

### 1. 用例验证
- [ ] 每个用例都遵循 WHO/WANTS/SO THAT/WHEN 格式
- [ ] 用户画像定义清晰
- [ ] 用例切合真实用户需求
- [ ] 从用户视角考虑了边界场景与错误场景

### 2. 用户收益评审
- [ ] 价值主张表述清晰
- [ ] 收益可度量（节省时间、成功率等）
- [ ] 理解了对用户旅程的影响
- [ ] 改进幅度足够大，值得投入构建

### 3. 范围评估
- [ ] MVP 定义清晰（必须有 vs 锦上添花）
- [ ] 未发现范围蔓延
- [ ] 范围贴合用户需求，而非技术可能性
- [ ] 避免了"先有方案再找问题"的反模式

### 4. 成功标准
- [ ] 成功指标以用户为中心（不只是技术指标）
- [ ] 指标可度量且有阈值
- [ ] 定义了评估时间线
- [ ] 也定义了失败标准

## 输出格式
返回 JSON，字段与 ReviewResult 一致，重点填充 use_case_analysis。
```

### 架构师角色提示词

```markdown
你是评审一份设计文档的「架构师」角色。

## 你的任务
评审这份设计的技术架构健全性。

## 设计文档
<path>: {designDocPath}

## 评审标准

### 1. 服务架构
- [ ] 遵循代码库既有模式
- [ ] 服务落位正确
- [ ] 依赖流向正确（无循环依赖）
- [ ] 遵循命名约定

### 2. 技术正确性
- [ ] API 契约定义清晰
- [ ] 数据库操作正确（如适用）
- [ ] 错误处理完整
- [ ] 性能考量已覆盖

### 3. 集成点
- [ ] 与既有服务干净集成
- [ ] 无重复功能
- [ ] 抽象边界合理

## 输出格式
返回 JSON，字段与 ReviewResult 一致。
```

### 设计师角色提示词

```markdown
你是评审一份设计文档的「设计师」角色。

## 你的任务
评审这份设计的 UX、API 设计与开发者体验。

## 设计文档
<path>: {designDocPath}

## 评审标准

### 1. API/接口设计
- [ ] API 直观，且与既有模式一致
- [ ] 参数命名清晰可预期
- [ ] 返回类型结构良好
- [ ] 错误响应有用（不晦涩）

### 2. 用户体验（如适用）
- [ ] 用户流程合乎逻辑且高效
- [ ] 边界场景处理得体
- [ ] 错误状态给出可操作指引
- [ ] 考虑了加载/进度状态

### 3. 开发者体验
- [ ] 类型设计良好且可复用
- [ ] 接口容易实现
- [ ] 易于 mock
- [ ] 文档完整

### 4. 一致性
- [ ] 遵循代码库既有约定
- [ ] 与同类特性的做法相似
- [ ] 命名与代码库一致

## 输出格式
返回 JSON，字段与 ReviewResult 一致。
```

### 安全设计角色提示词

```markdown
你是评审一份设计文档的「安全设计」角色。

## 你的任务
在写代码之前，评审这份设计中的安全漏洞。

## 设计文档
<path>: {designDocPath}

## 评审标准

### 1. 认证与授权
- [ ] 每个入口点都验证用户身份
- [ ] 每次资源访问都检查授权
- [ ] 没有用户能访问他人数据
- [ ] 会话管理安全

### 2. 数据保护
- [ ] 敏感数据已识别并保护
- [ ] PII 在静态与传输中均加密
- [ ] 日志和错误信息中无密钥
- [ ] 数据泄露路径已封堵

### 3. 输入校验
- [ ] 所有输入都在服务端校验
- [ ] 无 SQL 注入路径
- [ ] 无 XSS 路径
- [ ] 文件上传处理安全（如适用）

### 4. API 安全
- [ ] 已定义限流
- [ ] 有暴力破解防护
- [ ] 错误信息不泄露信息
- [ ] 无 IDOR（不安全的直接对象引用）风险

### 5. OWASP Top 10 检查
- [ ] A01：失效的访问控制
- [ ] A02：加密失效
- [ ] A03：注入
- [ ] A04：不安全设计
- [ ] A07：认证失效

## 需要先行阅读的上下文
评审之前，请考虑：
- 代码库中既有的鉴权流程
- 与该项目相关的架构与安全文档
- OWASP 指南

## 输出格式
返回 JSON，字段与 ReviewResult 一致，重点填充 threat_model。
```

### CTO 角色提示词

```markdown
你是评审一份设计文档的「CTO」角色。

## 你的任务
评审这份设计的 TDD 就绪度与代码库对齐情况。

## 设计文档
<path>: {designDocPath}

## 评审标准

### 1. TDD 就绪度（关键）
- [ ] 存在测试规格说明
- [ ] 记录了 RED-GREEN-REFACTOR 循环
- [ ] 每个方法都枚举了边界情况
- [ ] 指定了 mock 基础设施
- [ ] 定义了集成测试辅助手段

### 2. 代码库对齐
- [ ] 遵循项目 `AGENTS.md` 与既有编码准则
- [ ] 与现有架构文档对齐
- [ ] 与既有服务无冲突
- [ ] 安全考量已覆盖

### 3. 完整性
- [ ] 全部需求已覆盖
- [ ] 成功标准可度量
- [ ] 实施阶段划分清晰
- [ ] 验收标准已定义

### 4. 风险评估
- [ ] 风险已识别并有缓解措施
- [ ] 依赖已记录
- [ ] 破坏性变更已标注（如有）

## 需要先行阅读的上下文
评审之前，请阅读代码库中与测试、架构、任务完成清单相关的文档。

## 输出格式
返回 JSON，字段与 ReviewResult 一致。
```

## 迭代协议

### 第 1 轮：初始评审

1. 并行派发全部五位评审。
2. 等待全部结果。
3. 若全部 APPROVED，则进入下一步。
4. 若任一 NEEDS_REVISION，则汇总并呈现。

### 第 2-3 轮：修订循环

1. 把汇总反馈呈现给人类。
2. 人类（或设计负责人）修订设计文档。
3. 对更新后的文档**重新派发全部五位全新评审**。
4. 重复直到全部通过。

### 第 4 轮：升级

若 3 轮迭代后仍未通过：

```markdown
## 设计评审门禁：需要升级决策

经过 3 轮评审，以下 BLOCKING 问题仍未解决：

### 架构师角色
- [问题 1]
- [问题 2]

### 设计师角色
- [问题 1]

### CTO 角色
- [问题 1]
- [问题 2]

### 可选处置
1. **覆盖** —— 照常推进（记录技术债）
2. **搁置** —— 该特性留待以后
3. **修订** —— 继续迭代设计
4. **取消** —— 放弃该特性

请选择一项处置，或补充更多上下文。
```

## Codex 原生落地

### 编排顺序

1. **准备输入**：确认设计文档正文、用户原始请求都已就绪；注意子代理默认不带父会话历史，提示词必须自包含。
2. **并行派发五位**：在同一条消息里发出 5 个 `spawn_agent` 调用，`fork_context=false`。
3. **统一等待**：用一次 `wait_agent(targets=[...], timeout_ms=900000)` 等待五个 target 全部结束。
4. **汇总裁决**：按 ReviewResult 结构整理五份结果，执行阶段 3 的判定。
5. **NEEDS_REVISION 迭代**：先 `close_agent` 关闭旧实例，再对修订后的设计派发 5 个全新实例。
6. **收尾**：全部通过或达到 3 轮上限后，`close_agent` 关闭所有仍在运行的评审实例。

### `spawn_agent` 参数要点

- `message`：必须**自包含**。包含完整设计文档正文、用户原始请求、所属评审角色与输出格式要求。
- `model`：在三个可用模型之间交错分配，见上文"模型与角色分配"。严格解耦 model slug 与 reasoning_effort 参数。
- `reasoning_effort`：安全设计用 GLM 的 `max`，CTO 用 DeepSeek 的 `xhigh`，设计师用 Gemini 的 `medium`，产品经理/架构师用 `high`。不要给 GLM 传 `xhigh`、不要给 DeepSeek 传 `max`、不要给 Gemini 传 `max`/`xhigh`。
- `fork_context`：设计评审门禁固定为 `false`。

### 编排顺序示例

```text
# 第 1 轮
pm   = spawn_agent(message=产品经理提示词, model="ccs-gmini/gemini-3.8-flash", reasoning_effort="high", fork_context=false)
arch = spawn_agent(message=架构师提示词,   model="ccs-glm-5-3-flash/GLM-5.3-Flash", reasoning_effort="high", fork_context=false)
ux   = spawn_agent(message=设计师提示词,   model="ccs-gmini/gemini-3.8-flash", reasoning_effort="medium", fork_context=false)
sec  = spawn_agent(message=安全设计提示词, model="ccs-glm-5-3-flash/GLM-5.3-Flash", reasoning_effort="max", fork_context=false)
cto  = spawn_agent(message=CTO 提示词,     model="DeepSeek-V4.1-Flash", reasoning_effort="xhigh", fork_context=false)
results = wait_agent(targets=[pm, arch, ux, sec, cto], timeout_ms=900000)

# 若任一 NEEDS_REVISION，先关闭再重新派发（模型对调，且不带历史发现）
close_agent(pm); close_agent(arch); close_agent(ux); close_agent(sec); close_agent(cto)
```

### 裁决与汇总数据结构

以下 TypeScript 结构描述的是编排者整理结果时的数据形态，不是 Codex 的真实工具接口：

```typescript
const [pmResult, architectResult, designerResult, securityResult, ctoResult] = results;
// 每份结果遵循 ReviewResult 结构，verdict 为 "APPROVED" | "NEEDS_REVISION"
```

## 与任务跟踪集成

当设计被批准时，按项目自身的任务跟踪方式创建实施阶段任务。可以使用项目已有的任务体系，或直接在 `docs/plans/` 下建立实施分解文档，例如：

```text
<feature-name>
├── 阶段 1：基础设施
├── 阶段 2：后端
├── 阶段 3：前端
└── 阶段 4：打磨
```

## 输出结构

### 设计通过

```markdown
## 设计评审门禁：通过

五位评审全部批准该设计。

| 评审角色 | 裁决 | BLOCKING | 建议 |
| -------- | ---- | -------- | ---- |
| 产品经理 | APPROVED | 0 | 1 |
| 架构师 | APPROVED | 0 | 2 |
| 设计师 | APPROVED | 0 | 1 |
| 安全设计 | APPROVED | 0 | 2 |
| CTO | APPROVED | 0 | 3 |

异构度说明：本轮评审跨 Gemini、GLM、DeepSeek 三个独立模型分布（PM/UX 使用 Gemini，架构/安全使用 GLM，CTO 使用 DeepSeek）。降级模式下如实标注本地双模型多视角说明。

### 威胁模型摘要（安全设计角色）

- **高风险**：未发现
- **中风险**：AI 生成内容可能被操纵
- **缓解措施**：纵深防御已在设计中体现

### 建议（非阻塞）

1. [架构师] 考虑为高频查询加缓存层
2. [设计师] 增加加载骨架屏以改善感知性能
3. [安全设计] 为助手的所有操作加审计日志
4. [CTO] 在 API 响应中记录限流响应头

### 后续步骤

1. 为该特性创建实施任务
2. 建立隔离的开发环境
3. 开始第 1 阶段实施

是否确认进入实施？[是/否]
```

### 需要修订

```markdown
## 设计评审门禁：需要修订

一位或多位评审发现了 BLOCKING 问题。

| 评审角色 | 裁决 | BLOCKING | 建议 |
| -------- | ---- | -------- | ---- |
| 架构师 | APPROVED | 0 | 2 |
| 设计师 | NEEDS_REVISION | 2 | 1 |
| 安全设计 | NEEDS_REVISION | 2 | 1 |
| CTO | NEEDS_REVISION | 3 | 0 |

### BLOCKING 问题（必须修复）

#### 设计师角色

1. **缺少错误状态** —— 设计未说明搜索返回 0 条结果时会发生什么
2. **API 命名不一致** —— `get_contact_details` 用下划线，而现有 API 用驼峰

#### 安全设计角色

1. **严重：userId 信任边界** —— 设计把 userId 传给工具，但 userId 只能来自服务端会话。模型可能被越狱输出任意 userId。
2. **缺少限流** —— AI 端点昂贵，必须限流以防滥用

#### CTO 角色

1. **缺少 TDD 规格** —— 未记录 RED-GREEN-REFACTOR 循环
2. **缺少 mock 基础设施** —— 未说明 beforeEach/afterEach 设置
3. **缺少边界情况** —— 需要对每个方法系统枚举

### 威胁模型（安全设计角色）

- **高风险**：用户可能通过提示注入访问他人联系人
- **中风险**：AI 端点未定义限流
- **需要的缓解措施**：userId 仅来自会话，增加限流

### 需要澄清的问题

1. [CTO] 最大会话历史长度是多少？
2. [设计师] 用户点击"查看更多"时会发生什么？
3. [安全设计] 位置数据将如何保护？它属于 PII 吗？

---

**轮次**：第 1 轮 / 共 3 轮
**需要动作**：请修订设计文档以处理上述 BLOCKING 问题。
```

## 反模式

| # | 反模式 | 为什么错 | 正确做法 |
| --- | --- | --- | --- |
| 1 | **复用评审实例**——把上一轮发现传给下一轮 | 锚定偏差：评审会去核对旧发现，而不是独立复查 | 每轮派发不带任何历史上下文的新 `spawn_agent` 实例 |
| 2 | **评审之间串味**——把一位评审的输出给另一位看 | 破坏独立性；评审会趋同 | 每位评审只看到：设计文档、用户请求、代码库 |
| 3 | **把 NEEDS_REVISION 当参考**——"问题不大，先做" | 架空门禁，等同于没有门禁 | NEEDS_REVISION 就意味着修订并重新评审，没有例外 |
| 4 | **对"简单"设计跳门禁**——"这个很直白，不用评了" | "简单"与否正是门禁要验证的判断 | 只要设计有 2+ 个工作单元或触及 3+ 个文件，就跑门禁 |
| 5 | **设计者自评**——写设计的 agent 自己评审自己 | 确认偏差；设计者会批准自己的产出 | 评审必须是独立于设计者的全新子代理实例 |
| 6 | **无限迭代**——"一直评到过为止" | 收益递减；3 轮之后往往说明设计本身有根本问题 | 最多 3 轮，然后带上完整上下文升级给用户 |
| 7 | **部分复审**——只重跑失败的那位评审 | 其他评审也可能在修订稿上失败 | 每一轮都对全部 5 位评审重新派发全新实例 |
| 8 | **把多实例当多模型**——声称"五路完全异构评审" | 同一模型的多实例不是异构，只是多视角 | 如实标注三模型分布与降级模式下的异构度边界 |

## 成功标准

设计评审门禁在满足以下条件时算成功：

- [ ] 五位评审全部返回 APPROVED 裁决。
- [ ] 全部 BLOCKING 问题均已解决。
- [ ] 全部澄清问题均已回答。
- [ ] 设计文档已按修订更新。
- [ ] 安全威胁模型已评审，缓解措施到位。
- [ ] 实施任务已创建（或已具备创建条件）。

## 相关 skill

- `agent-team-brainstorm` —— 在头脑风暴完成后强制接入本门禁。
- `agent-team-plan-gate` —— 设计通过之后，对实施计划进行对抗式评审的下一个门禁。

## 与总览页不一致时的取舍

某些总览页会把评审角色写成六位。以**本页定义的五位专业评审（产品经理、架构师、设计师、安全设计、CTO）**为准。总览页的其余表述不改变本页的评审阵容。

## 评审隔离规则（重要不变式）

**评审必须是每一轮全新的 `spawn_agent` 实例**，这是整套协作机制中最重要的不变式，违反它就会摧毁评审的价值。

- 永远是全新实例。
- 绝不复用、绝不从上一个 agent 续接。
- 绝不把上一轮评审发现或历史上下文传给新评审。
- 新评审只看到：设计文档、用户请求、代码库。

其原因正是防止锚定偏差；适用性没有例外。

## 血缘与许可

本 skill 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作。英文原件归档于 [raw/SkillHub/zh/metaswarm/original-en/design-review-gate/](../../../../../raw/SkillHub/zh/metaswarm/original-en/design-review-gate/SKILL.md)，采用 MIT 许可。
