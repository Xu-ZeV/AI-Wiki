---
name: vue-debug-guides
description: Vue 3 调试和错误处理，用于运行时错误、警告、异步失败和 SSR/Hydration 问题。在诊断或修复 Vue 问题时使用。
---

针对运行时问题、警告、异步失败和水合错误的 Vue 3 调试和错误处理。
有关开发最佳实践和常见问题，请使用 `vue-best-practices`。

### 响应式
- 跟踪意外的重新渲染和状态更新 → 请参阅 [reactivity-debugging-hooks](reference/reactivity-debugging-hooks.md)
- 由于缺少 .value 访问，参考值未更新 → 请参阅 [ref-value-access](reference/ref-value-access.md)
- 解构响应式对象后状态停止更新 → 请参阅 [reactive-destructuring](reference/reactive-destructuring.md)
- 数组、映射或集合内的引用未展开 → 请参阅 [refs-in-collections-need-value](reference/refs-in-collections-need-value.md)
- 嵌套引用在模板中渲染为 [object Object] → 请参阅 [template-ref-unwrapping-top-level](reference/template-ref-unwrapping-top-level.md)
- 响应式代理身份比较始终返回 false → 请参阅 [reactivity-proxy-identity-hazard](reference/reactivity-proxy-identity-hazard.md)
- 第三方实例在代理时中断 → 请参阅 [reactivity-markraw-for-non-reactive](reference/reactivity-markraw-for-non-reactive.md)
- 侦听器意外地每个刻度仅触发一次 → 请参阅 [reactivity-same-tick-batching](reference/reactivity-same-tick-batching.md)

### 已计算
- 计算的 getter 意外触发突变或请求 → 请参阅 [compulated-no-side-effects](reference/computed-no-side-effects.md)
- 改变计算值会导致更改消失 → 请参阅 [compulated-return-value-readonly](reference/computed-return-value-readonly.md)
- 计算值在条件逻辑后永远不会更新→请参阅[计算条件依赖](reference/computed-conditional-dependencies.md)
- 排序或反转数组会破坏原始状态→请参阅[计算数组突变](reference/computed-array-mutation.md)
- 将参数传递给计算属性失败 → 请参阅 [compulated-no-parameters](reference/computed-no-parameters.md)

### 侦听器
- 异步操作覆盖陈旧数据 → 请参阅 [watch-async-cleanup](reference/watch-async-cleanup.md)
- 在异步回调中创建侦听器 → 请参阅 [watch-async-creation-memory-leak](reference/watch-async-creation-memory-leak.md)
- 侦听器永远不会触发响应式对象属性 → 请参阅 [watch-reactive-property-getter](reference/watch-reactive-property-getter.md)
- 异步 watchEffect 在等待后丢失依赖项 → 请参阅 [watcheffect-async-dependency-tracking](reference/watcheffect-async-dependency-tracking.md)
- DOM 读取在侦听器回调中已过时 → 请参阅 [watch-flush-timing](reference/watch-flush-timing.md)
- 深度侦听器报告相同的旧/新值 → 请参阅 [watch-deep-same-object-reference](reference/watch-deep-same-object-reference.md)
- watchEffect 在模板引用更新之前运行 → 请参阅 [watcheffect-flush-post-for-refs](reference/watcheffect-flush-post-for-refs.md)

### 组件
- 子组件抛出“未找到组件”错误 → 请参阅 [local-components-not-in-descendants](reference/local-components-not-in-descendants.md)
- 单击侦听器不会在自定义组件上触发 → 请参阅 [click-events-on-components](reference/click-events-on-components.md)
- 父级无法在 script setup中访问子级引用数据 → 请参阅 [component-ref-requires-defineexpose](reference/component-ref-requires-defineexpose.md)
- HTML 模板解析破坏了 Vue 组件语法 → 请参阅 [in-dom-template-parsing-caveats](reference/in-dom-template-parsing-caveats.md)
- 由于命名冲突导致组件渲染错误 → 请参阅 [组件命名冲突](reference/component-naming-conflicts.md)
- 父样式不适用于多根组件 → 请参阅 [multi-root-component-class-attrs](reference/multi-root-component-class-attrs.md)

