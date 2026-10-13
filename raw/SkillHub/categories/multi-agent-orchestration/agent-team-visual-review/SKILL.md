---
name: agent-team-visual-review
description: 当需要 visual review、截图、视觉复核、检查页面或 UI 是否符合设计时必须使用本 skill，用 Playwright 截屏核验
license: MIT
metadata:
  author: AI-Wiki
  version: "1.0.0"
  source: raw/SkillHub/categories/multi-agent-orchestration/agent-team-visual-review/SKILL.md
  adapted_for: Codex 原生子代理多模型协作
  upstream_note: 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作；英文原件归档于 raw/SkillHub/zh/metaswarm/original-en/，MIT 许可
---

# 视觉复核（Visual Review）

## 何时使用

在以下情况使用本 skill：

- 用户要求 visual review、screenshot、视觉复核、check how it looks 或 review the UI。
- 需要核验网页、幻灯片、落地页或邮件模板在真实渲染后的布局、排版、颜色、间距和响应式表现。
- 修改了前端样式、页面结构、演示内容或可视化输出，需要用截图确认结果。

不要在以下情况使用本 skill：

- 只做纯逻辑修复、纯数据转换或无视觉面的测试。
- 目标文件或应用没有可渲染的页面、界面、画布或演示内容。
- 用户明确要求只做代码审查，而不看渲染结果。

除非用户、`AGENTS.md` 或本 skill 明确要求，否则不得派子代理；调用本 skill 即视为用户已授权派子代理。

## 目的

代理无法直接看到渲染后的网页、演示文稿或 UI。本 skill 通过 Playwright 截图补上这个缺口，让代理能检查自己的工作，发现布局问题并迭代。

它尤其适合：

- **Reveal.js 演示文稿**：逐页截图。
- **Web UI**：核验布局、样式和响应式。
- **落地页**：确认视觉设计符合意图。
- **邮件模板**：核验渲染效果。

## 前置条件

本 skill 需要 Playwright 可用。首次使用前先检查，必要时安装：

```bash
# 检查 Playwright 是否可用
npx playwright --version 2>/dev/null

# 不可用时安装（一次性配置）
npx playwright install chromium
```

**重要**：只需要 `chromium` 一个浏览器。不要安装全部浏览器——那会浪费磁盘空间和时间。

如果 `npx playwright` 完全无法运行，用户可能需要先全局安装：

```bash
npm install -g playwright
npx playwright install chromium
```

## Playwright 截图流程

### 1. 环境准备

1. 运行 `npx playwright --version` 确认可用。
2. 未安装时运行 `npx playwright install chromium`，并告知用户。
3. 创建输出目录：`mkdir -p /tmp/agent-team-visual-review`。
4. 确定目标：本地文件路径、localhost URL 或已部署 URL。

### 2. 截图

#### 单页截图：

```bash
npx playwright screenshot \
  --browser chromium \
  --viewport-size "1456,816" \
  --wait-for-timeout 3000 \
  "<URL_OR_FILE_PATH>" \
  /tmp/agent-team-visual-review/page.png
```

**参数说明：**
- `--viewport-size "1456,816"` — 16:9 比例，适合演示文稿
- `--wait-for-timeout 3000` — 等待 3 秒，让字体、图片和动画稳定下来
- 本地文件用 `file:///绝对路径/file.html`
- 已部署站点用完整 URL

#### Reveal.js 演示文稿（多页）：

在 URL 后追加幻灯片 hash 即可逐页截图：

```bash
# 截取全部幻灯片（按实际页数调整）
for i in $(seq 0 15); do
  npx playwright screenshot \
    --browser chromium \
    --viewport-size "1456,816" \
    --wait-for-timeout 2000 \
    "<BASE_URL>#/$i" \
    "/tmp/agent-team-visual-review/slide-$i.png"
done
```

**提示**：若要让所有 fragment 内容展开后再截图，可追加 `?fragments=true`，或改用 Playwright 脚本注入 JavaScript。更简单的做法是接受「fragment 较重的页面以初始（点击前）状态呈现」。

### 3. 查看与复核截图

截图完成后，用 Codex 的图片查看工具逐张检查；在 Codex 桌面版中对应 `view_image`。

逐张截图检查以下六项：

- **布局** — 内容是否按预期居中/对齐？
- **排版** — 标题、正文与代码是否清晰可读？
- **颜色** — 强调色、背景与对比度是否正确？
- **间距** — 留白是否充足？有没有拥挤的区域？
- **内容** — 预期内容是否全部可见？（注意：fragment 内容可能处于隐藏状态）
- **响应式** — 在目标视口尺寸下是否正常？

如需让用户一起看，可以：

- 在本机用系统图片查看器打开截图。
- 在 Codex 桌面版里用图片预览展示。
- 在远端或 headless 环境中，用高端口提供静态 HTTP 文件服务，让用户在本地浏览器查看。

## 视口与等待策略

| 场景 | 视口 | 等待策略 |
|---|---|---|
| 演示文稿 / 16:9 页面 | `1456,816` | `--wait-for-timeout 3000`，确保字体、图片、动画和 CDN 主题加载完成。 |
| Reveal.js 逐页截图 | `1456,816` | 每页至少等待 `2000ms`；片段较重的页面保留初始状态。 |
| 手机 | `390,844` | 用目标视口截屏，检查内容是否换行、溢出或重叠。 |
| 平板 | `768,1024` | 检查栅格、导航和内容密度在中等宽度下是否稳定。 |
| 桌面宽屏 | `1920,1080` | 检查宽屏下的完整布局和留白，不要只看小视口。 |

响应式测试示例：

