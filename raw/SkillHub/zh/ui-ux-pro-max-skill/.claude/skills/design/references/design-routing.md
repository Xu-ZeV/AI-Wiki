# 设计路由指南

何时使用每个设计子技能。

## 技能概述

|技能|目的|关键文件|
|-------|---------|-----------|
|品牌 |品牌形象、声音、资产| SKILL.md + 10 条参考文献 + 3 个脚本 |
|设计系统|token 架构、规格 | SKILL.md + 7 条参考文献 + 2 个脚本 |
| ui 样式 |组件实现| SKILL.md + 7 条参考文献 + 2 个脚本 |
|标志设计| AI 徽标生成（55 种样式，30 个调色板）| SKILL.md + 4 个参考文献 + 2 个脚本 |
| cip 设计 |企业形象计划（50 个可交付成果）| SKILL.md + 3 个参考文献 + 3 个脚本 |
|幻灯片|使用 Chart.js 进行 HTML 演示 | SKILL.md + 4 条参考文献 |
|横幅设计 |社交、广告、网络、印刷横幅（22 种样式）| SKILL.md + 1 参考 |
|图标设计| SVG 图标生成（15 种样式，Gemini 3.1 Pro） | SKILL.md + 1 份参考资料 + 1 份脚本 |

## 按任务类型进行路由

### 品牌识别任务
**→ 品牌**

- 定义品牌颜色和版式
- 创建徽标使用指南
- 建立品牌声音和基调
- 组织和验证资产
- 创建消息传递框架
- 审核品牌一致性

### token系统任务
**→ 设计系统**

- 创建设计 token JSON
- 生成CSS变量
- 定义组件规格
- 将token映射到 Tailwind 配置
- 验证代码中的token使用情况
- 记录状态和变体

### 实施任务
**→ ui 样式**

- 添加shadcn/ui组件
- 具有 Tailwind 类的风格
- 实施深色模式
- 创建响应式布局
- 构建可访问的组件

### 标志设计任务
**→ 标志设计**

- 使用 AI 创建徽标（Gemini Nano Banana）
- 搜索标志样式、调色板、行业指南
- 生成设计概要
- 探索 55 多种风格（简约、复古、奢华、几何等）

### 企业形象计划任务
**→ cip 设计**

- 生成 CIP 可交付成果（名片、信笺、标牌、车辆、服装）
- 通过行业/风格分析创建 CIP 简介
- 生成带/不带徽标的模型（Gemini Flash/Pro）
- 从 CIP 模型渲染 HTML 演示文稿

### 演示任务
**→ 幻灯片**

- 创建战略性 HTML 演示文稿
- 使用 Chart.js 进行数据可视化
- 将文案公式应用于幻灯片内容
- 使用布局模式和设计标记

### 横幅设计任务
**→ 横幅设计**

- 为社交媒体（Facebook、Twitter、LinkedIn、YouTube、Instagram）设计横幅
- 创建广告横幅（Google Ads、元广告）
- 网站英雄横幅和标题
- 打印横幅和封面
- 22 种艺术指导风格（极简主义、大胆排版、渐变、玻璃形态等）

### 图标设计任务
**→ 图标设计**

- 使用 AI 生成 SVG 图标（Gemini 3.1 Pro 预览版）
- 多种风格的批量图标变化
- 多尺寸导出（16px、24px、32px、48px）
- 15 种样式：轮廓、填充、双色调、圆形、锐利、渐变等。
- 12 个类别：导航、行动、通信、媒体、商业、数据

## 按问题类型路由

|问题 |技能|
|----------|-------|
| “这应该是什么颜色？” |品牌 |
| “如何为 X 创建token？” |设计系统|
| “如何构建按钮组件？” | ui 样式 |
| “这个是品牌的吗？” |品牌 |
| “我应该在这里使用 CSS 变量吗？” |设计系统|
| “如何添加深色模式？” | ui 样式 |
| “为我的品牌创建一个徽标”|标志设计|
| “生成名片模型”| cip 设计 |
| “创建融资演讲稿”|幻灯片|
| “设计品牌形象包装”| cip 设计 |
| “什么标志风格适合我的行业？” |标志设计|
| “设计 Facebook 封面”|横幅设计 |
| “为 Google 创建广告横幅” |横幅设计 |
| “制作网站英雄横幅” |横幅设计 |
| “生成设置图标” |图标设计|
| “为我的应用程序创建 SVG 图标” |图标设计|
| “设计图标集”|图标设计|

## 多技能工作流程

### 新项目设置

```
1. brand → Define identity
   - Colors, typography, voice

2. design-system → Create tokens
   - Primitive, semantic, component

3. ui-styling → Implement
   - Configure Tailwind, add components
```

### 设计系统迁移

```
1. brand → Audit existing
   - Extract brand colors, fonts

2. design-system → Formalize tokens
   - Create three-layer architecture

3. ui-styling → Update code
   - Replace hardcoded values
```

### 组件创建

```
1. design-system → Reference specs
   - Button states, sizes, variants

2. ui-styling → Implement
   - Build with shadcn/ui + Tailwind
```

## 技能依赖

```
brand
    ↓ (colors, typography)
design-system
    ↓ (tokens, specs)
ui-styling
    ↓ (components)
Application Code
```

## 快速命令

**品牌：**
```bash
node .claude/skills/brand/scripts/inject-brand-context.cjs
node .claude/skills/brand/scripts/validate-asset.cjs <path>
```

**token：**
```bash
node .claude/skills/design-system/scripts/generate-tokens.cjs -c tokens.json
node .claude/skills/design-system/scripts/validate-tokens.cjs -d src/
```

**组件：**
```bash
npx shadcn@latest add button card input
```

## 何时使用多种技能

在以下情况下使用**全部八个**：
- 从头开始的完整品牌包（徽标 → CIP → 演示）

在以下情况下使用**品牌 + 设计系统 + ui 样式**：
- 设计系统设置和实施

在以下情况下使用 **标志设计 + cip 设计**：
- 完整的品牌标识包以及可交付的模型

在以下情况下使用 **徽标设计 + cip 设计 + 幻灯片**：
- 品牌推介：生成徽标、创建 CIP 模型、构建推介平台

在以下情况下使用**横幅设计+品牌**：
- 社交媒体存在：所有平台上的品牌横幅

在以下情况下使用**图标设计+设计系统**：
- 自定义图标集匹配设计 token和组件规格

在以下情况下使用**品牌+设计系统**：
- 定义设计语言而不实施

在以下情况下使用 **设计系统 + ui 样式**：
- 在代码中实施现有品牌
- 构建组件库