### props和emits
-在defineProps中引用的变量会导致错误→参见[prop-defineprops-scope-limitation](reference/prop-defineprops-scope-limitation.md)
- 组件发出未声明的事件，导致警告 → 请参阅 [declare-emits-for-documentation](reference/declare-emits-for-documentation.md)
- 在函数或条件内部使用的defineEmits→参见[defineEmits-must-be-top-level](reference/defineEmits-must-be-top-level.md)
- DefineEmits 具有类型和运行时参数 → 请参阅 [defineEmits-no-runtime-and-type-mixed](reference/defineEmits-no-runtime-and-type-mixed.md)
- 本机事件侦听器不响应点击 → 请参阅 [native-event-collision-with-emits](reference/native-event-collision-with-emits.md)
- 单击时组件事件触发两次 → 请参阅 [未声明的emits双触发](reference/undeclared-emits-double-firing.md)

### 模板
- 使用语句获取模板编译错误 → 请参阅[模板表达式限制](reference/template-expressions-restrictions.md)
- “无法读取未定义的属性”运行时错误 → 请参阅 [v-if-null-check-order](reference/v-if-null-check-order.md)
- 动态指令参数无法正常工作 → 请参阅 [dynamic-argument-constraints](reference/dynamic-argument-constraints.md)
- v-else 元素始终无条件渲染 → 请参阅 [v-else-must-follow-v-if](reference/v-else-must-follow-v-if.md)
- 将 v-if 与 v-for 混合会导致优先级错误和迁移破坏 → 请参阅 [no-v-if-with-v-for](reference/no-v-if-with-v-for.md)
- 模板函数调用突变状态会导致不可预测的重新渲染错误 → 请参阅 [template-functions-no-side-effects](reference/template-functions-no-side-effects.md)
- 循环中的子组件显示未定义的数据 → 请参阅 [v-for-component-props](reference/v-for-component-props.md)
- 排序或反转后数组顺序发生变化 → 请参阅 [v-for-compulated-reverse-sort](reference/v-for-computed-reverse-sort.md)
- 列出项目意外消失或交换状态 → 请参阅 [v-for-key-attribute](reference/v-for-key-attribute.md)
- 通过范围迭代获得相差一的错误 → 请参阅 [v-for-range-starts-at-one](reference/v-for-range-starts-at-one.md)
- v-show 或 v-else 不适用于模板元素 → 请参阅 [v-show-template-limitation](reference/v-show-template-limitation.md)

### 模板 ref
- 当元素有条件隐藏时 Ref 变为 null → 请参阅 [template-ref-null-with-v-if](reference/template-ref-null-with-v-if.md)
- 引用数组索引与循环中的数据数组不匹配 → 请参阅 [template-ref-v-for-order](reference/template-ref-v-for-order.md)
- 重构模板引用名称在代码中默默中断 → 请参阅 [use-template-ref-vue35](reference/use-template-ref-vue35.md)

### 表格和 v-model
- 使用 v-model 时不显示初始表单值 → 请参阅 [v-model-ignores-html-attributes](reference/v-model-ignores-html-attributes.md)
- 文本区域内容更改不更新参考 → 请参阅 [textarea-no-interpolation](reference/textarea-no-interpolation.md)
- iOS 用户无法选择下拉菜单第一个选项 → 请参阅 [select-initial-value-ios-bug](reference/select-initial-value-ios-bug.md)
- 父组件和子组件具有不同的值→参见[define-model-default-value-sync](reference/define-model-default-value-sync.md)
- 对象属性更改未同步到父级 → 请参阅 [definemodel-object-mutation-no-emit](reference/definemodel-object-mutation-no-emit.md)
- 中文/日文输入的实时搜索/验证被破坏 → 请参阅 [v-model-ime-composition](reference/v-model-ime-composition.md)
- 数字输入返回空字符串而不是零 → 请参阅 [v-model-number-modifier-behavior](reference/v-model-number-modifier-behavior.md)
- 自定义复选框值未在表单中提交 → 请参阅 [checkbox-true-false-value-form-submission](reference/checkbox-true-false-value-form-submission.md)

### 事件和修饰符
- 链接多个事件修饰符会产生意外结果 → 请参阅 [event-modifier-order-matters](reference/event-modifier-order-matters.md)
- 键盘快捷键不会与系统修饰键一起触发 → 请参阅 [keyup-modifier-timing](reference/keyup-modifier-timing.md)
- 键盘快捷键会触发意外的修饰符组合 → 请参阅[精确修饰符的精确快捷键](reference/exact-modifier-for-precise-shortcuts.md)
- 结合被动和预防修饰符会破坏事件行为 → 请参阅 [no-passive-with-prevent](reference/no-passive-with-prevent.md)

