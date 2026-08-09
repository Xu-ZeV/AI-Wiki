---
title: 使用调试挂钩跟踪响应式问题
impact: MEDIUM
impactDescription: Debug hooks help identify which dependencies trigger re-renders and watcher executions
type: efficiency
tags: [vue3, reactivity, debugging, computed, watch, development]
---

# 使用调试挂钩来跟踪响应式问题

**影响：中** - Vue 提供了调试挂钩（`onTrack`、`onTrigger`、`renderTracked`、`renderTriggered`），帮助准确识别正在跟踪哪些响应式依赖项以及哪些突变触发重新执行。这些对于调试性能问题和意外的重新渲染非常有价值。

调试挂钩仅在开发模式下工作，并在生产版本中被删除。使用它们来了解计算属性、观察器或组件为何重新执行。

## 任务清单

- [ ] 在计算/监视上使用 `onTrack` 和 `onTrigger` 选项进行粒度调试
- [ ] 使用 `onRenderTracked` 和 `onRenderTriggered` 生命周期挂钩进行组件渲染调试
- [ ] 在钩子内添加 `debugger` 语句以暂停执行并检查状态
- [ ] 在生产前删除或注释掉调试钩子（它们是无操作的，但会增加混乱）

> **注意：** `onTrack` 和 `onTrigger` 是仅供开发的挂钩。它们被从生产版本中剥离，并且可能不会在测试环境（例如 Vitest、Jest）中触发，具体取决于 Vue 的捆绑方式。如果您需要验证测试中的响应式行为，请对响应式状态更改使用直接断言，而不是依赖这些调试回调。

**调试计算属性：**
```javascript
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2, {
  onTrack(event) {
    // Called when a dependency is tracked
    // event.target = the reactive object
    // event.key = the property being accessed
    debugger
    console.log('Tracking:', event)
  },
  onTrigger(event) {
    // Called when a dependency mutation triggers re-computation
    debugger
    console.log('Triggered by:', event)
  }
})
```

**调试侦听器：**
```javascript
import { ref, watch, watchEffect } from 'vue'

const source = ref(0)

// With watch()
watch(source, (newVal, oldVal) => {
  console.log('Changed:', oldVal, '->', newVal)
}, {
  onTrack(e) {
    debugger // Pause to see what's being tracked
  },
  onTrigger(e) {
    debugger // Pause to see what triggered the watcher
  }
})

// With watchEffect()
watchEffect(() => {
  console.log('Source is:', source.value)
}, {
  onTrack(e) {
    console.log('Tracking dependency:', e.key)
  },
  onTrigger(e) {
    console.log('Triggered by:', e.key, 'mutation')
  }
})
```

**调试组件渲染：**
```vue
<script setup>
import { onRenderTracked, onRenderTriggered, ref } from 'vue'

const count = ref(0)

// Called for every reactive dependency accessed during render
onRenderTracked((event) => {
  console.log('Render tracked:', event.key, 'from', event.target)
  debugger // Pause to inspect which dependencies are tracked
})

// Called when a reactive dependency triggers re-render
onRenderTriggered((event) => {
  console.log('Render triggered by:', event.key)
  console.log('Old value:', event.oldValue)
  console.log('New value:', event.newValue)
  debugger // Pause to see exactly what caused the re-render
})
</script>
```

**选项 API 等效项：**
```javascript
export default {
  data() {
    return { count: 0 }
  },
  renderTracked(event) {
    console.log('Dependency tracked during render:', event)
    debugger
  },
  renderTriggered(event) {
    console.log('Re-render triggered by:', event)
    debugger
  }
}
```

**调试事件属性：**
```javascript
// The event object contains:
{
  effect: ReactiveEffect,  // The effect being debugged
  target: object,          // The reactive object
  type: 'get' | 'set' | 'add' | 'delete' | 'clear',
  key: string | symbol,    // The property being accessed/mutated
  oldValue: any,           // Previous value (for onTrigger)
  newValue: any            // New value (for onTrigger)
}
```

## 参考
- [Vue.js 深度响应式 - 调试](https://vuejs.org/guide/extras/reactivity-in-depth.html#reactivity-debugging)
- [Vue.js 计算() API](https://vuejs.org/api/reactivity-core.html#computed)
- [Vue.js onRenderTracked()](https://vuejs.org/api/composition-api-lifecycle.html#onrendertracked)
