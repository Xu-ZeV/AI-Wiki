---
name: status
description: 诊断状态报告 —— 显示 metaswarm 安装状态、项目配置与潜在问题
---

# Status 技能

生成一份 metaswarm 安装、项目配置与潜在问题的诊断报告，覆盖 Claude Code、Codex 与 Gemini 三个平台。用于故障排查，以及验证安装或迁移结果。

---

## 检查项

逐项执行下面的检查，并把结果汇总成一份格式化的报告。先探测当前活跃平台：

- Codex：存在 `PLUGIN_ROOT` 或 `CODEX_HOME`，活跃清单是 `.codex-plugin/plugin.json`，或用户以 `$status` 调用
- Claude Code：存在 `CLAUDE_PLUGIN_ROOT`，活跃清单是 `.claude-plugin/plugin.json`，或用户以 `$status` 调用
- Gemini：存在 `extensionPath`，活跃清单是 `gemini-extension.json`，或用户以 `$status` 调用

### 1. 插件版本

- Codex：从插件根目录读取 `.codex-plugin/plugin.json`，报告 `version`
- Claude Code：从插件根目录读取 `.claude-plugin/plugin.json`，报告 `version`
- Gemini：从插件根目录读取 `gemini-extension.json`，报告 `version`
- 兜底：读取插件根目录 `package.json` 的 `version`
- 两者都找不到时：`Plugin version: UNKNOWN`

### 2. 项目配置状态

- 检查工作目录下是否存在 `.metaswarm/project-profile.json`
- 若存在，报告关键字段：`distribution`、`metaswarm_version`、`language`、`framework`、`test_runner`
- 若不存在，报告平台对应的配置命令：
  - Codex：`Project setup: NOT CONFIGURED -- run $setup`
  - Claude Code：`Project setup: NOT CONFIGURED -- run $setup`
  - Gemini：`Project setup: NOT CONFIGURED -- run $setup`

### 3. 平台安装状态

**Codex**
- 检查插件根目录是否存在 `.codex-plugin/plugin.json`
- 在可访问的前提下，检查 `~/.codex/config.toml` 是否有已启用的 `metaswarm@...` 插件条目
- 扫描 `~/.codex/plugins/cache/`，查找 `"name": "metaswarm"` 的 `.codex-plugin/plugin.json`
- 若从本地市场安装，把缓存版本报告为 `local`

**Claude Code**
- 检查插件根目录是否存在 `.claude-plugin/plugin.json`
- 扫描 `~/.claude/plugins/cache/`，查找 `"name": "metaswarm"` 的 `.claude-plugin/plugin.json`
- 在可访问时报告市场/插件缓存状态

**Gemini**
- 检查插件根目录是否存在 `gemini-extension.json`
- 在可从本地 Gemini 配置发现时报告扩展状态

### 4. Claude 命令 shim

检查 Claude 项目时，核对 `.claude/commands/` 下这些文件：

| Shim | 期望内容 |
|---|---|
| `start-task.md` | 路由到 `/metaswarm:start-task` |
| `prime.md` | 路由到 `/metaswarm:prime` |
| `review-design.md` | 路由到 `/metaswarm:review-design` |
| `self-reflect.md` | 路由到 `/metaswarm:self-reflect` |
| `pr-shepherd.md` | 路由到 `/metaswarm:pr-shepherd` |
| `brainstorm.md` | 路由到 `/metaswarm:brainstorm` |

逐个报告 Present/Missing。若文件存在但不含 "metaswarm" 路由，标记为 `present (non-metaswarm content)`。

检查 Codex 项目时，报告 `not applicable (Codex uses $skill-name invocation)`，不要因为缺少 `.claude/commands/` 文件而判为错误。

### 5. 遗留内嵌插件

- 检查是否存在 `.claude/plugins/metaswarm/.claude-plugin/plugin.json`
- 若找到：`DETECTED -- run $migrate`
- 若它与市场版插件同时存在，显著标记为冲突

### 6. BEADS 插件

- 扫描 `~/.claude/plugins/cache/` 与 `~/.codex/plugins/cache/`，查找含有 `"name": "beads"` 的 `.claude-plugin/plugin.json` 或 `.codex-plugin/plugin.json` 的目录
- 若找到：`installed (standalone)` —— metaswarm 把预热交给 BEADS
- 若没找到：`not separately installed`

### 7. `bd` CLI

```bash
command -v bd && bd --version 2>/dev/null
```

- 若找到：报告路径与版本
- 若没找到：`not installed -- knowledge priming and self-reflect require bd. Core orchestration works without it.`

### 8. `gtg` CLI

```bash
command -v gtg && gtg --help >/dev/null 2>&1
```

- 若找到：报告路径
- 若没找到：`not installed -- pr-shepherd will fall back to manual gh checks.`

### 9. 外部工具

- 读取 `.metaswarm/external-tools.yaml` —— 若不存在：`not configured (optional)`
- 若存在，逐个检查已启用适配器的可用性：

```bash
command -v codex    # Codex CLI
command -v gemini   # Gemini CLI
```

按工具报告：是否启用（yes/no）、状态（available/not installed）。

### 10. 覆盖率门槛

- 读取 `.coverage-thresholds.json` —— 若不存在：`not configured`
- 若存在，报告门槛值（lines、branches、functions、statements）与强制执行的命令

### 11. Node.js

```bash
node --version 2>/dev/null
```

- 若找到：报告版本
- 若没找到：`not installed -- scripts/beads-*.ts require Node.js. Core orchestration works without it.`

---

## 输出格式

```markdown
## Metaswarm Status Report

| Component | Status |
|---|---|
| Active platform | Codex |
| Plugin version | 0.11.0 |
| Project setup | Configured (distribution: plugin) |
| Platform install | Codex plugin installed and enabled |
| Command shims | Not applicable (Codex uses $skill-name) |
| Legacy embedded plugin | Not detected |
| BEADS plugin | Not separately installed |
| bd CLI | Available (v0.5.2) |
| gtg CLI | Available |
| External tools | Codex: available, Gemini: not installed |
| Coverage thresholds | 100% (all categories) |
| Node.js | Available (v22.4.0) |

### Issues Found
- None

### Recommendations
- None
```

发现问题时：

```markdown
### Issues Found
1. Legacy embedded plugin detected alongside marketplace plugin -- run `$migrate`
2. Codex plugin not installed from a marketplace -- install from `/plugins` after adding the marketplace

### Recommendations
1. Install `bd` CLI for knowledge priming and self-reflect
2. Install `gtg` for the fastest `$pr-shepherd` readiness checks
3. Configure external tools for cross-model review (`.metaswarm/external-tools.yaml`)
```

---

## 错误处理

本技能只做诊断，永不致命失败。若某一项检查出错，就报告该项失败（例如 `Plugin version: ERROR -- could not read plugin.json`），然后继续执行其余检查。
