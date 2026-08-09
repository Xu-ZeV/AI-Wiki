仅适用于完美数据的设计无法投入生产。针对真实用户可能会遇到的输入、错误、语言和网络条件，强化界面。

## 评估强化需求

识别弱点和边缘情况：

1. **使用极端输入进行测试**：
   - 很长的文本（名称、描述、标题）
   - 非常短的文本（空，单个字符）
   - 特殊字符（表情符号、RTL 文本、重音符号）
   - 大量（数百万、数十亿）
   - 许多项目（1000 多个列表项目，50 多个选项）
   - 无数据（空状态）

2. **测试错误场景**：
   - 网络故障（离线、缓慢、超时）
   - API 错误（400、401、403、404、500）
   - 验证错误
   - 权限错误
   - 速率限制
   - 并发操作

3. **测试国际化**：
   - 长翻译（德语通常比英语长 30%）
   - RTL 语言（阿拉伯语、希伯来语）
   - 字符集（中文、日文、韩文、表情符号）
   - 日期/时间格式
   - 数字格式（1,000 与 1.000）
   - 货币符号

**关键**：仅适用于完美数据的设计无法投入生产。面对现实更加坚定。

## 硬化尺寸

系统地提高弹性：

### 文本溢出和换行

**长文本处理**：
```css
/* Single line with ellipsis */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Multi-line with clamp */
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Allow wrapping */
.wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}
```

**Flex/Grid 溢出**：
```css
/* Prevent flex items from overflowing */
.flex-item {
  min-width: 0; /* Allow shrinking below content size */
  overflow: hidden;
}

/* Prevent grid items from overflowing */
.grid-item {
  min-width: 0;
  min-height: 0;
}
```

**响应式文本大小**：
- 使用 `clamp()` 进行流体排版
- 设置最小可读尺寸（移动设备上为 14px）
- 测试文本缩放（缩放至 200%）
- 确保容器随文本展开

### 国际化 (i18n)

**文本扩展**：
- 增加 30-40% 的翻译空间预算
- 使用适应内容的flexbox/grid
- 使用最长的语言进行测试（通常是德语）
- 避免文本容器上的固定宽度

```jsx
// ❌ Bad: Assumes short English text
<button className="w-24">Submit</button>

// ✅ Good: Adapts to content
<button className="px-4 py-2">Submit</button>
```

**RTL（从右到左）支持**：
```css
/* Use logical properties */
margin-inline-start: 1rem; /* Not margin-left */
padding-inline: 1rem; /* Not padding-left/right */
border-inline-end: 1px solid; /* Not border-right */

/* Or use dir attribute */
[dir="rtl"] .arrow { transform: scaleX(-1); }
```

**字符集支持**：
- 到处使用UTF-8编码
- 使用中文/日文/韩文 (CJK) 字符进行测试
- 使用表情符号进行测试（它们可以是 2-4 个字节）
- 处理不同的文字（拉丁语、西里尔语、阿拉伯语等）

**日期/时间格式**：
```javascript
// ✅ Use Intl API for proper formatting
new Intl.DateTimeFormat('en-US').format(date); // 1/15/2024
new Intl.DateTimeFormat('de-DE').format(date); // 15.1.2024

new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
}).format(1234.56); // $1,234.56
```

**复数**：
```javascript
// ❌ Bad: Assumes English pluralization
`${count} item${count !== 1 ? 's' : ''}`

// ✅ Good: Use proper i18n library
t('items', { count }) // Handles complex plural rules
```

### 错误处理

**网络错误**：
- 显示清晰的错误消息
- 提供重试按钮
- 解释发生了什么
- 提供离线模式（如果适用）
- 处理超时场景

```jsx
// Error states with recovery
{error && (
  <ErrorMessage>
    <p>Failed to load data. {error.message}</p>
    <button onClick={retry}>Try again</button>
  </ErrorMessage>
)}
```

**表单验证错误**：
- 字段附近的内联错误
- 清晰、具体的信息
- 建议更正
- 不必要时不要阻止提交
- 发生错误时保留用户输入

**API错误**：
- 适当地处理每个状态代码
  - 400：显示验证错误
  - 401：重定向到登录
  - 403：显示权限错误
  - 404：显示未找到状态
  - 429：显示速率限制消息
  - 500：显示一般错误，提供支持

