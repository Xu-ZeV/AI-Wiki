# Suspense 没有内置的错误处理

## 规则

`<Suspense>` 不通过组件本身提供错误处理。您必须在父组件中使用 `errorCaptured` 选项或 `onErrorCaptured()` 挂钩来实现错误处理，以捕获异步错误。

## 为什么这很重要

如果没有明确的错误处理，挂起组件中的异步错误将未被捕获地传播，可能导致应用程序崩溃或让用户陷入加载状态。与 React 的错误边界不同，Vue 的 Suspense 需要手动实现错误边界。

## 错误代码

```vue
<script setup>
// No error handling - async errors will propagate uncaught
</script>

<template>
  <Suspense>
    <AsyncComponent />
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

## 好的代码

```vue
<script setup>
import { ref, onErrorCaptured } from 'vue'
import AsyncComponent from './AsyncComponent.vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false // Prevent error from propagating further
})
</script>

<template>
  <div v-if="error" class="error-state">
    <p>Something went wrong: {{ error.message }}</p>
    <button @click="error = null">Retry</button>
  </div>

  <Suspense v-else>
    <AsyncComponent />
    <template #fallback>
      Loading...
    </template>
  </Suspense>
</template>
```

## 可重用的错误边界模式

```vue
<!-- ErrorBoundary.vue -->
<script setup>
import { ref, onErrorCaptured } from 'vue'

const props = defineProps({
  fallback: {
    type: String,
    default: 'Something went wrong'
  }
})

const emit = defineEmits(['error'])

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = { err, instance, info }
  emit('error', { err, instance, info })
  return false
})

const reset = () => {
  error.value = null
}

defineExpose({ reset })
</script>

<template>
  <slot v-if="!error" />
  <slot v-else name="error" :error="error" :reset="reset">
    <div class="error-boundary">
      {{ fallback }}
      <button @click="reset">Retry</button>
    </div>
  </slot>
</template>
```

```vue
<!-- Usage -->
<template>
  <ErrorBoundary @error="logError">
    <Suspense>
      <AsyncDashboard />
      <template #fallback>Loading dashboard...</template>
    </Suspense>

    <template #error="{ error, reset }">
      <DashboardError :error="error" @retry="reset" />
    </template>
  </ErrorBoundary>
</template>
```

## 要点

1. 在生产中始终使用错误处理逻辑包装 `<Suspense>`
2. 对于组合 API 使用 `onErrorCaptured` 或对于选项 API 使用 `errorCaptured` 选项
3. 从错误处理程序返回 `false` 以停止传播
4. 考虑创建可重用的 `ErrorBoundary` 组件以减少样板代码
5. 为用户提供重试失败操作的方法

## 参考文献

- [Vue.js Suspense 文档](https://vuejs.org/guide/built-ins/suspense#error-handling)
- [Vue.js onErrorCaptured](https://vuejs.org/api/composition-api-lifecycle#onerrorcaptured)
