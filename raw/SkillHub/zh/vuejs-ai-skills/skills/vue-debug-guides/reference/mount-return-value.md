---
title: mount() 返回组件实例，而不是应用程序实例
impact: MEDIUM
impactDescription: Using mount() return value for app configuration silently fails
type: capability
tags: [vue3, createApp, mount, api]
---

# mount() 返回组件实例，而不是应用程序实例

**影响：中度** - `.mount()` 方法返回根组件实例，而不是应用程序实例。尝试在 mount() 之后链接应用程序配置方法将失败或产生意外行为。

这是一个微妙的 API 细节，它吸引了那些假设 mount() 返回应用程序以继续链接的开发者。

## 任务清单

- [ ] 切勿在 mount() 之后链接应用程序配置方法
- [ ] 如果您需要两个实例，请将它们分开存储
- [ ] 使用组件实例来访问根组件状态或方法
- [ ] 使用应用程序实例进行配置、插件和全局注册

**错误：**
```javascript
import { createApp } from 'vue'
import App from './App.vue'

// WRONG: Assuming mount returns app instance
const app = createApp(App).mount('#app')

// This fails! app is actually the root component instance
app.use(router)  // TypeError: app.use is not a function
app.config.errorHandler = fn  // app.config is undefined
```

```javascript
// WRONG: Trying to save both in one line
const { app, component } = createApp(App).mount('#app')  // Doesn't work this way
```

**正确：**
```javascript
import { createApp } from 'vue'
import App from './App.vue'

// Store app instance separately
const app = createApp(App)

// Configure the app
app.use(router)
app.config.errorHandler = (err) => console.error(err)

// Store component instance if needed
const rootComponent = app.mount('#app')

// Now you have access to both:
// - app: the application instance (for config, plugins)
// - rootComponent: the root component instance (for state, methods)
```

```javascript
// If you only need the app configured and mounted (most common case):
createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')  // Return value (component instance) discarded - that's fine
```

## 当您需要根组件实例时

```javascript
const app = createApp(App)
const vm = app.mount('#app')

// Access root component's exposed state/methods
console.log(vm.someExposedProperty)
vm.someExposedMethod()

// In Vue 3 with <script setup>, use defineExpose to expose:
// <script setup>
// import { ref } from 'vue'
// const count = ref(0)
// defineExpose({ count })
// </script>
```

## 参考
- [Vue.js - 安装应用程序](https://vuejs.org/guide/essentials/application.html#mounting-the-app)
- [Vue.js 应用程序 API - mount()](https://vuejs.org/api/application.html#app-mount)
