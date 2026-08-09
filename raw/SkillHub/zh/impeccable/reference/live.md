交互式实时变体模式：在浏览器中选择元素，选择设计操作，并通过开发服务器的 HMR 热交换 AI 生成的 HTML+CSS 变体。

## 先决条件

具有热模块替换功能的正在运行的开发服务器（Vite、Next.js、Bun 等），或者在浏览器中打开的静态 HTML 文件。

Codex：从一开始就使用 `sandbox_permissions: "require_escalated"` 运行实时帮助程序命令、应用程序开发服务器以及任何依赖项安装设置；实时模式取决于沙箱阻止的本地主机和包管理器网络访问。

## 合同（阅读一次）

按顺序执行。没有跳过任何步骤，也没有重新排序步骤。

1、`live.mjs`：开机。
2. 打开为 `pageFile` 提供服务的应用程序 URL（从 `package.json`、文档、终端输出或打开的选项卡推断）。切勿使用`serverPort`；这是助手，而不是应用程序。 **光标：** `browser_navigate` 到轮询前的该 URL；不要跳过。 **其他工具：** 使用可用的浏览器工具；如果 URL 不确定，请询问用户一次。
3. 具有默认长超时（600000 ms）的轮询循环。每次事件或 `--reply` 后，立即再次运行 `live-poll.mjs`。切勿传递短`--timeout=`。

当没有代理进行长轮询 `/poll` 时，全局条**完美标记**会变暗并显示脉冲琥珀色点。将鼠标悬停在标记上即可获得提示；重启`live-poll.mjs`即可重新连接。
4. 在 `generate` 上：读取屏幕截图（如果有）；加载动作的参考；规划三个不同的方向；在一次编辑中编写所有变体； `--reply done`;再次投票。
5、在`steer`上：读取消息和`pageUrl`；完成工作（页面编辑、导航帮助或 `--reply` 消息中的简短回复）； `--reply steer_done`;再次投票。没有拾取确认。当 `steer_done` 通过 SSE 到达时，转向杆解锁。
6. 在 `accept` / `discard` 上：轮询脚本运行 `live-accept.mjs`，确认已传递的事件，并打印 `_completionAck`。普通接受/丢弃立即终止； Carbonize 接受保持可恢复，直到完成清理、运行 `live-complete.mjs --id EVENT_ID`，然后再次轮询。
7. 如果中断，请在猜测之前运行 `live-status.mjs` 或 `live-resume.mjs`。持久日志会在帮助程序重新启动后重播未确认的工作。
8. 在 `exit` 上：在底部运行清理。

线束政策：
- **克劳德代码**：将民意调查作为**后台任务**运行（无短超时）。安全带会在完成​​时通知您，因此主要对话保持自由。请勿堵塞外壳。
- **光标**：在**后台终端**中运行**一次性**轮询，并在 `"type":"(steer|generate|accept|discard|exit)"` 上发出通知。每次事件结束后，投票退出；处理它，`--reply`，然后再次启动`live-poll.mjs`。 **不要**在游标上使用 `--stream`：增量标准输出通知在实践中比基于退出的通知慢（测试中约为 5 秒 vs 亚秒）。
- **Codex**：在**前台**运行轮询（阻塞 shell；不是后台任务，不是子代理）。 Codex 后台执行会话在事件到达时无法可靠地将轮询标准输出返回到对话中，因此“即发即忘”后台轮询将停止实时模式。
- **其他工具**：一次性前台，除非您知道 shell 退出时 stdout 可靠地返回到此会话。

聊天是开销。没有回顾，没有教程输出，没有粘贴产品/设计主体。将token用于工具和编辑；失败时，一两句话。

## 开始

```bash
node .agents/skills/impeccable/scripts/live.mjs
```

输出 JSON：`{ ok, serverPort, serverToken, pageFiles, hasProduct, product, productPath, hasDesign, design, designPath }`。 `pageFiles` 是实时脚本注入的 HTML 条目列表。记住 PRODUCT.md 和 DESIGN.md 来生成变体； **DESIGN.md 在视觉决策上获胜； PRODUCT.md 在战略/声音决策上获胜。** 当 DESIGN.md 缺失时，身份**不会**消失；从页面上的 CSS 变量、计算样式和同级组件中提取它（请参阅步骤 4 阶段 A）。身份保留是默认设置；偏离现有身份需要通过 PRODUCT.md 反引用或用户的自由格式提示进行显式触发。

`serverPort` 和 `serverToken` 属于小型 **完美直播帮手** HTTP 服务器（服务于 `/live.js`、SSE 和 `/poll`）。该端口**不是**您的开发服务器，通常也不是您打开以查看应用程序的 URL。浏览器页面是服务于 `pageFiles` 条目之一的任何来源（Vite / Next / Bun /tunnel / LAN 主机名）。

如果输出为 `{ ok: false, error: "config_missing" | "config_invalid", path }`，则该项目尚未配置为实时模式（或其配置已过时）。请参阅底部的**首次设置**。

## 轮询循环

**默认（便携式，所有背带）：**

```
LOOP:
  node .agents/skills/impeccable/scripts/live-poll.mjs   # default long timeout; no --timeout=
  Read JSON; dispatch on "type"

  "generate"  → Handle Generate; reply done; LOOP
  "steer"     → Handle Steer; reply steer_done; LOOP
  "accept"    → Handle Accept; complete carbonize cleanup if required; LOOP
  "discard"   → Handle Discard; LOOP
  "prefetch"  → Handle Prefetch; LOOP
  "manual_edit_apply" → Handle Manual Edit Apply; reply done|partial|error; LOOP
  "timeout"   → LOOP
  "exit"      → break → Cleanup
```

**流模式（实验性的，不适用于光标）：**

```
node .agents/skills/impeccable/scripts/live-poll.mjs --stream   # stays running; one JSON line per event
  Handle event; run --reply in a separate command
  Repeat until "exit" line → Cleanup
```

Stream 使一个进程KeepAlive状态，并在再次轮询之前等待 `--reply` ack。仅当线束可靠且快速地读取增量标准输出时才有用。 **光标不是其中之一：** 长时间运行的 shell 上的背景模式通知大约需要 5 秒来获取事件，而一次性退出通知则需要不到一秒的时间。除非您进行了其他测量，否则默认情况下到处都是一次性的。

## 恢复命令

实时助手在 `.impeccable/live/sessions/` 下保留一个仅附加日志。浏览器检查点是建议性的但持久的；该期刊是规范的。这是本地持久恢复状态，而不是项目源。

当聊天中断、轮询错过、助手重新启动或浏览器重新加载时，请使用以下命令：

```bash
node .agents/skills/impeccable/scripts/live-status.mjs
node .agents/skills/impeccable/scripts/live-resume.mjs --id SESSION_ID
node .agents/skills/impeccable/scripts/live-complete.mjs --id SESSION_ID
```

- `live-status.mjs` 打印连接的助手状态、活动的持久会话和排队的待处理事件。即使助手不在时，通过直接阅读日志也能发挥作用。
- `live-resume.mjs` 打印活动快照、待处理事件、检查点阶段、可见变量、参数值和下一个安全代理操作。
- `live-complete.mjs` 是规范手册最终确认。在验证碳化/手动清理后使用它，并且不会自动发生进一步的轮询确认。

服务器重启规则：再次启动`live-server.mjs`，然后轮询。启动会从日志中重新排队未确认的待处理事件，因此不要要求用户再次单击“执行”，除非 `live-resume.mjs` 表示不存在活动会话。

