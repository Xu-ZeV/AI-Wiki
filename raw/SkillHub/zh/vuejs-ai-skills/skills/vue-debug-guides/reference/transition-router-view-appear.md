---
title: RouterView 转换始终应用，尽管缺少出现 Prop
impact: LOW
impactDescription: Initial page load with RouterView triggers transition animation even without the appear prop due to async navigation
type: gotcha
tags: [vue3, transition, vue-router, appear, initial-load, navigation]
---

# RouterView 转换始终应用，尽管缺少出现 Prop

**影响：低** - 当将 `<Transition>` 与 Vue Router 的 `<RouterView>` 一起使用时，即使您尚未添加 `appear` 属性，输入过渡动画也会在初始页面加载时运行。这与初始渲染动画需要 `appear` 的正常过渡行为不同。发生这种情况是因为 Vue Router 的导航是异步的，导致组件在初始渲染后安装。

## 任务清单

- [ ] 请注意，RouterView 转换始终在初始加载时呈现动画
- [ ] 如果您希望在初始加载时没有动画，则需要明确处理此问题
- [ ] 不要添加 `appear` 属性期望它改变行为 - 它已经有效启用
- [ ] 考虑您的用户体验是否需要初始动画

**预期行为（正常转换）：**
```vue
<template>
  <!-- Without appear: No animation on initial render -->
  <Transition name="fade">
    <div v-if="show">Content</div>
  </Transition>

  <!-- With appear: Animates on initial render -->
  <Transition name="fade" appear>
    <div v-if="show">Content</div>
  </Transition>
</template>
```

**RouterView 行为（不同！）：**
```vue
<template>
  <!-- RouterView transitions ALWAYS animate on initial load -->
  <!-- The appear prop has no effect here -->
  <RouterView v-slot="{ Component }">
    <Transition name="fade">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<!--
On initial page load:
1. Vue renders the app
2. Router resolves the route (async)
3. Component mounts AFTER initial render
4. Enter transition triggers (as if toggled from v-if="false" to v-if="true")
-->
```

## 为什么会发生这种情况

Vue Router 导航是异步的。顺序是：

1.Vue应用程序使用空的RouterView挂载
2. Router解析初始路由
3.将路由组件插入到RouterView中
4.本次插入触发enter转换

由于该组件在初始渲染中不存在，并且是在之后“插入”的，因此 Vue 将其视为正常的输入转换，而不是初始渲染。

## 如果你想禁用初始动画

```vue
<template>
  <RouterView v-slot="{ Component }">
    <Transition :name="isInitialLoad ? '' : 'fade'" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isInitialLoad = ref(true)
const router = useRouter()

// After first navigation completes, enable transitions
router.isReady().then(() => {
  // Small delay to ensure initial render is complete
  setTimeout(() => {
    isInitialLoad.value = false
  }, 0)
})
</script>
```

## 替代方案：使用 CSS 跳过第一个动画

```vue
<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" :class="{ 'skip-initial': isInitialLoad }" />
    </Transition>
  </RouterView>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isInitialLoad = ref(true)
const router = useRouter()

router.isReady().then(() => {
  isInitialLoad.value = false
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Skip animation on initial load */
.skip-initial.fade-enter-active {
  transition: none;
}
</style>
```

## 标准 RouterView 转换模式

如果您对初始动画（通常需要）感到满意，请使用标准模式：

```vue
<template>
  <RouterView v-slot="{ Component, route }">
    <Transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Route-specific transitions via meta */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>
```

```javascript
// router.js
const routes = [
  {
    path: '/',
    component: Home
  },
  {
    path: '/about',
    component: About,
    meta: { transition: 'slide' }  // Custom transition for this route
  }
]
```

## 参考
- [Vue 路由器转换](https://router.vuejs.org/guide/advanced/transitions.html)
- [Vue.js 过渡出现](https://vuejs.org/guide/built-ins/transition.html#transition-on-appear)
