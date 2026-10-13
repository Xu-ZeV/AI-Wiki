---
title: metaswarm 框架专有 7 个 skill 的中文全译落盘，并把 agents/skills 归档迁入功能分类目录
tags:
  - 日志
date: 2026-10-10
time: 15:29:10
model: GPT-5 Codex
type:
  - Ingest
  - Iteration
  - Lint
scope:
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/multi-agent-orchestration|多Agent团队协作]]"
  - "[[wiki/SkillHub/categories/presentation-web-slides|演示文稿与网页幻灯片]]"
  - "[[wiki/SkillHub/categories/frontend-ui-design|高级前端 UI 设计与重构]]"
  - "[metaswarm 中文全译归档说明](../../../../raw/SkillHub/zh/metaswarm/README.md)"
  - "[7 篇逐段全译目录](../../../../raw/SkillHub/zh/metaswarm/skills)"
  - "[按功能分类后的 raw 归档根](../../../../raw/SkillHub/categories)"
---

# metaswarm 框架专有 7 个 skill 的中文全译落盘，并把 agents/skills 归档迁入功能分类目录

## 操作时间

2026-10-10 15:29:10 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Ingest
- Iteration
- Lint

## 操作摘要

用户指出：之前要求的不是「把 7 个 metaswarm 框架专有 skill 归纳进 wiki」，而是**把这 7 个已被删除的原件逐段全文翻译留存**；此前的产出只有 4–8 KB 的中文归纳稿，没有原件全文。本轮补齐全译，并顺手完成上一轮遗留的 `agents/skills` → 功能分类目录的引用同步。

### 1. 7 篇逐段全译落盘（Ingest）

- 上游原件在本仓库已于 2026-10-10 14:50 那轮按用户要求删除，且从未被 git 跟踪，不可恢复；英文的唯一来源是重新克隆上游仓库 `dsifry/metaswarm`（`main`，commit `33d39f7`），克隆到 `%TEMP%\metaswarm-src` 只作对照，不进入仓库。
- 按仓库 `zh/<仓库名>/skills/<slug>/SKILL.md` 惯例，把 7 个 slug 全译落盘到 `raw/SkillHub/zh/metaswarm/skills/<slug>/SKILL.md`：`start`、`setup`、`status`、`migrate`、`create-issue`、`pr-shepherd`、`handling-pr-comments`。
- 翻译约定：frontmatter 保留英文字段名（`name` / `description` / `auto_activate` / `triggers`），字段值译中文，`name` 保持英文 slug；正文标题、表格、说明全中文；**代码块内容一律保持英文原样**（bash / typescript / markdown 模板 / jq / JSON）；ASCII 流程图重绘中文标签、结构不变。

### 2. 全译与原件的结构一致性校验（Lint）

| slug | 标题数 | 代码围栏数 | 表格行数 | 原件字节 | 全译字节 | 一致 |
| --- | --- | --- | --- | --- | --- | --- |
| `start` | 104 | 56 | 32 | 34.7 KB | 33.1 KB | 是 |
| `setup` | 32 | 14 | 80 | 19.0 KB | 18.8 KB | 是 |
| `status` | 20 | 12 | 22 | 6.3 KB | 6.0 KB | 是 |
| `migrate` | 25 | 10 | 36 | 10.6 KB | 10.3 KB | 是 |
| `create-issue` | 57 | 34 | 4 | 11.5 KB | 10.6 KB | 是 |
| `pr-shepherd` | 49 | 40 | 19 | 20.4 KB | 18.7 KB | 是 |
| `handling-pr-comments` | 32 | 26 | 12 | 11.3 KB | 10.4 KB | 是 |

全译字节数为原件的 92%–99%（中文字符占 3 字节，但总字符数减少、代码块原样保留）。另抽查体量最小的 `status` 逐段对照，确认是逐段对译而非压缩归纳：11 个检查小节、输出格式模板、错误处理段落一一对应，仅英文散文转为中文。

### 3. 归档说明改为两层结构（Iteration）

