# metaswarm 框架专有 skill（中文全译 + 归纳归档）

## 定位

本目录保存 `dsifry/metaswarm` 框架专有技能文档的中文版本，属于 raw 原始资料层，不是 SkillHub wiki 页面。

这些 skill 依赖 BEADS 任务库（`bd` CLI）、`gtg` 合并门禁、插件 marketplace、Claude Team Mode，以及 GitHub Issue 到 PR 的全自动流水线，与本机以 Codex 原生子代理为主的工作方式不匹配。

2026-10-10，这 7 个页面从 `wiki/SkillHub/skills/` 下架并移入本目录，不再参与 SkillHub wiki 的导航、分类计数与图谱。

## 两个层级

| 层级 | 路径 | 内容 |
| --- | --- | --- |
| **全文翻译稿** | `skills/<slug>/SKILL.md` | 逐段对译上游原件，保留全部流程、阶段、表格、bash / typescript 代码块与 ASCII 流程图的完整信息 |
| **中文归纳稿** | `<slug>.md` | 4–8 KB 的压缩归纳，只用于快速了解技能用途；不替代全译稿 |

两者内容职责不同：要查原文细节、代码块与完整阶段说明，看 `skills/<slug>/SKILL.md`；只想先知道「这个 skill 干什么」，看 `<slug>.md`。

## 清单

| slug | 中文名 | 全译稿 | 归纳稿 | 归档原因 |
| --- | --- | --- | --- | --- |
| `start` | BEADS 多Agent编排总入口 | `skills/start/SKILL.md` | `start.md` | 入口逻辑建立在 BEADS 任务库与 metaswarm 插件之上，本机无对应物 |
| `setup` | Metaswarm 交互式项目配置 | `skills/setup/SKILL.md` | `setup.md` | 为 metaswarm 插件生成项目配置与平台指令 shim，本机不安装该插件 |
| `status` | Metaswarm 安装与配置诊断 | `skills/status/SKILL.md` | `status.md` | 诊断的是 metaswarm 插件、`bd` 与 `gtg` CLI 的安装状态 |
| `migrate` | Metaswarm 框架迁移与精简 | `skills/migrate/SKILL.md` | `migrate.md` | 处理旧版 npm 内嵌插件到市场插件的迁移 |
| `create-issue` | 自包含 GitHub Issue 生成 | `skills/create-issue/SKILL.md` | `create-issue.md` | 依赖 GitHub Issue 工作流，本仓库不使用该交付链路 |
| `pr-shepherd` | PR 全生命周期自主监护 | `skills/pr-shepherd/SKILL.md` | `pr-shepherd.md` | 依赖 GitHub PR、CI 与 `gh` / `gtg` CLI 的持续监护循环 |
| `handling-pr-comments` | 系统化 PR 评审反馈处理 | `skills/handling-pr-comments/SKILL.md` | `handling-pr-comments.md` | 依赖 PR 评审线程与 CodeRabbit / Cursor 等外部评审机器人 |

## 上游来源

- 上游仓库：https://github.com/dsifry/metaswarm
- 翻译依据：2026-10-10 重新克隆上游 `main`（commit `33d39f7`），按 `skills/<slug>/SKILL.md` 逐段全文对译。
- 英文原件：本仓库内不留存，全译稿即中文留存版本。
- 许可证：MIT

## 翻译约定

- frontmatter 保留英文字段名（`name` / `description` / `auto_activate` / `triggers`），字段值译中文，`name` 保持英文 slug。
- 正文标题、表格、说明全部中文；**代码块内容一律保持英文原样**（bash、typescript、markdown 模板、jq 表达式、JSON）。
- ASCII 流程图与 schema 图重绘为中文标签，结构不变。

## 上游英文原件归档

2026-10-10，原先安装在 `raw/SkillHub/agents/skills/` 的 7 个「可复用协作协议」英文原件，随 AI-Wiki 自有 skill 套件 `agent-team-*` 的建立，已迁入本目录的 `original-en/` 作为溯源留存：

| 英文原件目录 | 对应的自有 skill |
| --- | --- |
| `original-en/brainstorming-extension/` | `agent-team-brainstorm` |
| `original-en/design-review-gate/` | `agent-team-design-gate` |
| `original-en/external-tools/` | `agent-team-external-cli` |
| `original-en/handoff/` | `agent-team-handoff` |
| `original-en/orchestrated-execution/` | `agent-team-orchestration` |
| `original-en/plan-review-gate/` | `agent-team-plan-gate` |
| `original-en/visual-review/` | `agent-team-visual-review` |

这批英文原件是**上游原样文件**，保留 `guides/`、`rubrics/`、`adapters/` 等附属目录，只用于对照溯源，不在 Codex 中加载，也不进入 wiki 导航。

对应的中文自研版已落盘到 `raw/SkillHub/categories/multi-agent-orchestration/agent-team-*/SKILL.md`，项目内可加载副本在 `.agents/skills/agent-team-*/SKILL.md`。

注意区分两批资料：本 README 上半部分表格里的 7 个 `skills/<slug>/SKILL.md` 是**框架专有 skill 的中文全译稿**（`start`、`setup`、`status`、`migrate`、`create-issue`、`pr-shepherd`、`handling-pr-comments`）；本节的 `original-en/` 是**可复用协作协议的英文原件**。两者不是同一批内容。

## 相关

Codex 原生的多模型子代理协作套件保存在 `raw/SkillHub/categories/multi-agent-orchestration/agent-team-*`，项目内可加载副本在 `.agents/skills/agent-team-*`，其 wiki 入口见 `wiki/SkillHub/categories/multi-agent-orchestration.md`。
