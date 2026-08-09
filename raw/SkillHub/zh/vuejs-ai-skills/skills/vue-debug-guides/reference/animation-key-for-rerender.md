---
title: 使用关键属性强制重新渲染动画
impact: MEDIUM
impactDescription: Without key attributes, Vue reuses DOM elements and animation libraries like AutoAnimate cannot detect changes to animate
type: gotcha
tags: [vue3, animation, key, autoanimate, rerender, dom]
---

# 使用关键属性强制重新渲染动画

**影响：中** - Vue 通过尽可能重用 DOM 元素来优化性能。但是，这种优化可以防止动画库（如 AutoAnimate）检测更改，因为元素是就地更新而不是重新创建。添加 `:key` 属性会强制 Vue 将更改的元素视为新元素，从而触发适当的动画。

## 任务清单

- [ ] 将 `:key` 添加到内容更改时应动画的元素
- [ ] 使用唯一的、不断变化的键值（不是索引）
- [ ] 对于路由转换，将 `:key="$route.fullPath"` 添加到 `<router-view>`
- [ ] 将 `v-auto-animate` 应用于键控子元素的父元素

**有问题的代码：**
```vue
<template>
  <!-- BAD: Text changes but no animation occurs -->
  <div v-auto-animate>
    <p>{{ message }}</p>  <!-- No key - element is reused -->
  </div>

  <!-- BAD: Image source changes but no animation -->
  <div v-auto-animate>
    <img :src="imageUrl" />  <!-- No key - element is reused -->
  </div>

  <!-- BAD: Route changes don't animate -->
  <router-view v-auto-animate />  <!-- No key -->
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello')
const imageUrl = ref('/images/photo1.jpg')

// Changing these won't trigger animations because
// Vue updates the existing elements rather than replacing them
</script>
```

**正确代码：**
```vue
<template>
  <!-- GOOD: Key forces re-render, triggering animation -->
  <div v-auto-animate>
    <p :key="message">{{ message }}</p>
  </div>

  <!-- GOOD: Image animates when source changes -->
  <div v-auto-animate>
    <img :key="imageUrl" :src="imageUrl" />
  </div>

  <!-- GOOD: Route changes animate properly -->
  <router-view :key="$route.fullPath" v-auto-animate />
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello')
const imageUrl = ref('/images/photo1.jpg')

// Now changing these will trigger animations
function updateMessage() {
  message.value = 'World'  // Triggers enter animation for new <p>
}
</script>
```

## 为什么这有效

当 Vue 看到 `:key` 更改时：
1.它认为旧元素和新元素是不同的
2.旧元素被移除（触发离开动画）
3.创建一个新元素（触发进入动画）

没有 `:key`：
1.Vue在相同位置看到相同的元素类型
2.它就地更新元素的属性
3.没有发生DOM添加/删除，因此没有动画触发

## 常见用例

### 动画文本内容变化

```vue
<template>
  <div v-auto-animate>
    <h1 :key="title">{{ title }}</h1>
    <p :key="description">{{ description }}</p>
  </div>
</template>
```

### 动画动态组件

```vue
<template>
  <div v-auto-animate>
    <component :is="currentComponent" :key="currentComponent" />
  </div>
</template>
```

### 动画路线转换

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <div v-auto-animate>
      <component :is="Component" :key="route.fullPath" />
    </div>
  </router-view>
</template>
```

## 使用 Vue 的内置转换

同样的原理也适用于 Vue 的 `<Transition>` 组件：

```vue
<template>
  <!-- GOOD: Key triggers transition on content change -->
  <Transition name="fade" mode="out-in">
    <p :key="message">{{ message }}</p>
  </Transition>

  <!-- GOOD: Different keys for conditional content -->
  <Transition name="fade" mode="out-in">
    <div v-if="isLoading" key="loading">Loading...</div>
    <div v-else key="content">{{ content }}</div>
  </Transition>
</template>
```

## 注意：性能影响

使用 `:key` 强制重新创建完整的组件。对于频繁更改的数据：
- 键控元素下的整个组件树被销毁并重新创建
- 任何组件状态都会丢失
- 考虑动画是否值得性能成本

```vue
<!-- Be cautious with complex components -->
<ComplexDashboard :key="refreshTrigger" />
<!-- This destroys and recreates the entire dashboard! -->
```

## 参考
- [Vue.js动画技术](https://vuejs.org/guide/extras/animation.html)
- [使用 Vue 自动动画](https://auto-animate.formkit.com/#usage-vue)
- [Vue.js v-for 带键](https://vuejs.org/guide/essentials/list.html#maintaining-state-with-key)
