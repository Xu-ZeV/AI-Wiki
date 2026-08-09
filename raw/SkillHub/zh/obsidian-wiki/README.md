# Obsidian Wiki

[![询问 DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/Ar9av/obsidian-wiki)

<p align="center">
  <img width="460" height="307" alt="obsidian-wiki" src="https://github.com/user-attachments/assets/37f5586f-67f8-4078-9dbc-28e277287cf2" />
</p>

知识管理系统的灵感来自 Andrej Karpathy 发布的关于维护 LLM 个人知识库的 [gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)：“LLM Wiki”模式。

您不必一遍又一遍地向 LLM询问相同的问题（或每次都进行 RAG），而是将知识一次编译到互连的 Markdown 文件中并保持最新。在这种情况下，Obsidian 是查看者，LLM 是维护者。

我们采用了这一点并围绕它构建了一个框架。整个事情是一组 Markdown 技能文件，任何 AI 编码代理（Claude Code、Cursor、Windsurf、Pi，无论您使用什么）都可以读取和执行。你将它指向你的 Obsidian vault并告诉它做什么。

## 快速入门

### 通过 Skills CLI 安装（推荐）

```bash
npx skills add Ar9av/obsidian-wiki
```

这会将所有 wiki 技能安装到您当前的代理中（Claude Code、Cursor、Codex 等）。然后打开你的代理并说**“设置我的维基”**。

浏览完整技能列表：[skills.sh/ar9av/obsidian-wiki](https://skills.sh/ar9av/obsidian-wiki)。

### 通过 git 克隆安装

```bash
git clone https://github.com/Ar9av/obsidian-wiki.git
cd obsidian-wiki
bash setup.sh
```

`setup.sh` 询问您的vault路径，将配置写入 `~/.obsidian-wiki/config`，将技能符号链接到所有代理中，并全局安装 `wiki-update`，以便您可以从任何项目使用它。

`OBSIDIAN_VAULT_PATH` 是您希望 wiki 文档所在的任何目录。它可以是新的空文件夹或现有的Obsidian vault。 Obsidian 将直接从中读取。

在您的代理中打开项目并说 **“设置我的 wiki”**。就是这样。

## 代理兼容性

可与**任何可以读取文件的 AI 编码代理**配合使用 - Claude Code、Cursor、Windsurf、Pi、Codex、Gemini CLI、Kiro 等。 `setup.sh` 自动处理每一项的技能发现。

<details>
<summary><b>支持的代理和手动设置说明</b></summary>

|代理|引导程序|技能目录 |斜线命令 |
|---|---|---|---|
| **[克劳德代码](https://claude.ai/code)** | `CLAUDE.md` | `.claude/skills/` + `~/.claude/skills/` | ✅ `/wiki-ingest`、`/wiki-status` 等 |
| **[光标](https://cursor.com)** | `.cursor/rules/obsidian-wiki.mdc` | `.cursor/skills/` | ✅ `/wiki-ingest`、`/wiki-status` 等 |
| **[风帆](https://windsurf.com)** | `.windsurf/rules/obsidian-wiki.md` | `.windsurf/skills/` | ✅ 通过级联 |
| **[法典 (OpenAI)](https://openai.com/codex)** | `AGENTS.md` | `~/.codex/skills/` | `$wiki-ingest`（法典使用 `$`）|
| **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** | `GEMINI.md` | `~/.gemini/skills/` | ✅ `/wiki-ingest`、`/wiki-query` 等 |
| **[谷歌反重力](https://antigravity.google)** | `.agent/rules/` + `.agent/workflows/` | `.agents/skills/` | ✅ 通过工作流程注册表 |
| **[Kiro IDE/CLI](https://kiro.dev)** | `.kiro/steering/obsidian-wiki.md` | `.kiro/skills/` + `~/.kiro/skills/` | ✅ `/wiki-ingest`、`/wiki-status` 等 |
| **[爱马仕](https://hermes-agent.nousresearch.com)** | `.hermes.md` | `~/.hermes/skills/` | ✅ `/wiki-history-ingest hermes`等|
| **[OpenClaw](https://openclaw.ai)** | `AGENTS.md` | `~/.openclaw/skills/` + `~/.agents/skills/` | ✅ `/wiki-ingest`、`/wiki-history-ingest openclaw` 等 |
| **[开放代码](https://opencode.ai)** | `AGENTS.md` | `~/.agents/skills/` | ✅ `/wiki-ingest`、`/wiki-query` 等 |
| **[助手](https://aider.chat)** | `AGENTS.md` | `~/.agents/skills/` |描述聊天意图 |
| **[工厂机器人](https://factory.ai)** | `AGENTS.md` | `~/.agents/skills/` | ✅ `/wiki-ingest`、`/wiki-query` 等 |
| **[Trae](https://trae.ai)** / **Trae CN** | `AGENTS.md` | `~/.trae/skills/` / `~/.trae-cn/skills/` | ✅ 通过代理工具 |
| **GitHub Copilot（VS Code）** | `.github/copilot-instructions.md` | — |描述聊天意图 |
| **GitHub Copilot (CLI)** | — | `~/.copilot/skills/` | ✅ `/wiki-ingest`、`/wiki-query` 等 |
| **[千码](https://kilo.ai/)** | `AGENTS.md` / `CLAUDE.md` | `.agents/skills/` + `.claude/skills/` | ✅ `/wiki-ingest`、`/wiki-status` 等 |
| **[Pi](https://pi.dev)** | `AGENTS.md` | `.pi/skills/` + `~/.pi/agent/skills/` | ✅ `/wiki-ingest`、`/wiki-history-ingest pi` 等 |

> 每个特工都有自己的发现技能的惯例。 `setup.sh` 将规范的 `.skills/` 目录符号链接到每个代理的预期位置。您编写一次技能，每个特工都可以使用它们。

### 手动设置（如果您喜欢 `setup.sh`）

<details>
<summary>克劳德代码</summary>

技能是从 `.claude/skills/` 自动发现的。运行 `setup.sh` 或将 `.skills/*` 复制到 `.claude/skills/`。存储库根目录中的 `CLAUDE.md` 文件会自动加载为项目上下文。

```bash
cd /path/to/obsidian-wiki && claude "set up my wiki"
```
</details>

<details>
<summary>光标</summary>

技能是从 `.cursor/skills/` 自动发现的。 `.cursor/rules/obsidian-wiki.mdc` 文件提供始终在线的上下文。运行 `setup.sh` 或将 `.skills/*` 复制到 `.cursor/skills/`。然后在聊天中输入 `/wiki-setup`。
</details>

<details>
<summary>风帆</summary>

Cascade 从 `.windsurf/rules/` 读取规则，从 `.windsurf/skills/` 读取技能。运行 `setup.sh` 或将 `.skills/*` 复制到 `.windsurf/skills/`。然后告诉 Cascade：“设置我的 wiki”。
</details>

<details>
<summary>Codex</summary>

读取 `AGENTS.md` 以了解项目上下文。 `setup.sh` 将全局技能安装到 `~/.codex/skills/`。运行 `setup.sh` 或手动将 `.skills/*` 符号链接到 `~/.codex/skills/`。

```bash
cd /path/to/obsidian-wiki && codex "set up my wiki"
```
</details>

<details>
<summary>双子座 CLI</summary>

阅读 `GEMINI.md` 并从 `~/.gemini/skills/` 中发现全球技能。运行 `setup.sh` 或手动将 `.skills/*` 符号链接到 `~/.gemini/skills/`。

```bash
cd /path/to/obsidian-wiki && gemini "set up my wiki"
```
</details>

<details>
<summary>谷歌反重力</summary>

通过 `.agent/rules/` + `.agent/workflows/` 始终开启。 `setup.sh` 将文件和符号链接技能Teleport到 `.agents/skills/` 中。传统的 `~/.gemini/antigravity/skills/` 路径也是有线的。
</details>

<details>
<summary>Kiro IDE/CLI</summary>

通过 `.kiro/steering/*.md` 和 `inclusion: always` 始终开启。 `setup.sh` 将 `.skills/*` 符号链接到 `.kiro/skills/` 和 `~/.kiro/skills/`。使用 `/wiki-ingest`、`/wiki-query` 等调用
</details>

<details>
<summary>OpenCode / 助手 / 工厂机器人 / Trae</summary>

全部读取存储库根目录中的 `AGENTS.md` 。 `setup.sh` 将技能符号链接到 `~/.agents/skills/`（共享发现路径）中。 Trae 还获得 `~/.trae/skills/` 和 `~/.trae-cn/skills/`。
</details>

<details>
<summary>爱马仕</summary>

首先读取 `.hermes.md`，然后回退到 `AGENTS.md`。从`~/.hermes/skills/`发现的技能。运行 `setup.sh` 或手动符号链接 `.skills/*` 。

```bash
cd /path/to/obsidian-wiki && hermes "set up my wiki"
# Mine Hermes history into the wiki:
/wiki-history-ingest hermes
```
</details>

<details>
<summary>OpenClaw</summary>

读取 `AGENTS.md`（优先级 10）。发现 `~/.openclaw/skills/` 和 `~/.agents/skills/` 的技能。技能自动注册为斜杠命令。

```bash
cd /path/to/obsidian-wiki && openclaw "set up my wiki"
# Mine OpenClaw history:
/wiki-history-ingest openclaw
```
</details>

<details>
<summary>GitHub Copilot</summary>

**VS Code 聊天：** 读取为 `.github/copilot-instructions.md`。在 Copilot Chat 中说“设置我的 wiki”。

**CLI:** 从 `~/.copilot/skills/` 发现技能。运行 `setup.sh` 或手动符号链接 `.skills/*` 。
</details>

<details>
<summary>Pi</summary>

读取为 `AGENTS.md`（从 cwd 向上走）。发现 `.pi/skills/`、`.agents/skills/` 和 `~/.pi/agent/skills/` 的技能。运行 `setup.sh` 或手动将 `.skills/*` 符号链接到 `~/.pi/agent/skills/`。

```bash
cd /path/to/obsidian-wiki && pi "set up my wiki"
# Mine Pi session history:
/wiki-history-ingest pi
```
</details>

</details>

## 它是如何工作的

每次摄取都会经历四个阶段：

**1.摄取** — 代理直接读取您的源材料。它可以处理您扔给它的任何内容：Markdown 文件、PDF（带有页面范围）、JSONL 对话导出、纯文本日志、聊天导出、会议记录和图像（屏幕截图、白板照片、图表 - 需要支持视觉的模型）。无需预处理步骤，无需运行管道。代理读取文件的方式与读取代码的方式相同。

**2.提取**——代理从原始来源中提取概念、实体、声明、关系和开放问题。关于调试 React hook 的对话会产生“陈旧的闭包”模式。一篇研究论文提出了关键思想及其注意事项。工作日志产生决策及其理由。噪音被降低，信号被保留。在写入时，每个页面的 frontmatter 中还会有一个 1-2 句话 `summary:` — 稍后的查询使用它来预览页面而无需打开它们。

**3.解决** — 新知识将与 wiki 中已有的知识合并。如果概念页面存在，代理会对其进行更新——合并新信息、指出矛盾、加强交叉引用。如果它确实是新的，则会创建一个页面。没有什么是重复的。来源在 Frontmatter 中进行追踪，因此每项主张都有可追溯性。

**4.架构** — wiki 架构不是预先固定的。它从您的来源中产生，并随着您添加更多内容而演变。代理保持连贯性：类别保持一致，维基链接指向真实页面，索引反映实际存在的内容。当您添加新领域（新项目、新研究领域）时，模式会扩展以适应它，而不会破坏现有的内容。

`.manifest.json` 跟踪已摄取的每个源 - 路径、时间戳、它生成的 wiki 页面。在下一次摄取时，代理会计算增量并仅处理新的或更改的内容。


## 可视化

通过全局图表视图可视化整个库中的每个注释和链接。 
- **功能区图标**：单击左侧功能区上的“打开图形视图”图标（看起来像连接的网络）。
- **命令面板**：按 Ctrl + P (Windows/Linux) 或 Cmd + P (Mac)，键入“打开图形视图”，然后按 Enter。

<img width="1632" height="963" alt="obsidian-wiki" src="https://github.com/user-attachments/assets/f2980840-4b5b-438a-8264-5ad1de42f483" />

### 对图表进行颜色编码

说 **“为我的图表着色”**、**“按标签着色代码”**、**“按类别着色”** 或 **“突出显示图表中的可见性”**，`graph-colorize` 技能会重写 `<vault>/.obsidian/graph.json`，因此 Obsidian 按标签、文件夹或可见性对节点进行着色。它会扫描您的实际词汇，选择色盲友好的调色板，首先备份现有的 `graph.json`，并且仅触及 `colorGroups` 字段 - 您的缩放、物理和滤镜首选项保持不变。重新加载 Obsidian (Cmd/Ctrl+R) 以查看更改。

模式：`by-tag`（默认 — 前 10 个标签）、`by-category`（七个vault文件夹）、`by-visibility`（突出显示 `visibility/pii` 和 `visibility/internal`）、`combined`（可见性 + 标签）或`custom`（用户提供的映射）。

## 我们在 Karpathy 模式之上添加的内容

- **增量跟踪。** 清单跟踪已摄取的每个源文件：路径、时间戳、它生成的 wiki 页面。当您稍后返回时，它会计算增量并仅处理新的或更改的内容。您不必每次都重新摄取整个文档库。

- **基于项目的组织。** 如果知识是特定于项目的，则在项目下归档；如果不是，则在全球范围内归档。两者都与维基链接交叉引用。如果您正在开发 10 个不同的代码库，则每个代码库都会在库中拥有自己的空间。

- **存档和重建。** 当 wiki 偏离您的来源太远时，您可以存档整个内容（带时间戳的快照，不会丢失任何内容）并从头开始重建。或者恢复任何以前的存档。

- **多代理摄取。** 文档、PDF、Claude 代码历史记录 (`~/.claude`)、Codex 会话 (`~/.codex/`)、Hermes 记忆和会话 (`~/.hermes/`)、OpenClaw MEMORY.md 和会话 (`~/.openclaw/`)、Pi 会话(`~/.pi/agent/sessions/`)、Windsurf 数据 (`~/.windsurf`)、ChatGPT 导出、Slack 日志、会议记录、原始文本。有针对 Claude、Codex、Hermes、OpenClaw 和 Pi 历史记录的专用技能，以及用于任意文本导出的包罗万象的摄取技能。

- **跨代理定向搜索。** `/wiki-claude`、`/wiki-codex`、`/wiki-hermes`、`/wiki-openclaw`、`/wiki-copilot`、`/wiki-pi` — 来自特定代理原始历史记录的查询驱动提取。在 Claude Code 中说 `/wiki-codex "rust ownership"` ，它会找到有关该主题的 Codex 会话，提取相关的对话 blob，将它们提炼到 wiki 页面，并返回您可以立即使用的综合答案。与批量摄取不同：这是主题优先，而不是会话优先。每个代理都有自己的提取策略（Codex 推出事件、Claude JSONL 轮次、OpenClaw 的预合成 `MEMORY.md`、Pi 树结构 JSONL 会话等）。与 `/memory-bridge diff` 配对，了解每个工具对某个主题的独特贡献。

- **审核和 lint。** 查找孤立页面、损坏的维基链接、过时的内容、矛盾、缺失的 frontmatter。查看仪表板，了解已摄取的内容与待处理的内容。

- **自动交叉链接。** 摄取新页面后，交叉链接器会扫描库中是否有未链接的提及，并将它们与 `[[wikilinks]]` 编织到知识图中。不再有孤立页面。

- **标签分类。** 存储在 `_meta/taxonomy.md` 中的规范标签的受控词汇表，具有审核和规范整个vault中的标签的技能。

- **出处跟踪。** wiki 页面上的每个声明都被标记为：提取（默认）、`^[inferred]`（LLM 合成）或 `^[ambiguous]`（来源不同意）。前面的 `provenance:` 块总结了每页的混合情况，而 `wiki-lint` 则标记了主要是猜测的页面。您始终可以从您的 wiki 猜测的内容中得知其实际了解的内容。

- **多模式来源。** 屏幕截图、白板照片、幻灯片捕获和图表以与文本相同的方式摄取 - 代理逐字转录任何可见文本，并将解释的内容标记为推断的内容。需要具有视觉能力的模型。

- **Wiki 见解。** 除了增量跟踪之外，`wiki-status` 还可以分析您的vault本身的形状：顶级中心、桥页（删除将分割图表的节点）、标签簇内聚力分数、得分令人惊讶的连接、自上次运行以来的图表增量，以及 wiki 结构独特定位来回答的建议问题。输出转到 `_insights.md`。

- **图形导出。** `wiki-export` 将 Vault 的 wikilink 图形转换为 `graph.json`（可查询）、`graph.graphml`（Gephi/yEd）、`cypher.txt`（Neo4j）和独立的 `graph.html` 交互式浏览器可视化 - 无需服务器。

- **分层检索。** `wiki-query` 首先读取标题、标签和页面摘要，仅在廉价通行证无法应答时才打开页面正文。说“快速回答”或“仅扫描”以强制使用仅索引模式。当您的vault从 20 页增加到 2000 页时，查询成本大致保持不变。

- **QMD 语义搜索（可选）。** [QMD](https://github.com/tobi/qmd) 为您的 wiki 和源文档编制索引以进行语义搜索。当 `QMD_WIKI_COLLECTION` 在 `.env` 中设置时，`wiki-query` 在回退到 Grep 之前对集合运行 lex+vec 传递 - 启用精确字符串搜索错过的概念级匹配。设置 `QMD_PAPERS_COLLECTION` 时，`wiki-ingest` 会在编写新页面、显示相关工作、检测矛盾并决定是否创建或合并之前查询索引源。可以通过 MCP 或本地 CLI 使用 QMD。如果没有 QMD，这两种技能都会退回到 Grep/Glob 并保持完整功能。

- **`_raw/` 暂存目录。** 将粗略笔记、剪贴板粘贴或快速捕获放入vault内的 `_raw/` 中。下一个 `wiki-ingest` 运行会将它们提升到正确的 wiki 页面并删除原始页面。通过 `.env` 中的 `OBSIDIAN_RAW_DIR` 配置（默认为 `_raw`）。

## 可选：QMD 语义搜索

默认情况下，`wiki-ingest` 和 `wiki-query` 使用 `Grep`/`Glob` 进行搜索 - 功能齐全，无需额外设置。如果您的vault变大或者您希望跨源进行概念级匹配，您可以通过 MCP 或让代理调用本地 `qmd` CLI 插入 [QMD](https://github.com/tobi/qmd)。

**设置：**

1. 安装 QMD。如果您需要 MCP 模式，请将其添加到您的 MCP 配置中（有关说明，请参阅 QMD 存储库）。
2. 为您的 wiki 和/或源文档建立索引：
   ```bash
   qmd index --name wiki /path/to/your/vault
   qmd index --name papers /path/to/your/sources
   ```
3. 在 `.env` 中设置集合名称和传输：
   ```env
   QMD_WIKI_COLLECTION=wiki       # used by wiki-query
   QMD_PAPERS_COLLECTION=papers   # used by wiki-ingest (source discovery)
   QMD_TRANSPORT=mcp              # mcp | cli
   QMD_CLI_SEARCH_MODE=quality    # quality | balanced | fast
   ```

`QMD_TRANSPORT=mcp` 保留原始行为并使用代理配置的 QMD MCP 服务器。 `QMD_TRANSPORT=cli` 直接运行本地`qmd`命令。 CLI 模式默认为 `quality`，它使用 `qmd query` 并重新排名以获得最佳相关性。如果 CPU 速度太慢，请将 `QMD_CLI_SEARCH_MODE=balanced` 设置为使用 `qmd query --no-rerank`，或设置 `fast` 以获得更轻量级的语义传递。

**启用 QMD 后有何变化：**

- **`wiki-query`** 在回退到 Grep 之前针对您的 wiki 集合运行语义传递 (lex+vec)。即使确切的术语不匹配，也能查找概念上相关的页面。
- **`wiki-ingest`** 在编写新页面之前查询您的论文集 - 显示相关来源，发现矛盾，并决定是否创建新页面或合并到现有页面。

两种技能都会优雅地降级：如果未设置 `QMD_WIKI_COLLECTION` / `QMD_PAPERS_COLLECTION`，它们会默默地跳过 QMD 步骤并使用 Grep 代替。

### `_raw/` 暂存目录

`_raw/` 是您vault内的一个暂存区域，用于存储未处理的捕获内容 - 粗略笔记、剪贴板粘贴、快速语音备忘录记录。将文件拖放到那里，下一次运行 `wiki-ingest` 会将它们提升到正确的 wiki 页面并删除原始文件。

该目录由 `wiki-setup` 自动创建。该路径可通过 `.env` 中的 `OBSIDIAN_RAW_DIR` 进行配置（默认为 `_raw`）。

---

## 技能

一切都在 `.skills/` 中。每个技能都是一个 Markdown 文件，代理在触发时读取：

|技能|它有什么作用 |斜线命令|
| ----------------------- | ------------------------------------------------- | ------------------------ |
| `wiki-setup` |初始化库结构 | `/wiki-setup` |
| `wiki-ingest` |将文档提取到 wiki 页面 | `/wiki-ingest` |
| `wiki-history-ingest` |统一历史路由器（`claude`、`codex`、`hermes`、`pi`）| `/wiki-history-ingest <claude|codex|hermes|pi>` |
| `claude-history-ingest` |从 Claude 代码和桌面挖掘您的 `~/.claude` 对话和记忆 | `/claude-history-ingest` |
| `codex-history-ingest` |挖掘您的 `~/.codex` 会话和推出日志 | `/codex-history-ingest` |
| `hermes-history-ingest` |挖掘您的 `~/.hermes` 记忆和会话 | `/hermes-history-ingest` |
| `openclaw-history-ingest` |挖掘您的 `~/.openclaw` MEMORY.md 和会话 | `/openclaw-history-ingest` |
| `copilot-history-ingest` |挖掘您的 `~/.copilot` CLI 会话历史记录 | `/copilot-history-ingest` |
| `pi-history-ingest` |挖掘您的 `~/.pi/agent/sessions` JSONL 历史记录 | `/pi-history-ingest` |
| `data-ingest` |摄取任何文本 — 聊天导出、日志、文字记录 | `/data-ingest` |
| `ingest-url` |直接获取 URL 并将其引入 wiki | `/ingest-url <url>` |
| `obsidian-wiki-ingest` |用于 wiki 摄取的项目范围自动化包装器 | `/obsidian-wiki-ingest` |
| `wiki-status` |显示已摄取的内容、待处理的内容、增量 | `/wiki-status` |
| `wiki-rebuild` |存档、从头开始重建或恢复 | `/wiki-rebuild` |
| `wiki-query` |回答wiki的问题 | `/wiki-query` |
| `wiki-lint` |查找损坏的链接、孤立的链接、矛盾的链接 | `/wiki-lint` |
| `cross-linker` |自动发现并插入缺失的维基链接 | `/cross-linker` |
| `tag-taxonomy` |跨页面强制执行一致的标签词汇 | `/tag-taxonomy` |
| `llm-wiki` |核心模式及架构参考| `/llm-wiki` |
| `wiki-update` |将当前项目的知识同步到库中 | `/wiki-update` |
| `wiki-export` |将库图导出为 JSON、GraphML、Neo4j、HTML | `/wiki-export` |
| `wiki-capture` |将当前对话另存为 wiki 笔记 | `/wiki-capture` |
| `wiki-research` |自主多轮网络研究，自行提交| `/wiki-research [topic]` |
| `wiki-dashboard` |创建动态 Obsidian Bases 仪表板视图 | `/wiki-dashboard` |
| `wiki-synthesize` |发现并填补跨概念的综合空白| `/wiki-synthesize` |
| `wiki-agent` |从特定代理的历史记录中进行查询驱动的摄取 | `/wiki-claude [topic]`、`/wiki-codex [topic]`等|
| `memory-bridge` |浏览并比较由 AI 工具编写的知识 | `/memory-bridge` |
| `daily-update` |日常维护周期——新鲜度、索引、热缓存 | `/daily-update` |
| `impl-validator` |根据既定目标验证实施情况 | `/impl-validator` |
| `graph-colorize` |按标签/类别/可见性对Obsidian图进行颜色编码 | `/graph-colorize` |
| `skill-creator` |创造新技能 | `/skill-creator` |

> **注意：** 斜线命令 (`/skill-name`) 在 Claude Code、Cursor 和 Windsurf 中工作。在其他代理中，只需描述您想要什么，代理就会找到合适的技能。

### 推荐：Kepano 的Obsidian技能

我们处理知识管理工作流程——摄取、查询、lint、重建。为了掌握Obsidian格式，我们建议与此框架一起安装 [**kepano/obsidian-skills**](https://github.com/kepano/obsidian-skills)。这些是可选的，但可以提高 wiki 输出的质量：

|技能|添加了什么 |
|---|---|
| `obsidian-markdown` |教代理正确的Obsidian风格的语法 - 维基链接、标注、嵌入、属性 |
| `obsidian-bases` |创建和编辑 `.base` 文件（类似于数据库的笔记视图）|
| `json-canvas` |创建和编辑 `.canvas` 文件（视觉思维导图、流程图）|
| `obsidian-cli` |通过 CLI 与正在运行的 Obsidian 实例交互（搜索、创建、管理注释）|
| `defuddle` |从网页中提取干净的Markdown - 比原始获取噪音更少，在摄取过程中节省token |

两个项目都使用相同的[agent 技能规范](https://agentskills.io/specification)，因此它们共存于同一`.skills/`目录中，没有冲突。

**安装：**

```bash
npx skills add kepano/obsidian-skills
```

安装后，您的代理将自动获取新技能以及现有的 wiki 技能。

## 项目结构

```
obsidian-wiki/
├── .skills/                          # ← Canonical skill definitions (source of truth)
│   ├── wiki-setup/SKILL.md
│   ├── wiki-ingest/SKILL.md
│   ├── wiki-history-ingest/SKILL.md
│   ├── claude-history-ingest/SKILL.md
│   ├── codex-history-ingest/SKILL.md
│   ├── hermes-history-ingest/SKILL.md
│   ├── openclaw-history-ingest/SKILL.md
│   ├── pi-history-ingest/SKILL.md
│   ├── data-ingest/SKILL.md
│   ├── wiki-status/SKILL.md
│   ├── wiki-rebuild/SKILL.md
│   ├── wiki-query/SKILL.md
│   ├── wiki-lint/SKILL.md
│   ├── cross-linker/SKILL.md
│   ├── tag-taxonomy/SKILL.md
│   ├── wiki-update/SKILL.md
│   ├── llm-wiki/SKILL.md
│   ├── wiki-export/SKILL.md
│   └── skill-creator/SKILL.md
│
├── CLAUDE.md                            # Bootstrap → Claude Code / Kilocode (→ AGENTS.md)
├── GEMINI.md                            # Bootstrap → Gemini CLI (→ AGENTS.md)
├── AGENTS.md                            # Bootstrap → Codex, OpenCode, Aider, Droid, Trae, Hermes, OpenClaw, Kilocode
├── .hermes.md                           # Bootstrap → Hermes (symlink → AGENTS.md)
├── .cursor/rules/obsidian-wiki.mdc      # Always-on → Cursor (alwaysApply: true)
├── .windsurf/rules/obsidian-wiki.md     # Always-on → Windsurf
├── .kiro/steering/obsidian-wiki.md      # Always-on → Kiro (inclusion: always)
├── .agent/rules/obsidian-wiki.md        # Always-on → Google Antigravity
├── .agent/workflows/obsidian-wiki.md    # Slash-command registry → Google Antigravity
├── .github/copilot-instructions.md      # Always-on → GitHub Copilot (VS Code Chat)
│
├── .claude/skills/   → symlinks to .skills/*  (created by setup.sh)
├── .cursor/skills/   → symlinks to .skills/*  (created by setup.sh)
├── .windsurf/skills/ → symlinks to .skills/*  (created by setup.sh)
├── .agents/skills/   → symlinks to .skills/*  (created by setup.sh)
├── .pi/skills/       → symlinks to .skills/*  (created by setup.sh)
├── .kiro/skills/     → symlinks to .skills/*  (created by setup.sh)
│
├── ~/.claude/skills/              → portable skills (wiki-update, wiki-query)
├── ~/.gemini/skills/              → global symlinks — Gemini CLI
├── ~/.gemini/antigravity/skills/  → global symlinks — Antigravity (legacy path)
├── ~/.codex/skills/               → global symlinks — Codex
├── ~/.hermes/skills/              → global symlinks — Hermes
├── ~/.openclaw/skills/            → global symlinks — OpenClaw (managed)
├── ~/.copilot/skills/             → global symlinks — GitHub Copilot CLI
├── ~/.trae/skills/                → global symlinks — Trae
├── ~/.trae-cn/skills/             → global symlinks — Trae CN
├── ~/.kiro/skills/                → global symlinks — Kiro CLI
├── ~/.pi/agent/skills/            → global symlinks — Pi
├── ~/.agents/skills/              → global symlinks — OpenCode, Aider, Droid, generic
│
├── setup.sh                          # One-command agent setup
├── .env.example                      # Configuration template
├── README.md                         # You are here
└── SETUP.md                          # Detailed setup guide
```

## 从其他项目中使用

重点是，当您在不同的代码库中工作时，您的 wiki 应该保持最新状态。您不想每次都回到Obsidian Wiki存储库。因此，`setup.sh` 安装了两个适用于任何项目的全局技能：`wiki-update` 和 `wiki-query`。

当您运行 `bash setup.sh` 时，它会执行以下操作：

1. 使用您的vault路径和存储库位置将配置写入 `~/.obsidian-wiki/config`。这就是技能如何知道在哪里读取和写入的方式。
2. 将 `wiki-update` 和 `wiki-query` 符号链接到 `~/.claude/skills/`，以便它们在 Claude 代码中随处可用。
3. 将所有技能符号链接到每个代理的全局发现路径中：
   - `~/.gemini/skills/` — Gemini CLI（规范）
   - `~/.gemini/antigravity/skills/` — Google 反重力（旧版）
   - `~/.codex/skills/` — 法典
- `~/.hermes/skills/` — 爱马仕
   - `~/.openclaw/skills/` — OpenClaw（托管）
   - `~/.copilot/skills/` — GitHub Copilot CLI
   - `~/.trae/skills/` + `~/.trae-cn/skills/` — Trae / Trae CN
   - `~/.kiro/skills/` — Kiro CLI
   - `~/.pi/agent/skills/` — Pi
   - `~/.agents/skills/` — OpenCode、Aider、Factory Droid 和其他 AGENTS.md 感知代理

之后，您将参与某个项目，例如 `~/projects/my-cool-app`，与 Claude 或 Pi 一起工作。两个命令：

```bash
# You're working on some project
cd ~/projects/my-cool-app
claude

# Write to the wiki: distill what you've learned
> /wiki-update

# Read from the wiki: pull context about anything you've captured before
> /wiki-query what do I know about rate limiting?
```

`/wiki-update` 读取您的项目，找出值得保留的内容，并将其提炼到您的Obsidian vault中。架构决策、您发现的模式、关键概念、您评估的权衡。它不会复制代码或转储文件列表。它能提炼出你三个月后就会忘记的东西。下次您从同一个项目运行它时，它会检查自上次同步（通过 git log）以来发生的更改，并且仅处理增量。

`/wiki-query` 则相反。您正在从事某项工作，并且想了解您的 wiki 关于某个主题的内容。也许您两个月前在另一个项目中解决了类似的问题，并且答案已经在您的vault中。代理搜索 wiki，阅读相关页面，并为您提供带有引用的综合答案。

这两种技能都遵循与其他技能相同的卡帕斯模式。如果库中已存在概念页面，则会合并到其中。所有内容都与 `[[wikilinks]]` 交叉链接，在 `.manifest.json` 中跟踪并记录。

## 贡献

这还早。这些技能确实有效，但还有很大的空间可以让它们变得更智能——更好的交叉引用、更智能的重复数据删除、处理更大的vault、新的摄取源。如果您一直在考虑这个问题或者有一个可以成为一项技能的工作流程，欢迎提出 PR。

### 添加新技能

1、在`.skills/your-skill-name/`中创建文件夹
2.添加带有YAML frontmatter（`name`、`description`）和markdown指令的`SKILL.md`
3. 运行 `bash setup.sh` 以符号链接到所有代理目录
4. 通过说出与描述相符的内容与您的代理进行测试

有关编写有效技能的完整指南，请参阅 `.skills/skill-creator/SKILL.md`。
