# Obsidian Wiki — 副驾驶上下文

该项目是一个**基于技能的框架**，用于使用人工智能编码代理构建和维护Obsidian知识库。没有脚本或依赖项——一切都是代理直接执行的 Markdown 指令。

## 项目概述

- **目的：** 使用 LLM Wiki 模式（Andrej Karpathy）构建和维护 Obsidian wiki。
- **技术堆栈：** 仅 Markdown。没有代码，没有依赖关系。 AI 代理是运行时。
- **关键配置：** `.env` 包含指向vault位置的 `OBSIDIAN_VAULT_PATH`。
- **技能：** `.skills/` 包含技能文件夹，每个文件夹都有一个定义工作流程的 `SKILL.md`。

## 关键概念

- wiki是一个**编译的工件**——从原始资源中提取的知识到相互关联的页面中。
- 每个 wiki 页面都有 YAML frontmatter：`title`、`category`、`tags`、`sources`、`created`、`updated`。
- 页面与 Obsidian `[[wikilinks]]` 连接。
- vault根目录中的 `.manifest.json` 跟踪基于增量更新的所有摄取源。
- 每次操作后必须更新 `index.md` 和 `log.md`。

## 技能参考

|技能|文件夹|目的|
|---|---|---|
|设置 | `.skills/wiki-setup/` |初始化库结构 |
|摄取| `.skills/wiki-ingest/` |将文档提取到 wiki 页面 |
|历史路由器| `.skills/wiki-history-ingest/` |将 `/wiki-history-ingest <claude|codex>` 路由到正确的历史技能 |
|克劳德历史| `.skills/claude-history-ingest/` |我的 `~/.claude` 对话 |
|法典历史| `.skills/codex-history-ingest/` |挖掘 `~/.codex` 会话和推出日志 |
|数据摄取| `.skills/data-ingest/` |处理任何文本数据 |
|状态 | `.skills/wiki-status/` |审核摄取状态和增量 |
|查询 | `.skills/wiki-query/` |回答wiki的问题 |
|棉绒 | `.skills/wiki-lint/` |查找失效链接、孤立链接 |
|重建| `.skills/wiki-rebuild/` |存档和重建 |
|交联剂| `.skills/cross-linker/` |自动发现并插入缺失的维基链接 |
|标签分类 | `.skills/tag-taxonomy/` |强制执行一致的标签词汇 |
|LLM维基 | `.skills/llm-wiki/` |核心架构模式|
|技能创造者| `.skills/skill-creator/` |创造新技能 |

## 编码约定

- 创建 wiki 页面时，始终使用 YAML frontmatter。
- 使用 `[[wikilinks]]` 语法进行交叉引用 - 而不是 Markdown 链接。
- 项目特定知识位于 `projects/<name>/` 中。全球知识属于顶级类别。
- 切勿修改 `.obsidian/` 目录。
