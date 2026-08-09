---
title: 在Vite中使用import.meta.glob进行动态组件注册
impact: MEDIUM
impactDescription: require.context from Webpack doesn't work in Vite projects
type: gotcha
tags: [vue3, component-registration, vite, dynamic-import, migration, webpack]
---

# 在Vite中使用import.meta.glob进行动态组件注册

**影响：中度** - 从 Webpack 迁移到 Vite 或启动新的 Vite 项目时，用于动态注册组件的 `require.context` 模式将不起作用。 Vite使用`import.meta.glob`代替。使用错误的方法将导致构建错误或运行时失败。

## 任务清单

- [ ] 将 Vite 项目中的 `require.context` 替换为 `import.meta.glob`
- [ ] 从 Vue CLI 迁移到 Vite 时更新组件注册模式
- [ ] 需要时使用`{ eager: true }`进行同步加载
- [ ] 使用 `defineAsyncComponent` 适当处理异步组件

**不正确（Webpack 模式 - 在 Vite 中不起作用）：**
```javascript
// main.js - WRONG for Vite
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// This Webpack-specific API doesn't exist in Vite
const requireComponent = require.context(
  './components/base',
  false,
  /Base[A-Z]\w+\.vue$/
)

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName)
  const componentName = fileName
    .split('/')
    .pop()
    .replace(/\.\w+$/, '')

  app.component(componentName, componentConfig.default || componentConfig)
})

app.mount('#app')
```

**正确（Vite模式）：**
```javascript
// main.js - Correct for Vite
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Vite's glob import - eager loading for synchronous registration
const modules = import.meta.glob('./components/base/Base*.vue', { eager: true })

for (const path in modules) {
  // Extract component name from path: './components/base/BaseButton.vue' -> 'BaseButton'
  const componentName = path.split('/').pop().replace('.vue', '')
  app.component(componentName, modules[path].default)
}

app.mount('#app')
```

## 使用异步组件进行延迟加载

```javascript
// main.js - Lazy loading variant
import { createApp, defineAsyncComponent } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Without { eager: true }, returns functions that return Promises
const modules = import.meta.glob('./components/base/Base*.vue')

for (const path in modules) {
  const componentName = path.split('/').pop().replace('.vue', '')
  // Wrap in defineAsyncComponent for lazy loading
  app.component(componentName, defineAsyncComponent(modules[path]))
}

app.mount('#app')
```

## 全局模式示例

```javascript
// All .vue files in a directory (not recursive)
import.meta.glob('./components/*.vue', { eager: true })

// All .vue files recursively
import.meta.glob('./components/**/*.vue', { eager: true })

// Specific naming pattern
import.meta.glob('./components/Base*.vue', { eager: true })

// Multiple patterns
import.meta.glob([
  './components/Base*.vue',
  './components/App*.vue'
], { eager: true })

// Exclude patterns
import.meta.glob('./components/**/*.vue', {
  eager: true,
  ignore: ['**/*.test.vue', '**/*.spec.vue']
})
```

## TypeScript 支持

```typescript
// main.ts - with proper typing
import { createApp, Component } from 'vue'
import App from './App.vue'

const app = createApp(App)

const modules = import.meta.glob<{ default: Component }>(
  './components/base/Base*.vue',
  { eager: true }
)

for (const path in modules) {
  const componentName = path.split('/').pop()!.replace('.vue', '')
  app.component(componentName, modules[path].default)
}

app.mount('#app')
```

## 迁移清单（Webpack 到 Vite）

|网页包 |维特 |
|---------|------|
| `require.context(dir, recursive, regex)` | `import.meta.glob(pattern, options)` |
|默认同步 |使用 `{ eager: true }` 进行同步 |
| `.keys()` 返回数组 |返回以路径为键的对象 |
|直接返回模块 |通过 `.default` 访问 ES 模块 |

## 参考
- [Vite - 全球导入](https://vitejs.dev/guide/features.html#glob-import)
- [Vue.js组件注册](https://vuejs.org/guide/components/registration.html)
