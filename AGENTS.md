# Agent 行为准则

## 回复语言

- 始终使用简体中文回复。

## SkillHub Wiki 分层链接准则

生成或维护 `wiki/SkillHub` 文档时，必须遵守分层链接边界：

- `wiki/SkillHub/index.md` 只作为顶层索引，只链接 `wiki/SkillHub/categories/*` 分类页。
- `wiki/SkillHub/categories/*.md` 只作为分类聚合页，只正向链接 skill 中文 wiki 页；Skill 列表第一列必须使用短 wikilink `[[skill-slug]]`，例如 `[[wiki-setup]]`，不要写成 `[[wiki/SkillHub/skills/wiki-setup|Obsidian Wiki 初始化]]`。
- `wiki/SkillHub/skills/*.md` 才能链接对应的原始 `raw/SkillHub/**/SKILL.md` 文件。
- `wiki/SkillHub/skills/*.md` 不应反向链接 `wiki/SkillHub/categories/*`；分类归属保留为 frontmatter 字段或纯文本，例如 `category: 配置、自动化与多库管理`、`功能分类：配置、自动化与多库管理`。
- 原始 skill 来源、原始路径、原始 `SKILL.md` 链接只应出现在具体 skill 详情页中。
- `skills/*.md` 可以保留同级 skill 之间的“相关 Skill”横向链接；这属于 wiki 内部交叉引用，不违反分层规则。

## 标签准则

生成或维护项目 Markdown frontmatter 时，必须遵守标签命名：

- 所有 `index.md` 索引文件必须包含 `索引` 标签。
- `wiki/SkillHub` 下所有页面使用 `SKILL` 作为主标签，不使用 `skillhub`。
- `wiki/SkillHub` 下的分类标签使用 `SKILL/<分类>` 形式，例如 `SKILL/content-ingest`。
- `wiki/SkillHub/categories/*.md` 作为分类页时，使用 `SKILL/category` 标签。
- `log/YYYY/MM/DD/*.md` 日志文件必须包含 `日志` 标签。
- 后续新增或批量生成文档后，应检查是否残留旧标签 `skillhub` 或英文 `index` 标签。

## 设计理念

该规则符合 `llm-wiki` 的三层架构：

- `raw/SkillHub/**/SKILL.md` 是 raw source 层，作为权威来源保留，不在高层索引中直接展开。
- `wiki/SkillHub/categories/*` 和 `wiki/SkillHub/skills/*` 是 wiki 层，承载蒸馏后的中文说明与导航。
- 分层索引让 Obsidian 图谱更清晰，也避免总索引和分类页混入过多原始来源边。

## 维护检查

更新 SkillHub wiki 后，应检查：

- 若某个目录下存在 `index.md`，并且该目录或其子目录内容发生新增、删除、重命名、分类调整或导航相关改动，必须检查该 `index.md` 是否需要同步更新；如本次操作产生项目文件修改，应在日志中说明已检查及是否更新。
- `index.md` 不直接链接 `wiki/SkillHub/skills/*`。
- `index.md` 不直接链接 `raw/SkillHub/*`。
- `categories/*.md` 不直接链接 `raw/SkillHub/*`。
- `categories/*.md` 的内部 skill wikilink 必须使用短链接 `[[skill-slug]]`，并且该短链接在当前 vault 中必须唯一解析到 `wiki/SkillHub/skills/skill-slug.md`。
- `skills/*.md` 不应包含指向 `wiki/SkillHub/categories/*` 的 wikilink，避免产生 skill 到分类页的反向连接。
- `skills/*.md` 中的原始来源链接必须指向实际存在的 `raw/SkillHub/**/SKILL.md`。
- 所有 Obsidian wikilink 都应能解析到已存在的 wiki 页面，示例或占位符链接应写成代码文本，避免产生虚假图谱节点。

## Agent 操作日志准则

项目根目录必须保留 `log/` 文件夹，用于记录 agent 对项目文件产生修改的操作。

只有当 agent 修改了项目文件时，才需要在 `log/YYYY/MM/DD/` 下写入 Markdown 日志。单纯查询、阅读、解释、检查但未修改项目文件时，不需要新增日志。同一自然小时内的多次项目文件修改应写入同一个日志文档；若该小时已有日志文件，则在原文件中追加新的操作记录，不要另建新文件。日志路径和文件名建议使用：

```text
log/YYYY/MM/DD/HH00-简短主题.md
```

其中 `HH00` 表示该小时的整点时间，例如 `1900-agent-rules.md`。跨小时后如再次修改项目文件，再创建或复用新小时对应的日志文档。

日志必须记录：

- 操作时间：使用本地时区时间，格式建议为 `YYYY-MM-DD HH:mm:ss +08:00`。
- 操作模型：例如 `GPT-5 Codex`。
- 操作类型：从下列类型中选择一个或多个。
  - `Ingest`（导入）
  - `Query`（查询）
  - `Lint`（检查）
  - `Iteration`（迭代）
- 操作范围：列出涉及的主要目录或文件，并必须使用 Obsidian wikilink 或 Markdown 链接指向对应文件。
- 操作摘要：说明做了什么。
- 检查目的：说明本次检查或修改希望验证什么。
- 下次迭代方向：记录后续应该优先检查、修复或扩展的事项。

日志的目的：

- 让后续 agent 能快速理解上一次操作的上下文。
- 让检查后可以方便确认下次迭代方向。
- 让 wiki 生成、整理、校验和维护过程可追踪。

每次修改项目文件后，最终回复用户前应确认本次操作已经写入 `log/YYYY/MM/DD/`。

### 日志 scope 链接规则

日志中的 `scope` 必须可点击，不能只写裸路径。推荐写法：

```yaml
scope:
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/content-ingest|内容采集与导入]]"
  - "[[agent|Agent 行为准则]]"
```

当目标不是 Obsidian Markdown 页面，或需要指向非 wiki 资源时，使用 Markdown 链接：

```markdown
- [原始 Skill](../raw/SkillHub/obsidian-skills/skills/defuddle/SKILL.md)
```
