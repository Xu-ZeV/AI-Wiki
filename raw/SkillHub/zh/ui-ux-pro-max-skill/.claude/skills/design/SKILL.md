---
name: ckm:design
description: “综合设计技能：品牌标识、设计标记、UI 样式、徽标生成（55 种样式、Gemini AI）、企业形象程序（50 个可交付成果、CIP 模型）、HTML 演示文稿（Chart.js）、横幅设计（22 种样式、社交/广告/网页/打印）、图标设计（15 种样式、SVG、Gemini 3.1 Pro）、社交照片（HTML→屏幕截图、多平台）。操作：设计徽标、创建 CIP、生成模型、构建幻灯片、设计横幅、生成图标、创建社交照片、社交媒体图像、品牌标识、设计系统：Facebook、Twitter、LinkedIn、YouTube、Instagram、Pinterest、TikTok、Threads、Google Ads。”
argument-hint: "[design-type] [context]"
license: MIT
metadata:
  author: claudekit
  version: "2.1.0"
---

# 设计

统一的设计技巧：品牌、token、UI、标志、CIP、幻灯片、横幅、社交照片、图标。

## 何时使用

- 品牌形象、声音、资产
- 设计系统token和规格
- 使用 shadcn/ui + Tailwind 进行 UI 样式设计
- 标志设计和AI生成
- 企业形象计划 (CIP) 可交付成果
- 演示和宣传材料
- 社交媒体、广告、网页、印刷品的横幅设计
- Instagram、Facebook、LinkedIn、Twitter、Pinterest、TikTok 的社交照片

## 子技能路由

|任务|子技能|详情 |
|------|-----------|---------|
|品牌形象、声音、资产| `brand` |外功 |
|token、规范、CSS 变量 | `design-system` |外功 |
| shadcn/ui、Tailwind、代码 | `ui-styling` |外功 |
|标志创建，AI生成|徽标（内置）| `references/logo-design.md` |
| CIP 模型、可交付成果 | CIP（内置）| `references/cip-design.md` |
|演示文稿、融资演讲稿 |幻灯片（内置）| `references/slides.md` |
|横幅、封面、标题 |横幅（内置）| `references/banner-sizes-and-styles.md` |
|社交媒体图片/照片 |社交照片（内置）| `references/social-photos-design.md` |
| SVG 图标，图标集| SVG 图标图标（内置）| `references/icon-design.md` |

## 标志设计（内置）

超过 55 种风格、30 种调色板、25 种行业指南。双子座纳米香蕉型号。

### 徽标：生成设计简介

```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```

### 徽标：搜索样式/颜色/行业

```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "minimalist clean" --domain style
python3 ~/.claude/skills/design/scripts/logo/search.py "tech professional" --domain color
python3 ~/.claude/skills/design/scripts/logo/search.py "healthcare medical" --domain industry
```

### 徽标：使用 AI 生成

**始终**生成具有白色背景的输出徽标图像。

```bash
python3 ~/.claude/skills/design/scripts/logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python3 ~/.claude/skills/design/scripts/logo/generate.py --prompt "coffee shop vintage badge" --style vintage
```

**重要：** 当脚本失败时，尝试直接修复它们。

生成后，**始终**通过 `AskUserQuestion` 询问用户有关 HTML 预览的信息。如果是，则为图库调用 `/ui-ux-pro-max`。

## CIP 设计（内置）

50 多个可交付成果、20 种风格、20 个行业。双子座纳米香蕉（Flash/Pro）。

### CIP：生成简介

```bash
python3 ~/.claude/skills/design/scripts/cip/search.py "tech startup" --cip-brief -b "BrandName"
```

### CIP：搜索域

```bash
python3 ~/.claude/skills/design/scripts/cip/search.py "business card letterhead" --domain deliverable
python3 ~/.claude/skills/design/scripts/cip/search.py "luxury premium elegant" --domain style
python3 ~/.claude/skills/design/scripts/cip/search.py "hospitality hotel" --domain industry
python3 ~/.claude/skills/design/scripts/cip/search.py "office reception" --domain mockup
```

### CIP：生成模型

```bash
# With logo (RECOMMENDED)
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --deliverable "business card" --industry "consulting"

# Full CIP set
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --industry "consulting" --set

# Pro model (4K text)
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo logo.png --deliverable "business card" --model pro

# Without logo
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TechFlow" --deliverable "business card" --no-logo-prompt
```

