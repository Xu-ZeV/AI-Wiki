---
title: 自引用组件使用文件名作为隐式名称
impact: LOW
impactDescription: Understanding this avoids confusion with recursive components
type: gotcha
tags: [vue3, component-registration, self-reference, recursive-components, sfc]
---

# 自引用组件使用文件名作为隐式名称

**影响：低** - 在单文件组件 (SFC) 中，组件可以使用其文件名作为组件名称在自己的模板中引用自身。这对于树结构或嵌套注释等递归组件很有用。但是，这种隐式注册的优先级低于显式导入的组件，这可能会导致混乱。

## 任务清单

- [ ] 使用文件名（不带扩展名）自引用组件
- [ ] 请注意，导入的组件优先于自引用
- [ ] 为了使递归组件清晰，请考虑显式命名

**示例：**
```vue
<!-- TreeItem.vue -->
<script setup>
defineProps({
  item: Object
})
</script>

<template>
  <div class="tree-item">
    <span>{{ item.name }}</span>
    <!-- Self-reference using filename -->
    <TreeItem
      v-for="child in item.children"
      :key="child.id"
      :item="child"
    />
  </div>
</template>
```

```vue
<!-- Comment.vue - recursive comments -->
<script setup>
defineProps({
  comment: Object
})
</script>

<template>
  <div class="comment">
    <p>{{ comment.text }}</p>
    <div class="replies" v-if="comment.replies?.length">
      <!-- Self-reference for nested replies -->
      <Comment
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
      />
    </div>
  </div>
</template>
```

## 优先级：导入覆盖自引用

```vue
<!-- FooBar.vue -->
<script setup>
// If you import a component named FooBar, it takes precedence
import FooBar from './different/FooBar.vue'
</script>

<template>
  <!-- This renders the IMPORTED FooBar, not this file -->
  <FooBar />
</template>
```

当存在命名冲突时显式自引用：

```vue
<!-- FooBar.vue -->
<script setup>
import OtherFooBar from './different/FooBar.vue'
// No way to explicitly import "self" in script setup
// Must rename the import to avoid conflict
</script>

<template>
  <OtherFooBar />
  <!-- FooBar still refers to self (this file) because
       the import was aliased -->
  <FooBar />
</template>
```

## 选项 API：显式名称选项

```vue
<!-- RecursiveList.vue -->
<script>
export default {
  name: 'RecursiveList', // Explicit name for self-reference
  props: {
    items: Array
  }
}
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
      <RecursiveList v-if="item.children" :items="item.children" />
    </li>
  </ul>
</template>
```

## 自参考的常见用例

1. **树结构** - 文件浏览器、组织结构图
2. **嵌套评论** - Reddit 风格的评论线程
3. **菜单导航** - 递归下拉菜单
4. **类别层次结构** - 产品类别、分类法

## 避免无限递归

```vue
<!-- TreeNode.vue -->
<script setup>
defineProps({
  node: Object,
  maxDepth: { type: Number, default: 10 },
  currentDepth: { type: Number, default: 0 }
})
</script>

<template>
  <div class="node">
    {{ node.name }}
    <!-- Guard against infinite recursion -->
    <template v-if="node.children && currentDepth < maxDepth">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :max-depth="maxDepth"
        :current-depth="currentDepth + 1"
      />
    </template>
  </div>
</template>
```

## 参考
- [Vue.js组件注册](https://vuejs.org/guide/components/registration.html)
