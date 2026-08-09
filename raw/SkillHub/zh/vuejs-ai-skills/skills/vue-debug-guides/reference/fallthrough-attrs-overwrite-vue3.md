# Fallthrough 属性覆盖 Vue 3 中的显式属性

## 规则

在 Vue 3 中，fallthrough 属性会覆盖根元素上显式设置的属性（合并的 `class` 和 `style` 除外）。这是 Vue 2 的重大更改。要保留显式属性值，请使用 `inheritAttrs: false` 并在显式属性之前手动绑定 `$attrs`。

## 为什么这很重要

- 从 Vue 2 到 Vue 3 的静默行为更改
- 可能会导致迁移的代码库中出现意外的属性值
- 仅`class`和`style`智能合并；其他属性被覆盖
- 影响组件组合模式和包装组件

## 错误代码

```vue
<!-- Parent.vue -->
<template>
  <Child msg="Passed from Parent" />
</template>

<!-- Child.vue - UNEXPECTED BEHAVIOR -->
<template>
  <GrandChild msg="Set in Child" />
</template>

<!--
  Vue 3 Result: GrandChild receives msg="Passed from Parent"
  The fallthrough attribute OVERWRITES the explicit one!

  Vue 2 Result: GrandChild receives msg="Set in Child"
  The explicit attribute took precedence
-->
```

### 数据属性的另一个常见情况

```vue
<!-- Parent.vue -->
<template>
  <Button data-testid="parent-button" />
</template>

<!-- Button.vue - WRONG: explicit data-testid is overwritten -->
<template>
  <button data-testid="submit-btn">Submit</button>
</template>

<!-- Result: <button data-testid="parent-button">Submit</button> -->
<!-- The component's intended test ID is lost! -->
```

## 好的代码

### 选项1：使用inheritAttrs控制属性顺序：false

```vue
<!-- Child.vue - CORRECT: Control attribute precedence -->
<script setup>
defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <!-- v-bind="$attrs" FIRST, then explicit attribute -->
  <GrandChild v-bind="$attrs" msg="Set in Child" />
</template>

<!--
  Result: GrandChild receives msg="Set in Child"
  Explicit attribute overrides fallthrough because it comes last
-->
```

### 选项 2：从失败中排除特定属性

```vue
<script setup>
import { computed, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false
})

const attrs = useAttrs()

// Filter out attributes you want to control explicitly
const filteredAttrs = computed(() => {
  const { msg, ...rest } = attrs
  return rest
})
</script>

<template>
  <GrandChild v-bind="filteredAttrs" msg="Set in Child" />
</template>
```

### 选项 3：对于包装组件，声明为 prop

```vue
<!-- Button.vue - BEST: Declare attributes you need to control -->
<script setup>
const props = defineProps({
  dataTestid: {
    type: String,
    default: 'submit-btn'
  }
})

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <button :data-testid="dataTestid" v-bind="$attrs">
    <slot />
  </button>
</template>
```

## 类别和风格很特别

与其他属性不同，`class` 和 `style` 合并而不是覆盖：

```vue
<!-- Parent.vue -->
<template>
  <Button class="large" style="color: red" />
</template>

<!-- Button.vue -->
<template>
  <button class="btn" style="padding: 10px">Submit</button>
</template>

<!--
  Result: <button class="btn large" style="padding: 10px; color: red">
  Both classes and styles are MERGED, not overwritten
-->
```

## Vue 2 到 Vue 3 迁移清单

迁移依赖属性优先级的组件时：

1. 识别在根元素上设置显式属性的组件
2、检查父组件是否传递相同的属性
3. 如果显式值应优先：
   - 添加`inheritAttrs: false`
   - 在显式属性之前使用 `v-bind="$attrs"`

## 参考文献

- [坠落属性](https://vuejs.org/guide/components/attrs.html)
- [Vue 3 迁移指南 - 属性强制行为](https://v3-migration.vuejs.org/breaking-changes/)
- [Vue Fallthrough 属性行为从 Vue 2 更改为 Vue 3](https://lukes.tips/posts/vue-3-fallthough-attributes-changes/)
