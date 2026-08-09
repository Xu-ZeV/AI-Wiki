---
title: 仅在安装 Hook 后才访问 DOM
impact: HIGH
impactDescription: Accessing DOM elements before mounted causes undefined errors and silent failures
type: capability
tags: [vue3, vue2, lifecycle, dom, mounted, created, beforeMount, template-refs]
---

# 仅在挂载 Hook 后才访问 DOM

**影响：高** - 尝试访问 `created` 或 `beforeMount` 挂钩中的 DOM 元素或 `this.$el` 失败，因为组件的模板尚未呈现到 DOM。这会导致未定义的错误、空引用和第三方库初始化失败。

组件的 DOM 仅在 `mounted` 挂钩（选项 API）开始或 `onMounted` 运行（组合 API）后可用。在此之前，`this.$el` 未定义，模板引用为空。

## 任务清单

- [ ] 仅在 `mounted`/`onMounted` 或更高版本中执行 DOM 操作
- [ ] 在挂载中初始化依赖于 DOM 的库（图表、地图、编辑器）
- [ ] 使用`created`进行数据初始化和API调用（非DOM操作）
- [ ] 仅在安装后才访问模板 ref
- [ ] 如果在响应式数据更改后需要 DOM，请使用 `$nextTick`

**错误：**
```javascript
// WRONG: Accessing DOM in created hook
export default {
  created() {
    // DOM doesn't exist yet!
    console.log(this.$el) // undefined
    this.$el.querySelector('.chart') // Error: Cannot read property 'querySelector' of undefined

    // Third-party library initialization fails
    new Chart(document.getElementById('myChart')) // Element doesn't exist yet
  }
}
```

```javascript
// WRONG: Accessing DOM in beforeMount
export default {
  beforeMount() {
    // Still too early - template is compiled but not mounted
    console.log(this.$el) // undefined in Vue 3
    this.$refs.myInput.focus() // Error: Cannot read property 'focus' of undefined
  }
}
```

```vue
<!-- WRONG: Accessing template ref synchronously in setup -->
<script setup>
import { ref } from 'vue'

const myInput = ref(null)

// This runs during setup, before mounting
myInput.value.focus() // Error: Cannot read property 'focus' of null
</script>

<template>
  <input ref="myInput" />
</template>
```

**正确：**
```javascript
// CORRECT: Use created for data, mounted for DOM
export default {
  data() {
    return { chartData: null }
  },
  async created() {
    // Data fetching is fine in created
    this.chartData = await fetchChartData()
  },
  mounted() {
    // Now the DOM exists and is safe to access
    console.log(this.$el) // <div>...</div>

    // Initialize DOM-dependent libraries
    this.chart = new Chart(this.$refs.chartCanvas, {
      data: this.chartData
    })
  }
}
```

```vue
<!-- CORRECT: Access template refs in onMounted -->
<script setup>
import { ref, onMounted } from 'vue'

const myInput = ref(null)

onMounted(() => {
  // DOM is now available
  myInput.value.focus() // Works!
})
</script>

<template>
  <input ref="myInput" />
</template>
```

```javascript
// CORRECT: Using $nextTick for DOM access after data changes
export default {
  methods: {
    async addItem() {
      this.items.push(newItem)

      // Wait for Vue to update the DOM
      await this.$nextTick()

      // Now the new element exists in DOM
      this.$refs.list.lastElementChild.scrollIntoView()
    }
  }
}
```

## Vue 3 组合 API 模式

```vue
<script setup>
import { ref, onMounted, nextTick } from 'vue'

const listRef = ref(null)
const items = ref([])

onMounted(() => {
  // Safe to access DOM here
  listRef.value.style.height = '400px'
})
</script>
```

## Vue 3.5+ useTemplateRef 模式

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

// Vue 3.5+ recommended approach - decouples ref name from variable name
const input = useTemplateRef('my-input')

onMounted(() => {
  input.value.focus()
})
</script>

<template>
  <input ref="my-input" />
</template>
```

## 与 nextTick 组合 API

```vue
<script setup>
import { ref, nextTick } from 'vue'

const listRef = ref(null)
const items = ref([])

async function addItem(item) {
  items.value.push(item)

  // Wait for DOM update after reactive change
  await nextTick()

  // Now new item is in DOM
  listRef.value.lastElementChild.focus()
}
</script>

<template>
  <ul ref="listRef">
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>
```

## 常用第三方库

```javascript
// CORRECT: Initialize in mounted
export default {
  mounted() {
    // Chart.js
    this.chart = new Chart(this.$refs.canvas, config)

    // Leaflet maps
    this.map = L.map(this.$refs.mapContainer).setView([51.505, -0.09], 13)

    // Monaco Editor
    this.editor = monaco.editor.create(this.$refs.editorContainer, options)

    // Video.js
    this.player = videojs(this.$refs.videoElement)
  },
  beforeUnmount() {
    // Don't forget cleanup!
    this.chart?.destroy()
    this.map?.remove()
    this.editor?.dispose()
    this.player?.dispose()
  }
}
```

## 参考
- [Vue.js 生命周期挂钩](https://vuejs.org/guide/essentials/lifecycle.html)
- [Vue.js 模板 ref](https://vuejs.org/guide/essentials/template-refs.html)
- [Vue.js nextTick](https://vuejs.org/api/general.html#nexttick)
