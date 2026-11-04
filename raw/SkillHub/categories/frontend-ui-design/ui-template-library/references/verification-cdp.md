# 验证：headless Chrome + CDP 逐项断言

代理看不到渲染结果，而本类页面的核心行为是几何行为（倾斜、切片对齐、切图）。
只读代码不可能判断"面板真的跟着鼠标转了"。所以交付前必须跑一遍真实渲染断言。

两条路径，按环境选：

| 环境 | 路径 |
| --- | --- |
| 有 Playwright（`npx playwright --version` 可用） | 走 `agent-team-visual-review` 的 Playwright 截图路线 |
| 没有 Playwright，但有 Node 22+ 和本地 Chrome/Edge | 走本 skill 的 `scripts/verify-glass-board.mjs`（内置 WebSocket 直连 CDP） |

两条都做不冲突：CDP 脚本给**几何断言**，截图给**观感复核**。

## 一、CDP 直连配方

`scripts/verify-glass-board.mjs` 已经实现，下面是它依赖的机制，便于改和排错。

### 1. 启动

```
chrome.exe --headless=new --remote-debugging-port=0 --user-data-dir=<temp>
           --no-first-run --no-default-browser-check --disable-extensions
           --allow-file-access-from-files about:blank
```

- `--remote-debugging-port=0` 让内核自己选端口，避免端口冲突；端口写在
  `<user-data-dir>/DevToolsActivePort` 的第一行。**不要**用固定端口再重试，那样会在端口被占时静默失败。
- `--user-data-dir` 必须给一个**临时目录**，否则会和用户正在运行的 Chrome 抢配置目录。
- `--allow-file-access-from-files` 让 `file://` 页面能正常读取同目录下的图片。

### 2. 连接

Node 22+ 自带全局 `fetch` 和 `WebSocket`，不需要装 `ws` 或 `puppeteer`。

1. `GET http://127.0.0.1:<port>/json/version` → `webSocketDebuggerUrl`（这是 **browser** target）。
2. `Target.createTarget { url: "about:blank" }` → `targetId`
3. `Target.attachToTarget { targetId, flatten: true }` → `sessionId`
4. 之后所有页面级命令都带 `sessionId` 字段发到同一个 socket。

消息分流：带 `id` 的是命令响应，按 `id` 配对；带 `method` 的是事件。
flatten 模式下事件也会带 `sessionId`，别把别的 tab 的事件当成自己的。

### 3. 必需的域

```js
Page.enable                 // 需要 Page.loadEventFired
Runtime.enable
Emulation.setDeviceMetricsOverride { width, height, deviceScaleFactor: 1, mobile: false }
```

**`--window-size` 不是视口。** 用命令行给窗口尺寸时，实际视口常常是 800×600，
于是 `elementFromPoint` 返回 `null`、点击落到元素外面，得到一堆假结论。
必须用 `Emulation.setDeviceMetricsOverride` 显式设视口；换视口时重新下发一次即可。

### 4. 常用命令

| 目的 | 命令 |
| --- | --- |
| 求值 | `Runtime.evaluate { expression, awaitPromise: true, returnByValue: true }` |
| 移动指针 | `Input.dispatchMouseEvent { type: "mouseMoved", x, y }` |
| 点击 | `mousePressed` + `mouseReleased`，带 `button: "left"`, `clickCount: 1`, `buttons: 1` |
| 按键 | `Input.dispatchKeyEvent { type: "rawKeyDown", key: "ArrowRight", code: "ArrowRight", windowsVirtualKeyCode: 39 }` |
| 截图 | `Page.captureScreenshot { format: "png" }` → base64 |

`Input.*` 是**真实输入**，走的是浏览器事件管线，所以能触发页面的 `pointermove`、
hover 态和 `click` 委托，比在页面里 `dispatchEvent` 更接近用户行为。

### 5. 清理

跑完必须：终止 Chrome 进程、删除临时 `--user-data-dir`、删除临时截图（除非用户要留存）。
Windows 上删临时目录偶尔会被内核占用，删不掉就忽略，不要在验证脚本里因此报错退出。

## 二、要断言什么

下面每一条都对应一个曾经真实出过问题的点，少一条就等于没验证。

### 结构

- `.tile` 数量在 12~49 之间（`dims()` 把 cols/rows 各夹在 3~7，常见量级是 24~30）。
- **每块** `.tile` 都有 `.in` 类，`opacity` 计算值为 1（否则说明入场动画没跑完或卡住了）。
  不要用"90% 已入场"这种宽口径，它会漏掉个别卡死的面板。
- 图片都加载成功。注意：这一族页面是用 CSS `background-image` 画图的，
  页面里**没有 `<img>`**，所以扫 `document.images` 恒为空、什么也证明不了。
  正确做法是按 `window.GLASS_BOARD_IMAGES` 清单逐个 `new Image()` 预加载，
  再检查 `naturalWidth > 0`。
- `.mosaic` 的 `background-image` / `--img` 非空。

### 倾斜（最关键）

