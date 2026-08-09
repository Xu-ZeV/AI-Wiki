---
title: VNode 在渲染函数中必须是唯一的
impact: HIGH
impactDescription: Reusing vnode references causes rendering bugs and unexpected behavior
type: gotcha
tags: [vue3, render-function, vnode, composition-api]
---

# 渲染函数中的 VNode 必须是唯一的

**影响：高** - 在渲染函数树中多次重复使用相同的 vnode 引用会导致渲染错误，其中仅出现一个实例或更新行为异常。

组件渲染树中的每个 vnode 都必须是唯一的。您不能多次使用同一个 vnode 对象。如果需要多次渲染同一元素，请使用工厂函数或循环调用 `h()` 单独创建每个 vnode。

## 任务清单

- [ ] 切勿将 vnode 存储在变量中并在同一棵树中多次使用它
- [ ] 使用工厂函数或 `.map()` 创建多个相似的 vnode
- [ ] 每个 `h()` 调用都会创建一个新的 vnode，因此为每个需要的实例调用它
- [ ] 将 vnode 创建提取到辅助函数中时要特别小心

**错误：**
```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => {
      // WRONG: Same vnode reference used twice
      const p = h('p', 'Hello')
      return h('div', [p, p]) // Bug! Duplicate vnode reference
    }
  }
}
```

```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => {
      // WRONG: Reusing vnode in different parts of tree
      const icon = h('span', { class: 'icon' }, '★')
      return h('div', [
        h('button', [icon, ' Save']),    // Uses icon
        h('button', [icon, ' Delete'])   // Reuses same icon - Bug!
      ])
    }
  }
}
```

**正确：**
```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => {
      // CORRECT: Create new vnode for each use
      return h('div', [
        h('p', 'Hello'),
        h('p', 'Hello')
      ])
    }
  }
}
```

```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => {
      // CORRECT: Factory function creates new vnode each time
      const createIcon = () => h('span', { class: 'icon' }, '★')
      return h('div', [
        h('button', [createIcon(), ' Save']),
        h('button', [createIcon(), ' Delete'])
      ])
    }
  }
}
```

```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => {
      // CORRECT: Using map to create multiple vnodes
      return h('div',
        Array.from({ length: 20 }).map(() => h('p', 'Hello'))
      )
    }
  }
}
```

```javascript
import { h } from 'vue'

export default {
  setup() {
    const items = ['Apple', 'Banana', 'Cherry']

    return () => h('ul',
      // CORRECT: Each iteration creates a new vnode
      items.map((item, index) =>
        h('li', { key: index }, item)
      )
    )
  }
}
```

## 为什么 VNode 必须是唯一的

VNode 是轻量级 JavaScript 对象，Vue 的虚拟 DOM 算法使用它来进行比较和修补。当同一个vnode引用出现多次时：
- Vue 无法区分实例
- diffing 算法产生不正确的结果
- 只有一个实例可以渲染，或者更新可能会破坏 DOM

每个 vnode 都在树中维护自己的身份和位置，这对于以下方面至关重要：
- 更新期间正确的 DOM 修补
- 正确的生命周期钩子子执行
- 列表中基于密钥的准确协调

## 参考
- [Vue.js 渲染函数 - Vnode 必须是唯一的](https://vuejs.org/guide/extras/render-function.html#vnodes-must-be-unique)