## 句柄 `generate`

**替换模式**（默认）：`{id, action, freeformPrompt?, count, pageUrl, element, screenshotPath?, comments?, strokes?}`。

**插入模式** (`event.mode === "insert"`)：`{id, mode: "insert", count, pageUrl, insert: { position, anchor }, placeholder: { width, height }, freeformPrompt?, screenshotPath?, comments?, strokes?}`。没有 `action`。需要非空 `freeformPrompt` **或** 注释。仅当注释存在时才发送屏幕截图（与替换规则相同）。使用 `placeholder` 尺寸作为全新内容的软尺寸提示。

速度很重要；用户正在观看旋转器。通过使用换行/插入帮助程序并在一次编辑中编写所有变体，最大限度地减少工具调用。

### 插入模式分支

当`event.mode === "insert"`时：

1. 如果存在 `event.screenshotPath`，请阅读屏幕截图（仅注释）。
2. 运行 insert 帮助程序而不是换行：

```bash
node .agents/skills/impeccable/scripts/live-insert.mjs --id EVENT_ID --count EVENT_COUNT --position after \
  --element-id "ANCHOR_ID" --classes "class1,class2" --tag "section" --text "ANCHOR_TEXT"
```

- `--position` ← `event.insert.position` (`before` | `after`)
- 锚标志 ← `event.insert.anchor`（与换行相同的映射：id、类、标签、文本）

脚手架**无** `data-impeccable-variant="original"`。变体是在 `insertLine` 插入的全新 HTML+CSS。加载 `brand.md` 或 `product.md`（仅限自由格式，无操作子命令）。在一次编辑中写出所有变体，然后是 `--reply done`。

对于 Svelte/SvelteKit 目标，`live-insert.mjs` 返回 `previewMode: "svelte-component"`，其中 `mode: "insert"`、`file` 指向临时 `node_modules/.impeccable-live/<id>/manifest.json`、`componentDir` 指向变体组件文件，并且`sourceFile` 指向真实的 `.svelte` 路线。将每个插入的变体编写为 `componentDir` 下的真实 Svelte 组件（`v1.svelte`、`v2.svelte`，...）。插入变体必须是非空的全新内容，具有单个顶级根，没有 `data-impeccable-*` 属性，并且 CSS 位于每个组件的 `<style>` 块中。 **不要**在生成过程中编辑路由源；当用户循环变体时，浏览器会在实时锚点之前/之后安装临时组件。接受时，`live-accept.mjs` 立即将选定的组件标记插入到 `sourceFile` 中，并在源写入成功后删除临时会话。

对于非 Svelte 目标，在接受/丢弃时，`live-accept.mjs` 会删除包装器块；锚元素未受影响。

### 替换模式（默认）

### 1.阅读屏幕截图（如果有）

`event.screenshotPath` **仅当用户在 Go 之前至少放置了一条注释或笔划时才会发送。** 如果存在，它是使用内置注释渲染的元素 PNG 的绝对路径。 **在规划之前阅读它**：注释编码用户意图，无法单独从 `element.outerHTML` 恢复。

当`screenshotPath`不存在时，不要索要，也不要去寻找当前的渲染。这种遗漏是故意的：没有注释，屏幕截图会将模型锚定在现有设计上，并与三个不同方向的简报相悖。从 `element.outerHTML`、`event.element` 中的计算样式以及自由格式提示（如果存在）开始工作。

`event.comments` 和 `event.strokes` 随视觉一起携带结构化元数据。将屏幕截图视为主要内容；使用结构化数据来获取值得引用的细节（例如评论的确切文本）。

准确阅读注释：

- **注释位置带有含义。** 它的 `{x, y}` 是元素局部 CSS px（与 `element.boundingRect` 相同的坐标空间）。找到该点下的子元素并将注释文本本地应用到该子元素。标题附近的评论是关于标题的，而不是全局描述。
- **注释和笔画是独立的注释**，除非通过重叠或紧密接近而明确配对。不要让突出笔划的视觉重量覆盖其他地方特定文本注释的精确位置。
- **笔画是手势；按形状阅读它们。**闭环=“这个东西”（强调/焦点）；箭头=方向（移动/指向）；十字或斜杠=删除；自由涂鸦=根据上下文强调或删除。围绕区域 X 的循环意味着“注意 X”，而不是“仅更改 X 内的像素”。
- **当一笔画的意图不明确时**（圆圈还是箭头？强调还是移动？），用一句话说明你的阅读理由，而不是默默猜测。如果不确定性对摘要产生重大影响，请在生成之前提出一个简短的澄清问题。

### 2. 包裹元素

```bash
node .agents/skills/impeccable/scripts/live-wrap.mjs --id EVENT_ID --count EVENT_COUNT --element-id "ELEMENT_ID" --classes "class1,class2" --tag "div" --text "TEXT_SNIPPET"
```

标志映射。将它们分开，不要折叠成 `--query`：

- `--element-id` ← `event.element.id`
- `--classes` ← `event.element.classes` 以逗号连接
- `--tag` ← `event.element.tagName`
- `--text` ← `event.element.textContent` 的前 80 个字符（修剪，单行）。 **每次调用时传递此信息。** 当选取的元素与同级组件共享类 + 标记（`<Card>` 列表，重复部分）时，这将消除源代码中要包装的分支的歧义。如果没有它，换行会默默地落在第一个匹配项上，并可能重写错误的元素。

帮助器首先搜索 ID，然后搜索类，然后搜索标签 + 类组合。如果 `event.pageUrl` 暗示该文件（例如 `/` 通常是 `index.html`），则传递 `--file PATH` 跳过搜索。 `--query` 仅适用于原始文本搜索；不要将其用于普通元素查找。

如果 `--text` 与多个候选者匹配得同样好，则以 `{ error: "element_ambiguous", candidates: [...] }` 和 `fallback: "agent-driven"` 包装退出：读取候选行范围，决定哪一个与页面上下文中选取的元素匹配，并根据回退流程手动编写包装器。

成功时输出：`{ file, insertLine, commentSyntax, styleMode, styleTag, cssSelectorPrefixExamples, cssAuthoring }`。

对于 Svelte/SvelteKit 目标，`live-wrap.mjs` 返回 `previewMode: "svelte-component"`，其中 `file` 指向临时 `node_modules/.impeccable-live/<id>/manifest.json`，`componentDir` 指向变体组件文件，`sourceFile` 指向真实的组件文件。 `.svelte` 航线。将每个变体编写为 `componentDir` 下的真实 Svelte 组件（`v1.svelte`、`v2.svelte`，...）；使用动态文本 (`{propName}`) 的 `propContract` 属性名称，而不是文字快照字符串。使用语义类选择器将变体 CSS 放入每个组件的 `<style>` 块中（没有 `@scope`，没有 `data-impeccable-*`）。回复 `--file` 设置为清单路径；浏览器动态导入并安装已编译的组件，因此 Svelte HMR 在用户循环变体时不会重置页面状态。接受时，`live-accept.mjs` 在源升级成功后立即将接受的组件内联回 `sourceFile`。

**Svelte 组件路径上的参数位于 sidecar 中，而不是作为属性。** Svelte 将属性值内的 `{` 解析为表达式的开头，因此组件元素上的 `data-impeccable-params='[{…}]'` 属性无法编译 (`Expected token }`)。使用第 7 节中的确切参数模式在 `componentDir/params.json` 中声明此路径的参数，以变体编号作为键控：