型号：`flash`（默认，`gemini-2.5-flash-image`）、`pro`（`gemini-3-pro-image-preview`）

### CIP：渲染 HTML 演示文稿

```bash
python3 ~/.claude/skills/design/scripts/cip/render-html.py --brand "TopGroup" --industry "consulting" --images /path/to/cip-output
```

**提示：** 如果不存在徽标，请首先使用上面的徽标设计部分。

## 幻灯片（内置）

使用 Chart.js、设计标记、文案公式进行战略性 HTML 演示。

为创建工作流程加载 `references/slides-create.md`。

### 幻灯片：知识库

|主题 |文件|
|-------|------|
|创作指南| `references/slides-create.md` |
|布局模式| `references/slides-layout-patterns.md` |
| HTML 模板 | `references/slides-html-template.md` |
|文案| `references/slides-copywriting-formulas.md` |
|策略| `references/slides-strategies.md` |

## 横幅设计（内置）

跨社交、广告、网络、印刷的 22 种艺术指导风格。使用 `frontend-design`、`ai-artist`、`ai-multimodal`、`chrome-devtools` 技能。

加载 `references/banner-sizes-and-styles.md` 以获取完整尺寸和款式参考。

### 横幅：工作流程

1. **通过 `AskUserQuestion` 收集需求** — 目的、平台、内容、品牌、风格、数量
2. **研究** — 激活 `ui-ux-pro-max`，浏览 Pinterest 获取参考资料
3. **设计** — 使用 `frontend-design` 创建 HTML/CSS 横幅，使用 `ai-artist`/`ai-multimodal` 生成视觉效果
4. **导出** — 通过 `chrome-devtools` 将屏幕截图导出为精确尺寸的 PNG
5. **呈现** — 并排显示所有选项，迭代反馈

### 横幅：快速尺寸参考

|平台|类型 |尺寸（像素）|
|----------|------|-----------|
|脸书 |封面| 820 x 312 | 820 x 312
|推特/X |标题 | 1500×500 |
|领英 |个人| 1584 x 396 | 1584 x 396
| YouTube |频道艺术| 2560 x 1440 | 2560 x 1440
| Instagram |故事| 1080 x 1920 |
| Instagram |帖子 | 1080×1080|
|谷歌广告 |医学矩形| 300×250|
|网站 |英雄 | 1920 x 600-1080 |

### 横幅：顶级艺术风格

|风格|最适合 |
|-------|----------|
|极简主义 | SaaS、技术 |
|大胆的版式|公告 |
|渐变 |现代品牌|
|基于照片的 |生活方式，电子商务 |
|几何|科技、金融科技 |
|玻璃晶态 | SaaS、应用程序 |
|霓虹灯/赛博朋克 |游戏、活动 |

### 横幅：设计规则

- 安全区：关键内容位于中心 70-80%
- 每个横幅一个 CTA，右下角，最小高度 44 像素
- 最多 2 种字体，最小 16 像素正文，≥32 像素标题
- 广告文字低于 20%（Meta 处罚）
- 打印：300 DPI、CMYK、3-5 毫米出血

## 图标设计（内置）

15个款式，12个类别。 Gemini 3.1 Pro Preview 生成 SVG 文本输出。

### 图标：生成单个图标

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "settings gear" --style outlined
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "shopping cart" --style filled --color "#6366F1"
python3 ~/.claude/skills/design/scripts/icon/generate.py --name "dashboard" --category navigation --style duotone
```

### 图标：生成批次变化

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "cloud upload" --batch 4 --output-dir ./icons
```

