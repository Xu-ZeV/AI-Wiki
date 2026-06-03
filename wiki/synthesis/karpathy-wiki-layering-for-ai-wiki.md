---
title: Karpathy Wiki 分层在 AI-Wiki 中的落地
category: synthesis
tags:
  - 综合分析
  - LLM
  - wiki
sources:
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
  - AGENTS.md
summary: 本页把 Karpathy 的 raw sources、wiki、schema 三层模式映射到 AI-Wiki 的 raw、wiki、AGENTS.md 与 log 维护制度。
created: 2026-05-26T08:31:00+08:00
updated: 2026-05-26T08:31:00+08:00
---

# Karpathy Wiki 分层在 AI-Wiki 中的落地

Karpathy 的 [[wiki/concepts/llm-wiki|LLM Wiki]] 是三层架构：raw source 保存原始资料，wiki 保存蒸馏知识，schema 规定维护方式。AI-Wiki 可以按这个模型分级。

## AI-Wiki 分层映射

| Karpathy 层级 | AI-Wiki 对应位置 | 职责 |
| --- | --- | --- |
| Raw Sources | `raw/` 和外部来源链接 | 保存权威原始资料，不在高层导航中直接展开。 |
| Wiki | `wiki/concepts/`、`wiki/entities/`、`wiki/references/`、`wiki/synthesis/`、`wiki/SkillHub/` | 承载蒸馏后的中文知识、导航和交叉链接。 |
| Schema | `AGENTS.md`、skill 说明、标签和日志规则 | 规定 agent 如何维护 wiki，避免链接边界和标签体系混乱。 |

## 四类 wiki 页面

- [[wiki/concepts/index|concepts]]：放概念、理论、模型，例如 [[wiki/concepts/llm-wiki|LLM Wiki]]。
- [[wiki/entities/index|entities]]：放人、组织、工具、项目，例如 [[wiki/entities/andrej-karpathy|Andrej Karpathy]]。
- [[wiki/references/index|references]]：放单个来源摘要，例如 [[wiki/references/karpathy-llm-wiki-gist|Karpathy LLM Wiki Gist]]。
- [[wiki/synthesis/index|synthesis]]：放跨页面结论和项目化落地分析，例如本文。

## 与 SkillHub 的关系

`wiki/SkillHub` 是 wiki 层中的一个专题区。它有更严格的内部边界：

- `wiki/SkillHub/index.md` 只链接分类页。
- `wiki/SkillHub/categories/*.md` 只链接具体 skill 页面。
- `wiki/SkillHub/skills/*.md` 才链接原始 `raw/SkillHub/**/SKILL.md`。

这种边界让顶层图谱更清晰：高层页面负责导航，详情页负责来源追溯。

## 操作结论

AI-Wiki 后续维护知识时，应优先判断新增内容属于哪一层：

- 如果是未加工来源，放入 raw source 或在 reference 页记录来源链接。
- 如果是可复用概念，放入 concepts。
- 如果是人物、组织、工具或项目，放入 entities。
- 如果是单个来源摘要，放入 references。
- 如果是跨来源、跨页面或项目化结论，放入 synthesis。
- 如果是维护规则，更新 schema 层，也就是 `AGENTS.md` 或对应 skill 说明。
