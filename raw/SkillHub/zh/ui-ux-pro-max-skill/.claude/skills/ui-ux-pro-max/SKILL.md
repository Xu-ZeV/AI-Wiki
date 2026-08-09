---
name: ui-ux-pro-max
description: “适用于网络和移动设备的 UI/UX 设计智能。包括 50 多种样式、161 种调色板、57 种字体配对、161 种产品类型、99 种 UX 指南以及 10 个堆栈中的 25 种图表类型（React、Next.js、Vue、Svelte、SwiftUI、React Native、Flutter、Tailwind、shadcn/ui 和 HTML/CSS）。操作：计划、构建、创建、设计、实施、审查、修复、改进、优化、增强、重构和检查 UI/UX 代码。 项目：网站、登陆页面、仪表板、管理面板、电子商务、SaaS、投资组合、博客和移动应用程序。 元素：按钮、模式、导航栏、侧边栏、卡片、表格、表格和图表。可访问性、动画、布局、排版、字体配对、间距、交互状态、阴影和渐变集成：用于组件搜索和示例的 shadcn/ui MCP。”
---

# UI/UX Pro Max - 设计智能

Web 和移动应用程序的综合设计指南。包含 50 多种样式、161 种调色板、57 种字体配对、161 种带有推理规则的产品类型、99 条用户体验指南以及跨 10 个技术堆栈的 25 种图表类型。可搜索的数据库，具有基于优先级的推荐。

## 何时申请

当任务涉及 **UI 结构、视觉设计决策、交互模式或用户体验质量控制**时，应使用此技能。

### 必须使用

在以下情况下必须调用此技能：

- 设计新页面（登陆页面、仪表板、管理、SaaS、移动应用程序）
- 创建或重构 UI 组件（按钮、模式、表单、表格、图表等）
- 选择配色方案、排版系统、间距标准或布局系统
- 审查 UI 代码的用户体验、可访问性或视觉一致性
- 实现导航结构、动画或响应行为
- 制定产品级设计决策（风格、信息层次、品牌表达）
- 提高界面的感知质量、清晰度或可用性

### 推荐

在以下情况下推荐使用此技能：

- UI看起来“不够专业”但原因尚不清楚
- 接收有关可用性或体验的反馈
- 启动前 UI 质量优化
- 协调跨平台设计（Web / iOS / Android）
- 构建设计系统或可重用组件库

### 跳过

以下情况不需要此技能：

- 纯后端逻辑开发
- 只涉及API或数据库设计
- 与界面无关的性能优化
- 基础设施或 DevOps 工作
- 非可视化脚本或自动化任务

**决策标准**：如果任务将改变某个功能的**外观、感觉、移动或交互方式**，则应使用此技能。

## 按优先级规则类别

*供人类/AI参考：按照优先级1→10来决定首先关注哪个规则类别；需要时使用`--domain <Domain>`查询详情。脚本不读取此表。*

|优先|类别 |影响 |域名 |关键检查（必须有）|反模式（避免）|
|----------|----------|--------|--------|------------------------|------------------------|
| 1 |无障碍 |关键 | `ux` |对比度 4.5:1、替代文本、键盘导航、Aria 标签 |取消对焦环，仅图标按钮，无标签 |
| 2 |触摸与互动 |关键 | `ux` |最小尺寸44×44px，间距8px+，加载反馈|仅依赖悬停，即时状态更改 (0ms) |
| 3 |性能|高| `ux` | WebP/AVIF、延迟加载、预留空间(CLS < 0.1) |布局抖动、累积布局偏移 |
| 4 |款式选择|高| `style`、`product` |匹配产品类型、一致性、SVG 图标（无表情符号）|随机混合扁平化和拟物化，表情符号作为图标 |
| 5 |布局和响应式 |高| `ux` |移动优先断点、视口元、无水平滚动 |水平滚动、固定 px 容器宽度、禁用缩放 |
| 6 |版式和颜色|中 | `typography`、`color` |基础 16px，行高 1.5，语义颜色标记 |文字< 12 像素主体，灰色对灰色，组件中的原始六角形 |
| 7 |动画|中 | `ux` |持续时间 150–300 毫秒，运动传达意义，空间连续性 |仅装饰性动画、动画宽度/高度、无缩减动作 |
| 8 |表格和反馈|中 | `ux` |可见标签、近场错误、辅助文本、渐进式披露 |仅占位符标签，错误仅在顶部，淹没在前面 |
| 9 |导航模式|高| `ux` |可预测的返回，底部导航≤5，深度链接|导航超载、行为中断、没有深层链接 |
| 10 | 10图表和数据 |低| `chart` |图例、工具提示、可访问的颜色 |仅依靠颜色来传达意义 |

## 快速参考

### 1. 辅助功能（关键）

- `color-contrast` - 普通文本的最小比例为 4.5:1（大文本 3:1）；材料设计
- `focus-states` - 交互元素上的可见对焦环（2–4 像素；Apple HIG，MD）
- `alt-text` - 有意义图像的描述性替代文本
- `aria-labels` - 仅图标按钮的 aria-label；本机中的accessibilityLabel（Apple HIG）
- `keyboard-nav` - Tab 顺序与视觉顺序匹配；全键盘支持（Apple HIG）
- `form-labels` - 使用带有属性的标签
- `skip-links` - 跳至键盘用户的主要内容
- `heading-hierarchy` - 顺序 h1→h6，无级别跳跃
- `color-not-only` - 不要仅通过颜色传达信息（添加图标/文本）
- `dynamic-type` - 支持系统文本缩放；避免随着文本增长而截断（Apple Dynamic Type，MD）
- `reduced-motion` - 尊重更喜欢减少运动；根据请求减少/禁用动画（Apple 减少运动 API，MD）
- `voiceover-sr` - 有意义的辅助功能标签/辅助功能提示； VoiceOver/屏幕阅读器的逻辑阅读顺序（Apple HIG、MD）
- `escape-routes` - 在模式和多步骤流程中提供取消/返回（Apple HIG）
- `keyboard-shortcuts` - 保留系统和a11y快捷方式；提供拖放键盘替代方案（Apple HIG）

