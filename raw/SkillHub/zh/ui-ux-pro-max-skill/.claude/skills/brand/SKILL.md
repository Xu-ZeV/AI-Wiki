---
name: ckm:brand
description: 品牌声音、视觉识别、消息传递框架、资产管理、品牌一致性。激活品牌内容、语气、营销资产、品牌合规性、风格指南。
argument-hint: "[update|review|create] [args]"
metadata:
  author: claudekit
  version: "1.0.0"
---

# 品牌

品牌标识、声音、消息传递、资产管理和一致性框架。

## 何时使用

- 品牌声音定义和内容语气指导
- 视觉识别标准和风格指南的制定
- 消息传递框架创建
- 品牌一致性审查和审核
- 资产组织、命名和审批
- 调色板管理和排版规范

## 快速入门

**将品牌背景注入提示中：**
```bash
node scripts/inject-brand-context.cjs
node scripts/inject-brand-context.cjs --json
```

**验证资产：**
```bash
node scripts/validate-asset.cjs <asset-path>
```

**提取/比较颜色：**
```bash
node scripts/extract-colors.cjs --palette
node scripts/extract-colors.cjs <image-path>
```

## 品牌同步工作流程

```bash
# 1. Edit docs/brand-guidelines.md (or use /brand update)
# 2. Sync to design tokens
node scripts/sync-brand-to-tokens.cjs
# 3. Verify
node scripts/inject-brand-context.cjs --json | head -20
```

**已同步文件：**
- `docs/brand-guidelines.md` → 真相来源
- `assets/design-tokens.json` → token定义
- `assets/design-tokens.css` → CSS 变量

## 子命令

|子命令 |描述 |参考|
|------------|-------------|-----------|
| `update` |更新品牌标识并同步到所有设计系统 | `references/update.md` |

## 参考文献

|主题 |文件|
|-------|------|
|语音框架| `references/voice-framework.md` |
|视觉识别| `references/visual-identity.md` |
|消息 | `references/messaging-framework.md` |
|一致性| `references/consistency-checklist.md` |
|指南模板| `references/brand-guideline-template.md` |
|资产组织| `references/asset-organization.md` |
|色彩管理| `references/color-palette-management.md` |
|版式| `references/typography-specifications.md` |
|标志使用| `references/logo-usage-rules.md` |
|批准清单| `references/approval-checklist.md` |

## 脚本

|脚本 |目的|
|--------|---------|
| `scripts/inject-brand-context.cjs` |提取品牌背景以进行快速注入 |
| `scripts/sync-brand-to-tokens.cjs` |同步brand-guidelines.md → design-tokens.json/css |
| `scripts/validate-asset.cjs` |验证资产命名、大小、格式 |
| `scripts/extract-colors.cjs` |提取颜色并将其与调色板进行比较 |

## 模板

|模板|目的|
|----------|---------|
| `templates/brand-guidelines-starter.md` |新品牌的完整入门模板 |

## 路由

1.从`$ARGUMENTS`（第一个字）解析子命令
2.加载对应的`references/{subcommand}.md`
3. 使用剩余参数执行
