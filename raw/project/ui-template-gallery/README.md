# UI 模板库展示工程 (UI Template Gallery)

本项目基于 **Vue 3 + Vite + TypeScript + Vue Router** 构建，用于承载与交互展示知识库前端组件模板 Skill（`ui-template-library`）收纳的四大高保真、高性能生产级控件。

每个控件均拥有独立的路由入口、自包含数据源、物理阻尼动效驱动与交互演示，并在全局吸顶导航中提供无缝的「返回画廊」流转能力。

---

## 🛠️ 技术栈与规范

- **框架**：Vue 3.5+（全量采用 Composition API `<script setup lang="ts">`）
- **路由**：Vue Router 4.4+（懒加载路由、动态标题与技术徽章元数据）
- **构建工具**：Vite 5.4+（配置独立端口 `5180`，与既有工程物理隔离）
- **类型系统**：TypeScript 5.6+（`vue-tsc` 严格类型检查，无 `any` 绕过）
- **动效标准**：严格遵循 60fps 硬件加速守卫（仅改动 `transform`，杜绝动态 `backdrop-filter` 损耗，单实例光晕共享）
- **无障碍适配**：WCAG 2.1 AA 标准、44px 黄金触控区、`@media (prefers-reduced-motion)` 与 `@media (hover: none)` 优雅降级

---

## 🗺️ 路由与控件入口

| 路由路径 | 控件名称 | 核心交互与动效特征 | 技术实现与关键文件 |
|---|---|---|---|
| `/` | **画廊总览首页** | 四大控件交互卡片阵列、动效特征标签、技术徽章与统计面板 | `views/HomeView.vue`<br>`components/gallery/TemplateCard.vue` |
| `/glass-board` | **控件一：玻璃倾斜画板** | 24~30 块面板 3D 鼠标视差倾斜、切片拼图对齐、点击空白波浪翻转切图 | `views/GlassBoardView.vue`<br>`composables/useGlassBoard.ts`<br>`styles/glass-board.css` |
| `/nav-capsule` | **控件二：胶囊导航栏与按钮** | 弹性磁吸 Glider 滑块、360° 单向顺时针微弹性旋转、吸顶正圆折叠与悬停互斥让位 | `views/NavCapsuleView.vue`<br>`components/nav-capsule/NavCapsuleBar.vue`<br>`composables/useNavCapsule.ts` |
| `/glass-search` | **控件三：磨砂流光搜索框** | 44px 药丸胶囊、底部双层径向渐变环境呼吸扫光（3.6s/2.6s/2.0s）、250ms 防抖过滤与令牌换肤 | `views/GlassSearchView.vue`<br>`components/glass-search/GlassSearchBar.vue`<br>`styles/glass-search.css` |
| `/card-hover-halo` | **控件四：列表卡片跟随光晕** | 容器单实例共享 `.card-hover-halo`、高斯弥散无界化（18px 模糊）、Damped Lerp（0.11）滞后滑行与微视差追踪 | `views/CardHoverHaloView.vue`<br>`components/card-halo/CardListWithHalo.vue`<br>`composables/useCardHalo.ts` |
| `/:pathMatch(.*)*` | **404 容错页** | 未知路由友好拦截、重定向引导与一键返回画廊首页 | `views/NotFoundView.vue` |

---

## 🚀 本地开发与构建

### 1. 安装依赖
```bash
# 采用国内镜像源安装（已通过 .npmrc 固化）
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
# 访问地址：http://localhost:5180
```

### 3. 类型检查与生产打包
```bash
npm run build
# 执行 vue-tsc --noEmit 类型校验与 vite build 生产打包
```

### 4. 自动化全量工程校验
```bash
node scripts/verify-all.mjs
```

---

## 📂 目录结构

```text
raw/project/ui-template-gallery/
├── .gitignore              # 局部 Git 忽略规则 (node_modules, dist)
├── .npmrc                  # 镜像源固化配置
├── index.html              # HTML 模板入口
├── package.json            # 依赖与脚本定义
├── tsconfig.json           # TypeScript 严谨编译配置
├── vite.config.ts          # Vite 配置（端口 5180，@ 别名）
├── scripts/
│   └── verify-all.mjs      # 自动化静态与产物巡检脚本
└── src/
    ├── main.ts             # 应用入口
    ├── App.vue             # 全局应用壳与公共吸顶顶栏装配
    ├── style.css           # 全局暗色质感基础样式与变量
    ├── types/              # 全局核心类型声明
    ├── data/
    │   ├── templates.ts    # 四大控件元数据定义
    │   └── mockImages.ts   # 4 套自包含高清矢量/图案切图数据源
    ├── components/
    │   ├── layout/         # AppNavbar.vue 全局自适应吸顶导航
    │   ├── gallery/        # TemplateCard.vue 画廊卡片
    │   ├── nav-capsule/    # NavCapsuleBar.vue 胶囊导航栏组件
    │   ├── glass-search/   # GlassSearchBar.vue 流光搜索框组件
    │   └── card-halo/      # CardListWithHalo.vue 跟随光晕卡片列表
    ├── composables/
    │   ├── useGlassBoard.ts # 玻璃画板 3D 视差与切图调度
    │   ├── useNavCapsule.ts # 胶囊导航栏 Glider 几何与旋转状态机
    │   └── useCardHalo.ts   # 卡片光晕 Damped Lerp 物理阻尼引擎
    ├── styles/             # 控件专用独立样式规范（CSS 解耦）
    └── views/              # 各独立路由视图页面
```
