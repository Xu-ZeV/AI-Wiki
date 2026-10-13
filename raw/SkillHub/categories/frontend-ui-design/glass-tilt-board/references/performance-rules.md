# 性能规则：为什么这些约束不能妥协

本文解释 `SKILL.md` 里那几条不变量的成因、失败症状和诊断方法。
面板数在 24~30 这个量级时，下面每一条都从"优化建议"变成"能不能跑"的分界线。

## 1. 倾斜为什么只能改 transform

浏览器的每帧更新有三档成本，从便宜到昂贵：

| 阶段 | 触发者 | 成本 |
| --- | --- | --- |
| Composite（合成） | `transform`、`opacity`、`filter` 的动画 | 只有 GPU 重贴图层，与元素数量近似无关 |
| Paint（重绘） | `color`、`background`、`box-shadow`、`border-radius` 变化 | 按受影响面积走光栅化 |
| Layout（重排） | `top/left/width/height/margin/padding`、字体、DOM 结构 | 同步计算全页几何 |

25 个面板同时改 `top/left` = 每帧一次全页重排 + 全页重绘。改 `transform` 则是每帧 25 次
矩阵写入，量级差两个数量级。这就是"只改 transform"不是洁癖、而是前提的原因。

细节：

- `transform` 里最好保留 `translate3d(...)` 或 3D 旋转。仅有 2D 平移的元素的提升（layer promotion）
  行为不如 3D 变换稳定，3D 变换会强制生成合成层。
- 不要用 `left/top` 做"更直观"的实现再指望浏览器优化 —— 它不会。
- 每块面板加 `will-change: transform`。面板数固定且不多，这一层显存花得值。

## 2. backdrop-filter 为什么必须放弃

`backdrop-filter` 的语义是"读取元素背后的已渲染像素，做一次滤镜，再合成"。
它把元素从"知道自己在哪"变成"每帧都要重新采样背景"：

- 面板自己在动（倾斜）→ 每一帧都要重新采样；
- 背景在动（ambient 交叉淡入、呼吸摆动）→ 同样要重新采样；
- 25 个这样的面板 → 每帧 25 次全屏级采样 + 模糊。

结果是**静止时也在持续重绘**：CPU 占用高、风扇转、笔记本掉电。
这是本类页面最常见的翻车点，且很容易在做完"很好看"的第一版之后才发现。

**玻璃质感的替代配方**（视觉上足够，成本接近零）：

```css
/* 面板本体 */
background: linear-gradient(150deg,
  rgba(255,255,255,0.14), rgba(255,255,255,0.045) 42%, rgba(255,255,255,0.09));
border: 1px solid rgba(255,255,255,0.22);
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.30),   /* 上沿高光 */
  inset 0 0 0 1px rgba(255,255,255,0.09), /* 内描边 */
  0 14px 26px -16px rgba(0,0,0,0.90),     /* 落影 */
  0 2px 6px -3px rgba(0,0,0,0.60);
```

再加上两层附加层，玻璃感就齐了：

- `.gloss`：一个 148° 的斜向白到透明线性渐变，模拟玻璃表面的固定反光；
- `.sheen`：一个 `radial-gradient` 光斑，**随指针偏移做 `translate3d`**，模拟高光跟着光走。

## 3. 虚化只留在静止层

`filter: blur(42px)` 对一张 cover 尺寸的图是很贵的。所以只允许它出现在 `.ambient`：

```css
.ambient {
  position: absolute; inset: -7%;          /* 外扩，避免模糊出透明边 */
  filter: blur(42px) brightness(0.45) saturate(1.12);
  transform: scale(1.06);                  /* 再放大一点，盖住边缘 */
  transition: opacity 0.8s ease;           /* 只有 opacity 在动 */
  will-change: opacity;
}
```

换图时只改 `background-image`（重算一次），然后两片 `.ambient` 交叉淡入淡出：
旧的 `opacity: 0`、新的 `opacity: 1`，再交换前后指针。因为动画只有 `opacity`，
模糊结果会被合成器缓存，不参与每帧重算。

