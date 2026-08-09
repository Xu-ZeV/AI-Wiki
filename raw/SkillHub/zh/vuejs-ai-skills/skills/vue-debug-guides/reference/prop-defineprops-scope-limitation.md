---
title: DefineProps 无法从script setup访问变量
impact: MEDIUM
impactDescription: Variables declared in script setup are not accessible inside defineProps arguments
type: gotcha
tags: [vue3, props, script-setup, defineProps, compiler]
---

# defineProps 无法从script setup访问变量

**影响：中度** - `defineProps()` 参数内的代码无法访问 `<script setup>` 中声明的其他变量。编译时，整个表达式被移至外部函数作用域，从而使局部变量无法访问。

这通常会让尝试使用导入常量或计算验证逻辑的开发者感到惊讶。

## 任务清单

- [ ] 在 `<script setup>` 外部或单独的文件中定义验证常量
- [ ] 在defineProps中使用常量之前导入常量
- [ ] 使用 TypeScript props 的外部类型定义
- [ ] 对于动态验证，使用侦听器而不是 prop 验证器

**错误：**
```vue
<script setup>
import { ref } from 'vue'

// These are in <script setup> scope
const VALID_SIZES = ['sm', 'md', 'lg']
const maxLength = ref(100)

defineProps({
  size: {
    type: String,
    // WRONG: VALID_SIZES is not accessible here
    validator: (v) => VALID_SIZES.includes(v)  // ReferenceError!
  },
  name: {
    type: String,
    // WRONG: Cannot access refs
    validator: (v) => v.length <= maxLength.value  // ReferenceError!
  }
})
</script>
```

**正确：**
```vue
<script>
// Define constants in regular <script> block (module scope)
export const VALID_SIZES = ['sm', 'md', 'lg']
export const MAX_LENGTH = 100
</script>

<script setup>
// Now accessible in defineProps
defineProps({
  size: {
    type: String,
    validator: (v) => VALID_SIZES.includes(v)  // Works!
  },
  name: {
    type: String,
    validator: (v) => v.length <= MAX_LENGTH  // Works!
  }
})
</script>
```

## 模式：从外部文件导入

```javascript
// validation.js
export const VALID_SIZES = ['sm', 'md', 'lg']
export const VALID_COLORS = ['red', 'blue', 'green']
export const sizeValidator = (v) => VALID_SIZES.includes(v)
```

```vue
<script setup>
import { VALID_SIZES, VALID_COLORS, sizeValidator } from './validation'

// Imported values ARE accessible
defineProps({
  size: {
    type: String,
    validator: sizeValidator
  },
  color: {
    type: String,
    validator: (v) => VALID_COLORS.includes(v)
  }
})
</script>
```

## 模式：双脚本块

```vue
<script>
// Regular script for module-level declarations
const options = {
  themes: ['light', 'dark', 'system'],
  defaults: {
    theme: 'light',
    size: 'md'
  }
}
</script>

<script setup>
// options is accessible here
const props = defineProps({
  theme: {
    type: String,
    default: options.defaults.theme,
    validator: (v) => options.themes.includes(v)
  }
})
</script>
```

## TypeScript：外部类型定义

```typescript
// types.ts
export interface UserProps {
  name: string
  email: string
  age?: number
}
```

```vue
<script setup lang="ts">
import type { UserProps } from './types'

// Type imports work fine
const props = defineProps<UserProps>()
</script>
```

## 为什么会发生这种情况

Vue 的编译器转换 `<script setup>` 代码。在运行设置函数之前，在编译时提取 `defineProps()` 调用并将其移至组件选项：

```javascript
// Your code:
const MY_CONST = 'value'
defineProps({ prop: { default: MY_CONST } })

// Compiled (simplified):
export default {
  props: { prop: { default: MY_CONST } },  // MY_CONST doesn't exist here!
  setup() {
    const MY_CONST = 'value'  // Defined too late
  }
}
```

## 参考
- [Vue.js script setup - DefineProps](https://vuejs.org/api/sfc-script-setup.html#defineprops-defineemits)
