# 在安装应用程序之前安装插件

## 规则

在调用 `app.mount()` 之前，必须使用 `app.use()` 安装所有插件。安装应用程序后安装插件可能会导致响应式问题、缺少依赖项和意外行为。

## 为什么这很重要

1. **隐藏依赖项**：组件可能会在其依赖的插件可用之前渲染，从而导致运行时错误。

2. **响应式问题**：后期插件安装可能会导致微妙的响应式问题，其中提供的值无法正确反应。

3. **初始化顺序**：许多插件（如 vue-router、pinia）需要在任何组件渲染之前设置状态。

4. **生态系统复杂性**：挂载后添加插件可能会导致Vue内部生态系统和SSR场景中的水合作用出现问题。

## 不好的做法

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import i18nPlugin from './plugins/i18n'

const app = createApp(App)

// Mounting first - plugins not yet available!
app.mount('#app')

// Installing after mount - TOO LATE!
app.use(router)
app.use(i18nPlugin, { locale: 'en' })
```

## 良好实践

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import i18nPlugin from './plugins/i18n'

const app = createApp(App)

// Install all plugins BEFORE mounting
app.use(createPinia())
app.use(router)
app.use(i18nPlugin, { locale: 'en' })

// Mount LAST
app.mount('#app')
```

## 插件安装顺序

当插件相互依赖时，`app.use()` 调用的顺序可能很重要：

```typescript
const app = createApp(App)

// 1. State management first (other plugins might need it)
app.use(createPinia())

// 2. Router (may depend on state)
app.use(router)

// 3. Other plugins (may depend on router or state)
app.use(authPlugin)
app.use(i18nPlugin, { locale: 'en' })

// 4. Mount last
app.mount('#app')
```

## 异步插件安装

如果需要在挂载前执行异步操作：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { loadPlugins } from './plugins'

async function bootstrap() {
  const app = createApp(App)

  // Await async plugin setup
  const i18nPlugin = await loadI18nMessages()

  // Install all plugins
  app.use(i18nPlugin)

  // Mount after everything is ready
  app.mount('#app')
}

bootstrap()
```

## 重复安装保护

Vue 的 `app.use()` 自动防止重复安装插件：

```typescript
app.use(myPlugin)
app.use(myPlugin) // This second call is ignored - no double installation

// This is handled internally by Vue, providing a safety net
```

## 插件安装后期的常见症状

- `inject()` 意外返回 `undefined`
- 路由器导航守卫不触发
- 存储状态不响应
- 有关未定义全局属性的模板错误
- SSR 中的水合作用不匹配

## 参考文献

- [Vue.js 插件文档](https://vuejs.org/guide/reusability/plugins.html)
- [Vue.js 应用程序 API](https://vuejs.org/api/application.html)
- [Vue 3 迁移指南-全局API](https://v3-migration.vuejs.org/breaking-changes/global-api.html)
