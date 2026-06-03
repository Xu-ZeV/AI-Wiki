---
title: Token 受限上下文包
skill: wiki-context-pack
category: 知识检索与上下文复用
category_slug: retrieval-context
source: raw/SkillHub/obsidian-wiki/skills/wiki-context-pack/SKILL.md
tags:
  - SKILL
  - SKILL/retrieval-context
---
# Token 受限上下文包

> [!info] Skill 元信息
> 原始名称：`wiki-context-pack`  
> 原始标题：Wiki Context Pack — Bounded Token Retrieval  
> 功能分类：知识检索与上下文复用  
> 原始文件：[SKILL.md](../../../raw/SkillHub/obsidian-wiki/skills/wiki-context-pack/SKILL.md)

## 用途

从 Obsidian wiki 中生成与某主题相关、token 有界、结构化的上下文切片，供其他 agent 或任务复用。

## 适用场景

当用户要求 context pack、给 agent 准备上下文、为某主题打包知识或需要 bounded context 时使用。

## 关键能力

- 选择最相关 wiki 页面
- 压缩为下游可消费的结构
- 控制 token 预算
- 区分事实、上下文、引用和任务线索

## 使用边界与注意事项

- 和 wiki-query 的区别：context-pack 输出可复用材料，wiki-query 直接回答问题。
- 适合把 wiki 知识交给另一个模型或后续任务。

## 原始描述摘要

Produce a token-bounded context pack from the Obsidian wiki — a compact, structured slice of the most relevant pages for a topic or recent activity, designed for downstream consumption by another agent or skill. Use when the user says "/wiki-context-pack", "make a context pack", "give me a context slice for X", "pack the wiki for my agent", or "bounded context for Y". Different from wiki-query (which answers a question) — this produces reusable input material for a downstream task.

## 原始文档章节

- Before You Start
- Invocation Forms
- Algorithm
- `[[<category/page-name>]]` (<tier>, ~<tokens> tokens)
- `[[<next-page>]]` (<tier>, ~<tokens> tokens)
- Use Cases
- Notes

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-query|Wiki 知识检索问答]]
- [[wiki/SkillHub/skills/memory-bridge|跨工具记忆浏览与差异比较]]
- [[wiki/SkillHub/skills/llm-wiki|LLM Wiki 知识蒸馏架构]]
