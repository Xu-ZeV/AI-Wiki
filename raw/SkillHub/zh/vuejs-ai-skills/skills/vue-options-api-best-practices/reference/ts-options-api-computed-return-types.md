---
title: 显式注释计算属性返回类型
impact: LOW
impactDescription: While Vue usually infers computed types correctly, explicit annotations prevent circular inference issues and improve code documentation
type: best-practice
tags: [vue3, typescript, options-api, computed, type-inference]
---

# 显式注释计算属性返回类型

**影响：低** - Vue 通常可以自动推断计算属性返回类型。但是，显式返回类型注释可防止涉及循环推理循环的边缘情况，并可用作复杂计算属性的文档。

## 任务清单

- [ ] 考虑向计算属性添加返回类型，尤其是复杂的属性
- [ ] 当 TypeScript 推理失败或显示不正确的类型时始终添加返回类型
- [ ] 添加可写计算属性的返回类型（getter 和 setter）

## 当显式类型有帮助时

### 1. 复杂的计算属性

```typescript
import { defineComponent } from 'vue'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export default defineComponent({
  data() {
    return {
      items: [] as CartItem[],
      discountPercent: 10
    }
  },
  computed: {
    // Without annotation - works but intent unclear
    cartSummary() {
      return {
        subtotal: this.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0)
      }
    },

    // With annotation - clear intent, documented type
    cartSummaryTyped(): { subtotal: number; itemCount: number; discount: number; total: number } {
      const subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const discount = subtotal * (this.discountPercent / 100)
      return {
        subtotal,
        itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
        discount,
        total: subtotal - discount
      }
    }
  }
})
```

### 2. 循环推理问题

有时，相互引用的计算属性可能会导致 TypeScript 推理失败：

```typescript
export default defineComponent({
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  computed: {
    // Explicit return type breaks potential circular inference
    fullName(): string {
      return `${this.firstName} ${this.lastName}`
    },

    // References fullName - explicit type prevents inference issues
    greeting(): string {
      return `Hello, ${this.fullName}!`
    }
  }
})
```

### 3.可写计算属性

为了清晰起见，始终注释可写的计算属性：

```typescript
export default defineComponent({
  data() {
    return {
      firstName: 'John',
      lastName: 'Doe'
    }
  },
  computed: {
    // Writable computed - explicit types for getter and setter
    fullName: {
      get(): string {
        return `${this.firstName} ${this.lastName}`
      },
      set(newValue: string) {
        const parts = newValue.split(' ')
        this.firstName = parts[0] || ''
        this.lastName = parts.slice(1).join(' ') || ''
      }
    }
  }
})
```

## 何时可以跳过显式类型

TypeScript 正确推断的简单计算属性：

```typescript
computed: {
  // Simple string - TypeScript infers correctly
  upperName() {
    return this.name.toUpperCase()
  },

  // Simple boolean - TypeScript infers correctly
  isEmpty() {
    return this.items.length === 0
  },

  // Simple number - TypeScript infers correctly
  totalCount() {
    return this.items.length
  }
}
```

## 复杂返回类型的接口

对于复杂的计算返回类型，定义接口：

```typescript
interface PaginationInfo {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  pageItems: Item[]
}

export default defineComponent({
  computed: {
    pagination(): PaginationInfo {
      const totalPages = Math.ceil(this.items.length / this.pageSize)
      const start = (this.currentPage - 1) * this.pageSize

      return {
        currentPage: this.currentPage,
        totalPages,
        hasNext: this.currentPage < totalPages,
        hasPrev: this.currentPage > 1,
        pageItems: this.items.slice(start, start + this.pageSize)
      }
    }
  }
})
```

## 调试类型推断

如果您不确定 TypeScript 推断的内容，请将鼠标悬停在 IDE 中的计算属性上，或添加临时注释以查看错误：

```typescript
computed: {
  // Hover over 'mystery' in IDE to see inferred type
  mystery() {
    return this.someComplexCalculation()
  },

  // Or add annotation to verify
  mystery(): ExpectedType {  // Error if inference differs
    return this.someComplexCalculation()
  }
}
```

## 参考

- [带有选项 API 的 Vue.js TypeScript - 输入计算属性](https://vuejs.org/guide/typescript/options-api.html#typing-computed-properties)
