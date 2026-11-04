---
name: ui-template-library
description: UI 模板库（UI Template Library）——收纳经过生产实战检验的高性能、高质感前端 UI 控件与交互模板库。包含：① 玻璃倾斜画板（鼠标驱动 3D 视差与切片拼图倾斜，单文件零依赖）；② 南瓜助手胶囊导航栏与导航按钮（磁吸底色滑块 Glider、图标 360° 微动效旋转、常态完整展开与吸顶折叠让位互斥动效）；③ 南瓜助手磨砂流光搜索框（双层径向渐变底边呼吸扫光、解耦主题令牌 --gs-*、清空按钮联动与输入防抖）；④ 列表卡片悬停跟随阴影与氛围光晕（高斯弥散无界光晕、Damped Lerp 物理滞后滑行追随、卡片内鼠标微视差追踪）。当需要引入高质感交互控件、复制生产级模板代码、或使用中文提示词生成/重构前端控件时使用。
---

# UI 模板库 (UI Template Library)

收纳经过生产环境实战检验的高保真、高性能前端 UI 控件与交互模板。拒绝粗糙模板感与性能掉帧，所有控件均遵循硬件加速、物理阻尼缓动、无障碍适配（WCAG 2.1 AA / 44px 触控区）与严格的性能守卫。

## 控件索引与适用场景

| 控件名称 | 核心特征 | 典型适用场景 | 模板与关键资源 |
|---|---|---|---|
| **控件一：玻璃倾斜画板** | 鼠标驱动 3D 视差、多切片拼图倾斜、点击空白切图、纯 transform 零掉帧 | 作品集封面、图片画板、沉浸式 3D 交互页面、展厅画廊 | `assets/glass-board-template.html`<br>`scripts/verify-glass-board.mjs` |
| **控件二：胶囊导航栏与导航按钮** | 弹性磁吸底色滑块（Glider）、360° 弹性微动效旋转、吸顶折叠与悬停互斥让位 | 系统顶部主导航、移动端自适应应用栏、后台工作台菜单 | `assets/nav-capsule/nav_capsule.css`<br>`assets/nav-capsule/nav_capsule.js` |
| **控件三：磨砂流光搜索框** | 底边双层径向渐变呼吸扫光、解耦设计令牌（`--gs-*`）、内置清空按钮联动 | 页面主搜索栏、浮动收纳搜索条、筛选与关键词检索 | `assets/glass-search/glass_search.css`<br>`assets/glass-search/glass_search.js` |
| **控件四：列表卡片悬停跟随阴影与光晕** | 高斯弥散无界光晕（`filter: blur(18px)`）、Damped Lerp 物理滞后滑行追随、卡片内鼠标微视差追踪 | 业务列表页（会议/任务/订单）、卡片式看板、交互式卡片组 | `assets/card-hover-halo/card_hover_halo.css`<br>`assets/card-hover-halo/card_hover_halo.js` |

---

## 控件一：玻璃倾斜画板 (Glass Panel Tilt Board)

目标：一组玻璃面板拼成一幅大图，整块跟着指针倾斜；点击右侧/底部空白处切换下一张。交付物是直接双击打开的单文件 HTML 页面（`file://` 可用），无需构建工具与打包服务器。

### 1. 中文提示词模板 (Prompt Template)

```text
请帮我制作一个基于单文件 HTML 的玻璃倾斜画板（Glass Panel Tilt Board）交互页面：
1. 界面与交互：几十块玻璃面板拼接成一幅大图，指针移动时所有面板跟随鼠标产生 3D 倾斜与层次视差，相邻面板带有轻微棋盘格交错前后景深；点击右侧或底部空白区切到下一张图。
2. 性能铁律（严禁违背）：
   - 倾斜仅修改 transform（translate3d/rotateX/rotateY/scale），严禁改动 top/left/width/height/margin；
   - 严禁对运动面板使用 backdrop-filter（避免每帧全屏重绘掉帧），玻璃质感纯靠渐变高光与 inset 阴影伪造；
   - 虚化模糊 filter: blur() 仅能挂在静止的背景 ambient 层；
   - 切片拼图坐标对齐严禁使用 getBoundingClientRect()，必须基于 offsetLeft/offsetTop 计算；
   - 指针事件写入必须在 requestAnimationFrame 中批量提交，一帧只写一次；
   - 面板数量严格控制在 24~30 块。
3. 交付要求：提供包含完整 CSS 与原生 JavaScript 的独立单文件 HTML，可直接在浏览器中双击运行。
```

