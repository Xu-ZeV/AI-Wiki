# Tailwind CSS 动态类生成

## 规则

切勿使用字符串连接或模板文字动态构造 Tailwind CSS 类名。 Tailwind 的构建过程无法检测动态生成的类名，导致生产中样式丢失。

## 为什么这很重要

- Tailwind 在构建时使用静态分析来确定要包含哪些 CSS 类
- 动态构造的类名（例如，`bg-${color}-500`）对于 Tailwind 的扫描仪来说是不可见的
- 类在 JIT 开发中工作，但在生产构建中默默失败
- 这是“它在本地工作但在生产中不起作用”错误的常见来源

## 错误代码

```vue
<script setup>
const props = defineProps({
  color: String, // 'red', 'blue', 'green'
  size: String   // 'sm', 'md', 'lg'
})
</script>

<template>
  <!-- WRONG: Tailwind cannot detect these classes -->
  <div :class="`bg-${color}-500 text-${size}`">
    Content
  </div>

  <!-- WRONG: String concatenation -->
  <div :class="'p-' + padding">
    Content
  </div>

  <!-- WRONG: Template literal in array -->
  <div :class="[`gap-x-${spacing}`]">
    Content
  </div>
</template>
```

## 好的代码

```vue
<script setup>
const props = defineProps({
  color: String,
  size: String
})

// Use a mapping object with complete class names
const colorClasses = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500'
}

const sizeClasses = {
  sm: 'text-sm p-2',
  md: 'text-base p-4',
  lg: 'text-lg p-6'
}
</script>

<template>
  <!-- CORRECT: Full class names that Tailwind can detect -->
  <div :class="[colorClasses[color], sizeClasses[size]]">
    Content
  </div>
</template>
```

## 使用条件对象

```vue
<script setup>
const props = defineProps({
  variant: String // 'primary', 'secondary', 'danger'
})
</script>

<template>
  <!-- CORRECT: All class names are complete strings -->
  <button :class="{
    'bg-blue-500 hover:bg-blue-600': variant === 'primary',
    'bg-gray-500 hover:bg-gray-600': variant === 'secondary',
    'bg-red-500 hover:bg-red-600': variant === 'danger'
  }">
    Click me
  </button>
</template>
```

## 真正动态类的安全列表

如果必须使用动态类，请将它们添加到 Tailwind 的安全列表中：

```javascript
// tailwind.config.js
module.exports = {
  safelist: [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    // Or use patterns (use sparingly - increases bundle size)
    {
      pattern: /bg-(red|blue|green)-(100|500|900)/
    }
  ]
}
```

## 替代方案：CSS 自定义属性

对于真正的动态值，请使用 CSS 自定义属性：

```vue
<script setup>
const props = defineProps({
  customColor: String // Any hex color
})
</script>

<template>
  <!-- Use CSS variable for truly dynamic values -->
  <div
    class="dynamic-bg"
    :style="{ '--dynamic-color': customColor }"
  >
    Content
  </div>
</template>

<style>
.dynamic-bg {
  background-color: var(--dynamic-color);
}
</style>
```

## 参考文献

- [Tailwind CSS 动态类名称](https://tailwindcss.com/docs/content-configuration#dynamic-class-names)
- [Tailwind 安全列表](https://tailwindcss.com/docs/content-configuration#safelisting-classes)
