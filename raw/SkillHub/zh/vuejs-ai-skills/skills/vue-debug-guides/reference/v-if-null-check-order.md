---
title: 在 v-if 中访问属性之前检查是否为空/未定义
impact: MEDIUM
impactDescription: Accessing properties on null/undefined causes runtime errors and crashes
type: capability
tags: [vue3, conditional-rendering, v-if, null-check, defensive-programming]
---

# 在 v-if 中访问属性之前检查是否为空/未定义

**影响：中度** - 在 `v-if` 条件下访问 null 或未定义对象的属性会导致“无法读取未定义的属性”运行时错误。当异步加载数据或在未进行 null 检查的情况下访问可选对象属性时，通常会发生这种情况。

## 任务清单

- [ ] 在访问对象的属性之前始终检查对象是否存在
- [ ] 在 Vue 3 模板中使用可选链接 (?.) 进行更清晰的 null 检查
- [ ] 考虑对复杂的条件逻辑使用计算属性
- [ ] 显式处理加载状态而不是依赖于未定义的检查

**错误：**
```html
<!-- WRONG: Accessing property before checking object exists -->
<template>
  <div v-if="user.isAdmin">
    Admin Panel
  </div>
  <!-- Error if user is null/undefined: Cannot read property 'isAdmin' of undefined -->
</template>
```

```html
<!-- WRONG: Nested property access without checks -->
<template>
  <div v-if="order.customer.address.city === 'NYC'">
    Local delivery available
  </div>
  <!-- Error if any level is undefined -->
</template>
```

```html
<!-- WRONG: Array access without existence check -->
<template>
  <div v-if="items[0].name === 'Featured'">
    {{ items[0].description }}
  </div>
  <!-- Error if items is empty array -->
</template>
```

**正确：**
```html
<!-- CORRECT: Check object exists first with && -->
<template>
  <div v-if="user && user.isAdmin">
    Admin Panel
  </div>
</template>
```

```html
<!-- CORRECT: Optional chaining (Vue 3) -->
<template>
  <div v-if="user?.isAdmin">
    Admin Panel
  </div>
</template>
```

```html
<!-- CORRECT: Optional chaining for nested properties -->
<template>
  <div v-if="order?.customer?.address?.city === 'NYC'">
    Local delivery available
  </div>
</template>
```

```html
<!-- CORRECT: Array length check before access -->
<template>
  <div v-if="items.length > 0 && items[0].name === 'Featured'">
    {{ items[0].description }}
  </div>

  <!-- Or with optional chaining -->
  <div v-if="items?.[0]?.name === 'Featured'">
    {{ items[0].description }}
  </div>
</template>
```

```html
<!-- CORRECT: Explicit loading state handling -->
<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="user">
    <h1>Welcome, {{ user.name }}</h1>
    <div v-if="user.isAdmin">Admin Panel</div>
  </div>
  <div v-else>No user data</div>
</template>
```

## 使用计算属性进行复杂检查

```javascript
// CORRECT: Move complex checks to computed properties
<script setup>
import { computed } from 'vue'

const props = defineProps(['user', 'permissions'])

const canAccessAdmin = computed(() => {
  return props.user?.isAdmin &&
         props.permissions?.includes('admin_panel') &&
         !props.user?.isDisabled
})

const userDisplayName = computed(() => {
  return props.user?.profile?.displayName ||
         props.user?.name ||
         'Anonymous'
})
</script>

<template>
  <div v-if="canAccessAdmin">
    Admin Panel
  </div>
  <span>{{ userDisplayName }}</span>
</template>
```

## 常见的异步数据模式

```javascript
// CORRECT: Handle async data loading properly
<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)
const isLoading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    user.value = await fetchUser()
  } catch (e) {
    error.value = e
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div v-if="isLoading">Loading user...</div>
  <div v-else-if="error">Failed to load user</div>
  <div v-else-if="user">
    <!-- Safe to access user properties here -->
    <h1>{{ user.name }}</h1>
    <p v-if="user.bio">{{ user.bio }}</p>
  </div>
</template>
```

## 参考
- [Vue.js 条件渲染](https://vuejs.org/guide/essentials/conditional.html)
- [MDN - 可选链接](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
