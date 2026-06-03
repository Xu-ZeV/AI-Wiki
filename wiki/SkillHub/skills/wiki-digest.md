---
title: 周期知识摘要报告
skill: wiki-digest
category: 可视化、仪表盘与导出
category_slug: visualization-export
source: raw/SkillHub/obsidian-wiki/skills/wiki-digest/SKILL.md
tags:
  - SKILL
  - SKILL/visualization-export
---
# 周期知识摘要报告

> [!info] Skill 元信息
> 原始名称：`wiki-digest`  
> 原始标题：Wiki Digest — Knowledge Newsletter Generator  
> 功能分类：可视化、仪表盘与导出  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/wiki-digest/SKILL.md)

## 用途

生成日、周、月等周期的知识 newsletter，总结近期学到了什么、更新了什么、连接了什么。

## 适用场景

当用户问本周学了什么、give me a digest、weekly summary、knowledge report 或 wiki 最近新增知识时使用。

## 关键能力

- 按时间范围汇总知识变化
- 生成可读 newsletter 风格摘要
- 突出新知识、更新和连接
- 区别于 source ingestion delta 报告

## 使用边界与注意事项

- wiki-digest 总结知识，不是源材料状态；源状态用 wiki-status。
- 适合 daily-update 后做面向人的回顾。

## 原始描述摘要

Generate a periodic knowledge digest — a human-readable newsletter-style summary of what was learned, updated, and connected in your wiki over a specified period (day/week/month). Use when the user says "what did I learn this week", "give me a digest", "weekly summary", "knowledge report", "what's new in my wiki", "/wiki-digest [period]", "summarize my recent learning", or wants a readable overview of recent wiki activity. Distinct from wiki-status (which reports ingestion delta of sources) — wiki-digest summarizes *knowledge*, not sources.

## 原始文档章节

- Before You Start
- Step 1: Collect Pages Active in the Period
- Step 2: Identify Themes
- Step 3: Find Notable New Connections
- Step 4: Surface Open Threads
- Step 5: Choose Recommended Re-reads
- Step 6: Generate the Digest
- Headlines
- New Knowledge
- Emerging Themes
- Key Connections Made
- Open Threads
- Recommended Re-reads
- Step 7: Output & Optionally Save
- Edge Cases
- Notes
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/daily-update|每日 Wiki 维护循环]]
- [[wiki/SkillHub/skills/wiki-status|Wiki 状态与增量审计]]
- [[wiki/SkillHub/skills/wiki-query|Wiki 知识检索问答]]
