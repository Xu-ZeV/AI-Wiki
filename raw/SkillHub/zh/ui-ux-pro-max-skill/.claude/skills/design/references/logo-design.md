# 标志设计参考

由 AI 驱动的徽标设计，具有 55 多种样式、30 种调色板、25 份行业指南。使用 Gemini Nano Banana 模型。

## 脚本

|脚本 |目的|
|--------|---------|
| `scripts/logo/search.py` |搜索款式、颜色、行业；生成设计概要|
| `scripts/logo/generate.py` |使用 Gemini Nano Banana 生成徽标 |
| `scripts/logo/core.py` | BM25 徽标数据搜索引擎 |

## 命令

### 设计简介（从这里开始）

```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```

### 搜索域

```bash
# Styles
python3 ~/.claude/skills/design/scripts/logo/search.py "minimalist clean" --domain style

# Color palettes
python3 ~/.claude/skills/design/scripts/logo/search.py "tech professional" --domain color

# Industry guidelines
python3 ~/.claude/skills/design/scripts/logo/search.py "healthcare medical" --domain industry
```

### 生成徽标

**始终**使用白色背景作为输出徽标。

```bash
python3 ~/.claude/skills/design/scripts/logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python3 ~/.claude/skills/design/scripts/logo/generate.py --prompt "coffee shop vintage badge" --style vintage
```

选项：`--style`、`--industry`、`--prompt`

## 可用样式

|类别 |风格 |
|----------|--------|
|一般|极简、文字标记、字母标记、图形标记、抽象标记、吉祥物、徽章、组合标记 |
|审美 |复古/复古、装饰艺术、豪华、俏皮、企业、有机、霓虹灯、垃圾、水彩 |
|现代|渐变、平面设计、3D/等距、几何、线条艺术、双色调、动态 |
|聪明|负空间、单线、分割/碎片、响应式/自适应 |

## 色彩心理学

|颜色 |心理学 |最适合 |
|-------|------------|----------|
|蓝色|信任、稳定 |金融、科技、医疗保健 |
|绿色|自然生长 |生态、健康、有机 |
|红色|活力、激情|美食、运动、娱乐 |
|黄金|奢华、优质 |时装、珠宝、酒店 |
|紫色|创意、创新|美丽、创意、科技 |

## 行业默认值

|工业|风格|颜色 |版式|
|----------|-------|--------|------------|
|科技 |极简主义，抽象|蓝色、紫色、渐变|几何 sans |
|医疗保健 |专业，线条艺术|蓝色、绿色、青色|清洁无 |
|金融|企业、徽章|海军蓝、金色 | Serif 或 clean sans |
|食品|复古徽章、吉祥物|暖红色、橙色|友好，脚本|
|时尚 |文字商标，奢华|黑、金、白|优雅的衬线|

## 工作流程

1. 生成设计概要 → `scripts/logo/search.py --design-brief`
2. 生成徽标变体 → `scripts/logo/generate.py --brand --style --industry`
3. 询问用户 HTML 预览 → `AskUserQuestion` 工具
4. 如果是，则为 HTML 库调用 `/ui-ux-pro-max`

## 详细参考资料

- `references/logo-style-guide.md` - 详细的款式描述
- `references/logo-color-psychology.md` - 颜色含义和组合
- `references/logo-prompt-engineering.md` - AI生成提示

## 设置

```bash
export GEMINI_API_KEY="your-key"
pip install google-genai
```
