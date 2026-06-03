---
title: 配置、自动化与多库管理
category_slug: setup-automation
tags:
  - SKILL/category
---
# 配置、自动化与多库管理

初始化 vault、切换多 wiki 配置，以及审核并提交 staged wiki 写入。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[wiki-setup]] | Obsidian Wiki 初始化 | `wiki-setup` | 初始化新的 Obsidian wiki vault，创建目录结构、特殊文件和配置文件，也可修复破损配置。 |
| [[wiki-switch]] | 多 Wiki 配置切换 | `wiki-switch` | 管理多个 Obsidian wiki vault profile，通过命名配置切换当前 active wiki。 |
| [[wiki-stage-commit]] | Staged Wiki 写入审核提交 | `wiki-stage-commit` | 在启用 WIKI_STAGED_WRITES=true 时，审核暂存 wiki 页面并把接受的页面提升到最终位置。 |

## 使用建议

- 新 vault 从 wiki-setup 开始；多 vault 用 wiki-switch；开启 staged writes 后用 wiki-stage-commit 做人工审核。
- 切换配置或提交暂存内容后，建议运行 wiki-status 确认状态。
