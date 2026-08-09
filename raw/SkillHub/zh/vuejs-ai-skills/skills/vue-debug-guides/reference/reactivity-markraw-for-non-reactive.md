---
title: 对不应该反应的对象使用 markRaw()
impact: MEDIUM
impactDescription: Library instances, DOM nodes, and complex objects cause overhead and bugs when wrapped in Vue proxies
type: efficiency
tags: [vue3, reactivity, markRaw, performance, external-libraries, dom]
---

# 对不应该反应的对象使用 markRaw()

**影响：中** - Vue 的 `markRaw()` 告诉反应系统永远不要将对象包装在代理中。将其用于库实例、DOM 节点、具有内部状态的类实例以及 Vue 不应跟踪的复杂对象。这可以防止不必要的代理开销，并避免双重代理带来的细微错误。

如果没有 `markRaw()`，将这些对象置于反应状态会导致 Vue 将它们包装在代理中，这可能会破坏库内部结构，导致身份问题，并在不需要更改跟踪的对象上浪费内存。

## 任务清单

- [ ] 将 `markRaw()` 用于第三方库实例（地图、图表、编辑器）
- [ ] 使用 `markRaw()` 存储在反应状态下的 DOM 元素
- [ ] 对管理自己状态的类实例使用 `markRaw()`
- [ ] 对于永远不会改变的大型静态数据使用 `markRaw()`
- [ ] 请记住：markRaw 仅影响根级别 - 嵌套对象仍可能被代理

**错误：**
```javascript
import { reactive, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import * as monaco from 'monaco-editor'

// WRONG: Library instances wrapped in Proxy
const state = reactive({
  map: new mapboxgl.Map({ container: 'map' }),  // Proxied!
  editor: monaco.editor.create(element, {}),    // Proxied!
})

// Problems:
// 1. Library's internal this references may break
// 2. Unnecessary memory overhead
// 3. Methods may not work correctly through proxy
// 4. Performance degradation

// WRONG: DOM elements in reactive state
const elements = reactive({
  container: document.getElementById('app'),  // Proxied DOM node!
})
```

**正确：**
```javascript
import { reactive, markRaw, shallowRef } from 'vue'
import mapboxgl from 'mapbox-gl'
import * as monaco from 'monaco-editor'

// CORRECT: Mark library instances as raw
const state = reactive({
  map: markRaw(new mapboxgl.Map({ container: 'map' })),
  editor: markRaw(monaco.editor.create(element, {})),
})

// CORRECT: Or use shallowRef for mutable references
const map = shallowRef(null)
onMounted(() => {
  map.value = markRaw(new mapboxgl.Map({ container: 'map' }))
})

// CORRECT: Large static data
const geoJsonData = markRaw(await fetch('/huge-geojson.json').then(r => r.json()))
const state = reactive({
  mapData: geoJsonData  // Won't be proxied
})
```

**具有内部状态的类实例：**
```javascript
import { markRaw, reactive } from 'vue'

class WebSocketManager {
  constructor(url) {
    this.socket = new WebSocket(url)
    this.listeners = new Map()
  }

  on(event, callback) {
    this.listeners.set(event, callback)
  }
}

// CORRECT: Mark class instance
const wsManager = markRaw(new WebSocketManager('ws://example.com'))

const state = reactive({
  connection: wsManager  // Won't be proxied
})

// Can still use the instance normally
state.connection.on('message', handleMessage)
```

**问题：markRaw 仅影响根级别：**
```javascript
import { markRaw, reactive } from 'vue'

const rawObject = markRaw({
  nested: { value: 1 }  // This nested object is NOT marked raw
})

const state = reactive({
  data: rawObject
})

// rawObject itself won't be proxied
// But if you access nested objects through a reactive parent:
const container = reactive({ raw: rawObject })
// container.raw.nested might still be proxied in some cases

// SAFER: Use shallowRef for the container
import { shallowRef } from 'vue'
const safeContainer = shallowRef(rawObject)
```

**与shallowRef结合以获得最佳结果：**
```javascript
import { shallowRef, markRaw, onMounted, onUnmounted } from 'vue'

// Pattern: shallowRef + markRaw for external library instances
export function useMapbox(containerId) {
  const map = shallowRef(null)

  onMounted(() => {
    const instance = new mapboxgl.Map({
      container: containerId,
      style: 'mapbox://styles/mapbox/streets-v11'
    })

    // Mark raw to prevent any proxy wrapping
    map.value = markRaw(instance)
  })

  onUnmounted(() => {
    map.value?.remove()
  })

  return { map }
}
```

## 参考
- [Vue.js markRaw() API](https://vuejs.org/api/reactivity-advanced.html#markraw)
- [Vue.js 减少响应式开销](https://vuejs.org/guide/best-practices/performance.html#reduce-reactivity-overhead-for-large-immutable-structures)
- [Vue.js 深度反应](https://vuejs.org/guide/extras/reactivity-in-depth.html)
