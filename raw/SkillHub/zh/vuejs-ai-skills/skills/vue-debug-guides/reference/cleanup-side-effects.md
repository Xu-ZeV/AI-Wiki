---
title: 清理 onUnmounted 中的事件侦听器和间隔
impact: HIGH
impactDescription: Failing to clean up side effects causes memory leaks and ghost event handlers
type: capability
tags: [vue3, lifecycle, memory-leak, event-listeners, intervals, cleanup]
---

# 清理 onUnmounted 中的事件监听器和间隔

**影响：高** - 组件卸载时未能清理事件侦听器、间隔、超时和订阅会导致内存泄漏和幽灵处理程序继续运行，从而导致单页应用程序中的性能下降和细微错误。

使用自定义事件、计时器、WebSocket 连接或第三方库时，请始终在 `onUnmounted`（组合 API）或 `unmounted`（选项 API）中进行清理。

## 任务清单

- [ ] 跟踪所有 addEventListener 调用并在 onUnmounted 中删除它们
- [ ] 清除 onUnmounted 中的所有 setInterval 和 setTimeout 调用
- [ ] 取消订阅外部事件emits器和可观察对象
- [ ] 断开WebSocket连接和第三方库实例
- [ ] 如果必须在 DOM 删除之前进行清理，请使用 `onBeforeUnmount`

**错误：**
```javascript
// Composition API - WRONG: No cleanup
import { onMounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      // These keep running after component unmounts!
      window.addEventListener('resize', handleResize)
      setInterval(pollServer, 5000)
      socket.on('message', handleMessage)
    })
  }
}
```

```javascript
// Options API - WRONG: No cleanup
export default {
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    this.timer = setInterval(this.refresh, 10000)
  }
  // Component unmounts, but listeners and timers persist!
}
```

**正确：**
```javascript
// Composition API - CORRECT: Proper cleanup
import { onMounted, onUnmounted, ref } from 'vue'

export default {
  setup() {
    const intervalId = ref(null)

    const handleResize = () => {
      // handle resize
    }

    const handleMessage = (msg) => {
      // handle message
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
      intervalId.value = setInterval(pollServer, 5000)
      socket.on('message', handleMessage)
    })

    onUnmounted(() => {
      // Clean up everything!
      window.removeEventListener('resize', handleResize)

      if (intervalId.value) {
        clearInterval(intervalId.value)
      }

      socket.off('message', handleMessage)
    })
  }
}
```

```javascript
// Options API - CORRECT: Proper cleanup
export default {
  data() {
    return {
      timer: null
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
    this.timer = setInterval(this.refresh, 10000)
  },
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll)
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    handleScroll() { /* ... */ },
    refresh() { /* ... */ }
  }
}
```

## 使用可组合模式进行自动清理

```javascript
// Reusable composable with automatic cleanup
import { onMounted, onUnmounted } from 'vue'

export function useEventListener(target, event, handler) {
  onMounted(() => {
    target.addEventListener(event, handler)
  })

  onUnmounted(() => {
    target.removeEventListener(event, handler)
  })
}

export function useInterval(callback, delay) {
  let intervalId = null

  onMounted(() => {
    intervalId = setInterval(callback, delay)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })
}

// Usage - cleanup is automatic
import { useEventListener, useInterval } from './composables'

export default {
  setup() {
    useEventListener(window, 'resize', handleResize)
    useInterval(pollServer, 5000)
    // No manual cleanup needed!
  }
}
```

## Vue 使用替代方案

```javascript
// VueUse provides cleanup-aware composables
import { useEventListener, useIntervalFn } from '@vueuse/core'

export default {
  setup() {
    // Automatically cleaned up on unmount
    useEventListener(window, 'resize', handleResize)

    const { pause, resume } = useIntervalFn(pollServer, 5000)
    // Also provides pause/resume controls
  }
}
```

## 参考
- [Vue.js 生命周期挂钩](https://vuejs.org/guide/essentials/lifecycle.html)
- [Vue使用-useEventListener](https://vueuse.org/core/useEventListener/)
