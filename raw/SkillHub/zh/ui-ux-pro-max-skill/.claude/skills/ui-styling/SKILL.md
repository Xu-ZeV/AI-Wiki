---
name: ckm:ui-styling
description: 使用 shadcn/ui 组件（基于 Radix UI + Tailwind 构建）、Tailwind CSS 实用优先样式和基于画布的视觉设计创建美观、易于访问的UI。在构建UI、实现设计系统、创建响应式布局、添加可访问组件（对话框、下拉菜单、表单、表格）、自定义主题和颜色、实现深色模式、生成视觉设计和海报或跨应用程序建立一致的样式模式时使用。
argument-hint: "[component or layout]"
license: MIT
metadata:
  author: claudekit
  version: "1.0.0"
---

# UI 设计技巧

结合 shadcn/ui 组件、Tailwind CSS 实用样式和基于画布的视觉设计系统创建美观、易于访问的UI的综合技能。

## 参考

- shadcn/ui: https://ui.shadcn.com/llms.txt
- 顺风CSS：https://tailwindcss.com/docs

## 何时使用此技能

使用时：
- 使用基于 React 的框架（Next.js、Vite、Remix、Astro）构建 UI
- 实施可访问的组件（对话框、表单、表格、导航）
- 使用实用优先的 CSS 方法进行样式设置
- 创建响应式、移动优先的布局
- 实现深色模式和主题定制
- 构建具有一致token的设计系统
- 生成视觉设计、海报或品牌材料
- 具有即时视觉反馈的快速原型制作
- 添加复杂的 UI 模式（数据表、图表、命令面板）

## 核心堆栈

### 组件层：shadcn/ui
- 通过 Radix UI 原语预构建可访问组件
- 复制粘贴分发模型（组件位于您的代码库中）
- TypeScript-first 具有完整的类型安全性
- 复杂 UI 的可组合原语
- 基于CLI的安装和管理

### 样式层：Tailwind CSS
- 实用优先的 CSS 框架
- 构建时处理，运行时开销为零
- 移动优先的响应式设计
- 一致的设计标记（颜色、间距、版式）
- 自动消除死代码

### 视觉设计层：画布
- 博物馆品质的视觉作品
- 哲学驱动的设计方法
- 复杂的视觉传达
- 最少的文字，最大的视觉冲击力
- 系统的图案和精致的美学

## 快速入门

### 组件+样式设置

**使用 Tailwind 安装 shadcn/ui:**
```bash
npx shadcn@latest init
```

CLI 提示框架、TypeScript、路径和主题首选项。这会配置 shadcn/ui 和 Tailwind CSS。

**添加组件：**
```bash
npx shadcn@latest add button card dialog form
```

