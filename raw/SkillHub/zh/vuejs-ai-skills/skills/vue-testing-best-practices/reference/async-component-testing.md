---
title: 使用flushPromises来测试异步组件
impact: HIGH
impactDescription: Without awaiting async operations, tests make assertions before the component has rendered, causing false negatives
type: gotcha
tags: [vue3, testing, async, defineAsyncComponent, flushPromises, vitest]
---

# 使用flushPromises来测试异步组件

**影响：高** - 测试使用 `defineAsyncComponent` 创建的异步组件时，必须使用 `await flushPromises()` 确保组件在做出断言之前已加载。 Vue 异步更新，因此不考虑这一点的测试将在组件渲染之前做出断言。

## 任务清单

- [ ] 在异步组件的测试函数中使用 `async/await`
- [ ]挂载异步组件后调用`await flushPromises()`
- [ ] 通过在 `flushPromises()` 之前进行断言来测试加载状态
- [ ] 使用 `defineAsyncComponent` 中拒绝的承诺测试错误状态
- [ ] 将 `trigger()` 与 `await` 一起使用，因为它返回 Promise

**错误：**

```javascript
import { mount } from '@vue/test-utils'
import { defineAsyncComponent } from 'vue'

const AsyncWidget = defineAsyncComponent(() =>
  import('./Widget.vue')
)

test('renders async component', () => {
  const wrapper = mount(AsyncWidget)

  // FAILS: Component hasn't loaded yet
  expect(wrapper.text()).toContain('Widget Content')
})
```

**正确：**

```javascript
import { mount, flushPromises } from '@vue/test-utils'
import { defineAsyncComponent, nextTick } from 'vue'

const AsyncWidget = defineAsyncComponent(() =>
  import('./Widget.vue')
)

test('renders async component', async () => {
  const wrapper = mount(AsyncWidget)

  // Wait for async component to load
  await flushPromises()

  expect(wrapper.text()).toContain('Widget Content')
})

test('shows loading state initially', async () => {
  const AsyncWithLoading = defineAsyncComponent({
    loader: () => import('./Widget.vue'),
    loadingComponent: { template: '<div>Loading...</div>' },
    delay: 0
  })

  const wrapper = mount(AsyncWithLoading)

  // Check loading state immediately
  expect(wrapper.text()).toContain('Loading...')

  // Wait for component to load
  await flushPromises()

  // Check final state
  expect(wrapper.text()).toContain('Widget Content')
})
```

## Suspense测试

```javascript
import { mount, flushPromises } from '@vue/test-utils'
import { Suspense, defineAsyncComponent, h } from 'vue'

const AsyncWidget = defineAsyncComponent(() =>
  import('./Widget.vue')
)

test('renders async component with Suspense', async () => {
  const wrapper = mount({
    components: { AsyncWidget },
    template: `
      <Suspense>
        <AsyncWidget />
        <template #fallback>
          <div>Loading...</div>
        </template>
      </Suspense>
    `
  })

  // Initially shows fallback
  expect(wrapper.text()).toContain('Loading...')

  // Wait for async resolution
  await flushPromises()

  // Now shows actual content
  expect(wrapper.text()).toContain('Widget Content')
})
```

## 测试错误状态

```javascript
import { mount, flushPromises } from '@vue/test-utils'
import { defineAsyncComponent } from 'vue'

test('shows error component on load failure', async () => {
  const AsyncWithError = defineAsyncComponent({
    loader: () => Promise.reject(new Error('Failed to load')),
    errorComponent: { template: '<div>Error loading component</div>' }
  })

  const wrapper = mount(AsyncWithError)

  await flushPromises()

  expect(wrapper.text()).toContain('Error loading component')
})
```

## 实用程序参考

|实用程序 |目的|
|---------|---------|
| `await flushPromises()` |解决所有未决的承诺 |
| `await nextTick()` |等待 Vue 的下一个 DOM 更新周期 |
| `await wrapper.trigger('click')` |触发事件并等待更新 |

## 动态导入处理

**注意：** 在测试环境中，动态导入 (`import('./File.vue')`) 可能需要 `flushPromises()` 之外的其他处理。像 Vitest 这样的测试运行程序处理模块解析的方式与运行时捆绑程序不同，这可能会导致动态导入的计时问题。如果 `flushPromises()` 单独无法解析该组件，请考虑：

- 模拟动态导入同步返回组件
- 按顺序使用多个 `await flushPromises()` 调用
- 将断言包装在 `waitFor()` 或重试实用程序中
- 配置测试运行程序的模块分辨率设置

```javascript
// If flushPromises() isn't sufficient, mock the import
vi.mock('./Widget.vue', () => ({
  default: { template: '<div>Widget Content</div>' }
}))

// Or use multiple flush calls for nested async operations
await flushPromises()
await flushPromises()
```

## 参考文献

- [Vue 测试工具 - 异步行为](https://test-utils.vuejs.org/guide/advanced/async-suspense)
- [Vue.js 异步组件文档](https://vuejs.org/guide/components/async)
