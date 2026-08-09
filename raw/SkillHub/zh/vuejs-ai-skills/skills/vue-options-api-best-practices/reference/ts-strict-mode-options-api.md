---
title: 为适当的选项 API TypeScript 支持启用严格模式
impact: HIGH
impactDescription: Without strict mode, 'this' in Options API components is typed as 'any', losing all type safety
type: gotcha
tags: [typescript, options-api, tsconfig, this-typing, configuration]
---

# 为适当的选项 API TypeScript 支持启用严格模式

**影响：高** - 如果 tsconfig.json 中没有 `strict: true`（或至少 `noImplicitThis: true`），选项 API 组件中的 `this` 上下文将键入为 `any`。这会默默地禁用对组件实例上所有属性访问的类型检查。

## 任务清单

- [ ] 在 tsconfig.json 中启用 `strict: true` （推荐）
- [ ] 或至少启用 `noImplicitThis: true`
- [ ] 用 `defineComponent()` 包裹组件以进行正确的推理
- [ ] 验证访问不存在的属性时出现类型错误

## 问题

TypeScript 在没有严格模式的情况下的默认行为允许隐式 `any` 类型，这违背了将 TypeScript 与 Vue 的 Options API 一起使用的目的。

**没有严格模式的 tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020"
    // No strict mode - this is DANGEROUS
  }
}
```

**具有隐藏类型错误的组件：**
```typescript
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      count: 0,
      message: 'Hello'
    }
  },
  methods: {
    increment() {
      // Without strict mode, these errors are SILENT:
      this.cont++          // Typo: should be 'count'
      this.nonExistent     // Property doesn't exist
      this.message.toFixed() // Wrong method for string
    }
  }
})
```

上述所有错误在没有严格模式的情况下都能成功编译，因为 `this` 隐式是 `any`。

## 正确配置

**推荐的 tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "isolatedModules": true
  }
}
```

**选项 API 类型安全的最低要求：**
```json
{
  "compilerOptions": {
    "noImplicitThis": true
  }
}
```

## 严格模式启用什么

`strict` 标志是启用多个类型检查选项的简写：

|选项 |效果|
|--------|--------|
| `noImplicitThis` |隐式 `any` 类型的 `this` 上的错误 |
| `noImplicitAny` |具有隐式 `any` 类型的表达式上的错误 |
| `strictNullChecks` | null 和 undefined 是不同的类型 |
| `strictFunctionTypes` |更严格的功能参数检查 |
| `strictPropertyInitialization` |类属性必须初始化 |
| `strictBindCallApply` |更严格的绑定、调用、应用输入 |
| `alwaysStrict` |在输出中发出“use strict” |

## 通过正确的输入来正确的组件

```typescript
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      count: 0,
      message: 'Hello'
    }
  },
  computed: {
    doubleCount(): number {
      return this.count * 2  // 'this.count' is typed as number
    }
  },
  methods: {
    increment() {
      this.count++           // Type-safe: count is number
      // this.cont++         // ERROR: Property 'cont' does not exist
    },
    greet(name: string) {
      return `${this.message}, ${name}!`  // Type-safe
    }
  }
})
```

## 启用严格模式后常见错误

### 错误：属性“xxx”不存在

```typescript
// Before: worked silently
this.unknownProp

// After: TypeScript error
// Property 'unknownProp' does not exist on type 'ComponentPublicInstance<...>'
```

通过将属性添加到 `data()` 或正确声明它来修复。

### 错误：对象可能“未定义”

```typescript
methods: {
  getFirst() {
    const items = this.items
    // Error: Object is possibly 'undefined'
    return items[0].name
  }
}
```

通过正确的空检查修复：
```typescript
methods: {
  getFirst() {
    return this.items?.[0]?.name
  }
}
```

## 重要：defineComponent 是必需的

即使使用严格模式，您也必须使用 `defineComponent()` 才能启用正确的类型推断：

```typescript
// BAD - No type inference for 'this'
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++  // 'this' is any even with strict mode!
    }
  }
}

// GOOD - Full type inference
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++  // 'this.count' is properly typed as number
    }
  }
})
```

## 参考

- [Vue.js TypeScript 概述 - tsconfig.json](https://vuejs.org/guide/typescript/overview.html#configuring-tsconfig-json)
- [带有选项 API 的 Vue.js TypeScript](https://vuejs.org/guide/typescript/options-api.html)
- [TypeScript 严格模式](https://www.typescriptlang.org/tsconfig#strict)
