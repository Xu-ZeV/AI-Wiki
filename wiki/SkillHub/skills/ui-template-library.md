---
title: UI 模板库
skill: ui-template-library
category: 高级前端 UI 设计与重构
category_slug: frontend-ui-design
source: raw/SkillHub/categories/frontend-ui-design/ui-template-library/SKILL.md
tags:
  - SKILL
  - SKILL/frontend-ui-design
---
# UI 模板库 (UI Template Library)

> [!info] Skill 元信息
> 原始名称：`ui-template-library`  
> 原始标题：UI 模板库 · UI Template Library  
> 功能分类：高级前端 UI 设计与重构  
> 原始文件：[SKILL.md](../../../raw/SkillHub/categories/frontend-ui-design/ui-template-library/SKILL.md)  
> 来源：本机 Codex 用户级 skill（`C:/Users/Administrator/.codex/skills/ui-template-library`），无已知上游仓库  
> 演进历史：由原 `glass-tilt-board` 升级重组而成；原画板降维为**控件一**，南瓜助手**胶囊导航栏与按钮**提炼为**控件二**，南瓜助手**磨砂流光搜索框**增补为**控件三**，南瓜助手**列表卡片悬停跟随阴影与氛围光晕**新增为**控件四**；增补「CSS 3D 透视与容器裁剪互斥避坑指南」防踩展平与过度拦截陷阱

## 中文含义与用途

中文含义：收纳经过生产实战检验的高保真、高性能前端 UI 控件与交互模板库。  
核心用处：拒绝粗糙模板感与性能掉帧，为高质感 Web 应用提供遵循硬件加速、物理阻尼缓动、无障碍适配（WCAG 2.1 AA / 44px 触控区）与严格性能守卫的现成生产级控件与提示词模板。

## 控件索引与适用场景

| 控件名称 | 核心交互与视觉特征 | 典型适用场景 | 模板与关键资源 |
|---|---|---|---|
| **控件一：玻璃倾斜画板** | 鼠标驱动 3D 视差、多切片拼图倾斜、点击空白切图、纯 transform 零掉帧 | 作品集封面、图片画板、沉浸式 3D 交互页面、展厅画廊 | `assets/glass-board-template.html`<br>`scripts/verify-glass-board.mjs` |
| **控件二：胶囊导航栏与导航按钮** | 弹性磁吸底色滑块（Glider）、360° 弹性微动效旋转、吸顶折叠与悬停互斥让位 | 系统顶部主导航、移动端自适应应用栏、后台工作台菜单 | `assets/nav-capsule/nav_capsule.css`<br>`assets/nav-capsule/nav_capsule.js` |
| **控件三：磨砂流光搜索框** | 底边双层径向渐变呼吸扫光、解耦设计令牌（`--gs-*`）、内置清空按钮联动与输入防抖 | 页面主搜索栏、浮动收纳搜索条、筛选与关键词检索 | `assets/glass-search/glass_search.css`<br>`assets/glass-search/glass_search.js` |
| **控件四：列表卡片悬停跟随阴影与光晕** | 高斯弥散无界光晕（`filter: blur(18px)`）、Damped Lerp 物理滞后滑行追随、卡片内鼠标微视差追踪 | 业务列表页（会议/任务/订单）、卡片式看板、交互式卡片组 | `assets/card-hover-halo/card_hover_halo.css`<br>`assets/card-hover-halo/card_hover_halo.js` |

---

## 控件一：玻璃倾斜画板 (Glass Panel Tilt Board)

目标：一组玻璃面板拼成一幅大图，整块跟着指针倾斜；点击右侧/底部空白处切换下一张。交付物是直接双击打开的单文件 HTML 页面（`file://` 可用），无需构建工具与打包服务器。

### 1. 中文提示词模板

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

### 3. 核心性能不变量

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

### 5. 验证体系

