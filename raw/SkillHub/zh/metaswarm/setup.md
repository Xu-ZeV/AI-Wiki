---
title: Metaswarm 交互式项目配置
slug: setup
archived_at: 2026-10-10
archived_from: wiki/SkillHub/skills/setup.md
origin_repo: dsifry/metaswarm
source_note: 本页为中文归纳稿；逐段全译见 skills/setup/SKILL.md
archive_reason: metaswarm 框架专有，Codex 原生子代理工作流不适用
---
# Metaswarm 交互式项目配置

> [!note] 归档原始资料
> 本文是 metaswarm 框架技能文档的中文归纳稿。因框架专有（BEADS 任务库、`bd` / `gtg` CLI、插件 marketplace、GitHub Issue 到 PR 的全自动流水线、Claude / Gemini 平台适配）且本机不适用，已于 2026-10-10 从 `wiki/SkillHub` 下架，移入 raw 原始资料层留存。
> 文中机制在本机不存在，请勿按此执行；Codex 原生子代理协作方案见项目内 `.agents/skills/`。

> [!info] Skill 元信息
> 原始名称：`setup`  
> 原始标题：Setup  
> 功能分类：多Agent团队协作  
> 原始文件：本页为中文归纳稿；逐段全译见 [skills/setup/SKILL.md](./skills/setup/SKILL.md)  
> 上游仓库：[dsifry/metaswarm](https://github.com/dsifry/metaswarm)  
> 许可证：MIT

## 中文含义与用途

中文含义：Metaswarm 的项目级交互式安装与脚手架搭建。  
核心用处：静默探测宿主项目的语言、框架、包管理器、测试运行器、Linter、Formatter、类型检查器、CI 与 Git Hooks，就覆盖率阈值等关键决策提 3-5 个问题，然后写入项目本地配置文件、平台指令文件与命令 shim。它同时替代 `npx metaswarm init` 与旧的 `/metaswarm-setup` 命令。

## 探测阶段（Phase 1.1 – 1.10）

| 阶段 | 探测内容 |
| --- | --- |
| 1.1 | 语言（`package.json` / `tsconfig.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` / `pom.xml` / `Gemfile`） |
| 1.2 | 框架（Next.js、Nuxt、Angular、SvelteKit、React、Vue、Express、Fastify、Hono、NestJS、FastAPI、Django、Flask、Gin、Echo、Fiber） |
| 1.3 | 包管理器（pnpm / yarn / bun / npm） |
| 1.4 | 测试运行器（vitest、jest、mocha、pytest、go test、cargo test、mvn test、gradle test） |
| 1.5 | Linter（eslint、biome、ruff、golangci-lint、clippy） |
| 1.6 | Formatter（prettier、biome、black、ruff format、rustfmt） |
| 1.7 | 类型检查器（tsc、mypy、pyright） |
| 1.8 | CI 系统（GitHub Actions、GitLab CI、Jenkins、CircleCI） |
| 1.9 | Git Hooks（Husky、pre-commit、Lefthook） |
| 1.10 | 汇总呈现探测结果 |

## 三个强制产物（Mandatory Files）

Phase 2 提问结束后**必须**运行 `lib/setup-mandatory-files.sh`，脚本按平台产出：

1. **指令文件**：Codex 写 `AGENTS.md`，Claude Code 写 `CLAUDE.md`，Gemini 写 `GEMINI.md`（追加 metaswarm 章节；若已存在则跳过）。
2. **`.coverage-thresholds.json`**：写入项目根目录，含阈值与覆盖率强制命令。
3. **Claude 命令 shim**（仅 Claude / all）：`.claude/commands/` 下写 6 个 `start-task` / `prime` / `review-design` / `self-reflect` / `pr-shepherd` / `brainstorm`。

脚本返回 JSON，须确认 `"status": "ok"`；脚本不可用或失败时改为手工写入，**不得跳过**。README 中记录的 `.codex/instructions.md`、`bin/test|typecheck|lint` 并非本 skill 的产物。

## 其他写入内容

- **知识库**：`knowledge/*.jsonl` 写入 `.beads/knowledge/`。
- **Shell 工具**：`bin/estimate-cost.sh`、`external-tools-verify.sh`、`pr-comments-check.sh`、`pr-comments-filter.sh`。
- **TypeScript 脚本**：`scripts/beads-fetch-pr-comments.ts`、`beads-fetch-conversation-history.ts`（需 Node.js，核心编排不依赖它）。
- **条件文件**：`.github/workflows/ci.yml`、`.husky/pre-push`、`.metaswarm/external-tools.yaml`。
- **始终写入**：`.env.example`、`SERVICE-INVENTORY.md`、合并进 `.gitignore` 的缺省条目。
- **项目档案**：`.metaswarm/project-profile.json`（含 detection、choices、commands 三段）。

## 交互问题（Phase 2，最多 3-5 个）

必问：覆盖率阈值（默认推荐 100%）。按情况追问：是否启用外部 AI 工具、是否启用视觉审查（仅在探测到 Web 框架时）、是否创建 CI 流水线、是否配置 Git Hooks。

## 收尾与校验

- Phase 5 后置动作：校验 Codex / Gemini CLI 是否安装并回写 `.metaswarm/external-tools.yaml` 的 `enabled`；启用视觉审查时执行 `npx playwright install chromium`。
- Phase 6 输出配置摘要。
- **收尾前必须运行 Final Verification**：确认指令文件中含 `metaswarm`、`.coverage-thresholds.json` 存在、Claude 平台下 6 个 shim 存在。任一输出 `MISSING` 都不得宣称配置完成。
- 若 `$start` 被调用而 `.metaswarm/project-profile.json` 不存在，会自动路由到本 skill，完成后交还给 `$start`。

## 原始描述摘要

Interactive project setup — detects your project, configures metaswarm, writes project-local files, and creates platform-appropriate instruction files and command shims.

## 相关 Skill

- `start`
- `status`
- `migrate`
