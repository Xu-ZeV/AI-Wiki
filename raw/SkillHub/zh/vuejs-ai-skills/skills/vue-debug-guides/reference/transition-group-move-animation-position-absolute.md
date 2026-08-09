---
title: TransitionGroup 移动动画需要在离开项目时具有绝对位置
impact: HIGH
impactDescription: Without position absolute, surrounding items jump instead of smoothly animating
type: gotcha
tags: [vue3, transition-group, animation, move-transition, css, list-animation]
---

# TransitionGroup 移动动画需要在离开项目时保持绝对位置

**影响：高** - 当使用 `<TransitionGroup>` 从列表中添加或删除项目时，周围的项目将立即“跳转”到新位置，而不是平滑地进行动画处理。这会造成不和谐的用户体验，并且是列表动画最常见的错误之一。

修复方法是在 `leave-active` 类上设置 `position: absolute`，以便将留下的项目从布局流中取出，从而允许其他项目顺利地以动画方式移动到新位置。

## 任务清单

- [ ] 添加 `.list-move` 类（或 `.[name]-move`）以实现平滑重新定位
- [ ] 在 `.list-leave-active` 类上设置 `position: absolute`
- [ ] 如果需要，请确保父容器具有 `position: relative`
- [ ] 测试快速添加/删除操作以验证平滑的动画

**不正确 - 物品跳跃而不是移动：**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<style>
/* INCOMPLETE: Missing move class and position absolute */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
```

**正确 - 平滑移动过渡：**
```vue
<template>
  <TransitionGroup name="list" tag="ul">
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </TransitionGroup>
</template>

<style>
/* CORRECT: Full set of classes for smooth animations */

/* Apply transition to moving elements */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* CRITICAL: Take leaving items out of layout flow */
.list-leave-active {
  position: absolute;
}
</style>
```

## 为什么这有效

Vue内部使用的FLIP动画技术需要计算元素位置。当物品离开时：

1.没有`position: absolute`：离开的项目仍然占用DOM中的空间
2. 在留下的物品完全移除之前，其他物品无法移动
3.结果：离开动画完成后，项目捕捉到新位置

对于 `position: absolute`：

1. 离开的项目立即从正常布局流程中删除
2.其他物品可以开始移入空出的空间
3. 结果：离开动画和移动动画同时发生

## 视觉图

```
Without position: absolute:
[A] [B] [C] [D]  <- Remove B
[A]     [C] [D]  <- B fading out, C/D waiting
[A] [C] [D]      <- B gone, C/D jump instantly

With position: absolute:
[A] [B] [C] [D]  <- Remove B
[A][B][C] [D]    <- B fading (absolute), C/D sliding left
[A] [C] [D]      <- Smooth completion
```

## 其他注意事项

**容器宽度：** 使用 `position: absolute` 时，项目可能需要显式宽度：

```css
.list-leave-active {
  position: absolute;
  width: 100%; /* Or specific width to maintain layout during leave */
}
```

**堆叠上下文：** 留下带有 `position: absolute` 的项目可能会堆叠在其他元素之上：

```css
.list-leave-active {
  position: absolute;
  z-index: -1; /* Optional: put behind other items */
}
```

## 参考
- [Vue.js TransitionGroup 移动转换](https://vuejs.org/guide/built-ins/transition-group.html#move-transitions)
- [FLIP动画技术](https://aerotwist.com/blog/flip-your-animations/)