1. **CDP 直连断言**：运行 `node scripts/verify-glass-board.mjs --url "file:///D:/.../index.html"`，在 headless Chrome 中断言面板数量、3D 倾斜角度、切片对齐无缝隙与多视口自适应（1440x900、1920x1080、430x880）。
2. **反向用例**：故意加入 `transform: none !important` 检验断言脚本报错敏锐度。
3. **视觉复核**：按 `references/verification-cdp.md` 用 `agent-team-visual-review` 进行 Playwright 视觉截屏核验。

### 6. CSS 3D 透视与容器裁剪互斥避坑指南（重大踩坑与排查手册）

在 3D 视差倾斜控件（如玻璃画板、3D 卡片阵列）的工程化实现与重构中，极易踩中 CSS 3D 渲染规范底层的“隐形陷阱”，导致动效看似编写完备，实际运行却完全静止、失去深度或暗部黑屏。以下为生产级排查与避坑准则：

#### 6.1 W3C 规范底层机理：3D 渲染上下文展平 (Flattening)

依据 **W3C CSS Transforms Module Level 2** 规范（Accumulating 3D Transformations and Flattening）：
- 只要父容器或祖先元素声明了任何**非 `visible` 的 `overflow` 属性**（包括 `overflow: hidden`、`overflow: scroll`、`overflow: auto`、`overflow: clip`），或者应用了非空的 `clip-path`、`contain: paint` 等属性，浏览器渲染引擎就会强制该元素建立 **2D 平面裁剪上下文**，并强行将其内部所有后代元素的 **3D 渲染上下文完全展平（Flatten）**。
- **展平后的致命表现**：
  1. 祖先元素配置的 `perspective`（透视距离）**无法穿透传递**给子孙元素；
  2. 子元素的 `transform-style: preserve-3d` **彻底失效**；
  3. 子元素在三维空间中的 Z 轴位移（`translate3d(0, 0, Zpx)` / `translateZ`）**完全丧失纵深视差**（深度投影为零，卡片前后景深消失）；
  4. 3D 倾斜旋转（`rotateX` / `rotateY`）在无透视投影下，直接退化为**2D 正交几何压扁**（仅存在 `cos(θ)` 极其微弱的平面缩放，肉眼几乎无法感知任何倾斜）。

#### 6.2 四大生产级高频踩坑反模式 (Anti-Patterns)

1. **反模式一：在 3D 外壳或舞台容器上习惯性声明 `overflow: hidden`（杀死透视链）**
   - *错误做法*：为了让画板圆角不穿帮或遮挡溢出阴影，在 `.board-shell` 或 `.board-stage` 容器上添加 `border-radius: 24px; overflow: hidden;`。
   - *破坏后果*：直接将内部整块 3D 拼图切片阵列打成 2D 扁平死图，切片丧失立体落差。
   - *正解*：3D 变换传播路径上的所有容器，必须保持 `overflow: visible`，并显式配置 `transform-style: preserve-3d`。若需要圆角防溢出，裁剪属性只能下沉到叶子节点，或提升到与 3D 舞台平级的兄弟静态外壳上。

2. **反模式二：`prefers-reduced-motion` 过度拦截（将交互动效当成眩晕 Bug 扼杀）**
   - *错误做法*：在 `@media (prefers-reduced-motion: reduce)` 中粗暴声明 `.tile-cell { transform: none !important; }`，或在 JS 的 `handlePointerMove` 开头直接 `if (prefersReducedMotion()) return;`。
   - *破坏后果*：在 Windows Server、Windows 远程桌面（RDP）或许多将系统“动画效果”关闭以提速的开发者机器上，Chromium 会将 `prefers-reduced-motion: reduce` 判定为 `true`。此时上述代码会无差别杀死用户**主动移动鼠标**时的物理跟随交互，导致用户在任何平台误判“动效彻底失效无法移动”。
   - *正解*：区分**“自动非预期动画”**与**“用户主动交互动效”**。减弱动效仅用于关闭静止时的“自动正弦波呼吸浮动”，以及缩减切图时的离散过渡时间；在用户主动移动鼠标时，内联 3D 矩阵必须正常生效，绝不可使用 `!important` 强行置空。

