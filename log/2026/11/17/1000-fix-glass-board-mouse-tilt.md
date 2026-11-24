---
title: 修复玻璃倾斜画板鼠标 3D 倾斜与切片贴图问题
date: 2026-11-17
time: "11:03:00 +08:00"
tags:
  - 日志
model: Gemini 2.5 (Antigravity Multi-Agent Team)
type:
  - Iteration
  - Lint
scope:
  - "[[raw/project/ui-template-gallery/src/composables/useGlassBoard|useGlassBoard 物理与事件核心]]"
  - "[[raw/project/ui-template-gallery/src/views/GlassBoardView|GlassBoardView 视图展示组件]]"
  - "[[raw/project/ui-template-gallery/src/styles/glass-board|glass-board 样式表]]"
  - "[[docs/plans/active-plan|当前活跃计划]]"
  - "[[docs/plans/review-gate-fix-tilt|计划评审门禁报告]]"
---

# 操作记录：修复玻璃倾斜画板鼠标驱动 3D 倾斜与切片贴图问题

## 操作时间

2026-11-17 11:03:00 +08:00

## 操作模型

Gemini 2.5 (Antigravity 多代理协同团队模式)

## 操作类型

- `Iteration`（迭代修复）
- `Lint`（严格类型检查与全量工程巡检）

## 操作范围

- [useGlassBoard.ts](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/composables/useGlassBoard.ts)
- [GlassBoardView.vue](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/views/GlassBoardView.vue)
- [glass-board.css](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/styles/glass-board.css)
- [review-gate-fix-tilt.md](file:///d:/work/AI-Wiki/docs/plans/review-gate-fix-tilt.md)
- [active-plan.md](file:///d:/work/AI-Wiki/docs/plans/active-plan.md)
- [execution-state.md](file:///d:/work/AI-Wiki/docs/plans/execution-state.md)

## 操作摘要

响应用户针对 `/glass-board` 页面提出的「并没有跟着我的鼠标移动而倾斜」反馈（用户在截图中红框圈选了整个画板），开启多代理团队协作模式，执行两轮计划评审门禁与四阶段执行闭环，彻底排查并修复了 5 大底层根因：

1. **计划评审门禁（`agent-team-plan-gate`）**：
   - 组织可行性、完整性、范围与对齐三个独立异构子代理开展对抗性审查。
   - Round 1 完整性 Reviewer 发现光影跟随未在视图层对接、侧边栏微视差未定义、ResizeObserver 卸载缺失等 5 项阻塞点；经修订后 Round 2 获全票 PASS。
2. **WU-01: 3D 倾斜物理核心与切片几何贴图算法重构**：
   - 导出外壳响应式状态 `boardTilt: { rx, ry, s, shadowX, shadowY }` 与侧边栏反向微视差 `sidebarParallax: { rx, ry, z }`；
   - 增强切片物理计算：棋盘格前后落差 `checker * (4 + 14 * amt)`、差分倾斜角与表面高光偏移 `sheenX`, `sheenY`；
   - 引入全局 `window.pointermove` (passive) 与 `document.pointerleave`，配合 Lerp 物理缓动与空闲正弦浮动呼吸动画；
   - 引入 `ResizeObserver` 动态测量舞台尺寸并导出响应式 `stageWidth/Height`，`onUnmounted` 严格注销监听与断开 observer。
   - 异构对抗性审查全票通过 PASS。
3. **WU-02: 视图挂载、CSS 3D 景深打通与高质感光影呈现**：
   - `.glass-board-container` 注入 `perspective: 1200px`；`.board-shell` 具备 `transform-style: preserve-3d` 并绑定 `boardTilt` 旋转与位移投影；
   - 移除 `.board-stage` 上截断 3D 空间扁平化的 `overflow: hidden`，补充 `perspective: 1000px` 与 `transform-style: preserve-3d`，让切片 Z 轴景深真正透视到视口；
   - 移除 `.tile-cell` 上的 `transition: transform`，消除与 60fps rAF 的竞争卡滞；
   - `.tile-image-slice` 绑定响应式 `stageWidth/Height`，设置 `background-position: 0 0`，移除破坏暗部的 `mix-blend-mode: screen`，彻底修复切片黑屏问题；
   - 切片反射层 `.tile-specular` 绑定动态高光位移，侧边栏绑定反向立体视差；
   - `@media (prefers-reduced-motion: reduce)` 全面重置所有 3D 层为静态无障碍基态。
   - 异构对抗性审查全票通过 PASS。
4. **WU-03: 全量工程校验与生产构建**：
   - 执行 `npm run build`，69 个模块打包完成，TypeScript 5.6 严格类型检查 0 报错；
   - 执行 `npm run verify`，33/33 项全自动化静态与产物巡检 100% 通过。

## 检查目的

- 验证鼠标在窗口内移动时，画板外壳 `.board-shell` 能随鼠标重心产生平滑的 3D 倾斜与反向位移深阴影。
- 验证内部切片 `.tile-cell` 产生明显的棋盘格一前一后 3D 景深错落与表面高光反射跟随。
- 验证切片内部画卷贴图能够清晰、无畸变、像素级对齐还原大图全貌，不再呈现空白黑块。
- 验证 SPA 页面切换时无悬挂 rAF 或未解绑的全局监听器，内存洁净。

## 检查结果

- `npx vue-tsc --noEmit`：0 错误，exit code 0。
- `npx vite build`：1.96s 打包完成，产出无报错，exit code 0。
- `npm run verify`：33 项断言 100% 通过，exit code 0。
- `git status` 确认 `node_modules/` 与 `dist/` 依然保持受控忽略，无未跟踪编译垃圾。

## 下次迭代方向

- 可为画板增加按键盘 `← / → / 空格` 快捷换图的键盘微交互；
- 后续可引入 Playwright 进行鼠标拖拽与 3D 倾斜角度的快照核验。
