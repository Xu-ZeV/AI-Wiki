与Obsidian一起使用的特工技能。

这些技能遵循 [agent 技能规范](https://agentskills.io/specification)，因此任何与技能兼容的代理都可以使用它们，包括 Claude Code 和 Codex CLI。

## 安装

### 市场

```
/plugin marketplace add kepano/obsidian-skills
/plugin install obsidian@obsidian-skills
```

### npx技能

```
npx skills add git@github.com:kepano/obsidian-skills.git
```

如果您更喜欢使用 https，而不是 ssh：

```
npx skills add https://github.com/kepano/obsidian-skills
```

### 手动

#### 克劳德·代码

将此存储库的内容添加到 ObsidianVault 根目录中的 `/.claude` 文件夹（或与 Claude Code 一起使用的任何文件夹）。请参阅[克劳德技能官方文档](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) 了解更多信息。

#### Codex CLI

将 `skills/` 目录复制到您的 Codex 技能路径（通常为 `~/.codex/skills`）。标准技能格式请参见【座席技能规范】(https://agentskills.io/specification)。

#### 开放代码

将整个存储库克隆到 OpenCode 技能目录 (`~/.opencode/skills/`)：

```sh
git clone https://github.com/kepano/obsidian-skills.git ~/.opencode/skills/obsidian-skills
```

不要仅复制内部 `skills/` 文件夹 - 克隆完整存储库，以便目录结构为 `~/.opencode/skills/obsidian-skills/skills/<skill-name>/SKILL.md`。

OpenCode 自动发现 `~/.opencode/skills/` 下的所有 `SKILL.md` 文件。无需更改 `opencode.json` 或任何配置文件。重新启动 OpenCode 后技能即可使用。

## 技能

|技能|描述 |
|-------|-------------|
| [ObsidianMarkdown](skills/obsidian-markdown) |使用 wiki 链接、嵌入、标注、属性和其他Obsidian特定语法创建和编辑 [Obsidian风味 Markdown](https://help.obsidian.md/obsidian-flavored-markdown) (`.md`) |
| [Obsidian基](skills/obsidian-bases) |使用视图、筛选器、公式和摘要创建和编辑 [Obsidian Bases](https://help.obsidian.md/bases/syntax) (`.base`) |
| [json-canvas](skills/json-canvas) |创建和编辑带有节点、边、组和连接的 [JSON Canvas](https://jsoncanvas.org/) 文件 (`.canvas`) |
| [Obsidian-cli](skills/obsidian-cli) |通过 [Obsidian CLI](https://help.obsidian.md/cli) 与 ObsidianVault 交互，包括插件和主题开发 |
| [解惑](skills/defuddle) |使用 [Defuddle](https://github.com/kepano/defuddle) 从网页中提取干净的Markdown，消除混乱以节省token |
