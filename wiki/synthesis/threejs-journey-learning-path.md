---
title: Three.js Journey 每日 2 小时自学路径
category: synthesis
tags:
  - 综合分析
  - Three.js
  - 教学路径
  - 3D可视化
sources:
  - "[[wiki/synthesis/index|综合分析索引]]"
  - "[配套教学 Demo](../../raw/project/demo/README.md)"
summary: 仿照 Three.js Journey 经典课程体系，面向每日 2 小时业余学习节奏制定的 30 天（60 小时）Web 3D 循序渐进通关学习路径与实战指引。
lifecycle: draft
tier: core
created: 2026-10-13T20:55:00+08:00
updated: 2026-10-13T20:55:00+08:00
---

# Three.js Journey 每日 2 小时自学路径

> 🔗 **资源直达**：本路径配合实战代码演练，详见 [配套教学 Demo](../../raw/project/demo/README.md)。上一级索引请参阅 [[wiki/synthesis/index|综合分析索引]]。

本自学路径严谨复刻 Bruno Simon 广受赞誉的 **Three.js Journey** 经典课程体系，针对在职开发者与业余学习者**“每天专注 2 小时”**的实际时间节奏深度定制。全路径划分为 **5 大章节、30 个每日通关任务**，总计 60 小时学习闭环。

---

## 学习方法论：每日 2 小时高效时间盒（Timeboxing）

每天 120 分钟严格采用 **30 + 60 + 30** 结构：

1. **第 1~30 分钟（概念拆解与 API 精读）**：不急于敲代码，理解底层图形学概念与 Three.js 对象设计意图。
2. **第 31~90 分钟（实操编码与参数盲调）**：在本地开发服务器中动手实现当天 Demo，修改配置观察渲染变化。
3. **第 91~120 分钟（验收自测与代码重构）**：对照每个关卡的 **通关验收标准（DoD）** 检查，做微小重构并提交 Git commit。

---

## 第一章：基础篇（Day 01 ~ Day 11，共 11 节 / 22 小时）

搭建现代前端 3D 开发工程，理解 WebGL 渲染管线、场景树、变换、相机、几何体、纹理及材质基础。

---

### Day 01：WebGL 与 Three.js 极速起步

- **关卡名称**：首个三维立方体渲染
- **核心知识点拆解**：
  - WebGL 底层光栅化与 GPU 渲染概念；Three.js 核心三要素（`Scene` 场景、`Camera` 相机、`Renderer` 渲染器）。
  - 网格模型 `Mesh = Geometry + Material` 的概念。
  - `BoxGeometry` 与 `MeshBasicMaterial` 的基础初始化。
  - 将渲染画布 `renderer.domElement` 挂载到 HTML DOM 并执行单次渲染 `renderer.render(scene, camera)`。
- **动手练习任务（2 小时）**：
  - 创建纯 HTML/JS 项目，引入 Three.js（CDN 或 ESM）。
  - 构造一个红色立方体网格，设置透视相机位置 `camera.position.z = 3`。
  - 调用 `renderer.render()` 将第一个 3D 物体输出到页面上。
- **通关验收标准（DoD）**：
  - 浏览器窗口能正确渲染出红色正方形/立方体，控制台无报错。
  - 能独立口述 `Scene`、`Camera`、`Mesh`、`Renderer` 四者之间的从属与协同关系。

---

### Day 02：本地开发环境与 Vite 构建工具链

- **关卡名称**：现代化 Web 3D 工程化搭建
- **核心知识点拆解**：
  - 为什么 3D 开发必须依赖本地本地服务器（CORS 跨域限制、纹理与模型异步加载）。
  - Vite 极速脚手架搭建与 Hot Module Replacement（HMR）配置。
  - 静态资产目录（`/public` 或 `assets`）路径规范与 Three.js 模块化依赖安装。
- **动手练习任务（2 小时）**：
  - 使用 `npm create vite@latest threejs-starter -- --template vanilla` 搭建工程。
  - 安装 `three` 及其类型定义或辅助工具。
  - 迁移 Day 01 的场景代码为 ES Module 结构，配置全局 CSS 去除页面默认 margin/padding 并将 canvas 撑满。
- **通关验收标准（DoD）**：
  - 运行 `npm run dev` 毫秒级启动本地开发服务器。
  - 修改立方体颜色保存后，页面通过 HMR 自动热更新呈现最新效果。

---

### Day 03：变换对象与场景图（Scene Graph）

- **关卡名称**：空间位置、旋转、缩放与对象编组
- **核心知识点拆解**：
  - `Object3D` 基类属性：`position`（Vector3）、`scale`（Vector3）、`rotation`（Euler 欧拉角）与 `quaternion`（四元数简介）。
  - 欧拉角旋转顺序与万向节锁（Gimbal Lock）问题，`rotation.reorder('YXZ')`。
  - 向量辅助方法：`vector.length()`、`vector.distanceTo()`、`vector.normalize()`。
  - `Group` 对象编组与父子层级变换继承关系（相对坐标 vs 世界坐标）。
  - `AxesHelper` 坐标系辅助线（红 X、绿 Y、蓝 Z）。
