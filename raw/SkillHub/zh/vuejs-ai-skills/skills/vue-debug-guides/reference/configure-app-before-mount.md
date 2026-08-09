---
title: 在调用 mount() 之前配置 Vue 应用程序
impact: HIGH
impactDescription: App configurations after mount() are silently ignored, causing missing plugins and handlers
type: capability
tags: [vue3, createApp, mount, configuration, setup]
---

# 在调用 mount() 之前配置 Vue 应用程序

**影响：高** - 调用 `.mount()` 后应用的任何应用配置都会被静默忽略。这包括错误处理程序、全局组件、指令和插件，导致神秘的功能缺失。

在完成所有应用程序配置和资产注册后，应始终调用 `.mount()` 方法。这是一个关键的订购要求，如果违反，不会产生错误，但会导致功能默默地失败。

## 任务清单

- [ ] 在 mount() 之前注册所有插件（路由器、store等）
- [ ] 在 mount() 之前配置错误处理程序
- [ ] 在 mount() 之前注册全局组件和指令
- [ ] 在 mount() 之前设置所有 `app.config` 属性
- [ ] 调用 `.mount()` 作为应用程序初始化的最后一步

**错误：**
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// WRONG: Mounting first, then configuring
app.mount('#app')

// These are silently IGNORED - app is already mounted!
app.use(router)
app.config.errorHandler = (err) => {
  console.error('Global error:', err)
}
app.component('GlobalButton', GlobalButton)
```

**正确：**
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import GlobalButton from './components/GlobalButton.vue'

const app = createApp(App)

// Configure everything FIRST
app.use(router)
app.use(createPinia())

// Set up error handling
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.log('Component:', instance)
  console.log('Error info:', info)
}

// Register global components
app.component('GlobalButton', GlobalButton)

// Mount LAST - after all configuration is complete
app.mount('#app')
```

## 常见错误：与 Mount 链接

```javascript
// WRONG: Chaining mount in the middle of configuration
createApp(App)
  .use(router)
  .mount('#app')  // Everything after this line is a problem
  .use(pinia)     // This doesn't even work - mount returns component instance!

// CORRECT: Either complete chain before mount, or use intermediate variable
createApp(App)
  .use(router)
  .use(pinia)
  .component('GlobalButton', GlobalButton)
  .mount('#app')  // Mount at the very end
```

## 参考
- [Vue.js - 创建 Vue 应用程序](https://vuejs.org/guide/essentials/application.html)
- [Vue.js 应用程序 API](https://vuejs.org/api/application.html)
