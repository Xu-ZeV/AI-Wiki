---
title: 异步组件最佳实践
impact: MEDIUM
impactDescription: Poor async component strategy can delay interactivity in SSR apps and create loading UI flicker
type: best-practice
tags: [vue3, async-components, ssr, hydration, performance, ux]
---

# 异步组件最佳实践

**影响：中** - 异步组件应该降低 JavaScript 成本，而不会降低感知性能。专注于 SSR 中的水合时间和稳定的加载 UX。

## 任务列表

- 对非关键 SSR 组件树使用惰性水合策略
- 仅导入您实际使用的水合助手
- 保持 `loadingComponent` 延迟接近默认 `200ms` 除非真实的 UX 数据另有说明
- 将 `delay` 和 `timeout` 配置在一起，以实现可预测的加载行为

## 在 SSR 中使用惰性水合策略

在 Vue 3.5+ 中，异步组件可以延迟水合作用，直到空闲时间、可见性、媒体查询匹配或用户交互。

**不好：**
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const AsyncComments = defineAsyncComponent({
  loader: () => import('./Comments.vue')
})
</script>
```

**好：**
```vue
<script setup lang="ts">
import {
  defineAsyncComponent,
  hydrateOnVisible,
  hydrateOnIdle
} from 'vue'

const AsyncComments = defineAsyncComponent({
  loader: () => import('./Comments.vue'),
  hydrate: hydrateOnVisible({ rootMargin: '100px' })
})

const AsyncFooter = defineAsyncComponent({
  loader: () => import('./Footer.vue'),
  hydrate: hydrateOnIdle(5000)
})
</script>
```

## 防止加载旋转闪烁

避免立即显示通常快速解析的组件的加载 UI。

**不好：**
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,
  delay: 0
})
</script>
```

**好：**
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const AsyncDashboard = defineAsyncComponent({
  loader: () => import('./Dashboard.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 30000
})
</script>
```

## 延迟指南

|场景 |建议延迟 |
|----------|-------------------|
|小组件，快速网络 | `200ms` |
|已知重组分| `100ms` |
|背景或非关键 UI | `300-500ms` |
