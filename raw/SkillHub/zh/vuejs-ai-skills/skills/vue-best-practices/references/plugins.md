---
title: Vue 插件最佳实践
impact: MEDIUM
impactDescription: Incorrect plugin structure or injection key strategy causes install failures, collisions, and unsafe APIs
type: best-practice
tags: [vue3, plugins, provide-inject, typescript, dependency-injection]
---

# Vue 插件最佳实践

**影响：中** - Vue 插件应遵循 `app.use()` 合同，公开显式功能，并使用碰撞安全注入键。这使得插件设置在大型应用程序中可预测且可组合。

## 任务列表

- 使用 `install()` 将插件导出为对象或作为安装函数
- 使用`install()`中的`app`实例来注册组件/指令/提供
- 使用 `Plugin` 键入插件 API（并在需要时选择元组类型）
- 在插件中对 `provide/inject` 使用符号键（首选 `InjectionKey<T>`）
- 添加一个小型类型的可组合包装器，以便所需的注入快速失败

## `app.use()` 的结构插件

Vue 插件必须是：
- 带有 `install(app, options?)` 的对象
- 具有相同签名的函数

**不好：**
```ts
const notAPlugin = {
  doSomething() {}
}

app.use(notAPlugin)
```

**好：**
```ts
import type { App } from 'vue'

interface PluginOptions {
  prefix?: string
  debug?: boolean
}

const myPlugin = {
  install(app: App, options: PluginOptions = {}) {
    const { prefix = 'my', debug = false } = options

    if (debug) {
      console.log('Installing myPlugin with prefix:', prefix)
    }

    app.provide('myPlugin', { prefix })
  }
}

app.use(myPlugin, { prefix: 'custom', debug: true })
```

**好：**
```ts
import type { App } from 'vue'

function simplePlugin(app: App, options?: { message: string }) {
  app.config.globalProperties.$greet = () => options?.message ?? 'Hello!'
}

app.use(simplePlugin, { message: 'Welcome!' })
```

## 在 `install()` 中显式注册功能

在 `install()` 内部，通过 Vue 应用程序 API 连接行为：
- `app.component()` 适用于全球组件
- `app.directive()` 用于全局指令
- `app.provide()` 用于可注入服务和配置
- `app.config.globalProperties` 用于可选的全局助手（少量）

**不好：**
```ts
const uselessPlugin = {
  install(app, options) {
    const service = createService(options)
  }
}
```

**好：**
```ts
const usefulPlugin = {
  install(app, options) {
    const service = createService(options)
    app.provide(serviceKey, service)
  }
}
```

## 输入插件合约

使用 Vue 的 `Plugin` 类型来保持安装签名和选项类型安全。

```ts
import type { App, Plugin } from 'vue'

interface MyOptions {
  apiKey: string
}

const myPlugin: Plugin<[MyOptions]> = {
  install(app: App, options: MyOptions) {
    app.provide(apiKeyKey, options.apiKey)
  }
}
```

## 在插件中使用符号注入键

字符串键可能会发生冲突（`'http'`、`'config'`、`'i18n'`）。使用带有 `InjectionKey<T>` 的符号键，因此注入是唯一的且可键入的。

**不好：**
```ts
export default {
  install(app) {
    app.provide('http', axios)
    app.provide('config', appConfig)
  }
}
```

**好：**
```ts
import type { InjectionKey } from 'vue'
import type { AxiosInstance } from 'axios'

interface AppConfig {
  apiUrl: string
  timeout: number
}

export const httpKey: InjectionKey<AxiosInstance> = Symbol('http')
export const configKey: InjectionKey<AppConfig> = Symbol('appConfig')

export default {
  install(app) {
    app.provide(httpKey, axios)
    app.provide(configKey, { apiUrl: '/api', timeout: 5000 })
  }
}
```

## 提供所需的注射助手

将所需的注入包装在可组合函数中，从而引发明显的设置错误。

```ts
import { inject } from 'vue'
import { authKey, type AuthService } from '@/injection-keys'

export function useAuth(): AuthService {
  const auth = inject(authKey)
  if (!auth) {
    throw new Error('Auth plugin not installed. Did you forget app.use(authPlugin)?')
  }
  return auth
}
```
