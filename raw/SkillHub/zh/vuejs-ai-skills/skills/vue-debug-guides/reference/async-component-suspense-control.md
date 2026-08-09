---
title: Suspense 覆盖异步组件加载和错误选项
impact: MEDIUM
impactDescription: Async component loading/error options are ignored under a parent Suspense, leading to missing spinners and error UIs
type: gotcha
tags: [vue3, suspense, async-components, loading, error-handling]
---

# Suspense 覆盖异步组件加载和错误选项

**影响：中度** - 当异步组件在父 `<Suspense>` 内部渲染时，其 `loadingComponent`、`errorComponent`、`delay` 和 `timeout` 选项不会运行。父 Suspense 控制加载和错误 UX。

## 任务清单

- [ ] 确认异步组件是否在 `<Suspense>` 边界内
- [ ] 当组件必须管理自己的加载/错误 UI 时，使用 `suspensible: false`
- [ ] 或者将加载/错误 UI 移至父级 `<Suspense>` 回退和错误边界 (`onErrorCaptured`)
- [ ] 为加载失败提供重试路径

**错误：**
```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  timeout: 3000
})
</script>

<template>
  <Suspense>
    <AsyncDashboard />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```

**正确（组件处理自己的状态）：**
```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  timeout: 3000,
  suspensible: false
})
</script>

<template>
  <AsyncDashboard />
</template>
```

**正确（父 Suspense 拥有加载/错误 UI）：**
```vue
<script setup>
import { onErrorCaptured, ref } from 'vue'
import AsyncDashboard from './AsyncDashboard.vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})
</script>

<template>
  <ErrorDisplay v-if="error" :error="error" />

  <Suspense v-else>
    <AsyncDashboard />
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
```
