---
name: glass-tilt-board
description: 制作「整块玻璃面板阵列跟随鼠标倾斜」的交互画板页面（glassmorphism glass panel tilt board）——几十块玻璃面板拼成一幅图，指针移动时全部面板一起倾斜（带上层次视差），点击右侧/底部空白处切到下一张图。当用户要求玻璃面板跟随鼠标倾斜、鼠标驱动 3D 视差、面板阵列倾斜、点击空白切图的画板，或任何「几十个元素同时做鼠标驱动 transform 动画且不能掉帧」的页面时使用。核心是把倾斜约束成纯 transform、拒绝 backdrop-filter、把虚化限制在静止层，并用 headless Chrome + CDP 逐项断言验证。不用于普通页面开发或只要静态玻璃拟态样式的需求。
---

# 玻璃画板：鼠标驱动的面板倾斜

目标：一组玻璃面板拼成一幅图，整块跟着指针倾斜；点空白处切换下一张。
交付物是能直接双击打开的单文件页面（`file://` 可用），不需要构建、不需要起服务器。

## 何时用 / 何时不用

用：

- 用户要「玻璃面板 / 玻璃卡片阵列跟随鼠标倾斜」「鼠标驱动的视差 / 3D 倾斜」「整块画板随指针转动」。
- 用户要一个「点空白处切下一张」的图片浏览画板，图片取自项目里的某个文件夹。
- 更一般地：几十个元素同时做鼠标驱动的 `transform` 动画，且对掉帧敏感。

不用：

- 普通页面/组件开发，或只要静态玻璃拟态卡片样式。
- 单张卡片的 hover 倾斜 —— 几行 CSS 就够，套本 skill 是过度设计。
- 需要真实 3D 场景、模型、光照 —— 走 Three.js 路线，本 skill 的切片拼图模型不适用。

## 先复制，再改：不要从零写

`assets/glass-board-template.html` 是已经逐项验证过的完整实现（单文件，含全部 CSS + JS）。
默认路径：复制它 → 换图片源、配色、文案 → 按下面的不变量核对 → 跑验证脚本。
只有当面板模型明显不同（面板是独立卡片而非同一张图的切片，或需要真正的网格重组动画）时才从零写。

## 性能不变量（优先于其它所有设计决定）

违反任何一条都会掉帧，而且症状常常在「静止时」就出现。

1. **倾斜只改 `transform`**：只写 `translate3d` / `rotateX` / `rotateY` / `scale`。
   不要动 `top/left/width/height/margin` —— 那些会触发重排。
   每个 `transform` 里保留 `translate3d(...)` 或 3D 旋转，浏览器才会把元素提升到合成层。
2. **不要用 `backdrop-filter`**。25+ 个面板各带一层 backdrop-filter = 每帧全屏重算，静止也卡。
   玻璃质感用「渐变 + inset 高光/暗边阴影」伪造。
3. **虚化只给静止的背景层**：一张 `filter: blur()` 的 ambient 层，换图时重算一次，
   之后被合成器缓存。运动的面板层绝不能参与虚化。
4. **切片对齐用 `offsetLeft` / `offsetTop`**（与 transform 无关）：每块切片是全尺寸图，
   在自己的 `.tilt` 里 `translate3d(-offsetLeft, -offsetTop, 0)`。
   **不要用 `getBoundingClientRect()` 量面板位置** —— 它会被正在跑的倾斜/翻出动画污染。
5. **一帧只写一次**：`pointermove` 只记录指针坐标，真正的写入放到 `requestAnimationFrame` 回调里批量执行。
6. 面板数控制在 24~30 这一量级：`dims(ar)` 按图片宽高比算 `cols/rows`，各夹在 3~7；
   极端宽高比下总数会更少，这是正常的，别为了凑数把格子拉变形。

成因、失败症状和诊断流程见 `references/performance-rules.md`。

## 结构

单文件 `index.html`，三层：

- `.ambient` × 2 —— 静止的柔化背景（交叉淡入用），只在换图时更新。
- `.veil` —— 压暗/渐晕遮罩，纯装饰。
- `.board` 网格：左 `.canvas`（`.mosaic` 面板阵 + `.glass-frame` 外框），
  右 `.advance`（空白切换区：进度条 + 提示玻璃片）。

每块面板：`.tile`（进出场动画）> `.tilt`（负责倾斜）> `.slice`（图片切片）
+ `.sheen`（随指针偏移的高光）+ `.gloss`（固定玻璃反光）。

## 倾斜模型

全局量 `sx, sy` = 指针相对舞台中心的归一化偏移（各夹在 ±1.5）；
每块面板再算局部量 `lx, ly` = 指针相对该面板中心的偏移（各夹在 ±1）。