### 2. 适用与不适用场景

* **适用**：
  * 「玻璃面板 / 玻璃卡片阵列跟随鼠标倾斜」「鼠标驱动的视差 / 3D 倾斜」「整块画板随指针转动」；
  * 「点击空白处切下一张」的图片画板，图片取自本地文件夹；
  * 几十个元素同时做鼠标驱动的 `transform` 动画，且对 60fps 帧率敏感。
* **不适用**：
  * 普通业务表单/卡片开发，或只要纯静态的玻璃拟态卡片样式；
  * 单张卡片的 hover 倾斜（几行 CSS 即可，无需套用复杂拼图模型）；
  * 真实 3D 复杂光影与三维网格（应采用 Three.js 方案）。

### 3. 核心性能不变量（优先于所有视觉决定）

1. **倾斜只改 `transform`**：只写 `translate3d` / `rotateX` / `rotateY` / `scale`。每个 `transform` 保留 3D 分量，确保浏览器提升到合成层（Compositor Layer）。
2. **严禁 `backdrop-filter`**：25+ 个面板各带一层 backdrop-filter 会导致每帧全屏 GPU 重算。必须改用「渐变 + inset 高光/暗边阴影」伪造玻璃质感。
3. **虚化只给静止的背景层**：一张带 `filter: blur()` 的 `.ambient` 层，仅在换图时更新一次并被合成器缓存。
4. **切片对齐用 `offsetLeft` / `offsetTop`**：每块切片包含全尺寸图，在内层以 `translate3d(-offsetLeft, -offsetTop, 0)` 抵消。严禁用 `getBoundingClientRect()` 测量，否则会被正在执行的倾斜/翻转动画污染。
5. **一帧只写一次**：`pointermove` 仅记录归一化坐标，写入统一交由 `requestAnimationFrame` 批量执行。
6. **面板总数控制在 24~30 块**：按图片宽高比动态计算行列（`cols/rows` 各夹在 3~7），避免格子拉伸变形。

### 4. 倾斜数学模型

```javascript
// sx, sy: 指针相对舞台中心的归一化偏移 (各夹在 ±1.5)
// lx, ly: 指针相对该面板中心的局部偏移 (各夹在 ±1)
const rx = clamp((-sy * 3.4 - ly * 2.3) * k, -10, 10); // X轴旋转 (deg)
const ry = clamp(( sx * 4.2 + lx * 2.9) * k, -10, 10); // Y轴旋转 (deg)
const z  = checker * (2 + 9 * amt) * k;                // 棋盘格交错前后深度 (px)
const s  = 1 + 0.006 * amt;                            // 轻微呼吸放大系数
```
* `k`：每块面板确定的 0.82~1.18 抖动系数（通过确定性哈希计算），避免整块画板刚体运动；
* `checker`：`(row + col) % 2 ? -1 : 1`，相邻面板交替前后错落；
* `amt`：指针离舞台中心的相对距离比例（0~1）。

### 5. 关键样式代码

```css
/* 免 backdrop-filter 高性能玻璃切片 */
.mosaic {
    position: relative;
    display: grid;
    perspective: 1200px;
    transform-style: preserve-3d;
}

.tile {
    position: relative;
    overflow: hidden;
    transform-origin: center center;
    will-change: transform;
}

.tilt {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    will-change: transform;
    /* 伪造玻璃质感：细高光边框 + 内嵌高光与暗边阴影 */
    border: 1px solid rgba(255, 255, 255, 0.28);
    box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.45),
                inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25),
                0 12px 24px -4px rgba(0, 0, 0, 0.35);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%);
}

.slice {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--img-w);
    height: var(--img-h);
    background-image: var(--img);
    background-size: cover;
    background-repeat: no-repeat;
    pointer-events: none;
    transform: translate3d(var(--offset-x), var(--offset-y), 0);
    will-change: transform;
}
```

---

## 控件二：南瓜助手胶囊导航栏与导航按钮 (Capsule Navigation Bar & Items)

目标：构建生产级、高质感的自适应胶囊导航栏与导航按钮组件（源自南瓜会议助手实战标准）。实现未吸顶时的完整展开与磁吸滑块动效，以及吸顶滚动后的正圆折叠、悬停展开与互斥让位机制。

