# 异步组件错误处理

## 规则

始终使用 `errorComponent` 和/或 `onError` 回调配置异步组件的错误处理。如果没有正确的错误处理，失败的组件加载可能会使 UI 处于未定义状态，并且没有用户反馈。

## 为什么这很重要

网络故障、超时和服务器错误在生产中很常见。如果没有错误处理，用户会看到空白或损坏的 UI，而没有任何指示出现问题或如何恢复。

## 错误代码

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// No error handling - fails silently
const AsyncWidget = defineAsyncComponent(() =>
  import('./Widget.vue')
)
</script>
```

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// isLoading never becomes false on error - infinite spinner
const isLoading = ref(true)
const Widget = defineAsyncComponent({
  loader: () => import('./Widget.vue').finally(() => {
    isLoading.value = false  // Only runs on success
  })
})
</script>
```

## 好的代码

```vue
<script setup>
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const AsyncWidget = defineAsyncComponent({
  loader: () => import('./Widget.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,    // Prevent loading flicker
  timeout: 10000 // Show error after 10 seconds
})
</script>
```

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// With retry logic using onError
const AsyncWidget = defineAsyncComponent({
  loader: () => import('./Widget.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) {
      // Retry up to 3 times
      retry()
    } else {
      // Give up and show error component
      fail()
    }
  }
})
</script>
```

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

// Fallback component pattern - catch in loader
const AsyncWidget = defineAsyncComponent(() =>
  import('./Widget.vue').catch(() => import('./WidgetFallback.vue'))
)
</script>
```

## onError 回调参数

`onError` 回调接收四个参数：

|参数|类型 |描述 |
|-----------|------|-------------|
| `error` | `Error` |导致加载失败的错误 |
| `retry` | `Function` |调用重试加载组件 |
| `fail` | `Function` |调用放弃并显示errorComponent |
| `attempts` | `number` |迄今为止的加载尝试次数|

## 要点

1. 始终为生产应用程序提供 `errorComponent`
2.使用`timeout`防止无限加载状态
3. 考虑使用 `onError` 重试逻辑来解决暂时性网络问题
4. `delay`选项（默认200ms）防止在快速网络上加载闪烁
5. 当您想要无缝降级时，请使用后备模式（加载程序中的 `.catch()`）

## SSR 警告

将 `onError` 与 SSR 一起使用可能会导致某些配置出现问题，可能导致无限加载。在 SSR 环境中进行彻底测试。

## 参考文献

- [Vue.js 异步组件文档](https://vuejs.org/guide/components/async)
- [处理异步组件加载错误](https://awad.dev/blog/handling-async-component-loading-errors/)
