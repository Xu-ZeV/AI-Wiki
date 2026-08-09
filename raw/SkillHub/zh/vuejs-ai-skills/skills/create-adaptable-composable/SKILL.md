---
name: create-adaptable-composable
description: 创建一个库级 Vue 可组合函数，它接受 Maybe-reactive 输入 (MaybeRef / MaybeRefOrGetter)，以便调用者可以传递普通值、ref 或 getter。使用响应式 effect (watch/watchEffect) 内的 toValue()/toRef() 标准化输入，以保持行为可预测和反应。当用户要求创建适应性强或可重用的可组合函数时，请使用此技能。
license: MIT
metadata:
  author: github.com/vuejs-ai
  version: "17.0.0"
compatibility: Requires Vue 3 (or above) or Nuxt 3 (or above) project
---

# 创建适应性强的可组合函数

适应性可组合函数是可重用的函数，可以接受响应式和非响应式输入。这使得开发者可以在各种上下文中使用可组合函数，而无需担心输入的响应式。

在 Vue.js 中设计适应性可组合的步骤：
1. 确认可组合函数的用途和 API 设计以及预期的输入/输出。
2. 确定应响应的输入参数 (MaybeRef / MaybeRefOrGetter)。
3. 使用 `toValue()` 或 `toRef()` 标准化响应式 effect内的输入。
4. 使用 Vue 的响应式 API 实现可组合函数的核心逻辑。

## 核心类型概念

### 类型实用程序

```ts
/**
 * value or writable ref (value/ref/shallowRef/writable computed)
 */
export type MaybeRef<T = any> = T | Ref<T> | ShallowRef<T> | WritableComputedRef<T>;

/**
 * MaybeRef<T> + ComputedRef<T> + () => T
 */
export type MaybeRefOrGetter<T = any> = MaybeRef<T> | ComputedRef<T> | (() => T);
```

### 策略和规则

- 只读、计算友好的输入：使用 `MaybeRefOrGetter`
- 需要可写/双向输入：使用`MaybeRef`
- 参数可能是函数值（回调/谓词/比较器）：不要使用 `MaybeRefOrGetter`，否则您可能会意外地将其作为 getter 调用。
- DOM/Element targets: if you want computed/derived targets, use `MaybeRefOrGetter`.

当使用`MaybeRefOrGetter`或`MaybeRef`时： 
- 使用 `toRef()` 解析响应式值（例如侦听器源）
- 使用 `toValue()` 解析非响应式值

### 示例

可适配 `useDocumentTitle` 可组合：只读标题参数

```ts
import { watch, toRef } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useDocumentTitle(title: MaybeRefOrGetter<string>) {
  watch(toRef(title), (t) => {
    document.title = t
  }, { immediate: true })
}
```

适配`useCounter` 可组合：双向可写计数参数

```ts
import { watch, toRef } from 'vue'
import type { MaybeRef } from 'vue'

function useCounter(count: MaybeRef<number>) {
  const countRef = toRef(count)
  function add() {
    countRef.value++
  }
  return { add }
}
```