### 生命周期
- 未删除的事件侦听器导致内存泄漏 → 请参阅 [cleanup-side-effects](reference/cleanup-side-effects.md)
- 组件挂载前 DOM 访问失败 → 请参阅 [lifecycle-dom-access-timing](reference/lifecycle-dom-access-timing.md)
- DOM 在状态更改后读取返回陈旧值 → 请参阅 [dom-update-timing-nexttick](reference/dom-update-timing-nexttick.md)
- SSR 渲染与客户端水合作用不同 → 请参阅 [lifecycle-ssr-awareness](reference/lifecycle-ssr-awareness.md)
- 异步注册的生命周期钩子子永远不会运行 → 请参阅 [lifecycle-hooks-synchronous-registration](reference/lifecycle-hooks-synchronous-registration.md)

### Slots
- 访问插槽内容中的子组件数据会返回未定义的值 → 请参阅 [slot-render-scope-parent-only](reference/slot-render-scope-parent-only.md)
- 将命名槽和作用域槽混合在一起会导致编译错误 → 请参阅 [slot-named-scoped-explicit-default](reference/slot-named-scoped-explicit-default.md)
- 在原生 HTML 元素上使用 v-slot 会导致编译错误 → 请参阅 [slot-v-slot-on-components-or-templates-only](reference/slot-v-slot-on-components-or-templates-only.md)
- 隐式默认插槽行为导致意外的内容放置 → 请参阅 [slot-implicit-default-content](reference/slot-implicit-default-content.md)
- 作用域插槽props缺少预期的名称属性 → 请参阅 [slot-name-reserved-prop](reference/slot-name-reserved-prop.md)
- 包装组件破坏了子插槽功能→请参阅[插槽转发到子组件](reference/slot-forwarding-to-child-components.md)

### 提供/注入
- 异步操作后调用 Provide 会默默失败 → 请参阅 [provide-inject-synchronous-setup](reference/provide-inject-synchronous-setup.md)
- 跟踪提供的值的来源 → 请参阅 [provide-inject-debugging-challenges](reference/provide-inject-debugging-challenges.md)
- 提供程序更改时注入的值不会更新 → 请参阅 [provide-inject-reactivity-not-automatic](reference/provide-inject-reactivity-not-automatic.md)
- 多个组件共享相同的默认对象 → 请参阅 [provide-inject-default-value-factory](reference/provide-inject-default-value-factory.md)

### 属性
- 内部事件处理程序和失败事件处理程序均执行 → 请参阅 [attrs-event-listener-merging](reference/attrs-event-listener-merging.md)
- 被fallthrough值覆盖的显式属性→参见[fallthrough-attrs-overwrite-vue3](reference/fallthrough-attrs-overwrite-vue3.md)
- 应用于包装器中错误元素的属性 → 请参阅 [inheritattrs-false-for-wrapper-components](reference/inheritattrs-false-for-wrapper-components.md)

### 可组合函数
- 可组合调用外部设置上下文或异步 → 请参阅 [composable-call-location-restrictions](reference/composable-call-location-restrictions.md)
- 输入更改时可组合反应依赖项不会更新 → 请参阅 [composable-tovalue-inside-watcheffect](reference/composable-tovalue-inside-watcheffect.md)
- 可组合函数意外地改变外部状态 → 请参阅 [composable-avoid-hidden-side-effects](reference/composable-avoid-hidden-side-effects.md)
- 解构可组合返回意外地破坏了响应式 → 请参阅 [composable-naming-return-pattern](reference/composable-naming-return-pattern.md)

### 组合 API
- 生命周期挂钩在异步操作后静默失败 → 请参阅 [composition-api-script-setup-async-context](reference/composition-api-script-setup-async-context.md)
- 父组件引用无法访问公开的属性 → 请参阅 [define-expose-before-await](reference/define-expose-before-await.md)
- 函数式编程模式破坏了预期的 Vue 反应行为 → 请参阅 [composition-api-not-functions-programming](reference/composition-api-not-functional-programming.md)
- React Hook 心理模型导致 Composition API 使用不正确 → 请参阅 [composition-api-vs-react-hooks-differences](reference/composition-api-vs-react-hooks-differences.md)

### 动画
- 重用 DOM 节点时动画无法触发 → 请参阅 [animation-key-for-rerender](reference/animation-key-for-rerender.md)
- TransitionGroup 列表更新在负载下感觉滞后 → 请参阅 [animation-transitiongroup-performance](reference/animation-transitiongroup-performance.md)

