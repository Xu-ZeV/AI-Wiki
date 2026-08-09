# 社交照片设计指南

通过 HTML/CSS 渲染 + 屏幕截图导出来设计社交媒体图像。协调 `ui-ux-pro-max`、`brand`、`design-system` 和 `chrome-devtools` 技能。

## 平台尺寸

|平台|类型 |尺寸（像素）|方面|
|----------|------|-----------|--------|
| Instagram |帖子 | 1080×1080| 1:1 |
| Instagram |故事/卷轴 | 1080 x 1920 | 9:16 |
| Instagram |旋转木马| 1080 x 1350 | 1080 x 1350 4:5 |
|脸书 |帖子 | 1200×630 | 〜1.9：1 |
|脸书 |故事| 1080 x 1920 | 9:16 |
|推特/X |帖子 | 1200 x 675 | 1200 x 675 16:9 | 16:9
|推特/X |卡| 800×418 | ~1.91:1 |
|领英 |帖子 | 1200 x 627 | 1200 x 627 ~1.91:1 |
|领英 |文章| 1200 x 644 | 1200 x 644 ~1.86:1 |
|兴趣 |针 | 1000×1500 | 2:3 |
| YouTube |缩略图| 1280×720 | 16:9 | 16:9
|抖音 |封面| 1080 x 1920 | 9:16 |
|主题 |帖子 | 1080×1080| 1:1 |

## 工作流程

### 第 1 步：激活项目管理

调用 `project-management` 技能通过 Claude 的本机任务编排创建持久 TODO 任务。分解为：
- 需求分析任务
- 创意生成任务
- HTML 设计任务 - 可以按尺寸/变体并行化
- 屏幕截图导出任务 - 可以并行化每个文件
- 报告生成任务

为独立任务生成并行子代理（例如，不同大小的多个 HTML 文件）。

### 第 2 步：分析需求

解析用户输入：
- **主题/主题** — 社交照片代表什么
- **目标平台** — 需要哪些尺寸（默认：Instagram Post 1:1 + Story 9:16）
- **视觉风格** — 简约、大胆、渐变、基于照片等。
- **品牌背景** — 从 `docs/brand-guidelines.md` 读取（如果存在）
- **内容元素** — 标题、潜台词、CTA、图像、图标
- **数量** — 有多少种变化（默认值：3）

### 第 3 步：产生想法

创建 3-5 个概念创意：
- 匹配输入提示/要求
- 考虑特定于平台的最佳实践
- 构图、颜色、排版方法各不相同
- 符合品牌指南（如果有）

在设计前通过 `AskUserQuestion` 向用户展示想法以获得批准。

### 步骤 4：设计 HTML 文件

按顺序激活这些技能：

1. **`/ckm:brand`** — 从用户项目中提取品牌颜色、字体、声音
2. **`/ckm:design-system`** — 获取设计标记（间距、版式比例、调色板）
3. **随机调用以下之一：** `/ck:ui-ux-pro-max` 或 `/ck:frontend-design` — 用于布局、层次结构、视觉平衡。每次运行时随机选择一个，以实现设计多样性。

对于每个已批准的想法 + 每个目标尺寸，创建一个 HTML 文件：

```
output/social-photos/
├── idea-1-instagram-post-1080x1080.html
├── idea-1-instagram-story-1080x1920.html
├── idea-2-instagram-post-1080x1080.html
├── idea-2-instagram-story-1080x1920.html
└── ...
```

#### HTML 设计规则

- **视口** — 设置与目标尺寸匹配的精确像素尺寸
- **独立** — 内联所有 CSS，通过 Google Fonts CDN 嵌入字体
- **无滚动** — 一切都适合一个视口
- **高对比度** — 缩略图大小的文本可读
- **品牌对齐** — 使用提取的品牌颜色/字体
- **安全区** — 中央 80% 区域内的关键内容
- **排版** — 标题最小 24 像素，正文最小 16 像素，宽度为 1080 像素
- **视觉层次**——一个焦点，清晰的阅读流程

