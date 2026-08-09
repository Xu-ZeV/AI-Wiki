# Fallthrough 事件监听器是可加的

## 规则

当事件侦听器作为 Fallthrough 属性传递给组件时，它会被添加到根元素的相同类型的现有侦听器中 - 两者都会触发。这与替换值的 props 不同。请注意，组件的内部处理程序和父级的处理程序都将执行。

## 为什么这很重要

- 开发者可能期望事件监听器能够覆盖类似的 props
- 两个处理程序都会执行，这可能会导致重复提交、重复的 API 调用
- 执行顺序：首先是内部处理程序，然后是失败处理程序
- 这实际上对于组合很有用，但如果意外的话可能会导致错误

## 错误代码

```vue
<!-- BaseButton.vue - Potential double-action bug -->
<template>
  <button @click="internalClick">
    <slot />
  </button>
</template>

<script setup>
const emit = defineEmits(['action'])

function internalClick() {
  // This runs first
  emit('action')
  console.log('Internal click handler')
}
</script>

<!-- Parent.vue -->
<template>
  <BaseButton @click="parentClick">Submit</BaseButton>
</template>

<script setup>
function parentClick() {
  // This ALSO runs (after internal)
  submitForm()  // Might cause double submission!
  console.log('Parent click handler')
}
</script>

<!--
  RESULT: Both handlers fire!
  Console output:
  1. "Internal click handler"
  2. "Parent click handler"

  If both trigger API calls, you get duplicate requests
-->
```

## 好的代码

### 选项1：使用inheritAttrs: false 防止失败

```vue
<!-- BaseButton.vue - Control event handling explicitly -->
<script setup>
defineOptions({
  inheritAttrs: false
})

const emit = defineEmits(['click'])

function handleClick(event) {
  // Component controls all click behavior
  console.log('Handled internally')
  emit('click', event)  // Explicitly forward if needed
}
</script>

<template>
  <button @click="handleClick">
    <slot />
  </button>
</template>
```

### 选项 2：记录附加行为

```vue
<!-- BaseButton.vue - Design for composition -->
<script setup>
/**
 * BaseButton - A composable button component
 *
 * Note: Click handlers passed to this component are ADDITIVE.
 * The internal handler runs first, then any parent @click handler.
 * Use @action event if you only want to respond to the action.
 */
const emit = defineEmits(['action'])

function internalClick() {
  // Internal logic (e.g., ripple effect, analytics)
  emit('action')
}
</script>

<template>
  <button @click="internalClick">
    <slot />
  </button>
</template>

<!-- Parent.vue - Use the custom event instead -->
<template>
  <!-- Use @action, not @click, to avoid double handling -->
  <BaseButton @action="handleAction">Submit</BaseButton>
</template>
```

### 选项 3：如果需要，使用 stopPropagation

```vue
<!-- BaseButton.vue - Stop event propagation when needed -->
<script setup>
const props = defineProps({
  stopPropagation: Boolean
})

function handleClick(event) {
  if (props.stopPropagation) {
    event.stopPropagation()
  }
  // Internal handling...
}
</script>

<template>
  <button @click="handleClick">
    <slot />
  </button>
</template>
```

## 有意使用附加行为

附加行为对于扩展功能很有用：

```vue
<!-- EnhancedButton.vue - Leveraging additive listeners -->
<template>
  <button
    @click="trackClick"
    @focus="trackFocus"
  >
    <slot />
  </button>
</template>

<script setup>
function trackClick() {
  analytics.track('button_click')
  // Parent's @click will also run - that's intentional!
}

function trackFocus() {
  analytics.track('button_focus')
}
</script>

<!-- Parent.vue -->
<template>
  <!-- Both analytics AND form submission happen -->
  <EnhancedButton @click="submitForm">Submit</EnhancedButton>
</template>
```

## 执行顺序

```vue
<script setup>
// Component
function componentHandler() {
  console.log('1. Component handler (first)')
}
</script>

<template>
  <button @click="componentHandler">Click</button>
</template>

<!-- Parent passes @click -->
<!-- Execution order:
     1. componentHandler (defined in component)
     2. parentHandler (passed as fallthrough)
-->
```

## 最佳实践

1. **对于 UI 组件**：使用 `inheritAttrs: false` 并发出自定义事件
2. **对于 HOC/包装器**：记录监听器是可加的
3. **用于分析/跟踪**：有意利用附加行为
4. **避免副作用**：不要假设您的处理程序是唯一正在运行的处理程序

## 参考文献

- [Fallthrough属性-v-on监听器继承](https://vuejs.org/guide/components/attrs.html#v-on-listener-inheritance)
- [组件事件](https://vuejs.org/guide/components/events.html)
