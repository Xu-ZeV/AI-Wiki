---
title: 每日 Wiki 维护循环
skill: daily-update
category: 维护、治理与知识质量
category_slug: maintenance-governance
source: raw/SkillHub/obsidian-wiki/skills/daily-update/SKILL.md
tags:
  - SKILL
  - SKILL/maintenance-governance
---
# 每日 Wiki 维护循环

> [!info] Skill 元信息
> 原始名称：`daily-update`  
> 原始标题：Daily Update — Wiki Maintenance Cycle  
> 功能分类：维护、治理与知识质量  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/daily-update/SKILL.md)

## 用途

执行日常 wiki 维护：检查来源新鲜度、更新索引、刷新 hot.md，并可设置或验证定时提醒基础设施。

## 适用场景

当用户说 daily update、morning sync、refresh wiki index、update everything，或需要设置 9 点 cron 提醒时使用。

## 关键能力

- 检查 source freshness
- 更新 wiki index
- 生成 hot.md
- 设置或验证定时任务和终端提醒

## 使用边界与注意事项

- 适合例行维护，不等同于深度去重或重建。
- 维护后可配合 wiki-status 查看变化。

## 原始描述摘要

Run the daily wiki maintenance cycle: check all source freshness, update the index, and regenerate hot.md. Use this skill when the user says "/daily-update", "run the daily update", "update everything", "morning sync", "refresh the wiki index", or when triggered by the launchd cron at 9 AM. Also use to set up or verify the cron + terminal notification infrastructure for the first time ("set up the daily cron", "install the terminal notification", "how do I get the morning reminder?").

## 原始文档章节

- Before You Start
- Modes
- Daily Wiki Update
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-status|Wiki 状态与增量审计]]
- [[wiki/SkillHub/skills/wiki-lint|Wiki 健康检查与修复]]
- [[wiki/SkillHub/skills/wiki-digest|周期知识摘要报告]]