### 2. 触摸和交互（关键）

- `touch-target-size` - 最小 44×44pt（苹果）/ 48×48dp（材质）；如果需要，将命中区域延伸到视觉范围之外
- `touch-spacing` - 触摸目标之间的最小间隙为 8px/8dp（Apple HIG、MD）
- `hover-vs-tap` - 使用点击/点击进行主要交互；不要仅仅依赖悬停
- `loading-buttons` - 异步操作期间禁用按钮；显示微调器或进度
- `error-feedback` - 清除问题附近的错误消息
- `cursor-pointer` - 将光标指针添加到可点击元素（Web）
- `gesture-conflicts` - 避免在主要内容上水平滑动；更喜欢垂直滚动
- `tap-delay` - 使用触摸操作：减少 300 毫秒延迟的操作（Web）
- `standard-gestures` - 一致使用平台标准手势；不要重新定义（例如向后滑动、捏合缩放）（Apple HIG）
- `system-gestures` - 不阻止系统手势（控制中心、向后滑动等）（Apple HIG）
- `press-feedback` - 按下时的视觉反馈（波纹/突出显示；MD 状态层）
- `haptic-feedback` - 使用触觉进行确认和重要操作；避免过度使用（Apple HIG）
- `gesture-alternative` - 不要依赖仅手势交互；始终为关键操作提供可见的控制
- `safe-area-awareness` - 使主要触摸目标远离凹口、动态岛、手势栏和屏幕边缘
- `no-precision-required` - 避免在小图标或薄边缘上要求像素完美的点击
- `swipe-clarity` - 滑动操作必须显示清晰的可见性或提示（V 形、标签、教程）
- `drag-threshold` - 在开始拖动之前使用移动阈值以避免意外拖动

### 3. 性能（高）

- `image-optimization` - 使用 WebP/AVIF、响应式图像（srcset/size）、延迟加载非关键资产
- `image-dimension` - 声明宽度/高度或使用纵横比来防止布局移位（核心 Web Vitals：CLS）
- `font-loading` - 使用字体显示：交换/可选以避免不可见文本（FOIT）；预留空间以减少布局偏移（MD）
- `font-preload` - 仅预加载关键字体；避免在每个变体上过度使用预载
- `critical-css` - 优先考虑首屏 CSS（内联关键 CSS 或早期加载的样式表）
- `lazy-loading` - 通过动态导入/路由级拆分延迟加载非英雄组件
- `bundle-splitting` - 按路线/功能拆分代码（React Suspense / Next.js 动态）以减少初始负载和 TTI
- `third-party-scripts` - 异步/延迟加载第三方脚本；审核并删除不必要的（MD）
- `reduce-reflows` - 避免频繁的布局读/写；批量 DOM 读取然后写入
- `content-jumping` - 为异步内容预留空间以避免布局跳转（核心 Web Vitals：CLS）
- `lazy-load-below-fold` - 对首屏图像和重介质使用loading="lazy"
- `virtualize-lists` - 虚拟化包含 50 多个项目的列表，以提高内存效率和滚动性能
- `main-thread-budget` - 将 60fps 的每帧工作保持在约 16ms 以内；将繁重的任务移出主线程（HIG、MD）
- `progressive-loading` - 使用骨架屏幕/闪光代替长阻塞旋转器进行 >1 秒的操作（Apple HIG）
- `input-latency` - 将点击/滚动的输入延迟保持在约 100 毫秒以下（材质响应标准）
- `tap-feedback-speed` - 在点击后 100 毫秒内提供视觉反馈（Apple HIG）
- `debounce-throttle` - 对高频事件使用去抖/节流（滚动、调整大小、输入）
- `offline-support` - 提供离线状态消息传递和基本回退（PWA /移动）
- `network-fallback` - 为慢速网络提供降级模式（较低分辨率的图像，较少的动画）

### 4.风格选择（高）

- `style-match` - 将样式与产品类型相匹配（使用 `--design-system` 进行推荐）
- `consistency` - 在所有页面上使用相同的样式
- `no-emoji-icons` - 使用 SVG 图标（Heroicons、Lucide），而不是表情符号
- `color-palette-from-product` - 从产品/行业中选择调色板（搜索 `--domain color`）
- `effects-match-style` - 阴影、模糊、半径与所选样式（玻璃/平面/粘土等）对齐
- `platform-adaptive` - 尊重平台习惯用法（iOS HIG 与 Material）：导航、控件、排版、动作
- `state-clarity` - 使悬停/按下/禁用状态在视觉上清晰，同时保持风格（材质状态层）
- `elevation-consistent` - 对卡片、纸张、模态使用一致的标高/阴影比例；避免随机阴影值
- `dark-mode-pairing` - 设计浅色/深色变体以保持品牌、对比度和风格一致
- `icon-style-consistent` - 在整个产品中使用一套图标集/视觉语言（描边宽度、圆角半径）
- `system-controls` - 与完全自定义的控件相比，更喜欢本机/系统控件；仅在品牌需要时进行定制 (Apple HIG)
- `blur-purpose` - 使用模糊来指示背景消除（模态、床单），而不是作为装饰（Apple HIG）
- `primary-action` - 每个屏幕应该只有一个主要 CTA；次要操作视觉上从属（Apple HIG）

### 5.布局和响应（高）