- **动手练习任务（2 小时）**：
  - 在场景中添加 `AxesHelper(2)` 观察坐标轴。
  - 创建一个 `Group`，向其中放入 3 个不同颜色和大小的立方体，调整各个立方体的局部坐标。
  - 对整个 `Group` 进行整体旋转与缩放，观察子对象的位置联动。
- **通关验收标准（DoD）**：
  - 场景中呈现包含 3 个立方体的组合体，且能在控制台读取子物体的局部位置与世界位置。
  - 能清晰分辨红/绿/蓝轴向，并在不改变子对象属性的情况下通过父级移动整组物体。

---

### Day 04：动画循环与时间差基准

- **关卡名称**：平滑渲染循环与 requestAnimationFrame
- **核心知识点拆解**：
  - 浏览器重绘机制与 `window.requestAnimationFrame`。
  - 帧率差异问题（60Hz 屏幕 vs 120Hz/144Hz 电竞屏带来的速度倍差）。
  - 时间差平滑策略：原生 `Date.now()` 增量计算 vs `THREE.Clock` 的 `getElapsedTime()` 与 `getDelta()`。
  - 使用三角函数 `Math.sin()`、`Math.cos()` 实现规律的圆周与波浪运动。
- **动手练习任务（2 小时）**：
  - 编写标准的 `tick()` 递归渲染循环函数。
  - 引入 `THREE.Clock`，让立方体在 X/Y 轴持续旋转，同时利用 `Math.sin(elapsedTime)` 实现上下悬浮游动。
  - （可选挑战）集成 GSAP 补间动画库控制网格位置。
- **通关验收标准（DoD）**：
  - 立方体平稳旋转并上下浮动，运动速率与显示器刷新率解耦。
  - 控制台无内存泄漏隐患（不在循环体内重复 `new` 对象）。

---

### Day 05：摄像机控制与 OrbitControls 轨道漫游

- **关卡名称**：视角切换与鼠标轨道漫游交互
- **核心知识点拆解**：
  - `PerspectiveCamera` 透视相机核心参数：FOV（视场角）、Aspect（宽高比）、Near/Far（裁切面）以及 Z-fighting 深度冲突原理。
  - `OrthographicCamera` 正交相机原理与等轴测视角应用场景。
  - 官方附加控制器：`three/addons/controls/OrbitControls.js`。
  - 控制器常用配置：`enableDamping`（阻尼平滑）、`maxPolarAngle`（仰俯角限制）、`autoRotate`（自动巡检）。
- **动手练习任务（2 小时）**：
  - 替换默认静态相机为带 `OrbitControls` 的交互式相机。
  - 开启 `controls.enableDamping = true`，并在 `tick()` 循环中调用 `controls.update()`。
  - 设置轨道控制器边界，限制相机不能穿透地平面。
- **通关验收标准（DoD）**：
  - 鼠标左键能平滑旋转场景，右键平移，滚轮顺畅缩放，松手后有阻尼惯性回弹。
  - 能准确解释 FOV 过大（鱼眼变形）与 Near/Far 设置不当导致的渲染破面问题。

---

### Day 06：全屏响应与视口自适应适配

- **关卡名称**：响应式画布与高分屏 DPR 适配
- **核心知识点拆解**：
  - `window.addEventListener('resize', ...)` 视口监听机制。
  - 动态重置相机宽高比 `camera.aspect = width / height` 与更新投影矩阵 `camera.updateProjectionMatrix()`。
  - 重置渲染器尺寸 `renderer.setSize(width, height)`。
  - 视网膜屏幕（Retina）与设备像素比：`window.devicePixelRatio`，使用 `Math.min(window.devicePixelRatio, 2)` 防治移动端发热与算力崩溃。
  - 浏览器全屏 API 与双击（dblclick）全屏切换。
- **动手练习任务（2 小时）**：
  - 移除 canvas 的固定宽高，将其在 CSS 中设为 `fixed; top: 0; left: 0; outline: none;`。
  - 编写完整的 resize 监听回调，自适应窗口缩放。
  - 添加双击全屏切换逻辑（兼顾 Safari Webkit 前缀）。
- **通关验收标准（DoD）**：
  - 随意拉伸缩放浏览器窗口，画布无拉伸变形、无滚动条、边缘保持清晰。
  - 双击页面可在全屏与常规窗口之间无缝切换。

---

### Day 07：几何体基础与 BufferGeometry 顶点缓冲区

- **关卡名称**：底层网格数据与顶点装配
- **核心知识点拆解**：
  - Three.js 常见内置几何体概览（`BoxGeometry`, `SphereGeometry`, `CylinderGeometry`, `TorusGeometry` 等）及其分段数（segments）对性能的影响。
  - `BufferGeometry` 底层数据存储结构：类型化数组 `Float32Array` 与 `BufferAttribute`。
  - 3D 顶点的三元坐标装配（XYZ），三角形面（Triangles）的顶点顺序与面朝向（法线正面逆时针规则）。
- **动手练习任务（2 小时）**：
  - 创建一个纯手写的 `BufferGeometry`。
  - 使用 `Float32Array` 定义 50 个随机三角形（每个三角形 3 个顶点，每个顶点 3 个 float 坐标，共 450 个浮点数）。
  - 创建 `BufferAttribute` 绑定到 `geometry.setAttribute('position', ...)` 并渲染呈现。
