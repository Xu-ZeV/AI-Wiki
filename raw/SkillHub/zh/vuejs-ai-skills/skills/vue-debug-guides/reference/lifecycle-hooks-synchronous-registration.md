---
title: 在设置过程中同步注册生命周期挂钩
impact: HIGH
impactDescription: Asynchronously registered lifecycle hooks will never execute
type: capability
tags: [vue3, composition-api, lifecycle, onMounted, onUnmounted, async, setup]
---

# 在设置过程中同步注册生命周期钩子子

**影响：高** - 异步注册的生命周期钩子子（例如，在 setTimeout 内，await 之后）永远不会被调用，因为 Vue 无法将它们与组件实例关联。这会导致静默失败，预期的初始化或清理代码永远不会运行。

在 Vue 3 的 Composition API 中，像 `onMounted`、`onUnmounted`、`onUpdated` 等生命周期钩子子必须在组件设置期间同步注册。钩子注册不需要按词法位于 `setup()` 或 `<script setup>` 内，但调用堆栈必须是同步的并且源自安装程序内。

## 任务清单

- [ ] 在 setup() 或 `<script setup>` 的顶层注册所有生命周期钩子子
- [ ] 切勿在 setTimeout、setInterval 或 Promise 回调中注册钩子
- [ ] 调用使用生命周期钩子子的可组合函数时，同步调用它们
- [ ] 如果从设置同步调用，挂钩可以位于外部函数中

**错误：**
```javascript
// WRONG: Hook registered asynchronously - will NEVER execute
import { onMounted } from 'vue'

export default {
  async setup() {
    // After await, we're in a different call stack
    const data = await fetchInitialData()

    // This hook will NOT be registered!
    onMounted(() => {
      console.log('This will never run')
    })
  }
}
```

```javascript
// WRONG: Hook registered in setTimeout - will NEVER execute
import { onMounted } from 'vue'

export default {
  setup() {
    setTimeout(() => {
      // This is asynchronous - hook won't be registered!
      onMounted(() => {
        initializeChart()
      })
    }, 100)
  }
}
```

```javascript
// WRONG: Hook registered in Promise callback
import { onMounted } from 'vue'

export default {
  setup() {
    fetchConfig().then(() => {
      // Asynchronous! This will silently fail
      onMounted(() => {
        applyConfig()
      })
    })
  }
}
```

**正确：**
```javascript
// CORRECT: Hook registered synchronously at top level
import { onMounted, ref } from 'vue'

export default {
  setup() {
    const data = ref(null)

    // Register hook synchronously FIRST
    onMounted(async () => {
      // Async operations are fine INSIDE the hook
      data.value = await fetchInitialData()
      initializeChart()
    })

    return { data }
  }
}
```

```vue
<!-- CORRECT: <script setup> - hooks at top level -->
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const isReady = ref(false)

// These are synchronous during script setup execution
onMounted(() => {
  isReady.value = true
})

onUnmounted(() => {
  cleanup()
})
</script>
```

```javascript
// CORRECT: Hook in external function called synchronously from setup
import { onMounted, onUnmounted } from 'vue'

function useWindowResize(callback) {
  // This is fine - it's called synchronously from setup
  onMounted(() => {
    window.addEventListener('resize', callback)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', callback)
  })
}

export default {
  setup() {
    // Composable called synchronously - hooks will be registered
    useWindowResize(handleResize)
  }
}
```

## 允许多个 Hook

```javascript
// CORRECT: You can register the same hook multiple times
import { onMounted } from 'vue'

export default {
  setup() {
    // Both will run, in order of registration
    onMounted(() => {
      initializeA()
    })

    onMounted(() => {
      initializeB()
    })
  }
}
```

## 参考
- [Vue.js 生命周期挂钩](https://vuejs.org/guide/essentials/lifecycle.html)
- [组合 API 生命周期挂钩](https://vuejs.org/api/composition-api-lifecycle.html)