#### HTML 模板结构

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width={WIDTH}, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family={FONT}&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: {WIDTH}px;
      height: {HEIGHT}px;
      overflow: hidden;
      font-family: '{FONT}', sans-serif;
    }
    .canvas {
      width: {WIDTH}px;
      height: {HEIGHT}px;
      position: relative;
      /* Background: gradient, solid, or image */
    }
    /* Design tokens from brand/design-system */
  </style>
</head>
<body>
  <div class="canvas">
    <!-- Content layers -->
  </div>
</body>
</html>
```

### 步骤 5：截图导出

使用 Chrome headless、`chrome-devtools` 技能或 Playwright/Puppeteer 来捕获精确尺寸的屏幕截图。

**重要提示：** 在页面加载后始终添加延迟（3-5 秒），以便字体/图像在捕获之前完全呈现。

#### 选项 A：Chrome Headless CLI（推荐 - 零依赖）

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DELAY=5  # seconds for fonts/images to load

"$CHROME" \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --hide-scrollbars \
  --window-size="${WIDTH},${HEIGHT}" \
  --virtual-time-budget=$((DELAY * 1000)) \
  --screenshot="output.png" \
  "file:///path/to/file.html"
```

关键标志：
- `--virtual-time-budget=5000` — 等待 5 秒虚拟时间以加载资源（Google 字体、图像）
- `--hide-scrollbars` — 防止屏幕截图中出现滚动条伪影
- `--window-size=WxH` — 设置精确的像素尺寸

#### 选项 B：chrome-devtools 技能

调用 `/chrome-devtools` 并附上指令：
1. 在浏览器中打开每个 HTML 文件
2. 将视口设置为精确的目标尺寸
3.等待3-5秒让字体/图像完全加载
4. 截图整页为PNG
5.保存到`output/social-photos/exports/`

#### 选项 C：剧作家剧本

```javascript
const { chromium } = require('playwright');

async function captureScreenshots(htmlFiles) {
  const browser = await chromium.launch();

  for (const file of htmlFiles) {
    const [width, height] = file.match(/(\d+)x(\d+)/).slice(1).map(Number);

    const page = await browser.newPage();
    await page.setViewportSize({ width, height });
    await page.goto(`file://${file}`, { waitUntil: 'networkidle' });
    // Wait for fonts/images to fully render
    await page.waitForTimeout(3000);

    const outputPath = file.replace('.html', '.png').replace('social-photos/', 'social-photos/exports/');
    await page.screenshot({ path: outputPath, type: 'png' });
    await page.close();
  }

  await browser.close();
}
```

#### 选项 D：Puppeteer 脚本

```javascript
const puppeteer = require('puppeteer');

async function captureScreenshots(htmlFiles) {
  const browser = await puppeteer.launch();

  for (const file of htmlFiles) {
    const [width, height] = file.match(/(\d+)x(\d+)/).slice(1).map(Number);

    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 2 }); // 2x for retina
    await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
    // Wait for fonts/images to fully render
    await new Promise(r => setTimeout(r, 3000));

    const outputPath = file.replace('.html', '.png').replace('social-photos/', 'social-photos/exports/');
    await page.screenshot({ path: outputPath, type: 'png' });
    await page.close();
  }

  await browser.close();
}
```

**重要提示：** 使用 `deviceScaleFactor: 2` 获得视网膜质量输出（仅限 Puppeteer）。

### 第 6 步：验证和修复设计

使用 Chrome MCP 或 `chrome-devtools` 技能直观地检查每个导出的 PNG：

1. 打开导出的屏幕截图并检查布局/样式问题
2. 验证：字体渲染正确、颜色与品牌匹配、文本在缩略图大小下可读
3.检查：无溢出、无截断内容、尊重安全区、视觉层次清晰
4. 如果发现问题→修复HTML源→重新导出截图→再次验证
5. 重复直到所有设计都通过视觉质量检查

**需要检查的常见问题：**
- 字体未加载（回退到系统字体）
- 文本溢出或剪切
- 安全区外的元素（中央 80%）
- 低对比度文本（低于 WCAG AA 4.5:1）
- 元素未对齐或布局损坏

### 第 7 步：生成摘要报告

使用会话挂钩中的命名模式将报告保存到 `plans/reports/`。

报告结构：

```markdown
# Social Photos Design Report

