# 交互设计

## 八种交互状态

每个交互元素都需要设计这些状态：

|状态 |当 |视觉治疗 |
|-------|------|------------------|
| **默认** |休息时|基础造型 |
| **悬停** |指针悬停（非触摸）|微妙的提升、色彩偏移 |
| **焦点** |键盘/程序焦点 |可见环（见下文）|
| **活跃** |被压|压入，颜色变深|
| **已禁用** |不互动 |降低不透明度，无指针 |
| **加载** |加工|旋转器，骨架|
| **错误** |无效状态|红色边框、图标、消息|
| **成功** |已完成 |绿色支票、确认|

**常见的失误**：设计没有焦点的悬停，反之亦然。他们是不同的。键盘用户永远不会看到悬停状态。

## 聚焦环：正确使用

**切勿在没有替换的情况下使用 `outline: none`。** 这是可访问性违规。相反，使用 `:focus-visible` 仅为键盘用户显示焦点：

```css
/* Hide focus ring for mouse/touch */
button:focus {
  outline: none;
}

/* Show focus ring for keyboard */
button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

**聚焦环设计**：
- 高对比度（与相邻颜色至少 3:1）
- 2-3px 厚
- 与元素的偏移（不在元素内部）
- 所有交互元素保持一致

## 表单设计：非显而易见的

**占位符不是标签。**它们在输入时消失。始终使用可见的 `<label>` 元素。 **在模糊时进行验证**，而不是在每次击键时进行验证（例外：密码强度）。将错误放在 **下方** 字段中，并使用 `aria-describedby` 连接它们。

## 加载状态

**乐观更新**：立即显示成功，失败时回滚。用于低风险行为（点赞、关注），而不是付款或破坏性行为。 **骨架屏幕 > 旋转器**：它们预览内容形状并且感觉比通用旋转器更快。

## 模态：惰性方法

模态中的焦点捕获过去需要复杂的 JavaScript。现在使用 `inert` 属性：

```html
<!-- When modal is open -->
<main inert>
  <!-- Content behind modal can't be focused or clicked -->
</main>
<dialog open>
  <h2>Modal Title</h2>
  <!-- Focus stays inside modal -->
</dialog>
```

或者使用本机 `<dialog>` 元素：

```javascript
const dialog = document.querySelector('dialog');
dialog.showModal();  // Opens with focus trap, closes on Escape
```

## 弹出框 API

对于工具提示、下拉菜单和非模态叠加层，请使用本机弹出窗口：

```html
<button popovertarget="menu">Open menu</button>
<div id="menu" popover>
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```

**优点**：轻关闭（单击外部关闭）、正确堆叠、无 z-index 战争、默认可访问。

## 下拉和覆盖定位

在具有 `overflow: hidden` 或 `overflow: auto` 的容器内使用 `position: absolute` 渲染的下拉菜单将被剪裁。这是生成代码中最常见的下拉菜单错误。

### CSS 锚点定位

现代解决方案使用 CSS 锚点定位 API 将覆盖层绑定到其触发器，而无需使用 JavaScript：

```css
.trigger {
  anchor-name: --menu-trigger;
}

.dropdown {
  position: fixed;
  position-anchor: --menu-trigger;
  position-area: block-end span-inline-end;
  margin-top: 4px;
}

/* Flip above if no room below */
@position-try --flip-above {
  position-area: block-start span-inline-end;
  margin-bottom: 4px;
}
```

由于下拉列表使用 `position: fixed`，因此它会转义祖先元素上的任何 `overflow` 剪辑。 `@position-try` 块自动处理视口边缘。 **浏览器支持**：Chrome 125+、Edge 125+。 Firefox 或 Safari 中还没有 - 对这些浏览器使用后备。

### 弹出框 + 锚组合

将 Popover API 与锚点定位相结合，可以让您以一种模式进行堆叠、轻视、可访问性和正确定位：

```html
<button popovertarget="menu" class="trigger">Open</button>
<div id="menu" popover class="dropdown">
  <button>Option 1</button>
  <button>Option 2</button>
</div>
```

`popover` 属性将元素放置在**顶层**中，无论 z-index 或溢出如何，该元素都位于所有其他内容之上。无需门户。

### Teleport门/Teleport模式

在组件框架中，在文档根目录渲染下拉列表并使用 JavaScript 定位它：

- **反应**：`createPortal(dropdown, document.body)`
- **Vue**：`<Teleport to="body">`
- **Svelte**：使用门户库或安装到 `document.body`

根据触发器的 `getBoundingClientRect()` 计算位置，然后将 `position: fixed` 与 `top` 和 `left` 值应用。滚动时重新计算并调整大小。

### 固定定位回退

对于不支持锚点定位的浏览器，使用手动坐标的 `position: fixed` 可以避免溢出裁剪：

```css
.dropdown {
  position: fixed;
  /* top/left set via JS from trigger's getBoundingClientRect() */
}
```

渲染前检查视口边界。如果下拉菜单会溢出底部边缘，请将其翻转到触发器上方。如果它会溢出右边缘，请将其与触发器的右侧对齐。

## 破坏性操作：撤消 > 确认

**撤消比确认对话框更好。**用户不经意地点击确认。立即从 UI 中删除，显示撤消 toast，在 toast 过期后实际删除。仅对真正不可逆的操作（帐户删除）、高成本操作或批量操作使用确认。

## 键盘导航模式

### 流动标签索引

对于组件组（选项卡、菜单项、单选组），其中一项是可选项卡的；箭头键在以下范围内移动：

```html
<div role="tablist">
  <button role="tab" tabindex="0">Tab 1</button>
  <button role="tab" tabindex="-1">Tab 2</button>
  <button role="tab" tabindex="-1">Tab 3</button>
</div>
```

箭头键在项目之间移动 `tabindex="0"`。 Tab 完全移至下一个组件。

### 跳过链接

提供跳过链接 (`<a href="#main-content">Skip to main content</a>`)，供键盘用户跳过导航。隐藏在屏幕外，在焦点上显示。

## 手势可发现性

滑动删除和类似手势是不可见的。暗示它们的存在：

- **部分显示**：显示从边缘窥视的删除按钮
- **入职**：首次使用时的教练标记
- **替代**：始终提供可见的后备（带有“删除”的菜单）

不要依赖手势作为执行操作的唯一方式。

---

**避免**：在没有替代方案的情况下删除焦点指示器。使用占位符文本作为标签。触摸目标<44x44px。一般错误消息。没有 ARIA/键盘支持的自定义控件。
