# 多根组件类属性继承

## 规则

当 Vue 3 组件具有多个根元素时，来自父级的类和样式绑定不会自动失效。您必须将 `$attrs.class` 或 `$attrs.style` 显式绑定到目标元素。

## 为什么这很重要

- Vue 3组件可以有多个根元素（片段）
- 与单根组件不同，多根组件没有自动属性失效
- 如果没有显式处理，从父级传递的类和样式将被默默忽略
- Vue 将发出运行时警告，但样式/类根本不适用

## 错误代码

```vue
<!-- ChildComponent.vue - WRONG: classes from parent won't apply -->
<template>
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
</template>

<!-- Parent usage -->
<ChildComponent class="my-custom-class" />
<!-- Result: my-custom-class is NOT applied to any element -->
```

## 好的代码

```vue
<!-- ChildComponent.vue - CORRECT: explicitly bind $attrs.class -->
<template>
  <header>Header</header>
  <main :class="$attrs.class" :style="$attrs.style">Content</main>
  <footer>Footer</footer>
</template>

<!-- Or bind all attrs to one element -->
<template>
  <header>Header</header>
  <main v-bind="$attrs">Content</main>
  <footer>Footer</footer>
</template>
```

## 在 script setup中访问 $attrs

```vue
<script setup>
import { useAttrs } from 'vue'
const attrs = useAttrs()
// attrs.class and attrs.style are available
</script>

<template>
  <header>Header</header>
  <main :class="attrs.class">Content</main>
  <footer>Footer</footer>
</template>
```

## 禁用自动继承

对于要控制属性放置的单根组件：

```vue
<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>
import { useAttrs } from 'vue'
const attrs = useAttrs()
</script>

<template>
  <div class="wrapper">
    <input v-bind="attrs" />
  </div>
</template>
```

## Vue 2 到 Vue 3 迁移注意事项

在Vue 2中，`$attrs`不包括`class`和`style`。在 Vue 3 中，`$attrs` 包含所有属性，包括 `class` 和 `style`。这是一个重大更改，会影响您处理属性转发的方式。

## 参考文献

- [坠落属性](https://vuejs.org/guide/components/attrs.html)
- [Vue 3 迁移指南 - $attrs 包括类和样式](https://v3-migration.vuejs.org/breaking-changes/attrs-includes-class-style)
