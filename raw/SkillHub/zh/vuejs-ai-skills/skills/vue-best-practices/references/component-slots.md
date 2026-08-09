---
title: 组件槽最佳实践
impact: MEDIUM
impactDescription: Poor slot API design causes empty DOM wrappers, weak TypeScript safety, brittle defaults, and unnecessary component overhead
type: best-practice
tags: [vue3, slots, components, typescript, composables]
---

# 组件槽最佳实践

**影响：中** - 插槽是 Vue 中的核心组件 API 表面。有意地构建它们，使模板保持可预测、可键入和高性能。

## 任务列表

- 对命名槽使用简写语法（`#` 而不是 `v-slot:`）
- 仅当槽内容存在时才渲染可选槽包装元素（`$slots` 检查）
- 在 TypeScript 组件中使用 `defineSlots` 键入作用域插槽合约
- 为可选插槽提供后备内容
- 对于纯逻辑重用，更喜欢可组合件而不是无渲染组件

## 命名槽的简写语法

**不好：**
```vue
<MyComponent>
  <template v-slot:header> ... </template>
</MyComponent>
```

**好：**
```vue
<MyComponent>
  <template #header> ... </template>
</MyComponent>
```

## 有条件地渲染可选插槽包装器

当包装元素添加间距、边框或布局约束时，使用 `$slots` 检查。

**不好：**
```vue
<!-- Card.vue -->
<template>
  <article class="card">
    <header class="card-header">
      <slot name="header" />
    </header>

    <section class="card-body">
      <slot />
    </section>

    <footer class="card-footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
```

**好：**
```vue
<!-- Card.vue -->
<template>
  <article class="card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>

    <section v-if="$slots.default" class="card-body">
      <slot />
    </section>

    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </article>
</template>
```

## 使用defineSlots 输入作用域插槽属性

在 `<script setup lang="ts">` 中，使用 `defineSlots` 以便插槽使用者获得自动完成和静态检查。

**不好：**
```vue
<!-- ProductList.vue -->
<script setup lang="ts">
interface Product {
  id: number
  name: string
}

defineProps<{ products: Product[] }>()
</script>

<template>
  <ul>
    <li v-for="(product, index) in products" :key="product.id">
      <slot :product="product" :index="index" />
    </li>
  </ul>
</template>
```

**好：**
```vue
<!-- ProductList.vue -->
<script setup lang="ts">
interface Product {
  id: number
  name: string
}

defineProps<{ products: Product[] }>()

defineSlots<{
  default(props: { product: Product; index: number }): any
  empty(): any
}>()
</script>

<template>
  <ul v-if="products.length">
    <li v-for="(product, index) in products" :key="product.id">
      <slot :product="product" :index="index" />
    </li>
  </ul>
  <slot v-else name="empty" />
</template>
```

## 提供Slots后备内容

当父级省略可选插槽时，后备内容使组件具有弹性。

**不好：**
```vue
<!-- SubmitButton.vue -->
<template>
  <button type="submit" class="btn-primary">
    <slot />
  </button>
</template>
```

**好：**
```vue
<!-- SubmitButton.vue -->
<template>
  <button type="submit" class="btn-primary">
    <slot>Submit</slot>
  </button>
</template>
```

## 更喜欢可组合函数以实现纯逻辑重用

无渲染组件对于插槽驱动的组合仍然有用，但可组合函数通常对于仅逻辑重用来说更干净。

**不好：**
```vue
<!-- MouseTracker.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function onMove(event: MouseEvent) {
  x.value = event.pageX
  y.value = event.pageY
}

onMounted(() => window.addEventListener('mousemove', onMove))
onUnmounted(() => window.removeEventListener('mousemove', onMove))
</script>

<template>
  <slot :x="x" :y="y" />
</template>
```

**好：**
```ts
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function onMove(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', onMove))
  onUnmounted(() => window.removeEventListener('mousemove', onMove))

  return { x, y }
}
```

```vue
<!-- MousePosition.vue -->
<script setup lang="ts">
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <p>{{ x }}, {{ y }}</p>
</template>
```