### 1. 中文提示词模板 (Prompt Template)

```text
请帮我实现一个高质感、高性能的胶囊导航栏与导航按钮组件（南瓜助手风格）：
1. 布局结构：
   - 顶部导航栏，包含居中的水平弹性胶囊容器；左侧包含吸顶折叠返回按钮（←）；
   - 导航按钮支持通用业务菜单项（例如：大厅、会议列表、纪要列表、任务列表、声音管理、设置）；
   - 当前激活项呈现浅橙色药丸胶囊高亮（带微阴影与细边框），非激活项为低饱和度文字与图标。
2. 交互与核心动效规范：
   - 弹性磁吸底色滑块（Glider）：容器内置绝对定位的底色指示器，在未吸顶常态下点击或切换菜单时，底色滑块带有物理阻尼惯性从原位置平滑滑动到目标菜单项（平滑延迟感），目标菜单项图标触发 360° 微弹性顺时针旋转微交互；
   - 严格对称绝对居中：无论按钮文字是 2 个字（如“大厅”）还是 4 个字（如“任务列表”），图标 + 文字在胶囊内部必须作为一个整体严格水平垂直居中，杜绝视觉重心偏心；
   - 吸顶折叠与悬停互斥让位：页面未滚动时为常态完整展开；页面向下滚动吸顶（.is-scrolled）时，非激活项平滑收缩为 38×38px 正圆图标按钮，仅当前激活项保持胶囊展开；当鼠标悬浮非激活项时，悬浮项从中心向两侧缓慢展开露出文字，原激活项互斥收缩为 38px 正圆；鼠标移出后自动复原。
3. 性能与响应式（基于 ui-ux-pro-max 规范）：
   - 全部动画基于 transform / opacity 硬件加速，使用 offsetLeft/offsetWidth 计算位置，严禁布局抖动；
   - 桌面端高度 38px，移动端（<=768px）自适应缩小至 34px，满足无障碍触控标准；
   - 严格支持 @media (prefers-reduced-motion: reduce) 降级消除过渡。
4. 交付要求：提供完整的 CSS/SCSS 样式、HTML/QWeb 模板结构以及客户端轻量驱动 JavaScript。
```

### 2. 关键样式代码 (Key CSS)

