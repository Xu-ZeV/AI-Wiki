---
title: 确保在计算属性中访问所有依赖项
impact: HIGH
impactDescription: Conditional logic can prevent dependency tracking causing stale computed values
type: capability
tags: [vue3, computed, reactivity, dependency-tracking, gotcha]
---

# 确保在计算属性中访问所有依赖项

**影响：高** - Vue 通过监视执行期间访问哪些响应式属性来跟踪计算属性依赖关系。如果条件逻辑阻止在第一次运行时访问某个属性，Vue 将不会将其作为依赖项进行跟踪，从而导致计算属性在该属性更改时不会更新。

这是一个微妙但常见的错误来源，特别是在短路评估（`&&`、`||`）和提前返回的情况下。

## 任务清单

- [ ] 在任何条件逻辑之前访问所有响应式依赖项
- [ ] 小心可能会跳过属性访问的短路运算符（`&&`、`||`）
- [ ] 将所有依赖项存储在计算 getter 开头的变量中
- [ ] 测试具有不同初始状态的计算属性

**错误：**
```vue
<script setup>
import { ref, computed } from 'vue'

const isEnabled = ref(false)
const data = ref('important data')

// BAD: If isEnabled is false initially, data.value is never accessed
// Vue won't track 'data' as a dependency!
const result = computed(() => {
  if (!isEnabled.value) {
    return 'disabled'
  }
  return data.value  // This dependency may not be tracked
})

// BAD: Short-circuit prevents second access
const password = ref('')
const confirmPassword = ref('')

const isValid = computed(() => {
  // If password is empty, confirmPassword is never accessed
  return password.value && password.value === confirmPassword.value
})

// BAD: Early return prevents dependency access
const user = ref(null)
const permissions = ref(['read', 'write'])

const canEdit = computed(() => {
  if (!user.value) {
    return false  // permissions.value never accessed when user is null
  }
  return permissions.value.includes('write')
})
</script>
```

**正确：**
```vue
<script setup>
import { ref, computed } from 'vue'

const isEnabled = ref(false)
const data = ref('important data')

// GOOD: Access all dependencies first
const result = computed(() => {
  const enabled = isEnabled.value
  const currentData = data.value  // Always accessed

  if (!enabled) {
    return 'disabled'
  }
  return currentData
})

// GOOD: Access both values before comparison
const password = ref('')
const confirmPassword = ref('')

const isValid = computed(() => {
  const pwd = password.value
  const confirm = confirmPassword.value  // Always accessed

  return pwd && pwd === confirm
})

// GOOD: Access all reactive sources upfront
const user = ref(null)
const permissions = ref(['read', 'write'])

const canEdit = computed(() => {
  const currentUser = user.value
  const currentPermissions = permissions.value  // Always accessed

  if (!currentUser) {
    return false
  }
  return currentPermissions.includes('write')
})
</script>
```

## 依赖跟踪机制

Vue 的响应式系统通过跟踪计算属性运行时访问哪些响应式属性来工作：

```javascript
// How Vue tracks dependencies (simplified):
// 1. Start tracking
// 2. Run the getter function
// 3. Record every .value or reactive property access
// 4. Stop tracking

const computed = computed(() => {
  // Vue starts tracking here
  if (conditionA.value) {      // conditionA is tracked
    return valueB.value        // valueB is ONLY tracked if conditionA is true
  }
  return 'default'             // If conditionA is false, valueB is NOT tracked!
})
```

## 模式：首先解构所有依赖项

```javascript
// GOOD PATTERN: Destructure/access everything at the top
const result = computed(() => {
  // Access all potential dependencies
  const { user, settings, items } = toRefs(store)
  const userVal = user.value
  const settingsVal = settings.value
  const itemsVal = items.value

  // Now use conditional logic safely
  if (!userVal) return []
  if (!settingsVal.enabled) return []
  return itemsVal.filter(i => i.active)
})
```

## 参考
- [Vue.js 深度反应](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [GitHub 讨论：带有条件的依赖集合问题](https://github.com/vuejs/Discussion/issues/15)
