---
title: 组件参考需要使用script setup来定义暴露
impact: HIGH
impactDescription: Parent components cannot access child ref properties unless explicitly exposed
type: gotcha
tags: [vue3, template-refs, script-setup, defineExpose, component-communication]
---

# 组件引用需要使用script setup来定义Expose

**影响：高** - 使用 `<script setup>` 的组件默认是私有的。使用模板引用访问子组件的父组件将获得一个空对象，除非子组件使用 `defineExpose()` 显式公开属性。这是选项 API 行为的根本变化。

这让许多开发者在从 Options API 迁移时措手不及，其中 `this.$refs.child` 授予对子实例的完全访问权限。

## 任务清单

- [ ] 使用 `defineExpose()` 显式向父引用公开属性/方法
- [ ] 只公开必要的内容 - 保持组件内部私有
- [ ] 记录公开的 API，因为它们构成组件的公共接口
- [ ] 更喜欢使用 props/emit 进行亲子交流；谨慎使用参考文献
- [ ] 在任何等待操作之前调用defineExpose（请参阅异步警告）

**错误：**
```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const internalState = ref('private')

function increment() {
  count.value++
}

function reset() {
  count.value = 0
}

// WRONG: Nothing exposed - parent ref sees empty object
</script>

<template>
  <div>{{ count }}</div>
</template>
```

```vue
<!-- ParentComponent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

onMounted(() => {
  // WRONG: childRef.value is {} - empty object!
  console.log(childRef.value.count) // undefined
  childRef.value.increment() // TypeError: not a function
})
</script>

<template>
  <ChildComponent ref="childRef" />
</template>
```

**正确：**
```vue
<!-- ChildComponent.vue -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const internalState = ref('private') // Keep this private

function increment() {
  count.value++
}

function reset() {
  count.value = 0
}

// CORRECT: Explicitly expose public API
defineExpose({
  count,      // Expose the ref
  increment,  // Expose methods
  reset
  // internalState NOT exposed - stays private
})
</script>

<template>
  <div>{{ count }}</div>
</template>
```

```vue
<!-- ParentComponent.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref(null)

onMounted(() => {
  // CORRECT: Can access exposed properties
  console.log(childRef.value.count) // 0
  childRef.value.increment() // Works!

  // internalState is not accessible (private)
  console.log(childRef.value.internalState) // undefined
})
</script>

<template>
  <ChildComponent ref="childRef" />
</template>
```

```vue
<!-- Input wrapper example - exposing native element -->
<script setup>
import { ref } from 'vue'

const inputEl = ref(null)

// Expose the native input for parent to access (e.g., for focus)
defineExpose({
  focus: () => inputEl.value?.focus(),
  blur: () => inputEl.value?.blur(),
  // Or expose the element directly
  el: inputEl
})
</script>

<template>
  <input ref="inputEl" v-bind="$attrs" />
</template>
```

```javascript
// Options API equivalent using expose option
export default {
  expose: ['count', 'increment', 'reset'],
  data() {
    return {
      count: 0,
      internalState: 'private'
    }
  },
  methods: {
    increment() { this.count++ },
    reset() { this.count = 0 }
  }
}
```

## 最佳实践提醒

组件引用在父级和子级之间创建紧密耦合。更喜欢标准模式：

```vue
<!-- PREFERRED: Use props and emit for communication -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<!-- Only use refs for imperative actions like focus(), scrollTo(), etc. -->
```

## 参考
- [Vue.js 组件参考](https://vuejs.org/guide/essentials/template-refs.html#ref-on-component)
- [script setup - DefineExpose](https://vuejs.org/api/sfc-script-setup.html#defineexpose)