### TypeScript
- 可变 prop 默认组件实例之间的泄漏状态 → 请参阅 [ts-withdefaults-mutable-factory-function](reference/ts-withdefaults-mutable-factory-function.md)
-reactive()泛型类型导致ref解包不匹配→参见[ts-reactive-no-generic-argument](reference/ts-reactive-no-generic-argument.md)
- 模板引用在挂载之前或 v-if 卸载之后抛出空访问错误 → 请参阅 [ts-template-ref-null-handling](reference/ts-template-ref-null-handling.md)
- 可选布尔属性的行为为 false 而不是未定义 → 请参阅 [ts-defineprops-boolean-default-false](reference/ts-defineprops-boolean-default-false.md)
- 导入的defineProps类型因无法解析或复杂的类型引用而失败→请参阅[ts-defineprops-imported-types-limitations](reference/ts-defineprops-imported-types-limitations.md)
- 非类型化 DOM 事件处理程序在严格的 TypeScript 设置下失败 → 请参阅 [ts-event-handler-explicit-typing](reference/ts-event-handler-explicit-typing.md)
- 动态组件引用触发响应式组件警告 → 请参阅 [ts-shallowref-for-dynamic-components](reference/ts-shallowref-for-dynamic-components.md)
- 联合类型的模板表达式在没有缩小的情况下无法通过类型检查 → 请参阅 [ts-template-type-casting](reference/ts-template-type-casting.md)

### 异步组件
- 路由组件配置错误，defineAsyncComponent 延迟加载 → 请参阅 [async-component-vue-router](reference/async-component-vue-router.md)
- 网络故障或加载组件超时 → 请参阅 [async-component-error-handling](reference/async-component-error-handling.md)
- 组件重新激活后模板引用未定义 → 请参阅 [async-component-keepalive-ref-issue](reference/async-component-keepalive-ref-issue.md)

### 渲染函数
- 状态更改后渲染函数输出保持静态 → 请参阅 [rendering-render-function-return-from-setup](reference/rendering-render-function-return-from-setup.md)
- 重用的 vnode 实例渲染不正确 → 请参阅 [render-function-vnodes-must-be-unique](reference/render-function-vnodes-must-be-unique.md)
- 字符串组件名称呈现为 HTML 元素 → 请参阅 [rendering-resolve-component-for-string-names](reference/rendering-resolve-component-for-string-names.md)
- 访问 vnode 内部在 Vue 更新时中断 → 请参阅 [render-function-avoid-internal-vnode-properties](reference/render-function-avoid-internal-vnode-properties.md)
- Vue 2 渲染函数模式在 Vue 3 中崩溃 → 请参阅 [rendering-render-function-h-import-vue3](reference/rendering-render-function-h-import-vue3.md)
- 插槽内容未从 h() 渲染 → 请参阅 [rendering-render-function-slots-as-functions](reference/rendering-render-function-slots-as-functions.md)

### KeepAlive
- 子组件使用嵌套的 Vue Router 路由安装两次 → 请参阅 [keepalive-router-nested-double-mount](reference/keepalive-router-nested-double-mount.md)
- 将 KeepAlive 与 Transition 动画结合使用时内存会增加 → 请参阅 [keepalive-transition-memory-leak](reference/keepalive-transition-memory-leak.md)

### 过渡
- JavaScript 转换挂钩在没有完成回调的情况下挂起 → 请参阅 [transition-js-hooks-done-callback](reference/transition-js-hooks-done-callback.md)
- 移动动画在内联列表元素上失败 → 请参阅 [transition-group-flip-inline-elements](reference/transition-group-flip-inline-elements.md)
- 列表项跳跃而不是平滑动画 → 请参阅 [transition-group-move-animation-position-absolute](reference/transition-group-move-animation-position-absolute.md)
- Vue 2 到 Vue 3 TransitionGroup 包装器更改中断布局 → 请参阅 [transition-group-no-default-wrapper-vue3](reference/transition-group-no-default-wrapper-vue3.md)
- 嵌套过渡在完成前被切断 → 请参阅 [transition-nested-duration](reference/transition-nested-duration.md)
- 作用域样式在可重用过渡包装器中停止工作 → 请参阅 [transition-reusable-scoped-style](reference/transition-reusable-scoped-style.md)
- RouterView 过渡在第一次渲染时意外动画 → 请参阅 [transition-router-view-appear](reference/transition-router-view-appear.md)
- 混合 CSS 过渡和动画会导致计时问题 → 请参阅 [transition-type-when-mixed](reference/transition-type-when-mixed.md)
- 快速转换交换期间错过了清理钩子 → 请参阅 [transition-unmount-hook-timing](reference/transition-unmount-hook-timing.md)

