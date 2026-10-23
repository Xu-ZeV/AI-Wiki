---
title: 上游 MySQL 设计规范改编为 PostgreSQL skill 并入库
tags:
  - 日志
date: 2026-10-16
time: 17:05:30
model: GPT-5 Codex
type:
  - Ingest
  - Iteration
scope:
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/database-design|数据库与后端工程]]"
  - "[[wiki/SkillHub/skills/postgresql-design-specification|PostgreSQL 设计规范]]"
  - "[raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md)"
  - "[raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md)"
  - "[raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md)"
  - "[raw/SkillHub/README.md](../../../../raw/SkillHub/README.md)"
  - "[raw/SkillHub/skills-lock.json](../../../../raw/SkillHub/skills-lock.json)"
---

# 上游 MySQL 设计规范改编为 PostgreSQL skill 并入库

## 操作时间

2026-10-16 17:05:30 +08:00

## 操作模型

- 编排者：GPT-5 Codex
- 实现子代理 wu-001（raw 层）：DeepSeek-V4.1-Flash
- 实现子代理 wu-002（wiki 层）：GLM-5.3-Flash
- 对抗审查子代理 H.10 第 1 轮（外部取证）：异构模型（与上述两个实现模型均不同），判决 FAIL
- 对抗审查子代理 H.10 第 2 轮（修订复核）：显式指定异构模型 GLM-5.3-Flash，判决 FAIL（剩 1 项）
- 对抗审查子代理 H.10 第 3 轮（最终复核）：显式指定异构模型 DeepSeek-V4.1-Flash，判决 PASS
- 修订执行：编排者本人（按审查「必须修改项」清单实施）

## 操作类型

- Ingest
- Iteration

## 操作范围

- [[wiki/SkillHub/index|SkillHub 中文索引]]（新增「数据库与后端工程」分类分组与使用路径条目）
- [[wiki/SkillHub/categories/database-design|数据库与后端工程]]（新增分类页）
- [[wiki/SkillHub/skills/postgresql-design-specification|PostgreSQL 设计规范]]（新增 skill 详情页）
- [raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md)（新增，H.10 第 2 轮修订后 30440 字节）
- [raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md)（新增，109 行逐条映射 + 3 行冲突裁决，H.10 第 2 轮修订后 18270 字节）
- [raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md)（新增，上游原文字节级留存 25015 字节）
- [raw/SkillHub/README.md](../../../../raw/SkillHub/README.md)（目录表新增 `categories/database-design/` 行、分类目录数 14 → 15、上游溯源表新增第 7 行、许可说明与 submodule 表述补 L47 / L61 / L76 / L85）
- [raw/SkillHub/skills-lock.json](../../../../raw/SkillHub/skills-lock.json)（新增 `postgresql-design-specification` 条目，10 → 11 条）
- `.agents/skills/postgresql-design-specification/`（3 个文件的字节级镜像，点目录不写链接）

## 操作摘要