**优雅降级**：
- 核心功能无需 JavaScript 即可运行
- 图像有替代文本
- 渐进增强
- 不支持的功能的后备

### 边缘情况和边界条件

**空状态**：
- 列表中没有项目
- 没有搜索结果
- 没有通知
- 没有数据可显示
- 提供明确的下一步行动

**加载状态**：
- 初始负载
- 分页负载
- 刷新
- 显示正在加载的内容（“正在加载您的项目...”）
- 长时间操作的时间估计

**大型数据集**：
- 分页或虚拟滚动
- 搜索/过滤功能
- 性能优化
- 不要一次加载全部 10,000 个项目

**并发操作**：
- 防止重复提交（加载时禁用按钮）
- 处理竞争条件
- 乐观更新与回滚
- 解决冲突

**权限状态**：
- 没有权限查看
- 没有权限编辑
- 只读模式
- 清楚解释原因

**浏览器兼容性**：
- 用于现代功能的 Polyfill
- 不支持 CSS 的后备方案
- 功能检测（不是浏览器检测）
- 在目标浏览器中测试

### 输入验证和清理

**客户端验证**：
- 必填字段
- 格式验证（电子邮件、电话、URL）
- 长度限制
- 模式匹配
- 自定义验证规则

**服务器端验证**（始终）：
- 永远不要只相信客户端
- 验证和清理所有输入
- 防止注入攻击
- 速率限制

**约束处理**：
```html
<!-- Set clear constraints -->
<input 
  type="text"
  maxlength="100"
  pattern="[A-Za-z0-9]+"
  required
  aria-describedby="username-hint"
/>
<small id="username-hint">
  Letters and numbers only, up to 100 characters
</small>
```

### 可访问性弹性

**键盘导航**：
- 所有功能均可通过键盘访问
- 逻辑选项卡顺序
- 模态中的焦点管理
- 跳过长内容的链接

**屏幕阅读器支持**：
- 正确的 ARIA 标签
- 宣布动态变化（实时区域）
- 描述性替代文本
- 语义 HTML

**运动灵敏度**：
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**高对比度模式**：
- 在Windows高对比度模式下测试
- 不要只依赖颜色
- 提供替代视觉提示

### 性能弹性

**连接速度慢**：
- 渐进式图像加载
- 骨架屏幕
- 乐观的UI更新
- 离线支持（服务人员）

**内存泄漏**：
- 清理事件监听器
- 取消订阅
- 清除计时器/间隔
- 卸载时中止挂起的请求

**节流和去抖**：
```javascript
// Debounce search input
const debouncedSearch = debounce(handleSearch, 300);

// Throttle scroll handler
const throttledScroll = throttle(handleScroll, 100);
```

## 测试策略

**手动测试**：
- 使用极端数据进行测试（非常长、非常短、空）
- 用不同的语言进行测试
- 离线测试
- 测试慢速连接（节流至 3G）
- 使用屏幕阅读器进行测试
- 测试仅键盘导航
- 在旧浏览器上测试

**自动化测试**：
- 边缘情况的单元测试
- 错误场景的集成测试
- 关键路径的端到端测试
- 视觉回归测试
- 辅助功能测试（axe、WAVE）

**重要**：强化是指预期意外情况。真正的用户会做你从未想象过的事情。

**从不**：
- 假设完美的输入（验证一切）
- 忽略国际化（面向全球设计）
- 保留通用错误消息（“发生错误”）
- 忘记离线场景
- 仅信任客户端验证
- 使用固定宽度的文本
- 假设英文长度文本
- 当一个组件出错时阻止整个接口

## 验证强化

使用边缘情况进行彻底测试：

- **长文本**：尝试使用超过 100 个字符的名称
- **表情符号**：在所有文本字段中使用表情符号
- **RTL**：使用阿拉伯语或希伯来语进行测试
- **CJK**：中文/日文/韩文测试
- **网络问题**：禁用互联网，限制连接
- **大型数据集**：使用 1000 多个项目进行测试
- **并发操作**：快速点击提交10次
- **错误**：强制API错误，测试所有错误状态
- **空**：删除所有数据，测试空状态

当边缘情况被覆盖时，将最后的传递交给 `$impeccable polish`。
