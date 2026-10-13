---
title: Playwright 视觉审查与页面截屏
skill: agent-team-visual-review
category: 多Agent团队协作
category_slug: multi-agent-orchestration
source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-visual-review/SKILL.md
tags:
  - SKILL
  - SKILL/multi-agent-orchestration
---
# Playwright 视觉审查与页面截屏

> [!info] 独立可用
> 本页已与上游编排框架解耦，可脱离多Agent协作分类单独使用；中文化改造版 skill 文件加载路径：`.agents/skills/agent-team-visual-review/SKILL.md`（点开头目录不在 Obsidian 索引内，故以文本标注）。

> [!info] Skill 元信息
> skill 名称：`agent-team-visual-review`  
> 上游英文标题：Visual Review  
> 功能分类：多Agent团队协作  
> 源文件：[SKILL.md](../../../raw/SkillHub/categories/multi-agent-orchestration/agent-team-visual-review/SKILL.md)  
> 来源说明：由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw 原始资料层。

## 中文含义与用途

中文含义：用 Playwright 对网页、UI 与演示文稿截图，供 Agent 做视觉审查与迭代。  
核心用处：Agent 看不见渲染后的页面，本 skill 用 Playwright 把本地文件、localhost 服务或已部署 URL 截图下来，让 Agent 能真正检查布局、样式与响应式表现。典型场景：Reveal.js 逐页截图、Web UI 布局核验、落地页视觉核对、邮件模板渲染检查。

## 前置条件

```bash
npx playwright --version          # 先确认可用
npx playwright install chromium   # 不可用时安装
```

**只需装 `chromium` 一个浏览器**，不要装全部浏览器——那样既费磁盘又费时间。若 `npx playwright` 完全不可用，用户可能需要先 `npm install -g playwright`。

## 五个阶段

1. **Phase 1 准备**：确认 Playwright 可用 → 不可用则装 chromium 并告知用户 → `mkdir -p /tmp/agent-team-visual-review` → 确定目标（本地文件路径 / localhost URL / 已部署 URL）。
2. **Phase 2 截图**：用下述命令抓取。
3. **Phase 3 展示与审查**：用 Read 工具读取每张截图并评估布局、排版、色彩、间距、内容与响应式表现；需要让用户看到时按下方两种方式展示。
4. **Phase 4 记录发现**：产出结构化发现摘要（表格：Slide/Page、Status、Notes，再加“待修问题”与“表现良好”两节）。
5. **Phase 5 修复并重拍**：只重拍受影响的页面，重新审查，直到满意。

## 截图命令

**单页**（默认视口 `1456,816`，16:9，适合演示文稿；等待 3 秒让字体、图片与动画稳定）：

```bash
npx playwright screenshot \
  --browser chromium \
  --viewport-size "1456,816" \
  --wait-for-timeout 3000 \
  "<URL_OR_FILE_PATH>" \
  /tmp/agent-team-visual-review/page.png
```

本地文件用 `file:///absolute/path/to/file.html`。

**Reveal.js 多页**（通过 `#/$i` 哈希逐页抓取，每页等待 2000ms）：

```bash
for i in $(seq 0 15); do
  npx playwright screenshot \
    --browser chromium \
    --viewport-size "1456,816" \
    --wait-for-timeout 2000 \
    "<BASE_URL>#/$i" \
    "/tmp/agent-team-visual-review/slide-$i.png"
done
```

**响应式测试**三档视口：

```bash
npx playwright screenshot --viewport-size "390,844"   "<URL>" /tmp/agent-team-visual-review/mobile.png
npx playwright screenshot --viewport-size "768,1024"  "<URL>" /tmp/agent-team-visual-review/tablet.png
npx playwright screenshot --viewport-size "1920,1080" "<URL>" /tmp/agent-team-visual-review/desktop.png
```

## 把截图给用户看

- **本地有显示器**：`open /tmp/agent-team-visual-review/slide-2.png`，或 `open /tmp/agent-team-visual-review/slide-*.png` 一次全开。
- **远程 / 无头环境（SSH、tmux 等）**：把截图目录通过 HTTP 暴露给用户本地浏览器：

```bash
python3 -m http.server 18080 --directory /tmp/agent-team-visual-review &
# 用户浏览器访问 http://<hostname>:18080/
```

选高位端口（18080、19090 等），低位端口如 8080 常被开发工具占用。用完停掉：`kill %1` 或 `lsof -ti:18080 | xargs kill`。

## Reveal.js 专属提示

- **页码**：`#/0` 是第一页，`#/1` 第二页，依此类推；垂直页用 `#/2/1` 形式。
- **Fragments**：带 `class="fragment"` 的内容在点击前是隐藏的，截图天然只显示初始态——这是预期行为而非 bug。
- **演讲者备注**：不会出现在截图里（需按 `S` 在独立窗口查看）。
- **主题加载**：CDN 主题与字体要等，保持 `--wait-for-timeout 3000`。

## 常见错误

| 错误 | 为什么错 | 正确做法 |
| --- | --- | --- |
| 不等页面加载完 | 字体、图片可能还没渲染 | 加 `--wait-for-timeout 3000` |
| 本地文件用 `http://` | 文件必须走 `file:///` 协议 | 用 `file:///absolute/path` |
| 装全部 Playwright 浏览器 | 浪费时间与磁盘 | 只装 `chromium` |
| 把 fragment 隐藏内容当 bug | fragment 设计上就是点击后才显示 | 记为预期行为 |
| 忘记创建输出目录 | 截图会静默失败 | 先 `mkdir -p /tmp/agent-team-visual-review` |
| 一次截太多图 | 刷爆上下文窗口 | 每批审阅 4–6 张 |
| 讨论视觉效果时不给用户 `open` | 用户看不到你描述的东西 | 协作讨论时用 `open` 展示 |

## 原始描述摘要

Take screenshots of web pages and UI using Playwright for visual review and iteration.

## 相关 Skill

- [[agent-team-orchestration]]
- [[agent-team-handoff]]
