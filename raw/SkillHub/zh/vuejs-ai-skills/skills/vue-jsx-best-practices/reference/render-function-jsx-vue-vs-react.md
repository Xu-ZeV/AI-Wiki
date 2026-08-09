---
title: Vue JSX 使用 HTML 属性而不是 React 约定
impact: MEDIUM
impactDescription: Using className or htmlFor in Vue JSX causes TypeScript errors and inconsistent code style
type: gotcha
tags: [vue3, jsx, tsx, render-function]
---

# Vue JSX 使用 HTML 属性而不是 React 约定

**影响：中** - Vue 的 JSX 转换使用标准 HTML 属性名称（`class`、`for`），而不是 React 的 JavaScript 友好名称（`className`、`htmlFor`）。通过正确的 TypeScript 配置，使用 `className` 或 `htmlFor` 等 React 约定将产生 TypeScript 错误，这有利于及早发现这些不一致。请注意，Vue 的运行时是宽松的，实际上会正确转换这些属性，但为了与 Vue 模板保持一致和适当的类型安全性，建议使用 HTML 属性。

在 Vue 中编写 JSX 时，请使用与常规 HTML 模板中使用的属性名称相同的属性名称。这是与 React 的 JSX 的根本区别，其中 `class` 和 `for` 是保留的 JavaScript 关键字。

## 任务清单

- [ ] 在 Vue JSX 中使用 `class` 代替 `className`
- [ ] 在 Vue JSX 中使用 `for` 代替 `htmlFor`
- [ ] 使用带有 `on` 前缀的标准 HTML 事件名称（onClick、onInput）
- [ ] 将React组件迁移到Vue时，更新所有属性名称
- [ ] 为 Vue JSX 类型推断正确配置 TypeScript

**不正确（React 风格）：**
```jsx
// AVOID: React conventions cause TypeScript errors in Vue JSX
// (Vue runtime is lenient and converts these, but types don't allow them)
export default {
  setup() {
    return () => (
      <div className="container">
        <label htmlFor="email">Email:</label>
        <input id="email" className="input-field" />
      </div>
    )
  }
}
```

```tsx
// AVOID: TypeScript will reject className/htmlFor with Vue's JSX types
const Button = () => (
  <button
    className="btn btn-primary"  // TS error: Property 'className' does not exist
    htmlFor="form"               // TS error: Property 'htmlFor' does not exist
  >
    Submit
  </button>
)
```

**正确（Vue 风格）：**
```jsx
// CORRECT: Use standard HTML attributes
export default {
  setup() {
    return () => (
      <div class="container">
        <label for="email">Email:</label>
        <input id="email" class="input-field" />
      </div>
    )
  }
}
```

```tsx
// CORRECT: Vue TSX with HTML attributes
const Button = () => (
  <button
    class="btn btn-primary"
  >
    Submit
  </button>
)
```

## Vue JSX 的 TypeScript 配置

要为 Vue JSX/TSX 启用正确的类型推断和 IntelliSense，请配置 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "vue"
  }
}
```

从 Vue 3.4 开始，Vue 不再隐式注册全局 JSX 命名空间，因此 TypeScript 需要 `jsxImportSource` 才能使用 Vue 的 JSX 类型定义。

## 投票配置

对于 Vite 项目，请确保您在 `vite.config.ts` 中配置了 JSX 插件：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()]
})
```

## 其他属性差异

|反应 JSX | Vue JSX | HTML |
|-----------|---------|------|
|类名 |类 |类 |
| html对于 |对于 |对于 |
|改变| onInput（用于实时更新）|输入|
|选项卡索引 |标签索引 |标签索引 |
|只读 |只读 |只读 |

## Vue JSX 中的事件处理

```jsx
// Vue JSX event handling
export default {
  setup() {
    const handleClick = () => console.log('clicked')
    const handleInput = (e) => console.log(e.target.value)

    return () => (
      <div>
        <button onClick={handleClick}>Click</button>
        <input onInput={handleInput} />

        {/* Event modifiers via helper */}
        <div onClick={withModifiers(handleClick, ['self'])}>
          Only triggers on self
        </div>
      </div>
    )
  }
}
```

## 参考
- [Vue.js JSX 和 TSX](https://vuejs.org/guide/extras/render-function.html#jsx-tsx)
