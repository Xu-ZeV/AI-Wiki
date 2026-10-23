---
title: URL 页面蒸馏入库
skill: ingest-url
category: 内容采集与导入
category_slug: content-ingest
source: raw/SkillHub/categories/content-ingest/ingest-url/SKILL.md
tags:
  - SKILL
  - SKILL/content-ingest
---
# URL 页面蒸馏入库

> [!info] Skill 元信息
> 原始名称：`ingest-url`  
> 原始标题：Ingest URL — Web Page Distillation  
> 功能分类：内容采集与导入  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/content-ingest/ingest-url/SKILL.md)

## 用途

抓取一个 URL，并把网页内容蒸馏成 Obsidian wiki 中的结构化知识页。

## 适用场景

当用户说添加这个链接、保存此页面、ingest 这个 URL，或粘贴 URL 要加入 wiki 时使用。

## 关键能力

- 根据当前项目目录决定落库位置
- 把网页内容转化为 wiki 页面
- 为页面建立项目归属或 misc 归档
- 适合网页、文档页、文章和参考资料入库

## 使用边界与注意事项

- 如果在项目目录内调用，内容优先进入该项目对应 wiki 区域。
- 和 defuddle 的区别是：defuddle 只清理正文，ingest-url 负责入库。

## 原始描述摘要

Fetch a URL and distill its content into the Obsidian wiki. If invoked from inside a project directory, the page lands directly in that project's folder (creating the project in the vault if needed). Otherwise it goes to misc/ and gains project affinity over time. Use this skill when the user says "/ingest-url <url>", "add this URL to the wiki", "ingest this link", "save this page", or pastes a URL and says "add this" or "save this to my wiki".

## 原始文档章节

- Content Trust Boundary
- Before You Start
- Step 0: Detect Current Project
- Step 0.5: Clean Extraction Preflight
- Step 1: Fetch the URL
- Step 2: Check for Duplicate
- Step 3: Determine Target Path and Generate Slug
- Step 4: Extract Knowledge
- Step 5: Write the Page
- Step 5b: Affinity scoring (misc mode only)
- Step 6: Update Project Overview (project mode only)
- References
- Step 7: Update Manifest and Special Files
- Step 8: Update hot.md
- Quality Checklist
- QMD Refresh After Vault Writes

## 相关 Skill

- [[wiki/SkillHub/skills/defuddle|Defuddle 网页正文提取]]
- [[wiki/SkillHub/skills/wiki-ingest|文档知识蒸馏入库]]
- [[wiki/SkillHub/skills/wiki-update|项目知识同步到 Wiki]]
