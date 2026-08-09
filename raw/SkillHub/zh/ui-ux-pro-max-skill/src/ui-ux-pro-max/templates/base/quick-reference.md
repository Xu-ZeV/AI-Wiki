## 何时申请

当任务涉及**UI结构、视觉设计决策、交互模式或用户体验质量控制**时，应使用此技能。

### 必须使用

在以下情况必须调用此技能：

- 设计新的页面（登陆页面、仪表板、管理、SaaS、移动应用程序）
- 创建或构建UI组件（按钮、弹窗、表单、表格、图表等）
- 选择配色方案、字体系统、间距规范或布局体系
- 审查UI代码的用户体验、可访问性或视觉一致性
- 实现导航结构、动效或响应式行为
- 做产品层级的设计决策（风格、信息层级、品牌表达）
- 提升界面的感知质量、清晰度或可用性

### 推荐

在以下情况建议使用此技能：

- UI 看起来“不够专业”，但原因不明确
- 收到可用性或体验方面的反馈
- 准备上线前的UI质量优化
- 需要跨平台设计（Web / iOS / Android）
- 构建设计系统或可复用组件库

### 跳过

在以下情况无需使用此技能：

- 纯后端逻辑开发
- 仅涉及API或数据库设计
- 与界面无关的性能优化
- 基础设施或 DevOps 工作
- 非视觉类脚本或自动化任务

**判断标准**：如果任务会改变某个功能**外观如何、使用起来如何、如何运动或如何被**交互，就应该使用此技能。

## 按优先级规则类别

*供人工/AI检索：按1→10决定先关注哪类规则；需要细则时用`--domain <Domain>`查询。脚本不读取表。*

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