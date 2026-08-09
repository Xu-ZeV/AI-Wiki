在项目根目录生成一个 `DESIGN.md` 文件，该文件捕获当前的视觉设计系统，以便生成新屏幕的 AI 代理保持品牌不变。

DESIGN.md 遵循 [官方 Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/format/)：携带机器可读设计标记的 YAML frontmatter，后面是一个按固定顺序包含六个部分的 Markdown 正文。 **token是规范的；散文提供了如何应用它们的上下文。**不相关的部分可以省略，但**不要对它们重新排序，也不要重命名它们**。节标题必须与规范字符逐个匹配，以便文件能够被其他 DESIGN.md 感知工具（Stitch 本身、awesome-design-md、skill-rest 等）解析。

## 前面的内容：token schema

YAML frontmatter 是机器可读层。这是 Stitch 的 linter 验证的内容，也是实时面板渲染图块的内容。保持紧；每个条目都应该对应于项目实际使用的token。

```yaml
---
name: <project title>
description: <one-line tagline>
colors:
  primary: "#b8422e"
  neutral-bg: "#faf7f2"
  # ...one entry per extracted color; key = descriptive slug
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.5rem, 7vw, 4.5rem)"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "normal"
  body:
    # ...
rounded:
  sm: "4px"
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "16px 48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
---
```

重要规则：

- **token参考** 使用 `{path.to.token}`（例如 `{colors.primary}`、`{rounded.md}`）。组件可以引用原语；原语不能互相引用。
- **Stitch 仅将颜色验证为十六进制 sRGB** (`#RGB` / `#RGBA` / `#RRGGBB` / `#RRGGBBAA`)； OKLCH/HSL/P3 触发 linter 警告，而不是硬错误。 YAML 接受任意一种字符串，并且我们自己的解析器与格式无关。根据项目状况进行选择：(a) 如果项目具有“仅限 OKLCH”原则或使用不通过 sRGB 往返的 Display-P3 值，请将 OKLCH 直接放在 frontmatter 中并接受 Stitch linter 警告； (b) 如果项目想要严格遵守 Stitch 规定或计划使用其 Tailwind/DTCG 导出管道，请将十六进制放在 frontmatter 中，并在散文中保留 OKLCH 作为规范参考。没有明确的理由，切勿分裂真理的来源。
- **组件子token**仅限于 8 个props：`backgroundColor`、`textColor`、`typography`、`rounded`、`padding`、`size`、`height`、 `width`。阴影、运动、对焦环、背景滤镜：这些都不适合。将它们放在边车中（步骤 4b）。
- **音阶键是开放式的。** 使用项目已使用的任何名称（`oxblood-deep`、`surface-container-low`）。不要重命名为材质默认值。
- **变体是命名约定，而不是模式。** `button-primary` / `button-primary-hover` / `button-primary-active` 作为同级键。

## Markdown 正文：六个部分（严格顺序）

1. `## Overview`
2. `## Colors`
3. `## Typography`
4. `## Elevation`
5. `## Components`
6. `## Do's and Don'ts`

可选的令人回味的字幕可以采用 `## 2. Colors: The [Name] Palette` 的形式（Stitch 自己的输出可以做到这一点），但每个标题中的文字（概述、颜色、版式、海拔、组件、注意事项）必须存在。不要添加额外的顶级部分（布局原则、响应行为、动作、代理提示指南）。将该内容折叠到它自然所属的六个规范部分中。

## 何时运行

- 用户刚刚运行 `$impeccable init` 并需要记录视觉方面。
- 该技能注意到不存在 `DESIGN.md` 并促使用户创建一个。
- 现有的 `DESIGN.md` 已过时（设计已漂移）。
- 在进行大规模重新设计之前，捕获当前状态作为参考。

如果 `DESIGN.md` 已存在，**不要默默地覆盖它**。向用户显示现有文件并停止并使用 Codex 的结构化用户输入/问题工具（如果可用）；如果无法推断，请直接在聊天中询问以澄清您无法推断的内容。是否刷新、覆盖或合并。