```json
{
  "1": [
    {"id":"density","kind":"steps","default":"snug","label":"Density","options":[
      {"value":"airy","label":"Airy"},{"value":"snug","label":"Snug"},{"value":"packed","label":"Packed"}
    ]}
  ],
  "2": [
    {"id":"accent","kind":"range","min":0,"max":1,"step":0.05,"default":0.5,"label":"Accent"}
  ]
}
```

针对 `range`/`toggle` 的 `<style>` 和 `steps` 的 `[data-p-<id>="…"]` 编写组件 `var(--p-<id>, default)`；将这些选择器包装在 `:global(...)` 中，以便安装的根上运行时设置的旋钮值达到您的规则。浏览器读取 `params.json`，停靠面板，并在已安装的组件上驱动 `--p-*` / `data-p-*`，与 HTML/JSX 路径完全相同。

`styleMode` 控制必须如何创作预览 CSS。将其视为检测到的能力模式，而不是框架猜测：

- `scoped`：使用`@scope ([data-impeccable-variant="N"])`规则。
- `astro-global-prefixed`：使用显式的 `[data-impeccable-variant="N"]` 选择器前缀和工具返回的确切 `styleTag`。

使用 `cssAuthoring` 作为当前文件的真实来源。它包括确切的 `styleTag`、选择器策略、选择器示例、要求和禁止模式。除非返回的 `styleMode` / `cssAuthoring.mode` 指出，否则不要应用特定于框架的异常。

**回退错误。** Wrap 仅写入它判断为源的文件（由 git 跟踪，未标记为 GENERATED，未在配置的 `generatedFiles` 中列出）。如果它无法登陆源文件，则它会出错而不会写入；接受变体到生成的文件中是静默数据丢失。三种形状：

- `{ error: "file_is_generated", file, hint }`：用户提供的 `--file` 指向生成的文件。
- `{ error: "element_not_in_source", generatedMatch, hint }`：元素仅存在于生成的文件中（下一个构建将擦除任何编辑）。
- `{ error: "element_not_found", hint }`：元素不在任何项目文件中；可能是运行时注入的（JS 组件，从数据动态渲染）。

三者均携带 `fallback: "agent-driven"`。请按照下面的**处理后备**进行操作。

### 3. 加载操作的引用

如果 `event.action` 是 `impeccable`（默认自由格式操作），请使用 SKILL.md 的共享法则加上加载的寄存器引用（`brand.md` 或 `product.md`）。不要加载子命令参考。 **自由形式不是跳过参数的通行证：**您仍然遵循下面**§7参数**中的构图预算和自由形式偏差。子命令文件列表必须有签名旋钮； freeform 没有这样的文件，因此根据表面重量和主轴调整旋钮大​​小完全取决于您。

任何其他 `event.action`（`bolder`、`quieter`、`distill`、`polish`、`typeset`、`colorize`、`layout`、 `adapt`、`animate`、`delight`、`overdrive`)：规划前阅读`reference/<action>.md`。每个子命令编码一个特定的学科；跳过其引用会产生通用输出。这些文件可能需要特定的参数；将它们置于§7 预算之上，而不是取代它。

### 4. 规划三种变体：首先是身份，然后是模式，然后是轴

实时模式的错误框架是“展示三种不同的设计方向”。在现有表面上实时运行；该品牌已经选定。这项工作是**内部身份**的变化，而不是身份之间的选择。失败模式：非社论摘要上的三种社论排版变体。更大的失败模式：用户无法接受的三种非品牌变体，因为它们看起来不像他们的产品。

四个阶段。按顺序做。

#### A阶段：提取身份（不可跳过）

现有的表面已经有了一个身份。在计划任何事情之前先阅读它。来源，按优先顺序排列：

1. **DESIGN.md** 如果加载：读取视觉系统字段（调色板、类型配对、运动、组件）。这是权威答案。
2. 页面样式表中的 **CSS 自定义属性** (`:root { --color-...; --font-...; ... }`)：这些是事实上的标记。
3. 所选元素及其父元素的**计算样式**：颜色、字体、间距比例、角半径。
4. **页面上的兄弟组件**：现有组件使用什么视觉修辞？ （不对称还是居中？密集还是通风？大胆还是安静？）

用**一句话**写下你所看到的。这句话描述了屏幕上实际出现的表面；它不是抱负的，不是固执己见的，也不是针对品牌“应该”的样子进行编辑的。捕获，大致按以下顺序：

- 主要表面颜色和强调色，按十六进制或标记名称（使用实际值，而不是“暖色”或“中性”等类别）。
- 类型配对：加载的实际字体名称，主要的在前。
- 布局拓扑：主要元素如何排列（堆叠/并排/网格/不对称/重叠）。
- 表面处理：边角、边框、阴影、装饰密度。
- 你读出的语气来自文案本身，而不是审美感觉。

具体一点。 “现代”不是一种色彩，“优雅”不是一种类型搭配，“干净”不是一种布局。如果您无法提取轴的实际值，请跳过它而不是伪造。重点是记录实际情况，而不是描述您希望的情况。

请勿包含命名美学系列的形容词（“编辑倾向”、“终端风味”、“野兽派”）；这些是结论，而不是数据。它们属于出发模式下的C阶段车道选择，不属于身份描述。让他们潜入A阶段就是身份锁崩溃成自我实现的预言的方式。

这句话就是**身份锁**。如果并排呈现，每个变体都必须可读为同一品牌。跳过这个阶段是产生非品牌变体的主要原因。缺少 DESIGN.md 绝不是借口；相反，从 CSS 和计算样式中提取。

#### B阶段：挑选模式（默认与出发）

**默认模式**：保留现有身份。变体改变了其中的表达轴。 *这是大约 90% 的实时会话的正确模式。*用户在他们正在发货的真实产品上选择了一个元素；他们期待“他们的”英雄的变体，而不是三个不同品牌的英雄。

**出发方式**：现有身份被拒绝。变体提出了与 PRODUCT.md 语音一致的替代方案。仅当至少有一个为真时触发：

- PRODUCT.md 反引用显式调用当前表面（“当前 `index.html` 本身就是一个示例”；“远离此”；“屏幕上的页面是失败的”）。描述一般情况下应避免的内容的通用反引用不会触发离开模式；仅那些专门指向*此*表面的。
- 用户的自由形式提示明确要求离开（“从头开始重建它”，“如果它根本不是编辑性的怎么办”，“向我展示一些完全不同的东西”）。

如果您不确定，则说明您处于默认模式。默认错误的代价是“具有相似感觉的三个品牌变体”：可恢复，用户不选择任何一个。错误离开的代价是“三个非品牌变种”：无法挽回、用户恼火。

#### C 阶段：计划三种变体

**默认模式。** 每个变体都致力于差异的不同**主轴**，同时保留同一性句子。六轴：

1. **层次结构**：哪个元素控制眼睛？
2. **布局拓扑**：堆叠/并排/网格/不对称/叠加
3. **印刷系统**：配对逻辑、比例、大小/重量策略*在可用的面内*
4. **颜色策略**：现有的调色板角色承载表面（受限/承诺/完整调色板/浸透）。使用该品牌现有的调色板标记，而不是新颜色。
5. **密度**：最小/舒适/密集
6. **结构分解**：合并、拆分、渐进披露

三种变体 → 三个不同的轴。这三者解读为“从三个角度看同一个品牌”。不要引入新的字体、新的调色板色调或新的美学系列信号；这些属于出发模式。

