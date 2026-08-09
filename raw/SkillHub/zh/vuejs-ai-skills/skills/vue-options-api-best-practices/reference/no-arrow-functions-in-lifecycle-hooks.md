---
title: 切勿对选项 API 生命周期挂钩使用箭头函数
impact: HIGH
impactDescription: Arrow functions in lifecycle hooks break `this` binding to component instance
type: capability
tags: [vue3, vue2, options-api, lifecycle, arrow-functions, this-binding, mounted, created]
---

# 切勿对选项 API 生命周期挂钩使用箭头函数

**影响：高** - 在选项 API 中使用生命周期挂钩的箭头函数可防止 Vue 将 `this` 绑定到组件实例。这会导致 `this` 成为 `undefined` 或引用错误的上下文，从而导致在访问组件数据、方法或其他属性时出现运行时错误。

箭头函数在词法上从其封闭范围绑定 `this`。 Vue 的选项 API 生命周期挂钩（创建、安装、更新、卸载等）需要常规函数，因此 Vue 可以在运行时将 `this` 设置为组件实例。

## 任务清单

- [ ] 始终对选项 API 生命周期挂钩使用常规函数语法
- [ ] 使用 ES6 方法简写（首选）以获得更清晰的代码
- [ ] 箭头函数允许在生命周期钩子子内用于回调

**错误：**
```javascript
export default {
  data() {
    return { message: 'Hello' }
  },
  // WRONG: Arrow function - `this` will be undefined
  created: () => {
    console.log(this.message) // Error: Cannot read property 'message' of undefined
  },
  // WRONG: Arrow function for mounted
  mounted: () => {
    this.initializePlugin() // Error: this.initializePlugin is not a function
  },
  // WRONG: Arrow function for beforeUnmount
  beforeUnmount: () => {
    this.cleanup() // Will fail!
  },
  methods: {
    initializePlugin() { /* ... */ },
    cleanup() { /* ... */ }
  }
}
```

**正确：**
```javascript
export default {
  data() {
    return { message: 'Hello' }
  },
  // CORRECT: ES6 method shorthand (preferred)
  created() {
    console.log(this.message) // Works! this refers to component instance
  },
  // CORRECT: Regular function expression
  mounted: function() {
    this.initializePlugin() // Works!
  },
  // CORRECT: Method shorthand
  beforeUnmount() {
    this.cleanup() // Works!
  },
  methods: {
    initializePlugin() {
      // Arrow functions ARE fine for callbacks inside lifecycle hooks
      this.$nextTick(() => {
        this.isReady = true // Arrow inherits `this` from mounted
      })
    },
    cleanup() { /* ... */ }
  }
}
```

## 所有受影响的生命周期挂钩

以下选项 API 挂钩不得使用箭头函数：
- `beforeCreate`
- `created`
- `beforeMount`
- `mounted`
- `beforeUpdate`
- `updated`
- `beforeUnmount` (Vue 3) / `beforeDestroy` (Vue 2)
- `unmounted` (Vue 3) / `destroyed` (Vue 2)
- `activated`
- `deactivated`
- `errorCaptured`
- `renderTracked`
- `renderTriggered`

## 参考
- [Vue.js 生命周期挂钩](https://vuejs.org/guide/essentials/lifecycle.html)
- [Vue.js 选项生命周期](https://vuejs.org/api/options-lifecycle.html)