```css
:root {
    --nav-capsule-primary: #ea580c;
    --nav-capsule-bg-hover: #fff7ed;
    --nav-capsule-bg-active: rgba(251, 146, 60, 0.22);
    --nav-capsule-border-active: rgba(251, 146, 60, 0.4);
    --nav-capsule-border-hover: rgba(251, 146, 60, 0.32);
    --nav-capsule-shadow-active: 0 1px 3px rgba(234, 88, 12, 0.16);
    --nav-capsule-text-color: #475569;
    --nav-capsule-text-hover: #ea580c;
    --nav-capsule-ease: cubic-bezier(0.25, 1, 0.3, 1);
    --nav-capsule-spring: cubic-bezier(0.34, 1.25, 0.64, 1);
}

.app-nav.common-nav-capsule-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    user-select: none;
}

.nav-capsule-glider {
    position: absolute;
    top: 0;
    left: 0;
    height: 38px;
    border-radius: 9999px;
    background: var(--nav-capsule-bg-active);
    border: 1px solid var(--nav-capsule-border-active);
    box-shadow: var(--nav-capsule-shadow-active);
    pointer-events: none;
    z-index: 0;
    opacity: 0;
    transform-origin: center center;
    transition: transform 0.4s var(--nav-capsule-ease),
                width 0.38s var(--nav-capsule-ease),
                opacity 0.22s ease;
    will-change: transform, width, opacity;
}

.common-nav-capsule {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    min-height: 38px;
    padding: 6px 14px;
    border-radius: 9999px !important;
    border: 1px solid transparent;
    color: var(--nav-capsule-text-color);
    background-color: transparent;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    line-height: 1;
    position: relative;
    z-index: 1;
    overflow: hidden;
    box-sizing: border-box;
    cursor: pointer;
    transform-origin: center center;
    transition: width 0.62s var(--nav-capsule-ease),
                padding 0.62s var(--nav-capsule-ease),
                color 0.25s ease;
}

.common-nav-capsule .nav-capsule-inner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    margin: 0 auto;
    position: relative;
    pointer-events: none;
    transform-origin: center center;
}

.common-nav-capsule .nav-capsule-icon,
.common-nav-capsule svg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    stroke-width: 2;
    flex-shrink: 0;
    transform-origin: center center;
    transition: transform 0.65s var(--nav-capsule-spring), color 0.25s ease;
}

.common-nav-capsule:hover svg,
.common-nav-capsule.active svg {
    transform: rotate(360deg);
}

.common-nav-capsule .nav-capsule-text {
    display: inline-block;
    max-width: 260px;
    opacity: 1;
    margin-left: 6px;
    overflow: hidden;
    white-space: nowrap;
    transition: max-width 0.58s var(--nav-capsule-ease),
                opacity 0.4s var(--nav-capsule-ease),
                margin-left 0.45s var(--nav-capsule-ease);
}

.app-header.is-scrolled .common-nav-capsule:not(.active) {
    width: 38px;
    padding: 0;
    border-radius: 50% !important;
}
.app-header.is-scrolled .common-nav-capsule:not(.active) .nav-capsule-text {
    max-width: 0;
    opacity: 0;
    margin-left: 0;
}

.app-header.is-scrolled .common-nav-capsule.active {
    background: var(--nav-capsule-bg-active);
    border-color: var(--nav-capsule-border-active);
    color: var(--nav-capsule-primary);
}

@media (hover: hover) and (pointer: fine) {
    .app-header.is-scrolled .app-nav:has(.common-nav-capsule:not(.active):hover) .common-nav-capsule.active {
        width: 38px !important;
        padding: 0 !important;
        background: transparent !important;
        border-color: transparent !important;
    }
    .app-header.is-scrolled .app-nav:has(.common-nav-capsule:not(.active):hover) .common-nav-capsule.active .nav-capsule-text {
        max-width: 0 !important;
        opacity: 0 !important;
        margin-left: 0 !important;
    }
    .app-header.is-scrolled .common-nav-capsule:not(.active):hover {
        width: 108px !important;
        padding: 6px 14px !important;
        border-radius: 9999px !important;
        background: var(--nav-capsule-bg-hover) !important;
        border-color: var(--nav-capsule-border-hover) !important;
    }
    .app-header.is-scrolled .common-nav-capsule:not(.active):hover .nav-capsule-text {
        max-width: 64px !important;
        opacity: 1 !important;
        margin-left: 6px !important;
        color: var(--nav-capsule-primary);
    }
}
```

---

## 控件三：南瓜助手磨砂流光搜索框 (Glassmorphism Ambient Beam Search Bar)

目标：构建生产级、半透明磨砂质感的高保真搜索框组件（源自南瓜会议助手搜索交互）。实现全胶囊药丸造型、双层径向渐变底边呼吸扫光、解耦设计令牌（`--gs-*`）以及优雅的清空按钮联动与输入防抖。

### 1. 中文提示词模板 (Prompt Template)

```text
请帮我实现一个高质感、高性能的磨砂流光搜索框组件（南瓜助手风格）：
1. 布局与形态：
   - 全胶囊药丸造型（高度 44px，border-radius: 9999px，最大宽度 680px 水平居中），半透明白色微磨砂背景（backdrop-filter: blur(14px)），带有极细微内嵌描边（box-shadow: inset 0 0 0 1px ...）；
   - 左侧内嵌 18×18px 矢量放大镜图标（南瓜橙色 #ea580c，距左侧 14px）；
   - 中间为无系统边框、无系统聚焦轮廓的原生搜索输入框，字体大小 14px，占位文本为“搜索会议标题或关键词...”；
   - 右侧配置 44×44px 正圆触控清空按钮（内部带有 22×22px 圆形浅底色面），有内容时平滑淡入露出，无内容时隐藏。
2. 核心视觉微交互（底边流光）：
   - 底边环境流光（Ambient Light Beam）：利用 ::before 伪元素叠加双层径向渐变（核心细光束 + 外层漫反射柔光晕），在底边从左向右平滑呼吸摆动（周期约 3.6s）；
   - 交互响应：鼠标悬停（:hover）时光晕透明度提升并加速摆动；输入聚焦（:focus-within）时光晕达最大亮度，外层微光环绕（focus-shadow）；
3. 架构与主题解耦：
   - 结构与颜色完全解耦，使用 CSS 变量令牌（--gs-accent, --gs-beam-core, --gs-glow-*, --gs-surface, --gs-border 等）控制色彩，通过 .nangua-search-theme 类名一键换肤；
   - 输入框支持原生白名单函数回调（data-input-callback 与 data-clear-callback）；
   - 严格支持 @media (prefers-reduced-motion: reduce) 降级消除过渡。
4. 交付要求：提供完整的 CSS 变量体系、样式代码、HTML/QWeb 模板以及原生轻量驱动 JavaScript。
```