**在规划每个变体时，还要命名其 2-3 个参数旋钮**（根据 §7 预算表）。参数是设计的一部分，而不是事后添加的装饰。如果变体探索密度，请暴露密度旋钮。如果它探索颜色承诺，请公开颜色量范围。在规划过程中决定“什么是可调整的”比将它们改装到最终的 HTML 上能产生更好的效果。

**出发模式。**每个变体都锚定于不同的**审美方向**，源自品牌声明的声音并在 PRODUCT.md 中注册。不要从固定的车道类别目录中进行选择。该品牌的正确三个方向与另一个品牌的正确三个方向不同，从列表中进行选择本身就是训练数据反射（模型每次都会选择“瑞士电网、终端、工业标牌”，因为这些是任何枚举列表中距编辑项目最远的）。

相反，从品牌出发：

1. 阅读 PRODUCT.md 的品牌个性词语。如果不涉及设计，什么样的物理、空间或物质体验会体现这些词语？ （被描述为“特定的、赢得的、明确无误的”个性会让人想起手印的信件、编号印刷品、钟表匠的放大镜。被描述为“不安分、吵闹、未经过滤”的个性会让人想起音乐会海报、喷漆墙、扩音器。）
2. 从这些物理体验中，得出三个彼此真正不同且与您要离开的当前表面完全不同的视觉方向。
3. 避开 [brand.md](brand.md) 中的**反射拒绝通道**。不要用一种单一栽培换取另一种单一栽培。如果您发现自己条件反射地伸手去够“瑞士电网”或“终端”或“工业标牌”，那么您正在对训练数据中的目录进行模式匹配，而不是阅读品牌。从个性词开始。
4. 每个方向必须用一个具体的句子来表达，该句子命名了一个现实世界的参照物（“当代艺术画廊的博物馆展览标签系统”而不是“干净和简约”）。如果你的句子只包含形容词，那就不够具体。
5. **在规划每个方向时，同时命名其 2-3 个参数旋钮**（根据 §7 预算表）。与默认模式相同的原则：在规划期间决定“什么是可调的”，而不是在编写 HTML 之后。具有 0 个参数的出发模式英雄并不是“大胆的创意愿景”，而是用户错失了微调他们选择的方向的机会。

#### D 阶段：斜视测试

**默认模式眯眼。** 阅读每个变体的身份语句并与 A 阶段锁定的身份进行比较。如果任何变体已经漂移到不同的调色板、类型语音或视觉修辞，则它已意外进入离开模式；返工。然后检查每个变体是否提交到不同的主轴。三个“更紧密的密度”变体是失败的。

**出发模式眯眼。**两遍，家人前句：

1. **家庭通行证。** 用您自己选择的一个设计家庭词标记每个变体（任何具体名词：*展览、店面、驾驶舱、食谱卡、节目单、现场手册*）。如果任何两个变体共享一个标签，或者该标签同样适用于其他变体，则需返工。不要使用固定的词汇表作为标签。 *此通行证在出发模式下是不可协商的，并且可以捕获句子通行证错过的单一文化失败。*
2. **句子传递。** 并排写下三个单句描述。如果其中两个押韵（“都是大字体”/“都是成堆的章节”/“都以 CTA 为中心”），则重新修改违规者。

**当主轴为颜色或主题时，禁止三重奏共享主题+主色调。** 两暗加一暗不明显。目标是三个色彩世界，而不是相同的三种色调。

**对于特定于操作的调用**，每个变体必须沿着操作名称的维度变化：

- `bolder`：放大每个变体的不同维度（规模/饱和度/结构变化）。不是三个“稍大”的变体。
- `quieter`：拉回不同的尺寸（颜色/装饰/间距）。
- `distill`：删除不同类别的多余内容（视觉噪音/冗余内容/嵌套结构）。
- `polish`：针对不同的细化轴（节奏/层次/微观细节，如角半径、焦点状态、光学字距调整）。
- `typeset`：不同类型的配对和不同的比例。一对配对中不包含三个连复段。
- `colorize`：每个不同的色调系列（不是一种色调的深浅）。改变色度和对比度策略。
- `layout`：不同的结构排列（堆叠/并排/网格/不对称）。不是间距调整。
- `adapt`：每个变体有不同的目标上下文（移动优先/平板电脑/桌面/打印或低数据）。不要制作三种移动布局。
- `animate`：不同的运动词汇（级联交错/剪辑擦除/缩放和聚焦/变形/视差）。不是三个交错的淡出。
- `delight`：不同的个性风格（意想不到的微交互/印刷惊喜/插图口音/声音或触觉时刻/复活节彩蛋交互）。
- `overdrive`：不同的约定被打破（尺度/结构/运动/输入模型/状态转换）。跳过`overdrive.md`的“提议和询问”步骤；实时模式是非交互的。

### 5. 应用自由格式提示（如果存在）

`event.freeformPrompt` 是用户方向的上限（所有变体都必须遵守它），但仍然探索有意义的不同*解释*。解释保留在您在 B 阶段选择的模式中。

在**默认模式**下，提示会缩小您选择的轴，而不是标识。 *“让它感觉更自信”*→变体1放大层次结构（一个元素控制眼睛），变体2承诺现有的强调色（致力于品牌色调的策略），变体3收紧密度并消除装饰性松弛。三个不同的轴，同一品牌。

在**出发模式**下，提示会缩小您所选择的车道，而不是家庭。 *“让它感觉像报纸头版”*本身就是一个出发模式提示；尊重它，但选择三个有意义的不同报纸相邻通道（大报、小报、贸易杂志），并运行家庭通行证以确保它们不会塌陷为一条。

当提示与 PRODUCT.md 反引用冲突时（提示要求 X，反引用禁止 X），反引用获胜；他们描述品牌的立场时，提示是一瞬间的。

### 6. 在一次编辑中编写所有变体

每个变体的原始元素的完整 HTML 替换，而不是纯 CSS 补丁。考虑元素的上下文（计算样式、父结构、`event.element` 中的 CSS 变量）。

在 `wrap` 报告的 `insertLine` 中编写 CSS + 所有变体。将 CSS 作为 `<style>` 标签并置在变体包装器内； `<style>` 在现代浏览器中的任何地方都可以工作，这确保了 CSS 和 HTML 以原子方式到达（无 FOUC）。

使用 `live-wrap.mjs` 返回的 `cssAuthoring` 对象来创作临时预览 CSS。下面所示的样式开始标签是常见的情况；当工具返回不同的值时，将其替换为 `cssAuthoring.styleTag`。变体标记形状在其他方面是稳定的：

```html
<!-- Variants: insert below this line -->
<style data-impeccable-css="SESSION_ID">
  /* rules matching cssAuthoring.rulePattern */
</style>
<div data-impeccable-variant="1">
  <!-- variant 1: full element replacement (single top-level element) -->
</div>
<div data-impeccable-variant="2" style="display: none">
  <!-- variant 2: full element replacement -->
</div>
<div data-impeccable-variant="3" style="display: none">
  <!-- variant 3: full element replacement -->
</div>
```

**每个变体 div 只包含一个顶级元素：原始元素的完整替换。** 使用与原始标签相同的标签（例如，如果用户选择了 `<section>`，则使用 `<section>`）。松散的兄弟（标题 + 段落 + div 作为变体 div 的直接子级）打破了大纲跟踪和接受流程，两者都假设一个子级。

第一个变体没有 `display: none`（默认情况下可见）。其他人都这样做。如果变体仅使用内联样式而不使用预览 CSS，请完全省略 `<style>` 标签。

一次编辑，所有变体；浏览器的 MutationObserver 一次性拾取所有内容。

