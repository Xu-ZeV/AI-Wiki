# 初始化流程

项目的设置命令。一次代码库爬行可提供其编写的所有内容：

- **PRODUCT.md**（战略）：用于注册、目标用户、产品用途、品牌个性、反引用、战略设计原则的根项目文件。回答“谁/什么/为什么”。
- **DESIGN.md**（视觉）：视觉主题、调色板、排版、组件、布局的根项目文件。遵循 [Google Stitch DESIGN.md 格式](https://stitch.withgoogle.com/docs/design-md/format/)。回答“看起来怎么样”。
- **`.impeccable/live/config.json`**（实时模式）：预先配置，以便 `$impeccable live` 直接启动进入变体模式，无需首次绕道。

它通过向用户指出下一步要运行的最佳命令来关闭。所有其他无可挑剔的命令在执行任何工作之前都会读取 PRODUCT.md 和 DESIGN.md。

## 步骤1：加载当前状态

检查已经存在的内容。 PRODUCT.md 和 DESIGN.md 位于项目根目录下，或位于 `.agents/context/` 或 `docs/` 下（不区分大小写）。读取您的本机文件工具中存在的任何内容。另请注意 `.impeccable/live/config.json` 是否已存在（如果存在，则步骤 6 保持不变）。

决策树：
- **两个文件都不存在（空项目或还没有上下文）**：执行步骤 2-4（编写 PRODUCT.md），然后根据是否有要分析的代码来决定 DESIGN.md。
- **PRODUCT.md 存在，DESIGN.md 缺失**：跳到步骤 5 并提议为 DESIGN.md 运行 `$impeccable document`。
- **PRODUCT.md 存在，但没有 `## Register` 部分（旧版）**：添加它。从代码库推断假设（参见步骤 2），与用户确认，写入字段。
- **两者都存在**：停止并使用 Codex 的结构化用户输入/问题工具（如果可用）；如果无法推断，请直接在聊天中询问以澄清您无法推断的内容。询问要刷新哪个文件。跳过用户不想更改的一项。
- **仅 DESIGN.md 存在（不寻常）**：执行步骤 2-4 生成 PRODUCT.md。

切勿默默地覆盖现有文件。始终先确认。

如果 init 被另一个命令（例如 `$impeccable craft landing page`）作为设置阻止程序调用，请在此处暂停该命令。完成 init，然后恢复原来的命令。你自己的写作是最新鲜的来源；无需重新加载。对于工艺来说，接下来恢复形状； init 创建项目上下文，但它不能替代特定任务的形状访谈和确认的设计概要。

## 第 2 步：探索代码库

在提出问题之前，请彻底扫描该项目以发现您可以做的事情。此单一爬网提供了 PRODUCT.md、DESIGN.md、**和**步骤 6 中的实时模式框架检测，因此一次要彻底，而不是稍后重新扫描：

- **自述文件和文档**：项目目的、目标受众、任何既定目标
- **Package.json / 配置文件**：技术堆栈、依赖项、现有设计库、**和框架**（Vite/SPA、Next.js、Nuxt、SvelteKit、Astro、多页面静态）以及浏览器实际加载的 HTML 条目
- **现有组件**：当前使用的设计模式、间距、版式
- **品牌资产**：已定义的徽标、图标、颜色值
- **设计标记/CSS变量**：现有调色板、字体堆栈、间距比例
- **任何风格指南或品牌文档**

还根据您的发现形成**注册假设**：

- 品牌信号：`/`、`/about`、`/pricing`、`/blog/*`、`/docs/*`、英雄部分、大版式、滚动驱动部分、登陆页面形状的内容。
- 产品信号：`/app/*`、`/dashboard`、`/settings`、`/(auth)`、表单、数据表、侧面/顶部导航、应用程序外壳组件。

此时注册只是一个假设，而不是一个决定；第 3 步确认了这一点。

记下您已经学到的内容以及尚不清楚的内容。还要注意任何值得后续命令的粗糙边缘（薄层次结构、平坦或灰色调色板、丢失错误/空状态、枯燥的副本）；第 7 步将这些转化为具体建议，无需重新分析。

## 第 3 步：提出策略性问题（针对 PRODUCT.md）

停止并使用 Codex 的结构化用户输入/问题工具（如果可用）；如果无法推断，请直接在聊天中询问以澄清您无法推断的内容。仅询问您无法从代码库中推断出的内容。

### 面试模式，不是确认模式

如果存储库为空或用户简介稀疏，请在提出 PRODUCT.md 之前进行简短的采访。 **不要**将一句话请求转变为完整的推断产品.md 并要求一揽子确认。

- 使用安全带的结构化问题工具（如果存在）。否则，直接在聊天中询问并停止。
- 每轮提出 **2-3 个问题**，然后等待答案。
- 使用推断的答案作为假设或选项，而不是作为最终的事实。
- 在起草 PRODUCT.md 之前至少完成一轮真实的用户答案，除非每个所需的答案都可以直接从存储库文档中找到。
- 第一轮应确定注册、用户/目的和期望的结果。
- 第二轮应建立品牌个性或参考、反参考和可访问性需求。

### 最低可行面试

要求足够多才能完成 PRODUCT.md。至少，涵盖注册确认、用户和目的、品牌个性、反引用和可访问性需求，除非每个答案都可以从存储库上下文中直接发现。经过至少一轮面试后，您可以提出推断答案，但用户必须在您编写 PRODUCT.md 之前确认它们。切勿仅根据原始任务提示来合成 PRODUCT.md。

### 注册（先询问；它决定了下面的一切）

每个设计任务要么是**品牌**（营销、登陆、活动、长篇内容、作品集：设计就是产品），要么是**产品**（应用程序UI、管理、仪表板、工具：设计服务于产品）。

如果第 2 步产生了明确的假设，则以它为主导：*“从代码库来看，这看起来像[品牌/产品]表面。这符合您的意图吗？还是我们应该以不同的方式对待它？”*

如果信号确实分裂（例如，具有大营销登陆的产品），请停止并使用 Codex 的结构化用户输入/问题工具（如果可用）；如果无法推断，请直接在聊天中询问以澄清您无法推断的内容。询问哪个寄存器描述了**主**表面。稍后可以为每个任务覆盖该寄存器，但 PRODUCT.md 带有一个默认值。

### 用户和目的
- 谁用这个？他们使用它时的背景是什么？
- 他们想要完成什么工作？
- 对于品牌：界面应该唤起什么样的情感？ （自信、喜悦、平静、紧迫）
- 对于产品：它们处于什么工作流程中？任何给定屏幕上的主要任务是什么？

### 品牌与个性
- 您如何用三个词形容品牌个性？
- 能够捕捉正确感觉的参考网站或应用程序？他们具体是什么？
  - 推动特定的命名参考，其中包含适合该品牌的“特定”事物，而不是通用的“现代”形容词或类别桶巷。
- 这不应该是什么样子？有反引用吗？

### 无障碍和包容性
- 具体的无障碍要求？ （WCAG级别，已知用户需求）
- 考虑减少运动、色盲或其他适应措施？

跳过答案已经明确的问题。 **不要在这里询问颜色、字体、半径或视觉样式。**这些属于 DESIGN.md，而不是 PRODUCT.md。

## 第四步：编写 PRODUCT.md

仅在用户确认步骤 3 中的策略答案后才编写 PRODUCT.md。如果推断的答案不确定或未经确认，请在编写前询问。

综合为战略文件：

```markdown
# Product

## Register

product

## Users
[Who they are, their context, the job to be done]

## Product Purpose
[What this product does, why it exists, what success looks like]

## Brand Personality
[Voice, tone, 3-word personality, emotional goals]

## Anti-references
[What this should NOT look like. Specific bad-example sites or patterns to avoid.]

## Design Principles
[3-5 strategic principles derived from the conversation. Principles like "practice what you preach", "show, don't tell", "expert confidence". NOT visual rules like "use OKLCH" or "magenta accent".]

## Accessibility & Inclusion
[WCAG level, known user needs, considerations]
```

寄存器为 `brand` 或 `product` 作为裸值。没有散​​文，没有评论。

写入 `PROJECT_ROOT/PRODUCT.md`。如果 `.impeccable.md` 存在，则加载程序已经对其进行了重命名；合并到该内容中而不是从头开始。

## 步骤 5：决定 DESIGN.md

无论哪种方式都提供 `$impeccable document`。两条路：

- **代码存在**（CSS token、组件、正在运行的站点）：“我可以生成一个 DESIGN.md 来捕获您的视觉系统（颜色、排版、组件），以便变体保持品牌不变。现在想这样做吗？”
- **预实现**（空项目）：“我可以从有关颜色策略、类型方向、运动能量和参考的五个快速问题中生成一个入门 DESIGN.md。一旦有了代码，您就可以重新运行，以捕获真正的标记。现在想这样做吗？”

如果用户同意，请委托给 `$impeccable document`（它会自动检测扫描与种子）。加载其参考并遵循该流程。

如果用户愿意跳过，请提及他们可以稍后运行 `$impeccable document`。

## 步骤 6：配置实时模式（当代码存在时）

如果项目具有包含 HTML 条目的代码和开发服务器（将 `$impeccable document` 置于扫描模式的相同“代码存在”条件），请立即预配置实时模式。您已经在步骤 2 中识别了框架和所提供的 HTML 条目，因此这几乎是免费的，并且当用户稍后运行 `$impeccable live` 时，它可以让用户避免首次设置绕道。

**对于空/预实施项目请跳过此步骤**（尚未注入任何内容）。告诉用户一旦有代码，实时模式将在第一次运行时自行配置。

**如果 `.impeccable/live/config.json` 已存在，请保持不变**并注意实时模式已配置。

否则：

1.写入`.impeccable/live/config.json`。使用您在步骤 2 中找到的框架，从 [live.md](live.md) 的 **首次设置** 部分的框架表中选择 `files`（浏览器实际加载的 HTML 条目）、`insertBefore` 和 `commentSyntax`。此处不再重述。对于多页面静态站点，更喜欢使用 glob (`["public/**/*.html"]`) 而不是文字列表。
2.运行`node .agents/skills/impeccable/scripts/detect-csp.mjs`。如果它报告可修补形状 (`append-arrays` / `append-string`)，请在编辑任何源文件之前使用 live.md 中的**同意提示模板**。在下降时，跳过补丁。对于 `middleware` / `meta-tag` 形状，显示检测到的文件并要求用户添加 `http://localhost:8400` to `script-src` and `connect-src` manually. For `null`，无需执行任何操作。
3. 一旦处理了 CSP（修补、拒绝、手动或不需要），请在配置中设置 `cspChecked: true`。架构和每个形状的补丁详细信息位于 live.md 的首次设置中；遵循它而不是重复。

编写配置文件是无害的，不需要同意；只有 CSP **源文件补丁** 需要“是”。

## 步骤 7：推荐起点，然后总结

简单总结一下：
- 注册捕获（品牌/产品）
- 编写的内容（PRODUCT.md、DESIGN.md、实时配置或子集）
- PRODUCT.md 中指导未来工作的 3-5 条战略原则
- 如果 DESIGN.md 或实时配置待决，一行将说明稍后如何设置它

然后推荐**下一步运行的最佳命令**，这些命令取自第 2 步中已出现的爬网内容。不要在这里进行新的分析；您已有的表面观察。根据注册和您所看到的内容进行定制，提供 2-4 个最相关的内容（不是菜单转储），并给出要键入的确切命令。按意图分组：

- **构建新的东西**：`$impeccable craft <feature>`（形状，然后构建端到端）或`$impeccable shape <feature>`（首先计划）。以此来引导空项目或早期项目。
- **改进那里的东西**：命名特定的表面。 `$impeccable critique <page>` 用于评分 UX 审核； `$impeccable audit <area>` 用于 a11y/性能/响应检查； `$impeccable polish <component>` 用于发货前通行证。当爬行标记出特定弱点时，将匹配命令指向它：薄层次结构或间距 → `layout`，平坦或灰色调色板 → `colorize`，丢失错误/空状态 → `harden` 或 `onboard`，暗淡或不清晰的副本 → `clarify`。
- **直观迭代**：`$impeccable live`（在步骤 6 中配置）在浏览器中选取元素并就地生成变体。

完整的命令菜单仅在 `$impeccable` 之外；保持这个列表简短而明确。

如果 init 被另一个无可挑剔的命令作为阻止程序调用（例如，用户在没有 PRODUCT.md 的情况下运行 `$impeccable polish`），请立即恢复原始任务。你自己的写作是最新鲜的来源；无需重新加载。

（可选）停止并使用 Codex 的结构化用户输入/问题工具（如果可用）；如果无法推断，请直接在聊天中询问以澄清您无法推断的内容。询问他们是否希望将 PRODUCT.md 的简短摘要附加到 AGENTS.md 中，以便于代理参考。如果是，请在此处附加一个简短的**设计上下文**指针部分。