- `viewport-meta` - 宽度=设备宽度初始比例=1（从不禁用缩放）
- `mobile-first` - 首先设计移动设备，然后扩展到平板电脑和台式机
- `breakpoint-consistency` - 使用系统断点（例如 375 / 768 / 1024 / 1440）
- `readable-font-size` - 移动设备上的正文文本最小为 16 像素（避免 iOS 自动缩放）
- `line-length-control` - 移动每行 35–60 个字符；桌面 60–75 个字符
- `horizontal-scroll` - 移动设备上没有水平滚动；确保内容适合视口宽度
- `spacing-scale` - 使用 4pt/8dp 增量间距系统（材质设计）
- `touch-density` - 保持元件间距舒适，便于触摸：不拥挤，不会导致误点击
- `container-width` - 桌面上一致的最大宽度（max-w-6xl / 7xl）
- `z-index-management` - 定义分层 z 索引比例（例如 0 / 10 / 20 / 40 / 100 / 1000）
- `fixed-element-offset` - 固定导航栏/底部栏必须为底层内容保留安全填充
- `scroll-behavior` - 避免嵌套滚动区域干扰主滚动体验
- `viewport-units` - 在移动设备上更喜欢 min-h-dvh 而不是 100vh
- `orientation-support` - 保持布局在横向模式下可读和可操作
- `content-priority` - 首先在移动设备上显示核心内容；折叠或隐藏次要内容
- `visual-hierarchy` - 通过大小、间距、对比度建立层次结构 - 而不仅仅是颜色

### 6.版式和颜色（中）

- `line-height` - 正文使用 1.5-1.75
- `line-length` - 每行限制 65-75 个字符
- `font-pairing` - 匹配标题/正文字体个性
- `font-scale` - 一致的字体比例（例如 12 14 16 18 24 32）
- `contrast-readability` - 浅色背景上的深色文本（例如白色上的 slate-900）
- `text-styles-system` - 使用平台类型系统：iOS 11 动态类型样式/材质 5 种类型角色（显示、标题、标题、正文、标签）（HIG、MD）
- `weight-hierarchy` - 使用字体粗细来强化层次结构：粗体标题 (600–700)、常规正文 (400)、中等标签 (500) (MD)
- `color-semantic` - 定义组件中的语义颜色标记（主要、次要、错误、表面、表面）而不是原始十六进制（材质颜色系统）
- `color-dark-mode` - 深色模式使用去饱和/较浅的色调变体，而不是反转颜色；单独测试对比度（HIG、MD）
- `color-accessible-pairs` - 前景/背景对必须满足 4.5:1 (AA) 或 7:1 (AAA)；使用工具验证（WCAG、MD）
- `color-not-decorative-only` - 功能颜色（错误红色，成功绿色）必须包含图标/文本；避免仅颜色含义（HIG、MD）
- `truncation-strategy` - 优先选择换行而不是截断；截断时使用省略号并通过工具提示/展开提供全文（Apple HIG）
- `letter-spacing` - 尊重每个平台的默认字母间距；避免对正文进行严格跟踪（HIG、MD）
- `number-tabular` - 对数据列、价格和计时器使用表格/等宽数字以防止布局移位
- `whitespace-balance` - 有意使用空格对相关项目进行分组并分隔部分；避免视觉混乱（Apple HIG）

### 7. 动画（中）

- `duration-timing` - 使用 150–300ms 进行微交互；复杂转换≤400ms；避免 >500ms (MD)
- `transform-performance` - 仅使用变换/不透明度；避免设置宽度/高度/顶部/左侧的动画
- `loading-states` - 当加载超过 300ms 时显示骨架或进度指示器
- `excessive-motion` - 每个视图最多动画 1-2 个关键元素
- `easing` - 使用ease-out进入，ease-in退出；避免 UI 过渡呈线性
- `motion-meaning` - 每个动画都必须表达因果关系，而不仅仅是装饰性（Apple HIG）
- `state-transition` - 状态变化（悬停/活动/展开/折叠/模态）应平滑动画，而不是突然动画
- `continuity` - 页面/屏幕过渡应保持空间连续性（共享元素、定向滑动）（Apple HIG）
- `parallax-subtle` - 谨慎使用视差；必须遵循简化运动且不会导致迷失方向（Apple HIG）
- `spring-physics` - 更喜欢基于弹簧/物理的曲线而不是线性或三次贝塞尔曲线以获得自然的感觉（Apple HIG 流体动画）
- `exit-faster-than-enter` - 退出动画比输入短（输入持续时间的约 60–70%）以感觉响应（MD 运动）
- `stagger-sequence` - 每个项目错开列表/网格项目入口 30–50 毫秒；避免一次性全部或太慢的揭示 (MD)
- `shared-element-transition` - 使用共享元素/英雄过渡以实现屏幕之间的视觉连续性（MD、HIG）
- `interruptible` - 动画必须是可中断的；用户点击/手势立即取消正在进行的动画（Apple HIG）
- `no-blocking-animation` - 在动画过程中切勿阻止用户输入； UI 必须保持交互（Apple HIG）
- `fade-crossfade` - 使用交叉淡入淡出在同一容器内替换内容 (MD)
- `scale-feedback` - 按下可点击卡片/按钮时的细微刻度 (0.95–1.05)；释放时恢复（HIG、MD）
- `gesture-feedback` - 拖动、滑动和捏合必须提供跟踪手指的实时视觉响应（MD Motion）
- `hierarchy-motion` - 使用平移/缩放方向来表达层次结构：从下面进入=更深，向上退出=向后（MD）
- `motion-consistency` - 全球统一久期/宽松token；所有动画都有相同的节奏和感觉
- `opacity-threshold` - 褪色元素不应低于不透明度 0.2；完全褪色或保持可见
- `modal-motion` - 模态/表格应根据空间上下文（HIG、MD）的触发源（缩放+淡入或滑入）进行动画处理
- `navigation-direction` - 向前导航向左/向上动画；向后向右/向下动画 - 保持方向逻辑一致（HIG）
- `layout-shift-avoid` - 动画不得导致布局回流或 CLS；使用变换来改变位置

