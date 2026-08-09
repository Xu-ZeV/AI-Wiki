---
title: 遵循可组合命名约定和返回模式
impact: MEDIUM
impactDescription: Inconsistent composable patterns lead to confusing APIs and reactivity issues when destructuring
type: best-practice
tags: [vue3, composables, composition-api, naming, conventions, refs]
---

# 遵循可组合命名约定和返回模式

**影响：中** - Vue 可组合函数应遵循既定约定：使用“use”作为名称前缀，并返回包含引用的普通对象（不是响应式对象）。返回响应式对象会导致解构时响应式损失，而不一致的命名会使代码更难以理解。

## 任务清单

- [ ] 使用“use”前缀命名可组合函数（例如，`useMouse`、`useFetch`、`useAuth`）
- [ ] 返回包含引用的普通对象，而不是反应对象
- [ ] 允许解构和对象式访问
- [ ] 为消费者记录返回的引用

**错误：**
```javascript
// WRONG: No "use" prefix - unclear it's a composable
export function mousePosition() {
  const x = ref(0)
  const y = ref(0)
  return { x, y }
}

// WRONG: Returning reactive object - destructuring loses reactivity
export function useMouse() {
  const state = reactive({
    x: 0,
    y: 0
  })
  // When consumer destructures: const { x, y } = useMouse()
  // x and y become plain values, not reactive!
  return state
}

// WRONG: Returning single ref directly - inconsistent API
export function useCounter() {
  const count = ref(0)
  return count  // Consumer must use .value everywhere
}
```

**正确：**
```javascript
// CORRECT: "use" prefix and returns plain object with refs
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  // Return plain object containing refs
  return { x, y }
}

// Consumer can destructure and keep reactivity
const { x, y } = useMouse()
watch(x, (newX) => console.log('x changed:', newX))  // Works!

// Or use as object if preferred
const mouse = useMouse()
console.log(mouse.x.value)
```

## 使用reactive()包装器进行自动展开

如果消费者更喜欢自动展开（没有 `.value`），他们可以包装结果：

```javascript
import { reactive } from 'vue'
import { useMouse } from './composables/useMouse'

// Wrapping in reactive() links the refs
const mouse = reactive(useMouse())

// Now access without .value
console.log(mouse.x)  // Auto-unwrapped, still reactive

// But DON'T destructure from this!
const { x } = reactive(useMouse())  // WRONG: loses reactivity again
```

## 模式：同时返回状态和操作

```javascript
// Composable with state AND methods
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const doubleCount = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  function reset() {
    count.value = initialValue
  }

  // Return all refs and functions in plain object
  return {
    count,
    doubleCount,
    increment,
    decrement,
    reset
  }
}

// Usage
const { count, doubleCount, increment, reset } = useCounter(10)
```

## 命名约定示例

|好名字|坏名声|原因 |
|-----------|----------|--------|
| `useFetch` | `fetch` |与本机获取冲突 |
| `useAuth` | `authStore` | “store”意味着 Pinia/Vuex |
| `useLocalStorage` | `localStorage` |与原生 API 冲突 |
| `useFormValidation` | `validateForm` |听起来像是一次性功能 |
| `useWindowSize` | `getWindowSize` | “get”意味着同步 getter |

## 参考
- [Vue.js 可组合函数 - 约定和最佳实践](https://vuejs.org/guide/reusability/composables.html#conventions-and-best-practices)
- [Vue.js 可组合函数 - 返回值](https://vuejs.org/guide/reusability/composables.html#return-values)
