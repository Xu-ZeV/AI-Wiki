---
title: 使用 createTestingPinia 和 setActivePinia 配置 Pinia 测试
impact: HIGH
impactDescription: Missing Pinia configuration causes 'injection Symbol(pinia) not found' errors and failing tests
type: gotcha
tags: [vue3, testing, pinia, vitest, store, mocking, createTestingPinia]
---

# 使用 createTestingPinia 和 setActivePinia 配置 Pinia 测试

**影响：高** - 在没有正确配置的情况下测试使用 Pinia 存储的组件或可组合函数会导致“[Vue warn]：未找到注入符号（pinia）”错误。测试将失败或表现异常。

使用 `@pinia/testing` 包和 `createTestingPinia` 进行组件测试，使用 `setActivePinia(createPinia())` 直接进行单元测试存储。

## 任务清单

- [ ] 安装 `@pinia/testing` 作为开发依赖项
- [ ] 在使用 `global.plugins` 的组件测试中使用 `createTestingPinia`
- [ ] 在 `beforeEach` 中使用 `setActivePinia(createPinia())` 进行store 单元测试
- [ ] 在 Vitest 中不使用 `globals: true` 时配置 `createSpy: vi.fn`
- [ ] 在每个测试中初始化存储以获得新鲜状态
- [ ] 当你需要实际动作执行时使用`stubActions: false`

**错误：**
```javascript
import { mount } from '@vue/test-utils'
import UserProfile from './UserProfile.vue'

// BAD: Missing Pinia - causes injection error
test('displays user name', () => {
  const wrapper = mount(UserProfile)  // ERROR: injection "Symbol(pinia)" not found
  expect(wrapper.text()).toContain('John')
})
```

```javascript
import { useUserStore } from '@/stores/user'

// BAD: No active Pinia instance
test('user store actions', () => {
  const store = useUserStore()  // ERROR: no active Pinia
  store.login('john', 'password')
})
```

**正确 - 组件测试：**
```javascript
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import UserProfile from './UserProfile.vue'
import { useUserStore } from '@/stores/user'

// CORRECT: Provide testing pinia with stubbed actions
test('displays user name', () => {
  const wrapper = mount(UserProfile, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,  // Required if not using globals: true
          initialState: {
            user: { name: 'John', email: 'john@example.com' }
          }
        })
      ]
    }
  })

  expect(wrapper.text()).toContain('John')
})

// CORRECT: Test with stubbed actions (default behavior)
test('calls logout action', async () => {
  const wrapper = mount(UserProfile, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })]
    }
  })

  // Get store AFTER mounting with createTestingPinia
  const store = useUserStore()

  await wrapper.find('[data-testid="logout"]').trigger('click')

  // Actions are stubbed and wrapped in spies
  expect(store.logout).toHaveBeenCalled()
})
```

**正确 - store 单元测试：**
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

describe('User Store', () => {
  beforeEach(() => {
    // Create fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  it('initializes with empty user', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('updates user on login', async () => {
    const store = useUserStore()

    // Real action executes - not stubbed
    await store.login('john', 'password')

    expect(store.user).toEqual({ name: 'John' })
    expect(store.isLoggedIn).toBe(true)
  })

  it('clears user on logout', () => {
    const store = useUserStore()
    store.user = { name: 'John' }  // Set initial state

    store.logout()

    expect(store.user).toBeNull()
  })
})
```

## 使用真实操作与存根操作进行测试

```javascript
import { createTestingPinia } from '@pinia/testing'

// Stubbed actions (default) - for isolation
const wrapper = mount(Component, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        // stubActions: true (default) - actions are mocked
      })
    ]
  }
})

// Real actions - for integration testing
const wrapper = mount(Component, {
  global: {
    plugins: [
      createTestingPinia({
        createSpy: vi.fn,
        stubActions: false  // Actions execute normally
      })
    ]
  }
})
```

## 模拟特定操作的实现

```javascript
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { vi } from 'vitest'
import { useCartStore } from '@/stores/cart'

test('handles checkout failure', async () => {
  const wrapper = mount(Checkout, {
    global: {
      plugins: [createTestingPinia({ createSpy: vi.fn })]
    }
  })

  const cartStore = useCartStore()

  // Mock specific action behavior
  cartStore.checkout.mockRejectedValue(new Error('Payment failed'))

  await wrapper.find('[data-testid="checkout"]').trigger('click')
  await flushPromises()

  expect(wrapper.find('.error').text()).toContain('Payment failed')
})
```

## 使用 vi.spyOn 监视操作

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { vi } from 'vitest'
import { useUserStore } from '@/stores/user'

test('tracks action calls', async () => {
  setActivePinia(createPinia())
  const store = useUserStore()

  const loginSpy = vi.spyOn(store, 'login')
  loginSpy.mockResolvedValue({ success: true })

  await store.login('john', 'password')

  expect(loginSpy).toHaveBeenCalledWith('john', 'password')
})
```

## 测试store $subscribe

```javascript
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

test('subscription triggers on state change', () => {
  setActivePinia(createPinia())
  const store = useUserStore()

  const callback = vi.fn()
  store.$subscribe(callback)

  store.user = { name: 'John' }

  expect(callback).toHaveBeenCalled()
})
```

## 参考
- [Pinia测试指南](https://pinia.vuejs.org/cookbook/testing.html)
- [@pinia/测试包](https://www.npmjs.com/package/@pinia/testing)
- [Vue 测试工具 - 插件](https://test-utils.vuejs.org/guide/advanced/plugins.html)