1. **输入核实**：上游 `https://github.com/Highflyer/MySQL-Design-Specification` 仅 1 个 `README.md`（HEAD commit `14f78853e8b601b78ce2abfc0120b4cf55e06e37`，2021-07-23），仓库无 LICENSE。按正则 `^\s*\d+\.\s*【` 抽出 **109** 条编号条款（【高危】2 + 【强制】54 + 【建议】53），另有 2 处【异议】与 1 处强制级自相矛盾（2.1.4-5 / 2.1.4-7 要求定义外键，2.2.5-3 又禁用外键约束）。
2. **计划评审门禁（agent-team-plan-gate）**：3 轮对抗评审（可行性 / 完整性 / 范围与对齐三角色并行）。第 3 轮【可行性】判定 FAIL 并列出 5 项 BLOCKING（H.9 词表覆盖率不足、`CREATE INDEX CONCURRENTLY` 版本锚点写错、`raw/SkillHub/README.md` L85 同义重复段漏改、H.7 裸 `git status` 不可执行、raw 与 `.agents` 字节一致的达成机制缺失）。按 AGENTS.md「每门禁最多 3 轮，超限升级人类」，已向用户升级并交付方案 A / 方案 B；用户裁定 **方案 A**（按修订差异 `plan-v4-delta.md` 直接实施）。
3. **编排执行闭环（agent-team-orchestration）**：
   - **wu-001（DeepSeek-V4.1-Flash）** 写 `SKILL.md` 与 `references/mysql-to-postgresql-mapping.md`；每条规范条目携带上游条款号回溯标注（形如 `[2.1.3-5]`），纯 PG 补充标 `[新增]`；支持文件引用统一为深度无关的 `references/<file>.md`，全文无 `../`。
   - **编排者本人**执行上游原文的字节级还原：CRLF 副本 25332 字节 → LF 25015 字节，`git hash-object` = `b19f8709a7b97d2aa8e654233206ae075dabd070`，与上游 `HEAD:README.md` blob 一致。
   - **wu-002（GLM-5.3-Flash）** 写 wiki 蒸馏层 2 页，按 `wiki/SkillHub/index.md` 维护准则分层：`index.md` 只链分类页、分类页只链 skill 页（第一列短 wikilink `[[postgresql-design-specification]]`）、只有 skills 页链接 raw。
   - **编排者独立验证（不采信子代理自报）**：H.1 锁文件可解析且条目 11、哈希与文件一致；H.2 标签合规（全库无残留 `skillhub` / 英文 `index` 标签）；H.3 链接边界与 raw 链接目标可解析；H.4 短 wikilink 唯一；H.5 计数 15 / 1 / 1 / 1 一致；H.6 raw 与 `.agents` 三文件 SHA-256 两两一致；H.7 以改前快照做差集，差集恰为计划内文件、0 项既有改动丢失；H.8 条款覆盖 109/109、无多出、映射表恰 109 行；H.9 白名单正检 21 项全中、窄黑名单裸命中 0。
   - **对抗审查（H.10）**：派全新异构评审子代理联网查阅 PostgreSQL 官方文档，逐条核对 PG 技术断言与全部版本锚点，产出「断言 → 结论 → 出处」表并做二值裁决；第 1 轮判决 **FAIL**（8 项必须修改），修订后进入第 2 轮复核（详见下节）。
4. **版本锚点纠错**：把计划阶段的错误说法 `CREATE INDEX CONCURRENTLY ≥9.2` 更正为 **PostgreSQL 8.2 起可用**（实测 `docs/8.2` 收录、`docs/8.1` 无），并补充「不可在事务块内执行、唯一索引构建失败会留下 invalid 索引需 `DROP INDEX`」两项限制。
5. **未触碰工作区既有改动**：仓库存在 451 条与本次无关的未提交改动（raw 层重构遗留），全部保留，未 `git add` / `commit` / `push`。

## 检查目的

- 验证「上游 MySQL 规范 → PostgreSQL 14+ 规范」的逐条改编是否可机械判定完整：109 条条款号在 SKILL.md 与映射表中是否零缺失、映射表是否恰为 109 行。
- 验证 PG 专有行为与版本锚点是否与 PostgreSQL 官方文档一致（H.10 外部取证，无出处即 FAIL）。
- 验证 SkillHub 三层结构的分层链接边界、标签规范、计数一致性与 raw / `.agents` 双副本字节一致性。

## 下次迭代方向

