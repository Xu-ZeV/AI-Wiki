---
title: 使用 Vitest 进行 Vue 3 测试 - Vue 团队推荐
impact: MEDIUM
impactDescription: Using Jest or other runners with Vite projects requires complex configuration and causes slower test runs
type: best-practice
tags: [vue3, testing, vitest, vite, configuration, setup]
---

# 使用 Vitest 进行 Vue 3 测试 - Vue 团队推荐

**影响：中** - Vitest 由 Vue/Vite 团队成员创建和维护，并与 Vite 共享相同的配置和转换管道。在基于 Vite 的项目中使用 Jest 或其他测试运行程序需要额外的配置，并可能导致测试执行速度变慢和兼容性问题。

将 Vitest 用于新的 Vue 3 项目。仅在迁移现有测试套件时才考虑 Jest。

## 任务清单

- [ ] 安装Vitest及相关包进行Vue测试
- [ ] 在 vite.config.js 或 vitest.config.js 中配置 vitest
- [ ] 设置适当的测试环境（happy-dom 或 jsdom）
- [ ] 将测试脚本添加到package.json
- [ ] 如果需要更清晰的测试语法，请配置全局变量
- [ ] 使用@vue/test-utils进行组件挂载

## 快速设置

```bash
# Install required packages
npm install -D vitest @vue/test-utils happy-dom
# or with jsdom
npm install -D vitest @vue/test-utils jsdom
```

**vite.config.js:**
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // Enable global test APIs (describe, it, expect)
    globals: true,
    // Use happy-dom for faster tests (or 'jsdom' for better compatibility)
    environment: 'happy-dom',
    // Optional: Setup files for global configuration
    setupFiles: ['./src/test/setup.js']
  }
})
```

**包.json：**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

**tsconfig.json（如果使用 TypeScript）：**
```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

## 测试文件示例

```javascript
// src/components/Counter.test.js
import { describe, it, expect, beforeEach } from 'vitest'  // optional with globals: true
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

describe('Counter', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(Counter)
  })

  it('renders initial count', () => {
    expect(wrapper.find('[data-testid="count"]').text()).toBe('0')
  })

  it('increments when button clicked', async () => {
    await wrapper.find('[data-testid="increment"]').trigger('click')
    expect(wrapper.find('[data-testid="count"]').text()).toBe('1')
  })
})
```

## Vitest 与 Jest 比较

|特色|维泰斯特 |开玩笑|
|---------|--------|------|
| Vite集成 |本地 |需要配置 |
|速度|非常快（ESM 原生）|使用 Vite 减慢速度 |
|观看模式 |优秀|好 |
| Vue SFC 支持 |与Vite合作|需要 vue-jest |
|配置共享|与 vite.config 相同 |分开|
|应用程序接口 |兼容玩笑 |标准|

## 与测试库一起使用

```bash
npm install -D @testing-library/vue @testing-library/jest-dom
```

```javascript
// src/test/setup.js
import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)
```

```javascript
// Component.test.js
import { render, screen, fireEvent } from '@testing-library/vue'
import UserCard from './UserCard.vue'

test('displays user name', () => {
  render(UserCard, {
    props: { name: 'John Doe' }
  })

  expect(screen.getByText('John Doe')).toBeInTheDocument()
})
```

## 高级配置

```javascript
// vitest.config.js (separate file if preferred)
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'test']
    },
    // Helpful for debugging
    reporters: ['verbose'],
    // Run tests in sequence in CI
    poolOptions: {
      threads: {
        singleThread: process.env.CI === 'true'
      }
    }
  }
})
```

## 常见模式

### 模拟模块
```javascript
import { vi } from 'vitest'

vi.mock('@/api/users', () => ({
  fetchUser: vi.fn().mockResolvedValue({ name: 'John' })
}))
```

### 使用假定时器进行测试
```javascript
import { vi, beforeEach, afterEach } from 'vitest'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('debounced search', async () => {
  const wrapper = mount(SearchBox)
  await wrapper.find('input').setValue('vue')

  vi.advanceTimersByTime(300)
  await flushPromises()

  expect(wrapper.emitted('search')).toBeTruthy()
})
```

## 参考
- [维测试文档](https://vitest.dev/)
- [Vue.js 测试指南](https://vuejs.org/guide/scaling-up/testing)
- [Vue 测试工具](https://test-utils.vuejs.org/)