- `raw/SkillHub/zh/metaswarm/README.md` 重写为「全译稿 `skills/<slug>/SKILL.md` / 归纳稿 `<slug>.md`」两层结构：清单表含全译稿与归纳稿两列，补充翻译约定、上游来源（重新克隆 `main` @ `33d39f7`）与 MIT 许可。
- 7 篇归纳稿的 frontmatter `source_note` 改为「本页为中文归纳稿；逐段全译见 `skills/<slug>/SKILL.md`」，正文 `> 原始文件：` 由纯文本改为指向同仓库全译稿的相对链接，不再指向已删路径。

### 4. `agents/skills` 归档迁入功能分类目录（Iteration）

按上一轮遗留事项，把 `raw/SkillHub/agents/skills/` 下 10 个 slug 迁入 `raw/SkillHub/categories/<category_slug>/<slug>/`，分类归属与 `wiki/SkillHub/skills/*.md` 的 `category_slug` 字段核对一致，空的 `raw/SkillHub/agents/` 已删除：

- `categories/multi-agent-orchestration/`：`brainstorming-extension`、`design-review-gate`、`external-tools`、`handoff`、`orchestrated-execution`、`plan-review-gate`、`visual-review`
- `categories/presentation-web-slides/`：`guizang-ppt-skill`、`html-ppt`
- `categories/frontend-ui-design/`：`huashu-design`

### 5. 引用同步（Iteration）

全仓把 `raw/SkillHub/agents/skills/<slug>/` 改为 `raw/SkillHub/categories/<分类>/<slug>/`，共 21 个文件、47 处：

- `wiki/SkillHub/skills/*.md` 10 页（frontmatter `source:` + `> 原始文件：` 链接）共 20 处。
- 项目内 Codex 可加载副本 `.agents/skills/**` 8 个文件共 23 处，含 `design-review-gate/guides/agent-coordination.md`、`external-tools/rubrics/external-tool-review-rubric.md`、`plan-review-gate/rubrics/plan-review-rubric-adversarial.md` 三处 rubric 引用，以及 7 个 `SKILL.md` 尾部的原文链接。
- 历史日志中 4 条可点击 Markdown 链接（`log/2026/08/09/2200-submodule-sync.md` 2 条、`log/2026/08/18/1100-html-ppt-skillhub.md` 1 条、本日 1400 日志 1 条）。
- `wiki/SkillHub/index.md` 维护准则：上游 `.agents/skills/` 布局的落盘路径改为 `raw/SkillHub/categories/<分类>/<slug>/`，并新增一条「上游框架专有 skill 的中文留存规则」——逐段全译存 `raw/SkillHub/zh/<仓库名>/skills/<slug>/SKILL.md`，压缩归纳存 `<slug>.md`，两者职责分开。

### 6. 未改动项（有意保留）

- 历史日志正文里描述「当时把 `.agents/skills/` 改名为 `agents/skills/`」这类叙述句与代码文本保留原样。它们是当时状态的时间点记录，改写会篡改史实；本轮的可点击 Markdown 链接已全部同步。
- `raw/SkillHub/zh/impeccable/reference/*.md`、`raw/SkillHub/impeccable/**`、`raw/SkillHub/obsidian-wiki/**`、`.gemini/**` 中的 `.agents/skills/` 是上游文档里的命令行示例或第三方约定路径，不是本仓库的归档路径，保持不动。
- `wiki/SkillHub/skills/*.md` 与 `wiki/SkillHub/categories/multi-agent-orchestration.md` 里的「加载路径：`.agents/skills/<slug>/SKILL.md`」指项目内可加载副本，仍然正确，保持代码文本形式。
- `raw/SkillHub/skills-lock.json` 的 `skillPath` 是上游仓库内路径，保持不动。

## 检查目的

- 验证「7 个已删 skill 是否真的留下了逐段全文的中文版本」，而不是只有归纳稿。
- 验证全译稿与原件的标题层级、代码块、表格结构无丢失。
- 验证 `agents/skills` → `categories/<分类>/` 的搬迁没有留下死链。

## 复核结果

