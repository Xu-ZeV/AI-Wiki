# 当前计划：玻璃画板极致性能重构（消除过度图层化与 Vue 响应式开销，提升至 60fps）
<!-- approved: 2026-11-23 15:35:00 +08:00 -->
<!-- gate-iterations: 2 -->
<!-- user-approved: true -->
<!-- status: completed -->

## 0. 基本信息与目标
- **用户反馈**：`帧率太低了，只有 11-13fps，每一张卡牌都是单独一个图层？这样是否会导致渲染过慢？`（附带两张 DevTools 截图：11.2fps 伴随 `GPU raster: OFF`，以及 Layers 3D 视图显示数十层重叠切片图层）。
- **根因确认**：
  1. **图层过度提升（Layer Over-Promotion）**：不仅 25 张小卡片被提升为合成层，每张卡片内部的 `.tile-image-slice` 和 `.tile-specular` 也全部声明了 `will-change: transform`，导致生成 75~80+ 个独立合成图层；在 `GPU raster: OFF` 环境下引发 CPU 软件光栅化与离屏遮罩（Mask Render Target）的算力崩溃；
  2. **Vue 3 响应式开销在 60fps 下的自残**：`tiles` 声明为 Vue `ref`，rAF 每一帧对 25 个 tile 连续更新 150 次响应式属性，迫使 Vue 3 在每一帧对 25 个卡片做 Virtual DOM Diff 和内联 style 字符串拼接计算，抢占 30~40ms 的 CPU 主线程耗时；
  3. **死循环 rAF 调度**：动画帧无条件不间断运行，即使指针静止也在持续消耗 CPU。
- **重构目标**：
  - 维持一切既有视觉与交互不变量：外壳稳固静止、内部小卡片 3D 独立倾斜（±14deg / ±16deg / ±15px）、拼图像素对齐、表面高光跟随、波浪翻转切图、减弱动效降级；
  - 彻底剥离子图层的 `will-change: transform`，使卡片内部元素扁平合并在卡片层绘制，图层总数从 80+ 骤降至合理范围；
  - 将 3D 矩阵变换解耦出 Vue 响应式系统，改用原生 DOM `style.transform` 直接写入，JS 帧耗时降至 <0.5ms；
  - 引入按需 rAF 调度机制，静止时停帧，交互时 60fps 满帧运行；
  - 完善生命周期闭环与防御性防护：严格防护模板 ref 回调 `null` 入参，在 `onUnmounted` 中彻底释放全部 DOM 引用与计时器，消除游离 DOM 内存泄漏与空指针异常。
- **文件范围**：
  - `raw/project/ui-template-gallery/src/composables/useGlassBoard.ts`
  - `raw/project/ui-template-gallery/src/views/GlassBoardView.vue`
  - `raw/project/ui-template-gallery/src/styles/glass-board.css`
  - `log/2026/11/23/1500-optimize-glass-board-performance-layers.md`

---

## 1. 工作单元拆解 (Work Units)

### WU-01: 重构 `useGlassBoard.ts` 解耦 Vue 响应式、原生 DOM 矩阵直写、生命周期释放与按需 rAF
- **目标**：将 3D 姿态变量（`rx, ry, z, s, sheenX, sheenY`）从 Vue 的 `ref<TileItem[]>` 中剥离，改为纯非响应式物理对象数组；由 composable 统一管理卡片与高光 DOM 节点缓存映射，在 rAF 回调中直接写入 `element.style.transform`；完善生命周期销毁与引用注销；按需控制 rAF，彻底消除 Vue Virtual DOM Diff 耗时。
- **文件范围**：
  - `raw/project/ui-template-gallery/src/composables/useGlassBoard.ts`
