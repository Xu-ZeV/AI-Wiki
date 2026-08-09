---
name: obsidian-wiki-ingest
description: >
  Automates ingestion of documents into the Obsidian wiki (obsidian-wiki) using the wiki-ingest pipeline. Handles deduplication via manifest, frontmatter, and cross-links; triggers on user request within the obsidian-wiki project context.
---

# Obsidian Wiki Ingest — 自动化技能

您是将文档提取到 Obsidian wiki 项目的自动化层。该技能可以协调摄取工作流程，确保重复数据删除、正确的 frontmatter 以及与现有页面的交叉链接。

## 触发器
- 用户说：“摄取到 wiki”、“添加到 wiki”或任何针对 obsidian-wiki 存储库的措辞。
- 上下文：在 /home/ubuntu/projects/obsidian-wiki 工作区中处于活动状态。

## 职责
- 验证环境和清单状态中的目标vault路径。
- 根据用户输入或源的更改，决定追加、完整或原始摄取模式。
- 调用 wiki 摄取工作流程来处理新的/修改的源。
- 使用摄取元数据更新清单和日志文件。
- 根据需要创建或更新项目概述页面和交叉链接。

## 输入
- 来自 OBSIDIAN_SOURCES_DIR 或 _raw/ 的源文档（Markdown、PDF、文本、图像）
- OBSIDIAN_VAULT_PATH 的vault路径
- 可选：摄取模式（追加|完整|原始）

## 输出
- 通过提炼的知识更新了维基页面
- 更新了 .manifest.json 和日志条目
- 可选：新的/更新的项目概述页面

## 探测和安全
- 不要摄取秘密或敏感数据。
- 尊重现有的页面结构并避免重复内容。
- 用出处注释标记推断/模糊的知识。

## 示例工作流程（高级）
1) 确定摄取模式和目标路径
2) 使用所选模式运行 wiki-ingest
3）更新清单/日志并刷新wiki索引
4) 返回变更的简要摘要

## 后续步骤
- 如果您批准，我将创建一个小型包装脚本 (scripts/ingest-wiki.sh)，用于启动当前项目的摄取并更新清单。然后连接一个简单的命令别名以从 CLI 触发此技能。

## Vault 写入后 QMD 刷新

QMD 是一个搜索索引，而不是事实来源。如果 `$QMD_WIKI_COLLECTION` 为空或未设置，则跳过此步骤。仅在该技能写入或重写了Vault Markdown后才运行它。如果 QMD 刷新失败，请勿回滚vault更改；单独报告 QMD 状态。

如果设置，则使用 `$QMD_CLI`；否则使用 `qmd`。

```bash
${QMD_CLI:-qmd} update
```

如果输出表明需要向量或嵌入可能已过时，请运行：

```bash
${QMD_CLI:-qmd} embed
```

使用以下任一方法验证集合：

```bash
${QMD_CLI:-qmd} ls "$QMD_WIKI_COLLECTION"
```

或者，当特定页面路径已知时：

```bash
${QMD_CLI:-qmd} get "qmd://$QMD_WIKI_COLLECTION/<page>.md" -l 5
```

记录以下之一：
- `QMD refreshed: update + embed + verified`
- `QMD refreshed: update only + verified`
- `QMD skipped: QMD_WIKI_COLLECTION unset`
- `QMD skipped: qmd CLI unavailable`
- `QMD failed: <short error summary>`