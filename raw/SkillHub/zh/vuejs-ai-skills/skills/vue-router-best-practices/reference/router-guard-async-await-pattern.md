---
title: 异步导航守卫需要正确的 Promise 处理
impact: MEDIUM
impactDescription: Unawaited promises in guards cause navigation to complete before async checks finish, allowing unauthorized access or missing data
type: gotcha
tags: [vue3, vue-router, navigation-guards, async, promises]
---

# 异步导航守卫需要正确的 Promise 处理

**影响：中** - 执行异步操作（API 调用、身份验证检查）的导航防护必须正确处理承诺。如果您不等待异步操作或返回承诺，则导航会在检查完成之前完成，从而可能允许未经授权的访问或使用不完整的数据进行导航。

## 任务清单

- [ ] 在导航守卫中使用 async/await
- [ ] 如果不使用 async/await，则返回承诺
- [ ] 为长异步操作添加加载状态
- [ ] 对缓慢的 API 调用实施超时
- [ ] 处理错误以防止导航挂起

## 问题

```javascript
// WRONG: Not awaiting - navigation proceeds immediately
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    checkAuth()  // This returns a Promise but we're not waiting!
    // Navigation continues before checkAuth completes
  }
})

// WRONG: Async function but forgot return
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    const isValid = await checkAuth()
    if (!isValid) {
      // This redirect might happen after navigation already completed!
      return '/login'
    }
  }
  // Missing return - implicitly returns undefined, allowing navigation
})
```

## 解决方案：正确的异步/等待模式

```javascript
// CORRECT: Async function with proper returns
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    try {
      const isAuthenticated = await checkAuth()

      if (!isAuthenticated) {
        return { name: 'Login', query: { redirect: to.fullPath } }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      return { name: 'Error', params: { message: 'Authentication failed' } }
    }
  }
  // Explicitly return nothing to proceed
  return true
})
```

## 解决方案：基于 Promise 的模式（替代）

```javascript
// CORRECT: Return promise explicitly
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    return checkAuth()
      .then(isAuthenticated => {
        if (!isAuthenticated) {
          return { name: 'Login' }
        }
      })
      .catch(error => {
        console.error('Auth check failed:', error)
        return { name: 'Error' }
      })
  }
})
```

## 异步防护期间的加载状态

```javascript
// app/composables/useNavigationLoading.js
import { ref } from 'vue'

const isNavigating = ref(false)

export function useNavigationLoading() {
  return { isNavigating }
}

export function setupNavigationLoading(router) {
  router.beforeEach(() => {
    isNavigating.value = true
  })

  router.afterEach(() => {
    isNavigating.value = false
  })

  router.onError(() => {
    isNavigating.value = false
  })
}
```

```vue
<!-- App.vue -->
<script setup>
import { useNavigationLoading } from '@/composables/useNavigationLoading'

const { isNavigating } = useNavigationLoading()
</script>

<template>
  <LoadingBar v-if="isNavigating" />
  <router-view />
</template>
```

## 慢速 API 的超时模式

```javascript
// CORRECT: Add timeout to prevent indefinite waiting
function withTimeout(promise, ms = 5000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), ms)
    )
  ])
}

router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth) {
    try {
      const isValid = await withTimeout(checkAuth(), 5000)
      if (!isValid) {
        return '/login'
      }
    } catch (error) {
      if (error.message === 'Request timeout') {
        // Let user through but show warning
        console.warn('Auth check timed out')
      } else {
        return '/login'
      }
    }
  }
})
```

## 多个异步检查

```javascript
// CORRECT: Run independent checks in parallel
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth && to.meta.requiresSubscription) {
    try {
      const [isAuthenticated, hasSubscription] = await Promise.all([
        checkAuth(),
        checkSubscription()
      ])

      if (!isAuthenticated) {
        return '/login'
      }

      if (!hasSubscription) {
        return '/subscribe'
      }
    } catch (error) {
      return '/error'
    }
  }
})
```

## 错误处理最佳实践

```javascript
router.beforeEach(async (to, from) => {
  try {
    // Your async logic here
    await performChecks(to)
  } catch (error) {
    // Always handle errors to prevent navigation from hanging

    if (error.response?.status === 401) {
      return '/login'
    }

    if (error.response?.status === 403) {
      return '/forbidden'
    }

    if (error.code === 'NETWORK_ERROR') {
      // Offline - maybe allow navigation but show warning
      return true
    }

    // Unknown error - redirect to error page
    console.error('Navigation guard error:', error)
    return { name: 'Error', state: { error: error.message } }
  }
})
```

## 要点

1. **始终等待异步操作** - 否则导航立即继续
2. **返回值很重要** - 返回重定向的路由， false 取消， true/undefined 继续
3. **处理所有错误情况** - 未捕获的错误可能会挂起导航
4. **添加超时** - 缓慢的 API 不应无限期地阻止导航
5. **显示加载状态** - 用户在异步检查期间需要反馈
6. **并行化独立检查** - 使用 Promise.all 以获得更好的性能

## 参考
- [Vue路由器导航卫士](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [Vue路由器导航失败](https://router.vuejs.org/guide/advanced/navigation-failures.html)
