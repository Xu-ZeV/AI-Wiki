# Three.js Journey Quickstart Demo 教学演示工程

本工程是配合自学指南构建的开箱即用现代 3D 快速入门模板，基于 **TypeScript + Vite + Three.js r160+ + lil-gui** 构建，专为零基础三维空间学习者设计。

> 📚 **关联学习路径**：
> 请先阅读完整指南：[Three.js 每日 2 小时自学路径](../../../wiki/synthesis/threejs-journey-learning-path.md)，结合路线图规划学习日程。

---

## 🛠️ 项目定位与技术栈

- **类型系统**：[TypeScript](https://www.typescriptlang.org/)（严格类型约束、完备的 Three.js API 类型提示与调试接口建模）
- **构建工具**：[Vite](https://vitejs.dev/)（毫秒级 HMR 热更新，极速开发体验）
- **核心三维库**：[Three.js](https://threejs.org/)（当前主流 WebGL 3D 库，内置阴影映射与 PBR 标准材质）
- **交互控制器**：`OrbitControls`（支持平滑阻尼 Damping，丝滑的旋转、平移、缩放手势交互）
- **调试套件**：[lil-gui](https://lil-gui.georgealways.com/)（轻量、现代的实时参数调试控制面板）
- **健壮性保障**：内置 WebGL 环境可用性嗅探与优雅降级提示卡片。

---

## 🚀 快速启动指引

### 1. 安装依赖

进入项目根目录后执行：

```bash
npm install
```

### 2. 启动本地开发服务器

```bash
npm run dev
```

终端将输出本地访问地址（通常为 `http://localhost:5173`），在现代浏览器打开即可实时预览三维场景。

### 3. 类型检查（TypeScript Type Check）

在代码开发或提交前，可运行严格类型校验，确保无类型报错：

```bash
npx tsc --noEmit
```

### 4. 构建生产版本与预览

```bash
# 执行类型检查并在无错后编译打包输出 dist 目录（tsc && vite build）
npm run build

# 本地静态预览生产构建物
npm run preview
```

---

## 🧭 首日练习指引与 lil-gui 调试玩法

本模板已经为你配置好完整的「场景 - 物体 - 光照 - 相机 - 控制器 - 渲染循环」六大要素。第一天建议按照以下步骤动手探索：

### 1. 探索 lil-gui 调试台（右上角）
- **材质观察（PBR Standard Material）**：
  - 调节 **粗糙度（Roughness）**：由 `0` 到 `1` 观察高光亮点从锐利镜面到柔和漫反射的变化。
  - 调节 **金属度（Metalness）**：观察高反光质感与暗部反差。
  - 勾选 **线框模式（Wireframe）**：透视几何体三角网格拓扑结构。
- **光照交互**：
  - 滑动调节 **平行光强度（Light Intensity）**，观察阴影与明暗界线的对比度。
- **动画控制**：
  - 开启/关闭 **旋转动画（Auto Rotate）**，拖动滑块体验不同帧率下基于 `DeltaTime` 均匀旋转的平滑效果。

### 2. 代码动手实验（建议在 `src/main.ts` 中实践）
- **更换几何体**：尝试将 `THREE.BoxGeometry(1, 1, 1)` 替换为 `THREE.SphereGeometry(0.8, 32, 32)` 或 `THREE.TorusKnotGeometry(0.6, 0.2, 128, 16)`，查看不同曲面在光照下的明暗过渡。
- **增设点光源**：实例化 `new THREE.PointLight(0xff7700, 2, 10)` 并赋予一个动态移动的位置，观察多光源叠加效果。
- **相机视野调整**：修改 `PerspectiveCamera` 的视野角（FOV 从 65 改为 45 或 90），感受广角畸变与望远镜长焦压缩感。

---

## 📁 目录结构

```text
demo/
├── index.html        # 主页面骨架与 WebGL 降级提示 DOM
├── package.json      # 项目依赖与运行脚本（包含 TypeScript 与 @types/three）
├── tsconfig.json     # TypeScript 严格编译与类型检查配置
├── README.md         # 教学项目使用与首日指引说明
└── src/
    ├── main.ts       # Three.js 场景构建、光照、类型定义与渲染循环
    └── style.css     # 全屏固定视口及降级卡片样式
```