3. **反模式三：60fps rAF 逐帧更新与 CSS `transition: transform` 竞争打断**
   - *错误做法*：在需要高频物理插值（Lerp）或跟随鼠标高频变换的 `.tile-cell` 上保留 `transition: transform 0.1s linear;`。
   - *破坏后果*：每秒 60 次的 requestAnimationFrame 内联样式重写，会不断打断并重启 CSS 的线性过渡动画，导致运动严重掉帧、滞后甚至抖动卡滞。
   - *正解*：持续跟随鼠标的运动层**严禁声明 `transition: transform`**，完全交给 JS 内的 `lerp` 算法逐帧平滑缓动；只有离散触发的动效（如点击切图翻转 `.flipping`）才允许挂载 CSS transition。

4. **反模式四：切片拼图叠加 `mix-blend-mode: screen` 导致深色渐变滤黑变透明**
   - *错误做法*：在切片内部贴图层使用 `mix-blend-mode: screen` 伪造玻璃叠加感。
   - *破坏后果*：Screen（滤色）模式会把深色和黑色背景像素当作透明色过滤掉。若画卷或背景图片本身为暗色或深色渐变（如星空、深海），切片贴图会大面积透明隐形，误以为贴图加载失败。
   - *正解*：切片贴图保持正常渲染（`opacity: 0.95`），玻璃质感纯靠表面独立的高光反射层（`.tile-specular` 结合渐变与 inset 阴影）叠加伪造。

#### 6.3 标准破局架构：分层解耦与双透视注入 (Dual Perspective Model)

```html
<!-- 最外层视口容器：注入全局空间透视 -->
<div class="glass-board-container" style="perspective: 1200px;">

  <!-- 3D 外壳层：承载卡片自身俯仰 (rotateX/Y) 与动态深阴影，绝不设 overflow: hidden -->
  <div class="board-shell" style="transform-style: preserve-3d; transform: perspective(1200px) rotateX(...) rotateY(...);">
    
    <!-- 3D 舞台层：重新注入局部透视，打通切片 Z 轴空间坐标系 -->
    <div class="board-stage" style="perspective: 1000px; transform-style: preserve-3d;">
      
      <!-- 网格切片单元：承载棋盘格景深与局部差分倾斜 -->
      <div class="tile-cell" style="transform: translate3d(0, 0, Zpx) rotateX(...) rotateY(...);">
        
        <!-- 内部拼图：下沉裁剪与像素级对齐，移除 mix-blend-mode -->
        <div class="tile-image-slice" style="width: var(--sw); height: var(--sh); background-position: 0 0; transform: translate3d(-offsetLeft, -offsetTop, 0);"></div>
        
        <!-- 表面高光反射层：微视差跟随反光 -->
        <div class="tile-specular" style="transform: translate3d(sheenX, sheenY, 0);"></div>
      </div>
    </div>

    <!-- 侧边栏：反向微立体视差，独立分层 -->
    <aside class="board-sidebar" style="transform: translate3d(0, 0, 16px) rotateX(...) rotateY(...);"></aside>
  </div>
</div>
```

#### 6.4 3D 控件排查核验清单 (Checklist for 3D UI)

- [ ] **透视链畅通**：从视口容器到切片舞台，所有中间父容器均无 `overflow: hidden`、`overflow: auto` 或 `clip-path`。
- [ ] **3D 上下文传递**：所有参与 3D 运动的父子层级均显式声明了 `transform-style: preserve-3d;`。
- [ ] **双透视防御**：外壳有全局 `perspective`，内层舞台具备局部 `perspective`，保证嵌套 3D 矩阵计算稳定。
- [ ] **帧率竞争防护**：跟随鼠标的高频变换层无 CSS `transition: transform`，纯靠 rAF / Lerp 平滑计算。
- [ ] **无障碍兼容无毒化**：`@media (prefers-reduced-motion: reduce)` 仅关闭无交互时的自动呼吸漂移，严禁用 `transform: none !important` 粗暴杀死用户主动交互。
- [ ] **切片精确对齐**：使用响应式尺寸变量（`--sw`, `--sh`）配合 `background-position: 0 0` 与 `-offsetLeft, -offsetTop` 抵消，严禁依赖受动画污染的 DOM 包围盒。


