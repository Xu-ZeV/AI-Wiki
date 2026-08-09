# 具有 keep-alive Ref 问题的异步组件

## 规则

当一起使用 `<keep-alive>`、`<component>` 和 `defineAsyncComponent` 时，请注意，当组件停用后重新激活时，模板引用可能会变为未定义。

## 为什么这很重要

这是一个已知的 Vue 问题，其中 ref 绑定在首次激活时可以正常工作，但在后续激活时变得未定义。当尝试通过引用访问组件方法或属性时，这可能会导致运行时错误。

## 问题场景

```vue
<script setup>
import { ref, defineAsyncComponent } from 'vue'

const AsyncWidget = defineAsyncComponent(() =>
  import('./Widget.vue')
)

const currentComponent = ref(AsyncWidget)
const widgetRef = ref(null)

function callWidgetMethod() {
  // May be undefined after component reactivation!
  widgetRef.value?.doSomething()
}
</script>

<template>
  <keep-alive>
    <component :is="currentComponent" ref="widgetRef" />
  </keep-alive>
</template>
```

## 解决方法

### 选项 1：使用 onActivated 重新建立引用访问

```vue
<script setup>
import { ref, defineAsyncComponent, onActivated, nextTick } from 'vue'

const AsyncWidget = defineAsyncComponent(() =>
  import('./Widget.vue')
)

const currentComponent = ref(AsyncWidget)
const widgetRef = ref(null)

// Use a computed or method that waits for ref to be available
async function callWidgetMethod() {
  await nextTick()
  if (widgetRef.value) {
    widgetRef.value.doSomething()
  }
}
</script>
```

### 选项 2：避免混合所有三种模式

如果可能，请使用以下替代方案之一：

```vue
<!-- Option A: Don't use keep-alive with async components -->
<template>
  <component :is="currentComponent" ref="widgetRef" />
</template>

<!-- Option B: Use static component with keep-alive -->
<script setup>
import Widget from './Widget.vue'  // Regular import
</script>
<template>
  <keep-alive>
    <component :is="Widget" ref="widgetRef" />
  </keep-alive>
</template>
```

### 选项 3：使用 Provide/inject 代替 refs

```vue
<!-- Parent.vue -->
<script setup>
import { provide, ref } from 'vue'

const sharedState = ref({ /* shared data */ })
provide('widgetState', sharedState)
</script>

<!-- Widget.vue (async component) -->
<script setup>
import { inject } from 'vue'
const widgetState = inject('widgetState')
</script>
```

## 要点

1. 这是组合 `<keep-alive>`、`<component :is>` 和 `defineAsyncComponent` 时的已知问题
2. 组件停用/重新激活后，Refs 可能会变得不确定
3. 访问引用时使用 `nextTick` 和 null 检查
4. 考虑替代模式，例如跨组件通信的提供/注入
5. 使用此组合时要彻底测试

## 参考文献

- [Vue.js GitHub 讨论 #11334](https://github.com/orgs/vuejs/discussions/11334)
- [Vue.js 异步组件文档](https://vuejs.org/guide/components/async)
