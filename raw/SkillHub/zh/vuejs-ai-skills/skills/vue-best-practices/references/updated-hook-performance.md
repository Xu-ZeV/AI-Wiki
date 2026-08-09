---
title: 避免更新的钩子中昂贵的操作
impact: MEDIUM
impactDescription: Heavy computations in updated hook cause performance bottlenecks and potential infinite loops
type: capability
tags: [vue3, vue2, lifecycle, updated, performance, optimization, reactivity]
---

# 避免更新的 Hook 中昂贵的操作

**影响：中** - `updated` 挂钩在每次导致重新渲染的响应式状态更改后运行。在此放置昂贵的操作、API 调用或状态突变可能会导致严重的性能下降、无限循环以及低于最佳 60fps 阈值的丢帧。

对于侦听器或计算属性无法处理的 DOM 更新后操作，请谨慎使用 `updated`/`onUpdated`。对于大多数响应式数据处理，更喜欢侦听器 (`watch`/`watchEffect`)，它可以更好地控制触发回调的内容。

## 任务列表

- 切勿在更新的钩子中执行 API 调用
- 切勿在更新内改变反应状态（导致无限循环）
- 在采取行动之前使用条件检查来验证更新是否相关
- 首选 `watch` 或 `watchEffect` 来响应特定数据更改
- 如果更新操作成本高昂，请使用节流/去抖动
- 为低级 DOM 同步任务保留更新

**不好：**
```javascript
// BAD: API call in updated - fires on every re-render
export default {
  data() {
    return { items: [], lastUpdate: null }
  },
  updated() {
    // This runs after every single state change!
    fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify(this.items)
    })
  }
}
```

```javascript
// BAD: State mutation in updated - infinite loop
export default {
  data() {
    return { renderCount: 0 }
  },
  updated() {
    // This causes another update, which triggers updated again!
    this.renderCount++ // Infinite loop
  }
}
```

```javascript
// BAD: Heavy computation on every update
export default {
  updated() {
    // Expensive operation runs on every keystroke, every state change
    this.processedData = this.heavyComputation(this.rawData)
    this.analytics = this.calculateMetrics(this.allData)
  }
}
```

**好：**
```javascript
import debounce from 'lodash-es/debounce'

// GOOD: Use watcher for specific data changes
export default {
  data() {
    return { items: [] }
  },
  watch: {
    // Only fires when items actually changes
    items: {
      handler(newItems) {
        this.syncToServer(newItems)
      },
      deep: true
    }
  },
  methods: {
    syncToServer: debounce(function(items) {
      fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(items)
      })
    }, 500)
  }
}
```

```vue
<!-- GOOD: Composition API with targeted watchers -->
<script setup>
import { ref, watch, onUpdated } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const items = ref([])
const scrollContainer = ref(null)

// Watch specific data - not all updates
watch(items, (newItems) => {
  syncToServer(newItems)
}, { deep: true })

const syncToServer = useDebounceFn((items) => {
  fetch('/api/sync', { method: 'POST', body: JSON.stringify(items) })
}, 500)

// Only use onUpdated for DOM synchronization
onUpdated(() => {
  // Scroll to bottom only if content changed height
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
})
</script>
```

```javascript
// GOOD: Conditional check in updated hook
export default {
  data() {
    return {
      content: '',
      lastSyncedContent: ''
    }
  },
  updated() {
    // Only act if specific condition is met
    if (this.content !== this.lastSyncedContent) {
      this.syncContent()
      this.lastSyncedContent = this.content
    }
  },
  methods: {
    syncContent: debounce(function() {
      // Sync logic
    }, 300)
  }
}
```

## 更新 Hook 的有效用例

```javascript
// GOOD: Low-level DOM synchronization
export default {
  updated() {
    // Sync third-party library with Vue's DOM
    this.thirdPartyWidget.refresh()

    // Update scroll position after content change
    this.$nextTick(() => {
      this.maintainScrollPosition()
    })
  }
}
```

## 优选派生数据的计算属性

```javascript
// BAD: Calculating derived data in updated
export default {
  data() {
    return { numbers: [1, 2, 3, 4, 5] }
  },
  updated() {
    this.sum = this.numbers.reduce((a, b) => a + b, 0) // Causes another update!
  }
}

// GOOD: Use computed property instead
export default {
  data() {
    return { numbers: [1, 2, 3, 4, 5] }
  },
  computed: {
    sum() {
      return this.numbers.reduce((a, b) => a + b, 0)
    }
  }
}
```
