---
title: SkillHub 中文索引
tags:
  - SKILL
  - 索引
---
# SkillHub 中文索引

本索引是 SkillHub 中文 wiki 的顶层入口，只链接功能分类页。具体 skill 入口在各分类页中，原始 SKILL.md 来源只保留在具体 skill 详情页。

生成日期：2026-06-18

## 维护准则

生成或维护 `wiki/SkillHub` 文档时，必须遵守本节规则。

### 分层链接边界

- `wiki/SkillHub/index.md` 只作为顶层索引，只链接 `wiki/SkillHub/categories/*` 分类页。
- `wiki/SkillHub/categories/*.md` 只作为分类聚合页，只正向链接 skill 中文 wiki 页；Skill 列表第一列必须使用短 wikilink `[[skill-slug]]`，例如 `[[wiki-setup]]`，不要写成 `[[wiki/SkillHub/skills/wiki-setup|Obsidian Wiki 初始化]]`。
- `wiki/SkillHub/skills/*.md` 才能链接对应的原始 `raw/SkillHub/**/SKILL.md` 文件。
- `wiki/SkillHub/skills/*.md` 不应反向链接 `wiki/SkillHub/categories/*`；分类归属保留为 frontmatter 字段或纯文本，例如 `category: 配置、自动化与多库管理`、`功能分类：配置、自动化与多库管理`。
- 原始 skill 来源、原始路径、原始 `SKILL.md` 链接只应出现在具体 skill 详情页中。
- `skills/*.md` 可以保留同级 skill 之间的“相关 Skill”横向链接；这属于 wiki 内部交叉引用，不违反分层规则。

### 标签准则

- `wiki/SkillHub` 下所有页面使用 `SKILL` 作为主标签，不使用 `skillhub`。
- `wiki/SkillHub` 下的分类标签使用 `SKILL/<分类>` 形式，例如 `SKILL/content-ingest`。
- `wiki/SkillHub/categories/*.md` 作为分类页时，使用 `SKILL/category` 标签。

### 设计理念

该规则符合 `llm-wiki` 的三层架构：

- `raw/SkillHub/**/SKILL.md` 是 raw source 层，作为权威来源保留，不在高层索引中直接展开。
- `wiki/SkillHub/categories/*` 和 `wiki/SkillHub/skills/*` 是 wiki 层，承载蒸馏后的中文说明与导航。
- 分层索引让 Obsidian 图谱更清晰，也避免总索引和分类页混入过多原始来源边。

### 维护检查

更新 SkillHub wiki 后，应检查：

- 若某个目录下存在 `index.md`，并且该目录或其子目录内容发生新增、删除、重命名、分类调整或导航相关改动，必须检查该 `index.md` 是否需要同步更新；如本次操作产生项目文件修改，应在日志中说明已检查及是否更新。
- `index.md` 不直接链接 `wiki/SkillHub/skills/*`。
- `index.md` 不直接链接 `raw/SkillHub/*`。
- `categories/*.md` 不直接链接 `raw/SkillHub/*`。
- `categories/*.md` 的内部 skill wikilink 必须使用短链接 `[[skill-slug]]`，并且该短链接在当前 vault 中必须唯一解析到 `wiki/SkillHub/skills/skill-slug.md`。
- `skills/*.md` 不应包含指向 `wiki/SkillHub/categories/*` 的 wikilink，避免产生 skill 到分类页的反向连接。
- `skills/*.md` 中的原始来源链接必须指向实际存在的 `raw/SkillHub/**/SKILL.md`。
- 所有 Obsidian wikilink 都应能解析到已存在的 wiki 页面，示例或占位符链接应写成代码文本，避免产生虚假图谱节点。

## 分类索引

### Wiki 与 Obsidian 知识库

围绕 Obsidian vault、wiki 知识库导入、检索、维护、治理、导出和 SkillHub 自身开发的能力。

