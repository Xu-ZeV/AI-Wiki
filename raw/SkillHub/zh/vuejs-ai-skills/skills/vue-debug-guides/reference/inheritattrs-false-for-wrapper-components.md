# 对包装组件使用inheritAttrs: false

## 规则

在构建属性应应用于内部元素而不是根元素的包装器组件时，请始终设置 `inheritAttrs: false` 并显式地将 `$attrs` 绑定到目标元素。

## 为什么这很重要

- 默认情况下，Vue 将所有非 prop 属性应用于根元素
- 包装组件通常具有非语义根（div 包装、标签包装）
- `id`、`aria-*`、`data-*` 等属性和事件侦听器应针对功能元素
- 如果没有 `inheritAttrs: false`，可访问性和功能可能会中断

## 错误代码

```vue
<!-- BaseInput.vue - WRONG: attrs go to wrapper div, not input -->
<template>
  <div class="input-wrapper">
    <label>{{ label }}</label>
    <input type="text" />
  </div>
</template>

<script setup>
defineProps(['label'])
</script>

<!-- Parent usage -->
<BaseInput
  id="email"
  placeholder="Enter email"
  aria-describedby="email-help"
  @focus="handleFocus"
/>

<!--
  RESULT: All attrs go to the wrapper div!
  <div class="input-wrapper" id="email" placeholder="Enter email" ...>
    <label>...</label>
    <input type="text" />  <!-- No id, placeholder, or aria! -->
  </div>
-->
```

## 好的代码

```vue
<!-- BaseInput.vue - CORRECT: attrs bound to input element -->
<script setup>
defineProps(['label'])

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <div class="input-wrapper">
    <label>{{ label }}</label>
    <input type="text" v-bind="$attrs" />
  </div>
</template>

<!-- Parent usage -->
<BaseInput
  id="email"
  placeholder="Enter email"
  aria-describedby="email-help"
  @focus="handleFocus"
/>

<!--
  RESULT: Attrs correctly applied to input
  <div class="input-wrapper">
    <label>...</label>
    <input type="text" id="email" placeholder="Enter email"
           aria-describedby="email-help" />
  </div>
-->
```

## 以不同的语法设置inheritAttrs

### script setup（Vue 3.3+）

```vue
<script setup>
defineOptions({
  inheritAttrs: false
})
</script>
```

### script setup（Vue 3.3 之前）

```vue
<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>
// Your setup code here
</script>
```

### 选项 API

```vue
<script>
export default {
  inheritAttrs: false,
  // other options...
}
</script>
```

## 常见包装组件模式

### 表单输入包装器

```vue
<script setup>
import { useAttrs, computed } from 'vue'

defineProps({
  label: String,
  error: String
})

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

// Separate class/style for wrapper vs input
const inputAttrs = computed(() => {
  const { class: _, style: __, ...rest } = attrs
  return rest
})
</script>

<template>
  <div class="form-field" :class="{ 'has-error': error }">
    <label v-if="label">{{ label }}</label>
    <input v-bind="inputAttrs" />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>
```

### 带图标包装的按钮

```vue
<script setup>
defineProps({
  icon: String,
  iconPosition: {
    type: String,
    default: 'left'
  }
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <button class="icon-button" v-bind="$attrs">
    <span v-if="icon && iconPosition === 'left'" class="icon">{{ icon }}</span>
    <slot />
    <span v-if="icon && iconPosition === 'right'" class="icon">{{ icon }}</span>
  </button>
</template>
```

### 链接包装组件

```vue
<script setup>
defineProps({
  to: String,
  external: Boolean
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <a
    v-if="external"
    :href="to"
    target="_blank"
    rel="noopener noreferrer"
    v-bind="$attrs"
  >
    <slot />
  </a>
  <router-link v-else :to="to" v-bind="$attrs">
    <slot />
  </router-link>
</template>
```

## 何时不使用继承属性： false

- 具有单个语义根元素的简单组件
- 根元素应接收所有属性的组件
- 不包装其他功能元素的组件

```vue
<!-- SimpleCard.vue - No need for inheritAttrs: false -->
<template>
  <article class="card">
    <slot />
  </article>
</template>
<!-- Passing class, id, or data-* to the root article is fine -->
```

## 参考文献

- [属性掉落-禁用属性继承](https://vuejs.org/guide/components/attrs.html#disabling-attribute-inheritance)
- [使用 $attrs 在 Vue 3 中构建高级组件](https://www.thisdot.co/blog/build-advanced-components-in-vue-3-using-usdattrs)
