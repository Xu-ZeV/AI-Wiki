---
title: 将 Vue Router 库用于生产应用程序
impact: LOW
impactDescription: Simple hash routing lacks essential features for production SPAs; Vue Router provides navigation guards, lazy loading, and proper history management
type: best-practice
tags: [vue3, vue-router, spa, production, architecture]
---

# 将 Vue Router 库用于生产应用程序

**影响：低** - 虽然您可以通过哈希更改和动态组件实现基本路由，但官方 Vue Router 库应该用于任何生产单页应用程序。它提供了一些基本功能，例如导航防护、嵌套路由、延迟加载和正确的浏览器历史记录集成，这些功能手动实现起来既乏味又容易出错。

## 任务清单

- [ ] 为生产 SPA 安装 Vue Router
- [ ] 仅将简单路由用于学习或小型原型
- [ ] 利用内置功能：守卫、延迟加载、元字段
- [ ] 考虑基于路由器的状态和数据加载模式

## 当简单路由可以接受时

```vue
<!-- Only for: learning, prototypes, or micro-apps with 2-3 pages -->
<script setup>
import { ref, computed } from 'vue'
import Home from './Home.vue'
import About from './About.vue'

const routes = { '/': Home, '/about': About }
const currentPath = ref(window.location.hash.slice(1) || '/')

window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash.slice(1) || '/'
})

const currentView = computed(() => routes[currentPath.value])
</script>

<template>
  <nav>
    <a href="#/">Home</a>
    <a href="#/about">About</a>
  </nav>
  <component :is="currentView" />
</template>
```

## 为什么使用 Vue Router 进行生产

### 您必须手动实现的功能

|特色|简单的路由| Vue 路由器 |
|---------|---------------|------------|
|导航卫士|手动，容易出错|内置、可组合 |
|嵌套路线 |实施起来复杂 |原生支持 |
|路线参数|手动解析 |自动提取|
|延迟加载|动态导入 DIY |内置代码分割 |
|历史记录模式（干净的 URL）|需要服务器配置+手册 |内置|
|滚动行为 |手册|可配置|
|路线转换 | DIY |与过渡集成 |
|活动链接样式 |手动类别切换 | `router-link-active` 级 |
|程序化导航 | `location.hash = ...` | `router.push()`、`router.replace()` |
|路由元字段 |不适用 |内置|

## 使用 Vue Router 进行生产设置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),  // Lazy loaded
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue')
      }
    ]
  },
  {
    path: '/users/:id',
    name: 'UserProfile',
    component: () => import('@/views/UserProfile.vue'),
    props: true  // Pass params as props
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// Global navigation guard
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

export default router
```

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <nav>
    <router-link to="/">Home</router-link>
    <router-link to="/dashboard">Dashboard</router-link>
  </nav>

  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>
```

## 现代 Vue 路由器功能 (2025+)

```javascript
// Data Loading API (Vue Router 4.2+)
const routes = [
  {
    path: '/users/:id',
    component: UserProfile,
    // Load data at route level
    loader: async (route) => {
      return { user: await fetchUser(route.params.id) }
    }
  }
]

// View Transitions API integration
const router = createRouter({
  // Enable native browser view transitions
  // Requires browser support (Chrome 111+)
})
```

## 要点

1. **将 Vue Router 用于原型之外的任何应用程序** - 这些功能至关重要
2. **简单路由是为了学习** - 理解概念，然后使用库
3. **延迟加载对于包大小至关重要** - Vue Router 使其变得微不足道
4. **导航守卫可防止安全问题** - 很难手动纠正
5. **历史模式需要 Vue Router** - 干净的 URL 需要正确处理
6. **新功能不断推出** - 数据加载 API、视图转换

## 参考
- [Vue.js路由指南](https://vuejs.org/guide/scaling-up/routing.html)
- [Vue 路由器文档](https://router.vuejs.org/)
- 【Vue路由器入门】(https://router.vuejs.org/guide/)
