# 不要将 DefineAsyncComponent 与 Vue Router 一起使用

## 规则

配置 Vue Router 路由组件时切勿使用 `defineAsyncComponent`。 Vue Router 有自己的延迟加载机制，直接使用动态导入。

## 为什么这很重要

Vue Router 的延迟加载是专门为路由级别的代码分割而设计的。对路线使用 `defineAsyncComponent` 会增加不必要的开销，并可能导致导航防护、加载状态和路线转换出现意外行为。

## 错误代码

```javascript
import { defineAsyncComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/dashboard',
      // WRONG: Don't use defineAsyncComponent here
      component: defineAsyncComponent(() =>
        import('./views/Dashboard.vue')
      )
    },
    {
      path: '/profile',
      // WRONG: This also won't work as expected
      component: defineAsyncComponent({
        loader: () => import('./views/Profile.vue'),
        loadingComponent: LoadingSpinner
      })
    }
  ]
})
```

## 好的代码

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/dashboard',
      // CORRECT: Use dynamic import directly
      component: () => import('./views/Dashboard.vue')
    },
    {
      path: '/profile',
      // CORRECT: Simple arrow function with import
      component: () => import('./views/Profile.vue')
    }
  ]
})
```

## 使用 Vue Router 处理加载状态

对于路由级别的加载状态，请使用 Vue Router 的导航守卫或全局加载指示器：

```vue
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

router.beforeEach(() => {
  isLoading.value = true
})

router.afterEach(() => {
  isLoading.value = false
})
</script>

<template>
  <LoadingBar v-if="isLoading" />
  <RouterView />
</template>
```

## 何时使用defineAsyncComponent

使用 `defineAsyncComponent` 用于：
- 页面内有条件加载的组件
- 并不总是需要的重型部件
- 按需加载的模式对话框或面板

使用 Vue Router 的延迟加载用于：
- 路由级组件（视图/页面）
- 路由定义中配置的任何组件

## 要点

1.Vue Router 和 `defineAsyncComponent` 是独立的延迟加载机制
2. 路由组件应使用直接动态导入：`() => import('./View.vue')`
3.使用导航守卫作为路线级加载指示器
4. `defineAsyncComponent` 用于页面内组件级延迟加载

## 参考文献

- [Vue Router延迟加载路由](https://router.vuejs.org/guide/advanced/lazy-loading.html)
- [Vue.js 异步组件文档](https://vuejs.org/guide/components/async)
