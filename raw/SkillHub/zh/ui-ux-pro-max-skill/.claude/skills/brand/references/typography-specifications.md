# 排版规范

定义和实施品牌排版的指南。

## 字体堆栈结构

### 主要字体
```css
/* Headings - Display font for impact */
--font-heading: 'Inter', system-ui, -apple-system, sans-serif;

/* Body - Readable for long-form content */
--font-body: 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace - Code, technical content */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 字体加载
```html
<!-- Google Fonts (recommended) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## 类型规模

### 基础系统
- 基础尺寸：16px (1rem)
- 音阶比：1.25（大三度）

### 尺度定义
|元素|尺寸（雷姆）|尺寸（像素）|重量 |行高|
|---------|------------|-----------|--------|-------------|
|显示| 3.815雷姆| 61 像素 | 700 | 1.1|
| H1 | 3.052雷姆| 49 像素 | 700 | 1.2 | 1.2
| H2 | 2.441雷姆 | 39 像素 | 600 | 1.25 | 1.25
| H3 | 1.953雷姆 | 31 像素 | 600 | 1.3 | 1.3
| H4 | 1.563雷姆 | 25 像素 | 600 | 1.35 | 1.35
| H5 | 1.25雷姆| 20 像素 | 600 | 1.4 | 1.4
|机身大 | 1.125雷姆| 18 像素 | 400 | 1.6 | 1.6
|身体| 1雷姆 | 16 像素 | 400 | 1.5 | 1.5
|小| 0.875雷姆 | 14px | 400 | 1.5 | 1.5
|标题| 0.75雷姆| 12 像素 | 400 | 1.4 | 1.4

### 响应式调整
```css
/* Mobile (< 768px) */
h1 { font-size: 2rem; }    /* 32px */
h2 { font-size: 1.5rem; }  /* 24px */
h3 { font-size: 1.25rem; } /* 20px */
body { font-size: 1rem; }  /* 16px */

/* Desktop (>= 768px) */
h1 { font-size: 3rem; }    /* 48px */
h2 { font-size: 2.25rem; } /* 36px */
h3 { font-size: 1.75rem; } /* 28px */
body { font-size: 1rem; }  /* 16px */
```

## 字体粗细

### 体重秤
|名称 |价值|用途 |
|------|-------|-------|
|常规| 400 |正文、段落 |
|中等| 500 | 500按钮、导航项 |
|半粗体| 600 |副标题、强调 |
|大胆| 700 |标题、CTA |

### 重量配对
- 标题：600-700
- 身体：400
- 链接：500
- 按钮：600

## 行高指南

### 规则
|内容类型 |行高|笔记|
|--------------|-------------|-------|
|标题 | 1.1-1.3|更紧以带来视觉冲击|
|正文 | 1.5-1.6 |最佳可读性 |
|小文字 | 1.4-1.5|稍微紧一点|
|长篇| 1.6-1.75 | Extra comfortable |

## 字母间距

### 指南
|元素|追踪 |价值|
|---------|----------|-------|
|显示|更紧| -0.02em |
|标题 |正常 | 0 |
|身体|正常 | 0 |
|全部大写 |更宽 | 0.05em |
|小型大写字母 |更宽 | 0.1em |

## 段落间距

### 边距
```css
/* Heading spacing */
h1, h2 { margin-top: 2rem; margin-bottom: 1rem; }
h3, h4 { margin-top: 1.5rem; margin-bottom: 0.75rem; }

/* Paragraph spacing */
p { margin-bottom: 1rem; }
p + p { margin-top: 0; }
```

### 最大线长度
- 正文：65-75 个字符（最佳）
- 标题：可以更宽
- 代码块：80-100 个字符

```css
.prose {
  max-width: 65ch;
}
```

## CSS 实现

### 完整变量
```css
:root {
  /* Font Families */
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Tailwind 配置
```javascript
theme: {
  fontFamily: {
    heading: ['Inter', 'system-ui', 'sans-serif'],
    body: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.1' }],
  }
}
```

## 常见字体配对

### 干净、现代
- 标题：国际米兰
身体：国际米兰

### 专业
- 标题：Playfair 展示
- 机身：Source Sans Pro

### 初创公司/技术
- 标题： Poppins
正文：Open Sans

### 社论
- 标题：梅里韦瑟
- 身体：拉托

## 辅助功能

### 最小尺寸
- 正文：最小 16 像素
- 小文本：最小 14 像素，不适用于长内容
- 标题：最小 12 像素，谨慎使用

### 对比度要求
- 背景文字：最小 4.5:1 (AA)
- 大文本 (18px+)：最小 3:1

### 最佳实践
- 长文本请勿全部大写
- 避免对齐文本（使用左对齐）
- 确保足够的行间距
- 不要在小尺寸下使用细重量 (<400)
