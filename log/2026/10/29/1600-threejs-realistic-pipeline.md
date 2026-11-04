---
title: 沉淀 Three.js 写实级渲染管线与高端物理材质配置手册
tags:
  - 日志
date: 2026-10-29 16:35:00 +08:00
model: GPT-5 Codex
type:
  - Ingest
  - Iteration
scope:
  - "[[wiki/references/threejs-realistic-render-pipeline|Three.js 写实级渲染管线与高端物理材质配置手册]]"
  - "[[wiki/references/index|来源摘要索引]]"
  - "[[wiki/synthesis/threejs-journey-learning-path|Three.js Journey 每日 2 小时自学路径]]"
---

# 沉淀 Three.js 写实级渲染管线与高端物理材质配置手册

## 操作摘要
1. **新建参考白皮书**：在 `wiki/references/threejs-realistic-render-pipeline.md` 沉淀《Three.js 写实级渲染管线（Realistic Pipeline）与高端物理材质配置手册》，深入覆盖：
   - 色彩空间校准基准（`SRGBColorSpace` vs 线性数学纹理保持 `NoColorSpace`）；
   - 电影级 ACESFilmic 色调映射（高光平滑滚降与暗部动态范围保留）；
   - HDR/EXR 全景图基于图像的照明（IBL）与 `RGBELoader`；
   - 次世代物理材质 `MeshPhysicalMaterial` 高级参数矩阵（Clearcoat 清漆双层反射、Transmission 体积透光与 IOR 折射率、Sheen 绒毛、Iridescence 薄膜虹彩）；
   - 消除数码塑料感的微瑕疵贴图矩阵（Surface Imperfections 粗糙度扰动、法线凹凸、AO 接触阴影）；
   - PCFSoftShadowMap 软阴影与偏差调优；
   - EffectComposer 轻量化后处理通道（UnrealBloomPass 柔和泛光、GTAO/SSAO 环境光遮蔽）；
   - 工业级真实世界扫描素材站与理论圣经索引矩阵（Fab/Megascans, Poliigon, Poly Haven, Google Filament 等）；
   - 生产环境纹理尺寸规范与 GPU 显存彻底释放（`dispose()` 机制）。
2. **联动更新类目索引**：在 `wiki/references/index.md` 追加该白皮书双向链接与核心一句话摘要。
3. **联动更新自学路径**：在 `wiki/synthesis/threejs-journey-learning-path.md` 的 frontmatter `sources` 和 `Day 22：写实级渲染管线配置（Realistic Render Pipeline）` 章节中建立双向引用锚点。

## 检查目的
- 验证多文件改动下 AI-Wiki 知识库的元数据完整性（frontmatter 格式、标签分类、双向链接闭环）。
- 确保 Three.js 写实渲染相关知识从离散问答升级为结构化、永久化的工程级参考文档。

## 门禁与协作记录
- **计划评审门禁（Plan Review Gate）**：
  - 可行性评审员：由独立子代理（`ccs-gmini/gemini-3.8-flash`）执行对抗式审查，路径与依赖校验全部通过，裁决为 **PASS**。
  - 完整性与范围对齐评审员：由编排者独立执行规范性比对与文件范围核实，裁决为 **PASS**。
- **文件范围独立核实（Scope Check）**：
  - `git diff --name-only` 仅包含 4 个目标文件（1 篇新建白皮书、1 篇索引更新、1 篇自学路径关联、1 篇操作日志），无越界修改。

## 下次迭代方向
- 在配套教学 Demo（`raw/project/demo`）中考虑实装一个基于 `MeshPhysicalMaterial` 的写实车漆/玻璃实时预览场景。
- 扩充后处理 SSAO / GTAO 与 Screen Space Reflections (SSR) 在移动端降级渲染的专项测试用例。
