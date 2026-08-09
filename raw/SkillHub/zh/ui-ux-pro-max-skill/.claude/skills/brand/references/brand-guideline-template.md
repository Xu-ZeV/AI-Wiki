# 品牌指南模板

使用此模板为任何项目创建全面的品牌指南。

## 文档结构

```markdown
# Brand Guidelines v{X.Y}

## Quick Reference
- **Primary Color:** #XXXXXX
- **Secondary Color:** #XXXXXX
- **Primary Font:** {font-family}
- **Voice:** {3 key traits}

## 1. Color Palette

### Primary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| {Name} | #{hex} | rgb({r},{g},{b}) | Primary brand color, CTAs, headers |
| {Name} | #{hex} | rgb({r},{g},{b}) | Supporting accent |

### Secondary Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| {Name} | #{hex} | rgb({r},{g},{b}) | Secondary elements |
| {Name} | #{hex} | rgb({r},{g},{b}) | Highlights |

### Neutral Palette
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Background | #{hex} | rgb({r},{g},{b}) | Page backgrounds |
| Text Primary | #{hex} | rgb({r},{g},{b}) | Body text |
| Text Secondary | #{hex} | rgb({r},{g},{b}) | Captions, muted text |
| Border | #{hex} | rgb({r},{g},{b}) | Dividers, borders |

### Accessibility
- Text/Background Contrast: {ratio}:1 (WCAG {level})
- CTA Contrast: {ratio}:1
- All interactive elements meet WCAG 2.1 AA

## 2. Typography

### Font Stack
```css
--font-heading: '{Font}', sans-serif;
--font-body: '{Font}', sans-serif;
--font-mono: '{Font}', monospace;
```

### 类型比例
|元素|字体|重量 |尺寸（桌面/移动）|行高|
|---------|------|--------|----------------------|-------------|
| H1 | {字体} | 700 | 48 像素 / 32 像素 | 1.2 | 1.2
| H2 | {字体} | 600 | 36 像素 / 28 像素 | 1.25 | 1.25
| H3 | {字体} | 600 | 28 像素 / 24 像素 | 1.3 | 1.3
| H4 | {字体} | 600 | 24 像素 / 20 像素 | 1.35 | 1.35
|身体| {字体} | 400 | 16 像素 / 16 像素 | 1.5 | 1.5
|小| {字体} | 400 | 14 像素 / 14 像素 | 1.5 | 1.5
|标题| {字体} | 400 | 12 像素 / 12 像素 | 1.4 | 1.4

## 3. 标志使用

### 变体
- **主要：** 带文字标记的完整水平徽标
- **堆叠：** 方形空间的垂直排列
- **图标：** 符号仅适用于网站图标、应用程序图标
- **单色：** 有限调色板的单色

### 清理空间
最小净空间 = 标志标记的高度

### 最小尺寸
- 数字：最小宽度 80 像素
- 打印：最小宽度 25 毫米

### 不该做的事
- 不要旋转或倾斜
- 不要改变认可调色板之外的颜色
- 不要添加效果（阴影、渐变）
- 不要裁剪或修改比例
- 不要放置在繁忙的背景上

## 4. 声音和语气

### 品牌个性
{特征1}：{描述}
{特征2}：{描述}
{特征3}：{描述}

### 语音图表
|特质 |我们是 |我们不是|
|-------|--------|------------|
| {特质} | {描述} | {反描述} |

### 根据上下文语气
|背景 |语气|示例|
|---------|------|---------|
|营销| {音} | “{示例}”|
|支持| {音} | “{示例}”|
|错误消息 | {音} | “{示例}”|
|成功| {音} | “{示例}”|

### 禁止条款
- {术语 1}（原因）
- {术语 2}（原因）

## 5. 图像指南

### 摄影风格
- {照明偏好}
- {主题指南}
- {颜色处理}

### 插图
- 风格：{描述}
- 颜色：仅限品牌调色板
- 行程：{weight}px

### 图标
- 风格：{轮廓/填充/双色调}
- 尺寸：24px 基础网格
- 圆角半径：{value}px
```

## 用法

1.复制上面的模板
2. 填写品牌特定值
3.另存为`docs/brand-guidelines.md`
4. 内容工作流程中的参考

## 可提取字段

脚本可以提取：
- `colors.primary`, `colors.secondary`, `colors.neutral`
- `typography.heading`, `typography.body`
- `voice.traits`, `voice.prohibited`
- `logo.variants`, `logo.minSize`
