# Obsidian Wiki — 代理上下文

用于构建和维护Obsidian知识库的 **基于技能的框架**。没有脚本或依赖项 - 一切都是您直接执行的 Markdown 指令。

## 配置

使用 `llm-wiki/SKILL.md` 中的配置解析协议解析配置：

1. **从 CWD 向上走** — 在当前目录中查找 `.env` 文件，然后查找每个父文件，直到 `$HOME`。在包含 `OBSIDIAN_VAULT_PATH` 的第一个 `.env` 处停止。
2. **全局配置** — 如果没有找到本地 `.env`，则读取 `~/.obsidian-wiki/config`。
3. **提示设置** — 如果两者都不存在，则告诉用户运行 `wiki-setup`。

解析后的配置设置为 `OBSIDIAN_VAULT_PATH`（wiki 所在的位置）。它还可以设置 `OBSIDIAN_WIKI_REPO`（克隆此存储库的位置）和其他可选变量。

**阅读配置后，请始终阅读 `$OBSIDIAN_VAULT_PATH/AGENTS.md`（如果存在）。**它包含特定于所有者的约定（领域词汇、摄取首选项、写作风格、项目范围），这些约定会覆盖所有技能的框架默认值。在会话期间应用它。

## vault结构

```
$OBSIDIAN_VAULT_PATH/
├── index.md                # Master index — every page listed, always kept current
├── log/                    # Project operation logs grouped as YYYY/MM/DD/*.md
├── hot.md                  # Session hot cache — ~500-word semantic snapshot of recent activity
├── .manifest.json          # Tracks every ingested source: path, timestamps, pages produced
├── _meta/
│   ├── taxonomy.md         # Controlled tag vocabulary
│   └── *.base              # Obsidian Bases dashboard definitions (wiki-dashboard skill)
├── _insights.md            # Graph analysis output (hubs, bridges, dead ends)
├── _raw/                   # Staging area — drop rough notes here, next ingest promotes them
├── concepts/               # Abstract ideas, patterns, mental models
├── entities/               # Concrete things — people, tools, libraries, companies
├── skills/                 # How-to knowledge, techniques, procedures
├── references/             # Factual lookups — specs, APIs, configs
├── synthesis/              # Cross-cutting analysis connecting multiple concepts
├── journal/                # Time-bound entries — daily logs, session notes
└── projects/
    └── <project-name>.md   # One page per project synced via wiki-update
```

每个 wiki 页面都有必需的 frontmatter：`title`、`category`、`tags`、`sources`、`created`、`updated`。页面通过内部链接连接 - 默认情况下为 `[[wikilinks]]`，或者在配置中设置 `OBSIDIAN_LINK_FORMAT=markdown` 时为标准 Markdown 链接。

## 技能路由

技能位于 `.skills/<name>/SKILL.md` 中。将用户的意图与正确的技能相匹配：

|用户说类似... |技能|
|---|---|
| “设置我的维基”/“初始化”| `wiki-setup` |
| “/wiki-history-ingest 克劳德”/“/wiki-history-ingest 法典”/“/wiki-history-ingest 爱马仕”/“/wiki-history-ingest pi”| `wiki-history-ingest` |
| “/ingest-url <url>”/“添加此 URL”/“获取此链接”/“保存此页面”| `ingest-url` |
| “摄取”/“将其添加到 wiki”/“处理这些文档”| `wiki-ingest` |
| “导入我的克劳德历史记录”/“挖掘我的对话”| `claude-history-ingest` |
| “导入我的 Codex 历史记录”/“挖掘我的 Codex 会话”| `codex-history-ingest` |
| “导入我的爱马仕历史”/“挖掘我的爱马仕记忆”/“摄取~/.hermes”| `hermes-history-ingest` |
| “导入我的 OpenClaw 历史记录”/“挖掘我的 OpenClaw 会话”/“摄取 ~/.openclaw”| `openclaw-history-ingest` |
| “导入我的 Copilot 历史记录”/“挖掘我的 Copilot 会话”/“摄取 ~/.copilot”| `copilot-history-ingest` |
| “导入我的 Pi 历史记录”/“挖掘我的 Pi 会话”/“摄取 ~/.pi”| `pi-history-ingest` |
| “处理此导出”/“摄取此数据”/日志、成绩单 | `data-ingest` |
| “摄取此Obsidian wiki”/“摄取Obsidian wiki 项目”| `obsidian-wiki-ingest` |
| “状态是什么”/“摄入了什么”/“显示增量”| `wiki-status` |
| “维基洞察”/“中心”/“维基结构”| `wiki-status`（洞察模式）|
| “我对 X 了解多少”/“查找有关 Y 的信息”/任何问题 | `wiki-query` |
| “审核”/“lint”/“查找损坏的链接”/“wiki 健康”| `wiki-lint` |
| “删除我的 wiki”/“查找重复页面”/“合并重复项”/“身份解析”/“合并我的 wiki”| `wiki-dedup` |
| “重建”/“重新开始”/“存档”/“恢复”| `wiki-rebuild` |
| “链接我的页面”/“交叉引用”/“连接我的维基”| `cross-linker` |
| “修复我的标签”/“标准化标签”/“标签审核”| `tag-taxonomy` |
| “更新 wiki”/“同步到 wiki”/“将其保存到我的 wiki”| `wiki-update` |
| “导出维基”/“导出图表”/“graphml”/“neo4j”| `wiki-export` |
| “为我的图表着色”/“Obsidian颜色代码”/“按标签/类别/可见性着色”| `graph-colorize` |
| “保存此”/“/wiki-capture”/“捕获此”/“归档此对话”| `wiki-capture` |
| “/wiki-research [主题]”/“研究 X”/“查找有关 Y 的所有内容”| `wiki-research` |
| “创建仪表板”/“vault仪表板”/“将所有 X 显示为表格”/“动态视图”| `wiki-dashboard` |
| “综合我的维基”/“寻找联系”/“什么概念不断出现”/“/wiki-synthesize”| `wiki-synthesize` |
| “创造一项新技能” | `skill-creator` |
| "/wiki-claude [主题]" / "/wiki-codex [主题]" / "/wiki-hermes [主题]" / "/wiki-openclaw [主题]" / "/wiki-copilot [主题]" / "/wiki-pi [主题]" | `wiki-agent` |
| “/memory-bridge”/“浏览 Codex 内存”/“Codex 对 X 了解什么”/“比较工具内存”/“跨工具内存”| `memory-bridge` |
| “/daily-update”/“早晨同步”/“刷新 wiki 索引”/“设置每日 cron”/“安装终端通知”| `daily-update` |
| “/impl-validator”/“检查此实现”/“验证您所做的事情”/“这是正确的吗？” | `impl-validator` |
| “/wiki-switch NAME”/“切换到我的工作 wiki”/“切换vault”/“更改 wiki”/“列出我的 wiki”/“显示我的vault”/“创建新的vault配置”| `wiki-switch` |
| “/wiki-digest”/“这周我学到了什么”/“每周摘要”/“知识总结”/“我的wiki有什么新内容”/“总结我最近的学习”/“每月回顾”| `wiki-digest` |

