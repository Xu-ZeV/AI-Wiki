---
title: 避免可组合函数中隐藏的副作用
impact: HIGH
impactDescription: Side effects hidden in composables make debugging difficult and create implicit coupling between components
type: best-practice
tags: [vue3, composables, composition-api, side-effects, provide-inject, global-state]
---

# 避免可组合函数中隐藏的副作用

**影响：高** - 可组合函数应该封装有状态逻辑，而不是隐藏影响其范围之外的事物的副作用。隐藏的副作用（例如修改全局状态、内部使用提供/注入或直接操作 DOM）使可组合函数变得不可预测且难以调试。

当可组合函数产生意想不到的副作用时，消费者无法推断调用它会做什么。这会导致难以追踪的错误和无法安全重用的可组合函数。

## 任务清单

- [ ] 避免在可组合函数中使用提供/注入（使依赖关系明确）
- [ ] 不要在内部修改 Pinia/Vuex 存储状态（而是接受存储作为参数）
- [ ] 不要直接操作 DOM（使用作为参数传递的模板引用）
- [ ] 清楚地记录任何不可避免的副作用
- [ ] 让可组合函数专注于返回反应状态和方法

**错误：**
```javascript
// WRONG: Hidden provide/inject dependency
export function useTheme() {
  // Consumer has no idea this depends on a provided theme
  const theme = inject('theme')  // What if nothing provides this?

  const isDark = computed(() => theme?.mode === 'dark')
  return { isDark }
}

// WRONG: Modifying global store internally
import { useUserStore } from '@/stores/user'

export function useLogin() {
  const userStore = useUserStore()

  async function login(credentials) {
    const user = await api.login(credentials)
    // Hidden side effect: modifying global state
    userStore.setUser(user)
    userStore.setToken(user.token)
    // Consumer doesn't know the store was modified!
  }

  return { login }
}

// WRONG: Hidden DOM manipulation
export function useFocusTrap() {
  onMounted(() => {
    // Which element? Consumer has no control
    document.querySelector('.modal')?.focus()
  })
}

// WRONG: Hidden provide that affects descendants
export function useFormContext() {
  const form = reactive({ values: {}, errors: {} })
  // Components calling this have no idea it provides something
  provide('form-context', form)
  return form
}
```

**正确：**
```javascript
// CORRECT: Explicit dependency injection
export function useTheme(injectedTheme) {
  // If no theme passed, consumer must handle it
  const theme = injectedTheme ?? { mode: 'light' }

  const isDark = computed(() => theme.mode === 'dark')
  return { isDark }
}

// Usage - dependency is explicit
const theme = inject('theme', { mode: 'light' })
const { isDark } = useTheme(theme)

// CORRECT: Return actions, let consumer decide when to call them
export function useLogin() {
  const user = ref(null)
  const token = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  async function login(credentials) {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.login(credentials)
      user.value = response.user
      token.value = response.token
      return response
    } catch (e) {
      error.value = e
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return { user, token, isLoading, error, login }
}

// Consumer decides what to do with the result
const { user, token, login } = useLogin()
const userStore = useUserStore()

async function handleLogin(credentials) {
  await login(credentials)
  // Consumer explicitly updates the store
  userStore.setUser(user.value)
  userStore.setToken(token.value)
}

// CORRECT: Accept element as parameter
export function useFocusTrap(targetRef) {
  onMounted(() => {
    targetRef.value?.focus()
  })

  onUnmounted(() => {
    // Cleanup focus trap
  })
}

// Usage - consumer controls which element
const modalRef = ref(null)
useFocusTrap(modalRef)

// CORRECT: Separate composable from provider
export function useFormContext() {
  const form = reactive({ values: {}, errors: {} })
  return form
}

// In parent component - explicit provide
const form = useFormContext()
provide('form-context', form)
```

## 可接受的副作用（带文档）

当某些副作用是可组合函数的核心目的时，它们是可以接受的：

```javascript
/**
 * Tracks mouse position globally.
 *
 * SIDE EFFECTS:
 * - Adds 'mousemove' event listener to window (cleaned up on unmount)
 *
 * @returns {Object} Mouse coordinates { x, y }
 */
export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  // This side effect is the whole point of the composable
  // and is properly cleaned up
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  function update(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  return { x, y }
}
```

## 模式：依赖注入以实现灵活性

```javascript
// Composable accepts its dependencies
export function useDataFetcher(apiClient, cache = null) {
  const data = ref(null)

  async function fetch(url) {
    if (cache) {
      const cached = cache.get(url)
      if (cached) {
        data.value = cached
        return
      }
    }

    data.value = await apiClient.get(url)
    cache?.set(url, data.value)
  }

  return { data, fetch }
}

// Usage - dependencies are explicit and testable
const apiClient = inject('apiClient')
const cache = inject('cache', null)
const { data, fetch } = useDataFetcher(apiClient, cache)
```

## 参考
- [Vue.js 可组合函数](https://vuejs.org/guide/reusability/composables.html)
- [创建合成函数的常见错误](https://www.telerik.com/blogs/common-mistakes-creating-composition-functions-vue)
