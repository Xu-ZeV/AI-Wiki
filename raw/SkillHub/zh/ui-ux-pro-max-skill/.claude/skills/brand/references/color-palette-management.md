# 调色板管理

定义、提取和实施品牌颜色的指南。

## 色彩系统结构

### 层次结构
```
Primary Colors (1-2)
├── Main brand color - Used for CTAs, headers, key elements
└── Supporting primary - Secondary emphasis

Secondary Colors (2-3)
├── Accent colors - Highlights, interactive states
└── Supporting visuals - Icons, illustrations

Neutral Palette (3-5)
├── Background colors - Page, card, modal backgrounds
├── Text colors - Headings, body, muted text
└── UI elements - Borders, dividers, shadows

Semantic Colors (4)
├── Success - #22C55E (green)
├── Warning - #F59E0B (amber)
├── Error - #EF4444 (red)
└── Info - #3B82F6 (blue)
```

## 颜色文档格式

### Markdown表
```markdown
| Name | Hex | RGB | HSL | Usage |
|------|-----|-----|-----|-------|
| Primary Blue | #2563EB | rgb(37,99,235) | hsl(217,91%,53%) | CTAs, links |
```

### CSS 变量
```css
:root {
  /* Primary */
  --color-primary: #2563EB;
  --color-primary-light: #3B82F6;
  --color-primary-dark: #1D4ED8;

  /* Secondary */
  --color-secondary: #8B5CF6;
  --color-accent: #F59E0B;

  /* Neutral */
  --color-background: #FFFFFF;
  --color-surface: #F9FAFB;
  --color-text-primary: #111827;
  --color-text-secondary: #6B7280;
  --color-border: #E5E7EB;
}
```

### Tailwind 配置
```javascript
colors: {
  primary: {
    DEFAULT: '#2563EB',
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
  }
}
```

## 辅助功能要求

### 对比度 (WCAG 2.1)
|水平|普通文本 |大文本|UI组件 |
|-------|-------------|------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | 4.5:1 |

### 检查对比度
```javascript
// Formula for relative luminance
function luminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

## 颜色提取

### 来自图像
使用 `extract-colors.cjs` 脚本来：
1.加载图像文件
2.使用k-means聚类提取主色
3.映射到最接近的品牌颜色
4. 报告合规百分比

### 来自品牌指南
解析 markdown 来提取：
- Hex values from tables
- CSS变量定义
- 颜色名称和用途说明

## 品牌合规性验证

### 规则
1. **原色比例**：设计的60-70%
2. **次色比例**：设计的20-30%
3. **强调色比例**：设计的5-10%
4. **非品牌容差**：最多 20% 的非调色板颜色

### 验证输出
```json
{
  "compliance": 85,
  "colors": {
    "brand": ["#2563EB", "#8B5CF6", "#FFFFFF"],
    "offBrand": ["#FF5500"],
    "dominant": "#2563EB"
  },
  "issues": [
    "Off-brand color #FF5500 detected (15% coverage)",
    "Primary color underused (45% vs 60% target)"
  ]
}
```

## 颜色使用指南

### 要做的事
- 使用主要作为主要 CTA 和关键元素
- 保持一致的悬停/活动状态
- 测试所有组合的可访问性
- 记录颜色决定

### Don'ts
- 单组分使用超过 2-3 种颜色
- 无意中混合暖色调和冷色调
- 使用纯黑色 (#000) 表示文本（使用 #111 或类似颜色）
- 仅依靠颜色来表达含义（也使用图标/文本）

## 调色板示例

### 技术/SaaS
```
Primary: #2563EB (Blue)
Secondary: #8B5CF6 (Purple)
Accent: #10B981 (Emerald)
Background: #F9FAFB
Text: #111827
```

### 营销/创意
```
Primary: #F97316 (Orange)
Secondary: #EC4899 (Pink)
Accent: #14B8A6 (Teal)
Background: #FFFFFF
Text: #1F2937
```

### 专业/企业
```
Primary: #1E40AF (Navy)
Secondary: #475569 (Slate)
Accent: #0EA5E9 (Sky)
Background: #F8FAFC
Text: #0F172A
```

## 工具和资源

- [Coolors](https://coolors.co) - 调色板生成
- [WebAIM 对比度检查器](https://webaim.org/resources/contrastchecker/)
- [顺风颜色参考](https://tailwindcss.com/docs/customizing-colors)
- [Color Hunt](https://colorhunt.co) - 精选调色板
