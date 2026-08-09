---
title: 从 setup() 返回渲染函数，而不是直接 VNode
impact: HIGH
impactDescription: Returning a vnode directly from setup makes it static; returning a function enables reactive updates
type: gotcha
tags: [vue3, render-function, composition-api, setup, reactivity]
---

# 从 setup() 返回渲染函数，而不是直接 VNode

**影响：高** - 将渲染函数与 Composition API 结合使用时，您必须返回一个返回 vnode 的函数，而不是直接返回 vnode。返回 vnode 直接创建一个静态渲染，当反应状态发生变化时，该静态渲染永远不会更新。

## 任务清单

- [ ] 使用渲染函数时始终从 setup() 返回箭头函数
- [ ] 切勿直接从 setup() 返回 h() 调用
- [ ] 确保在返回的函数内访问响应式值

**错误：**
```js
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++

    // WRONG: Returns a static vnode, created once
    // Clicking the button updates count.value, but the DOM never changes!
    return h('div', [
      h('p', `Count: ${count.value}`),  // Captures count.value at setup time (0)
      h('button', { onClick: increment }, 'Increment')
    ])
  }
}
```

**正确：**
```js
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const increment = () => count.value++

    // CORRECT: Returns a render function
    // Vue calls this function on every reactive update
    return () => h('div', [
      h('p', `Count: ${count.value}`),  // Re-evaluated each render
      h('button', { onClick: increment }, 'Increment')
    ])
  }
}
```

## 为什么会发生这种情况

```js
// What Vue does internally:

// WRONG approach - setup runs once:
const result = setup()
// result is a vnode { type: 'div', children: [...] }
// Vue renders this once, then has no way to re-render

// CORRECT approach - setup returns a function:
const renderFn = setup()
// renderFn is () => h('div', ...)
// Vue calls renderFn() on mount
// Vue calls renderFn() again whenever dependencies change
```

## 常见错误：混合模板和渲染函数

```vue
<script setup>
import { h, ref } from 'vue'

const count = ref(0)

// WRONG: Can't use render functions in script setup with templates
// This h() call does nothing
const node = h('div', count.value)
</script>

<template>
  <!-- Template is used, render function is ignored -->
  <div>{{ count }}</div>
</template>
```

如果您需要具有 Composition API 的渲染函数，请不要使用 `<script setup>`：

```vue
<script>
import { h, ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    return () => h('div', count.value)
  }
}
</script>
<!-- No template - render function is used -->
```

## 使用渲染函数时公开值

```js
import { h, ref } from 'vue'

export default {
  setup(props, { expose }) {
    const count = ref(0)
    const reset = () => { count.value = 0 }

    // Expose methods for parent refs
    expose({ reset })

    // Still return the render function
    return () => h('div', count.value)
  }
}
```

## 带插槽

```js
import { h, ref } from 'vue'

export default {
  setup(props, { slots }) {
    const count = ref(0)

    return () => h('div', [
      h('p', `Count: ${count.value}`),
      // Slots must also be called inside the render function
      slots.default?.()
    ])
  }
}
```

## 参考
- [Vue.js 渲染函数与 Composition API](https://vuejs.org/guide/extras/render-function.html#render-functions-jsx)
- [Vue.js 组合 API 设置()](https://vuejs.org/api/composition-api-setup.html)
