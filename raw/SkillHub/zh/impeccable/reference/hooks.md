# $无可挑剔的钩子

管理当前项目的**设计检测器挂钩**。

该挂钩在直接文件编辑上运行无可挑剔的设计检测器以设计相关文件（`.tsx`、`.jsx`、`.html`、`.vue`、`.svelte`、`.astro`、 `.css`、`.scss`、`.sass`、`.less`、`.ts`、`.js`）。 Claude Code 和 Codex 使用 `PostToolUse` 并在编辑后将简短的系统提醒推送到代理的上下文中；除非打开安静模式（配置中的 `hook.quiet`），否则发现的问题会得到纠正提示，待处理的问题会得到重新推动，干净的 UI-ish 文件会得到简短的确认。普通 `.ts` 和 `.js` 文件仍会被扫描，但保持安静，除非检测器发现某些东西。 Cursor 使用 `preToolUse` 在错误的建议写入到达之前阻止它们，并在允许干净写入时保持沉默。

此命令通过编辑 `.impeccable/config.json`（统一的 Impeccable 配置；挂钩运行时设置在其 `hook` 键下实时切换，共享检测器忽略 `detector` 下的实时）来切换 **每个项目** 的钩子。每个开发者都会覆盖，包括 CLI 记录的安装同意决定 (`hook.consent`)，位于 gitignored `.impeccable/config.local.json` 中。设置 `hook.enabled: false` 以关闭挂钩，设置 `hook.quiet: true` 以静默干净/待处理的确认，或将 `hook.auditLog` 设置为 NDJSON 日志的文件路径。旧版 `IMPECCABLE_HOOK_DISABLED`、`IMPECCABLE_HOOK_QUIET` 和 `IMPECCABLE_HOOK_LOG` 环境变量仍然受到支持，并在设置时覆盖这些配置值。

默认情况下，手动 `npx impeccable detect` 扫描使用相同的项目过滤器配置：`detector.ignoreRules`、`detector.ignoreFiles`、`detector.ignoreValues` 和 `detector.designSystem.enabled`。 `hook.enabled` 仅控制自动挂钩执行，不控制手动 CLI 扫描。使用 `npx impeccable detect --no-config ...` 进行忽略项目配置/上下文的原始检测器运行。使用 `npx impeccable ignores ...` 在同一检测器上进行直接 CLI CRUD 忽略。

支持的工具：Claude Code（项目中的 `.claude/settings.local.json`，它被 gitignored，因此钩子保持在机器本地；您移动到共享 `settings.json` 的钩子也将就位）、Codex（项目中的 `.codex/hooks.json`）和 Cursor（项目中的 `.cursor/hooks.json`）。

在 **Cursor** 上，`preToolUse` 检查建议的 Write/Edit/Shell 写入内容，并仅在真正的检测器发现问题时才拒绝。代理可以看到拒绝消息作为工具错误，因此代理可以在错误写入发生之前重新考虑。

## 路由

第一个参数是动作。默认为 `status`。

|行动|它有什么作用 |
|---|---|
| `status` |打印当前状态、共享/本地配置路径、忽略的规则/文件/值、环境覆盖。 |
| `on` |在 `.impeccable/config.json` 中设置 `enabled: true`，将本地挂钩同意记录为已接受，并在安装技能时安装/修复提供程序挂钩清单。 |
| `off` |将 `enabled: false` 设置为 `.impeccable/config.json`。 |
| `ignore-rule <id>` |将 `<id>` 追加到 `detector.ignoreRules`；对于 `overused-font`，需要 `--all-values`。 |
| `ignore-file <glob>` |将 `<glob>` 附加到 `detector.ignoreFiles`。 |
| `ignore-value <id> <value> [--shared] [--reason "..."]` |将规则/值抑制附加到共享 `.impeccable/config.json`。 |
| `ignore-value <id> <value> --local [--reason "..."]` |将私有规则/值抑制附加到 `.impeccable/config.local.json`。 |
| `reset` |删除项目配置、重复数据删除缓存和光标待处理队列。 |

## 流程