### Teleport
- DOM 中未找到Teleport目标元素 → 请参阅 [teleport-target-must-exist](reference/teleport-target-must-exist.md)
- Teleport的内容破坏了 SSR 水合作用 → 请参阅 [teleport-ssr-Hydration](reference/teleport-ssr-hydration.md)
- 范围样式不适用于Teleport内容 → 请参阅 [teleport-scoped-styles-limitation](reference/teleport-scoped-styles-limitation.md)

### Suspense
- 需要处理来自 Suspense 组件的异步错误 → 请参阅 [suspense-no-builtin-error-handling](reference/suspense-no-builtin-error-handling.md)
- 在服务器端渲染中使用 Suspense → 请参阅 [suspense-ssr-Hydration-issues](reference/suspense-ssr-hydration-issues.md)
- 在 Suspense 下忽略异步组件加载/错误 UI → 请参阅 [async-component-suspense-control](reference/async-component-suspense-control.md)

### SSR
- 服务器和客户端渲染之间的 HTML 不同 → 请参阅 [ssr-Hydration-mismatch-causes](reference/ssr-hydration-mismatch-causes.md)
- 来自共享单例存储的请求之间的用户状态泄漏 → 请参阅 [state-ssr-cross-request-pollution](reference/state-ssr-cross-request-pollution.md)
- 仅限浏览器的 API 会导致通用代码路径中的服务器渲染崩溃 → 请参阅 [ssr-platform-specific-apis](reference/ssr-platform-specific-apis.md)

### 性能
- 列出不必要的子级重新渲染，因为父级传递不稳定的 props → 请参阅 [perf-props-stability-update-optimization](reference/perf-props-stability-update-optimization.md)
- 尽管值相同，计算对象仍会重新触发效果 → 请参阅 [perf-compulated-object-stability](reference/perf-computed-object-stability.md)

### SFC（单文件组件）
- 尝试使用组件脚本块中的命名导出 → 请参阅 [sfc-named-exports-forbidden](reference/sfc-named-exports-forbidden.md)
- 更改后模板中的变量未更新 → 请参阅 [sfc-script-setup-reactivity](reference/sfc-script-setup-reactivity.md)
- 作用域样式不适用于子组件元素 → 请参阅 [sfc-scoped-css-child-component-styling](reference/sfc-scoped-css-child-component-styling.md)
- 范围样式不适用于动态 v-html 内容 → 请参阅 [sfc-scoped-css-dynamic-content](reference/sfc-scoped-css-dynamic-content.md)
- 范围样式不适用于插槽内容 → 请参阅 [sfc-scoped-css-slot-content](reference/sfc-scoped-css-slot-content.md)
- 动态构建时缺少 Tailwind 类 → 请参阅 [tailwind-dynamic-class- Generation](reference/tailwind-dynamic-class-generation.md)
- 由于名称冲突，递归组件未呈现 → 请参阅 [自引用组件名称](reference/self-referencing-component-name.md)

### 插件
- 调试全局属性导致命名冲突的原因→参见[plugin-global-properties-sparingly](reference/plugin-global-properties-sparingly.md)
- 插件不工作或注入返回未定义 → 请参阅 [plugin-install-before-mount](reference/plugin-install-before-mount.md)
- 插件全局属性在基于设置的组件中不可用 → 请参阅 [plugin-prefer-provide-inject-over-global-properties](reference/plugin-prefer-provide-inject-over-global-properties.md)
- 插件类型增强错误会破坏 ComponentCustomProperties 键入 → 请参阅 [plugin-typescript-type-augmentation](reference/plugin-typescript-type-augmentation.md)

### 应用程序配置
- 应用程序配置方法在挂载调用后不起作用→请参阅[configure-app-before-mount](reference/configure-app-before-mount.md)
- 由于 mount 返回组件实例，将应用程序配置链接到 mount() 失败 → 请参阅 [mount-return-value](reference/mount-return-value.md)
- Vite 中基于 require.context 的组件自动注册失败 → 参见 [dynamic-component-registration-vite](reference/dynamic-component-registration-vite.md)
