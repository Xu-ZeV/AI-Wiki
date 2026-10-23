# SkillHub 原始资料层导航

本目录是 SkillHub 的 **raw 原始资料层**，保存可追溯的技能原件与归档。这里不放 wiki 笔记，也不参与 Obsidian 图谱；面向人的中文蒸馏页面在 `../../wiki/SkillHub/`。

## 先看这里：多代理团队协作

**AI-Wiki 自有的多代理团队协作 skill 套件在 [`categories/multi-agent-orchestration/`](categories/multi-agent-orchestration/README.md)**，统一使用自有命名 `agent-team-*`，共 7 个，面向 Codex 原生子代理的多模型协作：

| skill | 作用 |
| --- | --- |
| `agent-team-orchestration` | **主入口**：四阶段执行闭环（实现 → 编排者独立验证 → 对抗评审 → 提交） |
| `agent-team-external-cli` | 跨模型委托与模型路由：决定实现者、评审者分别用哪个模型 |
| `agent-team-plan-gate` | 计划呈报前的三角色对抗门禁 |
| `agent-team-design-gate` | 设计文档定稿前的五角色门禁 |
| `agent-team-brainstorm` | 头脑风暴结论到设计门禁的强制桥接 |
| `agent-team-visual-review` | Playwright 截图视觉核验 |
| `agent-team-handoff` | 零上下文交接文档 |

配套说明见 [`categories/multi-agent-orchestration/README.md`](categories/multi-agent-orchestration/README.md)；对应的中文 wiki 入口是 [`wiki/SkillHub/categories/multi-agent-orchestration.md`](../../wiki/SkillHub/categories/multi-agent-orchestration.md)。

项目内 Codex 实际加载的副本在仓库根目录的 `.agents/skills/agent-team-*/SKILL.md`（点目录不被 Obsidian 索引，因此这里另存一份 raw 落盘）。

## 目录结构

| 路径 | 内容 |
| --- | --- |
| `categories/` | **按功能分类的可复用 skill 原件**，含 AI-Wiki 自研套件与从上游拆散迁入的 skill。 |
| `categories/<分类>/<slug>/` | 单个 skill 的完整目录：目录名即 skill slug，内含 `SKILL.md` 及 `references/`、`assets/`、`scripts/`、`agents/` 等支持文件；顶层不再保留任何上游包快照目录。 |
| `categories/<分类>/<slug>/versions/<variant>/` | 同一 skill 的冗余上游副本，`<variant>` 取值 `dot-skills`（`obsidian-wiki/.skills/*`）、`tasteskill`（`taste-skills/tasteskill/*`）、`top-level`（`taste-skills/` 顶层 4 个）；仅作留档对比，不与 canonical 版本混用。 |
| `categories/frontend-ui-design/` | 高级前端 UI 设计与重构（13 个 skill）。 |
| `categories/vue-engineering/` | Vue 3 工程实践（8 个 skill）。 |
| `categories/visual-reference-generation/` | 视觉参考图与品牌生成（5 个 skill）。 |
| `categories/design-delivery-governance/` | 设计交付、系统化与输出约束（3 个 skill）。 |
| `categories/presentation-web-slides/` | 演示文稿与网页幻灯片（3 个 skill）。 |
| `categories/obsidian-basic/` | Obsidian 基础能力与文件格式（5 个 skill）。 |
| `categories/content-ingest/` | 内容采集与导入（9 个 skill）。 |
| `categories/agent-history/` | AI 会话历史导入（10 个 skill）。 |
| `categories/retrieval-context/` | 知识检索与上下文复用（5 个 skill）。 |
| `categories/maintenance-governance/` | 维护、治理与知识质量（8 个 skill）。 |
| `categories/visualization-export/` | 可视化、仪表盘与导出（4 个 skill）。 |
| `categories/setup-automation/` | 配置、自动化与多库管理（3 个 skill）。 |
| `categories/skill-dev/` | Skill 开发与验证（3 个 skill）。 |
| `categories/multi-agent-orchestration/` | 多代理团队协作套件 `agent-team-*`（7 个 skill + 套件 README）。 |
| `categories/database-design/` | 数据库与后端工程（1 个 skill：由上游 MySQL 设计规范改编的 PostgreSQL 版本）。 |
| `zh/` | 上游框架专有 skill 的中文归档：全译稿 `skills/<slug>/SKILL.md`、归纳稿 `<slug>.md`。 |
| `zh/metaswarm/` | metaswarm 专有 7 个 skill 的中文全译与归纳；其 `original-en/` 保存已抽取协作协议的英文原件，仅作溯源。 |
| `LICENSES/` | 上游包级许可证留档（`LICENSES/<包名>/LICENSE`）。上游包拆散后包根 `LICENSE` 不再随包目录保留，统一收在这里，均为 MIT。 |
| `skills-lock.json` | 本地 skill 注册与来源登记；`agent-team-*` 条目登记为 `ai-wiki/agent-team` 本地来源，由上游文档直接改编的条目登记为 `ai-wiki/adapted-spec`。 |

分类目录共 15 个，分类口径与 `../../wiki/SkillHub/index.md` 的分类索引一致；每个分类下 `<slug>/` 目录唯一、互不重名，冗余副本一律收在对应 `<slug>/versions/` 内。

