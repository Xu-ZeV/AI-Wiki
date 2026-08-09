---
title: 切勿在方法选项中使用箭头函数
impact: HIGH
impactDescription: Arrow functions prevent Vue from binding `this` to the component instance
type: capability
tags: [vue3, vue2, options-api, methods, this-binding]
---

# 切勿在方法选项中使用箭头函数

**影响：高** - 在 `methods` 选项中使用箭头函数会导致 `this` 成为 `undefined` 或错误的上下文，从而导致在尝试访问组件数据、计算属性或其他方法时出现运行时错误。

箭头函数在词法上从其封闭范围绑定 `this`，而不是从定义它们的对象绑定。 Vue 的 `methods` 选项需要常规函数，因此 Vue 可以将 `this` 绑定到组件实例。

## 任务清单

- [ ] 始终对选项 API 中的方法使用常规函数语法
- [ ] 如果使用 ES6 简写，请使用方法简写（首选）
- [ ] 回调方法中允许使用箭头函数

**错误：**
```javascript
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    // WRONG: Arrow function - `this` will be undefined
    increment: () => {
      this.count++ // Error: Cannot read property 'count' of undefined
    },
    // WRONG: Arrow function assigned to property
    decrement: () => {
      this.count--
    }
  }
}
```

**正确：**
```javascript
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    // CORRECT: ES6 method shorthand (preferred)
    increment() {
      this.count++ // Works! this refers to component instance
    },
    // CORRECT: Traditional function expression
    decrement: function() {
      this.count--
    },
    // Arrow functions ARE fine for callbacks INSIDE methods
    fetchData() {
      fetch('/api/data')
        .then(response => response.json())
        .then(data => {
          this.data = data // Arrow function inherits `this` from fetchData
        })
    }
  }
}
```

## 参考
- [Vue.js 方法 - 避免箭头函数](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#methods)
