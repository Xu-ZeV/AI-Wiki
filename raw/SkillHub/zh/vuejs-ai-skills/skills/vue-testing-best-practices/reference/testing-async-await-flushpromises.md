---
title: 使用nextTick和flushPromises正确处理异步更新
impact: HIGH
impactDescription: Race conditions and flaky tests occur when async DOM updates or API calls complete after assertions run
type: gotcha
tags: [vue3, testing, async, flushPromises, nextTick, vitest, vue-test-utils, race-condition]
---

# 使用nextTick和flushPromises正确处理异步更新

**影响：高** - Vue 异步更新 DOM。如果没有正确等待这些更新，测试可能会针对过时的 DOM 状态进行断言，从而导致间歇性故障和漏报。

将 `await` 与触发器和 `setValue` 结合使用，使用 `nextTick` 进行响应式更新，并使用 `flushPromises` 进行外部异步操作（例如 API 调用）。

## 任务清单

- [ ] 始终等待 `trigger()` 和 `setValue()` 呼叫
- [ ] 在编程反应状态更改后使用 `await nextTick()`
- [ ] 使用 `await flushPromises()` 进行外部异步操作（API 调用、计时器）
- [ ] 不要链接多个 `nextTick` 调用 - 使用 `flushPromises` 代替
- [ ] 考虑使用测试库中的 `waitFor` 进行轮询断言

**错误：**
```javascript
import { mount } from '@vue/test-utils'
import SearchComponent from './SearchComponent.vue'

// BAD: Not awaiting trigger - assertion runs before DOM updates
test('search filters results', () => {
  const wrapper = mount(SearchComponent)

  wrapper.find('input').setValue('vue')  // Missing await!
  wrapper.find('button').trigger('click')  // Missing await!

  // This assertion likely fails - DOM hasn't updated yet
  expect(wrapper.findAll('.result').length).toBe(3)
})

// BAD: Using nextTick for API calls
test('loads data from API', async () => {
  const wrapper = mount(DataLoader)

  await nextTick()  // This won't wait for the API call!

  // Assertion runs before fetch completes
  expect(wrapper.find('.data').text()).toBe('Loaded data')
})
```

**正确：**
```javascript
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import SearchComponent from './SearchComponent.vue'
import DataLoader from './DataLoader.vue'

// CORRECT: Await trigger and setValue
test('search filters results', async () => {
  const wrapper = mount(SearchComponent)

  await wrapper.find('input').setValue('vue')
  await wrapper.find('button').trigger('click')

  expect(wrapper.findAll('.result').length).toBe(3)
})

// CORRECT: Use flushPromises for API calls
test('loads data from API', async () => {
  const wrapper = mount(DataLoader)

  // Wait for all pending promises to resolve
  await flushPromises()

  expect(wrapper.find('.data').text()).toBe('Loaded data')
})
```

## 何时使用每种方法

### `await trigger()` / `await setValue()` - 用户交互
```javascript
// These methods return nextTick internally
await wrapper.find('button').trigger('click')
await wrapper.find('input').setValue('new value')
await wrapper.find('form').trigger('submit')
```

### `await nextTick()` - 程序化反应更新
```javascript
import { nextTick } from 'vue'

test('reflects programmatic state changes', async () => {
  const wrapper = mount(Counter)

  // Direct state modification (when testing with exposed internals)
  wrapper.vm.count = 5

  await nextTick()  // Wait for Vue to update DOM

  expect(wrapper.find('.count').text()).toBe('5')
})
```

### `await flushPromises()` - 外部异步操作
```javascript
import { flushPromises } from '@vue/test-utils'

test('displays fetched data', async () => {
  const wrapper = mount(UserProfile, {
    props: { userId: 1 }
  })

  // Wait for component's API call to complete
  await flushPromises()

  expect(wrapper.find('.username').text()).toBe('John')
})

// Sometimes you need multiple flushPromises for chained async operations
test('processes data after fetch', async () => {
  const wrapper = mount(DataProcessor)

  await flushPromises()  // Wait for fetch
  await flushPromises()  // Wait for processing triggered by fetch

  expect(wrapper.find('.processed').exists()).toBe(true)
})
```

## 常见模式：组合方法
```javascript
test('submits form and shows success', async () => {
  const wrapper = mount(ContactForm)

  // Fill form (awaiting each interaction)
  await wrapper.find('#name').setValue('John')
  await wrapper.find('#email').setValue('john@example.com')

  // Submit form
  await wrapper.find('form').trigger('submit')

  // Wait for API submission to complete
  await flushPromises()

  // Assert success state
  expect(wrapper.find('.success-message').exists()).toBe(true)
})
```

## 使用 MSW 或模拟 API 进行测试
```javascript
import { flushPromises } from '@vue/test-utils'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'John' }))
  })
)

test('displays user data', async () => {
  const wrapper = mount(UserCard)

  // MSW might require multiple flushPromises
  await flushPromises()
  await flushPromises()

  expect(wrapper.find('.name').text()).toBe('John')
})
```

## 参考
- [Vue 测试工具 - 异步行为](https://test-utils.vuejs.org/guide/advanced/async-suspense)
- [Vue.js 测试指南](https://vuejs.org/guide/scaling-up/testing)
