---
title: 快速更换期间，卸载挂钩可能不会在过渡内部触发
impact: MEDIUM
impactDescription: Components inside transitions can be destroyed without unmount hooks firing under race conditions
type: gotcha
tags: [vue3, lifecycle, transition, onUnmounted, unmounted, cleanup, race-condition]
---

# 快速更换期间，卸载挂钩可能不会在过渡内部触发

**影响：中度** - 当 `<transition>` 内的组件在转换加载阶段被另一个组件替换时，即使该组件已从 DOM 中删除，卸载挂钩（`onBeforeUnmount`、`onUnmounted`）也可能不会被调用。这可能会因不干净的副作用而导致内存泄漏和资源泄漏。

这是一种已知的边缘情况，当时间特定时会发生 - 如果在子组件仍在安装时替换了具有转换内子组件的父组件。子进程的安装钩子会触发，但卸载钩子永远不会触发。

## 任务清单

- [ ] 请注意，在转换内部不能 100% 保证卸载挂钩
- [ ] 对于关键清理，考虑替代清理策略
- [ ] 在转换上使用 `mode="out-in"` 以确保旧组件在新安装之前完全卸载
- [ ] 对于重要资源，请考虑在父组件级别进行清理
- [ ] 开发过程中测试组件更换场景

**有问题的场景：**
```vue
<!-- Parent component with lazy-loaded child in transition -->
<template>
  <transition>
    <Suspense>
      <component :is="currentComponent" />
    </Suspense>
  </transition>
</template>
```

```javascript
// Child component - unmount hooks may not fire if parent changes quickly
export default {
  setup() {
    const socket = new WebSocket('wss://example.com')

    onMounted(() => {
      console.log('Mounted - this will run')
      socket.connect()
    })

    onUnmounted(() => {
      // WARNING: This may NOT run if component is inside transition
      // and parent navigates away during mounting phase!
      console.log('Unmounted - might not run')
      socket.close()
    })
  }
}
```

**更安全的模式：**
```vue
<!-- SAFER: Use out-in mode to ensure proper sequencing -->
<template>
  <transition mode="out-in">
    <component :is="currentComponent" :key="currentKey" />
  </transition>
</template>
```

```javascript
// SAFER: Cleanup at parent level for critical resources
// Parent component
export default {
  setup() {
    const childSocket = ref(null)

    // Parent controls resource lifecycle
    provide('registerSocket', (socket) => {
      childSocket.value = socket
    })

    onUnmounted(() => {
      // Parent ensures cleanup even if child unmount hook doesn't fire
      childSocket.value?.close()
    })
  }
}

// Child component
export default {
  setup() {
    const registerSocket = inject('registerSocket')
    const socket = new WebSocket('wss://example.com')

    // Register with parent for backup cleanup
    registerSocket(socket)

    onMounted(() => {
      socket.connect()
    })

    onUnmounted(() => {
      socket.close() // Still attempt cleanup here
    })
  }
}
```

```javascript
// SAFER: Use AbortController pattern for cancellable operations
export default {
  setup() {
    const abortController = new AbortController()

    onMounted(() => {
      fetch('/api/data', { signal: abortController.signal })
        .then(handleData)
        .catch(err => {
          if (err.name !== 'AbortError') {
            handleError(err)
          }
        })
    })

    onUnmounted(() => {
      // If this doesn't fire, request continues but response is ignored
      // Not a memory leak - just potentially wasted network call
      abortController.abort()
    })
  }
}
```

## 针对此问题的测试

```javascript
// Test by rapidly switching components during async loading
async function testUnmountHooks() {
  // Mount component A (has async setup)
  await mountComponent('A')

  // Immediately switch to B before A finishes mounting
  await mountComponent('B')

  // Check if A's unmount hooks fired
  // They may not have!
}
```

## 参考
- [Vue.js GitHub 问题 #6260](https://github.com/vuejs/core/issues/6260)
- [Vue.js 过渡](https://vuejs.org/guide/built-ins/transition.html)
- [Vue.js 生命周期挂钩](https://vuejs.org/guide/essentials/lifecycle.html)