### 8. 表格和反馈（中）

- `input-labels` - 每个输入的可见标签（不仅仅是占位符）
- `error-placement` - 在相关字段下方显示错误
- `submit-feedback` - 加载然后提交时的成功/错误状态
- `required-indicators` - 标记必填字段（例如星号）
- `empty-states` - 无内容时的有用消息和操作
- `toast-dismiss` - 在 3-5 秒内自动关闭 toast
- `confirmation-dialogs` - 破坏性行为前确认
- `input-helper-text` - 在复杂输入下方提供持久的帮助文本，而不仅仅是占位符（材料设计）
- `disabled-states` - 禁用元素使用降低的不透明度 (0.38–0.5) + 光标更改 + 语义属性 (MD)
- `progressive-disclosure` - 逐步显示复杂的选项；不要预先让用户不知所措（Apple HIG）
- `inline-validation` - 验证模糊（不是击键）；仅在用户完成输入后显示错误（MD）
- `input-type-keyboard` - 使用语义输入类型（电子邮件、电话、号码）触发正确的移动键盘（HIG、MD）
- `password-toggle` - 提供密码字段的显示/隐藏切换（MD）
- `autofill-support` - 使用自动完成/textContentType 属性，以便系统可以自动填充（HIG、MD）
- `undo-support` - 允许撤消破坏性或批量操作（例如“撤消删除”toast）（Apple HIG）
- `success-feedback` - 通过简短的视觉反馈确认已完成的操作（复选标记、吐司、彩色闪光）（MD）
- `error-recovery` - 错误消息必须包含明确的恢复路径（重试、编辑、帮助链接）（HIG、MD）
- `multi-step-progress` - 多步骤流程显示步骤指示器或进度条；允许后退导航 (MD)
- `form-autosave` - 长表单应自动保存草稿，以防止意外解雇时数据丢失（Apple HIG）
- `sheet-dismiss-confirm` - 在取消未保存更改的工作表/模式之前确认（Apple HIG）
- `error-clarity` - 错误消息必须说明原因 + 如何修复（不仅仅是“无效输入”）（HIG、MD）
- `field-grouping` - 对相关字段进行逻辑分组（字段集/图例或视觉分组）（MD）
- `read-only-distinction` - 只读状态在视觉和语义上应与禁用 (MD) 不同
- `focus-management` - 提交错误后，自动聚焦第一个无效字段（WCAG、MD）
- `error-summary` - 对于多个错误，在顶部显示摘要，并带有每个字段的锚链接 (WCAG)
- `touch-friendly-input` - 移动输入高度≥44px以满足触摸目标要求（Apple HIG）
- `destructive-emphasis` - 破坏性操作使用语义危险颜色（红色），并在视觉上与主要操作（HIG、MD）分开
- `toast-accessibility` - Toast 不得抢走焦点；使用 aria-live="polite" 进行屏幕阅读器公告 (WCAG)
- `aria-live-errors` - 表单错误使用 aria-live 区域或 role="alert" 通知屏幕阅读器 (WCAG)
- `contrast-feedback` - 错误和成功状态颜色必须满足 4.5:1 对比度（WCAG、MD）
- `timeout-feedback` - 请求超时必须显示带有重试选项的清晰反馈（MD）

### 9. 导航模式（高）

- `bottom-nav-limit` - 底部导航最多 5 项；使用带有图标的标签（材料设计）
- `drawer-usage` - 使用抽屉/侧边栏进行辅助导航，而不是主要操作（材料设计）
- `back-behavior` - 后退导航必须可预测且一致；保留滚动/状态（Apple HIG、MD）
- `deep-linking` - 所有关键屏幕必须可通过深层链接/URL 访问以进行共享和通知（Apple HIG、MD）
- `tab-bar-ios` - iOS：使用底部选项卡栏进行顶级导航（Apple HIG）
- `top-app-bar-android` - Android：使用带有导航图标的顶部应用栏作为主要结构（材料设计）
- `nav-label-icon` - 导航项必须同时具有图标和文本标签；仅图标导航会损害可发现性 (MD)
- `nav-state-active` - 当前位置必须在导航（HIG、MD）中以视觉方式突出显示（颜色、重量、指示器）
- `nav-hierarchy` - 主导航（选项卡/底栏）与辅助导航（抽屉/设置）必须清晰分开（MD）
- `modal-escape` - 模态框和床单必须提供明确的关闭/关闭功能；在移动设备上向下滑动即可关闭 (Apple HIG)
- `search-accessible` - 搜索必须易于访问（顶部栏或选项卡）；提供最近/建议的查询 (MD)
- `breadcrumb-web` - Web：使用面包屑进行 3 级以上的深层层次结构以帮助定位（MD）
- `state-preservation` - 向后导航必须恢复之前的滚动位置、过滤器状态和输入（HIG、MD）
- `gesture-nav-support` - 支持系统手势导航（iOS 滑动返回、Android 预测返回）无冲突（HIG、MD）
- `tab-badge` - 谨慎地在导航项目上使用徽章来指示未读/待处理；用户访问后清除（HIG、MD）
- `overflow-menu` - 当操作超出可用空间时，使用溢出/更多菜单而不是临时抱佛脚（MD）
- `bottom-nav-top-level` - 底部导航仅适用于顶级屏幕；永远不要在其中嵌套子导航（MD）
- `adaptive-navigation` - 大屏幕（≥1024px）更喜欢侧边栏；小屏幕使用底部/顶部导航（材质自适应）
- `back-stack-integrity` - 切勿默默重置导航堆栈或意外跳转到主页（HIG、MD）
- `navigation-consistency` - 所有页面的导航位置必须保持相同；不要按页面类型更改
- `avoid-mixed-patterns` - 不要在同一层次结构级别混合使用选项卡+侧边栏+底部导航
- `modal-vs-navigation` - 模态不得用于主要导航流程；他们破坏了用户的路径（HIG）
- `focus-on-route-change` - 页面转换后，将焦点移至屏幕阅读器用户的主要内容区域 (WCAG)
- `persistent-nav` - 核心导航必须保持可从深层页面访问；不要将其完全隐藏在子流程中（HIG、MD）
- `destructive-nav-separation` - 危险操作（删除帐户、注销）必须在视觉和空间上与正常导航项目（HIG、MD）分开
- `empty-nav-state` - 当导航目的地不可用时，解释原因而不是默默地隐藏它（MD）

