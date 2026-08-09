---
title: v-show 不适用于模板或与 v-else 一起使用
impact: MEDIUM
impactDescription: Using v-show on template silently fails, element is always rendered
type: capability
tags: [vue3, conditional-rendering, v-show, template, limitations]
---

# v-show 不适用于模板或与 v-else 一起使用

**影响：中** - `v-show` 不能在 `<template>` 元素上使用，因为模板不会渲染到 DOM（因此没有任何内容可以应用 `display: none`）。此外，`v-show` 不支持 `v-else`。错误地使用这些会导致元素始终可见，或者分支永远无法工作。

## 任务清单

- [ ] 切勿在 `<template>` 元素上使用 v-show - 使用 v-if 代替
- [ ] 切勿将 v-else 与 v-show 一起使用 - 使用带有否定条件的单独 v-show
- [ ] 记住 v-show 只适用于实际的 DOM 元素
- [ ] 如果需要频繁切换多个元素，请包裹在真实元素（div、span）中

**错误：**
```html
<!-- WRONG: v-show on <template> - silently does nothing -->
<template>
  <template v-show="isVisible">
    <h1>Title</h1>
    <p>Content</p>
  </template>
  <!-- These elements will ALWAYS be visible -->
</template>
```

```html
<!-- WRONG: v-else with v-show - v-else is not supported -->
<template>
  <div v-show="isLoggedIn">Welcome!</div>
  <div v-else>Please log in</div>  <!-- This v-else won't work -->
</template>
```

```html
<!-- WRONG: Mixing v-show and v-else expectations -->
<template>
  <span v-show="status === 'success'">Success!</span>
  <span v-else-if="status === 'error'">Error</span>  <!-- Not supported -->
</template>
```

**正确：**
```html
<!-- CORRECT: Use v-if on <template> for multiple elements -->
<template>
  <template v-if="isVisible">
    <h1>Title</h1>
    <p>Content</p>
  </template>
</template>
```

```html
<!-- CORRECT: Use negated v-show for "else" behavior -->
<template>
  <div v-show="isLoggedIn">Welcome!</div>
  <div v-show="!isLoggedIn">Please log in</div>
</template>
```

```html
<!-- CORRECT: Wrap in a real element if you need v-show for multiple elements -->
<template>
  <div v-show="isVisible">
    <h1>Title</h1>
    <p>Content</p>
  </div>
</template>
```

```html
<!-- CORRECT: Use v-if/v-else when you need else branches -->
<template>
  <div v-if="status === 'success'">Success!</div>
  <div v-else-if="status === 'error'">Error</div>
  <div v-else>Loading...</div>
</template>
```

```html
<!-- CORRECT: Multiple v-show conditions -->
<template>
  <span v-show="status === 'success'">Success!</span>
  <span v-show="status === 'error'">Error</span>
  <span v-show="status === 'loading'">Loading...</span>
</template>
```

## 为什么存在这个限制

```javascript
// v-show works by toggling the CSS display property
// This requires an actual DOM element

// <template> is a virtual element - it doesn't render to DOM
// It's just a wrapper for Vue's rendering logic

// After compilation:
// <template v-if="show"><p>Hi</p></template>
// Renders as: <p>Hi</p> (when show is true)
// Template itself is gone

// v-show needs a real element to set display: none on
// Since <template> doesn't exist in DOM, v-show has nothing to work with
```

## 何时选择每个

|需要|使用|
|------|-----|
|使用 CSS 切换多个元素 |包裹真实元素+ `v-show` |
|无需包装器即可切换多个元素 | `<template v-if>` |
|需要 v-else 分支 | `v-if`/`v-else` |
|频繁切换，单元素| `v-show` |
|频繁切换，需要“else”|两个具有否定条件的 `v-show` |

## 参考
- [Vue.js 条件渲染 - v-show](https://vuejs.org/guide/essentials/conditional.html#v-show)