- 7 篇全译与原件的标题数、代码围栏数、表格行数三项计数完全相等（仅 `start` 的 ASCII 图因英文折行合并差 1 行，内容未丢）。
- `raw/SkillHub/zh/metaswarm/` 内相对链接 7 条，0 条 BROKEN；无 `[[wikilink]]` 残留。
- `wiki/` + `log/` + `.agents/` 范围内 Markdown 相对链接扫描 361 条，12 条 BROKEN 全部位于 2026 年 5–6 月的旧日志（指向早已合并或改名的历史目录），与本次改动无关。
- `rg '\]\([^)]*raw/SkillHub/agents/'` 全仓零命中；`raw/SkillHub/agents/` 目录已不存在。
- 未调用 `~/.codex/skills` 下任何 skill。

## 下次迭代方向

- `raw/SkillHub/categories/` 与 `raw/SkillHub/zh/metaswarm/` 目前在 git 中仍是未跟踪状态（`??`），搬迁动作没有进入版本历史；建议尽快对 `raw/SkillHub` 做一次提交，避免再次出现「删除后无法从 git 恢复」的情况。
- 上游 `%TEMP%\metaswarm-src` 克隆保留到用户确认全译内容为止，用于复核；确认后可清理。
- 若后续还要留存其他上游框架专有 skill，沿用本轮确立的两层约定：全译稿进 `skills/<slug>/`，归纳稿留在同一仓库目录下的一级 `<slug>.md`。

## 追加：7 个可复用协作 skill 剥离上游命名，落盘为自有套件 `agent-team-*`

### 操作时间

2026-10-10 15:58:00 +08:00

### 操作摘要

用户反馈：`raw/SkillHub` 里看不到「多代理团队协作」的 skill，只看到一个 `zh/metaswarm`，并且明确要求**把 metaswarm 中对 Codex 原生子代理多模型协作有用的部分抽出来做成自有 skill，不沿用 metaswarm 的名称**。上一轮虽然已把协作内核重写为中文，但目录名、frontmatter `name`、wiki 页 slug 仍是上游旧 slug，`skills-lock.json` 也还登记着 `source: dsifry/metaswarm`，所以从命名到落盘位置都看不出「这是自己的套件」。本轮完成改名、搬迁、登记与顶层导航。

### 1. 建立自有命名体系

| 上游旧 slug | 新自有名 | 角色 |
| --- | --- | --- |
| `orchestrated-execution` | `agent-team-orchestration` | 主入口，四阶段执行闭环 |
| `brainstorming-extension` | `agent-team-brainstorm` | 头脑风暴 → 设计门禁桥接 |
| `plan-review-gate` | `agent-team-plan-gate` | 计划对抗审查门禁 |
| `design-review-gate` | `agent-team-design-gate` | 设计五角色评审门禁 |
| `visual-review` | `agent-team-visual-review` | Playwright 视觉核验（B 级独立工具） |
| `external-tools` | `agent-team-external-cli` | 跨模型委托与模型路由 |
| `handoff` | `agent-team-handoff` | 零上下文交接 |

### 2. 文件搬迁与改名

- 7 个英文上游原件：`raw/SkillHub/categories/multi-agent-orchestration/<旧 slug>/` → 移入 [上游英文原件归档](../../../../raw/SkillHub/zh/metaswarm/original-en)，仅作溯源，不参与导航与加载。
- 7 个中文自研版：从 `.agents/skills/<旧 slug>/` 复制到 [按功能分类的 raw 归档根](../../../../raw/SkillHub/categories/multi-agent-orchestration)，形成用户可见的 raw 落盘；项目内可加载副本同步改名为 `.agents/skills/agent-team-*/`。
- 7 个 wiki 详情页：`wiki/SkillHub/skills/<旧 slug>.md` → 改名为 `wiki/SkillHub/skills/agent-team-*.md`。
- `agent-team-external-cli` 的 H1 由裸 slug 改为「跨模型委托与模型路由（External CLI）」，与其余 6 个的中文标题风格统一。

### 3. 内容替换