## 两条路径

- **扫描模式**（默认）：项目具有设计 token、组件或渲染输出。提取，然后确认描述性语言。当有代码需要分析时使用。
- **种子模式**：该项目正在预实施（全新初始化，尚未构建任何内容）。面试五个高级答案，写一个最小的DESIGN.md，标记为`<!-- SEED -->`。一旦有代码，就以扫描模式重新运行。

首先通过扫描来决定（扫描模式步骤 1）。如果扫描未发现token、组件文件和渲染站点，则提供种子模式；不要默默地切换。 `$impeccable document --seed` 强制种子模式，无论代码是否存在。

## 扫描模式（方法C：自动提取，然后确认描述语言）

### 第 1 步：找到设计资产

按优先顺序搜索代码库：

1. **CSS自定义属性**：grep用于CSS文件中的`--color-`、`--font-`、`--spacing-`、`--radius-`、`--shadow-`、`--ease-`、`--duration-`声明（通常为`src/styles/`、`public/css/`、`app/globals.css`等）。记录名称、值及其定义的文件。
2. **Tailwind 配置**：如果 `tailwind.config.{js,ts,mjs}` 存在，则读取 `theme.extend` 块的颜色、fontFamily、间距、borderRadius、boxShadow。
3. **CSS-in-JS 主题文件**：styled-components、emotion、vanilla-extract、stitches；查找 `theme.ts`、`tokens.ts` 或同等内容。
4. **设计 token文件**：`tokens.json`、`design-tokens.json`、样式词典输出、W3C token社区组格式。
5. **组件库**：扫描主要按钮、卡片、输入法、导航、对话框组件。请注意它们的变体 API 和默认样式。
6. **全局样式表**：根 CSS 文件通常具有基本版式和颜色分配。
7. **可见渲染输出**：如果浏览器自动化工具可用，则加载实时站点并从关键元素（body、h1、a、button、.card）计算样式示例。这捕获了token遗漏的值。

### 步骤 2：自动提取可自动提取的内容

根据发现的token构建结构化草案。对于每个token类别：

- **颜色**：分为主要/次要/第三/中性（Stitch 使用的材质衍生角色）。如果项目只有一种口音，则表示为Primary + Neutral；省略二级和三级而不是发明它们。
- **版式**：将观察到的尺寸和重量映射到材质层次结构（显示/标题/标题/正文/标签）。注意字体系列堆栈和比例。
- **海拔**：对影子词汇进行编目。如果项目是平坦的并且使用色调分层，那么这是一个有效的答案；明确说明。
- **组件**：对于每个常见组件（按钮、卡片、输入、芯片、列表项、工具提示、导航）、提取形状（半径）、颜色分配、悬停/焦点处理、内部填充。
- **间距+布局**：折叠到概述或相关组件中。该规范没有布局部分。

### 步骤 2b：展示前台内容

现在，从自动提取的标记中起草 YAML frontmatter（您将在步骤 4 中将其写入 DESIGN.md 的顶部）。这是机器可读层：实时面板和 Stitch 的 linter 消耗的内容。

