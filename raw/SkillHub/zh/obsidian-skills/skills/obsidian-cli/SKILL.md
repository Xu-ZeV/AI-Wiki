---
name: obsidian-cli
description: 使用 Obsidian CLI 与 ObsidianVault 进行交互，以读取、创建、搜索和管理注释、任务、属性等。还支持插件和主题开发，使用命令重新加载插件、运行 JavaScript、捕获错误、截屏和检查 DOM。当用户要求与其Obsidian vault交互、管理笔记、搜索vault内容、从命令行执行vault操作或开发和调试Obsidian插件和主题时使用。
---

# Obsidian CLI

使用 `obsidian` CLI 与正在运行的 Obsidian 实例进行交互。需要Obsidian打开。

## 命令参考

运行 `obsidian help` 以查看所有可用命令。这始终是最新的。完整文档：https://help.obsidian.md/cli

## 语法

**参数**采用 `=` 的值。用空格引用值：

```bash
obsidian create name="My Note" content="Hello world"
```

**标志**是没有值的布尔开关：

```bash
obsidian create name="My Note" silent overwrite
```

对于多行内容，请使用 `\n` 表示换行符，使用 `\t` 表示制表符。

## 文件定位

许多命令接受 `file` 或 `path` 来定位文件。如果两者都没有，则使用活动文件。

- `file=<name>` — 像 wikilink 一样解析（仅名称，不需要路径或扩展名）
- `path=<path>` — 从vault根开始的确切路径，例如`folder/note.md`

## vault定位

默认情况下，命令针对最近关注的vault。使用 `vault=<name>` 作为第一个参数来定位特定的vault：

```bash
obsidian vault="My Vault" search query="test"
```

## 常见模式

```bash
obsidian read file="My Note"
obsidian create name="New Note" content="# Hello" template="Template" silent
obsidian append file="My Note" content="New line"
obsidian search query="search term" limit=10
obsidian daily:read
obsidian daily:append content="- [ ] New task"
obsidian property:set name="status" value="done" file="My Note"
obsidian tasks daily todo
obsidian tags sort=count counts
obsidian backlinks file="My Note"
```

在任何命令上使用 `--copy` 将输出复制到剪贴板。使用 `silent` 阻止文件打开。在列表命令上使用 `total` 来获取计数。

## 插件开发

### 开发/测试周期

对插件或主题进行代码更改后，请遵循以下工作流程：

1. **重新加载**插件以获取更改：
   ```bash
   obsidian plugin:reload id=my-plugin
   ```
2. **检查错误** — 如果出现错误，请修复并从步骤 1 开始重复：
   ```bash
   obsidian dev:errors
   ```
3. **通过屏幕截图或 DOM 检查进行视觉验证**：
   ```bash
   obsidian dev:screenshot path=screenshot.png
   obsidian dev:dom selector=".workspace-leaf" text
   ```
4. **检查控制台输出**是否有警告或意外日志：
   ```bash
   obsidian dev:console level=error
   ```

### 额外的开发者命令

在应用程序上下文中运行 JavaScript：

```bash
obsidian eval code="app.vault.getFiles().length"
```

检查 CSS 值：

```bash
obsidian dev:css selector=".workspace-leaf" prop=background-color
```

切换移动模拟：

```bash
obsidian dev:mobile on
```

运行 `obsidian help` 以查看其他开发者命令，包括 CDP 和调试器控件。