### 10.图表和数据（低）

- `chart-type` - 将图表类型与数据类型匹配（趋势 → 折线、比较 → 条形图、比例 → 饼图/圆环图）
- `color-guidance` - 使用可访问的调色板；避免色盲用户仅使用红色/绿色对（WCAG、MD）
- `data-table` - 提供表格替代以实现可访问性；图表本身并不适合屏幕阅读器 (WCAG)
- `pattern-texture` - 用图案、纹理或形状补充颜色，以便数据无需颜色即可区分（WCAG、MD）
- `legend-visible` - 始终显示图例；靠近图表的位置，未在滚动折叠下方分离 (MD)
- `tooltip-on-interact` - 在悬停（Web）或点击（移动）上提供工具提示/数据标签，显示精确值（HIG、MD）
- `axis-labels` - 用单位和可读刻度标记轴；避免移动设备上的标签被截断或旋转
- `responsive-chart` - 图表必须在小屏幕上重排或简化（例如水平条而不是垂直条，更少的刻度线）
- `empty-data-state` - 当不存在数据时显示有意义的空状态（“尚无数据”+指导），而不是空白图表（MD）
- `loading-chart` - 在加载图表数据时使用骨架或微光占位符；不显示空轴框架
- `animation-optional` - 图表入口动画必须尊重首选减少运动；数据应立即可读（HIG）
- `large-dataset` - 对于 1000 多个数据点、聚合或样本；提供详细信息的向下钻取，而不是渲染全部 (MD)
- `number-formatting` - 对轴和标签上的数字、日期、货币使用区域设置感知格式（HIG、MD）
- `touch-target-chart` - 交互式图表元素（点、线段）必须具有 ≥44pt 的点击区域或在触摸时扩展（Apple HIG）
- `no-pie-overuse` - 避免超过 5 个类别的馅饼/甜甜圈；为了清晰起见，切换到条形图
- `contrast-data` - 数据线/条与背景 ≥3:1；数据文本标签≥4.5:1 (WCAG)
- `legend-interactive` - 图例应该可单击以切换系列可见性（MD）
- `direct-labeling` - 对于小型数据集，直接在图表上标记值以减少视线移动
- `tooltip-keyboard` - 工具提示内容必须是键盘可访问的，不能单独依赖悬停 (WCAG)
- `sortable-table` - 数据表必须支持使用 aria-sort 指示当前排序状态 (WCAG) 进行排序
- `axis-readability` - 轴刻度不得狭窄；保持可读间距，在小屏幕上自动跳过
- `data-density` - 限制每个图表的信息密度以避免认知过载；如果需要的话分成多个图表
- `trend-emphasis` - 强调数据趋势而非装饰；避免使数据变得模糊的严重渐变/阴影
- `gridline-subtle` - 网格线应该是低对比度的（例如gray-200），这样它们就不会与数据竞争
- `focusable-elements` - 交互式图表元素（点、条形图、切片）必须可通过键盘导航 (WCAG)
- `screen-reader-summary` - 提供文本摘要或咏叹调标签，为屏幕阅读器 (WCAG) 描述图表的关键见解
- `error-state-chart` - 数据加载失败必须显示带有重试操作的错误消息，而不是损坏/空的图表
- `export-option` - 对于数据量大的产品，提供图表数据的 CSV/图像导出
- `drill-down-consistency` - 向下钻取交互必须保持清晰的反向路径和层次结构面包屑
- `time-scale-clarity` - 时间序列图表必须明确标注时间粒度（日/周/月）并允许切换

## 如何使用

使用下面的 CLI 工具搜索特定域。

---

## 先决条件

检查Python是否已安装：

```bash
python3 --version || python --version
```

如果未安装Python，请根据用户操作系统安装：

**苹果系统：**
```bash
brew install python3
```

**Ubuntu/Debian：**
```bash
sudo apt update && sudo apt install python3
```

**Windows：**
```powershell
winget install Python.Python.3.12
```

---

## 如何使用此技能

当用户请求以下任何一项时，请使用此技能：

|场景 |触发器示例 |开始于 |
|----------|-----------------|------------|
| **新项目/页面** | “构建登陆页面”、“构建仪表板”|步骤1→步骤2（设计系统） |
| **新组件** | “创建定价卡”、“添加模式”|第 3 步（域名搜索：style、ux）|
| **选择样式/颜色/字体** | “什么风格适合金融科技应用程序？”、“推荐调色板”|步骤2（设计系统） |
| **查看现有UI** | “查看此页面是否存在用户体验问题”、“检查可访问性”|上面的快速参考清单 |
| **修复UI错误** | “按钮悬停已损坏”、“加载时布局发生变化”|快速参考 → 相关部分 |
| **改进/优化** | “让速度更快”、“改善移动体验”|步骤 3（域名搜索：ux、react）|
| **实施深色模式** | “添加深色模式支持” |步骤 3（域：样式“深色模式”）|
| **添加图表/数据可视化** | “添加分析仪表板图表” |步骤 3（域：图表）|
| **堆栈最佳实践** | 《React 性能技巧》、《SwiftUI 导航》 |第 4 步（堆栈搜索）|