### 2. 关键样式代码 (CSS)

```css
.glass-search-container {
    --gs-accent: #ea580c;
    --gs-beam-core: #ea580c;
    --gs-beam-edge: rgba(234, 88, 12, 0.75);
    --gs-glow-strong: rgba(234, 88, 12, 0.42);
    --gs-glow-mid: rgba(251, 146, 60, 0.22);
    --gs-glow-tail: rgba(251, 146, 60, 0.05);
    --gs-border: rgba(226, 232, 240, 0.75);
    --gs-border-hover: rgba(226, 232, 240, 0.95);
    --gs-border-focus: rgba(234, 88, 12, 0.24);
    --gs-surface: rgba(255, 255, 255, 0.82);
    --gs-surface-hover: rgba(255, 255, 255, 0.92);
    --gs-surface-focus: rgba(255, 255, 255, 0.98);
    --gs-text: #0f172a;
    --gs-placeholder: rgba(148, 163, 184, 0.85);
    --gs-placeholder-focus: rgba(148, 163, 184, 0.50);
    --gs-clear-bg: rgba(234, 88, 12, 0.12);
    --gs-clear-hover-bg: rgba(234, 88, 12, 0.25);
    --gs-clear-text: #ea580c;
    --gs-clear-hover-text: #c2410c;
    --gs-focus-shadow: 0 0 0 3px rgba(234, 88, 12, 0.10);
    --gs-search-shadow: 0 2px 10px -2px rgba(15, 23, 42, 0.07);
    --gs-search-shadow-focus: 0 6px 20px -2px rgba(234, 88, 12, 0.18);
    --gs-duration: 0.2s;

    display: flex;
    justify-content: center;
    width: 100%;
    margin: 16px 0 20px;
}

.glass-search-bar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 680px;
    height: 44px;
    border-radius: 9999px;
    background: var(--gs-surface);
    box-shadow: inset 0 0 0 1px var(--gs-border), var(--gs-search-shadow);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    transition: background-color var(--gs-duration) ease, box-shadow var(--gs-duration) ease;
}

/* 底边双层径向渐变流光呼吸扫动 */
.glass-search-bar::before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    z-index: 2;
    width: 280px;
    height: 24px;
    background:
        radial-gradient(ellipse 110px 4px at 50% 100%, var(--gs-beam-core) 0%, var(--gs-beam-edge) 45%, transparent 100%),
        radial-gradient(ellipse 140px 24px at 50% 100%, var(--gs-glow-strong) 0%, var(--gs-glow-mid) 40%, var(--gs-glow-tail) 75%, transparent 100%);
    filter: blur(1.5px);
    opacity: 0.65;
    pointer-events: none;
    transform: translateX(-50%);
    animation: glass-search-peak-sweep 3.6s ease-in-out infinite alternate;
    transition: opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1), animation-duration 0.32s ease;
}

.glass-search-bar:hover::before { opacity: 0.90; animation-duration: 2.6s; }
.glass-search-bar:focus-within::before { opacity: 1; animation-duration: 2.0s; }

@keyframes glass-search-peak-sweep {
    0% { transform: translateX(calc(-50% - 100px)) scaleX(0.92); }
    50% { transform: translateX(-50%) scaleX(1.08); }
    100% { transform: translateX(calc(-50% + 100px)) scaleX(0.92); }
}
```

---

## 控件四：南瓜助手列表卡片悬停跟随阴影与氛围光晕 (Card Hover Follower Halo & Atmospheric Shadow)

目标：构建生产级、极富质感与悬浮空间感的**卡片悬停面板阴影跟随动效**（源自南瓜助手会议卡片与待办列表实战标准）。彻底去除生硬边框与机械切换，实现单实例高斯弥散无界光晕、Damped Lerp 物理滞后滑行以及卡片内部鼠标微视差动态追踪。

