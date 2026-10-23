---
title: PostgreSQL 设计规范
skill: postgresql-design-specification
category: 数据库与后端工程
category_slug: database-design
source: raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md
tags:
  - SKILL
  - SKILL/database-design
---
# PostgreSQL 设计规范

> [!info] Skill 元信息
> 原始名称：`postgresql-design-specification`  
> 原始标题：MySQL 设计规范 PostgreSQL 改编  
> 功能分类：数据库与后端工程  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/database-design/postgresql-design-specification/SKILL.md)

## 用途

把上游 MySQL 设计规范的 109 条编号条款逐条改编为 PostgreSQL 14+ 适用规范，为表设计、字段与类型选择、索引、分区、SQL 编写等数据库设计决策提供带条款号回溯的中文规范。

## 适用场景

- 数据库建模与建表评审，需要按三级分级（【高危】【强制】【建议】）对照规范条款。
- 从 MySQL 迁移到 PostgreSQL 时，需要逐条确认原规范在 PG 语境下的对应做法或不适用理由。
- 评审 DDL 与 SQL 时，需要携带上游条款号标注（如 `[2.1.3-5]`）回溯出处。

## 关键能力

- 覆盖上游 2.1 数据库设计全部子节：通用命名、库与 schema、表、字段名、数据类型、索引、分区、字符集与排序规则、程序层 DAO 与连接层、规范建表示例。
- 覆盖上游 2.2 SQL 编写全部子节：DML、多表连接、事务、排序与分组、线上禁用 SQL。
- 每条规范条目携带上游条款号标注，纯 PG 补充条款标 `[新增]`，条款号必须能回溯到上游原文。
- 附 4 条条款冲突裁决：enum/set 与关联子查询两处异议、程序层外键立场，以及「名称不含数字」与分片/日期命名规则的冲突。
- 附 PostgreSQL 14+ 版本的规范建表 DDL 示例、DDL 检查清单与 MySQL→PG 差异速查表。
- PG 原生构件覆盖 identity 主键、`timestamptz`、`numeric` 金额、`inet`、`jsonb`、`ON CONFLICT`、`CHECK` 约束、btree/gin/brin 与 `INCLUDE` 索引、`CREATE INDEX CONCURRENTLY`、`NOT VALID` / `VALIDATE CONSTRAINT`、`VACUUM` 自动清理、`ctid` 行为、`FOR UPDATE SKIP LOCKED` 等。

## 使用边界与注意事项

- 本 skill 不替代 PostgreSQL 官方文档，也不覆盖 PG 运维、备份恢复、连接池参数调优手册。
- 版本敏感特性必须先确认版本锚点（identity 声明式主键自 PG 10 起、`ON CONFLICT` 自 9.5 起、声明式分区自 10 起、`jsonb` 自 9.4 起、`gen_random_uuid()` 内置于 PG 13+、`CREATE INDEX CONCURRENTLY` 自 8.2 起可用）。
- 上游条款中与 PostgreSQL 内核行为相反的结论（如禁外键、禁视图）已由冲突裁决条目给出 PG 立场，不得直接照搬 MySQL 语境。

## 上游来源与许可说明

上游来源为 Highflyer/MySQL-Design-Specification 仓库的 README 单文件文档（HEAD commit `14f78853e8b601b78ce2abfc0120b4cf55e06e37`，2021-07-23），上游未提供许可证，本 skill 为用户自用改编。

## 相关 Skill

- [[wiki/SkillHub/skills/skill-creator|Skill 创建、优化与评估]]
- [[wiki/SkillHub/skills/impl-validator|实现结果质量验证]]
- [[wiki/SkillHub/skills/llm-wiki|LLM Wiki 知识蒸馏架构]]