请遵循以下工作流程：

### 第 1 步：分析用户需求

从用户请求中提取关键信息：
- **产品类型**：娱乐（社交、视频、音乐、游戏）、工具（扫描仪、编辑器、转换器）、生产力（任务管理器、笔记、日历）或混合
- **目标受众**：C端消费用户；考虑年龄组、使用环境（通勤、休闲、工作）
- **风格关键词**：俏皮、充满活力、极简、深色模式、内容优先、沉浸式等。
- **堆栈**：React Native（该项目唯一的技术堆栈）

### 第 2 步：生成设计系统（必需）

**始终从 `--design-system` 开始**以获得带有推理的全面建议：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<product_type> <industry> <keywords>" --design-system [-p "Project Name"]
```

这个命令：
1. 并行搜索域（产品、风格、颜色、着陆、排版）
2.应用`ui-reasoning.csv`的推理规则来选择最佳匹配
3.返回完整的设计系统：图案、风格、颜色、排版、效果
4. 包括要避免的反模式

**示例：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness service" --design-system -p "Serenity Spa"
```

### 步骤 2b：坚持设计系统（主模式 + 覆盖模式）

要保存设计系统以进行**跨会话的分层检索**，请添加 `--persist`：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name"
```

这将创建：
- `design-system/MASTER.md` — 具有所有设计规则的全球事实来源
- `design-system/pages/` — 页面特定覆盖的文件夹

**使用特定于页面的覆盖：**
```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system --persist -p "Project Name" --page "dashboard"
```

这也创建了：
- `design-system/pages/dashboard.md` — 与主版的页面特定偏差

**分层检索的工作原理：**
1. 构建特定页面（例如“结账”）时，首先检查`design-system/pages/checkout.md`
2.如果页面文件存在，其规则**覆盖**主文件
3. 如果没有，则专用`design-system/MASTER.md`

**上下文感知检索提示：**
```
I am building the [Page Name] page. Please read design-system/MASTER.md.
Also check if design-system/pages/[page-name].md exists.
If the page file exists, prioritize its rules.
If not, use the Master rules exclusively.
Now, generate the code...
```

### 步骤 3：补充详细搜索（根据需要）

获得设计系统后，使用域搜索来获取更多详细信息：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain <domain> [-n <max_results>]
```

**何时使用详细搜索：**

|需要|域名 |示例|
|------|--------|---------|
|产品类型图案| `product` | `--domain product "entertainment social"` |
|更多款式选择 | `style` | `--domain style "glassmorphism dark"` |
|调色板 | `color` | `--domain color "entertainment vibrant"` |
|字体配对| `typography` | `--domain typography "playful modern"` |
|图表推荐| `chart` | `--domain chart "real-time dashboard"` |
|用户体验最佳实践 | `ux` | `--domain ux "animation accessibility"` |
|替代字体 | `typography` | `--domain typography "elegant luxury"` |
|个人谷歌字体| `google-fonts` | `--domain google-fonts "sans serif popular variable"` |
|着陆结构| `landing` | `--domain landing "hero social-proof"` |
| React Native 性能 | `react` | `--domain react "rerender memo list"` |
|应用程序界面a11y | `web` | `--domain web "accessibilityLabel touch safe-areas"` |
| AI提示/CSS关键词| `prompt` | `--domain prompt "minimalism"` |

### 步骤 4：堆栈指南（React Native）

获取 React Native 实现特定的最佳实践：

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack react-native
```

---

## 搜索参考

### 可用域

|域名 |用于 |关键词示例 |
|--------|---------|------------------|
| `product` |产品类型推荐| SaaS、电子商务、投资组合、医疗保健、美容、服务 |
| `style` | UI 样式、颜色、效果 |玻璃形态、极简主义、黑暗模式、野蛮主义 |
| `typography` |字体配对，Google 字体 |优雅、俏皮、专业、现代 |
| `color` |按产品类型划分的调色板 | saas、电子商务、医疗保健、美容、金融科技、服务 |
| `landing` |页面结构、CTA 策略 |英雄、以英雄为中心、推荐、定价、社会证明 |
| `chart` |图表类型、库推荐 |趋势、比较、时间线、漏斗、饼图 |
| `ux` |最佳实践、反模式|动画、辅助功能、z-index、加载 |
| `google-fonts` |单独的 Google 字体查找 |无衬线、等宽字体、日语、可变字体、流行 |
| `react` | React/Next.js 性能 |瀑布、捆绑、Suspense、备忘录、重新渲染、缓存 |
| `web` |应用程序界面指南（iOS/Android/React Native）| accessibilityLabel、触摸目标、安全区域、动态类型 |
| `prompt` | AI提示、CSS关键词| （样式名称）|

### 可用堆栈

|堆栈|焦点 |
|-------|-------|
| `react-native` |组件、导航、列表 |

---

## 工作流程示例

**用户请求：**“制作一个人工智能搜索主页。”

### 第 1 步：分析需求
- 产品类型：工具（AI搜索引擎）
- 目标受众：寻求快速、智能搜索的C端用户
- 风格关键词：现代、简约、内容优先、深色模式
- 堆栈：React Native

### 第 2 步：生成设计系统（必需）

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "AI search tool modern minimal" --design-system -p "AI Search"
```

**输出：** 完整的设计系统，包括图案、风格、颜色、排版、效果和反模式。

