---
title: v-for 中不保证模板引用数组顺序
impact: MEDIUM
impactDescription: Refs collected from v-for may not match source array order, causing index-based bugs
type: gotcha
tags: [vue3, template-refs, v-for, arrays, ordering]
---

# v-for 中不保证模板引用数组顺序

**影响：中** - 在 `v-for` 中使用模板引用时，Vue 会将元素引用收集到数组中。但是，该数组不保证与源数组的顺序相同。依赖基于索引的访问可能会导致微妙的错误。

这个警告并不明显，当您假设 ref 数组与您的数据顺序匹配时，可能会导致难以调试的问题。

> **警告：`useTemplateRef()` 不适用于 Vue 3.5 中的 v-for 引用**
>
> 当与 `v-for` 内的引用一起使用时，`useTemplateRef()` API 返回 `null`。这是一个已知的限制。您必须使用带有 `ref()` 的旧模式和匹配的模板引用名称：
>
> ```ts
> // 不适用于 v-for - 返回 null
> const itemRefs = useTemplateRef('items')
>
> // 与 v-for 一起使用 - 使用此模式代替
> const items = ref([]) // 名称必须与模板中的 ref="items" 匹配
> ```
>
> 此规则中的示例显示 `useTemplateRef()` 进行说明，但实际上，您应该对 v-for 场景使用旧版 `ref()` 模式，直到解决此限制。

## 任务清单

- [ ] 永远不要假设引用数组索引与源数据数组索引匹配
- [ ] 使用数据属性或其他标识符将引用与数据关联起来
- [ ] 考虑需要有序访问的复杂场景的函数引用
- [ ] 使用动态列表操作（添加、删除、重新排序）进行测试以验证行为

**错误：**
```vue
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'

const items = ref(['First', 'Second', 'Third'])
const itemRefs = useTemplateRef('items')

onMounted(() => {
  // WRONG: Assuming itemRefs[0] corresponds to items[0]
  // The order is NOT guaranteed to match!
  items.value.forEach((item, index) => {
    console.log(`${item}: `, itemRefs.value[index]) // May be wrong element!
  })
})
</script>

<template>
  <ul>
    <li v-for="item in items" ref="items" :key="item">
      {{ item }}
    </li>
  </ul>
</template>
```

**正确：**
```vue
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'

const items = ref([
  { id: 1, text: 'First' },
  { id: 2, text: 'Second' },
  { id: 3, text: 'Third' }
])
const itemRefs = useTemplateRef('items')

onMounted(() => {
  // CORRECT: Use data attributes to identify elements
  itemRefs.value.forEach(el => {
    const id = el.dataset.id
    const item = items.value.find(i => i.id === Number(id))
    console.log(`${item.text}: `, el)
  })
})
</script>

<template>
  <ul>
    <li
      v-for="item in items"
      ref="items"
      :key="item.id"
      :data-id="item.id"
    >
      {{ item.text }}
    </li>
  </ul>
</template>
```

```vue
<script setup>
import { ref, onMounted, onBeforeUpdate } from 'vue'

const items = ref(['First', 'Second', 'Third'])
const itemRefs = ref(new Map())

// CORRECT: Use function refs for precise control
function setItemRef(el, item) {
  if (el) {
    itemRefs.value.set(item, el)
  } else {
    itemRefs.value.delete(item)
  }
}

// Reset before each update to handle removed items
onBeforeUpdate(() => {
  itemRefs.value.clear()
})

onMounted(() => {
  // Access refs by their associated data item
  items.value.forEach(item => {
    const el = itemRefs.value.get(item)
    console.log(`${item}: `, el)
  })
})
</script>

<template>
  <ul>
    <li
      v-for="item in items"
      :key="item"
      :ref="(el) => setItemRef(el, item)"
    >
      {{ item }}
    </li>
  </ul>
</template>
```

```vue
<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'

const items = ref(['First', 'Second', 'Third'])
const itemRefs = useTemplateRef('items')

// CORRECT: If order matters, sort refs by DOM position
onMounted(() => {
  const sortedRefs = [...itemRefs.value].sort((a, b) => {
    // Sort by DOM order using compareDocumentPosition
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
  })

  // Now sortedRefs matches visual/DOM order
  sortedRefs.forEach((el, index) => {
    console.log(`Position ${index}: `, el.textContent)
  })
})
</script>

<template>
  <ul>
    <li v-for="item in items" ref="items" :key="item">
      {{ item }}
    </li>
  </ul>
</template>
```

## 参考
- [Vue.js 模板 ref - v-for 内的参考](https://vuejs.org/guide/essentials/template-refs.html#refs-inside-v-for)