### 1. 中文提示词模板 (Prompt Template)

```text
请帮我实现一个高质感、高性能的列表卡片悬停跟随阴影与氛围光晕效果（南瓜助手风格）：
1. 界面与视觉表现：
   - 垂直卡片列表容器（每张卡片为白底、16px 圆角、细微边框与极轻基础微阴影）；
   - 当鼠标悬停在某张卡片上时，卡片背后投射出一层温和暖橙色高斯弥散氛围光晕（Atmospheric Warm Glow），伴随立体复合投影；
   - 弥散无界化：光晕必须具有高斯模糊（filter: blur(18px)），完全消隐边界，杜绝任何生硬轮廓线；材质采用中心径向渐变温和消退（rgba(234, 88, 12, 0.35) -> 透明）。
2. 物理动效核心机制（Damped Lerp + Micro-Parallax）：
   - 单实例容器共享：列表容器内部仅挂载一个跟随光晕节点（.card-hover-halo，置于底层 z-index: 1，卡片置于上层 z-index: 2），无论列表有多少项，绝不重复生成多余 DOM；
   - 物理滞后追随与滑行动感：基于 requestAnimationFrame 结合阻尼插值引擎（DAMPING = 0.11），当鼠标在相邻卡片之间滑动切换时，光晕带有真实物理质量与惯性，从上一张卡片平滑滑行、伸缩形变并追随到新卡片背后；
   - 卡片内鼠标微视差位移：当鼠标在卡片内部移动时，光晕根据鼠标相对卡片中心的偏移产生微幅视差位移（mxOffset = (mouseX - centerX) * 0.05），营造逼真的立体悬浮感；
   - 优雅进出场：首次进入直接就位淡入（消除历史远方穿帮飘入），鼠标离开容器后透明度平滑衰减至 0。
3. 性能守卫与兼容性：
   - 全程仅操作 transform: translate3d(x, y, 0)、width、height 与 opacity，由 GPU 合成层驱动；
   - 在移动端或无指针触控设备（@media (hover: none)）下完全禁用，弹窗打开时阻断重排计算。
4. 交付要求：提供完整的 CSS 样式、HTML 列表结构以及轻量原生 JavaScript 物理阻尼控制器。
```

### 2. 界面视觉特征与四大核心交互机制

1. **单实例高斯弥散无界光晕**：
   容器内部仅维护一个 `.nangua-card-hover-halo` 节点，外扩 14px 垫在纯白卡片底层；通过 `filter: blur(18px)` + 径向渐变消隐（`radial-gradient(ellipse at center, rgba(234, 88, 12, 0.35) 0%, ..., transparent 100%)`），完全消除机械边界。
2. **Inertia Damped Lerp 物理滞后滑行**：
   插值计算公式：`curr += (target - curr) * 0.11`。鼠标在不同高度或长宽的卡片间切换时，光晕表现出丝滑的几何形变与位移滞后，呈现如丝缎般的滑行质感。
3. **卡片内微视差悬浮追踪 (Micro-Parallax)**：
   鼠标在卡片内游走时，`mxOffset = (mouseX - centerX) * 0.05`，实时带动光晕做细微反向或同向视差移动，让卡片看起来悬浮在发光表面之上。
4. **初态防穿帮与离开衰减**：
   若当前处于隐藏态（`currOpacity < 0.03`），瞬间同步目标坐标，避免光晕从屏幕外的遥远历史坐标横穿飞入；离开后透明度平滑衰减归零（`OPACITY_DAMPING = 0.15`）。

### 3. 关键样式代码 (CSS)

