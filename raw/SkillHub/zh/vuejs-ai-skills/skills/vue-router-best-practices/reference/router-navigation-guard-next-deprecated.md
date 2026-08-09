---
title: Vue Router Navigation Guard next() 函数已弃用
impact: HIGH
impactDescription: Using the deprecated next() function incorrectly causes navigation to hang, infinite loops, or silent failures
type: gotcha
tags: [vue3, vue-router, navigation-guards, migration, async]
---

# Vue Router Navigation Guard next() 函数已弃用

**影响：高** - 导航守卫中的第三个 `next()` 参数在 Vue Router 4 中已被弃用。虽然仍然支持向后兼容性，但错误使用它是最常见的错误来源之一：多次调用它、忘记调用它或在没有正确逻辑的情况下有条件地调用它。

## 任务清单

- [ ] 重构守卫以使用基于返回的语法而不是 next()
- [ ] 从导航守卫中删除所有 next() 调用
- [ ] 使用 async/await 模式进行异步检查
- [ ] 返回 false 取消，返回路由重定向，不返回任何内容继续

## 问题

```javascript
// WRONG: Using deprecated next() function
router.beforeEach((to, from, next) => {
  if (!isAuthenticated) {
    next('/login')  // Easy to forget this call
  }
  // BUG: next() not called when authenticated - navigation hangs!
})

// WRONG: Multiple next() calls
router.beforeEach((to, from, next) => {
  if (!isAuthenticated) {
    next('/login')
  }
  next()  // BUG: Called twice when not authenticated!
})

// WRONG: next() in async code without proper handling
router.beforeEach(async (to, from, next) => {
  const user = await fetchUser()
  if (!user) {
    next('/login')
  }
  next()  // Still gets called even after redirect!
})
```

## 解决方案：使用基于返回的防护

```javascript
// CORRECT: Return-based syntax (modern Vue Router 4+)
router.beforeEach((to, from) => {
  if (!isAuthenticated) {
    return '/login'  // Redirect
  }
  // Return nothing (undefined) to proceed
})

// CORRECT: Return false to cancel navigation
router.beforeEach((to, from) => {
  if (hasUnsavedChanges) {
    return false  // Cancel navigation
  }
})

// CORRECT: Async with return-based syntax
router.beforeEach(async (to, from) => {
  const user = await fetchUser()
  if (!user) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  // Proceed with navigation
})
```

## 返回值解释

```javascript
router.beforeEach((to, from) => {
  // Return nothing/undefined - allow navigation
  return

  // Return false - cancel navigation, stay on current route
  return false

  // Return string path - redirect to path
  return '/login'

  // Return route object - redirect with full control
  return { name: 'Login', query: { redirect: to.fullPath } }

  // Return Error - cancel and trigger router.onError()
  return new Error('Navigation cancelled')
})
```

## 如果您必须使用 next() （旧代码）

如果维护使用 `next()` 的旧代码，请严格遵循以下规则：

```javascript
// CORRECT: Exactly one next() call per code path
router.beforeEach((to, from, next) => {
  if (!isAuthenticated) {
    next('/login')
    return  // CRITICAL: Exit after calling next()
  }

  if (!hasPermission(to)) {
    next('/forbidden')
    return  // CRITICAL: Exit after calling next()
  }

  next()  // Only reached if all checks pass
})
```

## 错误处理模式

```javascript
router.beforeEach(async (to, from) => {
  try {
    await validateAccess(to)
    // Proceed
  } catch (error) {
    if (error.status === 401) {
      return '/login'
    }
    if (error.status === 403) {
      return '/forbidden'
    }
    // Log error and proceed anyway (or return false)
    console.error('Access validation failed:', error)
    return false
  }
})
```

## 要点

1. **更喜欢基于返回的语法** - 更干净，不易出错，现代标准
2. **next() 必须仅调用一次** - 如果使用旧语法，请确保每个路径仅调用一次
3. **重定向后始终返回/退出** - 防止多个导航操作
4. **异步守卫自然地工作** - 只需返回重定向路由或什么也不返回
5. **测试所有代码路径** - 每个分支必须导致 return 或 next()

## 参考
- [Vue路由器导航卫士](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [RFC：从导航卫士中删除 next()](https://github.com/vuejs/rfcs/discussions/302)
