---
title: 不要依赖内部 VNode 属性
impact: MEDIUM
impactDescription: Using undocumented vnode properties causes code to break on Vue updates
type: gotcha
tags: [vue3, render-function, vnode, internal-api]
---

# 不要依赖内部 VNode 属性

**影响：中** - `VNode` 接口包含 Vue 渲染系统使用的许多内部属性。当 Vue 的内部实现发生变化时，依赖除已记录的公共属性之外的任何属性都会导致您的代码崩溃。

仅使用记录的 vnode 属性：`type`、`props`、`children` 和 `key`。所有其他属性都是内部实现细节，可能会在 Vue 版本之间发生更改，恕不另行通知。

## 任务清单

- [ ] 仅访问记录的 vnode 属性：`type`、`props`、`children`、`key`
- [ ] 切勿访问 `el`、`component`、`shapeFlag`、`patchFlag` 等属性。
- [ ] 如果需要访问 DOM 元素，请使用模板引用
- [ ] 将 vnode 视为不透明的数据结构以进行渲染，而不是检查

**错误：**
```javascript
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => {
      const slotContent = slots.default?.()

      // WRONG: Accessing internal properties
      if (slotContent?.[0]?.el) {
        // el is an internal property
        console.log(slotContent[0].el.tagName)
      }

      // WRONG: Using shapeFlag internal property
      if (slotContent?.[0]?.shapeFlag & 1) {
        // This is internal implementation
      }

      return h('div', slotContent)
    }
  }
}
```

```javascript
// WRONG: Inspecting component instance via vnode
const vnode = h(MyComponent)
console.log(vnode.component) // Internal property
console.log(vnode.appContext) // Internal property
```

**正确：**
```javascript
import { h } from 'vue'

export default {
  setup(props, { slots }) {
    return () => {
      const slotContent = slots.default?.()

      // CORRECT: Only use documented properties
      if (slotContent?.[0]) {
        const vnode = slotContent[0]
        console.log(vnode.type)     // Safe: element type or component
        console.log(vnode.props)    // Safe: props object
        console.log(vnode.children) // Safe: children
        console.log(vnode.key)      // Safe: key prop
      }

      return h('div', slotContent)
    }
  }
}
```

```javascript
import { h, ref, onMounted } from 'vue'

export default {
  setup() {
    // CORRECT: Use template refs for DOM access
    const divRef = ref(null)

    onMounted(() => {
      // Safe way to access DOM element
      console.log(divRef.value.tagName)
    })

    return () => h('div', { ref: divRef }, 'Content')
  }
}
```

## 记录的 VNode 属性

|物业 |类型 |描述 |
|----------|------|-------------|
| `type` | `string \| Component` |元素标签名称或组件定义 |
| `props` | `object \| null` |传递给 vnode 的props |
| `children` | `any` |子 vnode、文本或插槽 |
| `key` | `string \| number \| null` |列表渲染的关键 |

## 安全 VNode 检查模式

```javascript
import { h, isVNode } from 'vue'

export default {
  setup(props, { slots }) {
    return () => {
      const children = slots.default?.() || []

      // Safe: Check if something is a vnode
      children.forEach(child => {
        if (isVNode(child)) {
          // Safe: Check vnode type
          if (typeof child.type === 'string') {
            console.log('Element:', child.type)
          } else if (typeof child.type === 'object') {
            console.log('Component:', child.type.name)
          }

          // Safe: Read props
          if (child.props?.class) {
            console.log('Has class:', child.props.class)
          }
        }
      })

      return h('div', children)
    }
  }
}
```

## 为什么这很重要

Vue 的内部 vnode 结构可能会更改为：
- 性能优化
- 新功能的实现
- 错误修复
- 树摇动改进

升级 Vue 版本时，依赖内部属性的代码会无提示地崩溃或抛出错误。记录的属性是 Vue 公共 API 的一部分，并保证保持稳定。

## 参考
- [Vue.js 渲染函数 API](https://vuejs.org/api/render-function.html)
- [Vue.js 渲染函数 - 虚拟 DOM](https://vuejs.org/guide/extras/render-function.html#the-virtual-dom)
