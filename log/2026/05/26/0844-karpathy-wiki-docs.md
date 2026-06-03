---
title: Karpathy Wiki 分层文档生成
tags:
  - 日志
time: 2026-05-26 08:44:00 +08:00
model: GPT-5 Codex
type:
  - Iteration
scope:
  - "[[AGENTS|Agent 行为准则]]"
  - "[[wiki/index|Wiki 索引]]"
  - "[[wiki/concepts/llm-wiki|LLM Wiki]]"
  - "[[wiki/entities/andrej-karpathy|Andrej Karpathy]]"
  - "[[wiki/references/karpathy-llm-wiki-gist|Karpathy LLM Wiki Gist]]"
  - "[[wiki/synthesis/karpathy-wiki-layering-for-ainote|Karpathy Wiki 分层在 AInote 中的落地]]"
  - "[Karpathy LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)"
---

# Karpathy Wiki 分层文档生成

## 操作摘要

修改日志规则为“只有发生项目文件修改时才新增日志”，删除上一轮纯查询产生的日志，并按照 concepts、entities、references、synthesis 四类层级生成 Karpathy LLM Wiki 相关中文 wiki 页面及索引。

## 检查目的

验证 Karpathy 的 raw sources、wiki、schema 三层架构能否映射到 AInote 的 `raw/`、`wiki/`、`AGENTS.md` 与 `log/` 维护制度，确保新增目录的 `index.md` 已同步创建，并确认纯查询不再单独写入日志。

## 下次迭代方向

后续可补充 raw source 本地镜像或更完整的来源摘录，并检查全库 wikilink 是否唯一解析、标签是否需要统一成更稳定的中文或英文分类体系。
