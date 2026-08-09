# 布局模式

25 个带有 CSS 结构和动画类的幻灯片布局。

## 按用例选择布局

|布局|使用案例|动画|
|--------|----------|-----------|
|标题幻灯片|开场/第一印象| `animate-fade-up` |
|问题陈述|确立痛点 | `animate-stagger` |
|解决方案概述 |介绍解决方案 | `animate-scale` |
|特征网格|显示功能（3-6 张卡）| `animate-stagger` |
|指标仪表板 |显示 KPI（3-4 个指标）| `animate-stagger-scale` |
|比较表|比较选项 | `animate-fade-up` |
|时间线流程|显示进度 | `animate-stagger` |
|网格团队|介绍人| `animate-stagger` |
|报价推荐|客户认可| `animate-fade-up` |
|两列拆分|比较/对比 | `animate-fade-up` |
|大数字英雄 |单一强大的指标 | `animate-count` |
|产品截图|显示产品UI | `animate-scale` |
|定价卡|当前等级 | `animate-stagger` |
| CTA 结束 |驱动行动| `animate-pulse` |

## CSS 结构

### 标题幻灯片
```css
.slide-title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
```

### 两列拆分
```css
.slide-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: center;
}
@media (max-width: 768px) {
    .slide-split { grid-template-columns: 1fr; gap: 24px; }
}
```

### 特征网格（3 列）
```css
.slide-features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}
@media (max-width: 768px) {
    .slide-features { grid-template-columns: repeat(2, 1fr); gap: 16px; }
}
@media (max-width: 480px) {
    .slide-features { grid-template-columns: 1fr; }
}
```

### 指标仪表板（4 列）
```css
.slide-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}
@media (max-width: 768px) {
    .slide-metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
    .slide-metrics { grid-template-columns: 1fr; }
}
```

## 组件变体

### 卡片样式
|风格| CSS 类 |用于 |
|-------|-----------|---------|
|图标左| `.card-icon-left` |带有图标的功能|
|特色酒吧| `.card-accent-bar` |突出特点|
|公制卡| `.card-metric` |数字/统计 |
|头像卡| `.card-avatar` |团队成员 |
|定价卡 | `.card-pricing` |价格等级 |

### 公制样式
|风格|效果|
|-------|--------|
| `gradient-number` |数字上的渐变文本 |
| `oversized` |超大 (120px+) |
| `sparkline` |小内嵌图表 |
| `funnel-numbers` |转换阶段|

## 视觉治疗

|治疗 |何时使用 |
|-----------|-------------|
| `gradient-glow` |标题幻灯片、CTA |
| `subtle-border` |问题陈述|
| `icon-top` |特征网格|
| `screenshot-shadow` |产品截图|
| `popular-highlight` |定价（比例 1.05）|
| `bg-overlay` |背景图片|
| `contrast-pair` |之前/之后 |
| `logo-grayscale` |客户标志|

## 搜索命令

```bash
# Find layout for specific use
python .claude/skills/design-system/scripts/search-slides.py "metrics dashboard" -d layout

# Contextual recommendation
python .claude/skills/design-system/scripts/search-slides.py "traction slide" \
  --context --position 4 --total 10
```

## 布局决策流程

```
1. What's the slide goal?
   └─> Search layout-logic.csv

2. What emotion should it trigger?
   └─> Search color-logic.csv

3. What's the content type?
   └─> Search typography.csv

4. Should it break pattern?
   └─> Check position (1/3, 2/3) → Use full-bleed
```
