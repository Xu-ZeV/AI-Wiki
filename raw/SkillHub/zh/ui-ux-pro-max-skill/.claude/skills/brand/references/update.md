更新品牌颜色、版式和风格 - 自动同步到所有设计系统文件。

<参数>$参数</args>

## 概述

该命令系统地更新：
1. `docs/brand-guidelines.md` - 人类可读的品牌文档
2. `assets/design-tokens.json` - token真相来源
3. `assets/design-tokens.css` - 生成的CSS变量

## 工作流程

### 第 1 步：收集品牌意见

使用`AskUserQuestion`收集：

**主题选择：**
- 主题名称（例如“Ocean Professional”、“Electric Creative”、“Forest Calm”）

**主要颜色：**
- 颜色名称（例如“海洋蓝”、“珊瑚色”、“森林绿”）
- 十六进制代码（例如#3B82F6）

**次要颜色：**
- 颜色名称（例如“金琥珀”、“电紫色”）
- 十六进制代码

**强调颜色：**
- 颜色名称（例如“翡翠色”、“霓虹薄荷色”）
- 十六进制代码

**品牌情绪（用于人工智能图像生成）：**
- 情绪关键词（例如“专业、值得信赖、优质”或“大胆、创意、活力”）

### 第 2 步：更新品牌指南

编辑`docs/brand-guidelines.md`：

1. **快速参考表** - 更新颜色名称和十六进制代码
2. **品牌概念部分** - 更新主题名称和描述
3. **调色板部分** - 使用阴影更新主要颜色、次要颜色、强调色
4. **AI图像生成部分** - 更新基本提示、关键词、情绪描述符

### 步骤 3：同步到设计 token

运行同步脚本：
```bash
node .claude/skills/brand/scripts/sync-brand-to-tokens.cjs
```

这将：
- 使用新的颜色名称和值更新 `assets/design-tokens.json`
- 使用正确的 CSS 变量重新生成 `assets/design-tokens.css`

### 步骤 4：验证同步

确认所有文件均已更新：
```bash
# Check brand context extraction
node .claude/skills/brand/scripts/inject-brand-context.cjs --json | head -30

# Check CSS variables
grep "primary" assets/design-tokens.css | head -5
```

### 第 5 步：报告

输出摘要：
- 主题：[名称]
- 主要：[名称]（[十六进制]）
- 次要：[名称]（[十六进制]）
- 重音：[名称]（[十六进制]）
- 更新文件：brand-guidelines.md、design-tokens.json、design-tokens.css

## 文件修改

|文件|目的|
|------|---------|
| `docs/brand-guidelines.md` |人类可读的品牌文档|
| `assets/design-tokens.json` |标记定义（原语→语义→组件）|
| `assets/design-tokens.css` | UI 组件的 CSS 变量 |

## 使用的技能

- `brand` - 品牌背景提取和同步
- `design-system` - token生成

## 示例

```bash
# Interactive mode
/brand:update

# With theme hint
/brand:update "Ocean Professional"

# Quick preset
/brand:update "midnight purple"
```

## 颜色预设

如果用户指定预设名称，请使用以下默认值：

|预设|小学|中学|口音|
|--------|---------|-----------|--------|
|海洋专业| #3B82F6 海洋蓝 | #F59E0B 金琥珀 | #10B981 祖母绿 |
|电动创意| #FF6B6B 珊瑚 | #9B5DE5 电紫色 | #00F5D4 霓虹薄荷 |
|森林平静 | #059669 森林绿 | #92400E 暖棕色 | #FBBF24 阳光 |
|午夜紫 | #7C3AED 紫罗兰 | #EC4899 粉色 | #06B6D4 青色 |
|夕阳温暖| #F97316 橙色 | #DC2626 红色 | #FACC15 黄色 |

## 重要

- **始终同步所有三个文件** - 切勿单独更新brand-guidelines.md
- **验证提取** - 更新后运行inject-brand-context.cjs以确认
- **测试图像生成** - 可选择生成测试图像以验证品牌应用
