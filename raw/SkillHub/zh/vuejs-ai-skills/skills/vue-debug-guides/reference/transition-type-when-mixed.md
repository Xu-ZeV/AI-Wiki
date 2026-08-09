---
title: 混合 CSS 过渡和动画时指定过渡类型
impact: MEDIUM
impactDescription: Vue may detect the wrong transition end event when both CSS transitions and animations are applied, causing timing issues
type: gotcha
tags: [vue3, transition, animation, css, type, timing]
---

# 混合 CSS 过渡和动画时指定过渡类型

**影响：中** - 当您将 CSS 过渡和 CSS 动画应用于同一元素时（例如，Vue 触发的动画与悬停过渡效果相结合），Vue 无法自动确定要侦听哪个结束事件。您必须使用值为 `"animation"` 或 `"transition"` 的 `type` 属性显式告诉 Vue 优先考虑哪种类型。

## 任务清单

- [ ] 检查您的元素是否同时具有 `transition` 和 `animation` CSS 属性
- [ ] 确定当 Vue 认为转换完成时应控制哪个时序
- [ ] 将 `type="animation"` 或 `type="transition"` 添加到 `<Transition>` 组件
- [ ] 类型应与更长或更重要的动画/过渡相匹配

**有问题的代码：**
```vue
<template>
  <!-- BAD: Both transition and animation present, Vue might pick wrong end event -->
  <Transition name="bounce">
    <div v-if="show" class="box">
      Hover me for additional effect
    </div>
  </Transition>
</template>

<style>
/* Vue-triggered CSS animation */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-out 0.3s;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes bounce-out {
  0% { transform: scale(1); }
  100% { transform: scale(0); }
}

/* Additional hover transition on same element */
.box {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.box:hover {
  background-color: #f0f0f0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
```

**正确代码：**
```vue
<template>
  <!-- GOOD: Explicitly specify that animation controls timing -->
  <Transition name="bounce" type="animation">
    <div v-if="show" class="box">
      Hover me for additional effect
    </div>
  </Transition>
</template>

<style>
/* Vue-triggered CSS animation - this is what we care about */
.bounce-enter-active {
  animation: bounce-in 0.5s;
}

.bounce-leave-active {
  animation: bounce-out 0.3s;
}

@keyframes bounce-in {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes bounce-out {
  0% { transform: scale(1); }
  100% { transform: scale(0); }
}

/* Additional hover transition - unrelated to Vue transition timing */
.box {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.box:hover {
  background-color: #f0f0f0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>
```

## 何时使用每种类型

### 在以下情况下使用 `type="animation"`：
- 您的进入/离开效果使用 `@keyframes` 动画
- 动画比任何过渡都长
- 您想要精确控制多步动画

```vue
<Transition name="fancy" type="animation">
  <div v-if="show" class="animated-element" />
</Transition>

<style>
.fancy-enter-active {
  animation: fancy-entrance 1s ease-out;
}

.animated-element {
  /* This shorter transition should not affect timing */
  transition: color 0.2s;
}
</style>
```

### 在以下情况下使用 `type="transition"`：
- 您的进入/离开效果使用 CSS `transition` 属性
- 你有不应该影响时间的装饰性动画

```vue
<Transition name="slide" type="transition">
  <div v-if="show" class="sliding-element" />
</Transition>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

/* Decorative infinite animation should not affect timing */
.sliding-element {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
</style>
```

## 没有类型规范的常见症状

1. 过渡结束得太早（元素捕捉到最终位置）
2. 转换挂起或需要很长时间才能完成
3. 元素在动画结束前消失
4. 转换完成后 CSS 类仍然适用

## 参考
- [Vue.js 转换文档](https://vuejs.org/guide/built-ins/transition.html#css-based-transitions)