- **通关验收标准（DoD）**：
  - 屏幕上渲染出完全由手写代码程序化生成的 50 个散布三角形网格。
  - 能向他人讲清楚一个立方体在底层最少需要多少个顶点和索引，理解 `BufferAttribute` 内存连续性优势。

---

### Day 08：调试工具集：lil-gui / dat.gui 接入

- **关卡名称**：可视化调试面板与参数热调
- **核心知识点拆解**：
  - 调试 UI 的重要性：实时微调位置、尺寸、颜色和性能开关，免去反复修改代码刷新。
  - `lil-gui` 核心 API：`gui.add(object, property, min, max, step).name('标签')`。
  - 颜色属性的特殊绑定：`gui.addColor()` 与 Three.js 颜色实例同步。
  - 函数按钮与布尔复选框触发器。
- **动手练习任务（2 小时）**：
  - 安装并引入 `lil-gui`，实例化面板。
  - 为网格对象的 `position.y` 添加滑块范围 `[-3, 3]`。
  - 为网格材质添加 `wireframe` 切换开关与 `color` 调色板。
  - 添加一个“执行原地跳跃”的方法触发按钮。
- **通关验收标准（DoD）**：
  - 页面右上角出现可折叠的调试面板，拖动滑块或选择颜色时，3D 视图实时无延迟响应。
  - 点击调试面板按钮能成功触发自定义动画或逻辑。

---

### Day 09：纹理贴图与 UV 映射机制

- **关卡名称**：贴图加载、UV 展开与像素过滤模式
- **核心知识点拆解**：
  - 纹理基础原理：2D 图像如何通过 UV 坐标映射到 3D 几何表面。
  - `TextureLoader` 异步加载机制与 `LoadingManager`（全局加载进度、完成事件、错误捕获）。
  - 纹理过滤模式（Filters）：`Minification Filter`（缩小过滤）与 `Magnification Filter`（放大过滤）。
  - `NearestFilter`（像素风利器且无需 Mipmap，节省显存） vs `LinearFilter`。
  - 纹理重复（repeat）、偏移（offset）与包裹模式（`RepeatWrapping`）。
- **动手练习任务（2 小时）**：
  - 配置 `LoadingManager`，打印加载百分比并在控制台记录。
  - 加载包含漫反射、粗糙度、法线的 PBR 纹理切片。
  - 对立方体贴上像素艺术贴图，设置 `magFilter = THREE.NearestFilter` 观察像素清晰锐利度。
- **通关验收标准（DoD）**：
  - 立方体表面正确包裹纹理，无贴图倒置或拉伸。
  - 深入掌握并能解释为什么 2 的幂次方（Power of 2，如 1024x1024）纹理对 GPU Mipmapping 至关重要。

---

### Day 10：材质体系全景解析与 PBR 基础

- **关卡名称**：光影材质、Matcap 与标准 PBR 材质
- **核心知识点拆解**：
  - 基础不发光材质：`MeshBasicMaterial`（纯色无光影）。
  - 调试与特效材质：`MeshNormalMaterial`（法向色彩，用于检查曲面弯曲）、`MeshMatcapMaterial`（通过球形烘焙贴图欺骗光照，高性能超质感）、`MeshDepthMaterial`。
  - 经典光照材质：`MeshLambertMaterial`（高光漫反射，低消耗）、`MeshPhongMaterial`（带 Blinn-Phong 高光点）、`MeshToonMaterial`（卡通风格渐变卡通贴图）。
  - 基于物理的渲染（PBR）：`MeshStandardMaterial`（粗糙度 roughness、金属度 metalness、环境光遮蔽 aoMap、位移贴图 displacementMap）。
- **动手练习任务（2 小时）**：
  - 在同一场景中并排排布球体、平面、圆环面 3 个几何体。
  - 切换并对比 `MeshMatcapMaterial` 与 `MeshStandardMaterial` 在同一光源下的渲染差别。
  - 接入 `aoMap`（环境遮蔽贴图）并配置第二套 UV：`geometry.setAttribute('uv2', ...)`。
- **通关验收标准（DoD）**：
  - 能够根据业务场景选择最适宜材质（如移动端低配选 Matcap/Lambert，写实场景选 Standard）。
  - 通过 lil-gui 动态调节 `roughness` 和 `metalness`，呈现出逼真的塑胶、哑光木质与光洁金属质感。

---

### Day 11：3D 文字排版与经典甜甜圈场景实战

- **关卡名称**：FontLoader 立体字与大批量散布资产
- **核心知识点拆解**：
  - Typeface 字体格式与 `FontLoader` 加载机制。
  - `TextGeometry` 核心参数：size（字号）、height/depth（拉伸厚度）、curveSegments（曲线精度）、bevelEnabled（倒角参数）。
  - 几何体居中难点：包围盒（Bounding Box）、`computeBoundingBox()` 与简便方法 `geometry.center()`。
  - 性能复用概念：复用同一份 `Geometry` 与 `Material`，实例化或生成大量网格。
- **动手练习任务（2 小时）**：
  - 引入 Typeface 字体，生成立体标语文字（如“Hello Three.js”），并使用 `geometry.center()` 居中。
  - 赋予文字金色质感的 `MeshMatcapMaterial`。
  - 使用循环生成 100 个随机位置、旋转和缩放的圆环（Donut），全部共用同一个几何体与材质实例。