- **颜色**：每个提取的颜色一个条目。键 = 描述性段（`oxblood-deep`、`editorial-magenta`，而不是 `blue-800`）。值 = 项目视为规范的格式（OKLCH 或十六进制；请参阅上面的 frontmatter 规则）。不要分裂事实来源：前文中的一种格式，不要在散文中用不同的值重新定义相同的标记。
- **排版**：每个角色一个条目（`display`、`headline`、`title`、`body`、`label`）。版式是一个对象；仅包含项目中真实的props（`fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`letterSpacing`、`fontFeature`、`fontVariation`）。
- **舍入/间距**：项目实际使用的任何比例步长，由项目使用的任何比例名称键入（`sm` / `md` / `lg` 或 `surface-sm` 或数字步长）。
- **组件**：每个变体一个条目（`button-primary`、`button-primary-hover`、`button-ghost`）。通过 `{colors.X}`、`{rounded.Y}` 参考原语。如果某个变体需要 Stitch 的 8 个props集无法涵盖的属性（阴影、聚焦环、背景滤镜），请在 sidecar 中携带完整的片段。

跳过项目没有的任何内容。空的比例键或伪造的token会污染规范。

### 步骤 3：询问用户定性语言

以下内容需要无法自动提取的创意输入。将它们分组为一个 `AskUserQuestion` 交互：

- **创意北极星**：整个系统的单一命名隐喻（“编辑庇护所”、“金州策展人”、“实验室笔记本”）。提供 2-3 个尊重 PRODUCT.md 品牌个性的选项。
- **概述语音**：心情形容词、2-3句话的美学哲学、反引用（系统不应该有什么感觉）。
- **颜色字符**（对于自动提取的颜色）：描述性名称（“Deep Muted Teal-Navy”，而不是“blue-800”）。根据色调/饱和度为每个关键颜色建议 2-3 个选项。
- **海拔哲学**：平坦/分层/提升。如果存在阴影，它们的作用是环境还是结构？
- **组件理念**：按钮、卡片、输入的感觉在一个短语中（“触觉和自信”与“精致和克制”）。

尽可能引用 PRODUCT.md 中的一行，以便用户看到他们自己的战略语言的延续。

### 步骤 4：编写 DESIGN.md

该文件将打开，其中包含步骤 2b 中暂存的 YAML frontmatter（架构记录在本参考文献的顶部），然后是使用以下结构的 markdown 正文。标头必须逐个字符匹配。允许使用可选的令人回味的字幕（例如 `## 2. Colors: The Coastal Palette`）。

```markdown
---
name: [Project Title]
description: [one-line tagline]
colors:
  # ... staged frontmatter from Step 2b
---

# Design System: [Project Title]

## 1. Overview

**Creative North Star: "[Named metaphor in quotes]"**

[2-3 paragraph holistic description: personality, density, aesthetic philosophy. Start from the North Star and work outward. State what this system explicitly rejects (pulled from PRODUCT.md's anti-references). End with a short **Key Characteristics:** bullet list.]

## 2. Colors

[Describe the palette character in one sentence.]

### Primary
- **[Descriptive Name]** (#HEX / oklch(...)): [Where and why this color is used. Be specific about context, not just role.]

### Secondary (optional; omit if the project has only one accent)
- **[Descriptive Name]** (#HEX): [Role.]

### Tertiary (optional)
- **[Descriptive Name]** (#HEX): [Role.]

### Neutral
- **[Descriptive Name]** (#HEX): [Text / background / border / divider role.]
- [...]

### Named Rules (optional, powerful)
**The [Rule Name] Rule.** [Short, forceful prohibition or doctrine, e.g. "The One Voice Rule. The primary accent is used on ≤10% of any given screen. Its rarity is the point."]

## 3. Typography

**Display Font:** [Family] (with [fallback])
**Body Font:** [Family] (with [fallback])
**Label/Mono Font:** [Family, if distinct]

**Character:** [1-2 sentence personality description of the pairing.]

### Hierarchy
- **Display** ([weight], [size/clamp], [line-height]): [Purpose; where it appears.]
- **Headline** ([weight], [size], [line-height]): [Purpose.]
- **Title** ([weight], [size], [line-height]): [Purpose.]
- **Body** ([weight], [size], [line-height]): [Purpose. Include max line length like 65–75ch if relevant.]
- **Label** ([weight], [size], [letter-spacing], [case if uppercase]): [Purpose.]

### Named Rules (optional)
**The [Rule Name] Rule.** [Short doctrine about type use.]

## 4. Elevation

[One paragraph: does this system use shadows, tonal layering, or a hybrid? If "no shadows", say so explicitly and describe how depth is conveyed instead.]

### Shadow Vocabulary (if applicable)
- **[Role name]** (`box-shadow: [exact value]`): [When to use it.]
- [...]

### Named Rules (optional)
**The [Rule Name] Rule.** [e.g. "The Flat-By-Default Rule. Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus)."]

## 5. Components

For each component, lead with a short character line, then specify shape, color assignment, states, and any distinctive behavior.

### Buttons
- **Shape:** [radius described, exact value in parens]
- **Primary:** [color assignment + padding, in semantic + exact terms]
- **Hover / Focus:** [transitions, treatments]
- **Secondary / Ghost / Tertiary (if applicable):** [brief description]

### Chips (if used)
- **Style:** [background, text color, border treatment]
- **State:** [selected / unselected, filter / action variants]

### Cards / Containers
- **Corner Style:** [radius]
- **Background:** [colors used]
- **Shadow Strategy:** [reference Elevation section]
- **Border:** [if any]
- **Internal Padding:** [scale]

### Inputs / Fields
- **Style:** [stroke, background, radius]
- **Focus:** [treatment, e.g. glow, border shift, etc.]
- **Error / Disabled:** [if applicable]

### Navigation
- **Style, typography, default/hover/active states, mobile treatment.**

### [Signature Component] (optional; if the project has a distinctive custom component worth documenting)
[Description.]

## 6. Do's and Don'ts

Concrete, forceful guardrails. Lead each with "Do" or "Don't". Be specific: include exact colors, pixel values, and named anti-patterns the user mentioned in PRODUCT.md. **Every anti-reference in PRODUCT.md should show up here as a "Don't" with the same language**, so the visual spec carries the strategic line through. Quote PRODUCT.md directly where possible: if PRODUCT.md says *"avoid dark mode with purple gradients, neon accents, glassmorphism"*, the Don'ts here should repeat that by name.

### Do:
- **Do** [specific prescription with exact values / named rule].
- **Do** [...]

### Don't:
- **Don't** [specific prohibition, e.g. "use border-left greater than 1px as a colored stripe"].
- **Don't** [...]
- **Don't** [...]
```

