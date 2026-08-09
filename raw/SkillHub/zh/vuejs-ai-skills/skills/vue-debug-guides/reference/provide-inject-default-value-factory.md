---
title: 使用工厂函数进行非基元注入默认值
impact: MEDIUM
impactDescription: Using object literals as default values creates shared references across all consuming components
type: gotcha
tags: [vue3, provide-inject, composition-api, memory, shared-state]
---

# 使用工厂函数进行非基元注入默认值

**影响：中** - 为 `inject()` 提供默认值时，使用对象文字会创建单个共享引用。使用该默认值的所有组件将共享相同的对象，从而导致意外的状态共享和错误。

## 任务清单

- [ ] 始终使用工厂函数作为注入中的对象/数组默认值
- [ ] 传递 `true` 作为第三个参数以在 Composition API 中启用工厂模式
- [ ] 在选项 API 中使用带有工厂函数的对象语法
- [ ] 仅对原始值（字符串、数字、布尔值）使用文字默认值

## 陷阱：共享默认引用

**错误 - 对象文字创建共享引用：**
```vue
<script setup>
import { inject } from 'vue'

// WRONG: All components without a provider share this SAME object
const config = inject('config', { debug: false, apiUrl: '' })

// If one component does this:
config.debug = true

// ALL other components using this default now have debug: true!
</script>
```

**正确 - 工厂函数创建唯一实例：**
```vue
<script setup>
import { inject } from 'vue'

// CORRECT: Each component gets its own object
// Third argument `true` indicates the second arg is a factory function
const config = inject('config', () => ({ debug: false, apiUrl: '' }), true)
</script>
```

## 接口说明

`inject()`函数有多个签名：

```ts
// Simple default value (OK for primitives)
inject(key, defaultValue)

// Factory function for non-primitives (REQUIRED for objects/arrays)
inject(key, factoryFunction, true)
```

第三个参数 `true` 告诉 Vue 第二个参数是工厂函数，而不是默认值本身。

## 示例

### 原始默认值（无需工厂）

```vue
<script setup>
import { inject } from 'vue'

// Primitives are safe without factory
const count = inject('count', 0)
const name = inject('name', 'Guest')
const enabled = inject('enabled', false)
</script>
```

### 对象默认值（工厂必需）

```vue
<script setup>
import { inject } from 'vue'

// Objects MUST use factory
const user = inject('user', () => ({
  id: null,
  name: 'Anonymous',
  preferences: {}
}), true)

const settings = inject('settings', () => ({
  theme: 'light',
  language: 'en',
  notifications: true
}), true)
</script>
```

### 数组默认值（工厂必需）

```vue
<script setup>
import { inject } from 'vue'

// Arrays MUST use factory
const items = inject('items', () => [], true)
const permissions = inject('permissions', () => ['read'], true)
</script>
```

### 类实例默认值（工厂必需）

```vue
<script setup>
import { inject } from 'vue'
import { Logger } from '@/utils/logger'

// Class instances MUST use factory
const logger = inject('logger', () => new Logger({ level: 'warn' }), true)
</script>
```

## 选项 API 语法

在选项 API 中，将对象语法与 `default` 工厂函数结合使用：

```js
export default {
  inject: {
    // Primitive - can use literal
    theme: {
      from: 'theme',
      default: 'light'
    },

    // Object - MUST use factory
    config: {
      from: 'config',
      default: () => ({ debug: false })
    },

    // Array - MUST use factory
    permissions: {
      from: 'permissions',
      default: () => []
    }
  }
}
```

## 现实示例：表单上下文

```vue
<!-- FormProvider.vue -->
<script setup>
import { provide, reactive } from 'vue'

const formContext = reactive({
  values: {},
  errors: {},
  touched: {},
  isSubmitting: false
})

provide('formContext', formContext)
</script>

<!-- FormField.vue (might be used outside FormProvider) -->
<script setup>
import { inject } from 'vue'

// Safe default that won't be shared
const formContext = inject('formContext', () => ({
  values: {},
  errors: {},
  touched: {},
  isSubmitting: false,
  // Mark as standalone mode
  isStandalone: true
}), true)

// Component works both inside and outside FormProvider
</script>
```

## TypeScript：输入出厂默认值

```ts
import { inject } from 'vue'
import type { InjectionKey } from 'vue'

interface Config {
  apiUrl: string
  debug: boolean
  features: string[]
}

const ConfigKey: InjectionKey<Config> = Symbol('config')

// TypeScript understands the factory return type
const config = inject(ConfigKey, () => ({
  apiUrl: 'https://api.example.com',
  debug: false,
  features: []
}), true)
```

## 测试中的常见错误

这个陷阱经常出现在没有提供者的情况下渲染组件的测试中：

```ts
// test.spec.ts
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

// Without provider, all test instances share the wrong default
it('test 1', () => {
  const wrapper = mount(MyComponent)
  wrapper.vm.config.debug = true // Pollutes other tests!
})

it('test 2', () => {
  const wrapper = mount(MyComponent)
  // Might fail because debug is still true from test 1
})
```

**修复：在组件中使用工厂函数，或在测试中提供：**

```ts
it('test with provider', () => {
  const wrapper = mount(MyComponent, {
    global: {
      provide: {
        config: { debug: false, apiUrl: '' }
      }
    }
  })
})
```

## 参考
- [Vue.js Inject() API 参考](https://vuejs.org/api/composition-api-dependency-injection.html#inject)
- [Vue.js 提供/注入指南](https://vuejs.org/guide/components/provide-inject.html)