**使用具有实用样式的组件：**
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function Dashboard() {
  return (
    <div className="container mx-auto p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">View your metrics</p>
          <Button variant="default" className="w-full">
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 替代方案：仅顺风设置

**投票项目：**
```bash
npm install -D tailwindcss @tailwindcss/vite
```

```javascript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'
export default { plugins: [tailwindcss()] }
```

```css
/* src/index.css */
@import "tailwindcss";
```

## 组件库指南

**全面的组件目录，包含使用模式、安装和组合示例。**

参见：`references/shadcn-components.md`

涵盖：
- 表单和输入组件（按钮、输入、选择、复选框、日期选择器、表单验证）
- 布局和导航（卡片、选项卡、手风琴、导航菜单）
- 覆盖层和对话框（对话框、抽屉、弹出框、Toast、命令）
- 反馈和状态（警报、进度、骨架）
- 显示组件（表格、数据表、头像、徽章）

## 主题和定制

**主题配置、CSS 变量、暗模式实现和组件定制。**

参见：`references/shadcn-theming.md`

涵盖：
- 带有下一个主题的深色模式设置
- CSS变量系统
- 颜色定制和调色板
- 组件变体定制
- 主题切换实施

## 辅助功能模式

**ARIA 模式、键盘导航、屏幕阅读器支持和可访问的组件使用。**

参见：`references/shadcn-accessibility.md`

涵盖：
- Radix UI 辅助功能
- 键盘导航模式
- 焦点管理
- 屏幕阅读器公告
- 表单验证可访问性

## Tailwind 实用程序

**布局、间距、排版、颜色、边框和阴影的核心实用程序类。**

参见：`references/tailwind-utilities.md`

涵盖：
- 布局实用程序（Flexbox、网格、定位）
- 间距系统（填充、边距、间隙）
- 版式（字体大小、粗细、对齐方式、行高）
- 颜色和背景
- 边框和阴影
- 自定义样式的任意值

## 响应式设计

**移动优先断点、响应式实用程序和自适应布局。**

参见：`references/tailwind-responsive.md`

涵盖：
- 移动优先方法
- 断点系统（sm、md、lg、xl、2xl）
- 响应式实用模式
- 容器查询
- 最大宽度查询
- 自定义断点

## 顺风定制

**配置文件结构、自定义实用程序、插件和主题扩展。**

参见：`references/tailwind-customization.md`

涵盖：
- 自定义标记的 @theme 指令
- 自定义颜色和字体
- 间距和断点扩展
- 自定义实用程序创建
- 定制变体
- 层组织（@layer 基础、组件、实用程序）
- 应用组件提取指令

## 视觉设计系统

**基于画布的设计理念、视觉传达原则和复杂的构图。**

参见：`references/canvas-design-system.md`

涵盖：
- 设计哲学方法
- 通过文字进行视觉传达
- 系统的模式和构图
- 色彩、形式和空间设计
- 最少的文本集成
- 博物馆品质的执行力
- 多页面设计系统

## 实用脚本

**用于组件安装和配置生成的 Python 自动化。**

### shadcn_add.py
添加具有依赖性处理的 shadcn/ui 组件：
```bash
python scripts/shadcn_add.py button card dialog
```

### tailwind_config_gen.py
生成具有自定义主题的 tailwind.config.js：
```bash
python scripts/tailwind_config_gen.py --colors brand:blue --fonts display:Inter
```

## 最佳实践

1. **组件组合**：从简单、可组合的基元构建复杂的 UI
2. **Utility-First Styling**：直接使用Tailwind类；提取组件仅用于真正的重复
3. **移动优先响应**：从移动样式开始，分层响应变体
4. **辅助功能优先**：利用 Radix UI 原语、添加焦点状态、使用语义 HTML
5. **设计标记**：使用一致的间距比例、调色板、排版系统
6. **深色模式一致性**：将深色变体应用于所有主题元素
7. **性能**：利用自动CSS清除，避免动态类名
8. **TypeScript**：使用完整的类型安全性以获得更好的 DX
9. **视觉层次**：让构图引导注意力，有意使用间距和颜色
10. **专家工艺**：每个细节都很重要 - 将 UI 视为一门手艺

## 参考导航

**组件库**
- `references/shadcn-components.md` - 完整的组件目录
- `references/shadcn-theming.md` - 主题和定制
- `references/shadcn-accessibility.md` - 辅助功能模式

**造型系统**
- `references/tailwind-utilities.md` - 核心实用程序类
- `references/tailwind-responsive.md` - 响应式设计
- `references/tailwind-customization.md` - 配置和扩展

**视觉设计**
- `references/canvas-design-system.md` - 设计理念和画布工作流程

**自动化**
- `scripts/shadcn_add.py` - 组件安装
- `scripts/tailwind_config_gen.py` - 配置生成

## 常见模式

**带有验证的表单：**
```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export function LoginForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" }
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="space-y-6">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full">Sign In</Button>
      </form>
    </Form>
  )
}
```

**具有深色模式的响应式布局：**
```tsx
<div className="min-h-screen bg-white dark:bg-gray-900">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Content
          </h3>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

## 资源

- shadcn/ui 文档：https://ui.shadcn.com
- Tailwind CSS 文档：https://tailwindcss.com
- 基数UI：https://radix-ui.com
- 顺风UI：https://tailwindui.com
- 无头UI：https://headlessui.com
- v0（人工智能UI生成器）：https://v0.dev
