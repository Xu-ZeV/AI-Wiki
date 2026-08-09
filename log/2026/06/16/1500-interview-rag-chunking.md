---
tags:
  - 日志
---

# Interview 文档 RAG 切分结构规范化

- 操作时间：2026-06-16 15:22:47 +08:00
- 操作模型：GPT-5 Codex
- 操作类型：Iteration, Lint
- 操作范围：
  - [[raw/interview/redis-interview-common-questions|Redis 常见面试题与热门知识点]]
  - [[raw/interview/mysql-interview|MySQL 面试题]]
  - [[raw/interview/metalim-interview-prep|测亿-MetaLIMS 实验室管理系统面试准备]]
- 操作摘要：统一 `raw/interview` 下 Markdown 标题结构为 H1 文档标题、H2 分类、H3 问题；将 MySQL 文档的“标准回答/回答要点/常见误区/示例”等答案内部小节改为加粗标签，避免 RAGFlow 使用 `\n###` 分隔符时误切到答案内部；修正 Redis 文档 H1 前导空格，并为末尾进阶知识点补充 H3 问题标题；将 MetaLIMS 文档的说明型 H3 调整为问句式标题。
- 检查目的：验证 `raw/interview` 文档是否适合使用 RAGFlow 面试题库策略，即 `General`、文本分段标识符 `\n###`、不启用父子切片、Overlap 为 `0`。
- 下次迭代方向：导入 RAGFlow 后检查实际切片结果，重点确认每个 chunk 是否以一个 H3 问题为边界，且“示例/回答要点/常见误区”没有被拆成独立 chunk。
