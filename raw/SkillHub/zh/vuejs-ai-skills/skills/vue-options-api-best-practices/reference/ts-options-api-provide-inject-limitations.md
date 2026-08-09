---
title: 提供/注入选项 API 中的类型推断有限
impact: MEDIUM
impactDescription: Injected properties in Options API are not automatically typed, requiring manual type assertions or type augmentation
type: gotcha
tags: [vue3, typescript, options-api, provide-inject, type-safety]
---

# 提供/注入选项 API 中的类型推断有限

**影响：中度** - 将 `provide/inject` 与选项 API 和 TypeScript 结合使用时，不会自动键入注入的属性。 TypeScript 将显示组件上不存在该属性的错误，即使该属性在运行时有效。

## 任务清单

- [ ] 请注意，选项 API 注入的类型支持有限
- [ ] 使用类型增强将类型添加到注入的值中
- [ ] 考虑对注入值使用类型化计算包装器

## 问题

```typescript
// Provider component (parent)
import { defineComponent } from 'vue'

export default defineComponent({
  provide() {
    return {
      theme: 'dark',
      user: { id: 1, name: 'John' }
    }
  }
})
```

```typescript
// Consumer component (child) - Options API
import { defineComponent } from 'vue'

export default defineComponent({
  inject: ['theme', 'user'],

  mounted() {
    // TypeScript Error: Property 'theme' does not exist on type...
    console.log(this.theme)

    // TypeScript Error: Property 'user' does not exist on type...
    console.log(this.user.name)
  }
})
```

## 解决方案 1：类型增强

增强组件类型以包含注入的属性：

```typescript
// types/injections.d.ts
import 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    theme: 'light' | 'dark'
    user: { id: number; name: string }
  }
}

export {}
```

```typescript
// Consumer component - now typed
import { defineComponent } from 'vue'

export default defineComponent({
  inject: ['theme', 'user'],

  mounted() {
    // Now works - typed from ComponentCustomProperties
    console.log(this.theme)  // 'light' | 'dark'
    console.log(this.user.name)  // string
  }
})
```

**注意**：这会将类型全局添加到所有组件，而不仅仅是那些注入这些值的组件。

## 解决方案 2：类型化计算包装器

将对象语法与计算属性包装器一起使用以确保类型安全：

```typescript
import { defineComponent } from 'vue'

interface User {
  id: number
  name: string
}

export default defineComponent({
  inject: {
    theme: {
      from: 'theme',
      default: 'light'
    },
    user: {
      from: 'user',
      default: () => ({ id: 0, name: 'Guest' })
    }
  },

  computed: {
    // Type via computed wrapper
    typedTheme(): 'light' | 'dark' {
      return this.theme as 'light' | 'dark'
    },
    typedUser(): User {
      return this.user as User
    }
  },

  mounted() {
    console.log(this.typedTheme)
    console.log(this.typedUser.name)
  }
})
```

## 为什么会发生这种情况

选项 API `inject` 数组语法 `inject: ['theme']` 不向 TypeScript 提供类型信息。 Vue 知道运行时的注入，但 TypeScript 的静态分析无法跟踪组件之间的提供/注入关系。

## 参考

- [Vue.js 提供/注入](https://vuejs.org/guide/components/provide-inject.html)
- [GitHub 问题：向选项 API 提供/注入添加类型推断](https://github.com/vuejs/core/issues/3031)