- **通关验收标准（DoD）**：
  - 场景中央呈现立体居中文字，四周悬浮散布 100 个具有质感的漂浮甜甜圈，鼠标可全方位漫游。
  - 场景保持 60 帧流畅，几何体与材质没有在循环中重复 `new` 创建。

---

## 第二章：经典技巧篇（Day 12 ~ Day 17，共 6 节 / 12 小时）

掌握光源分布、阴影贴图开销与优化、粒子系统数学建模与鼠标射线交互检测。

---

### Day 12：灯光系统与环境氛围渲染

- **关卡名称**：六大多功能光源特性与调试
- **核心知识点拆解**：
  - 光源分类与性能开销梯度：
    - 低开销：`AmbientLight`（全向环境光）、`HemisphereLight`（半球天光/地光）。
    - 中等开销：`DirectionalLight`（平行太阳光）、`PointLight`（灯泡点光源）。
    - 高开销：`SpotLight`（聚光手电筒）、`RectAreaLight`（矩形面光源，需引入额外辅助器）。
  - 辅助调试工具：`DirectionalLightHelper`, `PointLightHelper`, `SpotLightHelper`。
- **动手练习任务（2 小时）**：
  - 搭建一个包含地板与墙壁的基础暗室场景。
  - 分别布置一个暖色 `DirectionalLight` 和一个冷色 `PointLight`。
  - 使用 lil-gui 分别控制光源强度（intensity）和颜色，并给每个光源挂载 Helper。
- **通关验收标准（DoD）**：
  - 场景展现出具有层次感和冷暖对比的照明效果。
  - 能准确列举 6 种灯光的适用场景及性能权重。

---

### Day 13：阴影渲染技术全解与贴图优化

- **关卡名称**：实时投影映射与性能瓶颈攻坚
- **核心知识点拆解**：
  - Three.js 阴影机制本质：阴影相机（Shadow Map）从光源视角渲染的深度贴图。
  - 阴影启用链条：`renderer.shadowMap.enabled = true` -> `light.castShadow = true` -> `mesh.castShadow = true` -> `receiverMesh.receiveShadow = true`。
  - 阴影精度与性能调优：
    - `shadow.mapSize.width/height` 分辨率调节（如 1024x1024）。
    - 阴影相机近远平面与正交范围精准裁切（`shadow.camera.near`, `far`, `top`, `bottom`）。
    - 阴影算法类型：`BasicShadowMap`, `PCFShadowMap`, `PCFSoftShadowMap`。
- **动手练习任务（2 小时）**：
  - 在 Day 12 场景中激活阴影系统。
  - 调整平行光的阴影相机范围紧贴物体，消除阴影锯齿与伪影。
  - （对比实验）尝试将静态阴影替换为烘焙贴图（Baked Shadow），对比帧率开销。
- **通关验收标准（DoD）**：
  - 物体投射出柔和细腻的影子落在地面上，无大块马赛克锯齿。
  - 阴影相机视锥体精确包裹投射区域，无不必要的空间算力浪费。

---

### Day 14：经典综合场景小品：闹鬼庄园（Haunted House）

- **关卡名称**：浓雾、木屋、墓碑与幽灵游走
- **核心知识点拆解**：
  - 组合场景综合架构：地基、房屋主体、金字塔屋顶、木门、灌木丛、墓碑阵列。
  - 氛围感浓雾：`THREE.Fog` 与指数级自然雾 `THREE.FogExp2`。
  - 动态幽灵效果：多个带不同颜色的 `PointLight` 结合极坐标方程与三角函数沿非线性复杂轨迹游荡。
- **动手练习任务（2 小时）**：
  - 组装小木屋并沿着庭院生成 30 个随机歪斜角度的墓碑。
  - 添加深青灰色的浓雾笼罩整座庄园。
  - 编写 3 只“幽灵点光源”，在 `tick()` 中按 `Math.cos(time * 0.5) * 4` 轨迹穿梭于墓地四周并投射动态阴影。
- **通关验收标准（DoD）**：
  - 完成一座带有神秘阴森氛围的 3D 闹鬼庄园小品。
  - 幽灵在墓碑间顺畅飘荡，光影与地表产生逼真的动态实时阴影。

---

### Day 15：粒子系统核心与 PointsMaterial

- **关卡名称**：高密度粒子云与半透明深度剔除
- **核心知识点拆解**：
  - `Points` 与 `PointsMaterial` 原理。
  - 大量粒子顶点坐标数组装配（如 10000 个粒子点）。
  - 粒子透明贴图与深度问题：
    - `alphaTest`（透明通道阈值剔除）。
    - `depthTest` 与 `depthWrite = false`（防止粒子遮挡后方粒子）。
    - `blending = THREE.AdditiveBlending`（辉光叠加混合模式）。
- **动手练习任务（2 小时）**：
  - 生成 5000 个随机分布在三维球形空间中的粒子。
  - 加载发光星芒贴图作为粒子纹理。
  - 解决粒子黑色边缘遮挡问题，并为每个顶点设置不同的随机颜色（`vertexColors = true`）。
- **通关验收标准（DoD）**：
  - 屏幕呈现出通透、闪烁且无黑边遮挡的深邃星空粒子群。
  - 即使旋转相机视角，粒子之间也保持自然的透明混合与辉光叠合。

