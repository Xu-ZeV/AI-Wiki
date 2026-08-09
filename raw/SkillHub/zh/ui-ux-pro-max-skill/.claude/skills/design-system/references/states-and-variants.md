# 状态和变体

组件状态定义和变体模式。

## 交互状态

### 状态定义

|状态 |触发|视觉变化|
|-------|---------|---------------|
|默认 |无 |Bases外观|
|悬停|鼠标悬停 |轻微色偏 |
|焦点|选项卡/单击 |对焦环|
|活跃 |鼠标按下 |最深的颜色 |
|已禁用 |禁用属性 |降低不透明度 |
|加载|异步操作 |微调器 + 不透明度 |

### 状态优先级

当多个状态适用时，优先级（从最高到最低）：

1. 残疾人
2. 加载
3. 主动
4. 焦点
5.悬停
6.默认

### 状态转换

```css
/* Standard transition for interactive elements */
.interactive {
  transition-property: color, background-color, border-color, box-shadow;
  transition-duration: var(--duration-fast);
  transition-timing-function: ease-in-out;
}
```

|过渡|持续时间 |宽松|
|------------|----------|--------|
|颜色变化 | 150 毫秒 |缓入缓出 |
|背景| 150 毫秒 |缓入缓出 |
|转变| 200 毫秒 |缓出 |
|不透明度| 150 毫秒 |轻松|
|影子| 200 毫秒 |缓出 |

## 焦点状态

### 对焦环规格

```css
/* Standard focus ring */
.focusable:focus-visible {
  outline: none;
  box-shadow: 0 0 0 var(--ring-offset) var(--color-background),
              0 0 0 calc(var(--ring-offset) + var(--ring-width)) var(--ring-color);
}
```

|物业 |价值|
|----------|-------|
|戒指宽度| 2 像素 |
|环偏移| 2 像素 |
|戒指颜色 |初级 (蓝色-500) |
|偏移颜色 |背景|

### 聚焦内在

```css
/* Container focus when child is focused */
.container:focus-within {
  border-color: var(--color-ring);
}
```

## 残疾人状态

### 视觉治疗

```css
.disabled {
  opacity: var(--opacity-disabled); /* 0.5 */
  pointer-events: none;
  cursor: not-allowed;
}
```

|物业 |禁用值|
|----------|----------------|
|不透明度| 50% |
|指针事件|无 |
|光标|不允许 |
|背景|静音|
|颜色 |静音前景 |

### 辅助功能

- 使用 `aria-disabled="true"` 禁用语义
- 对表单元素使用 `disabled` 属性
- 保持足够的对比度（最低 3:1）

## 加载状态

### 微调器放置

|组件|微调器位置 |
|-----------|------------------|
|按钮|替换图标或中心 |
|输入 |尾随位置 |
|卡|中心覆盖|
|页 |视口中心 |

### 加载处理

```css
.loading {
  position: relative;
  pointer-events: none;
}

.loading::after {
  content: '';
  /* spinner styles */
}

.loading > * {
  opacity: 0.7;
}
```

## 错误状态

### 视觉指示器

```css
.error {
  border-color: var(--color-error);
  color: var(--color-error);
}

.error:focus-visible {
  box-shadow: 0 0 0 2px var(--color-background),
              0 0 0 4px var(--color-error);
}
```

|元素|错误处理 |
|---------|-----------------|
|输入边框 |红500 |
|输入对焦环|红色/20% |
|帮助文本|红-600 |
|图标|红500 |

### 错误消息

- 位于输入下方
- 使用错误颜色
- 包含可访问性图标
- 清除有效输入

## 变体模式

### 颜色变体

```css
/* Pattern for color variants */
.component {
  --component-bg: var(--color-primary);
  --component-fg: var(--color-primary-foreground);
  background: var(--component-bg);
  color: var(--component-fg);
}

.component.secondary {
  --component-bg: var(--color-secondary);
  --component-fg: var(--color-secondary-foreground);
}

.component.destructive {
  --component-bg: var(--color-destructive);
  --component-fg: var(--color-destructive-foreground);
}
```

### 尺寸变化

```css
/* Pattern for size variants */
.component {
  --component-height: 40px;
  --component-padding: var(--space-4);
  --component-font: var(--font-size-sm);
}

.component.sm {
  --component-height: 32px;
  --component-padding: var(--space-3);
  --component-font: var(--font-size-xs);
}

.component.lg {
  --component-height: 48px;
  --component-padding: var(--space-6);
  --component-font: var(--font-size-base);
}
```

## 辅助功能要求

### 颜色对比

|元素|最低比率|
|---------|---------------|
|普通文本 | 4.5:1 |
|大文本（18px+）| 3:1 |
|UI组件 | 3:1 |
|焦点指示器| 3:1 |

### 状态指标

- 永远不要仅仅依赖颜色
- 使用图标、文本或图案
- 确保焦点可见
- 提供加载公告

### ARIA 州

```html
<!-- Disabled -->
<button disabled aria-disabled="true">Submit</button>

<!-- Loading -->
<button aria-busy="true" aria-describedby="loading-text">
  <span id="loading-text" class="sr-only">Loading...</span>
</button>

<!-- Error -->
<input aria-invalid="true" aria-describedby="error-msg">
<span id="error-msg" role="alert">Error message</span>
```
