---
name: setup
description: 交互式项目配置 —— 检测项目、配置 metaswarm、写入项目本地文件
---

# Setup（项目配置）

metaswarm 的交互式配置流程。检测你的技术栈、提出针对性问题、写入项目本地文件，并生成与平台匹配的指令文件与命令 shim。它同时取代了 `npx metaswarm init` 与旧的 `/metaswarm-setup` 命令。

<CRITICAL-REQUIREMENTS>
Setup 必须为当前活跃平台生成那几份强制输出文件。有一个 shell 脚本会自动处理它们 —— 你**必须**运行它。

在阶段 2（用户提问）之后，根据检测结果确定正确的覆盖率命令，然后运行下面这条 Bash 命令：

```bash
PLUGIN_ROOT="${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${extensionPath:-}}}"
if [ -z "$PLUGIN_ROOT" ]; then
  setup_script="$(find "${CODEX_HOME:-$HOME/.codex}/plugins/cache" -path '*/metaswarm/*/lib/setup-mandatory-files.sh' -print -quit 2>/dev/null)"
  if [ -n "$setup_script" ]; then
    PLUGIN_ROOT="$(cd "$(dirname "$setup_script")/.." && pwd)"
  fi
fi
if [ -z "$PLUGIN_ROOT" ] && [ -f "$(pwd)/lib/setup-mandatory-files.sh" ]; then
  PLUGIN_ROOT="$(pwd)"
fi
bash "${PLUGIN_ROOT}/lib/setup-mandatory-files.sh" "$(pwd)" <threshold> "<coverage-command>" --platform <platform>
```

其中：
- `<threshold>` 是用户选定的百分比（例如 `100`）
- `<coverage-command>` 是其测试运行器对应的强制命令：
  - pytest → `"pytest --cov --cov-fail-under=<threshold>"`
  - vitest/pnpm → `"pnpm vitest run --coverage"`
  - jest/npm → `"npx jest --coverage"`
  - go → `"go test -coverprofile=coverage.out ./..."`
  - cargo → `"cargo tarpaulin --fail-under <threshold>"`
- `<platform>` 取 `codex`、`claude`、`gemini` 或 `all`。优先选择：
  - 在 Codex 中运行时用 `codex`（存在 `PLUGIN_ROOT` 或 `CODEX_HOME`，或用户以 `$setup` 调用）
  - 在 Claude Code 中运行时用 `claude`（存在 `CLAUDE_PLUGIN_ROOT`，或 setup 技能在该处被调用）
  - 在 Gemini 中运行时用 `gemini`（存在 `extensionPath`，或 setup 技能在该处被调用）
  - 仅当用户明确要求配置所有受支持的 CLI 时才用 `all`

该脚本负责：
1. **指令文件** —— Codex 用 `AGENTS.md`，Claude 用 `CLAUDE.md`，Gemini 用 `GEMINI.md`；追加 metaswarm 段落（或新建文件），若已存在则跳过
2. **`.coverage-thresholds.json`** —— 在项目根目录写入正确的门槛与命令
3. **Claude 命令 shim** —— 仅对 Claude/all：写入 `.claude/commands/start-task.md`、`prime.md`、`review-design.md`、`self-reflect.md`、`pr-shepherd.md`、`brainstorm.md`

脚本会输出 JSON，说明哪些文件被创建 / 跳过 / 出错。检查其中的 `"status": "ok"`。

**若脚本不可用或执行失败**，退回到用 Write 工具手工写入这些文件。不要跳过它们。
</CRITICAL-REQUIREMENTS>

## 前置检查

### 已有配置检查

用 Glob 检查 `.metaswarm/project-profile.json` 是否存在。

- **若存在**：读取它，呈现当前配置摘要，并用 AskUserQuestion 询问用户：「你已经有一份 metaswarm 项目配置。要重新运行 setup（覆盖已有选择）还是跳过？」选项：「Re-run setup」/「Skip」。若用户跳过，则停下并回复：「Setup skipped. Existing configuration unchanged.」
- **若不存在**：继续进入项目检测。

---

## 阶段 1：项目检测

用 Glob 与 Read 静默扫描项目目录。不要就这些信息向用户提问。先把一切检测出来，再呈现结果。

### 1.1 语言

检查项目根目录下的标记文件：

