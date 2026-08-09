---
title: 使用 .exact 修饰符实现精确的键盘/鼠标快捷键
impact: MEDIUM
impactDescription: Without .exact, shortcuts fire even when additional modifier keys are pressed, causing unintended behavior
type: best-practice
tags: [vue3, events, keyboard, modifiers, shortcuts, accessibility]
---

# 使用 .exact 修饰符实现精确的键盘/鼠标快捷键

**影响：中** - 默认情况下，即使同时按下其他修饰键，Vue 的修饰键处理程序（`.ctrl`、`.alt`、`.shift`、`.meta`）也会触发。使用 `.exact` 要求仅按下指定的修饰符，以防止意外触发快捷方式。

## 任务清单

- [ ] 当您需要精确的修饰符组合时，请使用 `.exact`
- [ ] 没有 `.exact`：`@click.ctrl` 在 Ctrl+Click 和 Ctrl+Shift+Click 时触发
- [ ] 对于 `.exact`：`@click.ctrl.exact` 仅在 Ctrl+Click 时触发
- [ ] 使用 `@click.exact` 进行无修饰符的普通点击

**错误：**
```html
<!-- WRONG: Fires even with additional modifiers -->
<template>
  <button @click.ctrl="copyItem">Copy</button>
  <!-- Also fires on Ctrl+Shift+Click, Ctrl+Alt+Click, etc. -->

  <button @click.ctrl.shift="copyAll">Copy All</button>
  <!-- User expects Ctrl+Shift, but also fires on Ctrl+Shift+Alt -->
</template>
```

```html
<!-- WRONG: Conflicting shortcuts without .exact -->
<template>
  <div>
    <button @click.ctrl="copy">Copy (Ctrl+Click)</button>
    <button @click.ctrl.shift="copyAll">Copy All (Ctrl+Shift+Click)</button>
    <!-- Both fire when user does Ctrl+Shift+Click! -->
  </div>
</template>
```

**正确：**
```html
<!-- CORRECT: Precise modifier matching with .exact -->
<template>
  <button @click.ctrl.exact="copyItem">Copy (Ctrl only)</button>
  <!-- Only fires on Ctrl+Click, not Ctrl+Shift+Click -->

  <button @click.ctrl.shift.exact="copyAll">Copy All (Ctrl+Shift only)</button>
  <!-- Only fires on Ctrl+Shift+Click, not Ctrl+Shift+Alt+Click -->
</template>
```

```html
<!-- CORRECT: Plain click without any modifiers -->
<template>
  <button @click.exact="selectItem">Select</button>
  <!-- Only fires when NO modifier keys are pressed -->
  <!-- Ctrl+Click, Shift+Click, etc. will NOT trigger this -->
</template>
```

```html
<!-- CORRECT: Non-conflicting shortcuts -->
<template>
  <div class="editor">
    <div
      @click.exact="selectItem"
      @click.ctrl.exact="addToSelection"
      @click.shift.exact="extendSelection"
      @click.ctrl.shift.exact="selectRange"
    >
      Click, Ctrl+Click, Shift+Click, or Ctrl+Shift+Click
    </div>
  </div>
</template>
```

## 行为比较

```javascript
// WITHOUT .exact
@click.ctrl="handler"
// Fires when: Ctrl+Click, Ctrl+Shift+Click, Ctrl+Alt+Click, Ctrl+Shift+Alt+Click
// Does NOT fire: Click (without Ctrl)

// WITH .exact
@click.ctrl.exact="handler"
// Fires when: ONLY Ctrl+Click
// Does NOT fire: Ctrl+Shift+Click, Ctrl+Alt+Click, Click

// ONLY .exact (no other modifiers)
@click.exact="handler"
// Fires when: Plain click with NO modifiers
// Does NOT fire: Ctrl+Click, Shift+Click, Alt+Click
```

## 实际示例：文件浏览器选择

```vue
<template>
  <ul class="file-list">
    <li
      v-for="file in files"
      :key="file.id"
      @click.exact="selectSingle(file)"
      @click.ctrl.exact="toggleSelection(file)"
      @click.shift.exact="selectRange(file)"
      @click.ctrl.shift.exact="addRangeToSelection(file)"
      :class="{ selected: isSelected(file) }"
    >
      {{ file.name }}
    </li>
  </ul>
</template>

<script setup>
// Each click type has distinct, non-overlapping behavior
function selectSingle(file) {
  // Clear selection and select only this file
}

function toggleSelection(file) {
  // Add or remove this file from current selection
}

function selectRange(file) {
  // Select all files from last selected to this one
}

function addRangeToSelection(file) {
  // Add range to existing selection
}
</script>
```

## 带有 .exact 的键盘快捷键

```html
<template>
  <div
    tabindex="0"
    @keydown.ctrl.s.exact.prevent="save"
    @keydown.ctrl.shift.s.exact.prevent="saveAs"
    @keydown.ctrl.z.exact.prevent="undo"
    @keydown.ctrl.shift.z.exact.prevent="redo"
  >
    <!-- Each shortcut is precisely defined -->
  </div>
</template>
```

## 参考
- [Vue.js 事件处理 - .exact 修饰符](https://vuejs.org/guide/essentials/event-handling.html#exact-modifier)
