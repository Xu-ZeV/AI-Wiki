---
title: HTML PPT 工作室
skill: html-ppt
category: 演示文稿与网页幻灯片
category_slug: presentation-web-slides
source: raw/SkillHub/.agents/skills/html-ppt/SKILL.md
tags:
  - SKILL
  - SKILL/presentation-web-slides
---
# HTML PPT 工作室

> [!info] Skill 元信息
> 原始名称：`html-ppt`  
> 原始标题：html-ppt - HTML PPT Studio  
> 功能分类：演示文稿与网页幻灯片  
> 原始文件：[SKILL.md](../../../raw/SkillHub/.agents/skills/html-ppt/SKILL.md)  
> 上游仓库：[lewislulu/html-ppt-skill](https://github.com/lewislulu/html-ppt-skill)  
> 许可证：MIT

## 中文含义与用途

中文含义：用主题、布局、动效和演讲者模式模板生成专业静态 HTML 演示文稿。  
核心用处：把大纲、笔记或资料转成可键盘导航、可换主题、可带逐字稿和演讲者窗口的网页 PPT，同时保留纯静态 HTML/CSS/JS 的交付方式。

## 适用场景

- 技术分享、团队演讲、课程模块和产品发布 deck
- 投资人 pitch、周报、正式汇报和学术报告
- 小红书图文、多页视觉卡片和轻量分享稿
- 需要快速从模板起步，并在主题、布局和动效之间组合的 HTML slides
- 需要演讲者视图、当前页/下一页预览、逐字稿和计时器同步的现场演讲

## 资源能力

| 资源 | 数量 | 作用 |
| --- | ---: | --- |
| 主题 | 36 | 通过 `assets/themes/*.css` 替换 token，让同一 deck 切换不同视觉风格。 |
| 完整 deck 模板 | 15 | 提供 pitch、产品发布、技术分享、周报、小红书、课程和演讲者模式等场景脚手架。 |
| 单页布局 | 31 | 覆盖封面、目录、图表、代码、时间线、路线图、架构图、CTA 和 thanks 等页面类型。 |
| CSS 动画 | 27 | 使用 `data-anim` 或动画类给元素添加轻量入场和强调动效。 |
| Canvas FX 动画 | 20 | 使用 `data-fx` 调用粒子、烟花、星空、知识图谱、神经网络、数据流等画布效果。 |
| Showcase deck | 4 | 用真实 iframe 预览主题、布局、动画和完整 deck 模板。 |
| 验证截图 | 56 | 保留主题和动画 showcase 的自测截图，便于核对渲染效果。 |

## 主题与模板体系

- 主题从 `minimal-white`、`editorial-serif`、`swiss-grid`、`corporate-clean` 到 `cyberpunk-neon`、`vaporwave`、`xiaohongshu-white`、`magazine-bold`，覆盖正式汇报、工程分享、学术报告、小红书图文和视觉发布。
- 完整 deck 模板分为两类：一类从真实作品提炼视觉语言，另一类面向 pitch、product launch、tech sharing、weekly report、xhs post、course module 和 presenter mode reveal 等常见场景。
- 单页布局都带示例数据，推荐先复制最接近的模板，再替换内容；只有现有 31 个布局无法覆盖时才新增布局文件。
- 所有页面共享 `assets/base.css` 中的 token 化设计系统，颜色、圆角、阴影和字体应通过 CSS 变量表达，而不是在页面里写死。

## 演讲者模式

- 当用户提到演讲、分享、讲稿、逐字稿、speaker notes、presenter view 或提词器时，优先使用 `templates/full-decks/presenter-mode-reveal/`。
- 观众窗口按 `S` 会打开独立演讲者窗口，包含当前页预览、下一页预览、逐字稿和计时器四块可拖拽、可缩放的卡片。
- 当前页和下一页预览通过 iframe 加载同一份 deck HTML，并用 `?preview=N` 只渲染指定页面，保证与观众视图使用相同 CSS、主题、字体和 viewport。
- 演讲者窗口和观众窗口通过 `BroadcastChannel` 同步翻页；预览 iframe 使用 `postMessage` 切页，避免重复加载和闪烁。
- 逐字稿建议写入每页的 notes 区域，按每页 150-300 字控制为约 2-3 分钟节奏，并使用口语化提示信号而不是书面长稿。

## 核心工作流

1. 先确认内容、页数、观众和使用场景；如果资料已经充分，则给出 2-3 个合适主题与模板默认建议。
2. 从 `templates/full-decks/<name>/` 或 `templates/deck.html` 新建 deck，避免从空白页面手写。
3. 根据内容从 `templates/single-page/*.html` 复制页面块，替换为真实标题、要点、图表或图片。
4. 用 `assets/themes/*.css` 选择主题，并通过 `T` 键或固定 `<link>` 切换风格。
5. 用 `data-anim` 添加 CSS 动画，必要时用 `data-fx` 启用 Canvas FX，并引入 `fx-runtime.js`。
6. 保留 `runtime.js`，确保左右键、空格、主题切换、动画切换、全屏、总览、notes 抽屉和演讲者模式可用。
7. 用 `scripts/render.sh` 调用 headless Chrome 导出 PNG，或直接在浏览器中打开 HTML 进行演示。

## 使用边界与注意事项

- 该 skill 偏向“模板库 + 主题系统 + 运行时”，适合快速组合高质量静态 HTML slides；不负责生产级后端、在线协作或复杂编辑器。
- `scripts/render.sh` 默认包装 macOS Chrome 路径；在 Windows 上导出 PNG 前需要按本机 Chrome 路径调整脚本或改用其他渲染命令。
- 不应把面向演讲者的解释文字放进可见 slide 内容；提示、逐字稿和补充讲述应放在 notes 区域。
- 主题、布局、完整 deck 和 showcase 都依赖纯静态文件；字体、highlight.js 或 chart.js 等外部资源可能通过 CDN 加载。
- 当前 raw 层由 `skills` CLI 复制安装，不是 Git 工作树；后续更新应优先重新执行安装或使用 `skills` CLI 更新流程。

## 与相关 Skill 的区别

- `html-ppt` 侧重丰富主题、布局、动效、showcase 和 Presenter Mode，是快速生产多风格 HTML slides 的模板工作室。
- `guizang-ppt-skill` 侧重归藏网页 PPT 的叙事流程、电子杂志风与瑞士国际主义两套严格视觉系统，以及演讲者模式和质量校验。
- `huashu-design` 覆盖更大的 HTML 原生视觉生产线，包括原型、动画、信息图、PDF/PPTX/视频导出和设计评审。

## 原始描述中文摘要

用 36 套主题、15 套完整 deck 模板、31 种页面布局、27 个 CSS 动画、20 个 Canvas FX 和带逐字稿的演讲者模式，生成纯静态 HTML/CSS/JS 演示文稿。

## 原始文档章节

- Install
- What the skill gives you
- When to use
- Presenter Mode
- Before you author anything
- Quick start
- Authoring rules
- Writing guide
- Catalogs
- File structure
- Rendering to PNG
- Keyboard cheat sheet
- License and author

## 相关 Skill

- [[wiki/SkillHub/skills/guizang-ppt-skill|归藏网页 PPT 生成]]
- [[wiki/SkillHub/skills/huashu-design|花叔 HTML 原生设计生产线]]
- [[wiki/SkillHub/skills/design-taste-frontend|高级前端设计品味]]
- [[wiki/SkillHub/skills/high-end-visual-design|高端视觉设计与动效编排]]
