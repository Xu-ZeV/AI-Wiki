---
title: PostgreSQL 设计规范 skill 命名条款冲突裁决（方案 A）与三副本同步
tags:
  - 日志
date: 2026-10-19
time: 17:38:35
model: GPT-5 Codex
type:
  - Iteration
scope:
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/database-design|数据库与后端工程]]"
  - "[[wiki/SkillHub/skills/postgresql-design-specification|PostgreSQL 设计规范]]"
  - "[raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md)"
  - "[raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md)"
  - "[raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md)"
  - "[raw/SkillHub/skills-lock.json](../../../../raw/SkillHub/skills-lock.json)"
  - "[.agents/skills/postgresql-design-specification/SKILL.md](../../../../.agents/skills/postgresql-design-specification/SKILL.md)"
---

# PostgreSQL 设计规范 skill 命名条款冲突裁决（方案 A）与三副本同步

## 操作时间

2026-10-19 17:38:35 +08:00

## 操作模型

- 编排者：GPT-5 Codex
- 计划门禁第 3 轮：可行性 DeepSeek-V4.1-Flash(high)、完整性 GLM-5.3-Flash(high)、范围与对齐 DeepSeek-V4.1-Flash(xhigh)，三者全部 PASS
- 实现子代理 wu-001/wu-002（raw 层 2 文件）：DeepSeek-V4.1-Flash(high)
- 实现子代理 wu-004（wiki 详情页）：GLM-5.3-Flash(high)
- 镜像同步、skills-lock 哈希、日志、全部验证：编排者本人（GPT-5 Codex）
- 对抗审查子代理（二值判决）：GLM-5.3-Flash(max)，判决 PASS（无 BLOCKING 项）

异构局限如实标注：本机仅 `DeepSeek-V4.1-Flash` 与 `GLM-5.3-Flash` 两个模型，三评审阵容中 DeepSeek 被使用两次，属同一模型多实例，不能算作完全异构。

门禁轮次记录：计划评审门禁共 3 轮（第 1 轮可行性/完整性/范围三项均 FAIL，第 2 轮可行性 PASS、范围 PASS、完整性 FAIL，第 3 轮三项全部 PASS）；实施后对抗审查 1 轮 PASS。

## 操作类型

- Iteration

## 操作范围

- [raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md)：`## 条款冲突裁决` 新增第 4 条，L20 计数与 DDL 检查清单第 1 条同步
- [raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/mysql-to-postgresql-mapping.md)：L5 与 L119 计数、末尾新增第 4 条裁决
- [raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/references/upstream-mysql-design-spec.md)：**逐字未改**（上游原文，SHA-256 仍为 `ba3edf42…c25dc67`）
- [.agents/skills/postgresql-design-specification/SKILL.md](../../../../.agents/skills/postgresql-design-specification/SKILL.md) 与同目录 `references/mysql-to-postgresql-mapping.md`：由 raw 镜像覆盖
- [raw/SkillHub/skills-lock.json](../../../../raw/SkillHub/skills-lock.json)：`postgresql-design-specification.computedHash` 更新
- "[[wiki/SkillHub/skills/postgresql-design-specification|PostgreSQL 设计规范]]"：蒸馏页 bullet 更新为 4 条裁决

## 操作摘要

1. 冲突事实：`SKILL.md` 的 [2.1.1-3]「名称只用英文字母，不含数字」与 [2.1.2-5] 分片命名 `<库通配名>_<编号>`（从 0 递增）/`<库通配名>_<时间>` 直接矛盾，且 [2.1.2-1] 又要求遵守 2.1.1 全部通用命名规则；[2.1.7-10] 要求按日期分表，日期后缀同样含数字。该矛盾继承自上游原文（`upstream-mysql-design-spec.md`），本 skill 原样转录。
2. 用户裁定**方案 A**：不改 [2.1.1-3] 与 [2.1.2-5] 正文，改为在「条款冲突裁决」小节新增第 4 条，把 [2.1.1-3] 收敛为对「业务词根」的约束——词根只用英文字母、不含数字；并把**分片序号后缀**与**日期时间后缀**定为仅有的两类显式例外，版本号、业务流水号等其余数字段一律不允许；例外后缀也不得使标识符以数字开头（未加引号的标识符必须以字母或下划线开头）。
3. 原书面计数为「3 条」裁决，现统一为「4 条」：`SKILL.md` L20、`mapping.md` L5 与 L119 三处计数同步更新；DDL 检查清单第 1 条由「无数字」硬约束改为「除分片序号与日期时间后缀外不含数字」并指回裁决第 4 条。改后 `SKILL.md` 283 → 284 行、`mapping.md` 123 → 124 行。
4. 三副本同步：raw 原始层 → `.agents` 项目副本（Copy-Item 覆盖，两份文件 SHA-256 与 raw 逐一相同）→ `skills-lock.json` 的 `computedHash` 重算为 `f87e3d47…85fa4c`；wiki 蒸馏层仅更新裁决数量描述。