### 步骤 4b：编写 .impeccable/design.json sidecar（仅限扩展）

frontmatter 拥有 token 基元（颜色、排版、圆角、间距、组件）。 `.impeccable/design.json` 的 sidecar 具有 **Stitch 模式无法容纳的内容**：每种颜色的色调渐变、阴影/高度标记、运动标记、断点、完整组件 HTML/CSS 片段（面板将这些片段呈现为阴影 DOM）以及叙述（北极星、规则、注意事项）。它扩展了前面的内容，而不是重复它。

每当您重新生成 root `DESIGN.md` 时，都会重新生成 sidecar。如果用户仅要求刷新 sidecar（例如，从实时面板的陈旧提示），请保留 `DESIGN.md` 并仅写入 `.impeccable/design.json`。

#### 架构

```json
{
  "schemaVersion": 2,
  "generatedAt": "ISO-8601 string",
  "title": "Design System: [Project Title]",
  "extensions": {
    "colorMeta": {
      "primary":        { "role": "primary",  "displayName": "Editorial Magenta", "canonical": "oklch(60% 0.25 350)", "tonalRamp": ["...", "...", "..."] },
      "cool-paper": { "role": "neutral",  "displayName": "Cool Paper",    "canonical": "oklch(96% 0.005 230)", "tonalRamp": ["...", "...", "..."] }
    },
    "typographyMeta": {
      "display": { "displayName": "Display", "purpose": "Hero headlines only." }
    },
    "shadows": [
      { "name": "ambient-low", "value": "0 4px 24px rgba(0,0,0,0.12)", "purpose": "Diffuse hover glow under accent elements." }
    ],
    "motion": [
      { "name": "ease-standard", "value": "cubic-bezier(0.4, 0, 0.2, 1)", "purpose": "Default easing for state transitions." }
    ],
    "breakpoints": [
      { "name": "sm", "value": "640px" }
    ]
  },
  "components": [
    {
      "name": "Primary Button",
      "kind": "button | input | nav | chip | card | custom",
      "refersTo": "button-primary",
      "description": "One-line what and when.",
      "html": "<button class=\"ds-btn-primary\">GET STARTED</button>",
      "css": ".ds-btn-primary { background: #191c1d; color: #fff; padding: 16px 48px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 500; border: none; border-radius: 0; transition: background 0.2s, transform 0.2s; } .ds-btn-primary:hover { background: oklch(60% 0.25 350); transform: translateY(-2px); }"
    }
  ],
  "narrative": {
    "northStar": "The Editorial Sanctuary",
    "overview": "2-3 paragraphs of the philosophy, pulled from DESIGN.md Overview section.",
    "keyCharacteristics": ["...", "..."],
    "rules": [{ "name": "The One Voice Rule", "body": "...", "section": "colors|typography|elevation" }],
    "dos":   ["Do use ..."],
    "donts": ["Don't use ..."]
  }
}
```