- **依赖**：无
- **DoD 与执行验证步骤**：
  1. Vue `tiles` 仅保留初次渲染与排版所需的静态属性（`id, row, col, offsetLeft, offsetTop, isFlipping`），不再包含每帧更新的 `rx, ry, z, s, sheenX, sheenY` 响应式代理；
  2. 建立原生 DOM 引用绑定与防御性注销机制：
     - 提供 `registerTileCell(id: number, el: HTMLElement | null)` 与 `registerTileSheen(id: number, el: HTMLElement | null)`；
     - 严格防御 Vue 模板 `:ref` 卸载时传入 `null` 的行为：当 `el === null` 时从缓存映射中安全注销对应的节点引用；
     - rAF 物理更新循环中执行原生直写前做空值保护（`if (!item.el) return`），彻底杜绝 `TypeError: Cannot read properties of null`；
  3. 物理插值在纯 JS 数组上进行，并在动画帧中直接执行原生 `tile.el.style.transform = ...` 与 `tile.sheenEl.style.transform = ...`；
  4. 重构 `resetToStatic()`：遍历当前活跃 DOM 节点直接复位其内联 `style.transform`，确保在减弱动效切换或卸载时优雅归位；
  5. 严格的生命周期闭环与内存安全：
     - 在 `onUnmounted` 中不仅调用 `cancelAnimationFrame`、断开 `resizeObserver`，并且显式清理全部缓存的 DOM 节点引用集合（`tileNodeMap.clear()`），断开与组件实例的所有闭包强引用，杜绝 SPA 路由跳转时的游离 DOM（Detached DOM Tree）内存泄漏；
  6. 实现平滑的按需/阻尼动效调度，交互停止且插值收敛后休眠，并在 2.5s 空闲后按需呼吸；
  7. 验证命令：`cd raw/project/ui-template-gallery && npx vue-tsc --noEmit`，exit code 0。

### WU-02: 优化 `glass-board.css` 与 `GlassBoardView.vue` 消除图层膨胀与离屏遮罩
- **目标**：在样式与视图模板中彻底清除过度图层提升，消除 `.tile-image-slice` 与 `.tile-specular` 上的独立合成层，恢复单卡片扁平同层渲染；模板正确挂载防御性 DOM 注册回调。
- **文件范围**：
  - `raw/project/ui-template-gallery/src/styles/glass-board.css`
  - `raw/project/ui-template-gallery/src/views/GlassBoardView.vue`
- **依赖**：WU-01
- **DoD 与执行验证步骤**：
  1. 在 `glass-board.css` 中：
     - 彻底移除 `.tile-image-slice` 上的 `will-change: transform`；
     - 彻底移除 `.tile-specular` 上的 `will-change: transform`；
     - 彻底移除 `.board-grid` 上的 `will-change: transform` 与多余的 `preserve-3d`；
     - 保留卡片 `.tile-cell` 的 3D 透视与圆角视觉；
  2. 在 `GlassBoardView.vue` 中：
     - 模板中的 `.tile-cell` 移除响应式内联 `:style="{ transform: ... }"`，挂载 `:ref="(el) => registerTileCell(tile.id, el as HTMLElement | null)"`；
     - `.tile-specular` 移除响应式内联 `:style="{ transform: ... }"`，挂载 `:ref="(el) => registerTileSheen(tile.id, el as HTMLElement | null)"`；
     - `.tile-image-slice` 仅在尺寸变更或排版时保持准确的反向几何平移，不参与每帧响应式重排；
  3. 验证命令：
     - `cd raw/project/ui-template-gallery && npx vue-tsc --noEmit && npx vite build`，exit code 0；
     - 校验构建产物正常生成，无未定义或无用变量报错。

### WU-03: 全量工程校验、自动化巡检与操作日志
- **目标**：执行工程全量生产构建与 33 项全自动化静态与产物巡检，记录合规操作日志。
- **文件范围**：
  - `log/2026/11/23/1500-optimize-glass-board-performance-layers.md`
- **依赖**：WU-01, WU-02
- **DoD 与执行验证步骤**：
  1. 在 `raw/project/ui-template-gallery` 执行 `npm run verify` 与 `npm run build`，33/33 项全量通过，exit code 0。
  2. 按照 `AGENTS.md` 规范编写 `log/2026/11/23/1500-optimize-glass-board-performance-layers.md`（含可点击 scope 链接、操作模型、检查目的、检查结果与下次迭代方向）。