---

## 控件二：南瓜助手胶囊导航栏与导航按钮 (Capsule Navigation Bar & Items)

目标：构建生产级、高质感的自适应胶囊导航栏与导航按钮组件（源自南瓜会议助手实战标准）。实现未吸顶时的完整展开与磁吸滑块动效，以及吸顶滚动后的正圆折叠、悬停展开与互斥让位机制。

### 1. 中文提示词模板

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

### 2. 界面原型与视觉特征说明

基于南瓜助手的实际界面与截图规范，导航栏具备以下特征：
* **常规模式**：胶囊栏横向居中陈列。包含 6 个经典导航按钮：
  1. `大厅`（4 个小方块 Grid 图标）
  2. `会议列表`（文档 Document 图标）
  3. `纪要列表`（带复选清单的 Clipboard 图标）
  4. `任务列表`（**当前激活项**：方框对勾图标 + 浅橙色药丸背景 `#ea580c` 调色板）
  5. `声音管理`（麦克风 Microphone 图标）
  6. `设置`（齿轮 Settings 图标）
* **吸顶折叠模式**：页面滚动后触发 `.is-scrolled`，非激活项瞬间收起文字，仅露居中正圆图标；鼠标滑入任意项时实时触发互斥让位。

### 3. 四大核心设计与交互机制

1. **弹性磁吸滑动底色胶囊（Glider）**：
   * 采用绝对定位的 `.nav-capsule-glider` 浮于底层；
   * 缓动曲线采用带物理惯性的 `cubic-bezier(0.25, 1, 0.3, 1)`，位移耗时 0.4s，宽度自适应 0.38s。
2. **内层图标与文字对称绝对居中**：
   * 针对汉字字数不一致导致偏心的问题，采用 `.nav-capsule-inner` 弹性盒包裹；
   * `margin: 0 auto; display: inline-flex; align-items: center; justify-content: center;` 确保任何字数下几何绝对居中。
3. **图标 360° 微弹性顺时针旋转微交互**：
   * 采用弹性贝塞尔 `cubic-bezier(0.34, 1.25, 0.64, 1)`，耗时 0.65s；
   * 悬停/激活展开时触发顺时针 360° 旋转，收起时平滑逆向复位。
4. **吸顶折叠与悬停互斥让位机制**：
   * CSS `:has()` 选择器或 JS 辅助类驱动：悬浮非激活项时，原 `.active` 项自动压缩为 38px，把视觉宽度让给悬浮项；鼠标离开后焦点平滑回弹。

### 4. 关键客户端驱动 JS 代码 (Glider 计算与状态机)

```javascript
// 基于 offsetLeft 与 offsetWidth 计算 Glider 物理滑动位置
function updateGlider(navBar, targetEl, isImmediate = false) {
    const glider = navBar.querySelector('.nav-capsule-glider');
    const header = navBar.closest('.app-header');
    const isScrolled = header ? header.classList.contains('is-scrolled') : false;
    
    // 吸顶折叠态下隐藏全局 Glider，由各按钮自身的背景色独立接管
    if (!glider || !targetEl || isScrolled) {
        if (glider) glider.style.opacity = '0';
        return;
    }

    const width = targetEl.offsetWidth;
    const x = targetEl.offsetLeft;
    if (width <= 0) return;

    if (isImmediate) {
        glider.style.transition = 'none';
    } else {
        glider.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.3, 1), width 0.38s cubic-bezier(0.25, 1, 0.3, 1), opacity 0.22s ease';
    }

    glider.style.width = `${width}px`;
    glider.style.transform = `translate3d(${x}px, 0, 0)`;
    glider.style.opacity = '1';
}

// 页面滚动监听：切换 .is-scrolled 并校准几何状态
window.addEventListener('scroll', () => {
    const header = document.getElementById('appHeader');
    const navBar = document.getElementById('appNav');
    const activeItem = navBar.querySelector('.common-nav-capsule.active');
    if (!header || !navBar) return;

    if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
    } else {
        header.classList.remove('is-scrolled');
        if (activeItem) updateGlider(navBar, activeItem);
    }
}, { passive: true });
```

