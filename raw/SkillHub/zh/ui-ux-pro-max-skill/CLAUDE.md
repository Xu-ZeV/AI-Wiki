# 克劳德.md

此文件为 Claude Code (claude.ai/code) 提供使用此存储库中的代码时的指导。

## 项目概述

Antigravity Kit 是一款人工智能驱动的设计智能工具包，提供 UI 样式、调色板、字体配对、图表类型和 UX 指南的可搜索数据库。它作为人工智能编码助手（Claude Code、Windsurf、Cursor 等）的技能/工作流程。

## 搜索命令

```bash
python3 src/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain> [-n <max_results>]
```

**域名搜索：**
- `product` - 产品类型推荐（SaaS、电子商务、产品组合）
- `style` - UI 风格（玻璃形态、极简主义、野蛮主义）+ AI 提示和 CSS 关键字
- `typography` - 与 Google 字体导入的字体配对
- `color` - 按产品类型划分的调色板
- `landing` - 页面结构和 CTA 策略
- `chart` - 图表类型和库推荐
- `ux` - 最佳实践和反模式

**堆栈搜索：**
```bash
python3 src/ui-ux-pro-max/scripts/search.py "<query>" --stack <stack>
```
可用堆栈：`html-tailwind`（默认）、`react`、`nextjs`、`astro`、`vue`、`nuxtjs`、`nuxt-ui`、 `svelte`、`swiftui`、`react-native`、`flutter`、`shadcn`、`jetpack-compose`

## 架构

```
src/ui-ux-pro-max/                # Source of Truth
├── data/                         # Canonical CSV databases
│   ├── products.csv, styles.csv, colors.csv, typography.csv, ...
│   └── stacks/                   # Stack-specific guidelines
├── scripts/
│   ├── search.py                 # CLI entry point
│   ├── core.py                   # BM25 + regex hybrid search engine
│   └── design_system.py          # Design system generation
└── templates/
    ├── base/                     # Base templates (skill-content.md, quick-reference.md)
    └── platforms/                # Platform configs (claude.json, cursor.json, ...)

cli/                              # CLI installer (uipro-cli on npm)
├── src/
│   ├── commands/init.ts          # Install command with template generation
│   └── utils/template.ts         # Template rendering engine
└── assets/                       # Bundled assets (~564KB)
    ├── data/                     # Copy of src/ui-ux-pro-max/data/
    ├── scripts/                  # Copy of src/ui-ux-pro-max/scripts/
    └── templates/                # Copy of src/ui-ux-pro-max/templates/

.claude/skills/ui-ux-pro-max/     # Claude Code skill (symlinks to src/)
.factory/skills/ui-ux-pro-max/   # Droid (Factory) skill (symlinks to src/)
.shared/ui-ux-pro-max/            # Symlink to src/ui-ux-pro-max/
.claude-plugin/                   # Claude Marketplace publishing
```

搜索引擎采用BM25排名结合正则表达式匹配。当省略 `--domain` 时，域自动检测可用。

## 同步规则

**事实来源：** `src/ui-ux-pro-max/`

修改文件时：

1. **数据和脚本** - 在 `src/ui-ux-pro-max/` 中编辑：
   - `data/*.csv` 和 `data/stacks/*.csv`
   - `scripts/*.py`
   - 通过 `.claude/`、`.factory/`、`.shared/` 中的符号链接自动进行更改

2. **模板** - 在`src/ui-ux-pro-max/templates/`中编辑：
   - `base/skill-content.md` - 常见SKILL.md内容
   - `base/quick-reference.md` - 快速参考部分（仅限克劳德）
   - `platforms/*.json` - 特定于平台的配置

3. **CLI 资产** - 发布前运行同步：
   ```bash
   cp -r src/ui-ux-pro-max/data/* cli/assets/data/
   cp -r src/ui-ux-pro-max/scripts/* cli/assets/scripts/
   cp -r src/ui-ux-pro-max/templates/* cli/assets/templates/
   ```

4. **参考文件夹** - 无需手动同步。 CLI 在 `uipro init` 期间从模板生成这些。

## 先决条件

Python 3.x（无需外部依赖）

## Git 工作流程

切勿直接推送至 `main`。总是：

1、新建分支：`git checkout -b feat/...` 或 `fix/...`
2. 提交更改
3.推送分支：`git push -u origin <branch>`
4.创建PR：`gh pr create`
