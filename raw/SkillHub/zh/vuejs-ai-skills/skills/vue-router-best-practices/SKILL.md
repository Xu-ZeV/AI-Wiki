---
name: vue-router-best-practices
description: “Vue Router 4 模式、导航守卫、路由参数和路由组件生命周期交互。”
version: 1.0.0
license: MIT
author: github.com/vuejs-ai
---

Vue Router 最佳实践、常见问题和导航模式。

### 导航守卫
- 使用不同参数在同一路线之间导航 → 请参阅 [router-beforeenter-no-param-trigger](reference/router-beforeenter-no-param-trigger.md)
- 在beforeRouteEnter守卫中访问组件实例→参见[router-beforerouteenter-no-this](reference/router-beforerouteenter-no-this.md)
- 导航守卫无需等待即可调用 API → 请参阅 [router-guard-async-await-pattern](reference/router-guard-async-await-pattern.md)
- 用户陷入无限重定向循环 → 请参阅 [router-navigation-guard-infinite-loop](reference/router-navigation-guard-infinite-loop.md)
- 使用已弃用的 next() 函数进行导航防护 → 请参阅 [router-navigation-guard-next-deprecated](reference/router-navigation-guard-next-deprecated.md)

### 路由生命周期
- 在同一路线之间导航时数据过时 → 请参阅 [router-param-change-no-lifecycle](reference/router-param-change-no-lifecycle.md)
- 组件卸载后事件侦听器仍然存在 → 请参阅 [router-simple-routing-cleanup](reference/router-simple-routing-cleanup.md)

### 设置
- 构建生产单页应用 → 参见 [router-use-vue-router-for-product](reference/router-use-vue-router-for-production.md)
