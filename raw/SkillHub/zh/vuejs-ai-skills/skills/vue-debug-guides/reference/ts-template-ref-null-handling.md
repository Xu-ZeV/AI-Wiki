---
title: 模板引用在安装之前为空
impact: HIGH
impactDescription: Accessing template ref before mount or after unmount causes runtime errors
type: gotcha
tags: [vue3, typescript, template-refs, lifecycle, null-safety]
---

# 模板引用在安装之前为空

**影响：高** - 模板引用的初始值为 `null`，并在组件安装之前保持为空。如果 `v-if` 删除了引用的元素，它们也可能再次变为 null。在 TypeScript 中始终使用联合类型和可选链接来解释这一点。

## 任务清单

- [ ] 始终使用 `| null` 联合键入模板引用
- [ ] 仅访问 `onMounted` 内或之后的引用
- [ ] 访问 ref 属性时使用可选链接 (`?.`)
- [ ] 处理 `v-if` ref 可能再次变为 null 的场景
- [ ] 考虑在 Vue 3.5+ 中使用 `useTemplateRef`

## 问题

```vue
<script setup lang="ts">
import { ref } from 'vue'

// WRONG: Doesn't account for null
const inputRef = ref<HTMLInputElement>()

// WRONG: Will crash if accessed before mount
inputRef.value.focus()  // Error: Cannot read properties of null

// WRONG: Accessed in setup, element doesn't exist yet
console.log(inputRef.value.value)  // Error!
</script>

<template>
  <input ref="inputRef" />
</template>
```

## 解决方案

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// CORRECT: Include null in the type
const inputRef = ref<HTMLInputElement | null>(null)

// CORRECT: Access in onMounted when DOM exists
onMounted(() => {
  inputRef.value?.focus()  // Safe with optional chaining
})

// CORRECT: Guard before accessing
function focusInput() {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}
</script>

<template>
  <input ref="inputRef" />
</template>
```

## Vue 3.5+：useTemplateRef

Vue 3.5 引入了 `useTemplateRef` ，具有更好的类型推断：

```vue
<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

// Type is automatically inferred for static refs
const inputRef = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

## 处理 v-if 场景

当元素有条件渲染时，Refs 可以变成 `null`：

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const showModal = ref(false)
const modalRef = ref<HTMLDivElement | null>(null)

// WRONG: Assuming ref always exists after first mount
function closeModal() {
  modalRef.value.classList.remove('open')  // May be null!
}

// CORRECT: Always guard access
function closeModal() {
  modalRef.value?.classList.remove('open')
}

// CORRECT: Watch for ref changes
watch(modalRef, (newRef) => {
  if (newRef) {
    // Modal element just mounted
    newRef.focus()
  }
  // If null, modal was unmounted
})
</script>

<template>
  <div v-if="showModal" ref="modalRef" class="modal">
    Modal content
  </div>
</template>
```

## 组件参考

对于组件参考，请使用 `InstanceType`：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

// Component ref with null
const childRef = ref<InstanceType<typeof ChildComponent> | null>(null)

onMounted(() => {
  // Access exposed methods/properties
  childRef.value?.exposedMethod()
})
</script>

<template>
  <ChildComponent ref="childRef" />
</template>
```

请记住：子组件必须使用 `defineExpose` 来公开方法：

```vue
<!-- ChildComponent.vue -->
<script setup lang="ts">
function exposedMethod() {
  console.log('Called from parent')
}

defineExpose({
  exposedMethod
})
</script>
```

## 使用 v-for 进行多个引用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const items = ref(['a', 'b', 'c'])

// Array of refs for v-for
const itemRefs = ref<(HTMLLIElement | null)[]>([])

onMounted(() => {
  // Access specific item
  itemRefs.value[0]?.focus()

  // Iterate safely
  itemRefs.value.forEach(el => {
    el?.classList.add('mounted')
  })
})
</script>

<template>
  <ul>
    <li
      v-for="(item, index) in items"
      :key="item"
      :ref="el => { itemRefs[index] = el as HTMLLIElement }"
    >
      {{ item }}
    </li>
  </ul>
</template>
```

## 异步操作和参考

小心异步操作：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const containerRef = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  // containerRef.value exists here

  await fetchData()

  // CAREFUL: Component might have unmounted during await
  // Always re-check before accessing
  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
})
</script>
```

## 类型保护模式

创建一个可重用的类型保护以获得更清晰的代码：

```typescript
// utils/refs.ts
export function assertRef<T>(
  ref: Ref<T | null>,
  message = 'Ref is not available'
): asserts ref is Ref<T> {
  if (ref.value === null) {
    throw new Error(message)
  }
}

// Usage in component
function mustFocus() {
  assertRef(inputRef, 'Input element not mounted')
  inputRef.value.focus()  // TypeScript knows it's not null here
}
```

## 参考
- [带有 Composition API 的 Vue.js TypeScript - 模板 ref](https://vuejs.org/guide/typescript/composition-api.html#typing-template-refs)
- [Vue.js 模板 ref](https://vuejs.org/guide/essentials/template-refs.html)
