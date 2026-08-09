---
name: wiki-switch
description: >
  Switch between multiple Obsidian wiki vault profiles. Use this skill when the user says
  "/wiki-switch NAME", "switch to my work wiki", "switch vault", "change wiki", "which wiki am I on",
  "list my wikis", "show my vaults", "create a new vault config", or "add a new wiki profile".
  The skill manages named config files at ~/.obsidian-wiki/config.NAME and activates one by
  symlinking it to ~/.obsidian-wiki/config.
---

# Wiki Switch — 管理多个 Vault 配置文件

每个vault都是一个完整的配置文件，位于 `~/.obsidian-wiki/config.<name>`。活动vault是
`~/.obsidian-wiki/config` 符号链接到的文件。切换vault意味着重新指向该符号链接。

## 调度

解析调用并路由到正确的部分：

|调用|行动|
|---|---|
| `/wiki-switch <name>` | → **开关** |
| `/wiki-switch list` | → **列表** |
| `/wiki-switch show [name]` | → **显示** |
| `/wiki-switch new <name>` | → **新** |
| `/wiki-switch`（无参数）| → **列表**（视为列表）|

---

## 切换（默认操作）

激活指定的vault配置文件。

1. 验证 `~/.obsidian-wiki/config.<name>` 是否存在。如果不存在，请告诉用户该vault不存在并列出可用的内容（运行 **List**）。
2. 运行：
   ```bash
   ln -sf ~/.obsidian-wiki/config.<name> ~/.obsidian-wiki/config
   ```
3. 从新的活动配置中读取 `OBSIDIAN_VAULT_PATH`。
4.向用户确认：
   ```
   Switched to vault: <name>
   Vault path: <value of OBSIDIAN_VAULT_PATH from the config>
   ```

---

## 列表

显示所有已注册的vault配置文件以及哪些处于活动状态。

1. 查找与 `~/.obsidian-wiki/config.*` 匹配的所有文件（不包括 `config` 本身 - 这是符号链接）。
2.解析当前符号链接目标：`readlink ~/.obsidian-wiki/config`
3. 对于每个配置文件，读取第一个非空注释行（以 `#` 开头的行）作为vault的人工描述。如果不存在注释，则回退到文件的后缀作为标签。
4、显示：
   ```
   Vaults:
     personal   My personal research wiki    ← active
     work       Work projects wiki
   ```
   将活动的标记为 `← active`。如果符号链接已损坏或 `config` 不存在，则显示 `(none active)`。

---

## 显示

打印vault的完整配置。

- 如果给出了名称，则读取 `~/.obsidian-wiki/config.<name>`。
- 如果未给出名称，请读取 `~/.obsidian-wiki/config`（活动vault）。
- 如果文件不存在，请告诉用户并列出可用的文件。
- 逐字打印文件内容（编辑包含 `API_KEY` 或 `SECRET` 的任何行 — 显示 `***` 而不是值）。

---

## 新

将当前活动配置中的新vault配置搭建为模板。

1. 检查 `~/.obsidian-wiki/config.<name>` 是否已存在。如果确实如此，则中止。
2. 复制活动配置：
   ```bash
   cp ~/.obsidian-wiki/config ~/.obsidian-wiki/config.<name>
   ```
3. 读取复制的配置。配置文件使用 `# --- Section name ---` 注释标头将字段分组为部分（例如，`# --- Vault-specific ---`、`# --- Vault-independent ---`、`# --- Secrets ---`）。使用这些部分来确定要询问的内容：
   - 标记为“特定于库”、“路径”或类似内容的部分中的字段 → 询问用户新值
   - 标记为“独立于库”、“全局”、“共享”的部分中的字段 → 保持原样（复制不变）
   - 标有“秘密”的部分中的字段 → 询问新vault是否使用相同或不同的凭据
   - 如果没有节标题，则显示所有字段并让用户决定更改哪些字段
4. 询问用户特定于库的字段的更新值。使用当前值作为可见的默认值 - 用户只需提供不同的内容。
5. 将更新后的值写入`~/.obsidian-wiki/config.<name>`。
6. 更新顶部注释行以描述新vault（例如，`# Obsidian Wiki — <name> vault`）。
7. 确认：
   ```
   Created: ~/.obsidian-wiki/config.<name>
   Run `/wiki-switch <name>` to activate it, then run `wiki-setup` to initialise the new vault.
   ```
   不要自动切换——让用户决定何时激活。
