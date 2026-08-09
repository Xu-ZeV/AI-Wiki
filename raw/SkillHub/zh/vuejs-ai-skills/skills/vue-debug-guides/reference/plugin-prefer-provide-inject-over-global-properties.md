# 在插件中更喜欢提供/注入而不是全局属性

## 规则

创建 Vue 插件时，更喜欢使用 `app.provide()` 使插件功能可供组件使用，而不是将属性附加到 `app.config.globalProperties`。

## 为什么这很重要

1. **全局属性在 setup() 中不起作用**：附加到 `globalProperties` 的属性只能通过选项 API 中的 `this` 访问。它们在组合 API 的 `setup()` 函数中不可用。

2. **类型安全**：`provide/inject` 与 TypeScript 集成得更好，并且需要更少的类型增强样板。

3. **可测试性**：与全局属性相比，注入的依赖项在测试中更容易模拟。

4. **代码清晰**：显式 `inject()` 调用使依赖关系可见，而全局属性可能显得“神奇”。

5. **范围**：`provide/inject` 遵循 Vue 的组件层次结构，可以更轻松地为应用程序的不同部分提供不同的值。

## 不好的做法

```typescript
// plugins/i18n.ts
export default {
  install(app, options) {
    // Attaching to globalProperties - only works with Options API
    app.config.globalProperties.$translate = (key: string) => {
      return key.split('.').reduce((o, i) => o?.[i], options)
    }
  }
}

// In component - requires type augmentation for TypeScript
// Also DOES NOT work in <script setup>
export default {
  mounted() {
    console.log(this.$translate('greeting.hello'))
  }
}
```

## 良好实践

```typescript
// plugins/i18n.ts
import type { InjectionKey, App } from 'vue'

export interface I18nOptions {
  [key: string]: string | I18nOptions
}

export interface I18n {
  translate: (key: string) => string
  options: I18nOptions
}

export const i18nKey: InjectionKey<I18n> = Symbol('i18n')

export default {
  install(app: App, options: I18nOptions) {
    const translate = (key: string): string => {
      return key.split('.').reduce((o, i) => o?.[i], options) as string ?? key
    }

    // Use provide for Composition API compatibility
    app.provide(i18nKey, { translate, options })
  }
}

// In component - works in setup() and has full type safety
<script setup lang="ts">
import { inject } from 'vue'
import { i18nKey } from '@/plugins/i18n'

const i18n = inject(i18nKey)
console.log(i18n?.translate('greeting.hello'))
</script>
```

## 混合方法

如果您必须支持这两个 API（例如，为了向后兼容），请同时提供：

```typescript
export default {
  install(app: App, options: I18nOptions) {
    const i18n = {
      translate: (key: string) => /* ... */
    }

    // For Composition API
    app.provide(i18nKey, i18n)

    // For Options API (use sparingly)
    app.config.globalProperties.$i18n = i18n
  }
}
```

## TypeScript 类型增强（如果使用 globalProperties）

如果必须使用 globalProperties，则需要适当的类型增强：

```typescript
// types/vue.d.ts
export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $translate: (key: string) => string
  }
}
```

**重要**：文件必须包含 `export {}` 或其他顶级导出/导入。如果没有它，扩充将覆盖类型而不是扩充它们。

## 参考文献

- [Vue.js 插件文档](https://vuejs.org/guide/reusability/plugins.html)
- [Vue.js 提供/注入](https://vuejs.org/guide/components/provide-inject.html)
- [带有选项 API 的 TypeScript](https://vuejs.org/guide/typescript/options-api.html)
