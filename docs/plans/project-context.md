# Project Context

## Tooling
- Package manager: npm (v10.9.8) / Node.js (v22.22.3)
- Build tool: Vite (v5.4.10)
- TypeScript: TypeScript (v5.6.3) + vue-tsc (v2.1.8)
- Framework: Vue 3 (v3.5.12) + Vue Router (v4.4.5)
- Local dev port: 5180
- Registry: https://registry.npmmirror.com/

## Completed Work Units
| WU | Title | Key Files | Services/Components Created |
|----|-------|-----------|-----------------------------|
| WU-01 | 项目初始化、环境固化、Git 守卫与全路由骨架搭建 | `package.json`, `vite.config.ts`, `src/router/index.ts`, `src/App.vue` | 路由体系 (6 routes), AppNavbar 骨架, mockImages 数据源 |
| WU-02 | 画廊首页与公共导航外壳实现 | `src/App.vue`, `src/data/templates.ts`, `AppNavbar.vue`, `TemplateCard.vue`, `HomeView.vue` | 画廊主页, 模板卡片组件, 导航外壳状态机 |
| WU-03 | 控件一：玻璃倾斜画板展示页 | `useGlassBoard.ts`, `glass-board.css`, `GlassBoardView.vue` | 3D 鼠标倾斜视差画板, 拼图切片算法, 波浪切图, 骨架屏容错 |
| WU-04 | 控件二：南瓜助手胶囊导航栏展示页 | `useNavCapsule.ts`, `nav-capsule.css`, `NavCapsuleBar.vue`, `NavCapsuleView.vue` | 6 菜单胶囊导航栏, Glider 弹性滑块, 360°旋转, 吸顶折叠与悬停互斥让位 |
| WU-05 | 控件三：磨砂流光搜索框展示页 | `glass-search.css`, `GlassSearchBar.vue`, `GlassSearchView.vue` | 44px 药丸胶囊搜索框, 双层径向渐变流光呼吸扫光, 250ms防抖, 令牌换肤 |
| WU-06 | 控件四：列表卡片悬停跟随阴影与氛围光晕展示页 | `useCardHalo.ts`, `card-hover-halo.css`, `CardListWithHalo.vue`, `CardHoverHaloView.vue` | 容器单实例共享光晕, 18px无界弥散, Damped Lerp (0.11), 微视差追踪 |
| WU-07 | 全量工程校验、README 文档与操作日志 | `scripts/verify-all.mjs`, `README.md`, `package.json`, `log/2026/11/16/2100-create-ui-template-gallery-vue3.md` | 33项全自动化静态与构建产物校验流水线, 工程使用说明与架构文档, 规范化团队协作操作日志 |
| FIX-01~03 | 玻璃画板鼠标 3D 倾斜与切片贴图修复 | `useGlassBoard.ts`, `GlassBoardView.vue`, `glass-board.css`, `log/2026/11/17/1000-fix-glass-board-mouse-tilt.md` | 外壳 boardTilt 3D 旋转与位移深阴影、舞台 CSS 3D 透视打通、切片棋盘景深与光影跟随、响应式贴图尺寸与无障碍安全降级 |
| FIX-04~06 | 彻底解除鼠标跟随偏移过度拦截与增补避坑指南 | `useGlassBoard.ts`, `glass-board.css`, `raw/SkillHub/.../SKILL.md`, `wiki/SkillHub/.../ui-template-library.md`, `log/2026/11/23/1000-ui-template-library-3d-perspective-guide.md` | 解除 prefersReducedMotion 粗暴阻断主动交互与 transform !important 覆写，移除 overflow 展平阻断；raw/wiki 双层增补 W3C 3D 展平机理与四大反模式指南 |
| FIX-07~09 | 纠正画板交互为仅内部切片小卡片跟随鼠标 3D 倾斜 | `GlassBoardView.vue`, `useGlassBoard.ts`, `glass-board.css`, `log/2026/11/23/1200-fix-glass-board-tile-only-tilt.md` | 外壳 board-shell 与侧栏 board-sidebar 彻底剥离内联 transform 恢复完全静态沉稳；3D 物理与微视差聚焦于 tile-cell（±14deg / ±16deg / ±15px / 光影跟随）；清除无用局部变量防 TS6133 报错 |
| PERF-01~03 | 玻璃画板性能重构（图层收敛与响应式解耦提升至 60fps） | `GlassBoardView.vue`, `useGlassBoard.ts`, `glass-board.css`, `log/2026/11/23/1500-optimize-glass-board-performance-layers.md` | 彻底剥离子图层 will-change 消除 80+ 独立合成层；3D 姿态解耦出 Vue 响应式，改为原生 DOM 矩阵直写与 null 防御；引入按需 rAF 调度与 onUnmounted 引用清空防游离 DOM 内存泄漏 |







## Established Patterns
- Vue 3 Composition API `<script setup lang="ts">` with typed props/emits
- Dedicated composables (`use*`) for physics animation & pointer tracking
- Pure transform / opacity hardware acceleration, 60fps rAF scheduling
- Responsive touch `@media (hover: none)` & accessibility `@media (prefers-reduced-motion: reduce)` fallbacks