**与 schemaVersion 1 相比有何变化。** 旧的 sidecar 携带token原始数组（`tokens.colors[]`、`tokens.typography[]` 等）。这些价值观现在成为了头条新闻。 sidecar 仅携带不能存在于 frontmatter 中的元数据（音调斜坡、十六进制为近似值时的规范 OKLCH、显示名称、角色提示），由 frontmatter token名称（`colorMeta.<token-name>`、`typographyMeta.<token-name>`）键入。组件仍然带有完整的 HTML/CSS，因为 Stitch 的 8-prop 集无法容纳它们。

#### 组件翻译规则

`html` 和 `css` 字段必须是**独立的嵌入式片段**，在注入到影子 DOM 中时可以正确呈现。面板直接应用它们：没有后处理，没有框架运行时。

1. **Tailwind 扩展。** 如果源使用 Tailwind (className="bg-primary text-white rounded-lg px-6 py-3")，请将每个实用程序扩展为 `css` 字符串中的文字 CSS 属性。 **不要**引用 Tailwind 类； **不要**假设已加载 Tailwind CSS 包。每个组件都是独立的。
2. **token解析。** 如果项目将token公开为 `:root` 上的 CSS 自定义属性（例如 `--color-primary`、`--radius-md`），请通过 `var(--color-primary)` 引用它们；它们通过 Shadow DOM 继承并保持实时绑定。如果标记仅存在于 JS 主题对象（样式组件、CSS-in-JS）中，则在生成时解析为文字值。
3. **图标。** 作为 SVG 内联。不要引用 Lucide/Heroicons 包、图标字体或 `<img src="...">`。典型的图标是 16-24px；直接复制SVG路径数据。
4. **状态。** 包括 `:hover`、`:focus-visible` 和（如果有意义）`:active` 内联规则。仅静态的默认快照会让面板感觉死气沉沉。 CSS 中的悬停+焦点规则让人感觉充满活力。
5. **重置膨胀。** 仅提取组件的*独特* CSS（背景、颜色、填充、边框半径、版式、过渡）。跳过通用重置（`box-sizing: border-box`、`line-height: inherit`、`-webkit-font-smoothing`）。该面板已经有一个中性画布；不要重新发送重置。
6. **作用域类名。** 在每个类前面加上 `ds-`（例如 `ds-btn-primary`、`ds-input-search`），这样组件 CSS 就不会与同一影子 DOM 中其他组件的 CSS 发生冲突。

#### 包含哪些内容

目标是最能代表视觉系统的一组紧密的 **5-10 个组件**：

- **规范基元（如果项目有，则始终包含）：**按钮（每个变体作为单独的组件条目）、输入/文本字段、导航、芯片/标签、卡片。
- **签名组件（如果独特，则包括）：**英雄 CTA、特色卡、过滤丸、用户在 PRODUCT.md 中提到的重要的任何自定义图案。
- **跳过其余部分。** 实用程序组件、表单构建块、包装器布局：除非视觉上独特，否则不值得记录。

如果项目**还没有组件库**（裸着陆页、新项目），请使用与 DESIGN.md 规则一致的最佳实践默认值从token合成规范基元。每个 `.impeccable/design.json` 都有“一些东西”要渲染，即使是在零天。

#### 色调渐变