对于 `styleMode: "scoped"`，使用后代组合器编写每个 `:scope` 规则。 `@scope` 边界是 **变体包装器 `<div data-impeccable-variant="N">`**，而不是您正在设计的元素。裸露的 `:scope { background: cream; }` 对包装进行样式设置，而不是内部替换，因此奶油落在 `display: contents` 外壳上，而实际元素保持页面默认值。始终介入：`:scope > .card`、`:scope > section`、`:scope .hero-title` 等。`tests/live-e2e/agent.mjs` 中的假测试代理的 CSS 是忠实的模板；每个作用域规则都以 `:scope > ...` 开头。

**JSX / TSX 目标文件。** 将 `<style>` 内容包装在模板文字中，以便 CSS `{` / `}` 不会解析为 JSX 表达式，并在每个变体元素上使用 `className=` / `style={{…}}`。保持 `data-impeccable-*` 属性不变；它们是普通字符串：

```tsx
<style data-impeccable-css="SESSION_ID">{`
  @scope ([data-impeccable-variant="1"]) { ... }
  @scope ([data-impeccable-variant="2"]) { ... }
`}</style>
<div data-impeccable-variant="1">
  {/* variant 1 */}
</div>
<div data-impeccable-variant="2" style={{ display: 'none' }}>
  {/* variant 2 */}
</div>
```

包装脚本已经为您提供了一个单根 JSX 包装器：一个 `<div data-impeccable-variants="…">` 外部元素，其中包含标记注释。将上面的变体块拖放到“变体：在此行下方插入”注释中，源代码将保持有效的 TSX。

### 7. 参数（组合大小，每个变体 0-4）

每个变体都可以暴露**粗**旋钮以及完整的 HTML/CSS 替换。浏览器将一个小面板停靠在轮廓右侧，每个参数一个控件。用户拖动/单击并看到即时反馈：再生成本为零，因为旋钮会切换已经针对变体的作用域 CSS 编写的 CSS 变量或数据属性。

**“可选”并不意味着什么。** 在大型工作中，参数并不是很好的装饰。这个词的意思是“省略多余或装饰性的控件”，而不是“默认为零，因为三个变体就足够了”。

**何时添加。** 一旦变体的作用域 CSS 具有有意义的连续或阶梯轴：密度、颜色量、类型比例、运动强度、列权重等。如果您可以想象用户嘀咕“更紧一点”或“重一点口音”**而不**想要完全再生，请连接该轴。 **不是**微小的利润或一次性的推动；这些不是参数。

**自由格式（`action` 是 `impeccable`）偏差。** 您没有加载子命令引用，因此您必须自己**选择**签名轴。匹配预算表：对于英雄或大型构图，这意味着**每个变体有 2-3 个轴**，而不是 1 个。首选位于三个变体实际不同尺寸上的旋钮（如果密度不同，将其显示为 `steps` 旋钮；如果颜色承诺不同，则将其显示为 `range`）。带有 **0** 参数的英雄几乎总是一个错误，而不是判断。除非设计确实是定点比较，否则具有恰好 **1** 参数的英雄权重不足。从预算表开始，而不是从零开始。

**预算与元素的视觉权重相关，而不是象征性预算。** 旋钮需要空间才能读取为可调；单个控件上的三个滑块是噪音。

- **Leaf / tiny**：单个按钮、图标、输入、裸标题、单独段落：**0 参数。**
- **小组合**：标记输入、简单卡片、简短标注（≤ ~5 个视觉儿童）：当一个主导轴明显时，**0–1** 参数；否则**0.**
- **中等组合**：部分组件、导航集群、密集卡片、短特征块（6-15 个视觉儿童）：**目标 2**；如果块很简单，**1** 是可以接受的； **0** 仅当变体是真正的不动点时。
- **大构图**：英雄部分，全页区域，跨页布局，强大的内部结构（16+视觉子部分或多个子部分）：**目标2–3**； **当多个独立轴（例如结构 `steps` + `density` + 一个重音符号）全部在作用域 CSS 中编写时，**最多 4**。

**如有疑问，请在默认为零之前询问是否存在刻度盘。** 用户始终可以请求更多变体，但实时模式的要点是即时调整，无需再次进行。面板拥挤是不好的； **运输不足**致密组合物上的旋钮是自由形状更常见的故障。按**视觉**子项计数，而不是 DOM 深度；浅而广的英雄还是大的。

**每个变体的硬上限：最多**四个**参数，以便面板保持清晰；仅当参考文献明确允许时才罕见第五种。

**如何声明。** 将 JSON 清单放在变体包装器上（HTML/JSX 路径）。 **在 Svelte `svelte-component` 路径上，请勿使用此属性**（Svelte 无法在属性值内编译 `{`）。在 `componentDir/params.json` 中声明由变体编号键入的参数（请参阅换行部分中的 Svelte 组件段落）。下面的参数模式对于两个路径都是相同的。

```html
<div data-impeccable-variant="1" data-impeccable-params='[
  {"id":"color-amount","kind":"range","min":0,"max":1,"step":0.05,"default":0.5,"label":"Color amount"},
  {"id":"density","kind":"steps","default":"snug","label":"Density","options":[
    {"value":"airy","label":"Airy"},
    {"value":"snug","label":"Snug"},
    {"value":"packed","label":"Packed"}
  ]},
  {"id":"serif","kind":"toggle","default":false,"label":"Serif display"}
]'>
  ...variant content...
</div>
```

**三种：**

- `range`：平滑滑块。在变体包装器上驱动 CSS 自定义属性 `--p-<id>`。使用 `var(--p-color-amount, 0.5)` 编写 CSS。字段：`min`、`max`、`step`、`default`（数字）、`label`。
- `steps`：分段无线电。驱动变体包装器上的数据属性 `data-p-<id>`。使用 `:scope[data-p-density="airy"] .grid { ... }` 编写 CSS。字段：`options`（`{value, label}` 的数组）、`default`（字符串）、`label`。
- `toggle`：开/关开关。驱动 CSS 变量 (`--p-<id>: 0|1`) 和数据属性（打开时存在，关闭时不存在）。使用哪个更方便。字段：`default`（布尔值）、`label`。

**每个操作的签名参数。** 对于指定的子命令，请读取该操作的 `reference/<action>.md` 中的一两个 **必须** 参数（例如 `layout` → `density`）。当设计能够表达它们时，这些都是不容协商的。 **自由格式没有文件级必须**；本节中的**自由形式 (`impeccable`) 偏差**是替代品。如果用户的操作既是风格化的又是子命令（例如 `colorize`），则子命令的 MUST 列表优先于其轴；仍然尊重**硬上限**并且不添加多余的重复旋钮。

**在变体开关上重置。** 用户在 v1 上拨动密度，然后翻转到 v2，v2 从 v2 声明的默认值开始。已知的限制；跨变体的保存可能会在以后落地。

**在接受时**，浏览器在接受事件中发送用户的当前值。 `live-accept.mjs` 将它们写为同级注释：

```html
<!-- impeccable-param-values SESSION_ID: {"color-amount":0.7,"density":"packed"} -->
```

Carbonize 清理步骤（见下文）读取该注释并将所选值烘焙到最终的 CSS 中。对于 `steps`/`toggle` 属性选择器：仅保留与所选值匹配的分支，删除其他分支，将 `:scope[data-p-density="packed"] .grid` 折叠为语义类规则。对于 `range` 变量：替换文字或将变量保留为所选值作为新的默认值。

### 8. 信号完成