---

### Day 16：星系生成器（Galaxy Generator）

- **关卡名称**：对数螺旋臂星系数学建模
- **核心知识点拆解**：
  - 螺旋星系数学方程：极坐标半径 $r$、螺旋角旋度 $spin$、分支数量 $branches$。
  - 散布噪点随机性算法：幂函数偏移（Power distribution）使粒子大部分聚集在旋臂中心。
  - 核心向外渐变色彩插值：`THREE.Color.lerp()` 从星系核心的暖橙色过渡到外沿的幽蓝色。
- **动手练习任务（2 小时）**：
  - 封装 `generateGalaxy()` 函数，支持在销毁旧几何体后重新生成。
  - 用 lil-gui 暴露核心参数：粒子数量（count）、旋臂数（branches）、旋度（spin）、随机散度（randomness）、核心与外圈色彩。
  - 在 `tick()` 中让整个星系缓缓自转。
- **通关验收标准（DoD）**：
  - 在调试面板调整旋臂数量或颜色时，银河系实时无缝重新计算并呈现壮丽螺旋效果。
  - 重新生成时正确调用 `geometry.dispose()` 和 `material.dispose()`，不发生内存泄漏。

---

### Day 17：光线投射与鼠标交互拾取（Raycaster）

- **关卡名称**：3D 世界的点击、悬停与事件穿透
- **核心知识点拆解**：
  - 光线投射（`Raycaster`）物理检测原理。
  - 屏幕像素坐标转归一化设备坐标（Normalized Device Coordinates, NDC）：
    $x = (clientX / width) \times 2 - 1$；$y = -(clientY / height) \times 2 + 1$。
  - 射线求交方法：`raycaster.setFromCamera(mouse, camera)`，`raycaster.intersectObjects(objects)`。
  - 鼠标移入（mouseenter）、悬浮（hover）、移出（mouseleave）与点击（click）事件状态机模拟。
- **动手练习任务（2 小时）**：
  - 在场景中放置 3 个并排浮动的球体。
  - 监听 `mousemove` 事件计算鼠标 NDC 坐标。
  - 当射线击中某个球体时，将其颜色置为高亮红；移出时恢复原状；监听 `click` 事件让被点击的球体产生弹跳。
- **通关验收标准（DoD）**：
  - 鼠标划过 3D 球体时有清晰的悬浮变色反馈，点击时能精准捕获目标网格并触发动作。
  - 能准确解释为什么屏幕坐标的 Y 轴在转换到 NDC 时必须乘以 -1。

---

## 第三章：高级技术与模型篇（Day 18 ~ Day 22，共 5 节 / 10 小时）

跨越纯展示界限，引入物理引擎动力学、真实 3D 资产加载、Blender 烘焙流程与写实渲染级环境映射。

---

### Day 18：物理引擎动力学仿真（Cannon-es）

- **关卡名称**：刚体碰撞、重力世界与视觉同步
- **核心知识点拆解**：
  - 物理引擎与图形渲染的分离架构：物理世界 `CANNON.World` vs 渲染世界 `THREE.Scene`。
  - 物理世界概念：重力（`world.gravity`）、刚体（`Body`）、碰撞体几何（`Box`, `Sphere`, `Plane`）。
  - 接触材质（`ContactMaterial`）：摩擦力（friction）与弹性恢复系数（restitution）。
  - 步进更新与位置同步：在 `tick()` 中调用 `world.step(1/60, delta, 3)`，将物理刚体的 `position` 与 `quaternion` 同步给 Three.js 网格。
- **动手练习任务（2 小时）**：
  - 搭建一个带重力下落的物理世界。
  - 创建静止地面碰撞体与可下落弹性球体，球体落地后产生真实回弹。
  - 添加点击按钮，每次点击在空中随机抛出 1 个带随机初速度的物理立方体。
- **通关验收标准（DoD）**：
  - 能够连续抛出数十个方块与球体，物体之间发生逼真的多体碰撞、堆叠与滚动反弹。
  - 画面与物理位移严密吻合，无穿模或悬空卡顿现象。

---

### Day 19：3D 模型管线与外部格式导入（GLTF / Draco）

- **关卡名称**：GLTF/GLB 模型加载与场景树遍历
- **核心知识点拆解**：
  - 现代 Web 3D 黄金标准：GLTF（JSON + 外部资源）与 GLB（二进制打包单文件）。
  - `GLTFLoader` 导入流程与异步 Promise 封装。
  - Draco 几何体压缩技术：`DRACOLoader`，WebAssembly 独立解码 worker 配置。
  - 遍历导入的模型场景树：`model.scene.traverse((child) => { ... })` 批量开启阴影投射与材质修正。
- **动手练习任务（2 小时）**：
  - 配置包含 Draco 解码器路径的 `GLTFLoader`。
  - 导入经典“小鸭子”或“飞行头盔”GLTF 模型。
  - 遍历模型所有子网格，开启 `castShadow` 和 `receiveShadow`，并将其缩放平移至画面中心。
- **通关验收标准（DoD）**：
  - 模型完整加载，几何体与材质纹理正确解析无缺失。
  - 明确掌握何时使用 Draco 压缩（大面数静态网格适合，轻量网格免去 wasm 解码开销）。

