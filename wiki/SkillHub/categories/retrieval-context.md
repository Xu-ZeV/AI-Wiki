---
title: 知识检索与上下文复用
category_slug: retrieval-context
tags:
  - SKILL/category
---
# 知识检索与上下文复用

围绕已编译 wiki 做问答、上下文打包、跨工具记忆比较和知识库架构理解。

## Skill 列表

| Skill | 中文名 | 原始 Skill | 功能定位 |
| --- | --- | --- | --- |
| [[wiki-query]] | Wiki 知识检索问答 | `wiki-query` | 通过搜索已编译的 Obsidian wiki 来回答问题，并用 wiki 页面作为引用依据综合答案。 |
| [[wiki-context-pack]] | Token 受限上下文包 | `wiki-context-pack` | 从 Obsidian wiki 中生成与某主题相关、token 有界、结构化的上下文切片，供其他 agent 或任务复用。 |
| [[memory-bridge]] | 跨工具记忆浏览与差异比较 | `memory-bridge` | 按原始 AI 工具来源浏览和比较 wiki 知识，找出不同工具之间的记忆差异和盲点。 |
| [[llm-wiki]] | LLM Wiki 知识蒸馏架构 | `llm-wiki` | 解释和指导基于 LLM 的 Obsidian wiki 知识蒸馏模式，包括 raw sources、wiki、schema 三层架构。 |

## 使用建议

- 直接回答问题用 wiki-query；为后续任务准备材料用 wiki-context-pack；比较工具来源差异用 memory-bridge。
- llm-wiki 适合做架构和方法论判断，不直接替代操作型 skill。
