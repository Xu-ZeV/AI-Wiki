---
title: 纠正画板交互为仅内部小卡片跟随鼠标倾斜（恢复静态外壳与强化切片 3D 视差）
date: 2026-11-23
time: "12:35:00 +08:00"
tags:
  - 日志
model: Gemini 2.5 (Antigravity Multi-Agent Team)
type:
  - Iteration
  - Lint
scope:
  - "[[raw/project/ui-template-gallery/src/views/GlassBoardView|GlassBoardView 视图组件]]"
  - "[[raw/project/ui-template-gallery/src/composables/useGlassBoard|useGlassBoard 物理与视差逻辑]]"
  - "[[raw/project/ui-template-gallery/src/styles/glass-board|glass-board 样式表]]"
  - "[[raw/SkillHub/categories/frontend-ui-design/ui-template-library/SKILL|SkillHub 原始层 ui-template-library]]"
  - "[[wiki/SkillHub/skills/ui-template-library|SkillHub 蒸馏层 ui-template-library]]"
  - "[[docs/plans/active-plan|当前活跃实施计划]]"
  - "[[docs/plans/review-gate-tile-only-tilt|计划评审门禁报告]]"
---

# 操作记录：纠正画板交互为仅内部小卡片跟随鼠标倾斜

## 操作时间

2026-11-23 12:35:00 +08:00

## 操作模型

Gemini 2.5 (Antigravity 多代理协同团队模式)

## 操作类型

- `Iteration`（根据用户标注反馈对工程代码进行核心交互纠偏重构）
- `Lint`（严格 TypeScript 静态编译检查、全量工程静态产物巡检与异构对抗性代码审查）

## 操作范围

- [GlassBoardView.vue](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/views/GlassBoardView.vue)
- [useGlassBoard.ts](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/composables/useGlassBoard.ts)
- [glass-board.css](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/styles/glass-board.css)
- [SKILL.md (raw)](file:///d:/work/AI-Wiki/raw/SkillHub/categories/frontend-ui-design/ui-template-library/SKILL.md)
- [ui-template-library.md (wiki)](file:///d:/work/AI-Wiki/wiki/SkillHub/skills/ui-template-library.md)
- [active-plan.md](file:///d:/work/AI-Wiki/docs/plans/active-plan.md)
- [review-gate-tile-only-tilt.md](file:///d:/work/AI-Wiki/docs/plans/review-gate-tile-only-tilt.md)
- [execution-state.md](file:///d:/work/AI-Wiki/docs/plans/execution-state.md)

## 操作摘要

响应用户在测试 `/glass-board` 页面后发出的重要纠偏指引：“错误的，我是要里面的小卡片跟鼠标倾斜，而不是整块屏幕”（附带标注截图：大红框圈出整屏/外壳表示不要倾斜，小红框圈出左上角单个小卡片切片表示要单独倾斜）。我们严格开启多代理协作团队模式，完成了计划门禁、实现解耦与独立对抗性审查：

1. **核心交互视觉架构纠偏**：
   - 原先实现误将大角度 3D 旋转挂载在最外层容器 `.board-shell` 上，导致鼠标移动时整个黑色画板大框与右侧栏一同晃动翻转；
   - 深入对照原版 `glass-board-template.html` 设计初衷与用户反馈，明确将外壳容器与侧边栏定位为**完全静止、沉稳的展示外框**；
   - 将所有 3D 物理倾斜（`rotateX/rotateY`）、棋盘格纵深层叠（`translateZ`）与表面高光反光位移（`sheenX/sheenY`）彻底聚焦收敛于内部的数十块玻璃切片小卡片（`.tile-cell`）。
2. **WU-01: 外壳归位静态与小卡片物理倾斜算法聚焦重构**：
   - 在 `useGlassBoard.ts` 中，将 `boardTilt` 锁定为全 0 静态基态（`{ rx: 0, ry: 0, s: 1, shadowX: 0, shadowY: 40 }`）；
   - 将 `sidebarParallax` 锁定为静态基态（`{ rx: 0, ry: 0, z: 16 }`）；
   - 强化 `tiles` 物理计算，为每个小切片卡片注入独立的灵敏差分倾斜角（`targetRx: ±14deg, targetRy: ±16deg`）、前后错落落差（`targetZ: ±15px`）与微缩放（`targetS`）；
   - 经异构审查员核验全票通过 PASS。
3. **WU-02: 视图与样式解绑整屏倾斜、聚焦小卡片 3D 视差展示**：
   - 在 `GlassBoardView.vue` 中，彻底移除了 `.board-shell` 和 `.board-sidebar` 上的内联 `:style`，外框与侧栏彻底静态稳固；
   - `<script setup>` 中同步清理了未引用的 `boardTilt` 与 `sidebarParallax` 解构，防止 TS6133（`noUnusedLocals`）报错；
   - `.board-stage` 保持 `perspective: 1000px; transform-style: preserve-3d;`；`.tile-cell` 准确绑定 `translate3d(0, 0, tile.z) rotateX(tile.rx) rotateY(tile.ry) scale(tile.s)`；
   - 内部拼图 `.tile-image-slice` 严格保持像素几何对齐，`.tile-specular` 精准绑定表面高光位移；
   - 经异构审查员核验全票通过 PASS。
4. **WU-03: 全量工程校验与自动化巡检**：
   - 在 `raw/project/ui-template-gallery` 执行 `npm run verify`，全量自动化静态与产物巡检 33/33 项全票通过；
   - 执行 `npm run build`（`vue-tsc --noEmit && vite build`），0 errors、0 warnings，构建耗时 1.41s，exit code 0。

## 检查目的

1. 验证用户提出的交互痛点是否彻底消除：外壳 `.board-shell` 与侧边栏 `.board-sidebar` 彻底静止固定，不再产生任何整屏大翻转。
2. 验证内部几十块切片小卡片 `.tile-cell` 是否能够正常响应鼠标移动产生灵敏、生动的独立 3D 倾斜、纵深错落与高光流动。
3. 验证工程在 Vue 3 + TypeScript 严格模式下无任何编译及类型报错。
4. 验证构建产物完备，静态自动化校验脚本通过。

## 检查结果

- `vue-tsc --noEmit`: 通过（0 error, 0 warning）
- `vite build`: 通过（69 modules, exit code 0）
- `verify-all.mjs`: 通过（33/33 项静态与产物断言全部通过）
- 对抗性审查员独立审查：WU-01 PASS、WU-02 PASS

## 下次迭代方向

- 持续关注各终端交互体验，若后续需添加切片卡片的磁吸交互或波浪涟漪阻尼调节，可在此基础上无缝扩展；
- 保持 `raw/SkillHub`、`wiki/SkillHub` 与 `raw/project` 三处工程与文档的长期双向同步。
