---
title: 使用 Playwright 进行 E2E 测试 - 跨浏览器支持和更好的 DX
impact: MEDIUM
impactDescription: Cypress has browser limitations and some features require paid subscriptions
type: best-practice
tags: [vue3, testing, e2e, playwright, cypress, end-to-end]
---

# 使用 Playwright 进行 E2E 测试 - 跨浏览器支持和更好的 DX

**影响：中** - Playwright 提供卓越的跨浏览器测试（Chromium、WebKit、Firefox）、出色的调试工具，并且完全开源。 Cypress 对 WebKit 支持有限制，并且需要付费订阅某些功能。

使用 Playwright 进行新的 E2E 测试设置。如果团队已经具备专业知识或其可视化调试 UI，请考虑赛普拉斯。

## 任务清单

- [ ] 使用适合您目标平台的浏览器安装 Playwright
- [ ] 配置 Vue 开发服务器集成
- [ ] 为不同浏览器设置项目
- [ ] 使用与组件测试模式匹配的定位器策略
- [ ] 配置 CI 以进行并行测试执行
- [ ] 使用跟踪和屏幕截图功能进行调试

## 快速设置

```bash
# Install Playwright
npm init playwright@latest

# This will create:
# - playwright.config.ts
# - tests/ directory
# - tests-examples/ directory
```

**playwright.config.ts：**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // Base URL for navigation
    baseURL: 'http://localhost:5173',
    // Capture trace on first retry
    trace: 'on-first-retry',
    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

## E2E测试示例

```typescript
// e2e/user-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Authentication', () => {
  test('user can log in and see dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/login')

    // Fill login form
    await page.getByLabel('Email').fill('user@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: 'Sign In' }).click()

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()

    await expect(page.getByRole('alert')).toContainText('Invalid credentials')
    await expect(page).toHaveURL('/login')
  })
})
```

## Playwright 与 Cypress 比较

|特色|剧作家 |柏树 |
|---------|------------|---------|
|浏览器 | Chromium、Firefox、WebKit | Chromium、Firefox、Electron（WebKit 实验）|
|跨浏览器 |全力支持 |有限公司|
|并行化 |内置|需要赛普拉斯云 |
|开源 |完全 |仅核心 |
|移动测试 |设备仿真 |有限公司|
|调试|检查员、跟踪查看器 |时间旅行UI |
| API测试|内置|需要插件 |
| iframe |全力支持 |有限公司|

## 使用 Data-Testid 测试 Vue 组件

```typescript
// e2e/product-list.spec.ts
import { test, expect } from '@playwright/test'

test('user can add product to cart', async ({ page }) => {
  await page.goto('/products')

  // Use data-testid for reliable selectors
  await page.getByTestId('product-card').first().click()

  // Verify product detail page
  await expect(page.getByTestId('product-title')).toBeVisible()

  // Add to cart
  await page.getByTestId('add-to-cart-button').click()

  // Verify cart updated
  await expect(page.getByTestId('cart-count')).toHaveText('1')
})
```

## Vue 应用程序的页面对象模式

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign In' })
    this.errorMessage = page.getByRole('alert')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')

  await expect(page).toHaveURL('/dashboard')
})
```

## 视觉回归测试

```typescript
test('homepage visual regression', async ({ page }) => {
  await page.goto('/')

  // Full page screenshot comparison
  await expect(page).toHaveScreenshot('homepage.png')

  // Element-specific screenshot
  await expect(page.getByTestId('hero-section')).toHaveScreenshot('hero.png')
})
```

## 运行测试

```bash
# Run all tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific file
npx playwright test e2e/auth.spec.ts

# Run in specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# Generate test from actions
npx playwright codegen localhost:5173
```

## 参考
- [编剧文档](https://playwright.dev/)
- [Vue.js E2E测试建议](https://vuejs.org/guide/scaling-up/testing#e2e-testing)
- [编剧最佳实践](https://playwright.dev/docs/best-practices)