### 图标：多尺寸导出

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "user profile" --sizes "16,24,32,48" --output-dir ./icons
```

### 图标：热门样式

|风格|最适合 |
|-------|----------|
|概述| UI 界面、网络应用程序 |
|已满 |移动应用程序、导航栏 |
|双色调 |营销、登陆页面 |
|圆形|友好的应用程序，健康|
|锐利|科技、金融科技、企业 |
|平 |谷歌风格的材料设计|
|渐变|现代品牌、SaaS |

**型号：** `gemini-3.1-pro-preview` — 纯文本输出（SVG 是 XML 文本）。无需图像生成 API。

## 社交照片（内置）

多平台社交形象设计：HTML/CSS→截图导出。使用 `ui-ux-pro-max`、`brand`、`design-system`、`chrome-devtools` 技能。

加载 `references/social-photos-design.md` 了解尺寸、模板和最佳实践。

### 社交照片：工作流程

1. **编排**——TODO任务的`project-management`技能；用于独立工作的并行子代理
2. **分析** — 解析提示：主题、平台、风格、品牌背景、内容元素
3. **构思** — 3-5 个概念，通过 `AskUserQuestion` 呈现
4. **设计** — `/ckm:brand` → `/ckm:design-system` → 随机调用 `/ck:ui-ux-pro-max` 或 `/ck:frontend-design`；每个想法的 HTML × 大小
5. **导出** — `chrome-devtools` 或 Playwright 屏幕截图，精确像素（2x deviceScaleFactor）
6. **验证** — 使用 Chrome MCP 或 `chrome-devtools` 技能目视检查导出的设计；修复布局/样式问题并重新导出
7. **报告** — `plans/reports/` 的设计决策摘要
8. **组织** — 调用 `assets-organizing` 技能对输出文件和报告进行排序

### 社交照片：关键尺寸

|平台|尺寸（像素）|平台|尺寸（像素）|
|----------|-----------|----------|-----------|
| IG 帖子 | 1080×1080 |脸书邮报 | 1200×630 |
| IG故事| 1080×1920 | X 邮报 | 1200×675 |
| IG 轮播 | 1080×1350 |领英 | 1200×627 |
| YT 拇指 | 1280×720 |兴趣 | 1000×1500 |

## 工作流程

### 完整的品牌套餐

1. **徽标** → `scripts/logo/generate.py` → 生成徽标变体
2. **CIP** → `scripts/cip/generate.py --logo ...` → 创建可交付的模型
3. **演示** → 加载 `references/slides-create.md` → 构建宣传材料

### 新设计系统

1. **品牌**（品牌技能）→定义颜色、版式、声音
2. **token**（设计系统技能）→ 创建语义 token层
3. **实现**（ui-styling技巧）→配置Tailwind、shadcn/ui

## 参考文献

|主题 |文件|
|-------|------|
|设计路线| `references/design-routing.md` |
|标志设计指南| `references/logo-design.md` |
|标志风格| `references/logo-style-guide.md` |
|标志颜色| `references/logo-color-psychology.md` |
|标志提示| `references/logo-prompt-engineering.md` |
| CIP 设计指南 | `references/cip-design.md` |
| CIP 可交付成果 | `references/cip-deliverable-guide.md` |
| CIP 样式 | `references/cip-style-guide.md` |
| CIP 提示 | `references/cip-prompt-engineering.md` |
|幻灯片创建 | `references/slides-create.md` |
|幻灯片布局 | `references/slides-layout-patterns.md` |
|幻灯片模板| `references/slides-html-template.md` |
|幻灯片复制| `references/slides-copywriting-formulas.md` |
|幻灯片策略| `references/slides-strategies.md` |
|横幅尺寸和样式| `references/banner-sizes-and-styles.md` |
|社交照片指南| `references/social-photos-design.md` |
|图标设计指南| `references/icon-design.md` |

## 脚本

|脚本 |目的|
|--------|---------|
| `scripts/logo/search.py` |搜索标志风格、颜色、行业|
| `scripts/logo/generate.py` |使用 Gemini AI 生成徽标 |
| `scripts/logo/core.py` | BM25 徽标数据搜索引擎 |
| `scripts/cip/search.py` |搜索 CIP 可交付成果、样式、行业 |
| `scripts/cip/generate.py` |使用 Gemini 生成 CIP 模型 |
| `scripts/cip/render-html.py` |从 CIP 模型渲染 HTML 演示文稿 |
| `scripts/cip/core.py` | CIP 数据的 BM25 搜索引擎 |
| `scripts/icon/generate.py` |使用 Gemini 3.1 Pro 生成 SVG 图标 |

## 设置

```bash
export GEMINI_API_KEY="your-key"  # https://aistudio.google.com/apikey
pip install google-genai pillow
```

## 整合

**外部子技能：**品牌、设计系统、ui风格
**相关技能：** frontend-design、ui-ux-pro-max、ai-multimodal、chrome-devtools
