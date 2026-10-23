---
title: Three.js Demo 控制台多类型光源动态切换与可视化辅助
tags:
  - 日志
date: 2026-10-20
time: 20:08:00
model: Gemini 3.8 Flash (High)
type:
  - Iteration
scope:
  - "[raw/project/demo/src/main.ts](../../../../raw/project/demo/src/main.ts)"
---

# Three.js Demo 控制台多类型光源动态切换与可视化辅助

## 操作时间

2026-10-20 20:08:00 +08:00

## 操作模型

Gemini 3.8 Flash (High)

## 操作类型

- Iteration

## 操作范围

- [raw/project/demo/src/main.ts](../../../../raw/project/demo/src/main.ts)（重构光照系统与 lil-gui 调试面板，支持 DirectionalLight / PointLight / SpotLight / HemisphereLight 动态下拉切换及 Helpers 联动）

## 操作摘要

1. **多光源体系与 Helper 映射装配**：
   - 实例化四大核心主光源及对应调试辅助线：
     - `DirectionalLight` + `DirectionalLightHelper`（平行太阳光与视锥平行线）
     - `PointLight` + `PointLightHelper`（点光源球形辐射线框）
     - `SpotLight` + `SpotLightHelper`（聚光手电筒圆锥体与 target 瞄准）
     - `HemisphereLight` + `HemisphereLightHelper`（半球自然天光/地光漫反射）
   - 保留独立的暖橙色穿梭萤火虫副光源（`fireLight`）及其辅助球。
2. **调试面板（lil-gui）动态交互绑定**：
   - 在「光源系统 (Lights)」折叠组提供 `activeLightType` 下拉切换菜单。
   - 编写 `applyLightState()` 调度函数，在切换时保证当前仅激活选中光源与对应 Helper，避免多光源性能叠加与阴影冲突。
   - 提供主光强度、主光颜色、显示光路辅助线、环境光底光强弱以及萤火虫副光源开关的全方位热调能力。
3. **动画与时钟联动**：
   - 在 `tick()` 循环中针对聚光灯与平行光动态调用 `helper.update()`，并继续驱动萤火虫光源与甜甜圈的平滑自转。

## 检查目的

- 验证 TypeScript 严格编译（`npx tsc --noEmit`）无类型错误。
- 验证页面可在不刷新浏览器的情况下，在各种光源和光路辅助线之间无缝即时切换。

## 下次迭代方向

- 配合 Day 13，进一步在 lil-gui 中暴露各个光源的阴影参数（如 `shadow.mapSize`、`bias`、`normalBias`），观察阴影条纹（Shadow Acne）与失真排查。

---

## 增量操作记录：锁定地面真实木纹贴图路径

### 操作时间

2026-10-20 20:16:30 +08:00

### 操作模型

Gemini 3.8 Flash (High)

### 操作类型

- Iteration

### 操作范围

- [raw/project/demo/src/main.ts](../../../../raw/project/demo/src/main.ts)（锁定真实贴图路径为 `/textures/floor-wood.jpg`）

### 操作摘要

- 将 `src/main.ts` 中地表贴图加载路径由未对齐的 `/textures/floor.jpg` 永久修正并锁定为用户实际存在的 `/textures/floor-wood.jpg`。
- 彻底解决由于贴图文件不存在导致 404 及地面暗淡无纹理的问题。

### 检查目的

- 验证 Vite 本地服务器成功读取 524KB 的真实木纹贴图。
- 验证 TypeScript 编译（`npx tsc --noEmit`）退出码为 0。

### 下次迭代方向

- 保持用户资产路径稳定，后续若扩展切片，优先与用户既有文件名做模式探测。

---

## 增量操作记录：修复阴影相机 CameraHelper 投影矩阵未更新与不可见问题

### 操作时间

2026-10-20 20:35:00 +08:00

### 操作模型

Gemini 3.8 Flash (High)

### 操作类型

- Iteration

### 操作范围

- [raw/project/demo/src/main.ts](../../../../raw/project/demo/src/main.ts)（显式调用 `shadow.camera.updateProjectionMatrix()` 与 `shadowCameraHelper.update()`，并在 lil-gui 中挂载独立可视化开关）

### 操作摘要

- 修复由于正交阴影相机修改边界后未调用 `updateProjectionMatrix()`，导致 CameraHelper 顶点换算失败塌缩在原点的问题。
- 整合用户代码中重复实例化的 Helper，显式执行初始化 `update()`，并在 `tick()` 循环中动态驱动。
- 在 lil-gui「光源系统」中新增「显示阴影相机视锥体」独立复选框，方便随时开关排查。

### 检查目的

- 验证 TypeScript 严格编译（`npx tsc --noEmit`）无类型错误。
- 验证视口中清晰呈现黄色/白色长方体线框包裹整个主场景。

### 下次迭代方向

- 结合 Day 13 阴影范围紧缩实操，动态调整 `left/right/top/bottom` 参数，观察线框收紧与阴影分辨率提升的直观对比。


---

## 操作记录：控制台支持阴影柔和度三大算法动态切换

### 操作时间

2026-10-20 20:50:00 +08:00

### 操作模型

Gemini 3.8 Flash (High)

### 操作类型

- `Iteration`

### 操作范围

- [项目实战代码](../../raw/project/demo/src/main.ts)

### 操作摘要

- 在 [src/main.ts](file:///d:/work/AI-Wiki/raw/project/demo/src/main.ts) 的 `debugParams` 中新增 `shadowAlgorithm` 与 `shadowRadius` 配置字段。
- 定义 `shadowAlgorithmMap`，支持 Three.js 三大经典阴影算法：
  1. `PCFSoftShadowMap`：泊松圆盘采样（Poisson Disk），阴影边缘极柔和且半影过渡自然（画质最佳）；
  2. `PCFShadowMap`：百分比渐进过滤（PCF），抗锯齿平滑边缘（性能均衡）；
  3. `BasicShadowMap`：未过滤硬阴影（Basic），边缘带像素马赛克硬边（性能极速）。
- 封装 `updateShadowMapAlgorithm()` 逻辑：在动态切换 `renderer.shadowMap.type` 时，自动遍历 `scene` 将所有网格材质的 `needsUpdate` 标记为 `true`，解决 Three.js 运行时切换阴影算法着色器不重新编译导致的画面不生效问题。
- 在 lil-gui 中独立新增「阴影系统 (Shadows)」折叠组，支持算法下拉切换、虚化半径滑块（`shadow.radius`）调节及视锥体线框联动。

### 检查目的

- 验证 TypeScript 严格静态检查（`npx tsc --noEmit`）通过无错误。
- 保证地表真实贴图路径 `/textures/floor-wood.jpg` 未被修改。

### 下次迭代方向

- 吸收计划评审反馈（编码、回滚与异构模型），启动《Three.js 阴影相机视锥体精确裁剪与 Shadow Acne 避坑指南》的实现子代理沉淀。
