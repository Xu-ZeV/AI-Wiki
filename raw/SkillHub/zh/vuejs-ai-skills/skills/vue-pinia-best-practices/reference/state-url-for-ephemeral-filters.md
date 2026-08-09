---
title: 使用可共享过滤器的 URL 状态而不是存储
impact: MEDIUM
impactDescription: Storing filter/search state only in stores loses state on refresh and prevents link sharing
type: best-practice
tags: [vue3, state-management, url, router, filters, ux, vue-router]
---

# 使用可共享过滤器的 URL 状态而不是存储

**影响：中度** - 仅在 Pinia 或组件状态中存储过滤器、搜索查询、分页和排序等临时 UI 状态意味着用户在页面刷新时会丢失该状态，并且无法共享指向特定过滤视图的链接。这会损害用户体验和搜索引擎优化。

对于表示数据“视图”的状态，请使用 URL 查询参数而不是存储或与存储一起使用。

## 任务清单

- [ ] 识别短暂的 UI 状态：过滤器、搜索、排序、分页、选项卡选择
- [ ] 将此类状态存储在 URL 查询参数中
- [ ] 将 URL 状态与组件/存储状态双向同步
- [ ] 考虑使用 VueUse 的 `useRouteQuery` 来实现类型安全的 URL 状态
- [ ] 保持 URL 状态最小且易于阅读

## 问题：仅存储状态

```vue
<script setup>
import { ref } from 'vue'
import { useProductStore } from '@/stores/products'

const productStore = useProductStore()

// Filter state in component/store only
const selectedCategory = ref('all')
const priceRange = ref([0, 1000])
const sortBy = ref('newest')
const searchQuery = ref('')

// Problems with this approach:
// 1. User refreshes page → filters reset to defaults
// 2. User bookmarks page → bookmark doesn't include filter state
// 3. User shares link → friend sees unfiltered view
// 4. Back button doesn't restore previous filter state
</script>
```

## 解决方案：基于 URL 的状态

```vue
<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Read filter state FROM URL
const selectedCategory = computed({
  get: () => route.query.category || 'all',
  set: (value) => updateQuery({ category: value === 'all' ? undefined : value })
})

const sortBy = computed({
  get: () => route.query.sort || 'newest',
  set: (value) => updateQuery({ sort: value === 'newest' ? undefined : value })
})

const searchQuery = computed({
  get: () => route.query.q || '',
  set: (value) => updateQuery({ q: value || undefined })
})

const page = computed({
  get: () => parseInt(route.query.page) || 1,
  set: (value) => updateQuery({ page: value === 1 ? undefined : value })
})

// Helper to update URL without full navigation
function updateQuery(newParams) {
  router.push({
    query: {
      ...route.query,
      ...newParams
    }
  })
}
</script>

<template>
  <div>
    <input v-model="searchQuery" placeholder="Search...">

    <select v-model="selectedCategory">
      <option value="all">All Categories</option>
      <option value="electronics">Electronics</option>
      <option value="clothing">Clothing</option>
    </select>

    <select v-model="sortBy">
      <option value="newest">Newest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
    </select>

    <!-- URL now looks like: /products?category=electronics&sort=price-low&q=phone -->
    <!-- Users can bookmark, share, and refresh without losing state -->
  </div>
</template>
```

## 使用 VueUse 实现更简洁的代码

VueUse 提供 `useRouteQuery` 来实现类型安全的 URL 状态：

```vue
<script setup>
import { useRouteQuery } from '@vueuse/router'

// Automatically syncs with URL query parameters
const category = useRouteQuery('category', 'all')
const sort = useRouteQuery('sort', 'newest')
const search = useRouteQuery('q', '')
const page = useRouteQuery('page', 1, { transform: Number })
const showOutOfStock = useRouteQuery('inStock', false, { transform: Boolean })

// Arrays work too
const selectedTags = useRouteQuery('tags', [], {
  transform: (v) => Array.isArray(v) ? v : v ? [v] : []
})
</script>

<template>
  <input v-model="search" placeholder="Search...">
  <select v-model="category">...</select>
  <input type="checkbox" v-model="showOutOfStock"> Show out of stock
</template>
```

## 混合方法：URL + store

对于复杂的状态，将 URL 与store同步：

```javascript
// stores/productFilters.js
import { defineStore } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'

export const useProductFiltersStore = defineStore('productFilters', () => {
  const route = useRoute()
  const router = useRouter()

  // Local reactive state
  const category = ref('all')
  const sortBy = ref('newest')
  const searchQuery = ref('')
  const page = ref(1)

  // Initialize from URL on store creation
  function initFromUrl() {
    category.value = route.query.category || 'all'
    sortBy.value = route.query.sort || 'newest'
    searchQuery.value = route.query.q || ''
    page.value = parseInt(route.query.page) || 1
  }

  // Sync state changes TO URL
  function syncToUrl() {
    router.replace({
      query: {
        category: category.value !== 'all' ? category.value : undefined,
        sort: sortBy.value !== 'newest' ? sortBy.value : undefined,
        q: searchQuery.value || undefined,
        page: page.value > 1 ? page.value : undefined
      }
    })
  }

  // Watch for URL changes (back/forward navigation)
  watch(() => route.query, initFromUrl, { immediate: true })

  // Watch for state changes and sync to URL
  watch([category, sortBy, searchQuery, page], syncToUrl)

  return {
    category,
    sortBy,
    searchQuery,
    page,
    initFromUrl
  }
})
```

## URL 与 Store 中的内容

|状态类型 |网址 |store |笔记|
|------------|-----|-------|-------|
|过滤器|是的 |可选|可共享、可添加书签 |
|搜索查询 |是的 |可选| SEO好处|
|分页|是的 |可选|深度链接 |
|排序顺序 |是的 |可选|用户期望 |
|选定的选项卡|是的 |可选|深度链接 |
|模态打开状态|也许|是的 |通常不可共享 |
|表格草稿|没有 |是的 |私人、临时 |
|用户会话|没有 |是的 |安全|
|购物车|没有 |是的 |需要坚持|

## URL 状态的好处

1. **可共享**：用户可以共享精确过滤的视图
2. **可添加书签**：保存特定搜索/过滤器
3. **浏览器历史记录**：后退/前进按预期工作
4. **SEO**：搜索引擎可以索引过滤后的页面
5. **刷新安全**：页面重新加载后状态仍然存在
6. **深层链接**：直接链接到特定状态

## 干净 URL 最佳实践

```javascript
// GOOD: Clean, readable URLs
/products?category=electronics&sort=price&q=phone

// AVOID: Overly complex URLs
/products?filters=%7B%22category%22%3A%22electronics%22%7D
```

```javascript
// Use defaults to keep URLs minimal
const sort = useRouteQuery('sort', 'newest')

// URL shows: /products (when using default sort)
// URL shows: /products?sort=price-low (when changed)
```

## 参考
- [Vue使用-useRouteQuery](https://vueuse.org/router/useRouteQuery/)
- [Vue路由器-查询参数](https://router.vuejs.org/guide/essentials/passing-props.html#passing-props-to-route-components)
- [掌握 Pinia - URL 状态](https://masteringpinia.com/blog/top-5-mistakes-to-avoid-when-using-pinia)