1. 根据用户的争论解决该操作。如果未指定任何操作，则默认为 `status`。
2. 调用管理脚本并逐字传递用户的输出：

   ```bash
   node .agents/skills/impeccable/scripts/hook-admin.mjs <action> [args...]
   ```

3. 如果 `<action>` 是 `off`，则跟进一行注释：“完成。在运行 `$impeccable hooks on` 之前，新编辑不会触发此项目中的设计挂钩。”
4. 如果 `<action>` 是 `on`，则继续：“完成。设计挂钩将在 UI 文件上的下一次编辑/写入/多重编辑后触发。”
5. 如果 `<action>` 是 `ignore-value`、`ignore-file` 或 `ignore-rule`，则仅打印脚本输出。默认作用域为共享`.impeccable/config.json`；仅当用户明确请求私有例外时才添加 `--local`。
6. 如果 `<action>` 是 `status`，则仅打印脚本输出。除非用户提出后续问题，否则请勿添加评论。

## 有意的发现

钩子本身永远不会写入忽略配置。仅在用户明确确认标记的问题是故意的后才保留异常，并始终通过 `hook-admin.mjs`。

更喜欢最窄的例外：

- 如果查找行显示确切的 `ignore-value` 命令，请运行该命令。默认写入共享 `.impeccable/config.json`。
- 对于特定值的结果，例如 `overused-font` 和 `bounce-easing`，当用户确认特定值时使用 `ignore-value`。请勿将 `ignore-rule overused-font` 用于特定字体。
- 如果查找结果没有特定于值的命令，例如 `side-tab`，则优先选择 `ignore-file <path>` 作为当前文件。
- 仅当用户要求在整个项目中禁止整个规则时才使用 `ignore-rule <id>`。对于广泛的过度使用字体抑制，仅当用户通常要求忽略过度使用字体时才使用 `ignore-rule overused-font --all-values`。
- 请勿添加`impeccable: ignore`等源码注释；内联注释会污染代码，并且不是受支持的抑制机制。

特定于值的异常示例：

```bash
node .agents/skills/impeccable/scripts/hook-admin.mjs ignore-value overused-font Inter --shared --reason "User confirmed Inter is intentional"
```

故意运动例外示例：

```bash
node .agents/skills/impeccable/scripts/hook-admin.mjs ignore-value bounce-easing bounce-ball --shared --reason "User confirmed ball bounce animation is intentional"
```

完整规则字体例外示例：

```bash
node .agents/skills/impeccable/scripts/hook-admin.mjs ignore-rule overused-font --all-values --reason "User asked to ignore overused fonts generally"
```

文件范围异常示例：

```bash
node .agents/skills/impeccable/scripts/hook-admin.mjs ignore-file "src/legacy/Card.tsx"
```

## 约束条件

- 切勿从此命令手动修改 `.impeccable/config.json` 或 `.impeccable/config.local.json`。始终检查 `hook-admin.mjs`，以便写入保持验证并且文件形状保持一致。
- 请勿从此流程中编辑挂钩脚本本身（`hook.mjs`、`hook-lib.mjs`、`hook-before-edit.mjs`）。这些都是技能管道。
- 当检测器发现真正的问题时，光标可以阻止建议的写入。 Claude Code 和 Codex 不会阻止编辑；相反，他们会发出编辑后提醒。禁用会停止阻止和提醒。
- 该钩子与 Impeccable 技能捆绑在一起，并通过项目本地清单安装：`.claude/settings.local.json`、`.codex/hooks.json` 和 `.cursor/hooks.json`。在 Codex 上，用户必须首次通过 `/hooks` 批准挂钩。在光标上，确认在“设置”->“挂钩”下启用了挂钩。

## 故障模式

- 如果 `.impeccable/config.json` 或 `.impeccable/config.local.json` 不可读或格式错误，则挂钩会忽略该文件并使用剩余的有效配置/默认值。 `hook-admin.mjs status` 会将格式错误的文件显示为忽略。
- 如果用户要求全局“禁用钩子”，则以 `$impeccable hooks off` 开头（此项目持续存在；将 `hook.enabled: false` 写入配置）。旧版 `IMPECCABLE_HOOK_DISABLED=1` 环境变量也可用作 shell 后的一次性覆盖。