| 分类 | 数量 | 功能范围 |
| --- | ---: | --- |
| [[wiki/SkillHub/categories/obsidian-basic\|Obsidian 基础能力与文件格式]] | 4 | 面向 Obsidian 笔记、CLI、Bases 数据视图和 JSON Canvas 文件的基础操作能力。 |
| [[wiki/SkillHub/categories/content-ingest\|内容采集与导入]] | 8 | 把网页、文档、原始文本、当前会话或项目知识蒸馏进 Obsidian wiki。 |
| [[wiki/SkillHub/categories/agent-history\|AI 会话历史导入]] | 8 | 从 Claude、Codex、Copilot、Hermes、OpenClaw、Pi 等工具历史中挖掘可复用知识。 |
| [[wiki/SkillHub/categories/retrieval-context\|知识检索与上下文复用]] | 4 | 围绕已编译 wiki 做问答、上下文打包、跨工具记忆比较和知识库架构理解。 |
| [[wiki/SkillHub/categories/maintenance-governance\|维护、治理与知识质量]] | 8 | 维护 wiki 健康度，处理链接、标签、重复页、合成页、状态审计和重建流程。 |
| [[wiki/SkillHub/categories/visualization-export\|可视化、仪表盘与导出]] | 4 | 生成动态图表视图、知识摘要、图谱配色和外部工具可用的知识图谱导出。 |
| [[wiki/SkillHub/categories/setup-automation\|配置、自动化与多库管理]] | 3 | 初始化 vault、切换多 wiki 配置，以及审核并提交 staged wiki 写入。 |
| [[wiki/SkillHub/categories/skill-dev\|Skill 开发与验证]] | 2 | 创建、优化、评估 skill，并对实现结果做结构化质量验证。 |

### 前端设计、工程与视觉生成

围绕高级前端界面、现有项目 UI 改造、Vue 工程实践、视觉参考图、品牌系统和设计交付约束的能力。

| 分类 | 数量 | 功能范围 |
| --- | ---: | --- |
| [[wiki/SkillHub/categories/frontend-ui-design\|高级前端 UI 设计与重构]] | 8 | 生成或改造高质量网站、产品界面、落地页和实验性前端视觉风格。 |
| [[wiki/SkillHub/categories/vue-engineering\|Vue 3 工程实践]] | 8 | 面向 Vue 3、Composition API、Options API、Router、Pinia、测试、JSX、调试和 composable 的工程实践。 |
| [[wiki/SkillHub/categories/visual-reference-generation\|视觉参考图与品牌生成]] | 3 | 生成网站分区参考图、移动端多屏流程图和品牌视觉系统板。 |
| [[wiki/SkillHub/categories/design-delivery-governance\|设计交付、系统化与输出约束]] | 2 | 生成设计系统交付文档，约束完整输出，减少占位符和半成品交付。 |

## 使用路径

### Wiki 与 Obsidian 知识库

- 新建或编辑 Obsidian 文件：从 [[wiki/SkillHub/categories/obsidian-basic|Obsidian 基础能力与文件格式]] 开始。
- 把外部资料加入知识库：从 [[wiki/SkillHub/categories/content-ingest|内容采集与导入]] 开始。
- 导入历史会话：从 [[wiki/SkillHub/categories/agent-history|AI 会话历史导入]] 开始。
- 查询、打包或比较知识：从 [[wiki/SkillHub/categories/retrieval-context|知识检索与上下文复用]] 开始。
- 维护 wiki 质量：从 [[wiki/SkillHub/categories/maintenance-governance|维护、治理与知识质量]] 开始。

### 前端设计、工程与视觉生成

- 生成或改造前端界面：从 [[wiki/SkillHub/categories/frontend-ui-design|高级前端 UI 设计与重构]] 开始。
- 处理 Vue 3 工程实现、状态、路由、测试或调试：从 [[wiki/SkillHub/categories/vue-engineering|Vue 3 工程实践]] 开始。
- 生成视觉参考图或品牌板：从 [[wiki/SkillHub/categories/visual-reference-generation|视觉参考图与品牌生成]] 开始。
- 需要设计系统交付或完整输出约束：从 [[wiki/SkillHub/categories/design-delivery-governance|设计交付、系统化与输出约束]] 开始。
