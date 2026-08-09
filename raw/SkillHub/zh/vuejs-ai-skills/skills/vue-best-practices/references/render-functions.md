---
title: 渲染函数模式和性能
impact: MEDIUM
impactDescription: Render functions require explicit patterns for lists, events, v-model, and performance to stay correct and maintainable
type: best-practice
tags: [vue3, render-function, h, v-model, directives, performance, jsx]
---

# 渲染函数模式和性能

**影响：中** - 渲染函数很强大，但选择退出模板编译器优化。有意识地使用它们并应用下面的关键模式来保持输出的正确性和高性能。

## 任务列表

- 更喜欢模板；仅当模板无法表达逻辑时才使用渲染函数
- 使用 `h()`/JSX 渲染列表时始终添加稳定的键
- 使用 `withModifiers` / `withKeys` 作为事件修饰符
- 通过 `modelValue` + `onUpdate:modelValue` 实现 `v-model`
- 使用 `withDirectives` 应用自定义指令
- 使用功能组件实现无状态演示 UI

## 优先使用模板而不是渲染函数

**不好：**
```vue
<script setup>
import { h, ref } from 'vue'

const count = ref(0)
const render = () => h('div', `Count: ${count.value}`)
</script>
```

**好：**
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>Count: {{ count }}</div>
</template>
```

## 始终添加列表渲染的键

**不好：**
```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const items = ref([{ id: 1, name: 'Apple' }])

    return () => h('ul',
      items.value.map(item => h('li', item.name))
    )
  }
}
```

**好：**
```javascript
import { h, ref } from 'vue'

export default {
  setup() {
    const items = ref([{ id: 1, name: 'Apple' }])

    return () => h('ul',
      items.value.map(item => h('li', { key: item.id }, item.name))
    )
  }
}
```

## 使用 `withModifiers` / `withKeys` 作为事件修饰符

**不好：**
```javascript
import { h } from 'vue'

export default {
  setup() {
    const handleClick = (e) => {
      e.stopPropagation()
      e.preventDefault()
    }

    return () => h('button', { onClick: handleClick }, 'Click')
  }
}
```

**好：**
```javascript
import { h, withModifiers, withKeys } from 'vue'

export default {
  setup() {
    const handleClick = () => {}
    const handleEnter = () => {}

    return () => h('div', [
      h('button', {
        onClick: withModifiers(handleClick, ['stop', 'prevent'])
      }, 'Click'),
      h('input', {
        onKeyup: withKeys(handleEnter, ['enter'])
      })
    ])
  }
}
```

## 显式实现 `v-model`

**不好：**
```javascript
import { h, ref } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')
    return () => h(CustomInput, { modelValue: text.value })
  }
}
```

**好：**
```javascript
import { h, ref } from 'vue'
import CustomInput from './CustomInput.vue'

export default {
  setup() {
    const text = ref('')
    return () => h(CustomInput, {
      modelValue: text.value,
      'onUpdate:modelValue': (value) => { text.value = value }
    })
  }
}
```

## 使用 `withDirectives` 进行自定义指令

**不好：**
```javascript
import { h } from 'vue'

const vFocus = { mounted: (el) => el.focus() }

export default {
  setup() {
    return () => h('input', { 'v-focus': true })
  }
}
```

**好：**
```javascript
import { h, withDirectives } from 'vue'

const vFocus = { mounted: (el) => el.focus() }

export default {
  setup() {
    return () => withDirectives(h('input'), [[vFocus]])
  }
}
```

## 更喜欢无状态 UI 的功能组件

**不好：**
```javascript
import { h } from 'vue'

export default {
  setup() {
    return () => h('span', { class: 'badge' }, 'New')
  }
}
```

**好：**
```javascript
import { h } from 'vue'

function Badge(props, { slots }) {
  return h('span', { class: 'badge' }, slots.default?.())
}

Badge.props = ['variant']

export default Badge
```