```bash
node .agents/skills/impeccable/scripts/live-poll.mjs --reply EVENT_ID done --file RELATIVE_PATH
```

`RELATIVE_PATH` 相对于项目根（`public/index.html`、`src/App.tsx` 等）；如果开发服务器缺少 HMR，浏览器会直接获取源代码。

然后立即再次运行 `live-poll.mjs`。

### 中止正在进行的会话

如果在浏览器切换到 GENERATING 后换行或生成失败（例如，换行落在错误的源分支上并且您已经恢复了它，或者生成遇到了不可恢复的错误），请告诉 **浏览器**，使其栏重置为 PICKING：

```bash
node .agents/skills/impeccable/scripts/live-poll.mjs --reply EVENT_ID error "Short reason"
```

不要为此运行 `live-accept --discard`；这是一个纯粹的文件变异器，浏览器看不到它，并且栏永远卡在生成点上（用户必须刷新）。仅当 **浏览器** 启动丢弃（用户在循环期间单击 ✕）并且代理刚刚运行浏览器已触发的源端清理时，`--discard` 才是正确的。

## 处理回退

当wrap返回`fallback: "agent-driven"`时，确定性流不适用。在这里取货。

目标是相同的：为用户提供三种变体可供选择，并将接受的变体保留在下一个版本不会擦除的位置。不同之处在于您必须自己选择正确的源文件。

### 第 1 步：确定元素实际所在的位置

使用错误负载：

- `element_not_in_source` 和 `generatedMatch: "public/docs/foo.html"`：生成提供的 HTML。找到生成器（grep 查找该路径的编写器，例如 `scripts/build-sub-pages.js`，Astro/Next 模板）并找到发出此元素的模板或部分模板。
- `element_not_found`：该元素是运行时注入的。寻找渲染它的组件（React/Vue/Svelte）、组装它的 JS 或提供它的数据源。
- `file_is_generated` 和 `file: "..."`：用户明确指向生成的文件。分辨率与 `element_not_in_source` 相同。

阅读候选源，直到您确信元素的更改属于何处。如果更改纯粹是视觉上的，则该源可能是共享样式表，而不是模板。

### 步骤 2：在 DOM 中显示三个变体以供预览

浏览器栏正在等待变体。即使源代码中没有包装器，您仍然需要显示一些内容：

1. 手动将包装器脚手架写入 **served** 文件（浏览器实际加载的文件）。采用相同结构`live-wrap.mjs`生产； `<!-- impeccable-variants-start ID --><div data-impeccable-variants="ID" data-impeccable-variant-count="3" style="display: contents">…</div><!-- end -->`。
2. 将三个变体 div 插入其中，形状与确定性路径相同。
3. 用 `--reply EVENT_ID done --file <served file>` 发出信号。浏览器的无 HMR 回退将获取并注入。

此服务文件编辑是**临时的**：下次重新生成会将其擦除，这很好。真正的工作发生在接受时。

### 步骤 3：接受时，写入真实源

当接受事件到达时（这里的 `_acceptResult.handled` 通常是 `false`，因为接受也拒绝保留到生成的文件中；请参阅处理 Carbonize 分支的接受），提取接受的变体的内容并将其写入您在步骤 1 中标识的源中：

- 结构改变→编辑模板/组件源。
- 仅视觉更改 → 在适当的样式表中添加或更新规则；删除内联 `<style>` 范围。
- 从数据动态→更新数据源或渲染逻辑。

然后从所提供的文件中删除临时包装（如果它仍然存在）。

### 步骤 4：丢弃时，清理已提供的文件

取出您在步骤 2 中插入的包装纸。无需执行任何其他操作。

## 句柄 `accept`

事件：`{id, variantId, _acceptResult, _completionAck}`。轮询脚本已经运行 `live-accept.mjs` 来确定性地处理文件操作，然后确认事件传递给帮助程序。浏览器 DOM 已经更新。

- 接受事件包括`pageUrl`；轮询脚本必须将其转发到 `live-accept.mjs --page-url PAGE_URL`，因此接受时清理仅清除当前页面的暂存副本编辑。
- `_completionAck.ok !== true`：暂不进行轮询。运行 `live-status.mjs` / `live-resume.mjs`，如果需要，手动完成清理，然后运行 ​​`live-complete.mjs --id EVENT_ID`。
- `_acceptResult.handled: true` 和 `carbonize: false`：无事可做。再次投票。
- `_acceptResult.handled: true` 和 `carbonize: true`：**在下一次轮询之前需要进行接受后清理。** 请参阅下面的“接受后需要（碳化）”部分。 `event._acceptResult.todo` 字段、`_completionAck.requiresComplete` 和 stderr 横幅都指向此所需的后续操作；没有一个是装饰性的。清理后，运行 `live-complete.mjs --id EVENT_ID`，然后再次轮询。
- `_acceptResult.handled: false, mode: "fallback"`：会话存在于生成的文件中，并且脚本拒绝保留在那里。您已经在处理回退步骤 3 期间将接受的变体写入真实源代码；只需清理服务文件中的临时包装器（如果有），然后再次轮询。
- `_acceptResult.handled: false` 不带 `mode`：手动清理：读取文件、查找标记、编辑。

### 接受后需要（碳化）

当 `_acceptResult.carbonize === true` 时，接受的变体通过辅助标记和内联 CSS 缝合到源中，以便浏览器可以立即渲染它，没有视觉间隙。该缝合是**暂时的**。代理必须在执行其他操作之前将其重写为永久形式。跳过此操作会导致不可接受的变体的 `@scope` 规则失效、毫无意义的 `data-impeccable-variant` 包装器以及源文件中的 `impeccable-carbonize-start/end` 注释噪音；所有这些都在会话中累积。

在下一次轮询之前，在当前线程中同步执行这五个步骤。在文件干净之前不要再次轮询。

1. **在源文件 (`_acceptResult.file`) 中找到碳化块**。它由 `<!-- impeccable-carbonize-start SESSION_ID -->` 和 `<!-- impeccable-carbonize-end SESSION_ID -->` 括起来，并包含 `<style data-impeccable-css="SESSION_ID">` 元素。如果变体声明了参数，则 `<!-- impeccable-param-values SESSION_ID: {...} -->` 注释位于带有用户选择值的样式标签旁边；首先阅读它；它驱动下面的步骤 3 和 4。
2. **将 CSS 规则**移至项目的真实样式表中。哪个样式表取决于项目（例如，Astro 项目的 `site/styles/workflow.css`，或 Vite/Next 项目的组件共置 CSS 文件；选择已拥有周围元素样式的样式表）。
3. **重写选择器时烘焙参数值。** 对于 `@scope ([data-impeccable-variant="N"])` 包装器：重定向到可接受的 HTML (`.why-visual--v2 .v2-label { … }`) 上的真实语义类。对于 `:scope[data-p-<id>="VALUE"]` 选择器：仅保留与 param-values 注释中所选值匹配的分支；丢弃其他人（接受后他们就死了）。对于 CSS 中的 `var(--p-<id>, DEFAULT)`：要么替换文字值，要么如果参数仍然可以用作旋钮，则保留 var 并将其初始声明更新为所选值。
4. **解开接受的内容。** 删除包裹它的内部`<div data-impeccable-variant="N" style="display: contents">`。在 JSX/TSX 上，还删除外部 `<div data-impeccable-carbonize="SESSION_ID" style={{ display: 'contents' }}>` 包装器（如果存在）（接受添加它，以便三元/`return` 插槽保持单个根）。删除 `data-impeccable-params` 和任何 `data-p-*` 属性；这些是实时模式管道，而不是源。
5. **删除内联 `<style>` 块、`<!-- impeccable-param-values -->` 注释（如果存在）以及两个 `<!-- impeccable-carbonize-start/end -->` 标记。** 同时删除除已接受规则之外的变体的任何 `@scope` 规则；这些现在都是死代码了。