- H.10 对抗审查已完成三轮闭环：第 1 轮判决 FAIL（8 项必须修改）→ 修订 → 第 2 轮复核判决 FAIL（仅剩 `[2.1.7-2]`）→ 修订 → 第 3 轮复核判决 **PASS**（无必须修改项）。最终产物哈希：`SKILL.md` = `0cb0bd82edfff58bc24453f0c5e274ff9af72dc1abd1f4a04ddcc8ab2c5f62cf`（30440 字节）、映射表 = `4d0b25a807cdbd8080c2be8477516394a1306a87fad0be363b333ec6a4dd6c53`（18270 字节）。
- 后续同步上游时，需手动比对 `Highflyer/MySQL-Design-Specification`（它从来不是 submodule，无 `.gitmodules` 记录），条款号如有增删需同步更新 109 行映射表与 SKILL.md 的回溯标注。
- 可考虑把 H.8 / H.9 的校验脚本固化为 `scripts/` 下的可复用工具，便于后续新增适配类 skill 时直接复跑。

## 审查与修订记录（H.10 判决回填）

### H.10 第 1 轮（外部取证，判决 FAIL）

评审子代理联网核对 PostgreSQL 官方文档（`docs/current` 与各版本 Release Notes），对 33 项 PG 技术断言 + 9 项版本锚点逐条取证，判定 **FAIL**。失败依据：

- **[2.1.3-13]**「加列带默认值自 PG 11 起不重写表」漏掉官方限定——仅有**非易失（non-volatile）默认值**不重写；易失默认值（如 `clock_timestamp()`）、存储生成列、identity 列、带约束的 domain 仍会重写表与索引。
- **[2.1.6-4]**「默认 8KB 页约 2704 字节」无官方出处，且与官方「cannot exceed approximately one-third of a page」表述不一致；把 hash 索引当作超长索引项的替代属上游结论搬运（hash 仅支持等值比较）。
- **[2.1.6-3] / [2.1.6-9]** 缺 `INCLUDE` 版本锚点（应为 PG 11）；「部分索引（`WHERE` 谓词索引）」非官方术语，应为 partial index。
- **[2.1.7-2]**「声明式分区没有 1024 硬上限」属无出处的反面断言。
- **[2.2.2-3] / [2.2.5-2] / 裁决 2**「半连接/反连接与子查询提升」官方手册无对应表述，属经验性判断。
- **[2.2.5-4]** 与官方并发语义有偏差：官方明确 `DO UPDATE` 保证 INSERT-or-UPDATE 的**原子结果**，原文未给重试触发条件。
- **[2.2.5-1]** `ctid` 表述应为「UPDATE/VACUUM FULL 后会变化、不能作行标识，CTE+ctid 写法必须逐批重跑」。
- 版本锚点表缺 `INCLUDE`=11、`NOT VALID`/`VALIDATE CONSTRAINT`=9.1（FK）/9.2（CHECK）、`ALTER TYPE ... ADD VALUE` v12 可入事务块说明。

### 修订执行 · 第 1 轮（编排者本人，2026-10-16 17:16）

按上述条目修订 `SKILL.md` 与 `mysql-to-postgresql-mapping.md`，为每条断言补上 PostgreSQL 官方文档 URL（ALTER TABLE、btree、ddl-partitioning、functions-comparisons、sql-insert、ddl-system-columns、ddl-constraints、sql-altertype），并删除搬运痕迹（`2704`、哈希索引替代说法、无出处的「半连接优化」承诺、无出处的「1024 无上限」正面断言）。同步更新：

- `raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md`：SHA-256 `c2f75040…` → **`4e4543c8a15fa912ad925ae0fb5434a063a1b0f51b8979492941708417279c97`**（30452 字节）。
- `raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md`：SHA-256 `bc828994…` → **`350fa14e9bc122fb42d75ac6fc0a65059a998d67964d0a76d233900b6a23c0bf`**（18276 字节）。
- `raw/SkillHub/skills-lock.json`：`postgresql-design-specification.computedHash` 同步为 `4e4543c8…`。
- `.agents/skills/postgresql-design-specification/` 三文件 `Copy-Item` 字节复制重镜像，SHA-256 与 raw 两两一致。

### 修订执行 · 第 2 轮（编排者本人，2026-10-16 17:31）

