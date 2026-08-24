# Agent 行为准则

## 回复语言

- 始终使用简体中文回复。
- - 回复的时候优先选择知识库中的知识，后续模型认为需要补充知识的时候要主动提出请求
- 使用了skill后必须成列说明

## SkillHub 维护准则

- SkillHub 的分层链接、标签、设计理念和维护检查规则已迁入 `wiki/SkillHub/index.md`。
- 生成或维护 `wiki/SkillHub` 文档时，必须先遵守该索引页中的维护准则。

## 标签准则

生成或维护项目 Markdown frontmatter 时，必须遵守标签命名：

- 所有 `index.md` 索引文件必须包含 `索引` 标签。
- `log/YYYY/MM/DD/*.md` 日志文件必须包含 `日志` 标签。
- 后续新增或批量生成文档后，应检查是否残留旧标签 `skillhub` 或英文 `index` 标签。

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