文件清理后，运行 `live-complete.mjs --id SESSION_ID`，验证其报告 `phase: "completed"`，然后再次轮询。

可以使用后台代理进行重写，但当前线程负责在发出下一个轮询之前验证这五个步骤是否已完成。在实践中，内联通常更快并且更不容易出错。

## 句柄 `discard`

事件：`{id, _acceptResult, _completionAck}`。民意调查脚本已经恢复了原始版本，删除了所有变体标记，并确认了 `discarded` 持久完成。除非`_completionAck.ok !== true`，否则无事可做；在这种情况下，运行 `live-complete.mjs --id EVENT_ID --discarded`，然后再次轮询。

## 句柄 `steer`

事件：`{id, message, pageUrl}`。用户在全局栏**转向**控制中键入或讲话：页面级方向，无需选择元素或启动变体生成。

麦克风按钮使用浏览器 **Web Speech API** (MVP)：单击开始、说话，说话结束时自动停止，然后将转录内容作为引导事件提交。聆听时再次点击取消而不提交。

这比 `generate` 更轻：没有屏幕截图，没有元素上下文，没有变体循环。阅读 `message` 并根据需要检查实时页面或项目文件，然后进行编辑或以散文形式回答。

完成后：

```bash
node .agents/skills/impeccable/scripts/live-poll.mjs --reply EVENT_ID steer_done ["Optional short note for a browser toast"]
```

失败时：

```bash
node .agents/skills/impeccable/scripts/live-poll.mjs --reply EVENT_ID error "Short reason"
```

然后立即再次轮询。不要发送单独的“已拾取”回复。转向杆保持锁定状态，直到 `steer_done` 或 `error` 通过 SSE 到达。

## 句柄 `prefetch`

事件：`{pageUrl}`。当用户第一次选择给定路径上的元素时，浏览器会触发此事件，作为延迟快捷方式；它表明用户可能即将进入您尚未阅读的页面。

将 `pageUrl` 解析为底层文件：

- 根 `/` → `live.mjs` 返回的 `pageFile`（通常为 `public/index.html` 或等效项）。
- 子路线（例如 `/docs`、`/docs/live`）→ 该路线的生成文件或源文件。利用您对项目布局的了解（多页面静态站点通常会解析 `/foo` → `public/foo/index.html`；SPA 可能会将所有路由映射到单个条目）。

将文件读入上下文，然后再次轮询。否 `--reply`：这是推测性的前期工作；稍后会来。如果您无法自信地解析文件的路由，请跳过并再次轮询。

重复数据删除是浏览器的工作（每个会话对每个唯一路径名进行一次预取）；相信它。如果同一文件从映射到同一文件的不同路由中出现两次，则无论如何都会缓存第二次读取。

## 句柄 `manual_edit_apply`

事件：`{id, pageUrl, batch: {entries}, evidencePath?, chunk?, repair?, deadlineMs}`。

用户已单击“应用”。不要询问要做什么、丢弃或重定向到 Go。父活动线程保持前台轮询循环并发送最终的 `/poll --reply --data`。

当本机子代理可用时，将源编辑委托给 `impeccable_manual_edit_applier` / `impeccable-manual-edit-applier`。传递 cwd、脚本路径、事件 id、页面 URL、块/截止日期、`batch`、`evidencePath` 和规范的 JSON 结果架构。子代理不得轮询或回复。如果不可用，请与同一合同一起申请。

如果存在`repair`，则之前的Apply更改了源但最终验证失败。修复当前源并返回相同的规范 JSON 结果；不要自己回滚文件。浏览器将在任何回滚之前询问用户。

源代码编辑完成后，用 `node .agents/skills/impeccable/scripts/live-poll.mjs --reply EVENT_ID done --data '{"status":"done","appliedEntryIds":["8hexid"],"failed":[],"files":["src/page.html"],"notes":[]}'` 回复一次。当并非每个条目都适用时，请使用 `status:"partial"` 或 `status:"error"` 与 `failed[]`。然后再次投票。没有事件 ID 切勿回复； `--reply done --file ...` 手动申请无效。

## 退出

用户可以通过以下方式停止实时模式：
- 在聊天中说“停止直播模式”/“退出直播”
- 关闭浏览器选项卡（SSE 下降，民意调查在 8 秒后返回 `exit`）
- 浏览器的退出按钮

当轮询返回 `exit` 时，继续进行清理。如果轮询仍在作为后台任务运行，请先终止它。

## 清理

```bash
node .agents/skills/impeccable/scripts/live-server.mjs stop
```

停止 HTTP 服务器并运行 `live-inject.mjs --remove` 以从 HTML 条目中剥离 `localhost:…/live.js`。要停止服务器但保留注入标记（以便快速重新启动），请使用 `stop --keep-inject`。 `.impeccable/live/config.json` 保留为未来会话的项目配置。

然后：
- 删除任何剩余的变体包装（搜索 `impeccable-variants-start` 标记）。
- 去除所有剩余的碳化块（搜索 `impeccable-carbonize-start` 标记）。

## 首次设置（配置丢失或无效）

如果 `live.mjs` 输出 `{ ok: false, error: "config_missing" | "config_invalid", path }`，则在报告的路径中写入实时配置。默认情况下，这是 `.impeccable/live/config.json`。

架构：

```json
{
  "files": ["<path-or-glob>", "<path-or-glob>", ...],
  "exclude": ["<optional-glob>", ...],
  "insertBefore": "</body>",
  "commentSyntax": "html",
  "cspChecked": true
}
```

`files` 为注入目标； **浏览器实际加载的 HTML 文件**，不一定是源文件。每个条目都是文字路径 (`"public/index.html"`) 或全局模式 (`"public/**/*.html"`)。跟踪或生成在这里并不重要；包装有自己的生成文件保护，并通过回退流路由接受。

`exclude`（可选）是要跳过的匹配文件的 glob 模式列表，即使 `files` glob 会包含它们。用于电子邮件模板、演示装置或任何非实时页面的 HTML。

`cspChecked` 跟踪下面的 CSP 检测步骤是否已经运行。首次设置时缺席；检查 CSP 后（无论是修补、拒绝还是不需要），设置为 `true`。

**硬排除路径（无法覆盖）。** 无论用户写入什么，`**/node_modules/**` 和 `**/.git/**` 都不会匹配。这些是供应商/元数据目录，注入它们会默默地检测第三方代码。

**Glob 语法。** `**` 匹配任意数量的路径段（包括零），`*` 匹配除 `/` 之外的任何字符，`?` 匹配除 `/` 之外的单个字符。路径始终相对于带有正斜杠的项目根目录。

|框架| `files` | `insertBefore` | `commentSyntax` |
|-----------|---------|----------------|-----------------|
|单壳 SPA (Vite / React / Plain HTML) | `["index.html"]` | `</body>` | `html` |
| Next.js（应用程序路由器）| `["app/layout.tsx"]` | `</body>` | `jsx` |
| Next.js（页）| `["pages/_document.tsx"]` | `</body>` | `jsx` |
|努克斯特 | `["app.vue"]` | `</body>` | `html` |
| Svelte / SvelteKit | `["src/app.html"]` | `</body>` | `html` |
|天文 | `[" <root layout .astro>"]` | `</body>` | `html` |
|多页面（每个路由单独的 HTML）| `["public/**/*.html"]`：覆盖服务目录的 glob | `</body>` | `html` |