---

## 控件三：南瓜助手磨砂流光搜索框 (Glassmorphism Ambient Beam Search Bar)

目标：构建生产级、半透明磨砂质感的高保真搜索框组件（源自南瓜会议助手搜索交互）。实现全胶囊药丸造型、双层径向渐变底边呼吸扫光、解耦设计令牌（`--gs-*`）以及优雅的清空按钮联动与输入防抖。

### 1. 中文提示词模板

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

### 2. 界面视觉特征与设计亮点

根据南瓜助手的实际设计与截图特征：
1. **全胶囊药丸造型**：`height: 44px; border-radius: 9999px;`，满足 Apple HIG 44px 黄金触控面积标准；
2. **底边连续流光（Bottom Ambient Beam）**：
   在搜索框底部挂载 `::before` 伪元素，采用**双层椭圆径向渐变**结合：
   - 内层核心高亮光束：`radial-gradient(ellipse 110px 4px at 50% 100%, var(--gs-beam-core) 0%, var(--gs-beam-edge) 45%, transparent 100%)`
   - 外层漫反射柔光晕：`radial-gradient(ellipse 140px 24px at 50% 100%, var(--gs-glow-strong) 0%, var(--gs-glow-mid) 40%, var(--gs-glow-tail) 75%, transparent 100%)`
   常态下以 3.6s 周期在搜索框底边微幅平滑摆动（±100px），悬停时加速至 2.6s，聚焦时加速至 2.0s 并达到最大饱和度；
3. **令牌解耦架构**：通过统一的 `--gs-*` 变量隔离物理尺寸与视觉色彩，业务侧只需引入 `.nangua-search-theme` 即可注入南瓜橙色系；
4. **圆形清空按钮微交互**：外层 44px 触控区满足手指点按，内层 `search-clear-btn__face` 呈现 22px 浅灰底色正圆，悬停微放大 `scale(1.04)`。

### 3. 关键样式与流光动画 (CSS)

```css
/* 核心胶囊外框与双层底边流光 */
.glass-search-bar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 680px;
    height: 44px;
    min-height: 44px;
    box-sizing: border-box;
    overflow: hidden;
    border: 0;
    border-radius: 9999px;
    background: var(--gs-surface);
    box-shadow: inset 0 0 0 1px var(--gs-border), var(--gs-search-shadow);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    transition: background-color var(--gs-duration) ease,
                box-shadow var(--gs-duration) ease;
}

.glass-search-bar:hover {
    background: var(--gs-surface-hover);
    box-shadow: inset 0 0 0 1px var(--gs-border-hover), var(--gs-search-shadow-hover);
}

.glass-search-bar:focus-within {
    background: var(--gs-surface-focus);
    box-shadow: inset 0 0 0 1px var(--gs-border-focus),
                var(--gs-focus-shadow),
                var(--gs-search-shadow-focus);
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
        radial-gradient(
            ellipse 110px 4px at 50% 100%,
            var(--gs-beam-core) 0%,
            var(--gs-beam-edge) 45%,
            transparent 100%
        ),
        radial-gradient(
            ellipse 140px 24px at 50% 100%,
            var(--gs-glow-strong) 0%,
            var(--gs-glow-mid) 40%,
            var(--gs-glow-tail) 75%,
            transparent 100%
        );
    filter: blur(1.5px);
    opacity: 0.65;
    pointer-events: none;
    transform: translateX(-50%);
    animation: glass-search-peak-sweep 3.6s ease-in-out infinite alternate;
    transition: opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1),
                animation-duration 0.32s ease;
}

.glass-search-bar:hover::before {
    opacity: 0.90;
    animation-duration: 2.6s;
}

.glass-search-bar:focus-within::before {
    opacity: 1;
    animation-duration: 2.0s;
}

@keyframes glass-search-peak-sweep {
    0%   { transform: translateX(calc(-50% - 100px)) scaleX(0.92); }
    50%  { transform: translateX(-50%) scaleX(1.08); }
    100% { transform: translateX(calc(-50% + 100px)) scaleX(0.92); }
}
```

