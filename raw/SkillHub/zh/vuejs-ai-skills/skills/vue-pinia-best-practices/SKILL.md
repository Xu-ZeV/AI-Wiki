---
name: vue-pinia-best-practices
description: “Pinia store、状态管理模式、store 设置以及store 的响应式。”
version: 1.0.0
license: MIT
author: github.com/vuejs-ai
---

Pinia 最佳实践、常见问题和状态管理模式。

### store 设置
- 启动时出现“getActivePinia was called”错误 → 请参阅 [pinia-no-active-pinia-error](reference/pinia-no-active-pinia-error.md)
- 安装程序将缺失的状态存储在 DevTools 或 SSR 中 → 请参阅 [pinia-setup-store-return-all-state](reference/pinia-setup-store-return-all-state.md)

### 响应式
- store解构停止响应式更新 UI → 请参阅 [pinia-store-destructuring-breaks-reactivity](reference/pinia-store-destructuring-breaks-reactivity.md)
- 存储方法在模板调用中丢失上下文 → 请参阅 [store-method-binding-parentheses](reference/store-method-binding-parentheses.md)

### 状态模式
- 过滤器在刷新时重置或无法共享 → 请参阅 [state-url-for-ephemeral-filters](reference/state-url-for-ephemeral-filters.md)
- 在没有 DevTools 或约定的情况下构建生产应用程序 → 请参阅 [state-use-pinia-for-large-apps](reference/state-use-pinia-for-large-apps.md)
