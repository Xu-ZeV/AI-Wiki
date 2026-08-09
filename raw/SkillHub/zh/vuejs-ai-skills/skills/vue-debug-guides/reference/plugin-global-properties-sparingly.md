# 在插件中谨慎使用全局属性

## 规则

在 Vue 插件中使用 `app.config.globalProperties` 时，请谨慎使用并遵守明确的命名约定。过多的全局属性会导致混乱、命名冲突和调试困难。

## 为什么这很重要

1. **隐式依赖关系**：全局属性使组件依赖关系不可见，使代码更难以理解和维护。

2. **命名冲突**：多个插件可能会尝试使用相同的属性名称（例如，`$http`、`$api`），从而导致静默覆盖。

3. **调试困难**：当出现问题时，追踪到哪个插件提供了全局属性是具有挑战性的。

4. **IDE 限制**：如果没有仔细配置，全局属性可能没有适当的自动完成或类型检查。

5. **测试复杂性**：全局状态在单元测试中更难模拟和隔离。

## 不好的做法

```typescript
// Too many global properties from various plugins
app.config.globalProperties.$http = axios
app.config.globalProperties.$api = apiClient
app.config.globalProperties.$auth = authService
app.config.globalProperties.$translate = i18n.translate
app.config.globalProperties.$format = formatters
app.config.globalProperties.$utils = utilities
app.config.globalProperties.$config = appConfig
app.config.globalProperties.$logger = logger

// In component - where did all these come from?
export default {
  mounted() {
    this.$logger.info('Mounted')
    const data = await this.$http.get(this.$config.apiUrl)
    this.$api.process(this.$utils.transform(data))
  }
}
```

## 良好实践

```typescript
// Use provide/inject for most functionality
export default {
  install(app, options) {
    // Provide services via injection
    app.provide('api', apiClient)
    app.provide('auth', authService)
    app.provide('i18n', i18n)

    // Reserve globalProperties for truly global template helpers
    // that are used extensively in templates across the app
    app.config.globalProperties.$t = i18n.translate  // Common convention
  }
}

// In component - explicit dependencies
<script setup>
import { inject } from 'vue'

const api = inject('api')
const auth = inject('auth')
</script>

<template>
  <!-- $t is acceptable for common template-only usage -->
  <h1>{{ $t('welcome') }}</h1>
</template>
```

## 命名约定

如果您确实使用全局属性：

1. **使用`$`前缀**：这是Vue约定，避免与组件数据/方法冲突
2. **为您的库使用唯一的前缀**：例如，第三方插件使用 `$myLib_translate`
3. **记录所有全局属性**：保留每个插件提供的内容的中央注册表

```typescript
// Good: namespaced to avoid conflicts
app.config.globalProperties.$myPlugin = {
  translate: (key) => /* ... */,
  format: (value) => /* ... */
}

// Usage
{{ $myPlugin.translate('key') }}
```

## 审核全局属性

您可以检查所有全局属性以进行调试：

```typescript
console.log(app.config.globalProperties)
```

## 当全局属性可以接受时

1. **仅模板实用程序** 使用非常频繁（例如用于翻译的 `$t`）
2. **从 Vue 2 过渡时的旧版迁移**
3. **需要Options API兼容性的库**（但更喜欢提供注入）

## 参考文献

- [Vue.js 插件文档](https://vuejs.org/guide/reusability/plugins.html)
- [Vue.js 全局属性](https://vuejs.org/api/application.html#app-config-globalproperties)
