---
title: 选择基于浏览器的运行器进行样式和 DOM 事件测试
impact: MEDIUM
impactDescription: Node-based runners cannot test real CSS behavior, native DOM events, cookies, or computed styles
type: capability
tags: [vue3, testing, component-testing, vitest, browser, jsdom]
---

# 选择基于浏览器的运行器进行样式和 DOM 事件测试

**影响：中** - 基于节点的测试运行程序（带有 jsdom/happy-dom 的 Vitest）模拟 DOM，但无法测试真实的 CSS 渲染、本机浏览器事件、cookie、计算样式或跨浏览器行为。当这些很重要时，请使用基于浏览器的运行程序。

使用 Vitest 进行大多数组件测试（快速），但在测试视觉/依赖于 DOM 的功能时使用 Vitest 浏览器模式。

## 任务清单

- [ ] 使用 Vitest（节点）进行以逻辑为中心的组件测试
- [ ] 使用 Vitest 浏览器模式进行样式相关测试
- [ ] 使用 Vitest 浏览器模式进行本机事件（聚焦、拖动、调整大小）
- [ ] 对 cookie 和计算的 CSS 样式使用 Vitest 浏览器模式
- [ ] 接受较慢的速度以换取浏览器的准确性

## 何时使用每种方法

### 基于节点的运行器（Vitest + happy-dom/jsdom）
最适合：
- 纯逻辑测试
- 状态管理
- 事件emits
- props/插槽行为
- 大多数组件交互
- 快速 CI/CD 管道

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'happy-dom',  // or 'jsdom'
  }
})
```

```javascript
// Fast but limited - fine for most tests
test('button emits click event', async () => {
  const wrapper = mount(Button)
  await wrapper.trigger('click')
  expect(wrapper.emitted('click')).toBeTruthy()
})
```

### Vitest浏览器模式
需要：
- CSS 计算样式验证
- CSS 过渡/动画
- 真实对焦/模糊行为
- 拖放
- Cookie 操作
- 视口相关的行为
- 跨浏览器验证

## Vitest 浏览器模式设置

```bash
npm install -D @vitest/browser playwright
```

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
    },
  },
})
```

```javascript
// Button.browser.test.js
import { render } from 'vitest-browser-vue'
import Button from './Button.vue'

test('has correct hover styling', async () => {
  const { getByRole } = render(Button, { props: { label: 'Click me' } })

  const button = getByRole('button')

  // Check initial style
  await expect.element(button).toHaveStyle({
    backgroundColor: 'rgb(59, 130, 246)'  // blue
  })
})

test('maintains focus after click', async () => {
  const { getByRole } = render(Button)

  const button = getByRole('button')
  await button.click()

  await expect.element(button).toHaveFocus()
})
```

## 示例：每个跑步者可以/不能测试什么

### 样式 - 需要浏览器
```javascript
// Node runner: CANNOT verify actual CSS
test('danger button has red background', () => {
  const wrapper = mount(Button, { props: { variant: 'danger' } })
  // This only checks class exists, not actual color
  expect(wrapper.classes()).toContain('bg-red-500')
})

// Vitest Browser Mode: CAN verify computed styles
test('danger button renders red', async () => {
  const { getByRole } = render(Button, { props: { variant: 'danger' } })
  await expect.element(getByRole('button')).toHaveStyle({
    backgroundColor: 'rgb(239, 68, 68)'
  })
})
```

### 计算 CSS 样式 - 需要浏览器
```javascript
// Node runner: CANNOT get real computed styles
test('button has correct padding', () => {
  const wrapper = mount(Button)
  // getComputedStyle returns empty/default values in jsdom
  const style = window.getComputedStyle(wrapper.element)
  // style.padding will be empty string, not actual computed value
})

// Vitest Browser Mode: Real computed styles
test('button has correct padding', async () => {
  const { getByRole } = render(Button)
  const button = getByRole('button')

  await expect.element(button).toHaveStyle({
    padding: '12px 24px'
  })
})
```

### 本机事件 - 需要浏览器
```javascript
// Node runner: Synthetic events only
test('handles drag and drop', async () => {
  const wrapper = mount(DraggableList)
  // trigger('dragstart') is synthetic - may not work as expected
  await wrapper.find('.item').trigger('dragstart')
})

// Vitest Browser Mode: Real native events via userEvent
import { userEvent } from '@vitest/browser/context'

test('reorders items on drag', async () => {
  const { getByTestId } = render(DraggableList)

  const item = getByTestId('item-1')
  const target = getByTestId('item-3')

  await userEvent.dragAndDrop(item, target)

  // Assert reordering
})
```

## 推荐的测试策略

```javascript
// vitest.config.js - Separate test configurations

export default defineConfig({
  test: {
    // Default: Node environment for speed
    environment: 'happy-dom',

    // Browser tests in separate directory
    include: ['src/**/*.test.{js,ts}'],
  },
})

// Run browser tests separately
// npx vitest --browser.enabled
```

### 目录结构
```
tests/
├── unit/              # Fast node-based tests
│   ├── Button.test.js
│   └── useCounter.test.js
├── component/         # Slower browser-based tests
│   ├── Button.browser.test.js
│   └── DragDrop.browser.test.js
└── e2e/               # Full E2E tests (Playwright)
    └── user-flow.spec.ts
```

## 参考
- [Vue.js 测试-组件测试](https://vuejs.org/guide/scaling-up/testing#component-testing)
- [Vitest浏览器模式](https://vitest.dev/guide/browser.html)