```css
/* 列表容器 */
.card-list-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* 核心跟随光晕节点（容器内单实例共享，位于卡片底层） */
.card-hover-halo,
.nangua-card-hover-halo {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    border: none !important;
    outline: none !important;
    /* 核心特性：高斯弥散无界化，彻底羽化边缘 */
    filter: blur(18px);
    -webkit-filter: blur(18px);
    /* 核心材质：径向渐变温和消隐 + 暖橙与柔光氛围弥散 */
    background: radial-gradient(
        ellipse at center,
        rgba(234, 88, 12, 0.35) 0%,
        rgba(251, 146, 60, 0.22) 50%,
        rgba(254, 215, 170, 0.12) 80%,
        rgba(255, 255, 255, 0) 100%
    );
    box-shadow: 0 16px 38px 2px rgba(234, 88, 12, 0.18),
                0 6px 20px -2px rgba(15, 23, 42, 0.08);
    will-change: transform, width, height, opacity;
    transform-origin: center center;
}

/* 列表卡片本体：置于光晕上层，具备基础悬浮抬升与边框过渡 */
.list-card,
.meeting-card,
.summary-card,
.card {
    position: relative;
    z-index: 2;
    background: #ffffff;
    border: 1px solid rgba(226, 232, 240, 0.85);
    border-radius: 16px;
    padding: 18px 20px;
    box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04);
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
                border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-card:hover,
.meeting-card:hover,
.summary-card:hover,
.card:hover {
    border-color: rgba(203, 213, 225, 1);
    box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
}

/* 无指针触控设备降级 */
@media (hover: none) {
    .card-hover-halo,
    .nangua-card-hover-halo {
        display: none !important;
    }
}
```

### 4. 关键 HTML 模板结构代码

```html
<div class="card-list-container" id="meetingList">
    <!-- 跟随光晕节点 (也可由 JS 自动动态创建注入到第一项前) -->
    <div class="card-hover-halo" aria-hidden="true"></div>

    <!-- 卡片 1 (悬停时背后投射柔和暖橙光晕) -->
    <div class="list-card meeting-card">
        <div class="card-header">
            <h3 class="card-title">南瓜交接</h3>
            <span class="card-meta">2026-11-03 11:09</span>
        </div>
        <div class="card-body">
            <p>会议录音、会议纪要与编辑选项...</p>
        </div>
    </div>

    <!-- 卡片 2 -->
    <div class="list-card meeting-card">
        <div class="card-header">
            <h3 class="card-title">无标题进行中</h3>
            <span class="card-meta">2026-11-03 11:08</span>
        </div>
    </div>
</div>
```

### 5. 关键客户端驱动 JavaScript 代码 (物理阻尼控制器)