```
rx = clamp((-sy * 3.4 - ly * 2.3) * k, -10, 10)   // deg
ry = clamp(( sx * 4.2 + lx * 2.9) * k, -10, 10)   // deg
z  = checker * (2 + 9 * amt) * k                  // px，棋盘格 ±深度
s  = 1 + 0.006 * amt
```

- `k` = 每块面板固定的 0.82~1.18 抖动系数（用 `(r*3 + c*5) % 7` 之类确定性算出来），
  避免整块画板刚性一致，倾斜时像碎开的玻璃。
- `checker` = `(r+c)%2 ? -1 : 1`，相邻面板一前一后。
- `amt` = 指针离舞台中心的距离比例，控制整体"被推动"的幅度。
- 角度硬夹在 ±10°，再大就开始晕。`s` 放大系数极小，只是提示性呼吸。

## 制作步骤

1. **建目录**：在用户指定位置新建独立文件夹（如 `glass-board/`），不要污染用户已有仓库。
2. **收图片**：把用户项目/资料里的图片**复制**一份进 `images/`。
   只读地取源文件，绝不改动源仓库（尤其当它是 git 仓库）。
3. **生成清单**：`file://` 下页面无法列目录，所以把 `scripts/update-images.ps1`
   复制进项目目录跑一次，生成 `images.js`（脚本头部注释里有用法，保持脚本纯 ASCII）。
4. **写页面**：按上面的结构与不变量实现，或从 `assets/glass-board-template.html` 起步。
5. **验证**：跑 `scripts/verify-glass-board.mjs`，再按 `references/verification-cdp.md` 补齐断言。
6. **写 README**：操作表、怎么换图片、实现备忘。

## 交互必需项

- 点右侧空白区 → 下一张；点到画上（`.mosaic`）**不算**切图。
- 键盘 `→` / `空格` / `PageDown` 下一张，`←` / `PageUp` 上一张。
- 切图动画：面板整体翻出 → 换 `--img` → 按 ~9ms/块错峰波浪式翻入。
- 指针停住 3 秒后轻微自动呼吸摆动（`prefers-reduced-motion` 时不跑）。
- 窄屏（≤880px）：切换区从右侧移到下方条带；触屏没有 hover，所以「更换图片文件夹」要常驻显示。
- 支持拖入图片文件夹临时替换（不写入磁盘）。

## 验证（必做）

1. **CDP 断言**：`node scripts/verify-glass-board.mjs --url "file:///D:/.../index.html"`。
   它启动 headless Chrome，断言「面板都在、图片都加载、每块面板都跟着指针倾斜、
   切片对得齐、切图真的发生、视口内不溢出」。加 `--out <目录>` 才会另外写截图与 `report.json`。
   退出码 0 = 全过，1 = 有断言失败，2 = 环境/启动失败。
2. **反向验证（推荐）**：把产物复制一份，故意弄坏一处（改坏一张图、加一条
   `.slice { transform: none !important }`、加一条只让第一块面板倾斜的规则），
   再跑一次脚本，确认它**报错**。全过只能说明"没抓到问题"，反向用例才能说明脚本有牙齿。
3. **视觉复核**：按 `references/verification-cdp.md` 的「多模型视觉复核」段落，
   用 `agent-team-visual-review` 的 Playwright 路径做一次独立复核（截图 + 逐项判定）。
4. **不要只看代码就下结论**：倾斜是几何问题，必须在真实渲染里按坐标断言。

## 常见坑

| 坑 | 症状 | 原因 / 正确处理 |
| --- | --- | --- |
| 用 `backdrop-filter` 做玻璃 | 静止就卡、风扇狂转 | 每帧全屏重算；改渐变 + inset 阴影 |
| 用 `getBoundingClientRect()` 量面板位置 | 切片错位，看不出是同一张图 | 动画中矩形不等于布局；用 `offsetLeft/offsetTop` |
| 虚化加在运动层上 | 倾斜时掉帧 | 虚化只留在静止的 `.ambient` |
| 每帧读布局属性（`offsetWidth` 等） | 抖动、卡顿 | 尺寸只在 `layout()` 里量一次并缓存 |
| `--window-size` 当视口用 | `elementFromPoint` 返回 null、判定诡异 | 用 CDP `Emulation.setDeviceMetricsOverride` 设视口 |
| `.ps1` 里写中文 | 脚本报错、字符串乱码 | PowerShell 5.1 把无 BOM 的 `.ps1` 按 ANSI 解码 —— 生成脚本保持纯 ASCII |
