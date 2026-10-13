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
| `categories/` | **按功能分类的可复用 skill 原件**，含 AI-Wiki 自研套件与从上游抽取的中文版。 |
| `categories/multi-agent-orchestration/` | 多代理团队协作套件 `agent-team-*`（7 个 skill + 套件 README）。 |
| `categories/frontend-ui-design/` | 高级前端 UI 设计与重构。 |
| `categories/presentation-web-slides/` | 演示文稿与网页幻灯片。 |
| `zh/` | 上游框架专有 skill 的中文归档：全译稿 `skills/<slug>/SKILL.md`、归纳稿 `<slug>.md`。 |
| `zh/metaswarm/` | metaswarm 专有 7 个 skill 的中文全译与归纳；其 `original-en/` 保存已抽取协作协议的英文原件，仅作溯源。 |
| `impeccable/`、`obsidian-skills/`、`obsidian-wiki/`、`taste-skills/`、`ui-ux-pro-max-skill/`、`vuejs-ai-skills/` | 上游仓库原样快照。 |
| `skills-lock.json` | 本地 skill 注册与来源登记；`agent-team-*` 条目登记为 `ai-wiki/agent-team` 本地来源。 |

## 命名与归属

- AI-Wiki 自研的多代理套件统一用 `agent-team-*`，**不沿用任何上游框架的技能名**。
- 上游英文原件只作为血缘溯源保留在 `zh/metaswarm/original-en/`，不在 Codex 中加载，也不进入 wiki 导航。
- 需要人读的中文说明请走 `wiki/SkillHub/`；本目录只保证原始文件可追溯。

## 维护约定

- 新增或调整分类目录后，同步更新本 README 的分类表，以及 `../../wiki/SkillHub/index.md` 与对应分类页。
- 上游框架专有 skill 若需中文留存：逐段全译存 `zh/<仓库名>/skills/<slug>/SKILL.md`，压缩归纳存 `zh/<仓库名>/<slug>.md`，两者职责分开。
- 不再指向 `raw/SkillHub/agents/`；历史安装布局已按功能迁入 `categories/`。
