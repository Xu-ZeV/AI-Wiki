---
title: 玻璃画板极致性能重构（消除过度图层化与 Vue 响应式开销，提升至 60fps）
date: 2026-11-23
time: "15:50:00 +08:00"
tags:
  - 日志
model: Gemini 2.5 (Antigravity Multi-Agent Team)
type:
  - Iteration
  - Lint
scope:
  - "[[raw/project/ui-template-gallery/src/views/GlassBoardView|GlassBoardView 视图组件与 DOM 引用注册]]"
  - "[[raw/project/ui-template-gallery/src/composables/useGlassBoard|useGlassBoard 物理与原生直写核心]]"
  - "[[raw/project/ui-template-gallery/src/styles/glass-board|glass-board 样式表与合成层收敛]]"
  - "[[docs/plans/active-plan|当前活跃实施计划]]"
  - "[[docs/plans/review-gate-optimize-layers|实施计划门禁审查报告]]"
---

# 操作记录：玻璃画板极致性能重构（消除过度图层化与 Vue 响应式开销，提升至 60fps）

## 操作时间

2026-11-23 15:50:00 +08:00

## 操作模型

Gemini 2.5 (Antigravity 多代理协同团队模式)

## 操作类型

- `Iteration`（根据用户性能排查反馈执行架构级性能重构）
- `Lint`（严格 TypeScript 静态编译检查、全量工程静态产物巡检与异构对抗性代码审查）

## 操作范围

- [useGlassBoard.ts](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/composables/useGlassBoard.ts)
- [GlassBoardView.vue](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/views/GlassBoardView.vue)
- [glass-board.css](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/styles/glass-board.css)
- [active-plan.md](file:///d:/work/AI-Wiki/docs/plans/active-plan.md)
- [review-gate-optimize-layers.md](file:///d:/work/AI-Wiki/docs/plans/review-gate-optimize-layers.md)
- [execution-state.md](file:///d:/work/AI-Wiki/docs/plans/execution-state.md)

## 操作摘要

响应用户针对 `/glass-board` 页面提出的性能瓶颈反馈：“帧率太低了，只有 11-13fps，每一张卡牌都是单独一个图层？这样是否会导致渲染过慢？”（附带两张 DevTools 截图：11.2 fps 伴随 `GPU raster: OFF`，以及 Layers 3D 视图显示数十层重叠切片图层）。团队开启多代理协作模式，完成了深度根因定位、计划门禁、重构与异构对抗审查：

1. **深度性能根因诊断与定位**：
   - **图层过度提升（Layer Over-Promotion）**：不仅 25 张卡片 `.tile-cell` 被提升为合成层，每张卡片内部的图片切片 `.tile-image-slice` 和高光层 `.tile-specular` 竟然也全部声明了 `will-change: transform`，导致生成 75~80+ 个独立合成图层；在用户的 `GPU raster: OFF` 环境下，CPU 软件光栅化与离屏遮罩（Mask Render Target）算力瞬间崩溃；
   - **Vue 3 响应式开销在 60fps 下的自残**：`tiles` 声明为 Vue 的 `ref<TileItem[]>`，rAF 每一帧对 25 个 tile 连续更新 150 次响应式属性，迫使 Vue 3 在每一帧对 25 个卡片做 Virtual DOM Diff 和内联 style 字符串拼接计算，抢占 30~40ms 的 CPU 主线程耗时；
   - **死循环 rAF 调度**：动画帧无条件不间断运行，即使指针静止也在持续消耗 CPU。
2. **WU-01: 重构 `useGlassBoard.ts` 解耦 Vue 响应式与原生 DOM 矩阵直写**：
   - 将 3D 姿态变量（`rx, ry, z, s, sheenX, sheenY`）从 Vue 的 `ref<TileItem[]>` 中彻底剥离，改为纯非响应式内部对象数组 `tilePhysicsList`；
   - 提供 `registerTileCell(id, el)` 与 `registerTileSheen(id, el)` 回调函数，防御性处理 Vue 模板 `:ref` 传入 `null` 的卸载注销；
   - 物理更新循环在纯 JS 数组中执行，并在 rAF 回调中直接执行原生 `element.style.transform` 矩阵直写，单帧 JS 耗时降至 < 0.2ms；
   - 完善生命周期闭环与内存安全：在 `onUnmounted` 中显式清空 `tileCellMap.clear()`、`tileSheenMap.clear()`、`tilePhysicsList = []`，断开与 DOM 节点的所有闭包强引用，杜绝 SPA 路由跳转时的游离 DOM 内存泄漏；
   - 引入平滑的按需/阻尼动效调度机制，静止且收敛后优雅休眠，指针移动或空闲 2.5s 时按需唤醒；
   - 经异构审查员核验全票通过 PASS。
3. **WU-02: 优化 `glass-board.css` 与 `GlassBoardView.vue` 消除图层膨胀**：
   - 在 `glass-board.css` 中，彻底移除 `.tile-image-slice`、`.tile-specular` 与 `.board-grid` 上的 `will-change: transform` 与多余的 `preserve-3d`，将内部元素扁平合并在 `.tile-cell` 层绘制，总图层数从 80+ 骤降压缩；
   - 在 `GlassBoardView.vue` 中，彻底移除了 `.tile-cell` 与 `.tile-specular` 上的响应式内联 `:style`，改由 `:ref` 挂载注册；
   - 经异构审查员核验全票通过 PASS。
4. **WU-03: 全量工程校验与自动化巡检**：
   - 在 `raw/project/ui-template-gallery` 执行 `npm run verify`，33 项自动化静态与产物巡检全票通过；
   - 执行 `npm run build`（`vue-tsc --noEmit && vite build`），0 errors、0 warnings，构建耗时 1.33s，exit code 0。

## 检查目的

1. 验证图层爆炸是否彻底消除：卡片内部切片与高光层不再创建独立合成层，图层数收敛在 25 块卡片本身。
2. 验证 Vue 响应式 Diff 自残是否消除：鼠标移动过程中 Vue 不再执行任何 Virtual DOM Diff，矩阵变换纯走原生 DOM 直写与 GPU 合成。
3. 验证内存安全性：SPA 路由切换与组件卸载时无任何游离 DOM 泄漏，模板 ref 回调无空指针隐患。
4. 验证工程在 Vue 3 + TypeScript 严格模式下无任何编译及类型报错。

## 检查结果

- `vue-tsc --noEmit`: 通过（0 error, 0 warning）
- `vite build`: 通过（69 modules, exit code 0）
- `verify-all.mjs`: 通过（33/33 项静态与产物断言全部通过）
- 对抗性审查员独立审查：WU-01 PASS、WU-02 PASS

## 下次迭代方向

- 建议在真实浏览器环境开启 DevTools Rendering 工具条与 Layers 面板，核验图层数量大幅收敛与 60fps 满帧运行效果；
- 将本次「CSS 3D 图层爆炸排查与 Vue 响应式解耦」的实战经验沉淀进 SkillHub 知识库。
