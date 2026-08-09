---
title: 每条路由 beforeEnter 守卫忽略参数/查询更改
impact: MEDIUM
impactDescription: Route-level beforeEnter guards don't fire when only params, query, or hash change, causing unexpected bypasses of validation logic
type: gotcha
tags: [vue3, vue-router, navigation-guards, params, query]
---

# 每条路由 beforeEnter 守卫忽略参数/查询更改

**影响：中度** - 路由配置中定义的 `beforeEnter` 防护仅在从不同路由进入路由时才会触发。对同一路由中的参数、查询字符串或哈希的更改不会触发 `beforeEnter`，从而可能绕过重要的验证逻辑。

## 任务清单

- [ ] 使用组件内 `onBeforeRouteUpdate` 进行参数/查询更改
- [ ] 或者使用全局 `beforeEach` 进行route.params/query检查
- [ ] 记录哪些警卫保护哪些场景
- [ ] 测试具有不同参数的同一路线之间的导航

## 问题

```javascript
// router.js
const routes = [
  {
    path: '/orders/:id',
    component: OrderDetail,
    beforeEnter: async (to, from) => {
      // This runs when entering from /products
      // But NOT when navigating from /orders/1 to /orders/2!
      const order = await checkOrderAccess(to.params.id)
      if (!order.canView) {
        return '/unauthorized'
      }
    }
  }
]
```

**场景：**
1. 用户从 `/products` 导航到 `/orders/1` - beforeEnter 运行，访问检查
2. 用户从 `/orders/1` 导航到 `/orders/2` - beforeEnter 不运行！
3. 用户可能会访问他们没有权限的订单！

## Enter 之前触发的内容与不触发的内容

|导航 |进入火力之前？ |
|------------|-------------------|
| `/products` → `/orders/1` |是 |
| `/orders/1` → `/orders/2` |否 |
| `/orders/1` → `/orders/1?tab=details` |否 |
| `/orders/1#section` → `/orders/1#other` |否 |
| `/orders/1` → `/products` → `/orders/2` |是（离开并重新进入）|

## 解决方案 1：添加组件内防护

```vue
<!-- OrderDetail.vue -->
<script setup>
import { onBeforeRouteUpdate } from 'vue-router'

// Handle param changes within the same route
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    const order = await checkOrderAccess(to.params.id)
    if (!order.canView) {
      return '/unauthorized'
    }
  }
})
</script>
```

## 解决方案 2：使用 Global beforeEach 代替

```javascript
// router.js
router.beforeEach(async (to, from) => {
  // Handle all order access checks globally
  if (to.name === 'OrderDetail') {
    // This runs on EVERY navigation to this route, including param changes
    const order = await checkOrderAccess(to.params.id)
    if (!order.canView) {
      return '/unauthorized'
    }
  }
})
```

## 解决方案 3：结合两个防护

```javascript
// router.js - For entering from different route
const routes = [
  {
    path: '/orders/:id',
    component: OrderDetail,
    beforeEnter: (to) => validateOrderAccess(to.params.id)
  }
]

// In component - For param changes within route
// OrderDetail.vue
onBeforeRouteUpdate((to) => validateOrderAccess(to.params.id))

// Shared validation function
async function validateOrderAccess(orderId) {
  const order = await checkOrderAccess(orderId)
  if (!order.canView) {
    return '/unauthorized'
  }
}
```

## 解决方案 4：将 beforeEnter 与 Array of Guards 一起使用

```javascript
// guards/orderGuards.js
export const orderAccessGuard = async (to) => {
  const order = await checkOrderAccess(to.params.id)
  if (!order.canView) {
    return '/unauthorized'
  }
}

// router.js
const routes = [
  {
    path: '/orders/:id',
    component: OrderDetail,
    beforeEnter: [orderAccessGuard]  // Can add multiple guards
  }
]

// Still need in-component guard for param changes!
```

## 完整的导航卫士执行顺序

了解每种防护类型何时触发：

```
1. beforeRouteLeave (in-component, leaving component)
2. beforeEach (global)
3. beforeEnter (per-route, ONLY when entering from different route)
4. beforeRouteEnter (in-component, entering component)
5. beforeResolve (global)
6. afterEach (global, after navigation confirmed)

For param/query changes on same route:
1. beforeRouteUpdate (in-component) - ONLY this fires!
2. beforeEach (global)
3. beforeResolve (global)
4. afterEach (global)
```

## 要点

1. **beforeEnter 仅适用于路线 ENTRY** - 不适用于路线内更改
2. **使用 onBeforeRouteUpdate 进行参数更改** - 这是组件内解决方案
3. **Global beforeEach 始终运行** - 适合集中验证
4. **测试参数更改场景** - 开发过程中容易错过
5. **考虑安全影响** - 基于参数的访问控制需要两个防护

## 参考
- [Vue路由器导航卫士](https://router.vuejs.org/guide/advanced/navigation-guards.html)
- [Vue路由器每路由守卫](https://router.vuejs.org/guide/advanced/navigation-guards.html#per-route-guard)
