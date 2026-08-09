---
title: 导航卫士无限重定向循环
impact: HIGH
impactDescription: Misconfigured navigation guards can trap users in infinite redirect loops, crashing the browser or making the app unusable
type: gotcha
tags: [vue3, vue-router, navigation-guards, redirect, debugging]
---

# Navigation Guard 无限重定向循环

**影响：高** - 导航防护中的一个常见错误是创建导致无限重定向的条件。 Vue Router 会检测到这一点并显示警告，但在生产中，它可能会导致浏览器崩溃或造成用户体验不佳。

## 任务清单

- [ ] 在重定向之前始终检查是否已经在目标路线上
- [ ] 使用所有可能的导航场景测试防护逻辑
- [ ] 添加路由元来控制哪些路由需要保护
- [ ] 使用 Vue Router devtools 调试重定向链

## 问题

```javascript
// WRONG: Infinite loop - always redirects to login, even when on login!
router.beforeEach((to, from) => {
  if (!isAuthenticated()) {
    return '/login'  // Redirects to /login, which triggers guard again...
  }
})

// WRONG: Circular redirect between two routes
router.beforeEach((to, from) => {
  if (to.path === '/dashboard' && !hasProfile()) {
    return '/profile'
  }
  if (to.path === '/profile' && !isVerified()) {
    return '/dashboard'  // Back to dashboard, which goes to profile...
  }
})
```

**您将看到的错误：**
```
[Vue Router warn]: Detected an infinite redirection in a navigation guard when going from "/" to "/login". Aborting to avoid a Stack Overflow.
```

## 解决方案1：排除目标路由

```javascript
// CORRECT: Don't redirect if already going to login
router.beforeEach((to, from) => {
  if (!isAuthenticated() && to.path !== '/login') {
    return '/login'
  }
})

// CORRECT: Use route name for cleaner check
router.beforeEach((to, from) => {
  const publicPages = ['Login', 'Register', 'ForgotPassword']

  if (!isAuthenticated() && !publicPages.includes(to.name)) {
    return { name: 'Login' }
  }
})
```

## 解决方案 2：使用路由元字段

```javascript
// router.js
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/public',
    name: 'PublicPage',
    component: PublicPage,
    meta: { requiresAuth: false }
  }
]

// Guard checks meta field
router.beforeEach((to, from) => {
  // Only redirect if route requires auth
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})
```

## 解决方案 3：小心处理重定向链

```javascript
// CORRECT: Break potential circular redirects
router.beforeEach((to, from) => {
  // Prevent redirect loops by tracking redirect depth
  const redirectCount = to.query._redirectCount || 0

  if (redirectCount > 3) {
    console.error('Too many redirects, stopping at:', to.path)
    return '/error'  // Escape hatch
  }

  if (needsRedirect(to)) {
    return {
      path: getRedirectTarget(to),
      query: { ...to.query, _redirectCount: redirectCount + 1 }
    }
  }
})
```

## 解决方案 4：集中重定向逻辑

```javascript
// guards/auth.js
export function createAuthGuard(router) {
  const publicRoutes = new Set(['Login', 'Register', 'ForgotPassword', 'ResetPassword'])
  const guestOnlyRoutes = new Set(['Login', 'Register'])

  router.beforeEach((to, from) => {
    const isPublic = publicRoutes.has(to.name)
    const isGuestOnly = guestOnlyRoutes.has(to.name)
    const isLoggedIn = isAuthenticated()

    // Not logged in, trying to access protected route
    if (!isLoggedIn && !isPublic) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }

    // Logged in, trying to access guest-only route (like login page)
    if (isLoggedIn && isGuestOnly) {
      return { name: 'Dashboard' }
    }

    // All other cases: proceed
  })
}
```

## 调试重定向循环

```javascript
// Add logging to understand the redirect chain
router.beforeEach((to, from) => {
  console.log(`Navigation: ${from.path} -> ${to.path}`)
  console.log('Auth state:', isAuthenticated())
  console.log('Route meta:', to.meta)

  // Your guard logic here
})

// Or use afterEach for confirmed navigations
router.afterEach((to, from) => {
  console.log(`Navigated: ${from.path} -> ${to.path}`)
})
```

## 常见的重定向循环模式

|图案|问题 |修复 |
|---------|---------|-----|
|身份验证无排除 |登录重定向至登录 |从支票中排除 `/login` |
|基于角色的循环部门 |管理员 -> 用户 -> 管理员 |使用单一事实来源来满足角色要求 |
|入职流程 |步骤 1 -> 步骤 2 -> 步骤 1 |正确跟踪完成状态 |
|重定向查询处理 |读取重定向会创建新的重定向 |仅处理一次重定向 |

## 要点

1. **始终排除目标路由** - 永远不要重定向到会触发相同重定向的路由
2. **使用路由元字段** - 比路径字符串比较更清晰
3. **测试边缘情况** - 直接 URL 访问、刷新、后退按钮
4. **在开发期间添加日志记录** - 帮助跟踪重定向链
5. **有一个逃生舱口** - 错误页面或最大重定向计数

## 参考
- [Vue路由器导航卫士](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [Vue 路由器路由元字段](https://router.vuejs.org/guide/advanced/meta.html)