```bash
# 手机
npx playwright screenshot --viewport-size "390,844" "<URL>" /tmp/agent-team-visual-review/mobile.png

# 平板
npx playwright screenshot --viewport-size "768,1024" "<URL>" /tmp/agent-team-visual-review/tablet.png

# 桌面宽屏
npx playwright screenshot --viewport-size "1920,1080" "<URL>" /tmp/agent-team-visual-review/desktop.png
```

## 失败判定

把下面情况判定为失败，必须修复或重拍：

1. **空白画布或空白截图**：页面没有渲染、关键资源缺失或截图目标错误。
2. **内容溢出**：文本、按钮、卡片或导航在目标视口内溢出父元素或屏幕边缘。
3. **重叠**：文本、控件、导航或浮层彼此遮挡，导致内容不可读或不可交互。
4. **关键内容缺失**：标题、主内容、导航、必要操作按钮或目标内容没有显示。
5. **可读性不足**：字体、字号、行高或对比度导致正文或代码难以阅读。
6. **引用资源未渲染**：图片、图标、字体或主题明显没有按预期加载。
7. **响应式失败**：在移动、平板或桌面宽视口中布局明显变形。

对 fragment-hidden content，截图显示初始状态是预期行为，不算失败；只有当用户要求“全部片段可见”且实现目标明确时，才需要通过 Playwright 脚本处理。

## Reveal.js 专项提示

- **页码编号**：Reveal.js 用 `#/0` 表示第一页、`#/1` 表示第二页，以此类推。
- **纵向幻灯片**：用 `#/横向/纵向` 格式（例如 `#/2/1`）。
- **Fragments**：带 `class="fragment"` 的内容在点击前是隐藏的，截图只会显示初始状态。这是预期行为，不是缺陷。
- **演讲者备注**：不会出现在截图里（它们显示在按 `S` 打开的独立窗口中）。
- **主题加载**：用 `--wait-for-timeout 3000` 确保 CDN 加载的主题与字体已就绪。

## 常见错误

| 错误做法 | 为什么不对 | 正确做法 |
|---------|---------------|-----------------|
| 不等待页面加载完成 | 字体/图片可能还没渲染 | 用 `--wait-for-timeout 3000` |
| 本地文件用 `http://` | 文件 URL 需要 `file:///` 协议 | 用 `file:///绝对路径` |
| 安装 Playwright 全部浏览器 | 浪费时间和磁盘 | 只装 `chromium` |
| 把 fragment 隐藏内容当成缺陷 | fragment 本来就是点击后才显示 | 标注为预期行为 |
| 忘记创建输出目录 | 截图会静默失败 | 先执行 `mkdir -p /tmp/agent-team-visual-review` |
| 一次截太多图 | 淹没上下文窗口 | 每批 4-6 张地复核 |
| 只看一个视口 | 手机和桌面的问题表现不同 | 检查目标视口并对比 |

## 记录发现

产出一份发现摘要：

```markdown
## 视觉复核（Visual Review） — [项目名]

### Reviewed: [日期]

| 页面/幻灯片 | 状态 | 备注 |
|-----------|--------|-------|
| slide-0   | Good   | 标题居中，强调色正确 |
| slide-1   | Issue  | 手机视口下文本溢出右边缘 |

### Issues to Fix
1. [问题描述 + 出现在哪一页]

### Looks Good
- [表现良好的地方]
```

修复之后：

1. 只重新截取受影响的页面/幻灯片。
2. 复核新截图。
3. 重复直到已列出的问题全部消失、且没有新问题出现。

## 衔接点

**上游**：任何产出视觉结果的 skill（演示文稿、Web UI、邮件模板）。

**下游**：修复结果回写到源文件，再重新截图验证。

## 验证清单

- [ ] Playwright 已安装且可用
- [ ] 截图使用了正确的视口尺寸
- [ ] 所有页面/幻灯片都已复核
- [ ] 问题已用具体描述记录下来
- [ ] 修复已通过重新截图验证

## Codex 原生落地

本 skill 可以由编排者本人执行，也可以派一个带浏览器/终端权限的子代理执行截图核验。默认由编排者本人执行；只有当目标页面需要启动应用、长时间等待、批量截图或独立复核时，才派子代理执行。

子代理用法示例：

```text
spawn_agent(
  message="按需启动本地应用服务，用 Playwright 在 1456x816 与 390x844 两种视口截图，检查空白画布、内容溢出、元素重叠、关键内容缺失与响应式问题，最后输出一份简明的发现清单。",
  model="DeepSeek-V4.1-Flash",
  reasoning_effort="medium",
  fork_context=false
)
```

用 `wait_agent` 等待截图和结论；必要时用 `send_input` 补充目标 URL、视口或修复说明；结束后用 `close_agent` 关闭。

可用模型只有两个：

- `DeepSeek-V4.1-Flash`，支持 `low`、`medium`、`high`、`xhigh`。
- `ccs-glm-5-3-flash/GLM-5.3-Flash`，显示名 `GLM-5.3-Flash`，上下文窗口 1M，支持 `low`、`high`、`max`。

子代理默认只负责截图、检查和报告，不修改仓库源文件。若确需由子代理修复源文件，必须在任务说明中限定文件范围，并在结果中说明改动与验证方式。

## 血缘与许可

本 skill 由 AI-Wiki 从公开开源编排协议抽取重写，面向 Codex 原生子代理多模型协作。英文原件归档于 [raw/SkillHub/zh/metaswarm/original-en/visual-review/](../../../../../raw/SkillHub/zh/metaswarm/original-en/visual-review/SKILL.md)，采用 MIT 许可。
