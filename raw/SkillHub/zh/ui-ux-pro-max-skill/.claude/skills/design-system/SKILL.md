---
name: ckm:design-system
description: token 架构、组件规格和幻灯片生成。三层标记（原始→语义→组件）、CSS 变量、间距/版式比例、组件规格、战略幻灯片创建。用于设计 token、系统设计、符合品牌要求的演示。
argument-hint: "[component or token]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
---

# 设计系统

token 架构、组件规格、系统设计、幻灯片生成。

## 何时使用

- 设计 token 创建
- 组件状态定义
- CSS变量系统
- 间距/版式比例
- 设计到代码的切换
- Tailwind主题配置
- **幻灯片/演示文稿生成**

## token 架构

负载：`references/token-architecture.md`

### 三层结构

```
Primitive (raw values)
       ↓
Semantic (purpose aliases)
       ↓
Component (component-specific)
```

**示例：**
```css
/* Primitive */
--color-blue-600: #2563EB;

/* Semantic */
--color-primary: var(--color-blue-600);

/* Component */
--button-bg: var(--color-primary);
```

## 快速入门

**生成token：**
```bash
node scripts/generate-tokens.cjs --config tokens.json -o tokens.css
```

**验证使用情况：**
```bash
node scripts/validate-tokens.cjs --dir src/
```

## 参考文献

|主题 |文件|
|-------|------|
|token 架构| `references/token-architecture.md` |
|原始 token | `references/primitive-tokens.md` |
|语义标记| `references/semantic-tokens.md` |
|组件 token | `references/component-tokens.md` |
|组件规格| `references/component-specs.md` |
|状态和变体 | `references/states-and-variants.md` |
|顺风整合 | `references/tailwind-integration.md` |

## 组件规格模式

|物业 |默认 |悬停|活跃|已禁用 |
|----------|---------|-------|--------|----------|
|背景|初级 |原色暗 |原色-深色 |静音|
|文字|白色|白色|白色|静音-fg |
|边境|无 |无 |无 |静音边框 |
|影子| SM |医学博士 |无 |无 |

## 脚本

|脚本 |目的|
|--------|---------|
| `generate-tokens.cjs` |从 JSON token配置生成 CSS |
| `validate-tokens.cjs` |检查代码中的硬编码值 |
| `search-slides.py` | BM25搜索+上下文推荐|
| `slide-token-validator.py` |验证幻灯片 HTML 的token合规性 |
| `fetch-background.py` |从 Pexels/Unsplash 获取图像 |

## 模板

|模板|目的|
|----------|---------|
| `design-tokens-starter.json` |三层结构的入门级 JSON |

## 整合

**使用品牌：** 从品牌颜色/版式中提取基元
**使用 ui-styling：** 组件 token → Tailwind 配置

**技能依赖：**品牌、UI 样式
**主要代理：** ui-ux-designer、frontend-developer

## 滑动系统

使用设计 token + Chart.js + 上下文决策系统进行符合品牌要求的演示。

### 真相来源

|文件|目的|
|------|---------|
| `docs/brand-guidelines.md` |品牌形象、声音、色彩 |
| `assets/design-tokens.json` |标记定义（原语→语义→组件）|
| `assets/design-tokens.css` | CSS 变量（在幻灯片中导入）|
| `assets/css/slide-animations.css` | CSS动画库|

### 幻灯片搜索 (BM25)

```bash
# Basic search (auto-detect domain)
python scripts/search-slides.py "investor pitch"

# Domain-specific search
python scripts/search-slides.py "problem agitation" -d copy
python scripts/search-slides.py "revenue growth" -d chart

# Contextual search (Premium System)
python scripts/search-slides.py "problem slide" --context --position 2 --total 9
python scripts/search-slides.py "cta" --context --position 9 --prev-emotion frustration
```

### 决策系统 CSV

|文件|目的|
|------|---------|
| `data/slide-strategies.csv` | 15 套牌结构 + 情感弧线 + 迷你节拍 |
| `data/slide-layouts.csv` | 25 种布局 + 组件变体 + 动画 |
| `data/slide-layout-logic.csv` | Goal → Layout + break_pattern flag |
| `data/slide-typography.csv` | Content type → Typography scale |
| `data/slide-color-logic.csv` |情感→色彩处理|
| `data/slide-backgrounds.csv` |幻灯片类型 → 图像类别 (Pexels/Unsplash) |
| `data/slide-copy.csv` | 25 copywriting formulas (PAS, AIDA, FAB) |
| `data/slide-charts.csv` | 25 chart types with Chart.js config |

### Contextual Decision Flow

```
1. Parse goal/context
        ↓
2. Search slide-strategies.csv → Get strategy + emotion beats
        ↓
3. For each slide:
   a. Query slide-layout-logic.csv → layout + break_pattern
   b. Query slide-typography.csv → type scale
   c. Query slide-color-logic.csv → color treatment
   d. Query slide-backgrounds.csv → image if needed
   e. Apply animation class from slide-animations.css
        ↓
4. Generate HTML with design tokens
        ↓
5. Validate with slide-token-validator.py
```

### Pattern Breaking (Duarte Sparkline)

高级套牌在参与情绪之间交替：
```
"What Is" (frustration) ↔ "What Could Be" (hope)
```

系统计算 1/3 和 2/3 位置处的模式中断。

### 幻灯片要求

**所有幻灯片必须：**
1. 导入 `assets/design-tokens.css` - 单一事实来源
2.使用CSS变量：`var(--color-primary)`、`var(--slide-bg)`等。
3. Use Chart.js for charts (NOT CSS-only bars)
4. 包括导航（键盘箭头、点击、进度条）
5. 居中对齐内容
6. Focus on persuasion/conversion

### Chart.js 集成

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

<canvas id="revenueChart"></canvas>
<script>
new Chart(document.getElementById('revenueChart'), {
    type: 'line',
    data: {
        labels: ['Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            data: [5, 12, 28, 45],
            borderColor: '#FF6B6B',  // Use brand coral
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true,
            tension: 0.4
        }]
    }
});
</script>
```

### token合规性

```css
/* CORRECT - uses token */
background: var(--slide-bg);
color: var(--color-primary);
font-family: var(--typography-font-heading);

/* WRONG - hardcoded */
background: #0D0D0D;
color: #FF6B6B;
font-family: 'Space Grotesk';
```

### Reference Implementation

Working example with all features:
```
assets/designs/slides/claudekit-pitch-251223.html
```

### 命令

```bash
/slides:create "10-slide investor pitch for ClaudeKit Marketing"
```

## 最佳实践

1. 切勿在组件中使用原始十六进制 - 始终引用标记
2.语义层实现主题切换（亮/暗）
3. 组件 token支持每个组件的定制
4. Use HSL format for opacity control
5. Document every token's purpose
6. **幻灯片必须导入 design-tokens.css 并专门使用 var()**
