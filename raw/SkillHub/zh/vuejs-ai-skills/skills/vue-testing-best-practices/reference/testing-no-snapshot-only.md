---
title: 避免仅快照测试 - 它们不能证明正确性
impact: MEDIUM
impactDescription: Snapshot tests verify structure but not functionality, leading to false confidence and brittle tests
type: best-practice
tags: [vue3, testing, snapshot, vitest, vue-test-utils, anti-pattern]
---

# 避免仅快照测试 - 它们不能证明正确性

**影响：中度** - 快照测试仅验证 HTML 结构是否未更改 - 它们不会验证组件是否正常工作。完全依赖快照会导致错误的信心和测试，即使保留了功能，也会破坏任何重构。

谨慎使用快照进行回归检测。更喜欢测试组件功能的行为断言。

## 任务清单

- [ ] 不要使用快照作为组件行为的唯一断言
- [ ] 使用快照对稳定的 UI 组件进行回归检测
- [ ] 始终将快照与行为断言配对
- [ ] 保持快照小而集中（避免完整组件快照）
- [ ] 仔细查看快照差异 - 不要盲目更新
- [ ] 考虑小型关键结构的内联快照

**错误：**
```javascript
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

// BAD: Snapshot-only test proves nothing about functionality
test('UserCard renders correctly', () => {
  const wrapper = mount(UserCard, {
    props: { user: { name: 'John', email: 'john@example.com' } }
  })

  expect(wrapper.html()).toMatchSnapshot()
})

// This test passes even if:
// - The email isn't clickable
// - The avatar doesn't load
// - User actions are completely broken
// - Accessibility is broken
```

**正确：**
```javascript
import { mount } from '@vue/test-utils'
import UserCard from './UserCard.vue'

// CORRECT: Test actual behavior
test('UserCard displays user information', () => {
  const wrapper = mount(UserCard, {
    props: { user: { name: 'John', email: 'john@example.com' } }
  })

  expect(wrapper.find('[data-testid="user-name"]').text()).toBe('John')
  expect(wrapper.find('[data-testid="user-email"]').text()).toBe('john@example.com')
})

test('UserCard email link is clickable', async () => {
  const wrapper = mount(UserCard, {
    props: { user: { name: 'John', email: 'john@example.com' } }
  })

  const emailLink = wrapper.find('a[href^="mailto:"]')
  expect(emailLink.exists()).toBe(true)
  expect(emailLink.attributes('href')).toBe('mailto:john@example.com')
})

test('UserCard emits select event when clicked', async () => {
  const wrapper = mount(UserCard, {
    props: { user: { id: 1, name: 'John' } }
  })

  await wrapper.trigger('click')

  expect(wrapper.emitted('select')).toBeTruthy()
  expect(wrapper.emitted('select')[0]).toEqual([{ id: 1, name: 'John' }])
})
```

## 快照何时有用

### 稳定组件的回归检测
```javascript
// ACCEPTABLE: Snapshot as additional check, not the only check
test('ErrorBoundary renders error message', () => {
  const wrapper = mount(ErrorBoundary, {
    props: { error: new Error('Something went wrong') }
  })

  // Primary assertions - verify behavior
  expect(wrapper.find('.error-title').text()).toBe('Error')
  expect(wrapper.find('.error-message').text()).toContain('Something went wrong')

  // Secondary snapshot - catches unexpected structural changes
  expect(wrapper.find('.error-container').html()).toMatchSnapshot()
})
```

### 小型结构的内联快照
```javascript
// ACCEPTABLE: Inline snapshot for small, critical structure
test('generates correct list markup', () => {
  const wrapper = mount(ListItem, { props: { item: 'Test' } })

  expect(wrapper.html()).toMatchInlineSnapshot(`
    "<li class="list-item">Test</li>"
  `)
})
```

### 复杂的 SVG 或图标输出
```javascript
// ACCEPTABLE: Snapshot for complex generated content
test('renders correct chart SVG', () => {
  const wrapper = mount(PieChart, {
    props: { data: [30, 40, 30] }
  })

  // Verify key behavior
  expect(wrapper.findAll('path').length).toBe(3)

  // Snapshot for full SVG structure
  expect(wrapper.find('svg').html()).toMatchSnapshot()
})
```

## 快照的更好替代方案

### 测试特定元素
```javascript
// Instead of snapshotting entire component
test('renders product with all required fields', () => {
  const wrapper = mount(ProductCard, {
    props: { product: { name: 'Widget', price: 9.99, inStock: true } }
  })

  expect(wrapper.find('.product-name').text()).toBe('Widget')
  expect(wrapper.find('.product-price').text()).toContain('9.99')
  expect(wrapper.find('.in-stock-badge').exists()).toBe(true)
})
```

### 测试 CSS 类的样式
```javascript
test('applies danger styling for errors', () => {
  const wrapper = mount(Alert, {
    props: { type: 'error', message: 'Failed!' }
  })

  expect(wrapper.classes()).toContain('alert-danger')
  expect(wrapper.find('.alert-icon').classes()).toContain('icon-error')
})
```

### 使用测试库查询
```javascript
import { render, screen } from '@testing-library/vue'

test('form has accessible labels', () => {
  render(LoginForm)

  // Testing Library queries verify accessibility
  expect(screen.getByLabelText('Email')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
})
```

## 快照反模式

```javascript
// ANTI-PATTERN: Giant component snapshot
test('page renders', () => {
  const wrapper = mount(EntirePageComponent)
  expect(wrapper.html()).toMatchSnapshot()  // 500+ lines of HTML
})

// ANTI-PATTERN: Snapshot with dynamic content
test('shows current date', () => {
  const wrapper = mount(DateDisplay)
  expect(wrapper.html()).toMatchSnapshot()  // Fails every day!
})

// ANTI-PATTERN: Snapshot after every test
test('button works', async () => {
  const wrapper = mount(Counter)
  await wrapper.find('button').trigger('click')
  expect(wrapper.html()).toMatchSnapshot()  // Redundant
})
```

## 参考
- [Vue.js 测试指南 - 不应该测试什么](https://vuejs.org/guide/scaling-up/testing)
- [有效快照测试](https://kentcdodds.com/blog/effective-snapshot-testing)
- [Vitest快照测试](https://vitest.dev/guide/snapshot.html)