## 跨项目使用

主要用例：您正在从事其他一些项目，并且想要将知识同步到您的 wiki 中或对其进行查询。两种全局技能可以处理此问题 - `wiki-update` 和 `wiki-query`。他们可以在任何目录中工作。

### wiki-更新（写入wiki）

1.使用配置解析协议解析配置得到`OBSIDIAN_VAULT_PATH`
2. 扫描当前项目：README、源码结构、git log、包元数据
3. 提炼出值得记住的内容（架构决策、模式、权衡——而不是代码清单）
4.写入`$VAULT/projects/<project-name>.md`，根据需要交叉链接到概念/实体页面
5.更新`.manifest.json`、`index.md`以及`log/YYYY/MM/DD/*.md`下的带时间戳的条目

在重复运行时，它会检查 `.manifest.json` 中的 `last_commit_synced`，并仅通过 `git log <last_commit>..HEAD` 处理增量。

### wiki-query（从 wiki 读取）

1.使用配置解析协议解析配置得到`OBSIDIAN_VAULT_PATH`
2.首先扫描标题、标签和 `summary:` frontmatter 字段（便宜通过）
3.索引通无法应答时才打开页面正文
4. 返回带有 `[[wikilink]]` 引用的综合答案

## 可见性标签（可选）

页面可以带有 `visibility/` 标签来标记其预期覆盖范围。 **这完全是可选的** - 未标记的页面的行为与往常一样（随处可见）。该系统保持单一vault、单一事实来源。

|标签 |意义|
|---|---|
| *（无标签）* |与 `visibility/public` 相同 — 在所有模式下可见 |
| `visibility/public` |明确公开——在所有模式下可见 |
| `visibility/internal` |仅限团队 - 在过滤模式下查询时排除 |
| `visibility/pii` |敏感数据——在过滤模式下查询时被排除 |

**过滤模式**是选择加入的，由查询中的“仅限公开”、“面向用户的答案”、“无内部内容”或“用户将看到的内容”等短语触发。默认模式显示一切。

`visibility/` 标签是 **系统标签** - 它们不计入 5 个标签限制，并且与分类中的域/类型标签分开列出。

有关如何应用过滤器的信息，请参阅 `wiki-query` 和 `wiki-export` 技能。

## 核心原则

- **编译，不要检索。** wiki 是预编译的知识。更新现有页面 - 不要追加或重复。
- **跟踪一切。** 摄取后更新 `.manifest.json`，任何写入操作后更新 `index.md`、`log/YYYY/MM/DD/*.md` 和 `hot.md`。
- **与 `[[wikilinks]]` 连接。** 每个页面都应链接到相关页面。这就是它成为知识图而不是文件文件夹的原因。
- **Frontmatter 是必需的。** 每个 wiki 页面都需要：`title`、`category`、`tags`、`sources`、`created`、`updated`。
- **单一事实来源。** 可见性标签决定内容的呈现方式 - 它们不会复制或分离内容。
- **保持上下文温暖。** `hot.md` 是最近活动的约 500 字语义快照。每个写入技能都会更新它，以便下一个会话可以从上一个会话结束的地方继续，而无需爬行整个库。

## 架构参考

有关完整模式（三层架构、页面模板、项目组织），请阅读 `.skills/llm-wiki/SKILL.md`。