---

### Day 20：Blender 光影烘焙与三维资产优化工作流

- **关卡名称**：超低功耗超写实：光影烘焙技术
- **核心知识点拆解**：
  - 移动端渲染痛点：复杂动态光源与阴影导致帧率暴跌。
  - Blender Cycles 离线光照烘焙理念：将全局光照、环境遮蔽、软阴影全量计算并“烙印”在贴图上。
  - 烘焙模型的导入规范：网格只需要一个单一 `MeshBasicMaterial` + 烘焙贴图，彻底关停动态光源。
  - UV 坐标规范与无缝导出 GLB 流程。
- **动手练习任务（2 小时）**：
  - 获取或在 Blender 中导出包含烘焙贴图（Bake Texture）的低多边形小房间/场景。
  - 在 Three.js 中通过 `GLTFLoader` 导入该模型。
  - 将材质全量换为 `MeshBasicMaterial({ map: bakedTexture })`，并在不添加任何 Light 的情况下观察光影。
- **通关验收标准（DoD）**：
  - 场景在 0 动态光源、0 实时阴影开销的前提下，呈现出极具空间质感的柔和全局光影。
  - 渲染性能稳定跑满 60 帧，Draw Calls 与显存消耗极低。

---

### Day 21：角色骨骼动画驱动系统（AnimationMixer）

- **关卡名称**：骨骼动画播放、切片与平滑交叉过渡
- **核心知识点拆解**：
  - 骨骼蒙皮网格（`SkinnedMesh`）与骨架（`Skeleton`）。
  - `AnimationMixer` 动画混合器与 `gltf.animations` 剪辑列表。
  - `AnimationAction` 播放控制：`play()`, `stop()`, `timeScale`（倍速播放）。
  - 动作切换与交叉淡化（Cross-fading）：`actionA.crossFadeTo(actionB, 0.5, true)`。
- **动手练习任务（2 小时）**：
  - 导入包含多个动画片段的角色模型（例如带有 Idle、Walk、Run 动作的 Fox 或 Robot）。
  - 实例化 `AnimationMixer` 并在 `tick(delta)` 中执行 `mixer.update(delta)`。
  - 用 lil-gui 制作动作切换器，在“待机”与“跑步”之间执行平滑淡入淡出过渡。
- **通关验收标准（DoD）**：
  - 角色模型肢体动画生动运行，无动作撕裂。
  - 切换动作时角色姿态平滑线性过渡，不存在生硬的瞬移抽搐。

---

### Day 22：写实级渲染管线配置（Realistic Render Pipeline）

- **关卡名称**：HDR 环境贴图、色调映射与物理精度校准
- **核心知识点拆解**：
  - 渲染器色彩空间：`renderer.outputColorSpace = THREE.SRGBColorSpace`。
  - 真实物理色调映射（Tone Mapping）：`ACESFilmicToneMapping` 与曝光度调节 `renderer.toneMappingExposure`。
  - HDR 高动态范围环境贴图：`RGBELoader` 加载 `.hdr` 文件并赋予 `scene.environment` 和 `scene.background`。
  - 金属度、粗糙度与菲涅尔环境反射调试。
- **动手练习任务（2 小时）**：
  - 载入一个工业或写实汽车/头盔模型。
  - 引入 360 度室外 HDR 全景贴图作为环境光源。
  - 配置 `ACESFilmicToneMapping` 并对比开启前后的暗部细节与高光溢出效果。
- **通关验收标准（DoD）**：
  - 模型呈现电影级光影质感，金属表面能倒映环境细节，暗部通透无死黑。
  - 能向他人解释标准 sRGB 色彩空间与线性计算色彩空间的转换必要性。

---

## 第四章：着色器深入篇（Day 23 ~ Day 27，共 5 节 / 10 小时）

攻克图形学核心壁垒：GLSL 语言、顶点置换、程序化图案生成与后处理合成。

---

### Day 23：GLSL 着色器语言入门与 RawShaderMaterial

- **关卡名称**：GPU 编程范式与首个自定义 Shader
- **核心知识点拆解**：
  - CPU 串行处理 vs GPU 极度并发渲染架构。
  - 顶点着色器（Vertex Shader）定位顶点与片元着色器（Fragment Shader）计算像素色彩。
  - GLSL 数据类型与修饰符：
    - `attribute`（每个顶点专属数据，仅在顶点着色器）。
    - `uniform`（CPU 传入 GPU 的全局常量，两端均可读）。
    - `varying`（由顶点插值传递给片元的值）。
  - 投影变换流程：`gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0)`。
- **动手练习任务（2 小时）**：
  - 创建 `RawShaderMaterial`，手写内联或 `.glsl` 格式的着色器代码。
  - 在顶点着色器中利用 `sin(position.x * 10.0 + uTime)` 让平面产生波浪起伏。
  - 将高度值通过 `varying` 传给片元着色器，映射出随高度变化的渐变色。
- **通关验收标准（DoD）**：
  - 屏幕呈现随时间翻滚波动的旗帜或波浪网格。
  - 清楚理解并能默写出 MVP 矩阵（模型-视图-投影矩阵）相乘的核心逻辑。

---

### Day 24：着色器图案与数学函数美术库