运动的面板层上永远不要出现 `filter` / `backdrop-filter` / `box-shadow` 的动画。

## 4. 为什么用 offsetLeft/offsetTop 量切片

`offsetLeft` / `offsetTop` 来自布局盒，**与 transform 无关**。
`getBoundingClientRect()` 返回的是变换后的可视矩形。

切图动画里面板会翻出到 `rotateY(-58deg) scale(0.92)`，此时量矩形得到的是一个被压扁、
投影后的形状 —— 用它算切片偏移，图会被切错位。而 `offsetLeft/offsetTop` 在整个动画过程中都是准的，
所以切片对齐可以随时重算，不需要"等动画结束再量"。

同一条规则也意味着：`layout()` 里读一次 `offsetWidth/offsetHeight/offsetLeft/offsetTop`，
然后**缓存**到 tile 对象上；`applyTilt()` 每帧只写不读。
在一帧内交叉读写布局属性会触发 forced synchronous layout（布局抖动），
表现为"明明只改了 transform 却很卡"。

## 5. 面板数与网格

```js
function dims(ar) {
  var c = clamp(Math.round(Math.sqrt(26 * ar)), 3, 7);
  var r = clamp(Math.round(c / ar), 3, 7);
  return [c, r];
}
```

常见落在 24~30 块：够碎才有"玻璃拼图"感，又不至于让每块切片的采样成本失控。
`cols/rows` 各夹在 3~7 是为了横竖两个极端宽高比下都不出现"一条细缝"或"一整块没切"的观感。
图片宽高比不同就重建面板阵（同一张图的切片数变了），并保留 `checker` 的棋盘格深度分配。

## 6. 失败症状速查

| 症状 | 大概率原因 | 先查什么 |
| --- | --- | --- |
| 静止时也卡、CPU 高 | `backdrop-filter` 或运动层上的 `filter` | 全局搜 `backdrop-filter` |
| 倾斜时掉帧、静止还好 | 每帧读布局属性 / 动画的非 transform 属性 | 搜 `offsetWidth`、`getBoundingClientRect` 是否在 rAF 回调里 |
| 切片错位 | 用矩形而非 offset 量位置 | 见第 4 节 |
| 换图瞬间一大卡 | 换图时同步解码大图 / 同时重建 26 个节点 | 用 `img.decode()` 预解码 + 提前 `preload(i+1)` |
| 边缘出现一圈透明/黑边 | `blur` 半径超出元素外扩量 | `inset: -7%` 要足够大，配 `scale(1.06)` |
| 面板之间 1px 缝 | 亚像素取整 | 面板阵用 `gap`，别用相邻 `border` 拼；检查断言里相邻矩形间隔是否等于 gap |

## 7. 帧率自测（不依赖 DevTools）

在真实渲染里量：派发一串 `pointermove`，同时采样 `requestAnimationFrame` 间隔，
统计 >20ms 的长帧。这段可以直接放进 CDP 探针里执行：

```js
await new Promise(res => {
  const marks = []; let last = performance.now(), n = 0;
  const el = document.querySelector('.board');
  el.dispatchEvent(new PointerEvent('pointermove', { clientX: 10, clientY: 10, bubbles: true }));
  (function loop(t) {
    marks.push(t - last); last = t; n++;
    // 让指针持续移动，逼出每帧的倾斜写入
    const k = n / 90;
    window.dispatchEvent(new PointerEvent('pointermove', {
      clientX: innerWidth * (0.5 + 0.45 * Math.sin(k * 6.28)),
      clientY: innerHeight * (0.5 + 0.45 * Math.cos(k * 6.28))
    }));
    if (n < 90) requestAnimationFrame(loop);
    else res({ avg: marks.reduce((a, b) => a + b, 0) / marks.length,
               long: marks.filter(m => m > 20).length });
  })(last);
});
```

注意：headless Chrome 没有真实 GPU 合成路径，帧时间只能当**相对**参考（改前 vs 改后）。
要判断"静止时是否还在重绘"，看长帧数量的相对变化比看绝对值可靠。
