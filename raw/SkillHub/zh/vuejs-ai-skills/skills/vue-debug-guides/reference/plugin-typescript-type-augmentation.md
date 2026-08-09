# 插件的正确 TypeScript 类型增强

## 规则

创建添加全局属性的 Vue 插件时，必须正确增强 TypeScript 类型。扩充文件必须包含至少一个顶级 `import` 或 `export` 语句才能被视为模块。

## 为什么这很重要

1. **如果没有模块语法，类型将被覆盖**：如果您的扩充文件不是模块，它将覆盖 Vue 的类型而不是扩充它们，从而破坏整个应用程序的类型检查。

2. **类型安全**：适当的增强可以对插件提供的属性进行自动完成和类型检查。

3. **IDE 支持**：开发者获得针对 `this.$translate` 等全局属性的正确 IntelliSense。

4. **错误预防**：在编译时而不是运行时捕获拼写错误和不正确的用法。

## 关键规则：需要模块语法

```typescript
// BAD - This OVERWRITES Vue types instead of augmenting!
// types/vue.d.ts
declare module 'vue' {
  interface ComponentCustomProperties {
    $translate: (key: string) => string
  }
}

// GOOD - The export {} makes this a module, so it AUGMENTS types
// types/vue.d.ts
export {}  // This line is CRITICAL!

declare module 'vue' {
  interface ComponentCustomProperties {
    $translate: (key: string) => string
  }
}
```

## 完整的插件类型增强示例

```typescript
// plugins/i18n.ts
import type { App, InjectionKey } from 'vue'

export interface I18nOptions {
  locale: string
  messages: Record<string, Record<string, string>>
}

export interface I18nInstance {
  translate: (key: string) => string
  locale: string
}

export const i18nInjectionKey: InjectionKey<I18nInstance> = Symbol('i18n')

export function createI18n(options: I18nOptions) {
  const i18n: I18nInstance = {
    translate(key: string) {
      return options.messages[options.locale]?.[key] ?? key
    },
    locale: options.locale
  }

  return {
    install(app: App) {
      // For Composition API
      app.provide(i18nInjectionKey, i18n)

      // For Options API / templates
      app.config.globalProperties.$t = i18n.translate
      app.config.globalProperties.$i18n = i18n
    }
  }
}

// types/i18n.d.ts (or in the same file after export)
export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: (key: string) => string
    $i18n: I18nInstance
  }
}
```

## 替代方案：增强@vue/runtime-core

一些插件增强了 `@vue/runtime-core` 而不是 `vue`：

```typescript
// types/global.d.ts
export {}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $myPlugin: MyPluginInstance
  }
}
```

两种方法都有效，但 `'vue'` 在应用程序代码中更常见。

## 确保 tsconfig.json 包含声明文件

```json
{
  "compilerOptions": {
    // ...
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.vue",
    "types/**/*.d.ts"  // Include your declaration files
  ]
}
```

## 对于库作者：package.json 类型字段

如果将插件发布为包：

```json
{
  "name": "my-vue-plugin",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.mjs"
    }
  }
}
```

## 常见错误及解决方案

### 错误：类型上不存在属性“$xyz”

1. 检查您的 `.d.ts` 文件是否有 `export {}` 或导入语句
2.验证该文件是否包含在`tsconfig.json`中
3. 重新启动 TypeScript 语言服务器（VS Code：Cmd+Shift+P >“重新启动 TS Server”）

### 错误：类型在某些组件中有效，但在其他组件中无效

当使用 Vetur 而不是 Volar 时，经常会发生这种情况。如果您使用的是 Vue 3，请切换到 Volar（Vue - 官方扩展）。

### 选项 API 中出现错误，但组合 API 中没有错误

`this` 上的全局属性需要适当增强 `ComponentCustomProperties`。组合 API 使用单独键入的 `inject()`。

## 参考文献

- [带有选项 API 的 Vue.js TypeScript](https://vuejs.org/guide/typescript/options-api.html)
- [TypeScript 模块增强](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
- [Vue.js 插件文档](https://vuejs.org/guide/reusability/plugins.html)
