---
name: minimalist-ui
description: 干净的编辑风格界面。温暖的单色调色板、印刷对比、平坦的便当网格、柔和的粉彩。没有渐变，没有沉重的阴影。
---

# 协议：高级实用极简主义 UI 架构师

## 1. 协议概述
名称：高级实用极简主义和编辑 UI
描述：一种先进的前端工程指令，用于生成高度精致、超简约的“文档式”Web 界面，类似于顶级工作空间平台。该协议严格执行高对比度的温暖单色调色板、定制的印刷层次结构、细致的结构性宏观空白、便当网格布局以及带有故意柔和柔和色调的超扁平组件架构。它积极拒绝标准通用 SaaS 设计趋势。

## 2. 绝对负面约束（禁止元素）
AI 必须严格避免以下通用 Web 开发默认设置：
- 请勿使用“Inter”、“Roboto”或“Open Sans”字体。
- 不要使用通用的细线图标库，如“Lucide”、“Feather”或标准“Heroicons”。
- 不要使用 Tailwind 的默认重阴影（例如 `shadow-md`、`shadow-lg`、`shadow-xl`）。阴影必须几乎不存在或高度定制为超漫射和低不透明度（< 0.05）。
- 不要对大型元素或部分使用原色背景（例如，没有亮蓝色、绿色或红色的英雄部分）。
- 请勿使用渐变、霓虹色或 3D 玻璃形态（除了微妙的导航栏模糊之外）。
- 请勿将 `rounded-full`（药丸形状）用于大型容器、卡片或主按钮。
- 请勿在代码、标记、文本内容、标题或替代文本中的任何位置使用表情符号。替换为适当的图标或干净的 SVG 图元。
- 请勿使用“John Doe”、“Acme Corp”或“Lorem Ipsum”等通用占位符名称。使用现实的、上下文相关的内容。
- 不要使用人工智能文案陈词滥调：“提升”、“无缝”、“释放”、“下一代”、“游戏规则改变者”、“深入研究”。写出简单、具体的语言。

## 3. 版式架构
界面必须依靠极端的印刷对比度和优质字体选择来建立编辑感。
- 主要 Sans-Serif（正文、UI、按钮）：使用干净、几何或系统本机字体与字符。目标：`font-family: 'SF Pro Display', 'Geist Sans', 'Helvetica Neue', 'Switzer', sans-serif`。
- 社论衬线（英雄标题和引言）：目标：`font-family: 'Lyon Text', 'Newsreader', 'Playfair Display', 'Instrument Serif', serif`。应用紧跟踪（`letter-spacing: -0.02em` 至 `-0.04em`）和紧线高（`1.1`）。
- 等宽字体（代码、击键、元数据）：目标：`font-family: 'Geist Mono', 'SF Mono', 'JetBrains Mono', monospace`。
- 文本颜色：正文绝不能是绝对黑色 (`#000000`)。使用灰黑色/木炭色（`#111111` 或 `#2F3437`）以及 `1.6` 的大号 `line-height` 以获得易读性。辅助文本应为静音灰色 (`#787774`)。

## 4. 调色板（暖单色+斑点粉彩）
颜色是一种稀缺资源，仅用于语义或微妙的强调。
- 画布/背景：纯白色 `#FFFFFF` 或暖骨/灰白色 `#F7F6F3` / `#FBFBFA`。
- 主表面（卡片）：`#FFFFFF` 或 `#F9F9F8`。
- 结构边框/分隔线：超浅灰色 `#EAEAEA` 或 `rgba(0,0,0,0.06)`。
- 强调颜色：专门使用高度去饱和、褪色的粉彩作为标签、内联代码背景或微妙的图标背景。
- Pale Red: `#FDEBEC` (Text: `#9F2F2D`)
  - Pale Blue: `#E1F3FE` (Text: `#1F6C9F`)
  - Pale Green: `#EDF3EC` (Text: `#346538`)
  - Pale Yellow: `#FBF3DB` (Text: `#956400`)

## 5. 组件规格
- 便当盒功能网格：
  - 利用不对称 CSS 网格布局。
  - 卡必须准确地具有 `border: 1px solid #EAEAEA`。
  - Border-radius must be crisp: `8px` or `12px` maximum.
  - Internal padding must be generous (e.g., `24px` to `40px`).