对于每个颜色标记，生成 8 步 `tonalRamp` 数组：从暗到亮，相同的色调和色度，从 ~15% 到 ~95% 的步进亮度。面板将其呈现为样本下方的条带。如果项目已定义色调比例（材质 `surface-container-low` 系列、Tailwind 样式 `blue-50..blue-900`），请使用这些值。否则在 OKLCH 中合成。

#### 叙事映射

直接从您刚刚编写的 DESIGN.md 中提取：

- `narrative.northStar` → 概述中的 `**Creative North Star: "..."**` 系列
- `narrative.overview` → 概述中的哲学段落
- `narrative.keyCharacteristics` → 带项目符号的 `**Key Characteristics:**` 列表
- `narrative.rules` → 所有部分的每个 `**The [Name] Rule.** [body]`，标记为 `section`
- `narrative.dos` / `narrative.donts` → 逐字做和不做的项目符号列表

不要改写。面板将这些显示为辅助可折叠上下文；与 Markdown 中的声音相同。

### 步骤 5：确认和完善

1. 向用户展示您编写的完整 DESIGN.md。简要强调非显而易见的创意选择（描述性颜色名称、氛围语言、命名规则）。
2. 提及 `.impeccable/design.json` 也写在旁边；实时面板现在将渲染该项目的实际按钮/输入/导航基元，而不是通用近似值。
3.提出改进任何部分：“想要我修改一个部分，添加我错过的组件模式，或者调整气氛语言吗？”

你自己写的就是最新鲜的来源；此会话中的后续命令不需要重新加载。

## 种子模式

对于还没有视觉系统可提取的项目。产生一个最小的脚手架，而不是完整的规格。

### 第 1 步：确认种子模式

采访之前：“没有现有的视觉系统可供扫描。我会问五个快速问题来种子启动 DESIGN.md。一旦有代码，您可以重新运行 `$impeccable document`，以捕获真正的token和组件。好吗？”

如果用户想跳过，请停止。没有文件。

### 第 2 步：五个问题

分组为一个 `AskUserQuestion` 交互。选项必须具体。

1. **颜色策略。** 选择一个：
   - 克制：中性色 + 一种口音 ≤10%
   - 承诺：一种饱和颜色占表面的 30-60%
   - 完整调色板：3-4 个指定的颜色角色，每个角色都是经过深思熟虑的
   - 湿透：表面就是颜色
   
   然后：一种色调系列或锚参考（“深青色”、“芥末色”、“Klim #ff4500 橙色”）。

2. **排版方向。** 选择一种（具体字体稍后提供）：
   - 衬线显示+无正文
- Single sans（温暖/技术/几何/人文主义；选择一种感觉）
   - 显示+单声道
   - 单向前
   - 编辑脚本 + sans

3. **运动能量。** 选择一项：
   - 受限：仅状态改变
   - 响应式：反馈+过渡，无编排
   - 精心设计：精心设计的入口、滚动驱动的序列

4. **三个命名参考。** 品牌、产品、印刷物品。不是形容词。

5. **一个反引用。** 它不应该是什么样的感觉。亦名。

### 步骤3：编写种子DESIGN.md

使用扫描模式中的六部分规格。填写面试的答案；将其余的保留为诚实的占位符。种子是一个脚手架，而不是一个捏造的规格。

引导文件：

```markdown
<!-- SEED: re-run $impeccable document once there's code to capture the actual tokens and components. -->
```

种子模式下的每节指导：

- **概述**：创意北极星和从答案中阐述的哲学（色彩策略+运动能量+参考）。直接引用用户的反引用。
- **颜色**：颜色策略作为命名规则（例如*“浸透的规则。表面就是颜色。”*）。色调系列或锚参考。无十六进制值；标记为`[to be resolved during implementation]`。
- **排版**：用户选择的方向（例如“衬线显示+无正文”）。还没有字体名称：`[font pairing to be chosen at implementation]`。
- **海拔**：从运动能量推断。克制/反应灵敏 → 默认平坦；精心设计→分层。一句话。
- **组件**：完全省略；尚不存在任何组件。
- **注意事项**：直接携带 PRODUCT.md 的反引用加上 Q5 中指定的反引用。