选择每个文件中存在的锚点（`</body>` 几乎总是有效）。如果锚点应匹配特定行的**之后**，请使用 `insertAfter`。

对于多页网站，**首选 glob 而不是文字文件列表**。稍后添加的新页面将在下一次 `live-inject.mjs` 运行时自动选取；无需维护配置。

对于其页面由生成器（Astro、静态站点生成器、`build-sub-pages.js` 等自定义脚本）“重建”的多页面站点，注入仅持续到下一次重新生成为止。每次构建后重新运行 `live.mjs`。接受不受影响；它通过回退流写入真实源。

### 漂移治愈警告

每次 `live.mjs` 启动时，注入后，都会扫描项目以查找常见页面源根目录下的 HTML 文件（`public/`、`src/`、`app/`、`pages/`）。如果存在任何未包含在已解析的 `files` 列表中的内容，则输出将包含 `configDrift` 字段：

```json
{
  "ok": true,
  "serverPort": 8400,
  "pageFiles": [ "..." ],
  "configDrift": {
    "orphans": ["public/new-section/index.html", "public/docs/new-command.html"],
    "orphanCount": 2,
    "hint": "2 HTML file(s) exist but aren't in config.files. Consider adding them, or use a glob pattern like \"public/**/*.html\"."
  }
}
```

当 `configDrift` 存在时，在进入轮询循环之前，每个会话向用户显示一次：

> 注意到项目中的 N 个 HTML 文件不在 `config.files` 中：
>
> - `public/new-section/index.html`
> - `public/docs/new-command.html`
>
> 添加它们，或者将 `files` 切换到像 `["public/**/*.html"]` 这样的 glob 并让它自动跟踪新页面？

不要自动更新配置；让用户决定。当没有漂移时，`configDrift` 是 `null`。

### CSP 检测（仅限首次）

如果是 `config.cspChecked === true`，则跳过这整个部分。您已经询问过该用户一次；答案依然存在。

否则，运行检测助手：

```bash
node .agents/skills/impeccable/scripts/detect-csp.mjs
```

输出：`{ shape, signals }`，其中 `shape` 是 `append-arrays`、`append-string`、`middleware`、`meta-tag` 或 `null` 之一。该形状以*补丁机制*命名，因此一个模板可以覆盖多个框架。

- **`null`**：无 CSP；跳到用 `cspChecked: true` 编写 `.impeccable/live/config.json`。
- **`append-arrays`**：CSP 定义为结构化指令数组。可自动修补。请参阅下面的*附加数组*。涵盖：
  - Monorepo 助手，带有 `additionalScriptSrc` / `additionalConnectSrc` 选项（Next.js + 共享配置包）
  - SvelteKit `kit.csp.directives`
  - Nuxt `nuxt-security` 模块的 `contentSecurityPolicy`
- **`append-string`**：写为文字值字符串的 CSP。可自动修补。请参阅下面的*附加字符串*。涵盖：
  - 带有 CSP 文字的内联 `next.config.*` `headers()`
  - Nuxt `routeRules` / `nitro.routeRules` 标头
- **`middleware`** 或 **`meta-tag`**：较罕见。在 v1 中已检测到但未自动修补。向用户显示检测到的文件，并要求他们添加 `http://localhost:8400` to `script-src` and `connect-src` manually, then mark `cspChecked: true` 并继续。

#### 同意提示模板

使用以下措辞，使代理之间的体验保持一致：

> **需要 CSP 补丁。** 我在您的项目中检测到一个内容安全策略，该策略会阻止“http://localhost:8400`:”，实时选择器在没有津贴的情况下不会加载。这是我要做的改变：
>
> ```差异
> [文件：<patchTarget>]
> [精确差异，2–5 行]
> ```
>
> 它由 `NODE_ENV === "development"` 保护，因此额外的条目仅出现在开发中，而永远不会到达生产环境。您可以随时通过恢复此文件来删除它。申请？ [是/否]

关于“否”：跳过补丁，在用户手动添加津贴之前，提及实时将无法工作，仍然写 `cspChecked: true` （已提出问题）。

如果选择“是”：应用下面的形状特定补丁，然后写入 `cspChecked: true`。

#### 附加数组

CSP 表示为结构化指令数组。补丁机制：声明一个仅用于开发的数组，将其分散到 script-src 和 connect-src 数组中。

**在保存 CSP 数组的文件顶部附近声明：**

```ts
// Dev-only allowance so impeccable live mode can load. Guarded by NODE_ENV.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? ["http://localhost:8400"] : [];
```

**将 `...__impeccableLiveDev` 附加到 script-src 和 connect-src 指令数组。** 每个框架的具体信息：

- **Next.js + monorepo helper**：编辑*应用程序的* `next.config.*`（不是共享助手），附加到传递到 `createBaseNextConfig` （或等效项）的 `additionalScriptSrc` 和 `additionalConnectSrc`。保持共享包干净。
- **SvelteKit**：编辑 `svelte.config.js`，附加到 `kit.csp.directives['script-src']` 和 `kit.csp.directives['connect-src']`。
- **Nuxt + nuxt-security**：编辑 `nuxt.config.*`，附加到 `security.headers.contentSecurityPolicy['script-src']` 和 `['connect-src']`。

参考输出：
- `tests/framework-fixtures/nextjs-turborepo/expected-after-patch.ts` (Next.js)
- `tests/framework-fixtures/sveltekit-csp/expected-after-patch.js`（SvelteKit）

幂等性：如果文件中已经存在`__impeccableLiveDev`，则补丁已经应用；跳过询问，只需标记 `cspChecked: true`。

#### 附加字符串

CSP 构建为文字值字符串。两点补丁：在顶部附近声明一个仅用于开发的字符串，将其插入到 CSP 的 `script-src` 和 `connect-src` 指令中。

```ts
// Dev-only allowance so impeccable live mode can load.
const __impeccableLiveDev =
  process.env.NODE_ENV === "development" ? " http://localhost:8400" : "";
```

然后在 CSP 值字符串中：
- `script-src 'self' 'unsafe-inline'` → `` `script-src 'self' 'unsafe-inline'${__impeccableLiveDev}` ``
- `connect-src 'self'` → `` `connect-src 'self'${__impeccableLiveDev}` ``

（开发字符串上的前导空格，以便它干净地连接到现有值中。如果还没有将文本 CSP 指令转换为模板字符串，作为编辑的一部分。）

每个框架的细节：
- **Next.js 内联 `headers()`**：编辑 `next.config.*`，将变量拼接到 CSP 值中。
- **Nuxt `routeRules`**：编辑`nuxt.config.*`，拼接到`routeRules['/**'].headers['Content-Security-Policy']`中的CSP中。

参考输出：
- `tests/framework-fixtures/nextjs-inline-csp/expected-after-patch.js` (Next.js)
- `tests/framework-fixtures/nuxt-csp/expected-after-patch.ts` (Nuxt)

### 故障排除

如果用户在安装时对 CSP 补丁说“不”，然后抱怨 live 不起作用：他们的开发 CSP 阻止了 `http://localhost:8400`. Fix: delete `cspChecked` from `.impeccable/live/config.json` and re-run `live.mjs`：安装程序将再次询问。

然后重新运行`live.mjs`。