```javascript
(function (window, document) {
    'use strict';

    if (!window || !document || (window.matchMedia && window.matchMedia('(hover: none)').matches)) {
        return;
    }

    const CARD_SELECTOR = '.list-card, .meeting-card, .summary-card, .card';
    const containerStates = new Map();

    // 物理惯性阻尼系数：0.11 赋予阴影显著的高级物理滞后追随与滑行质感
    const DAMPING = 0.11;
    const OPACITY_DAMPING = 0.15;

    function getContainerState(container) {
        let state = containerStates.get(container);
        if (!state) {
            const cPos = window.getComputedStyle(container).position;
            if (cPos === 'static') {
                container.style.position = 'relative';
            }

            let halo = container.querySelector(':scope > .card-hover-halo, :scope > .nangua-card-hover-halo');
            if (!halo) {
                halo = document.createElement('div');
                halo.className = 'card-hover-halo';
                halo.setAttribute('aria-hidden', 'true');
                container.prepend(halo);
            }

            state = {
                container, halo,
                currX: 0, currY: 0, currW: 0, currH: 0, currRadius: 16, currOpacity: 0,
                targetX: 0, targetY: 0, targetW: 0, targetH: 0, targetRadius: 16, targetOpacity: 0,
                rafId: null, activeCard: null
            };
            containerStates.set(container, state);
        } else if (!container.contains(state.halo)) {
            container.prepend(state.halo);
        }
        return state;
    }

    function stepAnimation(state) {
        if (!state.container.contains(state.halo)) {
            state.container.prepend(state.halo);
        }
        const dx = state.targetX - state.currX;
        const dy = state.targetY - state.currY;
        const dw = state.targetW - state.currW;
        const dh = state.targetH - state.currH;
        const dr = state.targetRadius - state.currRadius;
        const dop = state.targetOpacity - state.currOpacity;

        const isMoving = Math.abs(dx) > 0.08 || Math.abs(dy) > 0.08 ||
                         Math.abs(dw) > 0.08 || Math.abs(dh) > 0.08 ||
                         Math.abs(dop) > 0.003;

        if (isMoving) {
            state.currX += dx * DAMPING;
            state.currY += dy * DAMPING;
            state.currW += dw * DAMPING;
            state.currH += dh * DAMPING;
            state.currRadius += dr * DAMPING;
            state.currOpacity += dop * OPACITY_DAMPING;

            state.halo.style.transform = `translate3d(${state.currX.toFixed(2)}px, ${state.currY.toFixed(2)}px, 0)`;
            state.halo.style.width = `${state.currW.toFixed(2)}px`;
            state.halo.style.height = `${state.currH.toFixed(2)}px`;
            state.halo.style.borderRadius = `${state.currRadius.toFixed(1)}px`;
            state.halo.style.opacity = state.currOpacity.toFixed(3);

            state.rafId = requestAnimationFrame(() => stepAnimation(state));
        } else {
            state.currX = state.targetX;
            state.currY = state.targetY;
            state.currW = state.targetW;
            state.currH = state.targetH;
            state.currRadius = state.targetRadius;
            state.currOpacity = state.targetOpacity;

            state.halo.style.transform = `translate3d(${state.currX.toFixed(2)}px, ${state.currY.toFixed(2)}px, 0)`;
            state.halo.style.width = `${state.currW.toFixed(2)}px`;
            state.halo.style.height = `${state.currH.toFixed(2)}px`;
            state.halo.style.borderRadius = `${state.currRadius.toFixed(1)}px`;
            state.halo.style.opacity = state.currOpacity.toFixed(3);

            if (state.currOpacity <= 0.005) {
                state.halo.style.opacity = '0';
            }
            state.rafId = null;
        }
    }

    function triggerLoop(state) {
        if (!state.rafId) {
            state.rafId = requestAnimationFrame(() => stepAnimation(state));
        }
    }

    function updateHalo(card, mouseX, mouseY) {
        const container = card.parentElement;
        if (!container) return;

        const state = getContainerState(container);
        state.activeCard = card;

        const cRect = container.getBoundingClientRect();
        const r = card.getBoundingClientRect();
        const offset = 14; // 外扩 14px，确保光晕在纯白卡片背后充分透出

        // 卡片内微视差位移追踪 (Micro-Parallax)
        let mxOffset = 0, myOffset = 0;
        if (typeof mouseX === 'number' && typeof mouseY === 'number') {
            const centerX = r.left + r.width / 2;
            const centerY = r.top + r.height / 2;
            mxOffset = (mouseX - centerX) * 0.05;
            myOffset = (mouseY - centerY) * 0.05;
        }

        const cardRadius = parseInt(window.getComputedStyle(card).borderRadius, 10) || 16;

        state.targetX = r.left - cRect.left + container.scrollLeft - offset + mxOffset;
        state.targetY = r.top - cRect.top + container.scrollTop - offset + myOffset;
        state.targetW = r.width + offset * 2;
        state.targetH = r.height + offset * 2;
        state.targetRadius = cardRadius + offset;
        state.targetOpacity = 1;

        // 若初次进入，立即对准目标位置淡入，消除从远方飘来的穿帮动画
        if (state.currOpacity < 0.03) {
            state.currX = state.targetX;
            state.currY = state.targetY;
            state.currW = state.targetW;
            state.currH = state.targetH;
            state.currRadius = state.targetRadius;
        }

        triggerLoop(state);
    }

    function handlePointerMove(e) {
        if (document.body.classList.contains('modal-open')) return;
        let el = e.target;
        while (el && el !== document.body) {
            if (el.matches && el.matches(CARD_SELECTOR)) {
                updateHalo(el, e.clientX, e.clientY);
                break;
            }
            el = el.parentElement;
        }
    }

    function handlePointerLeave(e) {
        containerStates.forEach(state => {
            state.activeCard = null;
            state.targetOpacity = 0;
            triggerLoop(state);
        });
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave, { passive: true });
})(window, document);
```

---

## 质量与扩展标准

1. **新增控件流程**：
   - 在本 Skill 中追加子章节，明确定义：**控件名称**、**中文提示词模板**、**适用与不适用边界**、**关键样式代码**及**测试验收脚本**；
   - 复杂独立模板建议将完整演示文件存放于 `assets/<component-slug>/` 目录下。
2. **性能与规范守卫**：
   - 必须通过 `skill-creator/scripts/quick_validate.py` 验证；
   - 动效必须满足 60fps 硬件加速要求，杜绝使用 `top/left` 与重排高开销属性；
   - 严格遵循 `ui-ux-pro-max` 的移动端触控标准与无障碍规范。