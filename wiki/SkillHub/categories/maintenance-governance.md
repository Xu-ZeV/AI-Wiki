---
title: 维护、治理与知识质量
category_slug: maintenance-governance
tags:
  - SKILL/category
---
# 维护、治理与知识质量

维护 wiki 健康度，处理链接、标签、重复页、合成页、状态审计和重建流程。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[daily-update]] | 每日 Wiki 维护循环 | `daily-update` | 执行日常 wiki 维护：检查来源新鲜度、更新索引、刷新 hot.md，并可设置或验证定时提醒基础设施。 |
| [[wiki-status]] | Wiki 状态与增量审计 | `wiki-status` | 展示 wiki 当前状态、已导入内容、待处理来源、source 与 wiki 的差异，以及知识图谱结构洞察。 |
| [[wiki-lint]] | Wiki 健康检查与修复 | `wiki-lint` | 审计 Obsidian wiki 健康度，发现孤立页、断链、矛盾、陈旧内容、标签问题和结构异常。 |
| [[wiki-dedup]] | Wiki 页面级去重与身份解析 | `wiki-dedup` | 扫描并合并描述同一概念的重复页面，例如缩写页和全称页之间的身份冲突。 |
| [[cross-linker]] | 自动交叉链接补全 | `cross-linker` | 扫描 wiki 页面，发现缺失的交叉引用，并实际修改页面添加 wikilinks，让知识图谱更连通。 |
| [[tag-taxonomy]] | 受控标签分类体系 | `tag-taxonomy` | 用受控词表维护 Obsidian wiki 标签一致性，规范标签命名、别名、层级和使用场景。 |
| [[wiki-synthesize]] | 跨主题合成页发现 | `wiki-synthesize` | 系统发现 wiki 中频繁共同出现但尚未被显式连接的概念组合，并创建 synthesis 页面提炼跨领域结论。 |
| [[wiki-rebuild]] | Wiki 归档、重建与恢复 | `wiki-rebuild` | 归档现有 wiki 知识并从源材料重新构建，或从旧归档中恢复版本。 |

## 使用建议

- 先用 wiki-status 判断状态，再按问题选择 lint、dedup、cross-linker、tag-taxonomy 或 rebuild。
- 涉及合并、重建或批量写入时，应先确认范围并保留备份。
