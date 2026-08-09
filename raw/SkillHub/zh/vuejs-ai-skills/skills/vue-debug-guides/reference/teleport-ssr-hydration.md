---
title: 小心处理Teleport SSR 水合
impact: HIGH
impactDescription: Teleported content causes hydration mismatches in SSR/SSG applications
type: gotcha
tags: [vue3, teleport, ssr, nuxt, hydration]
---

# 小心处理Teleport SSR 水合

**影响：高** - 在 SSR 期间Teleport需要特殊处理。Teleport的内容不是服务器渲染的 HTML 字符串的一部分，导致水合作用不匹配，从而可能破坏应用程序或导致内容消失。

对于 Nuxt、Quasar SSR 和自定义 Vue SSR 设置来说，这是一个关键问题。

## 任务清单

- [ ] 将 Teleport 封装在 `<ClientOnly>` 组件 (Nuxt) 中，用于仅客户端渲染
- [ ] 对非 Nuxt SSR 使用基于安装状态的条件渲染
- [ ] 在 Vue 3.5+ 中故意使用 `data-allow-mismatch` 属性
- [ ] 彻底测试 SSR 应用程序的水合作用问题

**问题 - SSR 水合作用不匹配：**
```vue
<template>
  <!-- Server renders nothing for teleported content -->
  <!-- Client expects teleported content at #modals -->
  <!-- = Hydration mismatch -->
  <Teleport to="#modals">
    <div v-if="showModal" class="modal">
      Modal content
    </div>
  </Teleport>
</template>
```

常见错误信息：
```
[Vue warn]: Hydration children mismatch in <div>:
server rendered element contains fewer child nodes than client vdom.
```

**解决方案 1 - Nuxt 客户端：**
```vue
<template>
  <button @click="showModal = true">Open Modal</button>

  <!-- Only render on client, avoiding SSR -->
  <ClientOnly>
    <Teleport to="body">
      <div v-if="showModal" class="modal">
        Modal content
      </div>
    </Teleport>
  </ClientOnly>
</template>
```

**解决方案 2 - 手动客户端检测：**
```vue
<template>
  <button @click="showModal = true">Open Modal</button>

  <!-- Only render after component mounts on client -->
  <Teleport v-if="isMounted" to="body">
    <div v-if="showModal" class="modal">
      Modal content
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showModal = ref(false)
const isMounted = ref(false)

onMounted(() => {
  isMounted.value = true
})
</script>
```

**解决方案 3 - Vue 3.5+ 数据允许不匹配：**
```vue
<template>
  <!-- Suppress hydration warnings for intentional mismatches -->
  <div data-allow-mismatch>
    <Teleport to="body">
      <div v-if="showModal" class="modal">
        Modal content
      </div>
    </Teleport>
  </div>
</template>
```

## 具有多个Teleport功能的 SSR

多次Teleport到同一目标可能会导致额外的水合作用问题：

```vue
<!-- Parent.vue -->
<template>
  <!-- First teleport -->
  <Teleport to="#modals">
    <NotificationBanner />
  </Teleport>

  <ChildComponent />
</template>

<!-- ChildComponent.vue -->
<template>
  <!-- Second teleport to same target - order matters! -->
  <Teleport to="#modals">
    <Modal />
  </Teleport>
</template>
```

对于 SSR，请确保订购一致或将每个包装在 `ClientOnly` 中。

## Element Plus 和 UI 库 SSR

许多 UI 库在内部使用 Teleport。使用 Teleport 的 Element Plus 组件包括：
- 埃尔对话
- 抽屉柜
- El工具提示
- 电子下拉菜单
- 埃尔选择
- ElDatePicker

```vue
<template>
  <!-- These need special SSR handling -->
  <ClientOnly>
    <ElDialog v-model="visible">
      Dialog content
    </ElDialog>
  </ClientOnly>
</template>
```

## 已知的 Vue 问题

- 碎片中禁用的Teleport可能会导致水合作用不匹配（Vue 问题＃6152）
- 嵌套Teleport可能会导致应用程序因水合而中断（Vue 问题 #5242）

## 参考
- [Vue.js SSR - Teleport](https://vuejs.org/guide/scaling-up/ssr.html#teleports)
- [元素加SSR指南](https://element-plus.org/en-US/guide/ssr.html)
- [Nuxt客户端仅组件](https://nuxt.com/docs/api/components/client-only)
