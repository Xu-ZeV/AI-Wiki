---
title: Wiki 知识检索问答
skill: wiki-query
category: 知识检索与上下文复用
category_slug: retrieval-context
source: raw/SkillHub/categories/retrieval-context/wiki-query/SKILL.md
tags:
  - SKILL
  - SKILL/retrieval-context
---
# Wiki 知识检索问答

> [!info] Skill 元信息
> 原始名称：`wiki-query`  
> 原始标题：Wiki Query — Knowledge Retrieval  
> 功能分类：知识检索与上下文复用  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/retrieval-context/wiki-query/SKILL.md)

## 用途

通过搜索已编译的 Obsidian wiki 来回答问题，并用 wiki 页面作为引用依据综合答案。

## 适用场景

当用户问“我知道什么关于 X”、“找所有 Y 相关内容”、要求基于知识库回答，或探索主题连接时使用。

## 关键能力

- 检索相关页面
- 阅读并综合页面内容
- 提供带引用的回答
- 支持 index-only 快速模式只扫摘要和 frontmatter

## 使用边界与注意事项

- 这是查询已有 wiki 的入口，不负责导入新资料。
- 快速模式适合粗略定位，深度回答应读取页面正文。

## 原始描述摘要

Answer questions by searching the compiled Obsidian wiki. Use this skill when the user asks a question about their knowledge base, wants to find information across their wiki, asks "what do I know about X", "find everything related to Y", or wants synthesized answers with citations from their wiki pages. Also use when the user wants to explore connections between topics in their wiki. Works from any project. Includes an index-only fast mode triggered by "quick answer", "just scan", "don't read the pages", "fast lookup" — returns answers from page summaries and frontmatter without reading page bodies.

## 原始文档章节

- Before You Start
- Visibility Filter (optional)
- Retrieval Protocol
- Answer Format

## 相关 Skill

- [[wiki/SkillHub/skills/wiki-context-pack|Token 受限上下文包]]
- [[wiki/SkillHub/skills/memory-bridge|跨工具记忆浏览与差异比较]]
- [[wiki/SkillHub/skills/wiki-status|Wiki 状态与增量审计]]