- 7 个 skill（raw 与 `.agents` 两份）frontmatter `name` 全部改为 `agent-team-*`；`upstream_note` 统一为「由 AI-Wiki 从公开开源编排协议抽取重写」。
- 正文末尾的「原文出处」段落统一改为「血缘与许可」，指向 `raw/SkillHub/zh/metaswarm/original-en/<旧 slug>/`。
- 正文内的旧 slug 交叉引用、3 个 rubric 文件末尾的死链同步改写。
- wiki 7 页元信息块字段改为「skill 名称 / 上游英文标题 / 源文件 / 来源说明」，`agent-team-handoff.md` 的 `skill:` 字段修正。

### 4. 新建与更新

- **新建** [SkillHub 原始资料层导航](../../../../raw/SkillHub/README.md)：此前 `raw/SkillHub/` 顶层没有入口文件，打开只能看到零散目录，这正是用户「只看见 `zh/metaswarm`」的直接原因。新 README 把 7 个 `agent-team-*` 列在最前面，并给出目录结构与命名归属说明。
- **新建** [多代理套件说明书](../../../../raw/SkillHub/categories/multi-agent-orchestration/README.md)：角色表、典型流程、与 `.agents/skills/` 和 wiki 的关系、许可。
- **更新** [metaswarm 中文归档说明](../../../../raw/SkillHub/zh/metaswarm/README.md)：新增「上游英文原件归档」一节，说明 `original-en/` 与自有 skill 的对应关系，并区分「框架专有全译稿」与「可复用协作协议英文原件」两批资料。
- **更新** [多Agent团队协作分类页](../../../../wiki/SkillHub/categories/multi-agent-orchestration.md)：改为「AI-Wiki 自有套件」定位，新增「命名与归属」节。
- **更新** [SkillHub 中文索引](../../../../wiki/SkillHub/index.md)：分类行描述同步为自有套件表述。
- **改写** `raw/SkillHub/skills-lock.json`：7 条 `source: dsifry/metaswarm`、旧 slug 键名的登记项，替换为 7 条 `agent-team-*` 本地登记（`source: ai-wiki/agent-team`、`sourceType: local`、新 sha256）。条目总数仍为 10，JSON 解析正常，文件内不再出现上游仓库名。

### 检查目的

- 验证 7 个 skill 从目录名、frontmatter 到 wiki slug 是否全部脱离上游命名。
- 验证 `raw/SkillHub` 顶层是否有一眼可见的「多代理团队协作」入口。
- 验证搬迁后的相对链接是否仍然有效。

### 复核结果

- 新 skill 区（raw 分类目录、`.agents/skills/agent-team-*`、`wiki/SkillHub`）旧 slug 残留零命中。
- `metaswarm` 字符串仅保留在**血缘溯源路径**（`raw/SkillHub/zh/metaswarm/original-en/`）与归档说明中，skill 本体命名、frontmatter `name`、`skills-lock.json` 均已无上游名称。
- 7 个 skill 的 `name:` 字段在 raw 与 `.agents` 两处均为 `agent-team-*`。
- 相对链接校验覆盖 159 条，1 条 BROKEN：`raw/SkillHub/categories/frontend-ui-design/huashu-design/references/hero-animation-case-study.md` 指向上游未附带的 `../demos/hero-animation-v9.mp4`，属上游原件快照自带缺件，与本次改动无关，保持原样。

### 下次迭代方向

- `raw/SkillHub/categories/`、`raw/SkillHub/zh/metaswarm/`、`.agents/skills/agent-team-*`、`wiki/SkillHub/skills/agent-team-*.md` 在当前 git 中多为未跟踪状态（`??`），改名与搬迁没有进入版本历史；建议尽快对 `raw/SkillHub` 与 `.agents/skills` 做一次提交。
- `%TEMP%\metaswarm-src` 克隆已无对照需要，可在用户确认后清理。
- 若用户后续要新增其他模型或调整路由，改 `.agents/skills/agent-team-external-cli/SKILL.md` 的模型表即可，无需再动 raw 归档。
