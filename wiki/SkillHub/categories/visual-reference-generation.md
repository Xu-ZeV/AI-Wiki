---
title: 视觉参考图与品牌生成
category_slug: visual-reference-generation
tags:
  - SKILL/category
---
# 视觉参考图与品牌生成

面向设计参考图、移动端界面概念、网站分区视觉稿和品牌视觉板的图像生成 skill。它们主要产出可供人或编码 agent 参考的图像，不直接负责写代码。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[imagegen-frontend-web]] | 网站分区视觉参考图生成 | `imagegen-frontend-web` | 为网站、落地页和产品页逐区生成横向设计参考图，保证每个 section 单独成图。 |
| [[imagegen-frontend-mobile]] | 移动 App 界面流程图生成 | `imagegen-frontend-mobile` | 生成 iOS、Android 或跨平台移动端界面概念与多屏流程图，强调原生感和可读性。 |
| [[brandkit]] | 品牌视觉系统板生成 | `brandkit` | 生成品牌指南板、logo 方向、色彩系统、字体系统和应用 mockup，帮助建立完整品牌世界。 |

## 使用建议

- 需要网站设计参考时用 imagegen-frontend-web，并要求每个页面区块单独出图。
- 需要 App 多屏流程或移动端概念时用 imagegen-frontend-mobile。
- 需要先确定品牌调性、标志方向或视觉系统时用 brandkit，再把结果交给前端实现 skill。
