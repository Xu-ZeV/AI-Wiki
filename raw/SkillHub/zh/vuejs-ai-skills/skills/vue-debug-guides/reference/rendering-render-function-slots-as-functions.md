---
title: 将插槽作为渲染函数中的函数传递，而不是直接子函数
impact: HIGH
impactDescription: Passing slot content incorrectly causes slots to not render or be treated as props
type: gotcha
tags: [vue3, render-function, slots, children, vnode]
---

# 将插槽作为渲染函数中的函数传递，而不是直接子函数

**影响：高** - 使用 `h()` 创建组件 vnode 时，子节点必须作为槽函数传递，而不是作为直接子节点传递。直接传递子项可能会导致它们被解释为props或无法渲染。

## 任务清单

- [ ] 将槽内容作为函数传递：`{ default: () => [...] }`
- [ ] 仅通过槽位时使用 `null` 作为props以避免误解
- [ ] 仅适用于默认槽，可以直接传递单个函数
- [ ] 对于命名槽，使用具有槽函数属性的对象

**错误：**
```js
import { h } from 'vue'
import MyComponent from './MyComponent.vue'

// WRONG: Children array may be misinterpreted
h(MyComponent, [
  h('span', 'Slot content')  // May not render as expected
])

// WRONG: Named slots as direct properties
h(MyComponent, {
  header: h('h1', 'Title'),  // This is a prop, not a slot!
  default: h('p', 'Content')  // This is also a prop
})
```

**正确：**
```js
import { h } from 'vue'
import MyComponent from './MyComponent.vue'

// CORRECT: Default slot as function
h(MyComponent, null, {
  default: () => h('span', 'Slot content')
})

// CORRECT: Single default slot shorthand
h(MyComponent, null, () => h('span', 'Slot content'))

// CORRECT: Named slots as functions
h(MyComponent, null, {
  header: () => h('h1', 'Title'),
  default: () => h('p', 'Content'),
  footer: () => [
    h('span', 'Footer item 1'),
    h('span', 'Footer item 2')
  ]
})

// CORRECT: With props AND slots
h(MyComponent, { size: 'large' }, {
  default: () => 'Button Text'
})
```

## 为什么是函数？

Vue 3 中的槽是用于延迟计算的函数：

```js
// Slots are called by the child component when needed
// This enables:
// 1. Scoped slots (passing data back)
// 2. Conditional rendering (slot not called if not used)
// 3. Proper reactivity tracking

h(MyList, { items }, {
  // Scoped slot - receives data from child
  item: ({ item, index }) => h('li', `${index}: ${item.name}`)
})
```

## 空 Props 陷阱

仅传递插槽时，请始终使用 `null` 作为 props：

```js
// WRONG: Slots object interpreted as props!
h(MyComponent, {
  default: () => 'Hello'
})
// MyComponent receives: props.default = () => 'Hello'

// CORRECT: null signals "no props, next arg is slots"
h(MyComponent, null, {
  default: () => 'Hello'
})
// MyComponent receives slot correctly
```

## 从父节点转发槽位

```js
export default {
  setup(props, { slots }) {
    return () => h(ChildComponent, null, {
      // Forward all slots from parent
      ...slots,

      // Or forward specific slots
      default: slots.default,
      header: slots.header
    })
  }
}
```

## 渲染函数中的作用域槽

```js
// Parent: Receives data from child via slot props
h(DataTable, { data: items }, {
  row: (slotProps) => h('tr', [
    h('td', slotProps.item.name),
    h('td', slotProps.item.value)
  ])
})

// Child (DataTable): Calls slot with data
export default {
  props: ['data'],
  setup(props, { slots }) {
    return () => h('table', [
      h('tbody',
        props.data.map(item =>
          // Pass data to slot function
          slots.row?.({ item })
        )
      )
    ])
  }
}
```

## 常见模式

```js
// Wrapper component forwarding slots
h('div', { class: 'wrapper' }, [
  h(InnerComponent, null, slots)
])

// Conditional slot rendering
h('div', [
  slots.header?.(),  // Optional chaining - only render if slot provided
  h('main', slots.default?.()),
  slots.footer?.()
])

// Slot with fallback content
h('div', [
  slots.default?.() ?? h('p', 'Default content when slot not provided')
])
```

## 参考
- [Vue.js 渲染函数 - 传递槽](https://vuejs.org/guide/extras/render-function.html#passing-slots)
- [Vue.js 渲染函数 - 子项](https://vuejs.org/guide/extras/render-function.html#children)
