---
title: 使用主机组件包装器测试复杂的可组合函数
impact: MEDIUM
impactDescription: Composables using lifecycle hooks or provide/inject fail when tested directly without a component context
type: capability
tags: [vue3, testing, composables, vitest, lifecycle-hooks, provide-inject]
---

# 使用主机组件包装器测试复杂的可组合函数

**影响：中** - 使用 Vue 生命周期挂钩（`onMounted`、`onUnmounted`）或依赖项注入（`inject`）的可组合函数需要组件上下文才能运行。直接测试它们会导致错误或不正确的行为。

仅使用响应式 API 的简单可组合函数可以直接进行测试。复杂的可组合函数需要一个创建主机组件上下文的辅助函数。

## 任务清单

- [ ] 确定可组合函数是否使用生命周期挂钩或注入
- [ ] 对于简单的可组合函数（参考，仅计算）：直接测试
- [ ] 对于复杂的可组合函数：使用 `withSetup` 辅助模式
- [ ] 每次测试后卸载测试应用程序进行清理
- [ ] 使用 `app.provide()` 模拟注入的依赖项

**简单可组合 - 直接测试：**
```javascript
// composables/useCounter.js
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubled = computed(() => count.value * 2)
  const increment = () => count.value++

  return { count, doubled, increment }
}
```

```javascript
// useCounter.test.js
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

// CORRECT: Simple composable can be tested directly
describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('increments count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })

  it('computes doubled value', () => {
    const { count, doubled, increment } = useCounter(5)
    expect(doubled.value).toBe(10)
    increment()
    expect(doubled.value).toBe(12)
  })
})
```

**复杂可组合 - 使用主机包装器：**
```javascript
// composables/useFetch.js
import { ref, onMounted, onUnmounted, inject } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(true)
  let controller = null

  // Uses inject - needs component context
  const apiClient = inject('apiClient')

  // Uses lifecycle hooks - needs component context
  onMounted(async () => {
    controller = new AbortController()
    try {
      const response = await apiClient.get(url, { signal: controller.signal })
      data.value = response.data
    } catch (e) {
      if (e.name !== 'AbortError') error.value = e
    } finally {
      loading.value = false
    }
  })

  onUnmounted(() => {
    controller?.abort()
  })

  return { data, error, loading }
}
```

```javascript
// test-utils.js
import { createApp } from 'vue'

/**
 * Helper to test composables that need component context
 */
export function withSetup(composable) {
  let result

  const app = createApp({
    setup() {
      result = composable()
      // Return a render function to suppress warnings
      return () => {}
    }
  })

  app.mount(document.createElement('div'))

  return [result, app]
}
```

```javascript
// useFetch.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { withSetup } from './test-utils'
import { useFetch } from './useFetch'

describe('useFetch', () => {
  let app
  const mockApiClient = {
    get: vi.fn()
  }

  afterEach(() => {
    // IMPORTANT: Clean up to trigger onUnmounted
    app?.unmount()
  })

  it('fetches data on mount', async () => {
    mockApiClient.get.mockResolvedValue({ data: { id: 1, name: 'Test' } })

    const [result, testApp] = withSetup(() => useFetch('/api/test'))
    app = testApp

    // Provide mocked dependency
    app.provide('apiClient', mockApiClient)

    // Wait for async operations
    await flushPromises()

    expect(result.data.value).toEqual({ id: 1, name: 'Test' })
    expect(result.loading.value).toBe(false)
    expect(result.error.value).toBeNull()
  })

  it('handles errors', async () => {
    const testError = new Error('Network error')
    mockApiClient.get.mockRejectedValue(testError)

    const [result, testApp] = withSetup(() => useFetch('/api/test'))
    app = testApp
    app.provide('apiClient', mockApiClient)

    await flushPromises()

    expect(result.error.value).toBe(testError)
    expect(result.data.value).toBeNull()
  })
})
```

## 通过提供支持增强设置助手
```javascript
// test-utils.js
export function withSetup(composable, options = {}) {
  let result

  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    }
  })

  // Apply global provides before mounting
  if (options.provide) {
    Object.entries(options.provide).forEach(([key, value]) => {
      app.provide(key, value)
    })
  }

  app.mount(document.createElement('div'))

  return [result, app]
}

// Usage
const [result, app] = withSetup(() => useMyComposable(), {
  provide: {
    apiClient: mockApiClient,
    currentUser: { id: 1, name: 'Test User' }
  }
})
```

## 使用 @vue/test-utils 挂载进行测试
```javascript
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useFetch } from './useFetch'

test('useFetch in component context', async () => {
  const TestComponent = defineComponent({
    setup() {
      const { data, loading } = useFetch('/api/users')
      return { data, loading }
    },
    template: '<div>{{ loading ? "Loading..." : data }}</div>'
  })

  const wrapper = mount(TestComponent, {
    global: {
      provide: {
        apiClient: mockApiClient
      }
    }
  })

  await flushPromises()
  expect(wrapper.text()).toContain('Test data')
})
```

## 参考
- [Vue.js 测试指南 - 测试可组合函数](https://vuejs.org/guide/scaling-up/testing#testing-composables)
- [Vue Test Utils - 安装组件](https://test-utils.vuejs.org/guide/)