### 步骤 3：补充详细搜索（根据需要）

```bash
# Get style options for a modern tool product
python3 skills/ui-ux-pro-max/scripts/search.py "minimalism dark mode" --domain style

# Get UX best practices for search interaction and loading
python3 skills/ui-ux-pro-max/scripts/search.py "search loading animation" --domain ux
```

### 步骤 4：堆栈指南

```bash
python3 skills/ui-ux-pro-max/scripts/search.py "list performance navigation" --stack react-native
```

**然后：** 综合设计系统+详细搜索并实现设计。

---

## 输出格式

`--design-system` 标志支持两种输出格式：

```bash
# ASCII box (default) - best for terminal display
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system

# Markdown - best for documentation
python3 skills/ui-ux-pro-max/scripts/search.py "fintech crypto" --design-system -f markdown
```

---

## 获得更好结果的技巧

### 查询策略

- 使用**多维关键词**——结合产品+行业+语气+密度：`"entertainment social vibrant content-dense"`而不仅仅是`"app"`
- 为相同的需求尝试不同的关键字：`"playful neon"` → `"vibrant dark"` → `"content-first minimal"`
- 首先使用 `--design-system` 获取完整建议，然后使用 `--domain` 深入探讨您不确定的任何维度
- 始终添加 `--stack react-native` 以获取特定于实施的指导

### 常见症结

|问题 |做什么 |
|---------|------------|
|无法决定款式/颜色 |使用不同的关键字重新运行 `--design-system` |
|深色模式对比度问题 |快速参考§6：`color-dark-mode` + `color-accessible-pairs` |
|动画感觉不自然 |快速参考§7：`spring-physics` + `easing` + `exit-faster-than-enter` |
|表单用户体验很差 |快速参考§8：`inline-validation` + `error-clarity` + `focus-management` |
|导航感觉混乱|快速参考§9：`nav-hierarchy` + `bottom-nav-limit` + `back-behavior` |
|小屏幕上的布局中断 |快速参考§5：`mobile-first` + `breakpoint-consistency` |
|性能/卡顿|快速参考§3：`virtualize-lists` + `main-thread-budget` + `debounce-throttle` |

### 交付前检查表

- 在实施之前运行 `--domain ux "animation accessibility z-index loading"` 作为 UX 验证通过
- 浏览快速参考**§1–§3**（关键+高）作为最终审查
- 在 375px（小手机）和横向上进行测试
- 验证启用**减少运动**和最大尺寸**动态类型**的行为
- 独立检查暗模式对比度（不要假设亮模式值有效）
- 确认所有触摸目标≥44pt并且没有内容隐藏在安全区域后面

---

## 专业 UI 的通用规则

这些是经常被忽视的问题，使 UI 看起来不专业：
范围通知：以下规则适用于应用程序 UI（iOS/Android/React Native/Flutter），而不是桌面 - Web 交互模式。

### 图标和视觉元素

|规则|标准|避免 |为什么这很重要？
|------|----------|--------|----------------|
| **没有表情符号作为结构图标** |使用基于矢量的图标（例如 Lucide、react-native-vector-icons、@expo/vector-icons）。 |使用表情符号 (🎨 🚀 ⚙️) 进行导航、设置或系统控制。 |表情符号依赖于字体，跨平台不一致，并且无法通过设计 token进行控制。 |
| **纯矢量资源** |使用可清晰缩放并支持主题化的 SVG 或平台矢量图标。 |模糊或像素化的光栅 PNG 图标。 |确保可扩展性、清晰的渲染和暗/亮模式适应性。 |
| **稳定相互作用状态** |对印刷机状态使用颜色、不透明度或高度过渡，而无需更改布局边界。 |布局移动变换可移动周围的内容或触发视觉抖动。 |防止不稳定的交互并保持移动设备上的平滑运动/感知质量。 |
| **正确的品牌标志** |使用官方品牌资产并遵循其使用指南（间距、颜色、净空间）。 |猜测徽标路径、非正式地重新着色或修改比例。 |防止品牌滥用并确保法律/平台合规性。 |
| **一致的图标大小** |将图标大小定义为设计标记（例如 icon-sm、icon-md = 24pt、icon-lg）。 |随机混合任意值，例如 20pt / 24pt / 28pt。 |保持整个界面的节奏和视觉层次。 |
| **笔画一致性** |在同一视觉层内使用一致的描边宽度（例如，1.5 像素或 2 像素）。 |任意混合粗细笔画风格。 |不一致的笔画会降低感知的光泽度和凝聚力。 |
| **填充与大纲规则** |每个层次结构级别使用一种图标样式。 |在同一层次结构级别混合填充图标和轮廓图标。 |保持语义清晰度和文体连贯性。 |
| **触摸目标最小值** |最小 44×44pt 交互区域（如果图标较小，请使用 hitSlop）。 |没有扩展点击区域的小图标。 |符合可访问性和平台可用性标准。 |
| **图标对齐** |将图标与文本基线对齐并保持一致的填充。 |图标未对齐或周围间距不一致。 |防止细微的视觉不平衡，从而降低感知质量。 |
| **图标对比** |遵循 WCAG 对比度标准：小元素为 4.5:1，较大 UI 字形最小为 3:1。 |融入背景的低对比度图标。 |确保浅色和深色模式下的可访问性。 |


### 互动（应用程序）

