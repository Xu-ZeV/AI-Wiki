---
title: 数据库与后端工程
category_slug: database-design
tags:
  - SKILL/category
---
# 数据库与后端工程

面向关系型数据库设计与 SQL 编写的改编规范能力，把 MySQL 设计规范逐条改编为 PostgreSQL 14+ 适用规范。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[postgresql-design-specification]] | PostgreSQL 设计规范 | `postgresql-design-specification` | 将上游 MySQL 设计规范 109 条条款改编为 PostgreSQL 14+ 适用规范，携带条款号回溯、条款冲突裁决与 MySQL→PG 差异速查。 |

## 使用建议

- 数据库建模与 SQL 评审时，用该 skill 的条款号回溯机制定位上游出处，再按 PostgreSQL 语境采纳或声明不适用。
- 遇到版本敏感特性（identity、`jsonb`、`ON CONFLICT` 等）先确认版本锚点，再套用对应条款。