---

## 控件四：南瓜助手列表卡片悬停跟随阴影与氛围光晕 (Card Hover Follower Halo & Atmospheric Shadow)

目标：构建生产级、极富质感与悬浮空间感的**卡片悬停面板阴影跟随动效**（源自南瓜助手会议卡片与待办列表实战标准）。彻底去除生硬边框与机械切换，实现单实例高斯弥散无界光晕、Damped Lerp 物理滞后滑行以及卡片内部鼠标微视差动态追踪。

### 1. 中文提示词模板

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

## 资源结构

| 资源路径 | 作用与交付说明 |
|---|---|
| `assets/glass-board-template.html` | 控件一完整验证单文件模板（含全部 CSS + JS），直接运行 |
| `assets/nav-capsule/nav_capsule.css` | 控件二南瓜助手胶囊导航栏与按钮生产级 CSS/SCSS 样式规范 |
| `assets/nav-capsule/nav_capsule.js` | 控件二 Glider 滑块惯性位移、互斥让位与吸顶状态机驱动脚本 |
| `assets/glass-search/glass_search.css` | 控件三南瓜助手磨砂流光搜索框解耦设计令牌（`--gs-*`）与扫光动画 CSS |
| `assets/glass-search/glass_search.js` | 控件三清空按钮显隐联动、白名单函数回调与输入监听脚本 |
| `assets/card-hover-halo/card_hover_halo.css` | 控件四卡片悬停无界高斯弥散光晕（`filter: blur(18px)`）与复合投影样式 |
| `assets/card-hover-halo/card_hover_halo.js` | 控件四 Damped Lerp 物理滞后滑行与卡片内微视差悬浮追踪驱动控制器 |
| `references/performance-rules.md` | 60fps 动效性能铁律、合成层提升与掉帧诊断指南 |
| `references/verification-cdp.md` | Chrome CDP 直连断言配方与多模型视觉复核规范 |
| `scripts/update-images.ps1` | 扫描本地图片生成前端 `images.js` 清单脚本（纯 ASCII） |
| `scripts/verify-glass-board.mjs` | 无 npm 依赖的 Node.js CDP 几何断言与多视口验证脚本 |
| `agents/openai.yaml` | Skill 默认提示词与显示名定义 |

## 质量与扩展标准

1. **新增控件流程**：
   - 在本 Skill 中追加子章节，明确定义：**控件名称**、**中文提示词模板**、**适用与不适用边界**、**关键样式代码**及**测试验收脚本**；
   - 复杂独立模板建议将完整演示文件存放于 `assets/<component-slug>/` 目录下。
2. **性能与规范守卫**：
   - 必须通过 `skill-creator/scripts/quick_validate.py` 验证；
   - 动效必须满足 60fps 硬件加速要求，杜绝使用 `top/left` 与重排高开销属性；
   - 严格遵循 `ui-ux-pro-max` 的移动端触控标准与无障碍规范。

## 相关 Skill

- [[wiki/SkillHub/skills/ui-styling|UI 样式与 shadcn/ui 组件系统]]
- [[wiki/SkillHub/skills/ui-ux-pro-max|UI/UX 设计全栈智囊]]
- [[wiki/SkillHub/skills/high-end-visual-design|高端视觉设计与动效编排]]
- [[wiki/SkillHub/skills/huashu-design|花叔 HTML 原生设计生产线]]
- [[wiki/SkillHub/skills/agent-team-visual-review|Playwright 视觉核验]]