---
name: vue-testing-best-practices
version: 1.0.0
license: MIT
author: github.com/vuejs-ai
description: 用于 Vue.js 测试。涵盖 Vitest、Vue Test Utils、组件测试、模拟、测试模式和用于 E2E 测试的 Playwright。
---

Vue.js 测试最佳实践、模式和常见问题。

### 测试
- 为 Vue 3 项目设置测试基础设施 → 请参阅 [testing-vitest-recommended-for-vue](reference/testing-vitest-recommended-for-vue.md)
- 重构组件内部时测试不断中断 → 请参阅 [testing-component-blackbox-approach](reference/testing-component-blackbox-approach.md)
- 测试因竞争条件而间歇性失败 → 请参阅 [testing-async-await-flushpromises](reference/testing-async-await-flushpromises.md)
- 使用生命周期挂钩或注入的可组合函数无法测试 → 请参阅 [testing-composables-helper-wrapper](reference/testing-composables-helper-wrapper.md)
- 在测试中出现“未找到注入符号（pinia）”错误 → 请参阅 [testing-pinia-store-setup](reference/testing-pinia-store-setup.md)
- 具有异步设置的组件不会在测试中呈现 → 请参阅 [testing-suspense-async-components](reference/testing-suspense-async-components.md)
- 尽管功能损坏，快照测试仍然通过 → 请参阅 [testing-no-snapshot-only](reference/testing-no-snapshot-only.md)
- 为 Vue 应用程序选择端到端测试框架 → 请参阅 [testing-e2e-playwright-recommended](reference/testing-e2e-playwright-recommended.md)
- 测试需要验证计算样式或真实 DOM 事件 → 请参阅 [testing-browser-vs-node-runners](reference/testing-browser-vs-node-runners.md)
- 测试使用defineAsyncComponent创建的组件失败→请参阅[async-component-testing](reference/async-component-testing.md)
- 在包装器查询中找不到Teleport的模态内容 → 请参阅 [teleport-testing-complexity](reference/teleport-testing-complexity.md)

## 参考

- [Vue.js 测试指南](https://vuejs.org/guide/scaling-up/testing)
- [Vue 测试工具](https://test-utils.vuejs.org/)
- [维测试文档](https://vitest.dev/)
- [编剧文档](https://playwright.dev/)
