---
title: 使用黑盒方法测试组件 - 关注行为而不是实现
impact: HIGH
impactDescription: Implementation-aware tests become brittle and break during refactoring, leading to high maintenance burden
type: best-practice
tags: [vue3, testing, component-testing, vitest, vue-test-utils, blackbox]
---

# 使用黑盒方法测试组件 - 关注行为而不是实现

**影响：高** - 即使功能保持正确，依赖实现细节（内部状态、私有方法、组件结构）的测试也会在重构期间中断。这会导致假阴性和高昂的测试维护负担。

遵循 Kent C. Dodds 的测试理念：“您的测试越类似于软件的使用方式，它们就越能给您带来信心。”

## 任务清单

- [ ] 测试组件做什么，而不是如何做
- [ ] 通过用户可见属性（文本、角色、testid）查询元素
- [ ] 模拟用户交互（点击、输入）而不是直接调用方法
- [ ] 对渲染输出、发出事件和可见状态更改进行断言
- [ ] 避免访问组件内部状态或私有方法
- [ ] 对没有语义意义的元素使用 data-testid 属性

**错误：**
```javascript
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

// BAD: Testing implementation details
test('counter increments', async () => {
  const wrapper = mount(Counter)

  // Accessing internal state directly
  expect(wrapper.vm.count).toBe(0)

  // Calling internal method instead of simulating user action
  wrapper.vm.increment()

  // Checking internal state instead of visible output
  expect(wrapper.vm.count).toBe(1)
})

// BAD: Testing component structure
test('has increment button', () => {
  const wrapper = mount(Counter)

  // Testing implementation detail - what if button becomes an anchor?
  expect(wrapper.find('button').exists()).toBe(true)
})
```

**正确：**
```javascript
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

// CORRECT: Testing behavior like a user would
test('counter displays updated value after clicking increment', async () => {
  const wrapper = mount(Counter, {
    props: { max: 10 }
  })

  // Assert initial visible state
  expect(wrapper.find('[data-testid="counter-value"]').text()).toContain('0')

  // Simulate user action
  await wrapper.find('[data-testid="increment-button"]').trigger('click')

  // Assert visible result
  expect(wrapper.find('[data-testid="counter-value"]').text()).toContain('1')
})

// CORRECT: Testing emitted events (public API)
test('emits change event with new value when incremented', async () => {
  const wrapper = mount(Counter)

  await wrapper.find('[data-testid="increment-button"]').trigger('click')

  expect(wrapper.emitted('change')).toHaveLength(1)
  expect(wrapper.emitted('change')[0]).toEqual([1])
})
```

## 使用 @testing-library/vue 进行更好的黑盒测试

```javascript
import { render, screen, fireEvent } from '@testing-library/vue'
import Counter from './Counter.vue'

// Testing Library encourages accessible, user-centric queries
test('increments counter on button click', async () => {
  render(Counter)

  // Query by role - how screen readers see it
  const button = screen.getByRole('button', { name: /increment/i })
  const display = screen.getByText('0')

  await fireEvent.click(button)

  expect(screen.getByText('1')).toBeInTheDocument()
})
```

## 测试什么与不测试什么

### DO 测试（公共接口）
```javascript
// Props affect rendered output
test('shows title from props', () => {
  const wrapper = mount(Card, {
    props: { title: 'Hello World' }
  })
  expect(wrapper.text()).toContain('Hello World')
})

// Slots render correctly
test('renders slot content', () => {
  const wrapper = mount(Card, {
    slots: { default: '<p>Slot content</p>' }
  })
  expect(wrapper.text()).toContain('Slot content')
})

// Emitted events
test('emits close event when X clicked', async () => {
  const wrapper = mount(Modal)
  await wrapper.find('[data-testid="close-button"]').trigger('click')
  expect(wrapper.emitted('close')).toBeTruthy()
})
```

### 不要测试（实现细节）
```javascript
// Don't test internal computed properties
// Don't test internal methods
// Don't test component options/setup internals
// Don't test that specific child components are rendered (unless critical)
// Don't rely exclusively on snapshot tests for correctness
```

## 参考
- [Vue.js 测试指南](https://vuejs.org/guide/scaling-up/testing)
- [Vue 测试工具 - 测试哲学](https://test-utils.vuejs.org/guide/)
- [测试库指导原则](https://testing-library.com/docs/guiding-principles)
