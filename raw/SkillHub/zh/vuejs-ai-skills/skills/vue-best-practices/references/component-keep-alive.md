---
title: KeepAlive 组件最佳实践
impact: HIGH
impactDescription: KeepAlive caches component instances; misuse causes stale data, memory growth, or unexpected lifecycle behavior
type: best-practice
tags: [vue3, keepalive, cache, performance, router, dynamic-components]
---

# KeepAlive 组件最佳实践

**影响：高** - `<KeepAlive>` 缓存组件实例而不是销毁它们。使用它来保留跨交换机的状态，但显式管理缓存大小和新鲜度以避免内存增长或过时的 UI。

## 任务列表

- 仅在状态保存改善用户体验时使用 KeepAlive
- 设置合理的 `max` 来限制缓存大小
- 声明包含/排除匹配的组件名称
- 使用 `onActivated`/`onDeactivated` 进行缓存感知逻辑
- 决定缓存视图如何以及何时刷新其数据
- 避免缓存占用大量内存或安全敏感的视图

## 何时使用 KeepAlive

在状态应保持不变的视图（选项卡、多步骤表单、仪表板）之间切换时，请使用 KeepAlive。当每次访问都应该重新开始时，请避免这样做。

**不好：**
```vue
<template>
  <!-- State resets on every switch -->
  <component :is="currentTab" />
</template>
```

**好：**
```vue
<template>
  <!-- State preserved between switches -->
  <KeepAlive>
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

## 何时不使用 KeepAlive

- 搜索或过滤用户期望新鲜结果的页面
- 占用大量内存的组件（地图、大型表格、媒体播放器）
- 退出时必须清除数据的敏感流
- 后台活动频繁的组件无法暂停

## 限制和控制缓存

始终使用 `max` 限制缓存大小，并在可能的情况下将缓存限制到特定组件。

```vue
<template>
  <KeepAlive :max="5" include="Dashboard,Settings">
    <component :is="currentView" />
  </KeepAlive>
</template>
```

## 确保组件名称匹配包含/排除

`include` 和 `exclude` 与组件 `name` 选项匹配。显式设置名称以实现可靠的缓存。

```vue
<!-- TabA.vue -->
<script setup>
defineOptions({ name: 'TabA' })
</script>
```

```vue
<template>
  <KeepAlive include="TabA,TabB">
    <component :is="currentTab" />
  </KeepAlive>
</template>
```

## 缓存失效策略

Vue 3 没有直接的 API 来删除特定的缓存实例。使用键或动态包含/排除来强制刷新。

```vue
<script setup>
import { ref, reactive } from 'vue'

const currentView = ref('Dashboard')
const viewKeys = reactive({ Dashboard: 0, Settings: 0 })

function invalidateCache(view) {
  viewKeys[view]++
}
</script>

<template>
  <KeepAlive>
    <component :is="currentView" :key="`${currentView}-${viewKeys[currentView]}`" />
  </KeepAlive>
</template>
```

## 缓存组件的生命周期挂钩

缓存的组件不会在交换机上被破坏。使用激活挂钩进行刷新和清理。

```vue
<script setup>
import { onActivated, onDeactivated } from 'vue'

onActivated(() => {
  refreshData()
})

onDeactivated(() => {
  pauseTimers()
})
</script>
```

## 路由器缓存和新鲜度

决定导航是否应显示缓存状态或新视图。一种常见的模式是当参数更改时通过路由进行键控。

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <KeepAlive>
      <component :is="Component" :key="route.fullPath" />
    </KeepAlive>
  </router-view>
</template>
```

如果您想要缓存重用但需要新鲜数据，请在 `onActivated` 中刷新并在获取之前比较查询/参数。
