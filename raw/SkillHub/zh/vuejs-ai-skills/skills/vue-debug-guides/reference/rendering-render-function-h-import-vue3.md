---
title: 在 Vue 3 渲染函数中全局导入 h
impact: HIGH
impactDescription: Vue 3 requires explicit h import; using Vue 2 patterns causes runtime errors
type: gotcha
tags: [vue3, render-function, migration, h, vnode, breaking-change]
---

# 在 Vue 3 渲染函数中全局导入 h

**影响：高** - 在 Vue 2 中，`h` 函数 (createElement) 作为参数传递给渲染函数。在 Vue 3 中，必须从“vue”显式导入 `h`。使用 Vue 2 模式会导致运行时错误。

## 任务清单

- [ ] 使用渲染函数从文件顶部的“vue”导入 `h`
- [ ] 从渲染函数签名中删除 `h` 参数
- [ ] 从 Vue 2 迁移时更新所有渲染函数

**不正确（Vue 2 模式 - 在 Vue 3 中损坏）：**
```js
// WRONG: Vue 2 pattern - h is not passed as argument in Vue 3
export default {
  render(h) {  // h is undefined in Vue 3!
    return h('div', [
      h('span', 'Hello')
    ])
  }
}

// WRONG: Using createElement alias from Vue 2
export default {
  render(createElement) {  // Also undefined
    return createElement('div', 'Hello')
  }
}
```

**正确（Vue 3 模式）：**
```js
// CORRECT: Import h from vue
import { h } from 'vue'

export default {
  render() {
    return h('div', [
      h('span', 'Hello')
    ])
  }
}
```

## 使用组合 API

```js
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)

    // Return a render function from setup
    return () => h('div', [
      h('button', { onClick: () => count.value++ }, `Count: ${count.value}`)
    ])
  }
}
```

## 使用script setup（不推荐）

```vue
<script setup>
import { h, ref } from 'vue'

const count = ref(0)

// Cannot return render function from script setup
// Must use a separate render option or template
</script>

<!-- script setup typically uses templates, not render functions -->
<template>
  <div>
    <button @click="count++">Count: {{ count }}</button>
  </div>
</template>
```

如果您需要使用 `<script setup>` 的渲染函数，请使用 `render` 选项：

```vue
<script>
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return () => h('button', { onClick: () => count.value++ }, count.value)
  }
}
</script>
```

## 组件分辨率更改

在 Vue 3 中，您还必须显式解析组件：

**错误：**
```js
// Vue 2: Could use string names for registered components
render(h) {
  return h('my-component', { props: { value: 1 } })
}
```

**正确：**
```js
import { h, resolveComponent } from 'vue'

export default {
  render() {
    // Must resolve component by name
    const MyComponent = resolveComponent('my-component')
    return h(MyComponent, { value: 1 })
  }
}

// Or import the component directly (preferred)
import { h } from 'vue'
import MyComponent from './MyComponent.vue'

export default {
  render() {
    return h(MyComponent, { value: 1 })
  }
}
```

## 为什么会发生这样的变化

Vue 3 的 `h` 可全局导入到：
1.启用tree-shaking（不使用的功能可以删除）
2.支持更好的TypeScript推理
3.允许在组件上下文之外使用

## 参考
- 【Vue 3迁移指南-渲染函数API】(https://v3-migration.vuejs.org/breaking-changes/render-function-api.html)
- [Vue.js 渲染函数和 JSX](https://vuejs.org/guide/extras/render-function.html)
