# Suspense SSR 水合问题和解决方法

## 规则

`<Suspense>` 已知 SSR 水合问题，尤其是异步组件。在初始水合过程中，Suspense 可能无法在其“Suspense外衣”中正确包含子组件，从而导致水合不匹配、闪烁或运行时崩溃。

## 为什么这很重要

在 SSR 应用中，水合不匹配会导致：
- 客户端重新渲染时视觉闪烁
- 受影响组件的状态丢失
- 开发中的控制台警告（生产中的静默故障）
- 边缘情况下潜在的运行时崩溃
- 用户体验差，尤其是在较慢的网络上

## 错误代码

```vue
<template>
  <!-- Async component directly in Suspense can fail hydration -->
  <Suspense>
    <AsyncDashboard />
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncDashboard = defineAsyncComponent(
  () => import('./Dashboard.vue')
)
</script>
```

## 好的代码

### 解决方案 1：用 Suspense 包装异步组件

```vue
<template>
  <!-- Each async component wrapped in its own Suspense -->
  <div class="dashboard">
    <Suspense>
      <AsyncHeader />
      <template #fallback><HeaderSkeleton /></template>
    </Suspense>

    <Suspense>
      <AsyncContent />
      <template #fallback><ContentSkeleton /></template>
    </Suspense>
  </div>
</template>
```

### 解决方案 2：使用 ClientOnly 包装器（Nuxt/SSR 框架）

```vue
<template>
  <!-- Prevent SSR for problematic async components -->
  <ClientOnly>
    <Suspense>
      <AsyncDashboard />
      <template #fallback>
        Loading dashboard...
      </template>
    </Suspense>

    <template #fallback>
      <DashboardSkeleton />
    </template>
  </ClientOnly>
</template>
```

### 解决方案 3：使用适当的陈旧时间进行预取（使用 TanStack 查询）

```vue
<script setup>
import { useQuery, useQueryClient } from '@tanstack/vue-query'

// IMPORTANT: All useQuery calls must be BEFORE any await
const { data, suspense } = useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchDashboardData,
  staleTime: 1000 * 60 * 5, // 5 minutes - prevents refetch after hydration
})

// Wait for suspense AFTER all useQuery calls
await suspense()

// Now safe to use data
</script>
```

### 解决方案 4：优雅地处理水合错误

```vue
<script setup>
import { ref, onErrorCaptured, onMounted } from 'vue'

const hydrationError = ref(false)
const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

onErrorCaptured((err) => {
  if (err.message?.includes('hydration')) {
    hydrationError.value = true
    return false
  }
})
</script>

<template>
  <div v-if="hydrationError" class="hydration-recovery">
    <!-- Force client-only re-render -->
    <Suspense v-if="isClient">
      <AsyncContent />
      <template #fallback>Recovering...</template>
    </Suspense>
  </div>

  <Suspense v-else>
    <AsyncContent />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```

## 常见SSR+Suspense问题

|问题 |原因 |解决方案 |
|-------|-------|----------|
|水合作用不匹配 |异步块未及时加载 |用 Suspense 换行或使用 ClientOnly |
| Safari 上出现空闪 |块加载缓慢 |预加载关键块，使用骨架 |
|等待错误后使用查询 |等待后 Vue 上下文丢失 |将所有 useQuery 调用放在任何等待 | 之前
|补水后立即补充 | staleTime 太低 |设置适当的 staleTime 值 |

## 要点

1. Suspense + SSR 已知边缘情况 - 彻底测试
2. Safari 的区块加载速度较慢，会引发更多水合作用问题
3. 使用数据获取库，确保在等待挂起之前设置查询
4. 考虑对非关键异步内容使用 ClientOnly 包装器
5.设置适当的staleTime，防止水合后不必要的重新获取
6. 使用与服务器渲染内容结构相匹配的骨架屏幕

## 参考文献

- [Vue.js Suspense 文档](https://vuejs.org/guide/built-ins/suspense)
- [Vue Issue #6638 - Suspense水合](https://github.com/vuejs/core/issues/6638)
- [Vue 问题 #7672 - DefineAsyncComponent SSR](https://github.com/vuejs/core/issues/7672)
- [TanStack查询SSR讨论](https://github.com/TanStack/query/discussions/4870)
