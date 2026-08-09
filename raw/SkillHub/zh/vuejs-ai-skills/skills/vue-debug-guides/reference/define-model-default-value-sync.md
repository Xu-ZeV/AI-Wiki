---
title: DefineModel默认值可能导致父子不同步
impact: HIGH
impactDescription: Default values in defineModel don't sync back to parent, causing state inconsistency
type: capability
tags: [vue3, v-model, defineModel, components, props, two-way-binding]
---

# defineModel默认值会导致父子不同步

**影响：高** - 当使用带有默认值的 `defineModel()` 并且父组件不提供值时，父组件和子组件将具有不同的值。父级的引用保持为 `undefined`，而子级则使用默认值，从而打破了双向绑定约定。

这种微妙的错误可能会导致令人困惑的行为，即父组件显示一个值，而子组件显示另一个值，并且更新可能无法正确传播。

## 任务清单

- [ ] 使用 v-model 时始终提供来自父级的初始值
- [ ] 不要依赖 DefineModel 默认值作为主要事实来源
- [ ] 如果需要默认值，也在父组件中设置它们
- [ ] 测试提供和不提供 v-model props的组件

**问题 - 父级和子级不同步：**
```html
<!-- ChildComponent.vue -->
<script setup>
// Default value of 1 if parent doesn't provide value
const model = defineModel({ default: 1 })
</script>

<template>
  <input v-model="model" type="number">
  <!-- Shows: 1 (from default) -->
</template>
```

```html
<!-- ParentComponent.vue -->
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

// PROBLEM: Parent ref is undefined, not synced with child's default
const myValue = ref()  // undefined
</script>

<template>
  <ChildComponent v-model="myValue" />

  <!-- DESYNC: Child shows 1, but parent shows undefined -->
  <p>Parent value: {{ myValue }}</p>  <!-- Shows: undefined -->

  <!-- Even after child changes value, parent may not update correctly -->
</template>
```

**解决方案 1 - 始终提供来自父级的初始值：**
```html
<!-- ParentComponent.vue -->
<script setup>
import { ref } from 'vue'
import ChildComponent from './ChildComponent.vue'

// CORRECT: Parent provides the initial value
const myValue = ref(1)  // Match the expected default
</script>

<template>
  <ChildComponent v-model="myValue" />
  <p>Parent value: {{ myValue }}</p>  <!-- Shows: 1, stays in sync -->
</template>
```

**解决方案 2 - 子级在挂载时发出默认值（如果父级控制不可能）：**
```html
<!-- ChildComponent.vue -->
<script setup>
import { onMounted } from 'vue'

const model = defineModel({ default: 1 })

// Sync default value back to parent on mount
onMounted(() => {
  if (model.value === 1) {  // Is using default
    // Force emit to sync parent
    model.value = 1
  }
})
</script>

<template>
  <input v-model="model" type="number">
</template>
```

**解决方案 3 - 使用必需的 prop 或显式未定义处理：**
```html
<!-- ChildComponent.vue -->
<script setup>
import { computed } from 'vue'

// Mark as required - TypeScript will warn if not provided
const model = defineModel({ required: true })

// Or handle undefined explicitly
const safeModel = computed({
  get: () => model.value ?? 1,  // Provide fallback
  set: (val) => { model.value = val }
})
</script>

<template>
  <input v-model="safeModel" type="number">
</template>
```

**最佳实践 - 记录预期初始值：**
```html
<!-- ChildComponent.vue -->
<script setup>
/**
 * @prop modelValue - The numeric value (parent should initialize to 1 or desired default)
 */
const model = defineModel({
  type: Number,
  default: 1,
  // Adding validator helps catch issues in development
  validator: (value) => {
    if (value === undefined) {
      console.warn('ChildComponent: v-model value is undefined. Provide initial value from parent.')
    }
    return true
  }
})
</script>
```

## 参考
- [Vue.js 组件 v-model](https://vuejs.org/guide/components/v-model.html)
- [Vue派-定义模型指南](https://vueschool.io/articles/vuejs-tutorials/v-model-and-definemodel-a-comprehensive-guide-to-two-way-binding-in-vue-js-3/)
