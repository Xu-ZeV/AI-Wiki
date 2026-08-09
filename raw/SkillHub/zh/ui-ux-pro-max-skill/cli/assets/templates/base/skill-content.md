# {{标题}}

{{描述}}
{{QUICK_REFERENCE}}
# 先决条件

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
| **新项目/页面** | “做一个登陆页面”、“构建仪表板”|步骤1→步骤2（设计系统） |
| **新组件** | “创建定价卡”、“添加模式”|第 3 步（域名搜索：style、ux）|
| **选择样式/颜色/字体** | “金融科技APP适合什么风格？”、“推荐” |步骤2（设计系统） |
| **查看现有UI** | “查看此页面以了解用户体验问题”、“检查无障碍”|上面的快速参考清单 |
| **修复UI错误** | “按钮悬停已损坏”、“加载时布局发生变化”|快速参考 → 相关部分 |
| **改进/优化** | “让这更快”、“改善移动体验”|步骤 3（域名搜索：ux、react）|
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
| `react` | React/Next.js 性能 |瀑布、捆绑、Suspense、备忘录、重新渲染、缓存 |
| `web` |应用程序界面指南（iOS/Android/React Native）| accessibilityLabel、触摸目标、安全区域、动态类型 |
| `prompt` | AI提示、CSS关键词| （样式名称）|

### 可用堆栈

|堆栈|焦点 |
|-------|-------|
| `react-native` |组件、导航、列表 |

---

## 工作流程示例

**用户请求：**“做一个AI搜索主页。”

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