## 检查目的

- 验证「方案 A」是否真正消解了 [2.1.1-3] 与 [2.1.2-5]、[2.1.7-10] 的矛盾，且未改动上游原文、未削弱其余数字禁令。
- 验证 raw / `.agents` / `skills-lock` / wiki 四处口径一致：新裁决文本、行数计数、哈希、蒸馏描述全部对齐，无第 4 处实体副本。
- 验证本次改动未触碰工作区既有的 459 条未提交改动（`git status --porcelain=v1` 双向差集仅新增本日志 1 条、删除 0 条；`git diff --numstat` 路径集合与基线完全相同）。
- 索引检查声明：已检查 `wiki/SkillHub/index.md` 与 `wiki/SkillHub/categories/database-design.md`，本次改动不新增/删除/改名 skill，也不改变分类归属与导航，两处 index 的计数与链接无需同步更新；`wiki/SkillHub/index.md` 为索引页、含 `索引` 标签，本日志含 `日志` 标签，未引入旧标签 `skillhub` 或英文 `index`。

## 验证结果

| 验证项 | 结论 |
| --- | --- |
| V1 行数（SKILL.md 284 / mapping.md 124） | PASS |
| V2 计数（旧串 0 处、新串 1 处且仅在 L20） | PASS |
| V3 裁决小节恰好 4 条编号条目 | PASS |
| V4 `rg --hidden` 全仓检索旧串为 0 命中 | PASS |
| V5 DDL 清单第 1 条去除数字硬约束并回指裁决第 4 条 | PASS |
| V6 mapping.md L119 计数与文末 4 条裁决 | PASS |
| V7 `.agents` 镜像两份文件哈希与 raw 逐一相同 | PASS |
| V8a 7 个目标文件恰 6 个变化、`upstream-mysql-design-spec.md` 完全不变 | PASS |
| V8b `-uall` 双向差集仅新增本日志 1 条、删除 0 条 | PASS |
| V8c `git diff --numstat` 路径集合与逐路径增删行数与基线一致 | PASS |
| V9 skills-lock JSON 可解析且 `computedHash` 等于 raw SKILL.md 实算值 | PASS |
| V10 wiki 详情页 L34 新文案、无旧标签 | PASS |
| V11 全仓实体副本仅 raw / `.agents` / wiki 三处 | PASS |
| V12 本日志存在、含 `日志` 标签、scope 全部可点击、七项结构齐备 | PASS |

未提交状态：改动全部保留在工作区，**未** 执行 `git add` / `git commit` / `git push`。

## 下次迭代方向

- 该 skill 的其余【异议】条款（如 [2.1.1-x] 长度上限与 PG 63 字节标识符上限的差异）尚未逐条裁决，可继续按「正文不动 + 裁决消解」的既有模式补录。
- 新增裁决引用的 PG 官方说明（标识符大小写折叠与引号行为）目前为文字描述，后续可补一条官方文档链接以与裁决 1-3 的引用密度对齐。
- 若上游 `Highflyer/MySQL-Design-Specification` 再次更新，需重新比对 `upstream-mysql-design-spec.md` 是否新增数字相关条款，并检查裁决第 4 条是否仍然成立。

---

# 追加记录：postgresql-design-specification skill 安装到 D:\work\odoo 局部 skill 包

## 操作时间

2026-10-19 17:49:47 +08:00

## 操作模型

- 编排者：GPT-5 Codex
- 计划门禁第 1 轮：可行性 DeepSeek-V4.1-Flash(high)、完整性 GLM-5.3-Flash(high)、范围与对齐 DeepSeek-V4.1-Flash(xhigh)，三者全部 PASS
- 实施子代理（odoo 侧 3 新增 + 1 修改）：DeepSeek-V4.1-Flash(high)
- 独立复验（哈希、BOM、换行、行数、目录数、其余 skill 未变）：编排者本人（GPT-5 Codex）
- 对抗审查子代理（二值判决）：GLM-5.3-Flash(max)

异构局限如实标注：本机仅 `DeepSeek-V4.1-Flash`(256K) 与 `GLM-5.3-Flash`(1M) 两个模型，三评审阵容中 DeepSeek 被使用两次，属同一模型多实例，不能算作完全异构。