表中各分类的 skill 数为 **raw 层统计**（`categories/<分类>/<slug>/` 的 slug 目录数），包含尚无中文 wiki 页的 13 个 skill，因此可能大于 `wiki/SkillHub/index.md` 中该分类的页面计数；两处计数口径不同，不必强行对齐。

## 命名与归属

- AI-Wiki 自研的多代理套件统一用 `agent-team-*`，**不沿用任何上游框架的技能名**。
- 上游英文原件只作为血缘溯源保留在 `zh/metaswarm/original-en/`，不在 Codex 中加载，也不进入 wiki 导航。
- 需要人读的中文说明请走 `wiki/SkillHub/`；本目录只保证原始文件可追溯。

## 上游溯源

6 个上游包已全部解除 submodule 并拆散迁入 `categories/`，不再保留整包快照目录；此外还有 1 个直接改编的单文件文档来源（非 submodule 包，见下表最后一行）：

| 上游来源 | 记录到的 commit | 迁入情况 |
| --- | --- | --- |
| [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills.git) | `a1dc48e68138490d522c04cbf5822214c6eb1202` | 原 submodule 目录 `obsidian-skills/`，5 个 skill 按功能迁入 `categories/`。 |
| [Ar9av/obsidian-wiki](https://github.com/Ar9av/obsidian-wiki.git) | `875391606e8c59acafb2d28d5f5e591f3efc4c66` | 原 submodule 目录 `obsidian-wiki/`，42 个 skill（`skills/` 36 + `.skills/` 6）迁入 `categories/`；`.skills/` 其余 33 个同名副本进 `versions/dot-skills/`。 |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git) | `b7e3af80f6e331f6fb456667b82b12cade7c9d35` | 原 submodule 目录 `ui-ux-pro-max-skill/`，`.claude/skills/` 下 7 个 skill 迁入 `categories/`。 |
| [jeettrench/taste-skill](https://github.com/jeettrench/taste-skill)（原上游包目录 `taste-skills/`） | 本仓库未记录 commit | 非 submodule 普通目录，`skills/` 12 个 skill 迁入 `categories/`，另有 8 个冗余副本（4 个 slug 的 `versions/top-level/` 与 `versions/tasteskill/`）。 |
| [vuejs-ai/skills](https://github.com/vuejs-ai/skills)（原上游包目录 `vuejs-ai-skills/`） | 本仓库未记录 commit | 非 submodule 普通目录，8 个 skill 迁入 `categories/vue-engineering/`。 |
| `impeccable`（原上游包目录 `impeccable/`） | 本仓库未记录上游仓库地址与 commit | 包根本身即 skill，整包迁入 `categories/frontend-ui-design/impeccable/`；包内脚本引用其产品站点 `https://impeccable.style`，仅作旁证。 |
| [Highflyer/MySQL-Design-Specification](https://github.com/Highflyer/MySQL-Design-Specification) | `14f78853e8b601b78ce2abfc0120b4cf55e06e37` | 非 submodule、也非上游包：仓库仅 1 个 `README.md`（MySQL 设计规范 109 条），改编为 `categories/database-design/postgresql-design-specification/`，上游原文留存 `references/upstream-mysql-design-spec.md`。 |

上游来源仅作溯源记录，日常使用与 Obsidian 索引一律以 `categories/<分类>/<slug>/` 为准。

拆包时保留的非 skill 内容：

- 5 个上游包的包根 `LICENSE`（均为 MIT）统一留档在 `LICENSES/<包名>/LICENSE`；`impeccable` 上游未提供许可证文件；`Highflyer/MySQL-Design-Specification` 上游同样未提供许可证文件。
- 原 `taste-skills/research/`（仓库级调研：LLM 输出截断/惰性，12 个 Markdown）主题与 `output-skill` 直接对应，随该 skill 保留在 `categories/design-delivery-governance/output-skill/research/`。
- 其余包内脚手架（`README.md`、`.github/`、示例图片、`skill.sh` 等）未保留。

## 维护约定

- 新增或调整分类目录后，同步更新本 README 的分类表，以及 `../../wiki/SkillHub/index.md` 与对应分类页。
- 上游框架专有 skill 若需中文留存：逐段全译存 `zh/<仓库名>/skills/<slug>/SKILL.md`，压缩归纳存 `zh/<仓库名>/<slug>.md`，两者职责分开。
- 不再指向 `raw/SkillHub/agents/`；历史安装布局已按功能迁入 `categories/`。
- 6 个上游包已全部解除 submodule 并拆散迁入 `categories/`：`.gitmodules` 与本地 `submodule.*` 配置节、包内嵌套 `.git` 均已移除，内容直接纳入主仓库版本管理；上游更新时不能再用 `git submodule update` 拉取，需手动比对覆盖。除这 6 个上游包外，还有 1 个直接改编的单文件文档来源（`Highflyer/MySQL-Design-Specification`）：它从来不是 submodule，没有 `.gitmodules` 记录，同样需要手动比对上游覆盖。
- 同一 skill 出现多个上游版本时，只保留一份 canonical 放在 `categories/<分类>/<slug>/`，其余按来源收进 `<slug>/versions/<variant>/`，不要另建同名 slug 目录。
