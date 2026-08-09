# shadcn/ui 辅助功能模式

ARIA 模式、键盘导航、屏幕阅读器支持和可访问的组件使用。

## 基础：Radix UI 基元

shadcn/ui 构建在 Radix UI 原语上 - 遵循 WAI-ARIA 设计模式的无样式、可访问组件。

好处：
- 内置键盘导航
- 屏幕阅读器公告
- 焦点管理
- 自动应用 ARIA 属性
- 根据可访问性标准进行测试

## 键盘导航

### 焦点管理

**聚焦可见状态：**
```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Accessible Button
</Button>
```

**跳至内容：**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2">
  Skip to content
</a>

<main id="main-content">
  {/* Content */}
</main>
```

### 对话框/模态导航

对话框通过 Radix Dialog 原语自动捕获焦点：

```tsx
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    {/* Focus trapped here */}
    <input />  {/* Auto-focused */}
    <Button>Action</Button>
    {/* Esc to close, Tab to navigate */}
  </DialogContent>
</Dialog>
```

特点：
- 焦点被困在对话框中
- Esc键关闭
- 选项卡循环浏览可聚焦元素
- 焦点返回到关闭时触发

### 下拉/菜单导航

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

键盘快捷键：
- `Space/Enter`：打开菜单
- `Arrow Up/Down`：导航项目
- `Esc`：关闭菜单
- `Tab`：关闭并移动焦点

### 命令面板导航

```tsx
import { Command } from "@/components/ui/command"

<Command>
  <CommandInput placeholder="Search..." />
  <CommandList>
    <CommandGroup heading="Suggestions">
      <CommandItem>Calendar</CommandItem>
      <CommandItem>Search</CommandItem>
    </CommandGroup>
  </CommandList>
</Command>
```

特点：
- 输入要过滤的内容
- 箭头键进行导航
- 输入选择
- Esc 关闭

## 屏幕阅读器支持

### 语义 HTML

使用正确的 HTML 元素：

```tsx
// Good: Semantic HTML
<button>Click me</button>
<nav><a href="/">Home</a></nav>

// Avoid: Div soup
<div onClick={handler}>Click me</div>
```

### ARIA 标签

**标记交互元素：**
```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

<Input aria-label="Email address" type="email" />
```

**描述元素：**
```tsx
<Button aria-describedby="delete-description">
  Delete Account
</Button>
<p id="delete-description" className="sr-only">
  This action permanently deletes your account and cannot be undone
</p>
```

### 仅限屏幕阅读器文本

使用 `sr-only` 类仅显示屏幕阅读器内容：

```tsx
<Button>
  <Trash className="h-4 w-4" />
  <span className="sr-only">Delete item</span>
</Button>

// CSS for sr-only
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 实时区域

公布动态内容：

```tsx
<div aria-live="polite" aria-atomic="true">
  {message}
</div>

// For urgent updates
<div aria-live="assertive">
  {error}
</div>
```

Toast 组件包括活动区域：
```tsx
const { toast } = useToast()

toast({
  title: "Success",
  description: "Profile updated"
})
// Announced to screen readers automatically
```

## 表单辅助功能

### 标签和说明

**始终标记输入：**
```tsx
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

**添加说明：**
```tsx
import { FormDescription, FormMessage } from "@/components/ui/form"

<FormItem>
  <FormLabel>Username</FormLabel>
  <FormControl>
    <Input {...field} />
  </FormControl>
  <FormDescription>
    Your public display name
  </FormDescription>
  <FormMessage />  {/* Error messages */}
</FormItem>
```

### 错误处理

向屏幕阅读器宣布错误：

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input
          {...field}
          aria-invalid={!!fieldState.error}
          aria-describedby={fieldState.error ? "email-error" : undefined}
        />
      </FormControl>
      <FormMessage id="email-error" />
    </FormItem>
  )}
/>
```

### 必填字段

指明必填字段：

```tsx
<Label htmlFor="name">
  Name <span className="text-destructive">*</span>
  <span className="sr-only">(required)</span>
</Label>
<Input id="name" required />
```

### 字段集和图例

集团相关领域：

