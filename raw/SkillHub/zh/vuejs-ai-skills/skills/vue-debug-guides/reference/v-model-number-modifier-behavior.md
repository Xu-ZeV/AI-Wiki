---
title: v-model.number 使用 parseFloat 而非 valueAsNumber
impact: MEDIUM
impactDescription: .number modifier returns empty string for empty input and uses parseFloat, not native valueAsNumber
type: capability
tags: [vue3, v-model, forms, input, number, type-coercion, modifiers]
---

# v-model.number 使用 parseFloat 而不是 valueAsNumber

**影响：中** - `.number` 修饰符的行为与本机 `valueAsNumber` 属性不同。对于空输入，它返回一个空字符串（不是 NaN），并使用具有不同解析规则的 `parseFloat()`。这可能会导致计算和验证中出现意外的类型问题。

在使用数字形式时，尤其是在计算、最小/最大验证或与需要严格数字类型的 API 交互时，了解这些差异至关重要。

## 任务清单

- [ ] 当使用 `.number` 修饰符清除输入时，预期为空字符串（不是 0 或 NaN）
- [ ] 处理验证和计算中的空字符串大小写
- [ ] 记住 `.number` 使用 parseFloat - "123abc" 变成 123，而不是 NaN
- [ ] 对于严格的数字解析，添加自定义验证

**主要区别：**

|场景 | `.number` 修改器 |原生 `valueAsNumber` |
|----------|-------------------|----------------------|
|空输入 | `''`（空字符串）| `NaN` |
| `"123"` | `123` | `123` |
| `"123.45"` | `123.45` | `123.45` |
| `"123abc"` | `123` | `NaN` |
| `"abc"` | `'abc'`（原字符串）| `NaN` |

**问题 - 意外类型：**
```html
<script setup>
import { ref, computed } from 'vue'

const price = ref(0)
const quantity = ref(1)

const total = computed(() => {
  // PROBLEM: price might be '' (empty string) when input is cleared
  return price.value * quantity.value  // '' * 1 = 0, but typeof is still number
})

function validatePrice() {
  // PROBLEM: This check fails when input is empty
  if (typeof price.value !== 'number') {
    // Never enters here! '' is still treated as "processed"
  }

  // PROBLEM: parseFloat("$100") returns NaN, but "100abc" returns 100
}
</script>

<template>
  <input v-model.number="price" type="number">
  <!-- When user clears input, price.value becomes '' not 0 or NaN -->
</template>
```

**解决方案 - 显式处理空字符串：**
```html
<script setup>
import { ref, computed } from 'vue'

const price = ref(0)
const quantity = ref(1)

const total = computed(() => {
  // CORRECT: Handle empty string case
  const priceNum = price.value === '' ? 0 : price.value
  return priceNum * quantity.value
})

// Or use a wrapper computed for safer access
const safePrice = computed(() => {
  if (price.value === '' || price.value === null) return 0
  return Number(price.value) || 0
})
</script>

<template>
  <input v-model.number="price" type="number" min="0">
  <p>Total: ${{ total.toFixed(2) }}</p>
</template>
```

**解决方案 - 自定义输入处理以进行严格解析：**
```html
<script setup>
import { ref } from 'vue'

const price = ref(0)

function handlePriceInput(event) {
  const value = event.target.value

  // Strict parsing - only accept valid numbers
  const parsed = parseFloat(value)

  if (value === '') {
    price.value = 0  // Or null, depending on your needs
  } else if (!isNaN(parsed) && isFinite(parsed)) {
    // Additional check: ensure entire string is numeric
    if (/^-?\d*\.?\d+$/.test(value.trim())) {
      price.value = parsed
    }
  }
  // Invalid input - keep previous value
}
</script>

<template>
  <!-- Manual binding for strict numeric control -->
  <input
    :value="price"
    @input="handlePriceInput"
    type="number"
  >
</template>
```

## 参考
- [Vue.js 表单输入绑定 - .number](https://vuejs.org/guide/essentials/forms.html#number)
