---
title: 归藏网页 PPT 生成
skill: guizang-ppt-skill
category: 演示文稿与网页幻灯片
category_slug: presentation-web-slides
source: raw/SkillHub/.agents/skills/guizang-ppt-skill/SKILL.md
tags:
  - SKILL
  - SKILL/presentation-web-slides
---
# 归藏网页 PPT 生成

> [!info] Skill 元信息
> 原始名称：`guizang-ppt-skill`  
> 原始标题：Magazine Web Ppt  
> 功能分类：演示文稿与网页幻灯片  
> 原始文件：[SKILL.md](../../../raw/SkillHub/.agents/skills/guizang-ppt-skill/SKILL.md)  
> 上游仓库：[op7418/guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill)  
> 许可证：AGPL-3.0

## 中文含义与用途

中文含义：用完整设计系统生成横向翻页的单文件 HTML 演示文稿。  
核心用处：把主题、大纲、资料和图片整理成可直接在浏览器演示的网页 PPT，同时为正式演讲提供备注、计时、观众屏同步和现场控制能力。

## 适用场景

- 线下分享、行业内部讲话、私享会和个人主题演讲
- AI 产品发布、Demo Day、技术或工程领域分享
- 需要离线打开、单文件交付或网页部署的演示文稿
- 希望使用电子杂志或瑞士国际主义视觉语言的内容展示

## 两套视觉系统

### 风格 A：电子杂志 × 电子墨水

- 使用衬线标题、非衬线正文和等宽元数据建立杂志式层级。
- Hero 页面可使用克制的 WebGL 流体、等高线和色散背景。
- 内置墨水经典、靛蓝瓷、森林墨、牛皮纸和沙丘五套主题。
- 更适合人文分享、行业观察、商业叙事和纪实图片。

### 风格 B：瑞士国际主义

- 使用 Inter、Helvetica、Noto Sans SC 等无衬线字体和十二列网格。
- 强调极端字号对比、直角纯色、Hairline 分割线与大面积留白。
- 内置 IKB、柠檬黄、柠檬绿和安全橙四种单一锚点色方案。
- 更适合科技产品、数据汇报、设计工程和年度总结。

两套风格的模板与类名体系不能混用；一份演示文稿应先确定风格，再选择对应的模板、主题和布局文件。

## 关键能力

- 生成零构建步骤的单文件横向翻页 HTML PPT
- 支持键盘、滚轮、触屏导航与 ESC 总览
- 提供当前页/下一页预览、讲稿备注、分组计时和排练记录
- 支持观众屏同步、冻结、黑白屏、断线恢复、激光笔和圈选
- 提供电子杂志风十种布局，以及瑞士风 S01-S22 登记布局体系
- 支持截图美化、图片网格、数据大字报、章节幕封和地图扩展组件
- 通过 `validate-presenter-mode.mjs` 检查页面 ID、备注、时长和演讲运行时
- 通过 `validate-swiss-deck.mjs` 检查瑞士风布局、溢出、安全区和标题间距

## 核心工作流

1. 明确风格、受众、分享时长、素材、图片处理、主题色和硬约束。
2. 用叙事弧规划页面，并为正式演讲同步设计页面目的、讲述要点、时长和转场。
3. 复制所选风格的完整 HTML 模板，替换标题和主题变量。
4. 对照模板已有类名与对应布局文件填充页面，避免混用或发明未定义类名。
5. 为每页写稳定的 `data-slide-id`，并按相同 ID 生成 `SPEAKER_NOTES`。
6. 运行演讲者模式与瑞士风校验脚本，打开浏览器逐页检查后再迭代。

## 资源结构

| 资源 | 作用 |
| --- | --- |
| `assets/template.html` | 电子杂志风完整模板 |
| `assets/template-swiss.html` | 瑞士国际主义完整模板 |
| `references/layouts.md` | 电子杂志风布局、节奏和动效规则 |
| `references/swiss-layout-lock.md` | 瑞士风正文布局登记约束 |
| `references/layouts-swiss.md` | 瑞士风 S01-S22 布局说明与骨架 |
| `references/themes*.md` | 两套风格的主题色预设 |
| `references/presenter-mode.md` | 演讲备注、计时和观众屏契约 |
| `references/checklist.md` | 按 P0-P3 分级的质量检查清单 |
| `references/image-prompts.md` | 配图类型、比例和提示词参考 |
| `references/screenshot-framing.md` | 截图留边、背景和比例适配规则 |

## 使用边界与注意事项

- 不适合密集表格、复杂图表堆叠、培训型高密度课件或多人实时协作。
- 风格 A 只能使用五套内置主题，风格 B 一份 deck 只能使用一个锚点色。
- 瑞士风禁止渐变、阴影、圆角和多色高亮；大字号字重应保持轻量。
- 图片需要按最终版式槽位统一比例，不能直接照搬任意原图宽高比。
- 安装命令复制的是 Skill 文件而不是 Git 工作树，因此其中的启动更新检查会识别为“不是 Git 仓库”并继续；后续更新应使用 `npx skills update` 或重新执行安装流程。
- Skill 包含可执行校验脚本和完整 HTML 运行时，使用前应审阅来源与脚本，并遵守 AGPL-3.0 许可证。

## 原始描述中文摘要

生成带有 WebGL 背景、演讲者视图、观众屏同步、讲稿备注和多种页面模板的单文件网页 PPT，并在电子杂志风与瑞士国际主义风之间选择一套完整视觉系统。

## 原始文档章节

- 这个 Skill 做什么
- 何时使用
- Step 0：启动前检查更新
- Step 1：需求澄清与叙事规划
- Step 2：拷贝模板与选择主题
- Step 3：填充内容与同步演讲备注
- Step 4：校验和视觉核对
- Step 5：本地预览
- Step 6：迭代
- 资源文件导览
- 核心设计原则
- 参考作品

## 相关 Skill

- [[wiki/SkillHub/skills/huashu-design|花叔 HTML 原生设计生产线]]
- [[wiki/SkillHub/skills/design-taste-frontend|高级前端设计品味]]
- [[wiki/SkillHub/skills/high-end-visual-design|高端视觉设计与动效编排]]
- [[wiki/SkillHub/skills/imagegen-frontend-web|网站分区视觉参考图生成]]
