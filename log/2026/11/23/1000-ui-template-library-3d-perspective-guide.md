---
title: 修复玻璃画板鼠标偏移并增补 CSS 3D 透视避坑指南
date: 2026-11-23
time: "11:25:00 +08:00"
tags:
  - 日志
model: Gemini 2.5 (Antigravity Multi-Agent Team)
type:
  - Iteration
  - Lint
scope:
  - "[[raw/project/ui-template-gallery/src/composables/useGlassBoard|useGlassBoard 物理与事件核心]]"
  - "[[raw/project/ui-template-gallery/src/styles/glass-board|glass-board 样式表]]"
  - "[[raw/SkillHub/categories/frontend-ui-design/ui-template-library/SKILL|SkillHub 原始层 ui-template-library]]"
  - "[[wiki/SkillHub/skills/ui-template-library|SkillHub 蒸馏层 ui-template-library]]"
  - "[[docs/plans/active-plan|当前活跃计划]]"
  - "[[docs/plans/review-gate-perspective-guide|计划评审门禁报告]]"
---

# 操作记录：修复玻璃画板鼠标偏移并增补 CSS 3D 透视避坑指南

## 操作时间

2026-11-23 11:25:00 +08:00

## 操作模型

Gemini 2.5 (Antigravity 多代理协同团队模式)

## 操作类型

- `Iteration`（迭代修复工程代码与技能文档增补）
- `Lint`（严格类型检查、自动化巡检与 CDP 运行时探针校验）

## 操作范围

- [useGlassBoard.ts](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/composables/useGlassBoard.ts)
- [glass-board.css](file:///d:/work/AI-Wiki/raw/project/ui-template-gallery/src/styles/glass-board.css)
- [SKILL.md (raw)](file:///d:/work/AI-Wiki/raw/SkillHub/categories/frontend-ui-design/ui-template-library/SKILL.md)
- [ui-template-library.md (wiki)](file:///d:/work/AI-Wiki/wiki/SkillHub/skills/ui-template-library.md)
- [active-plan.md](file:///d:/work/AI-Wiki/docs/plans/active-plan.md)
- [review-gate-perspective-guide.md](file:///d:/work/AI-Wiki/docs/plans/review-gate-perspective-guide.md)
- [execution-state.md](file:///d:/work/AI-Wiki/docs/plans/execution-state.md)

## 操作摘要

响应用户针对 `/glass-board` 页面提出的「卡片无法跟随鼠标偏移」（附带录屏视频）以及「补充 CSS 3D 透视与容器裁剪互斥避坑指南」双重任务，开启多代理团队协作模式，执行严格门禁与闭环实施：

1. **根因定位与排查（CDP 探针）**：
   - 提取用户录屏关键帧比对，并使用 Node.js + CDP 启动原生无头 Chrome 实测探针；
   - 确证在 Windows 环境（Windows Server、RDP 会话或系统视觉效果关闭“动画效果”时），Chromium 自动将 `window.matchMedia('(prefers-reduced-motion: reduce)').matches` 置为 `true`；
   - 原工程代码在 `handlePointerMove` 中直接 return 阻断目标坐标计算，且 CSS 中声明了 `.board-shell { transform: none !important; }` 和 `.tile-cell { transform: none !important; }`，直接将用户的主动 3D 鼠标跟随彻底死锁为 0；
   - 此外，外壳容器 `.board-shell` 依然残留 `overflow: hidden;`，触发了 W3C CSS Transforms 规范的 3D 上下文展平（Flattening）。
2. **WU-01: 修复工程端卡片鼠标跟随偏移**：
   - 在 `useGlassBoard.ts` 中移除 `handlePointerMove` 的减弱动效阻断拦截，确保用户主动移动鼠标时正常计算归一化坐标与物理插值；`prefersReducedMotion` 仅在空闲状态下（>2.5s）静默关闭自动呼吸动效；
   - 在 `glass-board.css` 中彻底移除 `.board-shell` 上的 `overflow: hidden;`，打通 3D 透视链；
   - 彻底移除 `@media (prefers-reduced-motion: reduce)` 中对 `.board-shell`、`.tile-cell` 等元素施加的 `transform: none !important;`；
   - 经异构审查员核验与实机 CDP 探针断言，在 `reducedMotion: true` 系统下移动鼠标，元素计算样式成功生成非零的 `matrix3d` 3D 空间变换（外壳 rotateX: 3.36deg, rotateY: -3.22deg，切片 translateZ: 7.31px），判定 PASS。
3. **WU-02: 原始层与蒸馏层增补避坑指南**：
   - 同步在 `raw/SkillHub/.../SKILL.md` 与 `wiki/SkillHub/.../ui-template-library.md` 为「控件一：玻璃倾斜画板」增补「CSS 3D 透视与容器裁剪互斥避坑指南」小节；
   - 系统阐明 W3C CSS Transforms Module Level 2 展平机理、四大生产踩坑反模式、分层解耦与双透视注入标准破局架构，以及 6 项排查 Checklist；
   - 严格遵循 `wiki/SkillHub/index.md` 规范，无反向分类链接，标签保持 `SKILL`。异构审查员核验全票通过 PASS。
4. **WU-03: 全量工程校验与回归测试**：
   - 在 `raw/project/ui-template-gallery` 执行 `npm run verify` 与 `npm run build`，33 项契约断言全量通过，TypeScript 5.6 类型检查 0 报错，生产打包用时 2.43s，exit code 0。

## 检查目的

- 验证用户在 Windows 默认开启减弱动效的机器上，主动移动鼠标时依然能获得平滑流畅的 3D 俯仰倾斜、前后景深错落与高光位移。
- 验证父容器解除 `overflow: hidden` 后，3D 透视与切片 Z 轴空间位移在视口上清晰可见，不再被扁平化。
- 验证原始层与蒸馏层技能文档内容完全同步，格式符合 Obsidian Wiki 架构约束。

## 检查结果

- `npx vue-tsc --noEmit`：0 错误，exit code 0。
- `npx vite build`：69 个模块正常打包，产物输出至 `dist/`，exit code 0。
- `npm run verify`：33 项自动化静态与产物契约 100% 通过，exit code 0。
- CDP 动态探针实测：移动鼠标后外壳与切片均输出合法 `matrix3d(...)`，`computedTransform` 恢复正常三维渲染。

## 下次迭代方向

- 可为画板提供右上角显式「3D 灵敏度调节 / 视角锁定」开关，方便用户自定义倾斜幅度；
- 可考虑在其他控件（如卡片光晕）中复用本次总结的分层解耦与防展平设计模式。