- **关卡名称**：GLSL 数学函数与程序化 2D 纹理合成
- **核心知识点拆解**：
  - 常用着色器数学函数：
    - `step(edge, x)`（阶跃硬边切割）。
    - `smoothstep(edge0, edge1, x)`（平滑插值抗锯齿）。
    - `fract(x)` / `mod(x, y)`（取小数产生网格重复）。
    - `length(v)` / `distance(p1, p2)`（径向圆环生成）。
  - UV 坐标变换：旋转、拉伸、极坐标转换（$atan(y, x)$）。
- **动手练习任务（2 小时）**：
  - 在纯片元着色器中，不使用任何外部图片贴图。
  - 依序手写实现 5 种经典图案：棋盘格、柔光径向圆斑、动态雷达扫描线、发光同心圆环、黑白光波斑马纹。
- **通关验收标准（DoD）**：
  - 独立完成一个包含图案切换菜单的片元着色器展示页面。
  - 熟练运用 `smoothstep` 处理高频边缘抗锯齿。

---

### Day 25：浪涌水面着色器实战（Raging Sea）

- **关卡名称**：多频正弦叠加、柏林噪声与真实海浪
- **核心知识点拆解**：
  - 真实海面的数学解构：大浪基频（低频大波）+ 小浪碎波（高频小波叠加）。
  - 经典柏林/单纯形噪声（Perlin/Simplex Noise）GLSL 函数接入。
  - 水面颜色分层算法：根据波峰与波谷高度，在深水色（Depth Color）与浪尖浅水色（Surface Color）之间执行 `mix()` 插值。
  - 泡沫高光与菲涅尔视线反射感。
- **动手练习任务（2 小时）**：
  - 创建一个 256x256 分段高细分平面。
  - 在顶点着色器中集成噪声函数，结合多层正弦波合成汹涌波涛。
  - 通过 `uniform` 将波峰高度、波速、海浪颜色全部接入 lil-gui 进行调优。
- **通关验收标准（DoD）**：
  - 渲染出翻滚起伏且具层次感的生动海面，波峰与波谷有明暗色彩渐变。
  - 动态参数通过面板调节时海浪运动自然流畅。

---

### Day 26：动态粒子与自定义顶点着色器

- **关卡名称**：着色器驱动的大规模粒子演化
- **核心知识点拆解**：
  - 结合 `ShaderMaterial` 与 `THREE.Points`。
  - 粒子大小视距衰减算法：`gl_PointSize = uSize * (1.0 / -viewPosition.z)`。
  - 顶点着色器中对粒子进行三维涡旋、散逸动力学计算（免去 CPU 逐点计算的性能开销）。
  - 片元着色器绘制发光圆形粒子光斑（利用 `gl_PointCoord` 与 `distance`）。
- **动手练习任务（2 小时）**：
  - 将 Day 16 的星系生成器重构为 ShaderMaterial 驱动。
  - 将旋转与扩散逻辑全量迁移至 GPU 顶点着色器中运行。
  - 在片元着色器中裁切圆形光晕并混合自发光色彩。
- **通关验收标准（DoD）**：
  - 即使将粒子数提升至 50,000 ~ 100,000 个，页面依然保持稳定 60 帧满帧运行。
  - 粒子近大远小符合透视规律，且中心柔和发亮边缘平滑。

---

### Day 27：屏幕后处理通道与特效渲染（Post-Processing）

- **关卡名称**：电影级全屏后期、辉光与色差特效
- **核心知识点拆解**：
  - 后处理基本原理：离屏渲染（Offscreen Render）到纹理，全屏正交四边形再次着色。
  - Three.js 后处理架构：`EffectComposer`, `RenderPass`。
  - 经典开箱即用通道：`UnrealBloomPass`（赛博朋克辉光/发光霓虹）、`DotScreenPass`、`GlitchPass`。
  - 自定义后处理 ShaderPass：手写色相差移（RGB Shift）通道。
- **动手练习任务（2 小时）**：
  - 在包含发光几何体的场景中配置 `EffectComposer`。
  - 叠加 `UnrealBloomPass`，调试辉光阈值（threshold）、强度（strength）和半径（radius）。
  - 自定义一个简单的晕影（Vignette）片元着色通道附加于合成管线末端。
- **通关验收标准（DoD）**：
  - 场景中的发光体呈现出柔和迷人的光晕溢出效果，整个画面有复古电影胶片暗角质感。
  - 能准确排查后处理带来的抗锯齿失效问题并配置 FXAAPass / SMAAPass 补偿。

---

## 第五章：综合实战与工程化篇（Day 28 ~ Day 30，共 3 节 / 6 小时）

从个人 Demo 迈向工业级生产交付：性能排查优化、大型工程架构重构与作品级项目发布。

---

### Day 28：渲染性能优化与工程级避坑指南

- **关卡名称**：Draw Calls 减负、实例化与显存泄漏终结
- **核心知识点拆解**：
  - 性能金指标：FPS、Frame Time、Draw Calls、Geometries 数量、Textures 显存占用。
  - 性能排查工具：`stats.js`, `r3f-perf`, Chrome Spector.js 扩展抓帧。
  - 合批利器：`InstancedMesh`（以单次 Draw Call 渲染成千上万个独立网格）。
  - 资源销毁终极准则：`geometry.dispose()`, `material.dispose()`, `texture.dispose()` 防止 SPA 页面内存泄漏。