- 在视口左侧和右侧各派发一次 `mouseMoved`，读所有 `.tilt` 的 transform：

  - **覆盖率**：至少 90% 面板的 transform 发生了变化。这一条要用 `getComputedStyle()`
    的矩阵来比，不能用内联字符串 —— 内联字符串是页面自己写的，一条
    `!important` 的 CSS 规则就能让面板实际不动、内联值照样在变。
  - **方向**：三次采样（左/中/右）的 `rotateY` 均值单调递增；
    并且指针在左半屏时整体均值为负、在右半屏时为正（符号锚点）。
  - **非刚性**：同一次采样里 `rotateY` 的标准差 > 0.05，否则整块画板在刚性旋转。
- **不要**断言"靠近指针的面板与远离指针的面板符号相反"。本实现里 `ry` 的主项是
  全局项 `sx * 4.2`，指针在左半屏时*所有*面板的 `ry` 都是负的，局部项 `lx * 2.9`
  只改变幅度；只有把局部项做成比全局项更大才会出现符号相反，那是另一种手感。
  写成符号相反会得到一个永远失败的断言，然后被改成 `abs()` 比较，等于没验证。
- 覆盖率断言能抓住"倾斜只接上了几块面板"和"CSS 覆盖把倾斜掐掉了"；
  只看均值会漏掉这两类 —— 少数面板剧烈倾斜时，均值照样单调。

### 切片对齐

- 对每块 `.tile`：`.slice` 的 transform 平移量等于 `(-offsetLeft, -offsetTop)`，容差 0.5px。
  同样按**计算值**（`getComputedStyle` 的矩阵，`matrix` 取 `e/f`，`matrix3d` 取 `tx/ty`）判断。
- 每块 `.slice` 的 `background-size` 必须等于整幅画的尺寸（即 `.mosaic` 的 `--sw/--sh`），
  容差 0.5px。尺寸错了画面会静默重组成一张缩小的图，肉眼很容易放过。
- 这条一旦失败，画面上表现为"每块格子里的图拼不起来"。

### 无缝

- 相邻 tile 的矩形间隔 ≈ 计算出的 `gap`，容差 1.5px；**横向和纵向都要查**
  （同 `offsetTop` 的按 `offsetLeft` 排序查列间距，同 `offsetLeft` 的按 `offsetTop` 排序查行间距）。
- `gap` 读不到时应当判失败，不要静默跳过。

### 切图

- 记录 `#metaNow` 文本 → 点击右侧空白区 → 文本变化。
- 点击画面中央（`.mosaic` 上）→ 文本**不变**。
- 派发 `ArrowRight` → 文本变化。

### 视口

至少在 `1440×900`、`1920×1080`、`430×880` 三个尺寸下各跑一遍：

- `.board`（或 `documentElement`）没有溢出：`scrollWidth <= clientWidth + 1`，高度同理；
- `.meta`、`.advance`、`.hint-chip` 的矩形互不重叠，且都在视口内。

`430×880` 是窄屏分支（切换区移到下方条带、`.pick-chip` 常驻右上角），必须单独看。

## 三、多模型视觉复核

几何断言过了不代表"好看"。观感、排版密度、颜色对比、以及"用户第一眼看到的画面是否成立"，
应该交给一次**独立的视觉复核**，而不是由写页面的人自己声称没问题。

在本环境里走 `agent-team-visual-review`：用 Playwright 按多个视口截图，再逐张按
「布局 / 排版 / 颜色 / 间距 / 内容 / 响应式」六项判定，产出问题清单。

要形成真正的异构复核，派子代理时必须**显式传另一个模型**，不能只用同一个模型换
`reasoning_effort`：

```text
spawn_agent(
  message = "对 D:/path/index.html 做视觉复核。用 Playwright 在 1920x1080 与 430x880 两种视口截图，
             逐项检查：空白画布、内容溢出、元素重叠、关键内容缺失、响应式变形、玻璃面板在静止与倾斜状态下是否都能看清图片内容。
             只报告发现，不要修改文件。最后给出问题清单与每条的截图坐标证据。",
  model = "ccs-glm-5-3-flash/GLM-5.3-Flash",
  reasoning_effort = "high",
  fork_context = false
)
```

可用模型：`DeepSeek-V4.1-Flash`（256K，`low`/`medium`/`high`/`xhigh`）、
`ccs-glm-5-3-flash/GLM-5.3-Flash`（1M，`low`/`high`/`max`）。
写完页面的模型和做复核的模型应当是**不同的两个**。

复核结论要二值判定（PASS / FAIL）并附证据：截图路径 + 具体元素矩形或坐标。
只说"看起来不错"的复核不算通过。

## 四、本类页面容易漏掉的两个假通过

1. **只截了一张静态图就宣布通过。** 静止的截图对"跟随鼠标倾斜"没有任何证明力 ——
   必须有两种指针位置下的 transform 对比。
2. **只在默认视口看过。** 默认 800×600 下窄屏分支不会触发，
   宽屏下的留白和居中问题也看不出来。至少三个视口。
