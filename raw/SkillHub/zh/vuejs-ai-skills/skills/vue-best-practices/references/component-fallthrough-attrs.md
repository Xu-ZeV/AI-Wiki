---
title: 组件失效属性最佳实践
impact: MEDIUM
impactDescription: Incorrect $attrs access and reactivity assumptions can cause undefined values and watchers that never run
type: best-practice
tags: [vue3, attrs, fallthrough-attributes, composition-api, reactivity]
---

# 组件失效属性最佳实践

**影响：中** - 一旦您遵循 Vue 的约定，Fallthrough 属性就很简单：连字符名称使用方括号表示法，侦听器键为驼峰命名法 `onX`，并且 `useAttrs()` 是当前但不响应的。

## 任务列表

- 使用方括号表示法访问连字符属性名称（例如 `attrs['data-testid']`）
- 使用驼峰命名法 `onX` 键访问事件侦听器（例如 `attrs.onClick`）
- 不要从 `useAttrs()` 返回 `watch()` 值；这些侦听器不会因 attr 更改而触发
- 使用 `onUpdated()` 实现 attr 驱动的副作用
- 当需要响应式观察时，促进经常观察到的props属性

## 正确访问属性和监听器键

带连字符的属性名称在 JavaScript 中保留其原始大小写，因此点表示法不适用于包含 `-` 的键。

**不好：**
```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

console.log(attrs.data-testid)  // Syntax error
console.log(attrs.dataTestid)   // undefined for data-testid
console.log(attrs['on-click'])  // undefined
console.log(attrs['@click'])    // undefined
</script>
```

**好：**
```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

console.log(attrs['data-testid'])
console.log(attrs['aria-label'])
console.log(attrs['foo-bar'])

console.log(attrs.onClick)
console.log(attrs.onCustomEvent)
console.log(attrs.onMouseEnter)
</script>
```

### 命名参考

|家长使用 |访问 `attrs` |
|--------------|-------------------|
| `class="foo"` | `attrs.class` |
| `data-id="123"` | `attrs['data-id']` |
| `aria-label="..."` | `attrs['aria-label']` |
| `foo-bar="baz"` | `attrs['foo-bar']` |
| `@click="fn"` | `attrs.onClick` |
| `@custom-event="fn"` | `attrs.onCustomEvent` |
| `@update:modelValue="fn"` | `attrs['onUpdate:modelValue']` |

## `useAttrs()` 未反应

`useAttrs()` 始终反映最新值，但它故意不对侦听器跟踪做出反应。

**不好：**
```vue
<script setup>
import { watch, watchEffect, useAttrs } from 'vue'

const attrs = useAttrs()

watch(
  () => attrs.someAttr,
  (newValue) => {
    console.log('Changed:', newValue) // Never runs on attr changes
  }
)

watchEffect(() => {
  console.log(attrs.class) // Runs on setup, not on attr updates
})
</script>
```

**好：**
```vue
<script setup>
import { onUpdated, useAttrs } from 'vue'

const attrs = useAttrs()

onUpdated(() => {
  console.log('Latest attrs:', attrs)
})
</script>
```

**好：**
```vue
<script setup>
import { watch } from 'vue'

const props = defineProps({
  someAttr: String
})

watch(
  () => props.someAttr,
  (newValue) => {
    console.log('Changed:', newValue)
  }
)
</script>
```

## 常见模式

### 安全地检查可选属性

```vue
<script setup>
import { computed, useAttrs } from 'vue'

const attrs = useAttrs()

const hasTestId = computed(() => 'data-testid' in attrs)
const ariaLabel = computed(() => attrs['aria-label'] ?? 'Default label')
</script>
```

### 在内部逻辑之后转发监听器

```vue
<script setup>
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const attrs = useAttrs()

function handleClick(event) {
  console.log('Internal handling first')
  attrs.onClick?.(event)
}
</script>

<template>
  <button @click="handleClick">
    <slot />
  </button>
</template>
```

## TypeScript 注释

`useAttrs()` 的类型为 `Record<string, unknown>`，因此需要时强制转换各个键。

```vue
<script setup lang="ts">
import { useAttrs } from 'vue'

const attrs = useAttrs()

const testId = attrs['data-testid'] as string | undefined
const onClick = attrs.onClick as ((event: MouseEvent) => void) | undefined
</script>
```
