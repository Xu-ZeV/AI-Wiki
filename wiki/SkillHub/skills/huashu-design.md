---
title: 花叔 HTML 原生设计生产线
skill: huashu-design
category: 高级前端 UI 设计与重构
category_slug: frontend-ui-design
source: raw/SkillHub/.agents/skills/huashu-design/SKILL.md
tags:
  - SKILL
  - SKILL/frontend-ui-design
---
# 花叔 HTML 原生设计生产线

> [!info] Skill 元信息
> 原始名称：`huashu-design`  
> 原始标题：花叔Design · Huashu-Design  
> 功能分类：高级前端 UI 设计与重构  
> 原始文件：[SKILL.md](../../../raw/SkillHub/.agents/skills/huashu-design/SKILL.md)  
> 上游仓库：[alchaincyf/huashu-design](https://github.com/alchaincyf/huashu-design)  
> 许可证：MIT

## 中文含义与用途

中文含义：以 HTML/CSS/JavaScript 为统一工作媒介，完成高保真原型、网页、幻灯片、动画、信息图和设计评审，并把结果导出为浏览器交付物、PDF、MP4、GIF 或可编辑 PPTX。  
核心用处：为不想依赖 Figma、After Effects 或 PowerPoint 手工流程的用户，提供从事实核验、品牌资产、设计方向、实现、浏览器验证到多格式导出的完整视觉生产线。

## 适用与不适用场景

适合：

- 可点击的 App 或 Web 高保真原型
- HTML 原生演示文稿与浏览器演讲 deck
- 产品发布动画、功能演示、带解说长视频和 MP4/GIF 导出
- 设计变体探索、Tweaks 实时调参、信息图与数据可视化
- 对现有设计进行五维度专家评审

不适合：

- 需要后端、SEO、长期业务维护的生产级 Web App
- 复杂三维、物理模拟和粒子系统等专业级动画
- 要求 PPTX 与 Figma 之间保持完整图层级往返编辑的流程

## 交付能力矩阵

| 任务 | 主要交付物 | 核心实现 |
| --- | --- | --- |
| 交互原型 | 单文件或多文件 HTML | React/Babel 或纯 HTML/CSS、设备框组件、Playwright 点击验证 |
| 演示文稿 | HTML deck、PDF；按需派生可编辑 PPTX | 多文件概览墙或单文件 `deck_stage.js`、Playwright、pdf-lib、PptxGenJS |
| 动画 | 带 BGM 与 SFX 的 MP4，可派生 GIF | Stage/Sprite 时间轴或 HyperFrames、逐帧渲染、ffmpeg |
| 信息图与可视化 | HTML、PDF、PNG、SVG | CSS Grid、精确排印、真实数据与素材 |
| 设计评审 | 评分与修复清单 | 哲学一致性、视觉层级、细节执行、功能性、创新性五维度评审 |

## 核心机制

### 三方向硬门

任何会产生新视觉设计的任务，默认先交付三套可见的真实初稿，再由用户选定方向；指定品牌或风格也不自动豁免。三套逻辑分别是：

1. 秒数轮盘：从网页或 PPT 的二十种 HTML 原生风格中抽取一个方向，打破模型反复选择安全极简风的惯性。
2. 现实参照：核验并拆解真实的获奖网站、优秀演示文稿或原型案例，再迁移其设计语言。
3. 最佳设计师：选择最适合该产品的设计师或工作室，以其设计哲学重新构建方案。

三版需要使用相同真实内容和素材，但布局骨架必须有结构差异；展示后暂停，等待用户选定或混合方向，并把选择写入 `direction-approved.md`。

### 事实与品牌资产优先

- 涉及具体产品、版本、发布时间或规格时，先通过网络核验，再写入 `product-facts.md`。
- 设计中出现可识别品牌或产品时，先取得官方 logo、产品图、UI 截图、色板和字体规范。
- 资产经过验证后固化为 `brand-spec.md`，所有方向共享同一套真实品牌资产。
- 内容必需的图片必须先获取；失败时按公共图库、生成能力、诚实占位三级降级，不用 CSS 剪影冒充产品图。

### Junior Designer 工作流

Skill 强调先暴露假设，再逐步深化：先写 assumptions、reasoning 与 placeholders，尽早向用户展示；方向确认后完成组件、内容和交互；中途再次展示；最后用浏览器和 Playwright 检查。其目标是把高成本的晚期返工前移为低成本的早期纠偏。

### 反 AI slop

设计不得依赖紫色渐变、emoji 图标、圆角卡片加彩色左边框、通用霓虹暗色背景、伪造数据或手绘劣质产品图等默认套路。正向要求包括：从内容推导视觉母题、使用真实品牌资产、建立明确排版层级、控制信息密度，并让每个元素都承担叙事或功能。

## 幻灯片工作流

- 默认交付链：HTML deck → 自动导出 PDF → 用户需要时再尝试派生可编辑 PPTX。
- 五页及以上 deck 先完成两页 showcase，确认视觉 grammar 后再批量制作其余页面。
- 默认架构是“每页独立 HTML + `assets/deck_index.html` 概览墙”，统一处理缩放、翻页、计数、打印与缩略图。
- 五页以内、无需概览墙或必须跨页共享 JavaScript 状态时，才选择单文件 `assets/deck_stage.js`。
- 可编辑 PPTX 由 `html2pptx.js` 读取 DOM computed style 并翻译为 PowerPoint 文本框、形状与图片；这是受约束的 best-effort 衍生物，不能为了满足转换器而降低 HTML 主版本的视觉质量。

## 动画与视频工作流

- 动画开工前先画轻量分镜卡，明确镜头、构图、运镜和验收帧。
- 新动画默认使用 HyperFrames 后端；弱 runtime、单文件交付或纯交互演示可使用内置 Stage/Sprite 管线。
- 成片默认同时包含 BGM 与 SFX，并用 `ffprobe` 验证音轨；用户明确要求纯画面时才跳过音频。
- 长解说视频以解说稿和真实 TTS 时间线驱动画面，要求核心视觉元素跨场景连续演化，避免做成逐页淡入淡出的“带配音 PowerPoint”。
- 动画产出默认带 `Created by Huashu-Design` 水印；幻灯片、原型、网页和信息图不添加。

## Gate 文件与质量检查

| 文件 | 适用条件 | 作用 |
| --- | --- | --- |
| `brand-spec.md` | 涉及具体品牌或产品 | 记录真实资产、品牌色、字体、禁区与文件路径 |
| `direction-approved.md` | 新视觉实现开工前 | 保存三版初稿、截图路径与用户选择原话 |
| `导演稿.md` 或 director's notes | 二十秒以上动画；发布片需要加强版 | 固化分镜、视觉密度、镜头语言和验收标准 |

交付前还需进行 Playwright 截图、控制台错误检查、交互验证和肉眼浏览器检查。设计评审以五个维度分别打分，并输出 Keep、按严重程度分级的 Fix，以及可立即执行的 Quick Wins。

## 资源结构

| 资源 | 作用 |
| --- | --- |
| `assets/` | deck 概览墙、Stage/Sprite、设备框、光标、变体画布、音乐音效和展示样例 |
| `references/` | 设计风格、幻灯片、PPTX、动画、运镜、音频、评审、验证和品牌资产协议 |
| `scripts/` | 截图与验证、图片抓取、PDF/PPTX 导出、视频录制、格式转换、配音与音频混合 |
| `demos/` | 原型、幻灯片、动画、信息图、评审和工作流能力演示 |
| `SECURITY.md` | 网络目标、密钥、子进程、删除范围、依赖和显式同意机制声明 |

本次安装核验结果：`references/` 32 个文件、`assets/` 105 个文件、`scripts/` 19 个文件、`demos/` 23 个文件；并非只有单独的 `SKILL.md`。

## 安全、依赖与运行注意事项

- HTML 设计、浏览器渲染和 MP4/PDF/PPTX 导出核心链路可完全在本地运行。
- 云端 AI 视频评审与豆包 TTS 位于 `scripts/cloud/`，使用用户自己的密钥，并要求 `--yes` 或 `HUASHU_CLOUD_OK=1` 显式同意。
- 图片搜索、品牌资产下载以及生成 HTML 中的字体/CDN 链接可能产生网络请求；无遥测，也不向 Skill 作者服务器发送数据。
- 主要 Node 依赖为 `playwright`、`sharp`、`pptxgenjs` 与 `pdf-lib`；媒体链路还可能调用本机 `ffmpeg`、`ffprobe` 和 `ffplay`。
- `npx hyperframes init` 是可选动作，会额外安装一组 HyperFrames 文档 skill，执行前应审阅其影响。
- 当前 raw 层内容由 `skills` CLI 复制安装，不是 Git 工作树；更新应使用 `npx skills update` 或重新执行安装命令。
- 安装器扫描结果为 Gen：Safe、Snyk：Low Risk，同时 Socket 报告 2 项提醒；实际启用脚本或云能力前仍应审阅 `SECURITY.md` 与相应代码。

## 弱 Runtime 降级

在无 subagent、上下文较小或不适合多文件并行的环境中，可以把三方向并行改为串行，进一步降为一个主版加两个轻量色板/排印变体；只读取当前任务对应 reference，并可将 deck 改为单文件。降级可以牺牲流程和多样性，但不能跳过真实资产、反 AI slop 与 Gate 文件。

## 原始描述中文摘要

用 HTML 完成高保真原型、幻灯片、动画、信息图与专家评审；所有新设计先做三套真实视觉方向供用户选择，再通过真实产品事实、品牌资产、分阶段确认和自动化验证完成交付，并按任务导出 PDF、PPTX、MP4 或 GIF。

## 原始文档章节

- 使用前提与任务路由
- 事实验证与品牌资产协议
- 核心设计哲学与反 AI slop
- 设计方向顾问七阶段流程
- App / iOS 原型专属守则
- 标准工作流、检查点与 Gate 文件
- 动画、音频、配音和视频导出
- 技术红线、Starter Components 与 References 路由表
- 跨 Agent 环境适配、弱 Runtime 降级与产出要求

## 相关 Skill

- [[wiki/SkillHub/skills/guizang-ppt-skill|归藏网页 PPT 生成]]
- [[wiki/SkillHub/skills/design-taste-frontend|高级前端设计品味]]
- [[wiki/SkillHub/skills/high-end-visual-design|高端视觉设计与动效编排]]
- [[wiki/SkillHub/skills/image-to-code|图片优先的网站设计到代码]]