|规则|做|不要 |
|------|----|----- |
| **点击反馈** |在 80-150 毫秒内提供清晰的按压反馈（波纹/不透明度/高度）|点击时没有视觉反应 |
| **动画计时** |通过平台原生缓动将微交互保持在 150-300 毫秒左右 |即时过渡或慢速动画（>500ms）|
| **无障碍焦点** |确保屏幕阅读器焦点顺序与视觉顺序匹配并且标签具有描述性 |未标记的控件或令人困惑的焦点遍历 |
| **禁用状态清晰度** |使用禁用语义（`disabled`/原生禁用props），减少强调，并且没有点击操作 |看似可点击但不执行任何操作的控件
| **触摸目标最小值** |保持点击区域 >=44x44pt (iOS) 或 >=48x48dp (Android)，当图标较小时扩大点击区域 |没有填充的微小点击目标或仅图标点击区域 |
| **手势冲突预防** |每个区域保留一个主要手势并避免嵌套的点击/拖动冲突 |重叠手势导致意外动作 |
| **语义原生控件** |更喜欢具有适当辅助功能角色的本机交互原语（`Button`、`Pressable`、平台等效项）|用作主要控件的通用容器没有语义 |

### 亮/暗模式对比

|规则|做|不要 |
|------|----|----- |
| **表面可读性（浅色）** |保持卡片/表面与背景清晰分离，并具有足够的不透明度/高度 |过于透明的表面模糊了层次结构 |
| **文本对比度（浅色）** |保持正文文本与浅色表面的对比度 >=4.5:1 |低对比度灰色正文 |
| **文本对比度（深色）** |在深色表面上保持主要文本对比度 >=4.5:1 和次要文本对比度 >=3:1 |融入背景的深色模式文本 |
| **边框和分隔线可见性** |确保分隔符在两个主题中都可见（不仅仅是浅色模式）|特定于主题的边框在一种模式下消失 |
| **状态对比奇偶校验** |保持按下/聚焦/禁用状态在浅色和深色主题中同样可区分 |仅为一个主题定义交互状态 |
| **token驱动的主题** |使用跨应用程序表面/文本/图标映射每个主题的语义颜色标记 |硬编码的每屏幕十六进制值|
| **稀松布和模态易读性** |使用足够强度的莫代尔稀松布来隔离前景内容（通常为 40-60% 黑色） |薄弱的稀松布使背景在视觉上产生竞争|

### 布局和间距

|规则|做|不要 |
|------|----|----- |
| **安全区域合规性** |尊重所有固定标题、选项卡栏和 CTA 栏的顶部/底部安全区域 |将固定 UI 放置在凹口、状态栏或手势区域下 |
| **系统栏间隙** |添加状态/导航栏和手势主页指示器的间距 |让可点击内容与 OS chrome 发生冲突 |
| **一致的内容宽度** |保持每个设备类别（手机/平板电脑）的可预测内容宽度 |在屏幕之间混合任意宽度 |
| **8dp 间距节奏** |使用一致的 4/8dp 间距系统来填充/间隙/部分间距 |无节奏的随机间距增量 |
| **可读文本测量** |保持长文本在大型设备上可读（避免在平板电脑上出现从边到边的段落） |全角长文本会损害可读性 |
| **节距层次** |按层次结构定义清晰的垂直节奏层（例如 16/24/32/48）|相似的 UI 级别但间距不一致 |
| **按断点自适应装订线** |在较大宽度和横向上增加水平插图 |所有设备尺寸/方向均具有相同的窄装订线 |
| **滚动和固定元素共存** |添加底部/顶部内容插图，以便列表不会隐藏在固定栏后面 |滚动内容被粘性页眉/页脚遮挡 |

---

## 交付前检查清单

在交付 UI 代码之前，请验证以下项目：
范围通知：此清单适用于应用程序 UI (iOS/Android/React Native/Flutter)。

### 视觉质量
- [ ] 不使用表情符号作为图标（使用 SVG 代替）
- [ ] 所有图标均来自一致的图标系列和风格
- [ ] 官方品牌资产使用比例正确、空间清晰
- [ ] 按下状态视觉效果不会移动布局边界或导致抖动
- [ ] 语义主题标记的使用一致（没有特定的每屏幕硬编码颜色）

### 互动
- [ ] 所有可点击元素提供清晰的按压反馈（波纹/不透明度/高度）
- [ ] 触摸目标满足最小尺寸（>=44x44pt iOS，>=48x48dp Android）
- [ ] 微交互计时保持在 150-300ms 范围内，具有原生的缓和感
- [ ] 禁用状态视觉上清晰且非交互
- [ ] 屏幕阅读器焦点顺序与视觉顺序相匹配，交互式标签具有描述性
- [ ] 手势区域避免嵌套/冲突交互（点击/拖动/向后滑动冲突）

### 亮/暗模式
- [ ] 主要文本对比度 >=4.5:1（明暗模式下）
- [ ] 浅色和深色模式下辅助文本对比度 >=3:1
- [ ] 分隔线/边界和交互状态在两种模式下都是可区分的
- [ ] 模态/抽屉稀松布不透明度足够强，可以保持前景的清晰度（通常为 40-60% 黑色）
- [ ] 两个主题在交付前都经过测试（不是从单个主题推断）

### 布局
- [ ] 标题、选项卡栏和底部 CTA 栏均考虑安全区域
- [ ] 滚动内容不会隐藏在固定/粘性条后面
- [ ] 在小手机、大手机和平板电脑上验证（纵向+横向）
- [ ] 水平插图/装订线根据设备尺寸和方向正确调整
- [ ] 跨组件、部分和页面级别保持 4/8dp 间距节奏
- [ ] 长格式文本度量在较大设备上仍然可读（无边到边段落）

### 辅助功能
- [ ] 所有有意义的图像/图标都有辅助功能标签
- [ ] 表单字段有标签、提示和清晰的错误消息
- [ ] 颜色不是唯一的指标
- [ ] 支持减少运动和动态文本大小，而不会破坏布局
- [ ] 正确宣布辅助功能特征/角色/状态（选择、禁用、扩展）