第 2 轮复核仅剩 1 项阻断：`[2.1.7-2]` 仍保留无出处的反面断言「声明式分区没有 1024 硬编码上限」。已按官方 Limitations 口径重写——删除该反面断言，改为「沿用上游 1024 作为运维上限口径 + 分区越多规划器枚举分区、加锁与运行期开销越大 + 受官方分区 Limitations 约束（唯一约束/主键必须包含全部分区键）」，并附 `docs/current/ddl-partitioning.html` 出处；`SKILL.md` L115 与映射表 L59 同口径改写。同步更新：

- `raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md`：SHA-256 `4e4543c8…` → **`0cb0bd82edfff58bc24453f0c5e274ff9af72dc1abd1f4a04ddcc8ab2c5f62cf`**（30440 字节）。
- `raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md`：SHA-256 `350fa14e…` → **`4d0b25a807cdbd8080c2be8477516394a1306a87fad0be363b333ec6a4dd6c53`**（18270 字节）。
- `raw/SkillHub/skills-lock.json`：`postgresql-design-specification.computedHash` 同步为 `0cb0bd82…`（`hashMatch=True`）。
- `.agents/skills/postgresql-design-specification/` 三文件 `Copy-Item` 字节复制重镜像，SHA-256 与 raw 两两一致（`match=True` ×3）。

### 修订后独立验证（编排者亲自执行，不采信子代理自报）

- **H.1** 锁文件 `ConvertFrom-Json` 成功、条目 11，`computedHash` 与文件真实 SHA-256 一致（`hashMatch=True`）✓
- **H.8** 109 条条款号在 SKILL.md 与映射表零缺失、SKILL.md 无多出条款号、映射表恰 109 行 ✓
- **H.9** 白名单 20 项 PG 原生构件全中、`collation` 存在；窄黑名单在**非豁免文件**（SKILL.md / 两个 wiki 页 / index.md / `.agents` SKILL.md）裸命中 **0**（对照语境 74 处）；映射表与上游原文按 plan-v3.md L99 属**豁免文件** ✓
- **H.2** 全库无残留 `skillhub` / 英文 `index` 标签 ✓
- **H.6** raw 与 `.agents` 三文件 SHA-256 两两一致（`match=True` ×3）✓
- **H.7** 改前快照差集：`added=7 / removed=0`，恰为本次 6 项 + 日志目录，451 条既有脏改动逐条未变 ✓

### H.10 第 2 / 3 轮复核结论（最终闭环）

- **第 2 轮（显式指定异构模型 GLM-5.3-Flash，判决 FAIL）**：第 1 轮 8 项中 7 项确认已修复、无回归；唯一剩余阻断为 `[2.1.7-2]` 无出处的反面断言。另确认全文对 `2704`、`谓词索引`、`硬编码上限` 均零残留（`硬上限` 仅命中 `[2.1.1-6]` 的 63 字节官方事实，属正常保留）。
- **第 2 轮修订**：见上节「修订执行 · 第 2 轮」。
- **第 3 轮（显式指定异构模型 DeepSeek-V4.1-Flash，判决 PASS）**：`[2.1.7-2]` 反面断言彻底移除，改写后核心事实由官方 `ddl-partitioning` Limitations 直接支撑；前 7 项修复逐条复核无回归；未发现新增无出处技术断言，**无必须修改项**。
- **闭环状态**：FAIL（8 项）→ 修订 → FAIL（剩 1 项）→ 修订 → **PASS**。未触发「同一门禁连续 3 轮失败需升级人类」的条件。
- **异构评审的如实说明**：第 2 / 3 轮均已向审查子代理显式传入异构模型 override（`GLM-5.3-Flash`、`DeepSeek-V4.1-Flash`），但两个子代理自报「实际使用的模型：GPT-5 Codex」。异构是否真正生效无法由编排者从外部证实，故不作「异构已生效」的结论性声明。