```tsx
<fieldset>
  <legend className="text-lg font-semibold mb-4">
    Contact Information
  </legend>
  <div className="space-y-4">
    <FormField name="email" />
    <FormField name="phone" />
  </div>
</fieldset>
```

## 特定于组件的模式

### 手风琴

```tsx
import { Accordion } from "@/components/ui/accordion"

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>
      {/* Includes aria-expanded, aria-controls automatically */}
      Is it accessible?
    </AccordionTrigger>
    <AccordionContent>
      {/* Hidden when collapsed, announced when expanded */}
      Yes. Follows WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### 标签

```tsx
import { Tabs } from "@/components/ui/tabs"

<Tabs defaultValue="account">
  <TabsList role="tablist">
    {/* Arrow keys navigate, Space/Enter activates */}
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    {/* Hidden unless selected, aria-labelledby links to trigger */}
    Account content
  </TabsContent>
</Tabs>
```

### 选择

```tsx
import { Select } from "@/components/ui/select"

<Select>
  <SelectTrigger aria-label="Choose theme">
    <SelectValue placeholder="Theme" />
  </SelectTrigger>
  <SelectContent>
    {/* Keyboard navigable, announced to screen readers */}
    <SelectItem value="light">Light</SelectItem>
    <SelectItem value="dark">Dark</SelectItem>
  </SelectContent>
</Select>
```

### 复选框和单选框

```tsx
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

<div className="flex items-center space-x-2">
  <Checkbox id="terms" aria-describedby="terms-description" />
  <Label htmlFor="terms">Accept terms</Label>
</div>
<p id="terms-description" className="text-sm text-muted-foreground">
  You agree to our Terms of Service and Privacy Policy
</p>
```

### 警报

```tsx
import { Alert } from "@/components/ui/alert"

<Alert role="alert">
  {/* Announced immediately to screen readers */}
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired
  </AlertDescription>
</Alert>
```

## 色彩对比

确保文本和背景之间有足够的对比度。

**WCAG 要求：**
- **AA**：普通文本为 4.5:1，大文本为 3:1
- **AAA**：普通文本为 7:1，大文本为 4.5:1

**检查默认值：**
```tsx
// Good: High contrast
<p className="text-gray-900 dark:text-gray-100">Text</p>

// Avoid: Low contrast
<p className="text-gray-400 dark:text-gray-600">Hard to read</p>
```

**静音文本：**
```tsx
// Use semantic muted foreground
<p className="text-muted-foreground">
  Secondary text with accessible contrast
</p>
```

## 焦点指标

始终提供可见的焦点指示器：

**默认对焦环：**
```tsx
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Button
</Button>
```

**自定义焦点样式：**
```tsx
<a href="#" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:underline">
  Link
</a>
```

**不要删除焦点样式：**
```tsx
// Avoid
<button className="focus:outline-none">Bad</button>

// Use focus-visible instead
<button className="focus-visible:ring-2">Good</button>
```

## 运动和动画

尊重减少运动偏好：

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

在组件中：
```tsx
<div className="transition-all motion-reduce:transition-none">
  Respects user preference
</div>
```

## 测试清单

- [ ] 所有交互元素均可通过键盘访问
- [ ] 焦点指示可见
- [ ] 屏幕阅读器正确朗读所有内容
- [ ] 公布和关联的表格错误
- [ ] 色彩对比度符合 WCAG AA
- [ ] 使用语义 HTML
- [ ] ARIA 标签为仅图标按钮提供
- [ ] 模态/对话框焦点陷阱工作
- [ ] 下拉菜单/选择键盘可导航
- [ ] 实时区域宣布更新
- [ ] 尊重减少的运动偏好
- [ ] 适用于浏览器缩放至 200%
- [ ] 逻辑 Tab 键顺序
- [ ] 跳过导航提供的链接

## 工具

**测试工具：**
- 灯塔无障碍审核
- ax DevTools 浏览器扩展
- NVDA/JAWS 屏幕阅读器
- 仅键盘导航测试
- 颜色对比度检查器（对比度、WebAIM）

**自动化测试：**
```bash
npm install -D @axe-core/react
```

```tsx
import { useEffect } from 'react'

if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000)
  })
}
```
