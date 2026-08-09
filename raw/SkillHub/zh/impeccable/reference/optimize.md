性能是一个特点。确定该接口的实际瓶颈，修复它，然后进行测量。不要优化那些不慢的东西。

## 评估性能问题

了解当前性能并发现问题：

1. **测量当前状态**：
   - **核心网络生命**：LCP、FID/INP、CLS 分数
   - **加载时间**：交互、第一次内容绘制的时间
   - **捆绑包大小**：JavaScript、CSS、图像大小
   - **运行时性能**：帧速率、内存使用率、CPU 使用率
   - **网络**：请求计数、有效负载大小、瀑布

2. **识别瓶颈**：
   - 什么慢？ （初始加载？交互？动画？）
   - 是什么造成的？ （大图像？昂贵的 JavaScript？布局颠簸？）
   - 有多糟糕？ （可感知？烦人？阻塞？）
   - 谁受到影响？ （所有用户？仅限移动设备？连接速度慢？）

**关键**：测量之前和之后。过早的优化会浪费时间。优化真正重要的事情。

## 优化策略

制定系统的改进计划：

### 加载性能

**优化图像**：
- 使用现代格式（WebP、AVIF）
- 适当的尺寸（不要加载 3000 像素的图像以进行 300 像素的显示）
- 延迟加载下屏图像
- 响应式图像（`srcset`、`picture` 元素）
- 压缩图像（80-85% 的质量通常难以察觉）
- 使用 CDN 加快交付速度

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  loading="lazy"
  alt="Hero image"
/>
```

**减少 JavaScript 包**：
- 代码分割（基于路由、基于组件）
- Tree shake（删除未使用的代码）
- 删除未使用的依赖项
- 延迟加载非关键代码
- 对大型组件使用动态导入

```javascript
// Lazy load heavy component
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**优化CSS**：
- 删除未使用的 CSS
- 关键 CSS 内联，其余异步
- 最小化 CSS 文件
- 对独立区域使用 CSS 遏制

**优化字体**：
- 使用 `font-display: swap` 或 `optional`
- 字体子集（仅您需要的字符）
- 预加载关键字体
- 适当时使用系统字体
- 限制加载的字体粗细

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  unicode-range: U+0020-007F; /* Basic Latin only */
}
```

**优化加载策略**：
- 关键资源优先（异步/延迟非关键）
- 预加载关键资产
- 预取可能的下一页
- 用于离线/缓存的 Service Worker
- 用于复用的 HTTP/2 或 HTTP/3

### 渲染性能

**避免布局抖动**：
```javascript
// ❌ Bad: Alternating reads and writes (causes reflows)
elements.forEach(el => {
  const height = el.offsetHeight; // Read (forces layout)
  el.style.height = height * 2; // Write
});

// ✅ Good: Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2; // All writes
});
```

**优化渲染**：
- 对独立区域使用 CSS `contain` 属性
- 最小化 DOM 深度（越平坦速度越快）
- 减少 DOM 大小（更少的元素）
- 对于长列表使用 `content-visibility: auto`
- 非常长的列表的虚拟滚动（反应窗口，反应虚拟化）

**减少油漆和复合材料**：
- 使用 `transform` 和 `opacity` 进行可靠的移动，但在创建有意义的润色时允许模糊、滤镜、蒙版、剪切路径、阴影和颜色偏移
- 避免布局驱动属性的随意动画（`width`、`height`、`top`、`left`、边距）
- 对于已知的昂贵操作，请谨慎使用 `will-change`
- 绑定昂贵的油漆区域以实现模糊/滤镜/阴影效果（较小且孤立的速度更快）

### 动画表演

**GPU 加速**：
```css
/* ✅ GPU-accelerated (fast) */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ CPU-bound (slow) */
.animated {
  left: 100px;
  width: 300px;
}
```

**流畅 60fps**：
- 目标每帧 16 毫秒 (60 fps)
- 使用 `requestAnimationFrame` 进行 JS 动画
- 去抖动/油门滚动处理程序
- 尽可能使用 CSS 动画
- 避免在动画期间长时间运行 JavaScript

**路口观察员**：
```javascript
// Efficiently detect when elements enter viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible, lazy load or animate
    }
  });
});
```

### React/框架优化

**反应特定**：
- 对于昂贵的组件使用 `memo()`
- `useMemo()` 和 `useCallback()` 用于昂贵的计算
- 虚拟化长列表
- 代码分割路线
- 避免在渲染中创建内联函数
- 使用 React DevTools Profiler

**与框架无关**：
- 最小化重新渲染
- 去抖动昂贵的操作
- 记忆计算值
- 延迟加载路由和组件

### 网络优化

**减少请求**：
- 合并小文件
- 使用 SVG 精灵作为图标
- 内联小型关键资产
- 删除未使用的第三方脚本

**优化API**：
- 使用分页（不要加载所有内容）
- GraphQL 仅请求需要的字段
- 响应压缩（gzip、brotli）
- HTTP 缓存标头
- 静态资产的CDN

**针对慢速连接进行优化**：
- 基于连接的自适应加载（navigator.connection）
- 乐观的UI更新
- 请求优先级
- 渐进增强

## 核心 Web Vitals 优化

### 最大内容绘制（LCP < 2.5s）
- 优化英雄形象
- 内联关键CSS
- 预加载关键资源
- 使用CDN
- 服务端渲染

### 第一个输入延迟 (FID < 100ms) / INP (< 200ms)
- 分解长任务
- 推迟非关键 JavaScript
- 使用网络工作者进行繁重的计算
- 减少 JavaScript 执行时间

### 累积布局偏移（CLS < 0.1）
- 设置图像和视频的尺寸
- 不要在现有内容之上注入内容
- 使用 `aspect-ratio` CSS 属性
- 预留广告/嵌入空间
- 避免导致布局变化的动画

```css
/* Reserve space for image */
.image-container {
  aspect-ratio: 16 / 9;
}
```

## 性能监控

**使用工具**：
- Chrome DevTools（灯塔、性能面板）
- 网页测试
- 核心网络生命力（Chrome 用户体验报告）
- 捆绑分析器（webpack-bundle-analyzer）
- 性能监控（Sentry、DataDog、New Relic）

**关键指标**：
- LCP、FID/INP、CLS（核心网络生命）
- 互动时间 (TTI)
- 首次内容绘制 (FCP)
- 总阻塞时间（TBT）
- 捆绑尺寸
- 请求计数

**重要**：在具有真实网络条件的真实设备上进行测量。具有快速连接的桌面 Chrome 并不具有代表性。

**从不**：
- 不测量就优化（过早优化）
- 为了性能而牺牲可访问性
- 优化时破坏功能
- 到处使用 `will-change` （创建新层，使用内存）
- 延迟加载首屏内容
- 优化微观优化，同时忽略主要问题（首先优化最大瓶颈）
- 忘记移动性能（通常是较慢的设备、较慢的连接）

## 验证改进

测试优化是否有效：

- **之前/之后的指标**：比较 Lighthouse 分数
- **真实用户监控**：跟踪真实用户的改进
- **不同设备**：在低端 Android 上测试，而不仅仅是旗舰 iPhone
- **连接速度慢**：节流至 3G，测试体验
- **无回归**：确保功能仍然有效
- **用户感知**：是否*感觉*更快？

当面向用户的数字移动时，将最后的传递交给 `$impeccable polish`。
