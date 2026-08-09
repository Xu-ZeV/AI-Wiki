---
title: 虚拟化大型列表以避免 DOM 过载
impact: HIGH
impactDescription: Rendering thousands of list items creates excessive DOM nodes, causing slow renders and high memory usage
type: efficiency
tags: [vue3, performance, virtual-list, large-data, dom, optimization]
---

# 虚拟化大型列表以避免 DOM 过载

**影响：高** - 渲染大型列表（数百或数千）中的所有项目会创建大量 DOM 节点。每个节点都会消耗内存，减慢初始渲染速度，并使更新成本高昂。列表虚拟化仅渲染可见项目，从而显着提高性能。

处理可能超过 50-100 个项目的列表时，尤其是项目具有复杂内容时，请使用虚拟化库。

## 任务列表

- 识别呈现超过 50-100 个项目的列表
- 安装虚拟化库（vue-virtual-scroller，@tanstack/vue-virtual）
- 用虚拟化组件替换标准 `v-for`
- 确保列表项具有一致或可估计的高度
- 在开发过程中使用实际数据量进行测试

## 推荐的库

|图书馆 |最适合 |笔记|
|---------|----------|-------|
| `vue-virtual-scroller` |通用，设置简单 |最受欢迎、良好的默认设置 |
| `@tanstack/vue-virtual` |复杂的布局，无头 |与框架无关，灵活 |
| `vue-virtual-scroll-grid` |网格布局 | 2D 虚拟化 |
| `vueuc/VVirtualList` | Naive UI 项目 | Naive UI 生态系统的一部分 |

**不好：**
```vue
<template>
  <!-- BAD: Renders ALL 10,000 items immediately -->
  <div class="user-list">
    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import UserCard from './UserCard.vue'

const users = ref([])

onMounted(async () => {
  // 10,000 DOM nodes created, browser struggles
  users.value = await fetchAllUsers()
})
</script>
```

**好：**
```vue
<template>
  <!-- GOOD: Only renders ~20 visible items at a time -->
  <RecycleScroller
    class="user-list"
    :items="users"
    :item-size="80"
    key-field="id"
    v-slot="{ item }"
  >
    <UserCard :user="item" />
  </RecycleScroller>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import UserCard from './UserCard.vue'

const users = ref([])

onMounted(async () => {
  // 10,000 items in memory, but only ~20 DOM nodes
  users.value = await fetchAllUsers()
})
</script>

<style scoped>
.user-list {
  height: 600px; /* Container must have fixed height */
}
</style>
```

## 使用@tanstack/vue-virtual

```vue
<template>
  <div ref="parentRef" class="list-container">
    <div
      :style="{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative'
      }"
    >
      <div
        v-for="virtualRow in rowVirtualizer.getVirtualItems()"
        :key="virtualRow.key"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`
        }"
      >
        <UserCard :user="users[virtualRow.index]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

const users = ref([/* 10,000 users */])
const parentRef = ref(null)

const rowVirtualizer = useVirtualizer({
  count: users.value.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 80,  // Estimated row height
  overscan: 5  // Render 5 extra items above/below viewport
})
</script>

<style scoped>
.list-container {
  height: 600px;
  overflow: auto;
}
</style>
```

## 使用 vue-virtual-scroller 动态高度

```vue
<template>
  <!-- For variable height items, use DynamicScroller -->
  <DynamicScroller
    :items="messages"
    :min-item-size="54"
    key-field="id"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :data-index="index"
      >
        <ChatMessage :message="item" />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script setup>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
</script>
```

## 性能比较

|方法| 100 件 | 1,000 件商品 | 10,000 件商品 |
|----------|-----------|-------------|--------------|
|常规 v-for |约 100 个 DOM 节点 |约 1,000 个 DOM 节点 |约 10,000 个 DOM 节点 |
|虚拟化|约 20 个 DOM 节点 |约 20 个 DOM 节点 |约 20 个 DOM 节点 |
|初始渲染 |快|慢|非常慢/崩溃|
|虚拟化渲染 |快|快|快|

## 何时不进行虚拟化

- 列出 50 项以下且内容简单的项目
- 屏幕阅读器必须可以同时访问所有项目的列表
- 所有内容都必须呈现的打印布局
- SEO 关键内容必须采用初始 HTML 格式
