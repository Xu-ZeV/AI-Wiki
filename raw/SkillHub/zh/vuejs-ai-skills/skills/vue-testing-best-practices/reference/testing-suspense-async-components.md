---
title: 将异步设置组件包裹起来以进行测试
impact: HIGH
impactDescription: Components with async setup() fail to render in tests without Suspense wrapper, causing cryptic errors
type: gotcha
tags: [vue3, testing, suspense, async-setup, vue-test-utils, vitest]
---

# 将异步设置组件包裹起来以进行测试

**影响：高** - 使用 `async setup()` 的组件需要 `<Suspense>` 包装器才能正常运行。在没有 Suspense 的情况下测试它们会导致组件永远无法渲染，从而导致测试失败和令人困惑的错误。

使用 Suspense 创建测试包装器组件，或使用 `mountSuspense` 辅助函数来测试异步组件。

## 任务清单

- [ ] 通过异步设置识别组件（在 `<script setup>` 或 `async setup()` 中使用 `await`）
- [ ] 使用 `<Suspense>` 创建包装组件进行测试
- [ ] 安装后使用 `flushPromises()` 等待异步解析
- [ ] 通过 `findComponent()` 访问实际组件进行断言
- [ ] 谨慎考虑使用 `@testing-library/vue` （有 Suspense 问题）

**错误：**
```javascript
import { mount } from '@vue/test-utils'
import AsyncUserProfile from './AsyncUserProfile.vue'

// BAD: Async component without Suspense wrapper
test('displays user data', async () => {
  // This won't render - Vue expects Suspense wrapper for async setup
  const wrapper = mount(AsyncUserProfile, {
    props: { userId: 1 }
  })

  await flushPromises()

  // This fails - component never rendered
  expect(wrapper.find('.username').text()).toBe('John')
})
```

**正确 - 手动包装组件：**
```javascript
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, Suspense } from 'vue'
import AsyncUserProfile from './AsyncUserProfile.vue'

test('displays user data', async () => {
  // Create wrapper component with Suspense
  const TestWrapper = defineComponent({
    components: { AsyncUserProfile },
    template: `
      <Suspense>
        <AsyncUserProfile :user-id="1" />
        <template #fallback>Loading...</template>
      </Suspense>
    `
  })

  const wrapper = mount(TestWrapper)

  // Initially shows fallback
  expect(wrapper.text()).toContain('Loading...')

  // Wait for async setup to complete
  await flushPromises()

  // Find the actual component for detailed assertions
  const profile = wrapper.findComponent(AsyncUserProfile)
  expect(profile.find('.username').text()).toBe('John')
})
```

**正确 - 可重用辅助函数：**
```javascript
// test-utils.js
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, Suspense, h } from 'vue'

export async function mountSuspense(component, options = {}) {
  const { props, slots, ...mountOptions } = options

  const wrapper = mount(
    defineComponent({
      render() {
        return h(
          Suspense,
          null,
          {
            default: () => h(component, props, slots),
            fallback: () => h('div', 'Loading...')
          }
        )
      }
    }),
    mountOptions
  )

  // Wait for async component to resolve
  await flushPromises()

  return {
    wrapper,
    // Provide easy access to the actual component
    component: wrapper.findComponent(component)
  }
}
```

```javascript
// AsyncUserProfile.test.js
import { mountSuspense } from './test-utils'
import AsyncUserProfile from './AsyncUserProfile.vue'

test('displays user data', async () => {
  const { component } = await mountSuspense(AsyncUserProfile, {
    props: { userId: 1 },
    global: {
      stubs: {
        // Stub any child components if needed
      }
    }
  })

  expect(component.find('.username').text()).toBe('John')
})

test('handles errors gracefully', async () => {
  const { component } = await mountSuspense(AsyncUserProfile, {
    props: { userId: 'invalid' }
  })

  expect(component.find('.error').exists()).toBe(true)
})
```

## 使用 onErrorCaptured 进行测试

```javascript
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, Suspense, h, ref, onErrorCaptured } from 'vue'
import AsyncComponent from './AsyncComponent.vue'

test('catches async errors', async () => {
  const capturedError = ref(null)

  const TestWrapper = defineComponent({
    setup() {
      onErrorCaptured((error) => {
        capturedError.value = error
        return true // Prevent error propagation
      })
      return { capturedError }
    },
    render() {
      return h(Suspense, null, {
        default: () => h(AsyncComponent, { shouldFail: true }),
        fallback: () => h('div', 'Loading...')
      })
    }
  })

  const wrapper = mount(TestWrapper)
  await flushPromises()

  expect(capturedError.value).toBeTruthy()
  expect(capturedError.value.message).toContain('Failed to load')
})
```

## 与 Nuxt 的 mountSuspished 一起使用

```javascript
// If using Nuxt, use the built-in mountSuspended helper
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AsyncPage from './AsyncPage.vue'

test('renders async page', async () => {
  const wrapper = await mountSuspended(AsyncPage, {
    props: { id: 1 }
  })

  expect(wrapper.find('h1').text()).toBe('Page Title')
})
```

## 重要警告

### @testing-library/vue 限制
```javascript
// CAUTION: @testing-library/vue has issues with Suspense
// Use @vue/test-utils for async components instead

// If you must use Testing Library, create manual wrapper:
import { render, waitFor } from '@testing-library/vue'

test('async component with testing library', async () => {
  const TestWrapper = {
    template: `
      <Suspense>
        <AsyncComponent />
      </Suspense>
    `,
    components: { AsyncComponent }
  }

  const { getByText } = render(TestWrapper)

  await waitFor(() => {
    expect(getByText('Loaded content')).toBeInTheDocument()
  })
})
```

### 访问组件实例
```javascript
test('access vm on async component', async () => {
  const { wrapper, component } = await mountSuspense(AsyncComponent)

  // The wrapper.vm is the Suspense wrapper - not useful
  // Use component.vm for the actual async component
  expect(component.vm.someData).toBe('value')
})
```

## 参考
- [Vue 测试工具 - 异步Suspense](https://test-utils.vuejs.org/guide/advanced/async-suspense)
- [Vue.js Suspense 文档](https://vuejs.org/guide/built-ins/suspense.html)
- [测试库VueSuspense问题](https://github.com/testing-library/vue-testing-library/issues/230)
