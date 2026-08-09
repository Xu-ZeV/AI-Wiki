---
title: Suspense组件最佳实践
impact: MEDIUM
impactDescription: Suspense coordinates async dependencies with fallback UI; misconfiguration leads to missing loading states or confusing UX
type: best-practice
tags: [vue3, suspense, async-components, async-setup, loading, fallback, router, transition, keepalive]
---

# Suspense组件最佳实践

**影响：中** - `<Suspense>` 协调异步依赖项（异步组件或异步设置）并在解析时呈现回退。配置错误会导致加载状态缺失、渲染为空或微妙的用户体验错误。

## 任务列表

- 将默认和后备插槽内容包装在单个根节点中
- 当您需要回退时使用 `timeout`
- 当您需要 Suspense 重新触发时，强制使用 `:key` 替换根
- 将 `suspensible` 添加到嵌套 Suspense 边界（Vue 3.3+）
- 使用 `@pending`、`@resolve` 和 `@fallback` 进行编程加载状态
- 按顺序嵌套 `RouterView` -> `Transition` -> `KeepAlive` -> `Suspense`
- 在生产中集中并记录 Suspense 的使用情况

## 默认和后备插槽中的单根

Suspense 跟踪两个槽中的单个直接子项。将多个元素包装在单个元素或组件中。

**不好：**
```vue
<template>
  <Suspense>
    <AsyncHeader />
    <AsyncList />

    <template #fallback>
      <LoadingSpinner />
      <LoadingHint />
    </template>
  </Suspense>
</template>
```

**好：**
```vue
<template>
  <Suspense>
    <div>
      <AsyncHeader />
      <AsyncList />
    </div>

    <template #fallback>
      <div>
        <LoadingSpinner />
        <LoadingHint />
      </div>
    </template>
  </Suspense>
</template>
```

## 恢复时的回退计时 (`timeout`)

当 Suspense 已经解决并且新的异步工作开始时，之前的内容仍然可见，直到超时。使用 `timeout="0"` 立即回退或短暂延迟以避免闪烁。

**不好：**
```vue
<template>
  <Suspense>
    <component :is="currentView" :key="viewKey" />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

**好：**
```vue
<template>
  <Suspense :timeout="200">
    <component :is="currentView" :key="viewKey" />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

## 挂起状态仅在根替换时重新触发

一旦解决，Suspense 仅在默认槽的根节点发生更改时重新进入挂起状态。如果异步工作发生在树的更深处，则不会出现回退。

**不好：**
```vue
<template>
  <Suspense>
    <TabContainer>
      <AsyncDashboard v-if="tab === 'dashboard'" />
      <AsyncSettings v-else />
    </TabContainer>

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

**好：**
```vue
<template>
  <Suspense>
    <component :is="tabs[tab]" :key="tab" />

    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

## 使用 `suspensible` 进行嵌套Suspense (Vue 3.3+)

嵌套 Suspense 边界需要在内部边界上设置 `suspensible`，以便父级可以协调加载状态。如果没有它，内部异步内容可能会呈现空节点，直到解决为止。

**不好：**
```vue
<template>
  <Suspense>
    <LayoutShell>
      <Suspense>
        <AsyncWidget />
        <template #fallback>Loading widget...</template>
      </Suspense>
    </LayoutShell>

    <template #fallback>Loading layout...</template>
  </Suspense>
</template>
```

**好：**
```vue
<template>
  <Suspense>
    <LayoutShell>
      <Suspense suspensible>
        <AsyncWidget />
        <template #fallback>Loading widget...</template>
      </Suspense>
    </LayoutShell>

    <template #fallback>Loading layout...</template>
  </Suspense>
</template>
```

## 跟踪加载Suspense事件

使用 `@pending`、`@resolve` 和 `@fallback` 进行分析、全局加载指示器或协调 Suspense 边界之外的 UI。

```vue
<script setup>
import { ref } from 'vue'

const isLoading = ref(false)

const onPending = () => {
  isLoading.value = true
}

const onResolve = () => {
  isLoading.value = false
}
</script>

<template>
  <LoadingBar v-if="isLoading" />

  <Suspense @pending="onPending" @resolve="onResolve">
    <AsyncPage />
    <template #fallback>
      <PageSkeleton />
    </template>
  </Suspense>
</template>
```

## 推荐使用 RouterView、Transition、KeepAlive 进行嵌套

组合这些组件时，嵌套顺序应为 `RouterView` -> `Transition` -> `KeepAlive` -> `Suspense`，以便每个包装器正常工作。

**不好：**
```vue
<template>
  <RouterView v-slot="{ Component }">
    <Suspense>
      <KeepAlive>
        <Transition mode="out-in">
          <component :is="Component" />
        </Transition>
      </KeepAlive>
    </Suspense>
  </RouterView>
</template>
```

**好：**
```vue
<template>
  <RouterView v-slot="{ Component }">
    <Transition mode="out-in">
      <KeepAlive>
        <Suspense>
          <component :is="Component" />
          <template #fallback>Loading...</template>
        </Suspense>
      </KeepAlive>
    </Transition>
  </RouterView>
</template>
```

## 制作中谨慎对待Suspense

在生产代码中，保持 Suspense 边界最小化，记录它们的使用位置，并在需要替换或重构它们时制定后备加载策略。
