---
title: 在 keyup 事件期间必须按住系统修改键
impact: MEDIUM
impactDescription: Modifier keys (ctrl, alt, shift, meta) behave differently with keyup - they must be held when the key is released
type: gotcha
tags: [vue3, events, keyboard, modifiers, keyup, shortcuts]
---

# 在 keyup 事件期间必须按住系统修改键

**影响：中** - 将系统修饰键（`.ctrl`、`.alt`、`.shift`、`.meta`）与 `keyup` 事件一起使用时，在释放另一个键时仍必须按下修饰键。首先释放修饰键不会触发该事件，从而导致键盘快捷键显示为损坏。

## 任务清单

- [ ] 了解 `@keyup.ctrl` 需要按住 Ctrl 键的同时释放另一个键
- [ ] 考虑使用 `keydown` 而不是 `keyup` 作为修饰键组合
- [ ] 当您需要精确的修饰键控制时，请使用 `.exact`
- [ ] 使用正确的按键释放顺序测试键盘快捷键

**错误：**
```html
<!-- WRONG: Expecting this to fire when Ctrl is released -->
<template>
  <input @keyup.ctrl="onCtrlRelease" />
  <!-- This does NOT fire when you just release Ctrl! -->
  <!-- It fires when you release ANY key while holding Ctrl -->
</template>
```

```html
<!-- WRONG: Misunderstanding keyup.ctrl behavior -->
<template>
  <div @keyup.ctrl="handleShortcut">
    <!-- User presses Ctrl+S, releases Ctrl first, then S -->
    <!-- Event does NOT fire because Ctrl wasn't held during S release -->
  </div>
</template>
```

**正确：**
```html
<!-- CORRECT: User must hold Ctrl while releasing another key -->
<template>
  <input @keyup.ctrl.s="saveDocument" />
  <!-- User presses Ctrl+S, then releases S while holding Ctrl -->
  <!-- Event fires correctly -->
</template>

<script setup>
function saveDocument(event) {
  event.preventDefault()
  // Save logic here
}
</script>
```

```html
<!-- CORRECT: Use keydown for more intuitive modifier behavior -->
<template>
  <div @keydown.ctrl.s="saveDocument">
    <!-- keydown fires immediately when both keys are pressed -->
    <!-- More intuitive for keyboard shortcuts -->
  </div>
</template>
```

```html
<!-- CORRECT: Use .exact for precise modifier control -->
<template>
  <!-- Only fires when ONLY Ctrl is pressed (no Shift, Alt, etc.) -->
  <button @click.ctrl.exact="onCtrlClick">Ctrl+Click Only</button>

  <!-- Fires with no system modifiers at all -->
  <button @click.exact="onPlainClick">Plain Click Only</button>
</template>
```

## 系统修饰符如何与 keyup 一起使用

```javascript
// Timeline of Ctrl+S keydown:
// 1. User presses Ctrl (keydown fires)
// 2. User presses S while holding Ctrl (keydown fires)

// Timeline of Ctrl+S keyup:
// 3. User releases S while holding Ctrl (keyup.ctrl.s fires!)
// 4. User releases Ctrl (keyup fires, but not keyup.ctrl.s)

// Common mistake:
// 3. User releases Ctrl first (nothing fires for our handler)
// 4. User releases S (keyup.s fires, but not keyup.ctrl.s)
```

## 系统修改键

```html
<!-- Available system modifiers -->
<input @keyup.ctrl="..." />   <!-- Ctrl key -->
<input @keyup.alt="..." />    <!-- Alt key (Option on Mac) -->
<input @keyup.shift="..." />  <!-- Shift key -->
<input @keyup.meta="..." />   <!-- Cmd on Mac, Windows key on PC -->
```

## .exact 修饰符

```html
<!-- Different .exact behaviors -->

<!-- Fires even if Shift/Alt are also pressed -->
<button @click.ctrl="onClick">Ctrl + any other modifiers</button>

<!-- Fires ONLY when Ctrl alone is pressed -->
<button @click.ctrl.exact="onClick">Ctrl only, no other modifiers</button>

<!-- Fires ONLY when no system modifiers are pressed -->
<button @click.exact="onClick">No modifiers allowed</button>
```

## 最佳实践：首选使用 keydown 作为快捷键

```html
<template>
  <div
    tabindex="0"
    @keydown.ctrl.s.prevent="save"
    @keydown.ctrl.z.prevent="undo"
    @keydown.ctrl.shift.z.prevent="redo"
  >
    <!-- keydown is more reliable for keyboard shortcuts -->
    <!-- Add .prevent to stop browser default (e.g., save dialog) -->
  </div>
</template>
```

## 参考
- [Vue.js 事件处理 - 键修饰符](https://vuejs.org/guide/essentials/event-handling.html#key-modifiers)
- [Vue.js 事件处理 - 系统修饰键](https://vuejs.org/guide/essentials/event-handling.html#system-modifier-keys)