## Overview
- Prompt/requirements: {original input}
- Platforms: {target platforms}
- Variations: {count}
- Style: {chosen style}

## Ideas Generated
1. **{Idea name}** — {brief description, rationale}
2. ...

## Design Decisions
- Color palette: {colors used, why}
- Typography: {fonts, sizes, why}
- Layout: {composition approach, why}
- Brand alignment: {how brand guidelines influenced design}

## Output Files
| File | Size | Platform | Preview |
|------|------|----------|---------|
| exports/{filename}.png | {WxH} | {platform} | {description} |

## Why This Works
- {Platform-specific reasoning}
- {Brand alignment reasoning}
- {Visual hierarchy reasoning}
- {Engagement potential reasoning}

## Recommendations
- {A/B test suggestions}
- {Platform-specific tips}
- {Iteration opportunities}
```

### 步骤 8：组织输出

调用 `assets-organizing` 技能来组织所有输出文件和报告：
- 将导出的 PNG 移动/复制到正确的资源目录
- 确保报告位于 `plans/reports/` 中且命名正确
- 如果需要，清理中间 HTML 文件
- 使用元数据标记输出（平台、大小、概念名称）

## 设计最佳实践

### 特定于平台的提示

- **Instagram** — 视觉优先、最少的文字 (<20%)、强烈的色彩、生活方式的感觉
- **Facebook** — 信息丰富，可以有更多文字，提要中引人注目
- **Twitter/X** — 粗体标题、暗/亮模式对比、清晰的消息
- **LinkedIn** — 专业、简洁、数据驱动的视觉效果、思想领导力
- **Pinterest** — 垂直格式、图像上的文本叠加、操作方法样式
- **YouTube** — 面部特写效果最佳，颜色鲜艳，小尺寸下可读
- **TikTok** — 时尚、活力、排版大胆、年轻化

### 艺术指导风格（从横幅中重复使用）

|风格|最适合 |关键要素|
|-------|----------|--------------|
|极简主义 | SaaS、科技、奢侈品 |空白、单一强调色、干净类型 |
|大胆的版式|公告、报价 |大字体、高对比度、极简图像 |
|渐变网格|现代品牌、应用程序 |流体颜色过渡、浮动元素 |
|基于照片的 |生活方式、电子商务 |英雄图像、微妙的叠加、图像上的文字 |
|几何|科技、金融科技 |形状、图案、结构化布局|
|玻璃晶态 | SaaS、现代应用程序 |磨砂玻璃、模糊效果、透明度|
|平面插图|教育、健康|定制插画，亲切、平易近人|
|双色调 |创意、社论 |照片的双色处理 |
|拼贴|时尚、文化|混合媒体，重叠元素|
| 3D/等距 |技术、产品 |深度、阴影、现代视角 |

### 颜色和对比度

- 确保所有文本的 WCAG AA 对比度（4.5:1 分钟）
- 以 50% 尺寸测试设计以验证可读性
- 考虑平台暗/亮模式兼容性
- 使用品牌原色作为主导色，次要颜色作为强调色

### 版式层次结构

|元素|最小尺寸（1080 像素）|重量 |
|---------|---------------------|--------|
|标题| 48 像素 |粗体/黑色|
|副标题| 32 像素 |半粗体|
|身体| 24 像素 |常规|
|标题| 18 像素 |常规/浅色|
|美国消费者协会 | 28 像素 |大胆|

## 安全性和范围

该子技能仅处理社交媒体图像设计。不处理：
- 视频内容创作
- 动画/动态图形
- 打印制作文件（CMYK、出血）
- 直接社交媒体发布/安排
- AI图像生成（使用`ai-artist`技能）
