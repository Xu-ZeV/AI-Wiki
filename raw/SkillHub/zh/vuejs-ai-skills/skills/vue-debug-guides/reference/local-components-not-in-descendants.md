---
title: 本地注册的组件在后代中不可用
impact: HIGH
impactDescription: Common source of "component not found" errors in nested components
type: gotcha
tags: [vue3, component-registration, local-registration, scope, nested-components]
---

# 本地注册的组件在后代中不可用

**影响：高** - 本地注册的组件仅在其注册的组件中可用，而在其子组件或后代组件中不可用。当开发者希望在父级中注册的组件在子级中可用时，这是“未知组件”或“无法解析组件”错误的常见来源。

## 任务清单

- [ ] 在使用组件的每个文件中导入并注册组件
- [ ] 不要期望父级的本地组件在子级中可用
- [ ] 如果一个组件在很多地方都需要，仅考虑全局注册作为最后的手段
- [ ] 使用IDE自动导入功能来简化重复导入

**错误：**
```vue
<!-- ParentComponent.vue -->
<script setup>
import Card from './Card.vue'
import ChildComponent from './ChildComponent.vue'
</script>

<template>
  <Card>Parent content</Card>
  <ChildComponent />
</template>
```

```vue
<!-- ChildComponent.vue -->
<script setup>
// WRONG: Expecting Card to be available because parent imported it
// This will cause "Failed to resolve component: Card" error
</script>

<template>
  <!-- ERROR: Card is not available here! -->
  <Card>
    Child content
  </Card>
</template>
```

**正确：**
```vue
<!-- ParentComponent.vue -->
<script setup>
import Card from './Card.vue'
import ChildComponent from './ChildComponent.vue'
</script>

<template>
  <Card>Parent content</Card>
  <ChildComponent />
</template>
```

```vue
<!-- ChildComponent.vue -->
<script setup>
// CORRECT: Each component must import what it uses
import Card from './Card.vue'
</script>

<template>
  <Card>
    Child content
  </Card>
</template>
```

## 常见场景

### 场景 1：深度嵌套组件
```vue
<!-- GrandchildComponent.vue -->
<script setup>
// Even if parent and grandparent both use Card,
// grandchild must import it separately
import Card from '@/components/Card.vue'
import Button from '@/components/Button.vue'
</script>

<template>
  <Card>
    <Button>Click me</Button>
  </Card>
</template>
```

### 场景 2：带有组件的插槽内容
```vue
<!-- Parent.vue -->
<script setup>
import Modal from './Modal.vue'
import Form from './Form.vue'
</script>

<template>
  <!-- Form is registered in Parent, so it works in slot content -->
  <Modal>
    <Form /> <!-- This works because slot content is compiled in Parent's scope -->
  </Modal>
</template>
```

```vue
<!-- Modal.vue -->
<script setup>
// Modal doesn't need to import Form because slot content
// is compiled in the parent's scope, not Modal's scope
</script>

<template>
  <div class="modal">
    <slot /> <!-- Form component works here because it's parent's slot content -->
  </div>
</template>
```

### 场景 3：动态组件
```vue
<!-- Container.vue -->
<script setup>
import TabA from './TabA.vue'
import TabB from './TabB.vue'
import { ref, shallowRef } from 'vue'

// When using dynamic components, all possible components must be imported
const currentTab = shallowRef(TabA)
</script>

<template>
  <component :is="currentTab" />
</template>
```

## 为什么要这样设计？

本地注册提供：
1. **显式依赖** - 您可以准确地看到每个组件使用的内容
2. **Tree-shaking** - 未使用的组件从捆绑包中删除
3. **清晰的范围** - 没有魔法或隐式行为

## 参考
- 【Vue.js组件注册-本地注册】(https://vuejs.org/guide/components/registration.html#local-registration)
