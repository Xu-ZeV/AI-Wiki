---
title: 在 watchEffect 内部调用 toValue() 以进行正确的依赖跟踪
impact: HIGH
impactDescription: Calling toValue() outside watchEffect prevents reactive dependency tracking, causing the effect to never re-run
type: gotcha
tags: [vue3, composables, composition-api, watchEffect, toValue, reactivity]
---

# 在 watchEffect 内部调用 toValue() 进行正确的依赖跟踪

**影响：高** - 编写接受 `MaybeRefOrGetter` 参数的可组合函数时，必须在 `watchEffect` 回调内部调用 `toValue()`，而不是外部。如果在 watchEffect 之前提取值，Vue 将无法跟踪依赖关系，并且当源发生更改时，效果将永远不会重新运行。

这是一个微妙但严重的错误，导致可组合函数使用初始值但从不更新。

## 任务清单

- [ ] 始终在 `watchEffect` 回调中调用 `toValue()`，而不是之前
- [ ] 同样，在 watchEffect 内部而不是外部的引用上访问 `.value`
- [ ] 对于 `watch()`，使用调用 `toValue()` 的 getter 函数
- [ ] 测试可组合函数在输入更改时是否更新

**错误：**
```javascript
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  // WRONG: toValue called outside watchEffect
  // This extracts the value ONCE and passes a static string
  const urlValue = toValue(url)

  watchEffect(async () => {
    try {
      // urlValue is a static string - no dependency tracked!
      const response = await fetch(urlValue)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    }
  })

  return { data, error }
}

// When used like this:
const apiUrl = ref('/api/users')
const { data } = useFetch(apiUrl)

// Later...
apiUrl.value = '/api/products'  // useFetch will NOT refetch!
```

**正确：**
```javascript
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)

  watchEffect(async () => {
    // CORRECT: toValue called INSIDE watchEffect
    // Vue tracks this as a dependency
    const urlValue = toValue(url)

    try {
      const response = await fetch(urlValue)
      data.value = await response.json()
    } catch (e) {
      error.value = e
    }
  })

  return { data, error }
}

// Now when used:
const apiUrl = ref('/api/users')
const { data } = useFetch(apiUrl)

// Later...
apiUrl.value = '/api/products'  // useFetch WILL refetch!
```

## 这同样适用于直接引用访问

```javascript
// WRONG: Accessing .value outside the effect
export function useDebounce(source, delay = 300) {
  // This captures the initial value, not a reactive dependency
  const initialValue = source.value  // or toValue(source)

  watchEffect(() => {
    // initialValue is static - this only runs once
    console.log('Value:', initialValue)
  })
}

// CORRECT: Access inside the effect
export function useDebounce(source, delay = 300) {
  watchEffect(() => {
    // Vue tracks source.value or toValue(source) as dependency
    console.log('Value:', toValue(source))
  })
}
```

## 模式：将 watch() 与 Getter 函数结合使用

对于 `watch()`，将 `toValue()` 包装在 getter 中：

```javascript
import { ref, watch, toValue } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const data = ref(defaultValue)

  // CORRECT: Use getter function with watch
  watch(
    () => toValue(key),  // Getter calls toValue, tracks dependency
    (newKey) => {
      const stored = localStorage.getItem(newKey)
      data.value = stored ? JSON.parse(stored) : defaultValue
    },
    { immediate: true }
  )

  return data
}
```

## 为什么会发生这种情况

Vue 的响应式跟踪通过在效果执行期间检测属性访问来工作：

```javascript
watchEffect(() => {
  // When this runs, Vue is "recording" what reactive sources are accessed
  const value = someRef.value  // Vue records: "this effect depends on someRef"
})

// But if you extract the value before:
const value = someRef.value  // Vue isn't recording yet
watchEffect(() => {
  console.log(value)  // Just using a plain JavaScript variable
})
```

`toValue()` 的工作方式相同 - 它在内部访问 `.value`，因此它必须在效果执行期间发生才能进行跟踪。

## 可组合作者的快速清单

接受 `MaybeRefOrGetter` 输入时：

1. 存储原始参数（在设置过程中不要调用 `toValue`）
2. 在任何响应式上下文中调用 `toValue()`（`watchEffect`、`watch`、`computed`）
3. 使用静态值和变化的参考进行测试

```javascript
export function useMyComposable(input) {
  // Store raw - don't extract value here
  // const value = toValue(input)  // WRONG

  const result = computed(() => {
    // Extract value inside reactive context
    return transform(toValue(input))  // CORRECT
  })

  watchEffect(() => {
    // Extract value inside reactive context
    doSomething(toValue(input))  // CORRECT
  })

  return { result }
}
```

## 参考
- [Vue.js 响应式 API - toValue](https://vuejs.org/api/reactivity-utilities.html#tovalue)
- [Vue.js 可组合函数 - 接受 Ref 参数](https://vuejs.org/guide/reusability/composables.html#accepting-reactive-state)
