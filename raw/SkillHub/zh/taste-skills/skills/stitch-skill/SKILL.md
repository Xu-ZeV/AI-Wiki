---
name: stitch-design-taste
description: Google Stitch 的语义设计系统技能。生成代理友好的 DESIGN.md 文件，执行高级、反通用的 UI 标准 - 严格的排版、校准颜色、不对称布局、永久微动和硬件加速性能。
---

# Stitch Design Taste——语义设计系统技巧

## 概述
此技能生成针对 Google Stitch 屏幕生成进行优化的 `DESIGN.md` 文件。它将经过实战考验的防倾斜前端工程指令转化为 Stitch 的原生语义设计语言——描述性的自然语言规则与精确的值相结合，Stitch 的 AI 代理可以解释这些值以生成优质的非通用界面。

生成的 `DESIGN.md` 作为**单一事实来源**，提示 Stitch 生成与精心策划的高自主性设计语言相一致的新屏幕。 Stitch 通过由特定颜色值、排版规范和组件行为支持的“视觉描述”来解释设计。

## 先决条件
- 通过 [labs.google.com/stitch](https://labs.google.com/stitch) 访问 Google Stitch
- 可选：Stitch MCP 服务器，用于与 Cursor、Antigravity 或 Gemini CLI 进行编程集成

## 目标
生成 `DESIGN.md` 文件，该文件编码：
1. **视觉氛围**——情绪、密度和设计理念
2. **颜色校准** — 中性色、强调色和带有十六进制代码的禁止图案
3. **版式架构** — 字体堆栈、比例层次结构和反模式
4. **组件行为** — 按钮、卡片、具有交互状态的输入
5. **布局原则**——网格系统、间距哲学、响应策略
6. **运动哲学** — 动画引擎规格、弹簧物理、永久微交互
7. **反模式**——被禁止的人工智能设计陈词滥调的明确列表

## 分析与综合说明

### 1. 定义氛围
评估目标项目的意图。使用口味范围内的令人回味的形容词：
- **密度：** “艺术画廊通风” (1–3) → “每日应用平衡” (4–7) → “驾驶舱密集” (8–10)
- **方差：**“可预测对称”(1–3) →“偏移不对称”(4–7) →“艺术混乱”(8–10)
- **运动：**“静态约束”(1–3) →“流体 CSS”(4–7) →“电影编排”(8–10)

默认基线：方差 8、运动 6、密度 4。根据用户的氛围描述动态调整。

### 2. 映射调色板
对于每种颜色，提供：**描述性名称** + **十六进制代码** + **功能角色**。

**强制约束：**
- 最多 1 种强调色。饱和度低于80%
- “AI 紫色/蓝色霓虹灯”美学被严格禁止 - 没有紫色按钮发光，没有霓虹灯渐变
- 使用绝对中性Bases（锌/板岩）和高对比度单一口音
- 整个输出坚持一个调色板 - 无暖/冷灰色波动
- 切勿使用纯黑色 (`#000000`) — 使用 Off-Black、Zinc-950 或木炭

### 3. 建立版式规则
- **显示/标题：** 轨道紧密，控制规模。没有尖叫。通过重量和颜色来体现层次结构，而不仅仅是巨大的尺寸
- **正文：** 宽松的行距，每行最多 65 个字符
- **字体选择：** `Inter` 被禁止用于高级/创意环境。强制唯一字符：`Geist`、`Outfit`、`Cabinet Grotesk` 或 `Satoshi`
- **衬线禁令：** 禁止通用衬线字体（`Times New Roman`、`Georgia`、`Garamond`、`Palatino`）。如果编辑/创意上下文需要衬线，请仅使用独特的现代衬线：`Fraunces`、`Gambarino`、`Editorial New` 或 `Instrument Serif`。 Serif 在仪表板或软件 UI 中始终被禁止
- **仪表板限制：** 仅使用 Sans-Serif 配对（`Geist` + `Geist Mono` 或 `Satoshi` + `JetBrains Mono`）
- **高密度覆盖：** 当密度超过 7 时，所有数字必须使用等宽字体

### 4. 定义英雄部分
英雄是第一印象，必须有创意、引人注目，而且绝不是通用的：
- **内联图像排版：**直接在标题中的单词或字母之间嵌入小型上下文照片或视觉效果。图像以文字高度内联，呈圆形，充当视觉标点符号。这是标志性的创意技巧
- **禁止重叠：** 文本不得与图像或其他文本重叠。每个元素都占据自己的干净空间区域
- **无填充文本：** “滚动探索”、“向下滑动”、滚动箭头图标、弹跳 V 形符号均被禁止。内容应该自然地吸引用户
- **不对称结构：** 当方差超过 4 时，禁止中心英雄布局
- **CTA 限制：** 最多一个主要 CTA。没有辅助“了解更多”链接

### 5. 描述组件样式
对于每个组件类型，描述形状、颜色、阴影深度和交互行为：
- **按钮：**活动状态下的触觉推送反馈。没有霓虹灯外发光。没有自定义鼠标光标
- **卡片：** 仅在海拔传达层次结构时使用。将阴影着色为背景色调。对于高密度布局，请用边框顶部分隔线或负空间替换卡片
- **输入/表单：** 输入上方的标签，辅助文本可选，下方的错误文本。标准间隙间距
- **加载状态：** 骨架加载器匹配布局尺寸 - 没有通用的圆形旋转器
- **空状态：** 指示如何填充数据的组合
- **错误状态：** 清晰的内联错误报告

### 6. 定义布局原则
- 没有重叠的元素——每个元素都占据自己清晰的空间区域。没有绝对定位的内容堆叠
- 当方差超过 4 时，将禁止居中的英雄部分 — 强制分屏、左对齐或不对称空白
- 通用的“水平 3 张相等的牌”功能行被禁止 — 使用 2 列 Zig-Zag、不对称网格或水平滚动
- CSS 网格优于 Flexbox 数学 — 切勿使用 `calc()` 百分比 hack
- 包含使用最大宽度约束的布局（例如，1400px 居中）
- 全高部分必须使用 `min-h-[100dvh]` — 切勿使用 `h-screen`（iOS Safari 灾难性跳转）

### 7. 定义响应规则
每个设计都必须适用于所有视口：
- **移动优先折叠（< 768px）：** 所有多列布局折叠为单列。无一例外
- **无水平滚动：** 移动设备上的水平溢出是一个严重的故障
- **版式缩放：** 标题缩放通过 `clamp()`。正文最小 `1rem`/`14px`
- **触摸目标：** 所有交互元素最小 `44px` 点击目标
- **图像行为：** 内联排版图像（单词之间的照片）在移动设备上堆叠在标题下方
- **导航：** 桌面水平导航折叠以清理移动菜单
- **间距：** 垂直截面间隙按比例减小 (`clamp(3rem, 8vw, 6rem)`)

### 8. 编码运动哲学
- **弹簧物理默认值：** `stiffness: 100, damping: 20` — 优质、厚重的感觉。没有线性缓动
- **永久微交互：** 每个活动组件都应具有无限循环状态（脉冲、打字机、浮动、闪光）
- **交错编排：**永远不要立即挂载列表 - 使用级联延迟进行瀑布显示
- **性能：** 通过 `transform` 和 `opacity` 独家制作动画。切勿为 `top`、`left`、`width`、`height` 制作动画。仅固定伪元素上的颗粒/噪声过滤器

### 9. 列出反模式（AI 讲述）
在 DESIGN.md 中将这些编码为明确的“NEVER DO”规则：
- 任何地方都没有表情符号
- 没有 `Inter` 字体
- 无通用衬线字体（`Times New Roman`、`Georgia`、`Garamond`）——仅在需要时使用独特的现代衬线字体
- 无纯黑色（`#000000`）
- 无霓虹灯/外发光阴影
- 没有过饱和的口音
- 大标题上没有过多的渐变文本
- 没有自定义鼠标光标
- 没有重叠的元素——始终保持干净的空间分隔
- 没有 3 列相等的卡片布局
- 没有通用名称（“John Doe”、“Acme”、“Nexus”）
- 没有假整数（`99.99%`、`50%`）
- 没有人工智能文案陈词滥调（“提升”、“无缝”、“释放”、“下一代”）
- 无填充 UI 文本：“滚动探索”、“向下滑动”、滚动箭头、弹跳 V 形
- 没有损坏的 Unsplash 链接 — 使用 `picsum.photos` 或 SVG 头像
- 没有居中的英雄部分（对于高方差项目）

## 输出格式（DESIGN.md 结构）

```markdown
# Design System: [Project Title]

## 1. Visual Theme & Atmosphere
(Evocative description of the mood, density, variance, and motion intensity.
Example: "A restrained, gallery-airy interface with confident asymmetric layouts
and fluid spring-physics motion. The atmosphere is clinical yet warm — like a
well-lit architecture studio.")

## 2. Color Palette & Roles
- **Canvas White** (#F9FAFB) — Primary background surface
- **Pure Surface** (#FFFFFF) — Card and container fill
- **Charcoal Ink** (#18181B) — Primary text, Zinc-950 depth
- **Muted Steel** (#71717A) — Secondary text, descriptions, metadata
- **Whisper Border** (rgba(226,232,240,0.5)) — Card borders, 1px structural lines
- **[Accent Name]** (#XXXXXX) — Single accent for CTAs, active states, focus rings
(Max 1 accent. Saturation < 80%. No purple/neon.)

## 3. Typography Rules
- **Display:** [Font Name] — Track-tight, controlled scale, weight-driven hierarchy
- **Body:** [Font Name] — Relaxed leading, 65ch max-width, neutral secondary color
- **Mono:** [Font Name] — For code, metadata, timestamps, high-density numbers
- **Banned:** Inter, generic system fonts for premium contexts. Serif fonts banned in dashboards.

## 4. Component Stylings
* **Buttons:** Flat, no outer glow. Tactile -1px translate on active. Accent fill for primary, ghost/outline for secondary.
* **Cards:** Generously rounded corners (2.5rem). Diffused whisper shadow. Used only when elevation serves hierarchy. High-density: replace with border-top dividers.
* **Inputs:** Label above, error below. Focus ring in accent color. No floating labels.
* **Loaders:** Skeletal shimmer matching exact layout dimensions. No circular spinners.
* **Empty States:** Composed, illustrated compositions — not just "No data" text.

## 5. Layout Principles
(Grid-first responsive architecture. Asymmetric splits for Hero sections.
Strict single-column collapse below 768px. Max-width containment.
No flexbox percentage math. Generous internal padding.)

## 6. Motion & Interaction
(Spring physics for all interactive elements. Staggered cascade reveals.
Perpetual micro-loops on active dashboard components. Hardware-accelerated
transforms only. Isolated Client Components for CPU-heavy animations.)

## 7. Anti-Patterns (Banned)
(Explicit list of forbidden patterns: no emojis, no Inter, no pure black,
no neon glows, no 3-column equal grids, no AI copywriting clichés,
no generic placeholder names, no broken image links.)
```

## 最佳实践
- **具有描述性：** “深木炭墨水 (#18181B)” — 不仅仅是“深色文本”
- **功能性：**解释每个元素的用途
- **保持一致：** 整个文档中使用相同的术语
- **精确：** 包括精确的十六进制代码、rem 值、括号中的像素值
- **坚持己见：** 这不是一个中立的模板 - 它强制执行特定的、优质的美感

## 成功秘诀
1. 从氛围开始——先了解氛围，然后再详细说明标记
2. 寻找模式——确定一致的间距、尺寸和样式
3. 从语义上思考——根据用途命名颜色，而不仅仅是外观
4. 考虑层次结构——记录视觉重量如何传达重要性
5. 对禁令进行编码——反模式与规则本身一样重要

## 要避免的常见陷阱
- 使用技术术语而不进行翻译（“rounded-xl”而不是“慷慨的圆角”）
- 省略十六进制代码或仅使用描述性名称
- 忘记设计元素的功能角色
- 气氛描述过于模糊
- 忽略反模式列表——这些是使输出优质的原因
- 默认使用通用的“安全”设计，而不是强制执行策划的美学