- **动手练习任务（2 小时）**：
  - 编写对比案例：渲染 10,000 个分散运动的方块。方案 A 使用常规 Mesh 循环；方案 B 使用 `InstancedMesh`。
  - 使用 Spector.js 查看两种方案的 Draw Calls 数量并记录帧率差别。
  - 编写一个严格的场景注销清理函数 `destroy()`。
- **通关验收标准（DoD）**：
  - 方案 B 的 Draw Calls 压缩至 1~2 次，帧率从卡顿拉升至稳定 60 FPS。
  - 路由跳转或页面注销时显存完全释放，无残留悬挂引用。

---

### Day 29：面向对象与大型 Three.js 项目代码架构

- **关卡名称**：解耦分层：单例与模块化工程重构
- **核心知识点拆解**：
  - 拒绝“单文件千行面条代码”：面向对象（OOP）分层设计哲学。
  - 工业级核心模块划分：
    - `Experience.js`（入口单例与协调中枢）。
    - `Sizes.js`（视口尺寸与 Resize 事件监听派发）。
    - `Time.js`（Clock 增量与 Tick 渲染循环中枢）。
    - `Camera.js` / `Renderer.js`（相机与渲染底层驱动）。
    - `Resources.js`（统一资产加载与就绪事件通知器）。
    - `World.js`（具体业务实体装配：环境、角色、地形）。
  - 自制事件发射器 `EventEmitter` 实现各层级松耦合通信。
- **动手练习任务（2 小时）**：
  - 遵循 Bruno Simon 生产级架构模板，从零组织并重构前面编写的代码。
  - 建立上述完整的文件目录结构，将场景资产的加载、相机的控制与时钟循环彻底分离。
- **通关验收标准（DoD）**：
  - 项目根目录结构井井有条，各个模块职责单一（Single Responsibility Principle）。
  - 任何新增模型或特效仅需在 `World/` 下扩展子类，无需改动核心运行管线。

---

### Day 30：终极综合实战与作品集交付（Portal Scene / 3D 展馆）

- **关卡名称**：生产级 3D 传送门全栈打磨与上线
- **核心知识点拆解**：
  - 资产整合：烘焙主场景模型 + 自定义光斑 Shader + 传送门内部流光 Shader。
  - 动态交互：鼠标悬浮微交互、光线投射拾取、全屏响应与平滑轨道控制器。
  - 生产构建与轻量化交付：静态资源压缩、Gzip/Brotli、Vercel/Netlify 自动化一键部署。
- **动手练习任务（2 小时）**：
  - 整合一个完整的“神秘传送门（Portal Scene）”综合场景：
    - 导入 Blender 烘焙场景。
    - 在传送门门框内部添加自定义流动 Shader。
    - 在门四周散布微光粒子。
  - 运行 `npm run build` 输出优化后的生产产物，并部署至公网服务器。
- **通关验收标准（DoD）**：
  - 获得一个可公开访问的 Web 3D 在线作品集链接。
  - 首屏加载平稳，附带优雅的进度加载动画，移动端与桌面端均能顺畅交互并跑满 60 帧。

---

## 30 天通关全景能力自测矩阵

完成本 30 天自学旅程后，请对照下表进行能力自查：

| 评估维度 | 达标水平（DoD 标准） | 对应关卡 |
| :--- | :--- | :--- |
| **基础概念** | 能独立闭卷搭建 Scene、Camera、Renderer、Mesh 与渲染循环，掌握常见几何体与材质区别 | Day 01 ~ 11 |
| **光影与材质** | 熟练配置 6 种光源与阴影相机锥体，掌握 PBR 物理材质与 Matcap/烘焙贴图优化取舍 | Day 10, 12 ~ 14 |
| **粒子与数学** | 能运用极坐标、对数螺旋与三角函数生成动态星系与大规模散布粒子 | Day 15 ~ 16 |
| **交互与物理** | 掌握 NDC 坐标射线拾取算法，能整合 Cannon-es / Rapier 物理引擎做动力学碰撞 | Day 17 ~ 18 |
| **资产与工作流** | 熟练使用 GLTFLoader / Draco 加载外部资产，理解 Blender 烘焙贴图及角色骨骼动画驱动 | Day 19 ~ 22 |
| **Shader 编程** | 掌握 GLSL 核心语法、MVP 矩阵变换，能编写顶点波浪置换、程序化图案与后处理通道 | Day 23 ~ 27 |
| **工程与性能** | 具备大型项目 OOP 解耦架构能力，能熟练运用 InstancedMesh 降 Draw Calls 并彻底避免显存泄漏 | Day 28 ~ 30 |

---

## 后续进阶路线建议

1. **进入 React Three Fiber（R3F）与 Drei 生态**：如果主要技术栈为 React，在掌握 Three.js 原生底层逻辑后，学习声明式 3D 开发将事半功倍。
2. **深入图形学与着色器（Shadertoy & WebGPU）**：进阶研读《The Book of Shaders》，关注下一代标准 WebGPU 与 TSL（Three.js Shading Language）。
3. **商业项目实战落地**：尝试开发 3D 电商商品展示器、数字孪生智慧园区看板或交互式 3D 品牌叙事官网。
