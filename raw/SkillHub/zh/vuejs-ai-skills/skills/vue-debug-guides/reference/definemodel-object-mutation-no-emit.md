---
title: DefineModel 对象属性必须被替换，而不是被改变
impact: HIGH
impactDescription: Mutating object properties via defineModel doesn't emit update events, breaking parent sync
type: gotcha
tags: [vue3, v-model, defineModel, objects, reactivity, two-way-binding]
---

# defineModel 对象属性必须被替换，而不是被改变

**影响：高** - 将 `defineModel()` 与对象或数组一起使用时，直接改变 `model.value.prop = x` 等嵌套属性不会发出 `update:modelValue` 事件。父组件永远不会收到更改通知，从而导致静默同步失败。

发生这种情况是因为 Vue 仅检测 `model.value` 引用本身何时发生更改，而不是何时检测对象的属性何时发生突变。

## 任务清单

- [ ] 切勿直接改变对象属性：`model.value.prop = x`
- [ ] 更新时始终创建新的对象引用：`model.value = {...model.value, prop: x}`
- [ ] 对于数组，使用展开或切片：`model.value = [...model.value, newItem]`
- [ ] 考虑对深层嵌套对象使用 StructuredClone

**不正确 - 没有事件emits的突变：**
```vue
<script setup>
// Child component with object v-model
const model = defineModel<{ name: string; age: number }>()

function updateName(newName: string) {
  // WRONG: This mutates the object in place
  // Parent receives NO update:modelValue event!
  model.value.name = newName
}

function addToList() {
  // WRONG: Push mutates the array
  model.value.items.push('new item')  // Parent not notified
}
</script>
```

**正确 - 将对象引用替换为触发事件：**
```vue
<script setup>
const model = defineModel<{ name: string; age: number }>()

function updateName(newName: string) {
  // CORRECT: Create new object reference
  // This triggers update:modelValue event to parent
  model.value = {
    ...model.value,
    name: newName
  }
}

function addToList() {
  // CORRECT: Create new array reference
  model.value = {
    ...model.value,
    items: [...model.value.items, 'new item']
  }
}
</script>
```

## 深度嵌套需要全路径替换

```vue
<script setup>
const model = defineModel<{
  user: {
    address: {
      city: string
    }
  }
}>()

// WRONG: Deep mutation
model.value.user.address.city = 'New York'

// CORRECT: Replace entire chain
model.value = {
  ...model.value,
  user: {
    ...model.value.user,
    address: {
      ...model.value.user.address,
      city: 'New York'
    }
  }
}

// ALTERNATIVE: Use structuredClone for complex updates
function updateCity(city: string) {
  const updated = structuredClone(model.value)
  updated.user.address.city = city
  model.value = updated  // New reference triggers event
}
</script>
```

## 使用扩展运算符的竞争条件警告

当多次更新快速发生时，早期的更改可能会丢失：

```vue
<script setup>
const model = defineModel<{ a: string; b: string }>()

// CAUTION: Race condition if called in same tick
function updateBothWrong() {
  model.value = { ...model.value, a: 'new-a' }  // First update
  model.value = { ...model.value, b: 'new-b' }  // May use stale model.value!
}

// CORRECT: Batch updates into single assignment
function updateBothCorrect() {
  model.value = {
    ...model.value,
    a: 'new-a',
    b: 'new-b'
  }
}
</script>
```

## 替代方案：VueUse 的 useVModel 和 Deep Option

对于复杂的对象，可以考虑 VueUse：

```vue
<script setup>
import { useVModel } from '@vueuse/core'

const props = defineProps<{ modelValue: { name: string } }>()
const emit = defineEmits(['update:modelValue'])

// Deep tracking with passive updates
const model = useVModel(props, 'modelValue', emit, { deep: true, passive: true })

// Now direct mutations work
model.value.name = 'New Name'  // Properly syncs with parent
</script>
```

## 参考
- [Vue.js 组件 v-model](https://vuejs.org/guide/components/v-model.html)
- [GitHub 讨论：使用对象定义模型](https://github.com/orgs/vuejs/discussions/10538)
- [SIMPL 工程：Vue 定义模型陷阱](https://engineering.simpl.de/post/vue_definemodel/)
