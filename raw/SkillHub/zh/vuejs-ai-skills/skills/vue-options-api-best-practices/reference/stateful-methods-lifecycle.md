---
title: 在生命周期挂钩中创建有状态方法
impact: MEDIUM
impactDescription: Stateful functions like debounce/throttle in methods are shared across all component instances
type: capability
tags: [vue3, options-api, debounce, throttle, lifecycle, cleanup]
---

# 在生命周期挂钩中创建有状态方法

**影响：中** - 如果直接在 `methods` 选项中定义去抖、限制或其他有状态函数，则组件的所有实例共享相同的函数状态。这会导致组件列表中出现竞争条件和错误。

当组件被重用时（例如，在 v-for 中），每个实例都需要自己的去抖/节流函数。在 `created()` 钩子中定义它们并在 `unmounted()` 中清理它们以防止内存泄漏。

## 任务清单

- [ ] 切勿直接在 `methods` 中定义去抖/节流功能
- [ ] 在 `created()` 生命周期钩子子中创建有状态函数
- [ ] 始终在 `unmounted()` 中清理（取消计时器）

**错误：**
```javascript
import { debounce } from 'lodash-es'

export default {
  methods: {
    // WRONG: All component instances share this debounced function!
    // If used in a v-for, clicking one button affects all instances
    handleClick: debounce(function() {
      this.performSearch()
    }, 500)
  }
}
```

**正确：**
```javascript
import { debounce } from 'lodash-es'

export default {
  created() {
    // CORRECT: Each instance gets its own debounced function
    this.debouncedSearch = debounce(this.performSearch, 500)
  },
  unmounted() {
    // CORRECT: Clean up to prevent memory leaks and stale calls
    this.debouncedSearch.cancel()
  },
  methods: {
    handleClick() {
      this.debouncedSearch()
    },
    performSearch() {
      // Actual search logic
    }
  }
}
```

## 参考
- [Vue.js 响应式基础 - 有状态方法](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#stateful-methods)