| 标记文件 | 语言 |
|---|---|
| `package.json` | Node.js / JavaScript |
| `tsconfig.json` | TypeScript（把 Node.js 细化为 TypeScript） |
| `pyproject.toml` 或 `setup.py` 或 `requirements.txt` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml` 或 `build.gradle` 或 `build.gradle.kts` | Java |
| `Gemfile` | Ruby |
| `Makefile`（单独出现，没有其它标记） | 未知（询问用户） |

若 `tsconfig.json` 与 `package.json` 同时存在，语言判定为「TypeScript」。

若检测到多种语言，把它们全部记下，但用主要语言（承载最多基础设施的那个）来生成命令。

**若未检测到任何语言**：先用 AskUserQuestion 询问用户在使用什么语言 / 技术栈，再继续。

### 1.2 框架

**Node.js/TypeScript** —— 读取 `package.json`，检查 `dependencies` + `devDependencies`：

| 依赖 | 框架 |
|---|---|
| `next` | Next.js |
| `nuxt` 或 `nuxt3` | Nuxt |
| `@angular/core` | Angular |
| `svelte` 或 `@sveltejs/kit` | SvelteKit |
| `react`（不含 next/nuxt） | React |
| `vue`（不含 nuxt） | Vue |
| `express` | Express |
| `fastify` | Fastify |
| `hono` | Hono |
| `@nestjs/core` | NestJS |

**Python** —— 在 `pyproject.toml` 或 `requirements.txt` 中查找：`fastapi`、`django`、`flask`。

**Go** —— 在 `go.mod` 中查找：`github.com/gin-gonic/gin`（Gin）、`github.com/labstack/echo`（Echo）、`github.com/gofiber/fiber`（Fiber）。

若未检测到框架，置为 `null`。

### 1.3 包管理器（仅 Node.js）

| 锁文件 | 包管理器 |
|---|---|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| `bun.lockb` | bun |
| `package-lock.json` | npm |

若找不到锁文件，默认 `npm`。非 Node.js 项目置为 `null`。

### 1.4 测试运行器

**Node.js/TypeScript**（第一个匹配者胜出）：
1. Glob 匹配 `vitest.config.*`，或 devDependencies 中有 `vitest` → `vitest`
2. Glob 匹配 `jest.config.*`，或 devDependencies 中有 `jest` → `jest`
3. devDependencies 中有 `mocha` → `mocha`

**Python**：检查 `pyproject.toml` 中的 `[tool.pytest]`，或依赖中的 `pytest` → `pytest`（Python 的默认值）。

**Go**：`go test`（内置）。**Rust**：`cargo test`（内置）。**Java/Maven**：`mvn test`。**Java/Gradle**：`gradle test`。

### 1.5 Linter

| 标记 | Linter |
|---|---|
| `.eslintrc*` 或 `eslint.config.*`，或 devDependencies 中有 `eslint` | eslint |
| `biome.json`，或 devDependencies 中有 `@biomejs/biome` | biome |
| `pyproject.toml` 中的 `[tool.ruff]`，或 `ruff.toml` | ruff |
| `.golangci.yml` 或 `.golangci.yaml` | golangci-lint |
| `.clippy.toml`，或 Cargo.toml 中的 clippy | clippy |

### 1.6 格式化工具

| 标记 | 格式化工具 |
|---|---|
| `.prettierrc*`，或 devDependencies 中有 `prettier` | prettier |
| `biome.json`（同时也做格式化） | biome |
| Python 依赖中有 `black` | black |
| `pyproject.toml` 中的 `[tool.ruff.format]` | ruff format |
| `rustfmt.toml` 或 `.rustfmt.toml` | rustfmt |

若 biome 同时被检测为 linter 与格式化工具，只报告一次，写作「Biome（lint + format）」。

### 1.7 类型检查器

| 标记 | 类型检查器 |
|---|---|
| `tsconfig.json` | tsc |
| Python 依赖中有 `mypy`，或 `pyproject.toml` 中的 `[tool.mypy]` | mypy |
| Python 依赖中有 `pyright`，或 `pyrightconfig.json` | pyright |

Go（`go vet`）与 Rust（`cargo check`）自带类型检查 —— 记录一下，但不单独列出。

### 1.8 CI 检测

| 标记 | CI 系统 |
|---|---|
| `.github/workflows/*.yml` | GitHub Actions |
| `.gitlab-ci.yml` | GitLab CI |
| `Jenkinsfile` | Jenkins |
| `.circleci/config.yml` | CircleCI |

### 1.9 Git 钩子检测

| 标记 | 钩子系统 |
|---|---|
| `.husky/` | Husky |
| `.pre-commit-config.yaml` | pre-commit |
| `.lefthook.yml` | Lefthook |

### 1.10 呈现结果

全部检测完成后，呈现发现：

```
I detected the following about your project:

  Language:        {language}
  Framework:       {framework or "None detected"}
  Package manager: {package_manager or "N/A"}
  Test runner:     {test_runner or "None detected"}
  Linter:          {linter or "None detected"}
  Formatter:       {formatter or "None detected"}
  Type checker:    {type_checker or "None detected"}
  CI:              {ci or "None detected"}
  Git hooks:       {git_hooks or "None detected"}
```

---

## 阶段 2：交互式提问

用 AskUserQuestion 只问与检测结果相关的问题。最多 3–5 个问题。

**永远要问：**

1. **覆盖率门槛** —— 「你想强制执行多高的测试覆盖率门槛？」选项：「100% (Recommended)」/「80%」/「60%」/「Custom」

**只在相关时才问：**

2. **外部 AI 工具** —— 只对非平凡项目询问：「要配置外部 AI 工具（Codex/Gemini）以便在实现环节省成本吗？」选项：「Yes」/「No」

3. **可视化评审** —— 只在检测到 Web 框架时询问（Next.js、Nuxt、React、Vue、Angular、SvelteKit、Django、Flask）：「要为 UI 改动启用截图可视化评审吗？」选项：「Yes」/「No」

4. **CI 流水线** —— 只在**未**检测到 CI 时询问：「要创建一条 GitHub Actions CI 流水线吗？」选项：「Yes (Recommended)」/「No」

5. **Git 钩子** —— 只在**未**检测到钩子时询问：「要为推送前质量检查配置 git 钩子吗？」选项：「Yes (Recommended)」/「No」

---

## 阶段 3：写入必需文件

### 第 1 步：运行强制文件脚本

这是阶段 2 之后要做的**第一件事**。确定覆盖率命令，然后运行：

```bash
PLUGIN_ROOT="${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT:-${extensionPath:-}}}"
if [ -z "$PLUGIN_ROOT" ]; then
  setup_script="$(find "${CODEX_HOME:-$HOME/.codex}/plugins/cache" -path '*/metaswarm/*/lib/setup-mandatory-files.sh' -print -quit 2>/dev/null)"
  if [ -n "$setup_script" ]; then
    PLUGIN_ROOT="$(cd "$(dirname "$setup_script")/.." && pwd)"
  fi
fi
if [ -z "$PLUGIN_ROOT" ] && [ -f "$(pwd)/lib/setup-mandatory-files.sh" ]; then
  PLUGIN_ROOT="$(pwd)"
fi
bash "${PLUGIN_ROOT}/lib/setup-mandatory-files.sh" "$(pwd)" <threshold> "<coverage-command>" --platform <platform>
```

Codex + Python/pytest + 100% 的示例：

```bash
bash "${PLUGIN_ROOT}/lib/setup-mandatory-files.sh" "$(pwd)" 100 "pytest --cov --cov-fail-under=100" --platform codex
```

检查 JSON 输出。若为 `"status": "ok"`，则 3 份强制文件已完成。向用户报告创建了什么。

若脚本失败或找不到，则手工写入这些文件（内容见上方 CRITICAL-REQUIREMENTS）。

### 第 2 步：定制指令文件中的 TODO 段落

若指令文件是**新建**的（而非追加），用 Edit 替换 TODO 占位符：
- 把 `npm test` / `npm run test:coverage` 替换为检测到的测试 / 覆盖率命令
- 把 `TypeScript strict mode` / `ESLint + Prettier` 替换为检测到的语言工具
- 删除 `<!-- TODO: ... -->` 注释行

若指令文件是**追加**到已有文件（已存在），本步不需要。

---

### 第 3 步：附加文件

#### 知识库

从 `./knowledge/` 逐个读取文件：
- `patterns.jsonl`、`gotchas.jsonl`、`decisions.jsonl`、`api-behaviors.jsonl`、`codebase-facts.jsonl`、`anti-patterns.jsonl`、`facts.jsonl`

把它们写入项目的 `.beads/knowledge/`。已存在的跳过。

#### Shell 工具

从 `./bin/` 逐个读取文件：
- `estimate-cost.sh`、`external-tools-verify.sh`、`pr-comments-check.sh`、`pr-comments-filter.sh`

把它们写入项目的 `bin/`。用 `chmod +x` 赋予可执行权限。已存在的跳过。

#### TypeScript 脚本

从 `./scripts/` 逐个读取文件：
- `beads-fetch-pr-comments.ts`、`beads-fetch-conversation-history.ts`

把它们写入项目的 `scripts/`。已存在的跳过。

**注意**：原先的 `beads-self-reflect.ts` 脚本已不再随包提供 —— 独立的 beads 插件（v0.63.3+）原生提供 `bd compact` 来做语义摘要。

**Node.js 依赖警告**：若项目语言**未**检测到 Node.js，输出：
> 「注意：scripts/*.ts 需要 Node.js（npx tsx）才能运行。部分高级功能（抓取 PR 评论、对话历史）要等 Node.js 可用后才会生效。metaswarm 的核心功能不依赖 Node.js。」

#### 条件文件

| 条件 | 来源 | 目标 |
|---|---|---|
| 用户为 CI 选择 YES | `./templates/ci.yml` | `.github/workflows/ci.yml` |
| 用户为 git 钩子选择 YES，且检测到 Husky 或为 Node.js 项目 | `./templates/pre-push` | `.husky/pre-push`（chmod +x） |
| 用户为外部工具选择 YES | `./templates/external-tools.yaml` | `.metaswarm/external-tools.yaml` |
| 总是 | `./templates/.env.example` | `.env.example` |
| 总是 | `./templates/SERVICE-INVENTORY.md` | `SERVICE-INVENTORY.md` |
| 总是 | `./templates/gitignore` | 合并进已有的 `.gitignore`（只追加缺失条目，绝不重复） |

对 `.gitignore`，先读取已有文件（若有），再追加尚不存在的语言相关条目。始终确保包含 `.env`、`.DS_Store` 与 `*.log`。

---

## 阶段 4：创建配置文件

把全部检测结果与用户选择写入 `.metaswarm/project-profile.json`：

```json
{
  "metaswarm_version": "1.0.0",
  "distribution": "plugin",
  "installed_at": "{current ISO 8601 timestamp}",
  "updated_at": "{current ISO 8601 timestamp}",
  "detection": {
    "language": "{detected language}",
    "framework": "{detected framework or null}",
    "test_runner": "{detected test runner}",
    "linter": "{detected linter or null}",
    "formatter": "{detected formatter or null}",
    "package_manager": "{detected package manager or null}",
    "type_checker": "{detected type checker or null}",
    "ci": "{detected CI system or null}",
    "git_hooks": "{detected hook system or null}"
  },
  "choices": {
    "coverage_threshold": 100,
    "external_tools": false,
    "visual_review": false,
    "ci_pipeline": false,
    "git_hooks": false
  },
  "commands": {
    "test": "{resolved test command}",
    "coverage": "{resolved coverage command}",
    "lint": "{resolved lint command or null}",
    "typecheck": "{resolved typecheck command or null}",
    "format_check": "{resolved format check command or null}"
  }
}
```

用检测结果与用户回答填充所有取值。未检测到的任何内容使用 `null`。

命令解析参考：

| 测试运行器 | 包管理器 | 测试命令 | 覆盖率命令 |
|---|---|---|---|
| vitest | pnpm | `pnpm vitest run` | `pnpm vitest run --coverage` |
| vitest | npm | `npx vitest run` | `npx vitest run --coverage` |
| vitest | yarn | `yarn vitest run` | `yarn vitest run --coverage` |
| jest | pnpm | `pnpm jest` | `pnpm jest --coverage` |
| jest | npm | `npx jest` | `npx jest --coverage` |
| jest | yarn | `yarn jest` | `yarn jest --coverage` |
| mocha | 任意 | `npx mocha` | `npx nyc mocha` |
| pytest | -- | `pytest` | `pytest --cov --cov-fail-under={threshold}` |
| go test | -- | `go test ./...` | `go test -coverprofile=coverage.out ./...` |
| cargo test | -- | `cargo test` | `cargo tarpaulin --fail-under {threshold}` |
| mvn test | -- | `mvn test` | `mvn test jacoco:report` |
| gradle test | -- | `gradle test` | `gradle test jacocoTestReport` |

---

## 阶段 5：配置后动作

### 5.1 外部工具（若已启用）

1. 通过 Bash 检查 Codex 与 Gemini CLI 是否安装（`command -v codex`、`command -v gemini`）
2. 对未安装的工具，告诉用户如何安装
3. 对已安装的工具，用 `--version` 验证
4. 更新 `.metaswarm/external-tools.yaml` —— 已安装的工具设 `enabled: true`，缺失的设 `enabled: false`

### 5.2 可视化评审（若已启用）

1. 通过 Bash 运行 `npx playwright install chromium`
2. 报告成功或失败

### 5.3 Git 钩子（若已启用）

**Node.js/TypeScript**：若尚无 Husky 则安装，运行 `npx husky init`，写入 pre-push 钩子。
**Python**：建议 `pip install pre-commit`，并提议创建 `.pre-commit-config.yaml`。
**其它**：为该生态建议合适的钩子工具。

---

## 阶段 6：总结

呈现最终总结：

```
Setup complete! Here's what was configured:

  Project:         {name}
  Language:        {language}
  Framework:       {framework or "None"}
  Test runner:     {test_runner} -> `{test command}`
  Coverage:        {threshold}% -> `{coverage command}`
  Linter:          {linter or "None"}
  Formatter:       {formatter or "None"}
  CI:              {ci or "None"}
  Git hooks:       {hooks or "None"}
  External tools:  {Enabled/Disabled}
  Visual review:   {Enabled/Disabled}

Mandatory files:
  ✔ {instruction file} — {written new / appended metaswarm section / already had it}
  ✔ .coverage-thresholds.json — {threshold}% coverage, enforcement: `{command}`
  ✔ .claude/commands/   — Claude only: shims for start-task, prime, review-design, self-reflect, pr-shepherd, brainstorm

Other files written:
  {list every other file written or modified with its path}

You're all set! Run the platform's start command to begin working.
```

**命令命名**：向用户推荐 metaswarm 技能时，使用 `$name` 形式（`$start`、`$setup`、`$status`、`$pr-shepherd`），除非当前活跃平台已经创建并选定了它自己的命令 shim。

根据配置给出 1–2 条相关提示：
- 若启用了外部工具：「用 `$external-tools` 查看工具状态。」
- 若未配置 CI：「之后可以考虑补上 CI —— metaswarm 在 `./templates/ci.yml` 提供了模板。」
- 若启用了可视化评审：「可视化评审技能会在开发过程中为你的应用截图。」

---

## 缺失配置的自动检测

若 `$start` 被调用、而 `.metaswarm/project-profile.json` 不存在，start 技能应自动路由到这里。本技能会跑完整个 setup 流程，然后交还给 `$start`，继续处理用户最初的请求。

---

## 错误处理

- 若任何 Bash 命令失败，报告错误，并提议跳过该步骤或重试。
- 若某个文件读不了，记下它，然后继续做其它检测。
- 若 AskUserQuestion 被关闭，使用默认值：100% 覆盖率、不启用外部工具、不启用可视化评审。
- 绝不让项目停留在配置了一半的状态。前置检查允许重跑 setup 直到完成。
- 所有模板路径都在本技能中硬编码。绝不使用用户提供的输入拼接文件路径。

---

## 最终验证（宣告 setup 完成之前必须运行）

在说「setup complete」之前，运行下面这条 Bash 命令验证那 3 份强制文件：

```bash
platform="${METASWARM_PLATFORM:-${CLAUDE_PLUGIN_ROOT:+claude}}"
platform="${platform:-${extensionPath:+gemini}}"
platform="${platform:-${CODEX_HOME:+codex}}"
platform="${platform:-${PLUGIN_ROOT:+codex}}"
platform="${platform:-claude}"
case "$platform" in
  claude) instruction_file="CLAUDE.md" ;;
  gemini) instruction_file="GEMINI.md" ;;
  codex) instruction_file="AGENTS.md" ;;
  *) echo "UNKNOWN PLATFORM: $platform"; exit 1 ;;
esac
echo "$instruction_file:"; grep -c "metaswarm" "$instruction_file" 2>/dev/null || echo "MISSING"
echo "coverage:"; ls .coverage-thresholds.json 2>/dev/null || echo "MISSING"
if [ "$platform" = "claude" ]; then
  echo "shims:"; ls .claude/commands/start-task.md .claude/commands/prime.md .claude/commands/brainstorm.md 2>/dev/null || echo "MISSING"
fi
```

若任何输出显示「MISSING」，回到前面重跑 setup-mandatory-files.sh 脚本，或手工创建这些文件。存在缺失文件时，不要宣告成功。

向用户报告可用命令时，使用 `$name` 技能调用形式，除非当前活跃平台已有它自己确认过的命令 shim。不要推荐该平台上不存在的命令。
