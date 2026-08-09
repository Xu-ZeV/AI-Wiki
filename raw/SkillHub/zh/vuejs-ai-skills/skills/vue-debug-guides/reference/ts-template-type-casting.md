---
title: 在联合类型模板中使用类型转换
impact: MEDIUM
impactDescription: Template expressions with union types cause TypeScript errors even when the runtime type is known
type: gotcha
tags: [typescript, templates, type-casting, union-types, script-setup]
---

# 在联合类型模板中使用类型转换

**影响：中** - 在 Vue 单文件组件中使用 `lang="ts"` 时，模板表达式会受到严格的类型检查。如果变量具有联合类型，则可能需要内联类型转换来访问特定于类型的方法或属性。

## 任务清单

- [ ] 使用 `(value as Type)` 语法在模板中进行类型转换
- [ ] 在模板中使用之前考虑缩小脚本中的类型
- [ ] 请记住模板类型检查需要 `lang="ts"` 属性
- [ ] 对于 Vue CLI/webpack：确保 vue-loader >= 16.8.0

## 问题

当变量具有联合类型时，TypeScript 在模板编译时无法知道它是哪种特定类型：

**有类型错误的模板：**
```vue
<script setup lang="ts">
// Union type: could be string OR number
let x: string | number = 1
</script>

<template>
  <!-- ERROR: Property 'toFixed' does not exist on type 'string | number' -->
  {{ x.toFixed(2) }}
</template>
```

TypeScript 正确识别出 `toFixed()` 仅存在于 `number`，而不是 `string`。

## 解决方案 1：内联类型转换

直接在模板中使用 `(value as Type)` 语法：

```vue
<script setup lang="ts">
let x: string | number = 1
</script>

<template>
  <!-- CORRECT: Cast to number to access toFixed -->
  {{ (x as number).toFixed(2) }}
</template>
```

## 解决方案 2：计算属性（首选）

创建一个缩小或转换类型的计算属性：

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const value = ref<string | number>(1)

const formattedValue = computed(() => {
  if (typeof value.value === 'number') {
    return value.value.toFixed(2)
  }
  return value.value
})
</script>

<template>
  <!-- Clean template, type-safe logic in script -->
  {{ formattedValue }}
</template>
```

## 解决方案 3：类型保护功能

定义类型保护并在模板中使用它：

```vue
<script setup lang="ts">
import { ref } from 'vue'

const data = ref<string | number | null>(null)

function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}

function formatNumber(val: number): string {
  return val.toFixed(2)
}
</script>

<template>
  <div v-if="isNumber(data)">
    {{ formatNumber(data) }}
  </div>
  <div v-else-if="data !== null">
    {{ data }}
  </div>
</template>
```

## 常见用例

### API 响应数据

```vue
<script setup lang="ts">
interface ApiResponse {
  status: 'success' | 'error'
  data?: UserData
  error?: string
}

const response = ref<ApiResponse | null>(null)
</script>

<template>
  <div v-if="response?.status === 'success'">
    <!-- Cast to access data safely -->
    {{ (response as { data: UserData }).data.name }}
  </div>
</template>
```

**更好的计算方法：**
```vue
<script setup lang="ts">
const userData = computed(() => {
  if (response.value?.status === 'success') {
    return response.value.data
  }
  return null
})
</script>

<template>
  <div v-if="userData">
    {{ userData.name }}
  </div>
</template>
```

### 具有事件类型的事件处理程序

```vue
<script setup lang="ts">
function handleInput(event: Event) {
  // Cast to HTMLInputElement to access 'value'
  const value = (event.target as HTMLInputElement).value
  console.log(value)
}
</script>

<template>
  <input @input="handleInput" />
</template>
```

### 数组项访问

```vue
<script setup lang="ts">
const items = ref<(string | number)[]>([1, 'two', 3])
</script>

<template>
  <ul>
    <li v-for="item in items" :key="item">
      <!-- Cast when you know the type -->
      <span v-if="typeof item === 'number'">
        Number: {{ (item as number).toFixed(1) }}
      </span>
      <span v-else>
        String: {{ (item as string).toUpperCase() }}
      </span>
    </li>
  </ul>
</template>
```

## 当需要类型转换时

|场景 |解决方案 |
|----------|----------|
|联盟类型 |转换为特定类型 |
|可空类型 |在空检查后使用可选的链接或强制转换 |
|活动目标|将 `event.target` 转换为特定元素类型 |
|数组方法 |当 TS 无法缩小数组项类型时进行强制转换 |

## 重要提示

### 模板类型检查要求

在以下情况下启用模板类型检查：
1.使用`<script lang="ts">`或`<script setup lang="ts">`
2. Vue 语言服务器 (Volar) 在您的 IDE 中处于活动状态
3. 对于 webpack：需要 vue-loader >= 16.8.0

### 避免过度铸造

如果您发现自己经常在模板中进行投射，请考虑：
- 将逻辑移至计算属性
- 在脚本部分使用类型保护
- 重构数据结构使其更加具体

## 参考

- [Vue.js TypeScript 概述 - 模板中的 TypeScript](https://vuejs.org/guide/typescript/overview.html#typescript-in-templates)
- [带有 Composition API 的 Vue.js TypeScript](https://vuejs.org/guide/typescript/composition-api.html)
