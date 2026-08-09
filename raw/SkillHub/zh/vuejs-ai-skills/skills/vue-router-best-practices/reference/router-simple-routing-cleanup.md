---
title: 简单的哈希路由需要事件侦听器清理
impact: MEDIUM
impactDescription: When implementing basic routing without Vue Router, forgetting to remove hashchange listeners causes memory leaks and multiple handler execution
type: gotcha
tags: [vue3, routing, events, memory-leak, cleanup]
---

# 简单的哈希路由需要事件监听器清理

**影响：中** - 在没有 Vue Router 的情况下实现基本客户端路由（使用基于哈希的路由和 `hashchange` 事件）时，必须在组件卸载时清理事件侦听器。如果不这样做会导致内存泄漏，并可能导致在重新创建组件后触发多个处理程序。

## 任务清单

- [ ] 存储事件侦听器参考以进行清理
- [ ] 使用 onUnmounted 移除事件监听器
- [ ] 考虑使用 Vue Router 代替生产应用程序
- [ ] 测试组件安装/卸载周期

## 问题

```vue
<script setup>
import { ref, computed } from 'vue'
import Home from './Home.vue'
import About from './About.vue'

const routes = {
  '/': Home,
  '/about': About
}

const currentPath = ref(window.location.hash)

// BUG: Event listener is never removed!
// Each time this component mounts, a NEW listener is added
// After mounting 5 times, you have 5 listeners running
window.addEventListener('hashchange', () => {
  currentPath.value = window.location.hash
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/']
})
</script>
```

**发生了什么：**
1.组件挂载，添加监听器
2. 组件卸载（例如，路由更改、v-if 切换）
3. 组件再次安装，添加另一个监听器
4. 现在有两个监听器响应每个哈希更改
5.最终导致性能问题和内存泄漏

## 解决方案：使用 onUnmounted 进行适当的清理

```vue
<script setup>
import { ref, computed, onUnmounted } from 'vue'
import Home from './Home.vue'
import About from './About.vue'
import NotFound from './NotFound.vue'

const routes = {
  '/': Home,
  '/about': About
}

const currentPath = ref(window.location.hash)

// Store handler reference for cleanup
function handleHashChange() {
  currentPath.value = window.location.hash
}

// Add listener
window.addEventListener('hashchange', handleHashChange)

// CRITICAL: Remove listener on unmount
onUnmounted(() => {
  window.removeEventListener('hashchange', handleHashChange)
})

const currentView = computed(() => {
  return routes[currentPath.value.slice(1) || '/'] || NotFound
})
</script>
```

## 解决方案：使用选项 API

```vue
<script>
import Home from './Home.vue'
import About from './About.vue'
import NotFound from './NotFound.vue'

const routes = {
  '/': Home,
  '/about': About
}

export default {
  data() {
    return {
      currentPath: window.location.hash
    }
  },

  computed: {
    currentView() {
      return routes[this.currentPath.slice(1) || '/'] || NotFound
    }
  },

  mounted() {
    // Store bound handler for cleanup
    this.hashHandler = () => {
      this.currentPath = window.location.hash
    }
    window.addEventListener('hashchange', this.hashHandler)
  },

  beforeUnmount() {
    // Clean up
    window.removeEventListener('hashchange', this.hashHandler)
  }
}
</script>
```

## 解决方案：可组合用于可重用哈希路由

```javascript
// composables/useHashRouter.js
import { ref, computed, onUnmounted } from 'vue'

export function useHashRouter(routes, notFoundComponent = null) {
  const currentPath = ref(window.location.hash)

  function handleHashChange() {
    currentPath.value = window.location.hash
  }

  // Setup
  window.addEventListener('hashchange', handleHashChange)

  // Cleanup - handled automatically when component unmounts
  onUnmounted(() => {
    window.removeEventListener('hashchange', handleHashChange)
  })

  const currentView = computed(() => {
    const path = currentPath.value.slice(1) || '/'
    return routes[path] || notFoundComponent
  })

  function navigate(path) {
    window.location.hash = path
  }

  return {
    currentPath,
    currentView,
    navigate
  }
}
```

```vue
<!-- Usage -->
<script setup>
import { useHashRouter } from '@/composables/useHashRouter'
import Home from './Home.vue'
import About from './About.vue'
import NotFound from './NotFound.vue'

const { currentView } = useHashRouter({
  '/': Home,
  '/about': About
}, NotFound)
</script>

<template>
  <component :is="currentView" />
</template>
```

## 何时使用简单路由与 Vue Router

|使用简单哈希路由 |使用 Vue 路由器 |
|------------------------|----------------|
|学习/原型制作 |生产应用程序 |
|非常简单的应用程序（2-3 页）|需要嵌套路由 |
|没有可用的构建步骤 |需要导航卫士|
|捆绑尺寸至关重要 |需要延迟加载|
|仅限静态托管 |历史记录模式（干净的 URL）|

## 要点

1. **始终清理事件监听器** - 使用 onUnmounted 或 beforeUnmount
2. **存储处理程序引用** - 匿名函数无法删除
3. **考虑将 Vue Router 用于实际应用程序** - 它会自动处理清理
4. **测试卸载场景** - v-if 切换、热模块替换
5. **可组合函数有助于封装清理逻辑** - 可重用和自动

## 参考
- [Vue.js 路由文档](https://vuejs.org/guide/scaling-up/routing.html)
- [Vue路由器官方库](https://router.vuejs.org/)
