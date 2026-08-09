---
title: 使用shallowRef进行动态组件引用
impact: MEDIUM
impactDescription: Storing components in reactive() or ref() triggers Vue warnings and can cause performance issues
type: gotcha
tags: [typescript, shallowRef, dynamic-components, reactivity, performance]
---

# 使用shallowRef进行动态组件引用

**影响：中度** - 当将 Vue 组件存储在反应状态以进行动态渲染时，使用 `ref()` 或 `reactive()` 会导致 Vue 警告和不必要的响应式开销。请改用 `shallowRef()`。

## 任务清单

- [ ] 使用 `shallowRef` 存储组件引用
- [ ] 在反应对象中存储组件时使用 `markRaw`
- [ ] 避免用深度响应式包装组件定义
- [ ] 检查控制台是否有“[Vue warn]：Vue 收到了一个被设为响应式对象的组件”

## 问题

Vue 组件是具有内部属性的对象，不应使其成为响应式的。当您将组件存储在 `ref()` 或 `reactive()` 中时，Vue 会深度遍历所有属性，这会：

1. 触发控制台警告
2.创建不必要的反应代理
3. 可能会导致组件身份的微妙错误
4.影响性能

**不正确 - 对组件使用 ref()：**
```typescript
import { ref } from 'vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

// BAD: Vue will warn about making component reactive
const currentComponent = ref(ComponentA)

function switchComponent() {
  currentComponent.value = ComponentB
}
```

**控制台警告：**
```
[Vue warn]: Vue received a Component that was made a reactive object.
This can lead to unnecessary performance overhead and should be avoided
by marking the component with `markRaw` or using `shallowRef` instead of `ref`.
```

## 解决方案1：使用shallowRef

`shallowRef` 仅使 `.value` 参考反应，而不是内容：

```typescript
import { shallowRef, type Component } from 'vue'
import ComponentA from './ComponentA.vue'
import ComponentB from './ComponentB.vue'

// CORRECT: shallowRef doesn't deep-proxy the component
const currentComponent = shallowRef<Component>(ComponentA)

function switchComponent() {
  currentComponent.value = ComponentB
}
```

```vue
<template>
  <component :is="currentComponent" />
</template>
```

## 解决方案 2：在响应式对象中使用 markRaw

当组件是较大反应对象的一部分时：

```typescript
import { reactive, markRaw, type Component } from 'vue'
import TabHome from './TabHome.vue'
import TabProfile from './TabProfile.vue'
import TabSettings from './TabSettings.vue'

interface Tab {
  name: string
  component: Component
}

// CORRECT: markRaw prevents reactivity on component objects
const tabs = reactive<Tab[]>([
  { name: 'Home', component: markRaw(TabHome) },
  { name: 'Profile', component: markRaw(TabProfile) },
  { name: 'Settings', component: markRaw(TabSettings) }
])

const activeTab = shallowRef<Tab>(tabs[0])
```

```vue
<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      @click="activeTab = tab"
    >
      {{ tab.name }}
    </button>
  </div>
  <component :is="activeTab.component" />
</template>
```

## TypeScript 打字

为了获得动态组件的正确 TypeScript 支持：

```typescript
import { shallowRef, type Component, type DefineComponent } from 'vue'

// Generic component type
const currentComponent = shallowRef<Component | null>(null)

// Or more specific with props
interface MyComponentProps {
  title: string
}

const currentComponent = shallowRef<DefineComponent<MyComponentProps> | null>(null)
```

## 使用shallowRef 进行动态导入

使用动态导入进行代码分割时：

```typescript
import { shallowRef, defineAsyncComponent, type Component } from 'vue'

const currentComponent = shallowRef<Component | null>(null)

async function loadComponent(name: string) {
  const component = defineAsyncComponent(
    () => import(`./components/${name}.vue`)
  )
  currentComponent.value = component
}
```

## 组件注册表模式

对于选项卡系统或类似向导的界面：

```typescript
import { shallowRef, markRaw, type Component } from 'vue'

// Type-safe component registry
const componentRegistry = {
  home: markRaw(defineAsyncComponent(() => import('./Home.vue'))),
  about: markRaw(defineAsyncComponent(() => import('./About.vue'))),
  contact: markRaw(defineAsyncComponent(() => import('./Contact.vue')))
} as const

type ComponentKey = keyof typeof componentRegistry

const currentView = shallowRef<ComponentKey>('home')

// Computed to get current component
const currentComponent = computed(() => componentRegistry[currentView.value])
```

```vue
<template>
  <component :is="currentComponent" />
</template>
```

## 何时使用每种方法

|场景 |解决方案 |
|----------|----------|
|单个动态组件参考| `shallowRef` |
|响应式数组/对象中的组件 |组件上的 `markRaw` |
|组件图/注册表 | `markRaw` 各组件 |
|异步组件 | `defineAsyncComponent` + `shallowRef` |

## 常见错误

### 错误 1：使用带有 ref 的计算

```typescript
// BAD: Still triggers warning
const components = ref([ComponentA, ComponentB])
const current = computed(() => components.value[index.value])

// GOOD: Use shallowRef for the array
const components = shallowRef([ComponentA, ComponentB])
```

### 错误 2：忘记地图中的 markRaw

```typescript
// BAD: Components in map become reactive
const routes = reactive(new Map([
  ['home', HomeComponent],
  ['about', AboutComponent]
]))

// GOOD: Mark each component as raw
const routes = reactive(new Map([
  ['home', markRaw(HomeComponent)],
  ['about', markRaw(AboutComponent)]
]))
```

## 参考

- [Vue.js 深度响应式 - 减少响应式开销](https://vuejs.org/guide/extras/reactivity-in-depth.html#reducing-reactivity-overhead-for-large-immutable-structures)
- [Vue.js API - 浅参考](https://vuejs.org/api/reactivity-advanced.html#shallowref)
- [Vue.js API - markRaw](https://vuejs.org/api/reactivity-advanced.html#markraw)