## 操作类型

- Iteration

## 操作范围

- 新增 `D:\work\odoo\.agents\skills\postgresql-design-specification\SKILL.md`：[odoo 局部副本](../../../../../odoo/.agents/skills/postgresql-design-specification/SKILL.md)
- 新增同目录 `references/upstream-mysql-design-spec.md` 与 `references/mysql-to-postgresql-mapping.md`：[references 目录](../../../../../odoo/.agents/skills/postgresql-design-specification/references)
- 修改 `D:\work\odoo\AGENTS.md`（第 75 行新增 Skills 索引行）：[odoo AGENTS.md](../../../../../odoo/AGENTS.md)
- 来源（未改动）：[raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md](../../../../raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md)

## 操作摘要

1. 按用户指令把 `postgresql-design-specification` skill 安装为 `D:\work\odoo` 的项目级（局部）skill 包。落点由现场勘察确定：`D:\work\odoo\.agents\skills\<slug>\`，与既有 4 个本地 skill（`huizao-gyerp-commit` / `odoo-comment-spec` / `odoo-hierarchy-list-dev` / `odoo-package-deploy`）同构。
2. WU-1：用二进制 `Copy-Item -LiteralPath` 逐字节复制三份文件，保留 `references/` 结构。三份目标文件 SHA-256 与 AI-Wiki raw 层逐一相同，均无 BOM、纯 LF。
3. WU-2：在 `D:\work\odoo\AGENTS.md`「三、专用规范与 Skills 索引」表末追加一行（第 74 行之后），格式与既有 4 行同构，链接指向 `.agents/skills/postgresql-design-specification/SKILL.md`。该表是 odoo 仓库内唯一的本地 skill 登记点。
4. 采用「逐字节原样安装」策略：不改写 skill 正文与 frontmatter、不做 odoo 命名的二次改写，保证 odoo 局部副本可用 SHA-256 与 AI-Wiki raw 层直接互校。这是该 skill 的第 4 份实体副本（raw → AI-Wiki `.agents` → wiki 蒸馏页 → odoo 局部包）。

## 检查目的

- 验证安装是否是逐字节无损复制：三份文件哈希与源一致、无 BOM、无换行改写。
- 验证 `D:\work\odoo\AGENTS.md` 仅新增一行、整份文件仍为纯 LF（该文件原本 CR=0），未出现编码或换行污染。
- 验证改动的爆炸半径限于 4 个文件：`.agents/skills` 目录数 4 → 5，其余 4 个 skill 哈希逐一不变。
- 验证 AI-Wiki 侧未被波及：本次除本日志追加外不改动 AI-Wiki 任何文件，既有 460 条未提交改动原样保留，未执行 `git add` / `git commit` / `git push`。

## 验证结果

| 验证项 | 结论 |
| --- | --- |
| V1 三份目标文件 SHA-256 与 raw 层逐一相同 | PASS |
| V2 三份目标文件无 BOM（首字节 `45,45,45` / `35,32,77` / `35,32,228`）、CR=0 | PASS |
| V3 `references/` 两个被 SKILL.md 引用的文件在目标目录可达 | PASS |
| V4 odoo AGENTS.md 数据行 4 → 5，pattern 命中 1 行 | PASS |
| V5 `.agents/skills` 目录数 4 → 5，其余 4 个 skill 哈希逐一不变 | PASS |
| V6 AI-Wiki 侧除本日志外无其它改动（`git status --porcelain` 保持 460） | PASS |
| V7 本追加记录含 操作时间/模型/类型/范围/摘要/检查目的/下次迭代方向 七项结构，scope 可点击 | PASS |
| V8 odoo AGENTS.md 改后 CR=0、75 行、无 BOM、表格格式与既有行同构 | PASS |

## 下次迭代方向

- odoo 局部副本与 AI-Wiki raw 层之间目前没有自动化同步手段；若后续 skill 再次修订（例如补齐裁决第 4 条的 PG 官方文档链接），需手工重跑一次「逐字节复制 + 哈希互校」，可考虑把该流程脚本化。
- odoo 侧尚无 skill 锁文件或清单（`.agents/skills` 仅目录 + `AGENTS.md` 表格），副本与源的一致性目前只靠哈希人工核对，可评估是否引入一份轻量 `skills-lock` 记录源哈希。
- odoo 的其它 4 个 skill 与 AI-Wiki 无对应关系，未纳入本次安装范围；若需统一托管，再单独规划。