种子模式仅使用 `name` 和 `description` 写入最小的 frontmatter；还没有颜色、排版、圆角、间距或组件。真正的token会在下一次扫描模式运行时落地。出于同样的原因，在种子模式下跳过 `.impeccable/design.json` sidecar：无需渲染。

### 第 4 步：确认

1. 显示种子DESIGN.md。指出这是一颗种子（标记是字面上的承诺）。
2. 告诉用户：“一旦有了一些代码，请重新运行 `$impeccable document`。该过程将提取真实的token并生成 sidecar。”

你自己写的就是最新鲜的来源；无需重新加载。

## 风格指南

- **Frontmatter 第一，散文第二。** token位于 YAML frontmatter 中；散文将它们置于情境中。不要在两个地方重新定义token值；前面的内容是规范的。
- **在“注意事项”部分中按名称引用 PRODUCT.md 反引用**。如果 PRODUCT.md 将“SaaS 登陆页面陈词滥调”或“通用 AI 工具营销”列为反引用，则 DESIGN.md 的“禁忌”应逐字重复这些短语，以便视觉规范强制执行战略路线。
- **符合规范，不要发明新的部分。** 六个部分名称是固定的。如果您有布局/动作/响应式内容要记录，请将其折叠到概述（哲学级别的规则）或组件（每个组件的行为）中。
- **描述性>技术性**：“轻微弯曲的边缘（8px半径）”>“圆形lg”。在括号中包含技术价值，并以描述开头。
- **功能 > 装饰**：对于每个标记，解释其使用地点和原因，而不仅仅是解释它是什么。
- **括号中的精确值**：十六进制代码、px/rem 值、字体粗细；始终是说明旁边括号中的数字。
- **使用命名规则**：`**The [Name] Rule.** [short doctrine]`。对于人工智能消费者来说，这些内容比项目符号列表更容易记住、更容易被引用，而且更具有粘性。 Stitch 自己的输出大量使用了它们（“The No-Line Rule”、“The Ghost Border Fallback”）。目标是每部分 1-3 个。
- **要有力量**。设计总监的声音。 “禁止”、“禁止”、“从不”、“总是”，而不是“考虑”、“可能”、“更喜欢”。符合 PRODUCT.md 的语气。
- **具体的反模式测试**。 Stitch 写道：“如果它看起来像 2014 年的应用程序，则阴影太暗且模糊太小。”* 一句话审计测试胜过了一段原则。
- **参考 PRODUCT.md**。 PRODUCT.md 的反引用部分应直接告知此处的“注意事项”部分。引用或转述。
- **按角色对颜色进行分组**，而不是按十六进制顺序或色调顺序。主要/次要/第三/中性是规格排序。

## 陷阱

- 不要粘贴原始 CSS 类名称。翻译成描述性语言。
- 不要提取每个token。停止在实际重复使用的内容上；一次性污染系统。
- 不要发明不存在的组件。如果项目只有按钮和卡片，则仅记录它们。
- 不要在没有询问的情况下覆盖现有的 DESIGN.md。
- 不要复制 PRODUCT.md 中的内容。 DESIGN.md 是严格视觉化的。
- 不要添加“布局原则”或“动作”或“响应行为”顶级部分。该规范有六个，而不是九个。将内容折叠到它所属的位置。
- 不要稍微重命名部分。 “颜色”而不是“调色板和角色”。 “版式”而不是“版式规则”。工具解析取决于确切的标头。
- 不要在 frontmatter 和散文之间重复 token 值。如果颜色在 `colors.primary` 中为十六进制，则散文可以命名它并描述其作用，但不应重新声明不同的十六进制。前面的内容是规范的。
- 不要在 Stitch 架构之外发明 frontmatter 标记组（顶层没有 `motion:`、`breakpoints:`、`shadows:`）。 Stitch 的 Zod 架构仅接受 `colors`、`typography`、`rounded`、`spacing`、`components`。其他任何内容都属于 sidecar 的 `extensions` 中。
