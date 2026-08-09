---
title: 路由参数更改不会触发生命周期挂钩
impact: HIGH
impactDescription: Navigating between routes with different params reuses the component instance, skipping created/mounted hooks and leaving stale data
type: gotcha
tags: [vue3, vue-router, lifecycle, params, reactivity]
---

# 路由参数更改不会触发生命周期挂钩

**影响：高** - 在使用相同组件的路由之间导航时（例如，`/users/1` 到 `/users/2`），Vue Router 会重用现有的组件实例以提高性能。这意味着 `onMounted`、`created` 和其他生命周期挂钩不会触发，从而为您留下来自先前路由的陈旧数据。

## 任务清单

- [ ] 在路由参数上使用 `watch` 来获取数据
- [ ] 或使用 `onBeforeRouteUpdate` 组件内防护装置
- [ ] 或者使用 `:key="route.params.id"` 强制重新创建（效率较低）
- [ ] 切勿仅依赖 `onMounted` 获取与路由参数相关的数据

## 问题

```vue
<!-- UserProfile.vue - Used for /users/:id -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = ref(null)

// BUG: Only runs once when component first mounts!
// Navigating from /users/1 to /users/2 does NOT trigger this
onMounted(async () => {
  user.value = await fetchUser(route.params.id)
})
</script>

<template>
  <div>
    <!-- Still shows User 1 data when navigating to /users/2! -->
    <h1>{{ user?.name }}</h1>
  </div>
</template>
```

**场景：**
1.访问`/users/1` - 组件挂载，获取用户1数据
2. 导航到 `/users/2` - 组件已重用，onMounted 未运行
3. UI仍然显示用户1的数据！

## 方案一：观察路由参数（推荐）

```vue
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const user = ref(null)
const loading = ref(false)

// Watch for param changes - handles both initial load and navigation
watch(
  () => route.params.id,
  async (newId) => {
    loading.value = true
    user.value = await fetchUser(newId)
    loading.value = false
  },
  { immediate: true }  // Run immediately for initial load
)
</script>
```

## 解决方案2：使用onBeforeRouteUpdate Guard

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()
const user = ref(null)

async function loadUser(id) {
  user.value = await fetchUser(id)
}

// Initial load
onMounted(() => loadUser(route.params.id))

// Handle param changes within same route
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    await loadUser(to.params.id)
  }
})
</script>
```

## 解决方案 3：使用密钥强制重新创建组件

```vue
<!-- App.vue or parent component -->
<template>
  <router-view :key="$route.fullPath" />
</template>
```

**权衡：**
- 简单但性能较差
- 在每次参数更改时销毁并重新创建组件
- 丢失组件状态
- 仅当组件状态应完全重置时使用

## 解决方案 4：可组合用于路由响应式数据

```javascript
// composables/useRouteData.js
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteData(paramName, fetcher) {
  const route = useRoute()
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  watch(
    () => route.params[paramName],
    async (id) => {
      if (!id) return

      loading.value = true
      error.value = null

      try {
        data.value = await fetcher(id)
      } catch (e) {
        error.value = e
      } finally {
        loading.value = false
      }
    },
    { immediate: true }
  )

  return { data, loading, error }
}
```

```vue
<!-- Usage in component -->
<script setup>
import { useRouteData } from '@/composables/useRouteData'
import { fetchUser } from '@/api/users'

const { data: user, loading, error } = useRouteData('id', fetchUser)
</script>
```

## 什么会触发，什么不会

|导航类型|生命周期钩子子 |路线更新前 |关注参数 |
|----------------|-----------------|-------------------|-----------------|
| `/users/1` 至 `/posts/1` |是 |否 |是 |
| `/users/1` 至 `/users/2` |否 |是 |是 |
| `/users/1?tab=a` 至 `/users/1?tab=b` |否 |是 |否（不同的手表）|
| `/users/1` 至 `/users/1`（相同）|否 |否 |否 |

## 要点

1. **相同的路由，不同的参数=相同的组件实例** - 这是性能优化
2. **生命周期钩子子仅触发一次** - 当组件首次安装时
3. **将 `watch` 与 `immediate: true` 结合使用** - 涵盖初始加载和更新
4. **`onBeforeRouteUpdate` 具有导航意识** - 适合在视图更新之前必须加载的数据
5. **`:key="route.fullPath"` 是大锤** - 仅在必要时使用

## 参考
- 【Vue路由器动态路由匹配】(https://router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes)
- [Vue School：响应参数更改](https://vueschool.io/lessons/reacting-to-param-changes)
