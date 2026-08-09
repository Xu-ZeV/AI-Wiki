# shadcn/ui 主题和定制

主题配置、CSS 变量、深色模式和组件定制。

## 深色模式设置

### Next.js 应用程序路由器

**1.安装下一个主题：**
```bash
npm install next-themes
```

**2.创建主题提供者：**
```tsx
// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**3.包装应用程序：**
```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**4.主题切换组件：**
```tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### Vite/其他框架

对下一个主题使用类似的方法或实施自定义解决方案：

```javascript
// Store preference
function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
}

// Initialize on load
if (localStorage.theme === 'dark' ||
    (!('theme' in localStorage) &&
     window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark')
}
```

## CSS 变量系统

shadcn/ui 使用 CSS 变量进行主题化。 `globals.css`中定义的变量：

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### 颜色格式

值使用 HSL 格式，不带 `hsl()` 包装器，以实现更好的不透明度控制：
```css
--primary: 222.2 47.4% 11.2%;  /* H S L */
```

在顺风中的用法：
```css
background: hsl(var(--primary));
background: hsl(var(--primary) / 0.5);  /* 50% opacity */
```

## 顺风配置

将 CSS 变量映射到 Tailwind 实用程序：

```ts
// tailwind.config.ts
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
```

## 颜色定制

### 方法 1：更新 CSS 变量

通过修改 `globals.css` 中的 CSS 变量来更改颜色：

```css
:root {
  --primary: 262.1 83.3% 57.8%;  /* Purple */
  --primary-foreground: 210 20% 98%;
}

.dark {
  --primary: 263.4 70% 50.4%;  /* Darker purple */
  --primary-foreground: 210 20% 98%;
}
```

### 方法 2：主题生成器

使用shadcn/ui主题生成器：https://ui.shadcn.com/themes

选择基色，生成主题，复制 CSS 变量。

### 方法 3：多个主题

使用数据属性创建主题变体：

```css
[data-theme="violet"] {
  --primary: 262.1 83.3% 57.8%;
  --primary-foreground: 210 20% 98%;
}

[data-theme="rose"] {
  --primary: 346.8 77.2% 49.8%;
  --primary-foreground: 355.7 100% 97.3%;
}
```

应用主题：
```tsx
<div data-theme="violet">
  <Button>Violet theme</Button>
</div>
```

## 组件定制

组件存在于您的代码库中 - 直接修改。

### 自定义变体

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background",
        // Add custom variant
        gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        // Add custom size
        xl: "h-14 rounded-md px-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

用途：
```tsx
<Button variant="gradient" size="xl">Custom Button</Button>
```

### 自定义样式

修改组件中的基本样式：

```tsx
// components/ui/card.tsx
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-lg",  // Modified
      className
    )}
    {...props}
  />
))
```

### 使用 className 覆盖

传递额外的类来覆盖：

```tsx
<Card className="border-2 border-purple-500 shadow-2xl hover:scale-105 transition-transform">
  Custom styled card
</Card>
```

## 基色预设

shadcn/ui 在 `init` 期间提供基色预设：

- **板岩**：冷灰色调
- **灰色**：中性灰色
- **锌**：暖灰色
- **中性**：平衡灰色
- **石材**：土灰色

在设置期间选择或稍后通过更新 CSS 变量进行更改。

## 风格变体

两种可用的组件样式：

- **默认**：更柔和、更圆润
- **纽约**：锐利，对比度更高

在 `init` 或 `components.json` 期间选择：

```json
{
  "style": "new-york",
  "tailwind": {
    "cssVariables": true
  }
}
```

## 半径定制

全局控制边界半径：

```css
:root {
  --radius: 0.5rem;  /* Default */
  --radius: 0rem;    /* Sharp corners */
  --radius: 1rem;    /* Rounded */
}
```

组件使用半径变量：
```tsx
className="rounded-lg"  /* Uses var(--radius) */
```

## 最佳实践

1. **使用CSS变量**：启用运行时主题切换
2. **一致的前景色**：将每种颜色与适当的前景色配对
3. **测试两个主题**：验证浅色和深色模式下的组件
4. **语义命名**：使用 `destructive` 而不是 `red`、`muted` 而不是 `gray`
5. **辅助功能**：保持足够的色彩对比度（WCAG AA 最低）
6. **组件覆盖**：使用 `className` 属性进行一次性定制
7. **提取模式**：创建自定义变体以进行重复定制