- 主要号召性用语（按钮）：
  - Solid background `#111111`, text `#FFFFFF`. 
  - Slight border-radius (`4px` to `6px`).没有盒子阴影。 
  - Hover state should be a subtle color shift to `#333333` or a micro-scale `transform: scale(0.98)`.
- 标签和状态徽章：
  - Pill-shaped (`border-radius: 9999px`), very small typography (`text-xs`), uppercase with wide tracking (`letter-spacing: 0.05em`).
  - 背景必须使用定义的柔和粉彩。
- 手风琴（常见问题解答）：
  - 剥去所有容器盒。仅使用 `border-bottom: 1px solid #EAEAEA` 分隔项目。
  - Use a clean, sharp `+` and `-` icon for the toggle state.
- 按键微型UI：
  - Render shortcuts as physical keys using `<kbd>` tags: `border: 1px solid #EAEAEA`, `border-radius: 4px`, `background: #F7F6F3`, using the Monospace font.
- 仿操作系统窗口 Chrome：
  - 模拟软件时，将其包装在一个简约的容器中，该容器的白色顶部栏包含三个浅灰色小圆圈（复制 macOS 窗口控件）。

## 6. 图像和图像指令
- System Icons: Use "Phosphor Icons (Bold or Fill weights)" or "Radix UI Icons" for a technical, slightly thicker-stroke aesthetic.标准化所有图标的笔划宽度。
- 插图：白色背景上的单色、粗糙连续线墨水草图，具有单个偏移几何形状，填充柔和的柔和色彩。
- 摄影：使用高品质、去饱和的暖色调图像。应用微妙的叠加（`opacity: 0.04` 暖纹）将照片混合到单色调色板中。切勿使用饱和度过高的库存照片。当实际资产不可用时，请使用可靠的占位符，例如“https://picsum.photos/seed/{context}/1200/800`”。
- 英雄和章节背景：章节不应该感觉空洞和平淡。使用非常低不透明度的微妙全宽背景图像、柔和的径向光点（`radial-gradient`，`opacity: 0.03` 的暖色调）或最小的几何线条图案来增加深度，而不破坏干净的美感。

## 7. 微妙的动作和微动画
运动应该让人感觉隐形——存在但绝不分散注意力。我们的目标是安静的精致，而不是奇观。
- 滚动条目：元素进入视口时会轻轻淡入。使用 `translateY(12px)` + `opacity: 0` 通过 `600ms` 和 `cubic-bezier(0.16, 1, 0.3, 1)` 进行解析。使用 `IntersectionObserver`，切勿使用 `window.addEventListener('scroll')`。
- 悬停状态：卡片抬起并伴有超微妙的阴影偏移（`box-shadow` 从 `0 0 0` 过渡到 `0 2px 8px rgba(0,0,0,0.04)` 到 `200ms`）。 `:active` 上的按钮响应为 `scale(0.98)`。
- 交错显示：列表和网格项目以级联延迟输入（`animation-delay: calc(var(--index) * 80ms)`）。切勿一次安装所有东西。
- 背景环境运动：可选。一个移动非常缓慢的径向渐变斑点（`animation-duration: 20s+`、`opacity: 0.02-0.04`）在英雄部分后面漂移。必须应用于 `position: fixed; pointer-events: none` 层。切勿在滚动容器上。
- 性能：仅通过 `transform` 和 `opacity` 制作动画。无布局触发属性（`top`、`left`、`width`、`height`）。谨慎使用 `will-change: transform`，并且仅在主动动画元素上使用。

## 8. 执行协议
当负责编写前端代码（HTML、React、Tailwind、Vue）或设计布局时：
1. 首先建立宏空白。在各部分之间使用大量垂直填充（例如，Tailwind 中的 `py-24` 或 `py-32`）。
2.将主要排版内容宽度限制为`max-w-4xl`或`max-w-5xl`。
3. 立即应用自定义印刷层次结构和单色颜色变量。
4. 确保每张卡片、分隔线和边框均严格遵守 `1px solid #EAEAEA` 规则。
5. 为所有主要内容块添加滚动进入动画。
6. 通过图像、环境渐变或微妙的纹理确保部分具有视觉深度 - 没有空的平坦背景。
7. 提供原生反映这种高端、整洁、编辑美感的代码，无需手动调整。
