---
title: 不要将通用参数与reactive()一起使用
impact: MEDIUM
impactDescription: The generic argument type differs from the actual return type due to ref unwrapping, causing type mismatches
type: gotcha
tags: [vue3, typescript, reactive, ref-unwrapping, composition-api]
---

# 不要在reactive()中使用通用参数

**影响：中** - 不建议使用 `reactive()` 的泛型参数，因为处理嵌套引用展开的返回类型与泛型参数类型不同。请改用变量上的接口注释。

## 任务清单

- [ ] 在变量上使用类型注释，而不是泛型参数
- [ ] 了解 `reactive()` 解包嵌套引用
- [ ] 对于通用可组合函数，使用 `shallowRef` 或显式 `Ref<T>` 键入
- [ ] 更喜欢 `ref()` 作为简单值以避免这些问题

## 问题

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Book {
  title: string
  year: number
  author: Ref<string>  // Nested ref
}

// WRONG: Generic argument doesn't account for ref unwrapping
const book = reactive<Book>({
  title: 'Vue 3 Guide',
  year: 2024,
  author: ref('John Doe')
})

// TypeScript thinks book.author is Ref<string>
// But at runtime, it's unwrapped to just string!
book.author.value  // TypeScript: OK, Runtime: ERROR (author is a string, not a ref)
</script>
```

## 解决方案：接口注解

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Book {
  title: string
  year?: number
}

// CORRECT: Annotate the variable, not the generic
const book: Book = reactive({
  title: 'Vue 3 Guide'
})

book.title = 'New Title'  // TypeScript knows this is string
book.year = 2024         // TypeScript knows this is number | undefined
</script>
```

## 为什么会发生这种情况

当您使用 `reactive()` 时，Vue 会自动解包任何嵌套引用：

```typescript
import { reactive, ref, Ref } from 'vue'

const name = ref('John')
const state = reactive({
  name: name  // This is a Ref<string>
})

// At runtime, state.name is 'John' (string), NOT a Ref
console.log(state.name)       // 'John' (not ref object)
console.log(state.name.value) // Runtime error: .value doesn't exist

// The ACTUAL return type is different from what you'd expect
// reactive<{ name: Ref<string> }>() does NOT return { name: Ref<string> }
// It returns { name: string } due to automatic unwrapping
```

## 正确的模式

### 模式1：简单的接口注解

```vue
<script setup lang="ts">
interface FormState {
  name: string
  email: string
  age: number
}

const form: FormState = reactive({
  name: '',
  email: '',
  age: 0
})
</script>
```

### 模式 2：部分可选字段

```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
  email: string
}

// Start with partial data
const user: Partial<User> = reactive({})

// Fill in later
user.id = '123'
user.name = 'John'
</script>
```

### 模式 3：使用 ref() 代替

对于更简单的情况，首选 `ref()` ，它具有更可预测的类型：

```vue
<script setup lang="ts">
interface User {
  id: string
  name: string
}

// ref() works well with generics
const user = ref<User>({
  id: '1',
  name: 'John'
})

// Access with .value - clear and predictable
user.value.name = 'Jane'
</script>
```

## 通用可组合函数：使用 Ref<T> 或shallowRef

在可组合函数中使用泛型类型参数时：

```typescript
// PROBLEM: Generic T with ref() causes UnwrapRef issues
function useBroken<T>(initial: T) {
  const state = ref(initial)  // Type becomes Ref<UnwrapRef<T>>
  state.value = initial       // Error: T is not assignable to UnwrapRef<T>
  return state
}

// SOLUTION 1: Use explicit Ref<T> type
function useFixed1<T>(initial: T) {
  const state: Ref<T> = ref(initial) as Ref<T>
  return state
}

// SOLUTION 2: Use shallowRef (no unwrapping)
function useFixed2<T>(initial: T) {
  const state = shallowRef(initial)  // Properly typed as ShallowRef<T>
  return state
}
```

## 当通用参数是安全的时

对于没有嵌套响应式的简单非引用值，泛型是安全的：

```typescript
// Safe: no nested refs
const state = reactive<{ count: number; name: string }>({
  count: 0,
  name: ''
})

// Also safe: explicit simple types
const list = reactive<string[]>([])
const map = reactive<Map<string, number>>(new Map())
```

该问题仅在以下情况下出现：
1. 你的接口中嵌套了 Ref 类型
2.您使用的泛型类型参数可能包含引用

## 参考
- [带有 Composition API 的 Vue.js TypeScript - 键入reactive()](https://vuejs.org/guide/typescript/composition-api.html#typing-reactive)
- [GitHub问题：带有泛型类型的参考](https://github.com/vuejs/core/discussions/9564)
- [Vue TypeScript 注意要点](https://gist.github.com/LinusBorg/e041ff635994b50b7cec9383c3a067f1)
