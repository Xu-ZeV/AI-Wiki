---
name: obsidian-bases
description: 使用视图、过滤器、公式和摘要创建和编辑 Obsidian Bases（.base 文件）。在处理 .base 文件、创建类似数据库的笔记视图或用户在 Obsidian 中提及 Bases、表视图、卡片视图、过滤器或公式时使用。
---

# Obsidian基础技能

## 工作流程

1. **创建文件**：使用有效的 YAML 内容在 Vault 中创建 `.base` 文件
2. **定义范围**：添加 `filters` 以选择显示哪些注释（按标签、文件夹、属性或日期）
3. **添加公式**（可选）：在 `formulas` 部分定义计算属性
4. **配置视图**：添加一个或多个视图（`table`、`cards`、`list` 或 `map`），其中 `order` 指定要显示的属性
5. **验证**：验证文件是有效的 YAML，没有语法错误。检查所有引用的属性和公式是否存在。常见问题：包含特殊 YAML 字符的未加引号的字符串、公式表达式中的引号不匹配、引用 `formula.X` 而不在 `formulas` 中定义 `X`
6. **在 Obsidian 中测试**：在 Obsidian 中打开 `.base` 文件以确认视图正确渲染。如果显示 YAML 错误，请检查下面的引用规则

## 架构

基础文件使用 `.base` 扩展名并包含有效的 YAML。

```yaml
# Global filters apply to ALL views in the base
filters:
  # Can be a single filter string
  # OR a recursive filter object with and/or/not
  and: []
  or: []
  not: []

# Define formula properties that can be used across all views
formulas:
  formula_name: 'expression'

# Configure display names and settings for properties
properties:
  property_name:
    displayName: "Display Name"
  formula.formula_name:
    displayName: "Formula Display Name"
  file.ext:
    displayName: "Extension"

# Define custom summary formulas
summaries:
  custom_summary_name: 'values.mean().round(3)'

# Define one or more views
views:
  - type: table | cards | list | map
    name: "View Name"
    limit: 10                    # Optional: limit results
    groupBy:                     # Optional: group results
      property: property_name
      direction: ASC | DESC
    filters:                     # View-specific filters
      and: []
    order:                       # Properties to display in order
      - file.name
      - property_name
      - formula.formula_name
    summaries:                   # Map properties to summary formulas
      property_name: Average
```

## 过滤器语法

过滤器缩小结果范围。它们可以全局应用或按视图应用。

### 过滤器结构

```yaml
# Single filter
filters: 'status == "done"'

# AND - all conditions must be true
filters:
  and:
    - 'status == "done"'
    - 'priority > 3'

# OR - any condition can be true
filters:
  or:
    - 'file.hasTag("book")'
    - 'file.hasTag("article")'

# NOT - exclude matching items
filters:
  not:
    - 'file.hasTag("archived")'

# Nested filters
filters:
  or:
    - file.hasTag("tag")
    - and:
        - file.hasTag("book")
        - file.hasLink("Textbook")
    - not:
        - file.hasTag("book")
        - file.inFolder("Required Reading")
```

### 过滤运算符

|操作员|描述 |
|----------|-------------|
| `==` |等于 |
| `!=` |不等于|
| `>` |大于 |
| `<` |小于|
| `>=` |大于或等于|
| `<=` |小于或等于 |
| `&&` |逻辑和 |
| `\|\|` |逻辑或 |
| <代码>！</code> |逻辑非|

## 属性

### 三种类型的属性

1. **注意属性** - 来自 frontmatter：`note.author` 或只是 `author`
2. **文件属性** - 文件元数据：`file.name`、`file.mtime` 等。
3. **公式属性** - 计算值：`formula.my_formula`

### 文件属性参考

|物业 |类型 |描述 |
|----------|------|-------------|
| `file.name` |字符串|文件名 |
| `file.basename` |字符串|不带扩展名的文件名 |
| `file.path` |字符串|文件的完整路径 |
| `file.folder` |字符串|父文件夹路径|
| `file.ext` |字符串|文件扩展名 |
| `file.size` |数量 |文件大小（以字节为单位）|
| `file.ctime` |日期 |创建时间 |
| `file.mtime` |日期 |修改时间 |
| `file.tags` |列表 |文件中的所有标签 |
| `file.links` |列表 |文件中的内部链接 |
| `file.backlinks` |列表 |链接到此文件的文件 |
| `file.embeds` |列表 |嵌入注释 |
| `file.properties` |对象|所有 frontmatter 属性 |

### `this` 关键字

- 在主要内容区域：指基础文件本身
- 嵌入时：指嵌入文件
- 在侧边栏中：指主要内容中的活动文件

## 公式语法

公式根据属性计算值。在 `formulas` 部分中定义。

```yaml
formulas:
  # Simple arithmetic
  total: "price * quantity"

  # Conditional logic
  status_icon: 'if(done, "✅", "⏳")'

  # String formatting
  formatted_price: 'if(price, price.toFixed(2) + " dollars")'

  # Date formatting
  created: 'file.ctime.format("YYYY-MM-DD")'

  # Calculate days since created (use .days for Duration)
  days_old: '(now() - file.ctime).days'

  # Calculate days until due date
  days_until_due: 'if(due_date, (date(due_date) - today()).days, "")'
```

## 主要功能

最常用的功能。有关所有类型（日期、字符串、数字、列表、文件、链接、对象、正则表达式）的完整参考，请参阅 [FUNCTIONS_REFERENCE.md](references/FUNCTIONS_REFERENCE.md)。

|功能|签名|描述 |
|----------|-----------|-------------|
| `date()` | `date(string): date` |解析字符串到日期 (`YYYY-MM-DD HH:mm:ss`) |
| `now()` | `now(): date` |当前日期和时间 |
| `today()` | `today(): date` |当前日期（时间 = 00:00:00）|
| `if()` | `if(condition, trueResult, falseResult?)` |有条件|
| `duration()` | `duration(string): duration` |解析持续时间字符串 |
| `file()` | `file(path): file` |获取文件对象 |
| `link()` | `link(path, display?): Link` |创建链接 |

### 持续时间类型

两个日期相减时，结果是 **Duration** 类型（不是数字）。

**持续时间字段：** `duration.days`、`duration.hours`、`duration.minutes`、`duration.seconds`、`duration.milliseconds`

**重要提示：** Duration 不直接支持 `.round()`、`.floor()`、`.ceil()`。首先访问数字字段（如 `.days`），然后应用数字函数。

```yaml
# CORRECT: Calculate days between dates
"(date(due_date) - today()).days"                    # Returns number of days
"(now() - file.ctime).days"                          # Days since created
"(date(due_date) - today()).days.round(0)"           # Rounded days

# WRONG - will cause error:
# "((date(due) - today()) / 86400000).round(0)"      # Duration doesn't support division then round
```

### 日期算术

```yaml
# Duration units: y/year/years, M/month/months, d/day/days,
#                 w/week/weeks, h/hour/hours, m/minute/minutes, s/second/seconds
"now() + \"1 day\""       # Tomorrow
"today() + \"7d\""        # A week from today
"now() - file.ctime"      # Returns Duration
"(now() - file.ctime).days"  # Get days as number
```

## 查看类型

### 表格视图

```yaml
views:
  - type: table
    name: "My Table"
    order:
      - file.name
      - status
      - due_date
    summaries:
      price: Sum
      count: Average
```

### 卡片视图

```yaml
views:
  - type: cards
    name: "Gallery"
    order:
      - file.name
      - cover_image
      - description
```

### 列表视图

```yaml
views:
  - type: list
    name: "Simple List"
    order:
      - file.name
      - status
```

### 地图视图

需要纬度/经度属性和地图社区插件。

```yaml
views:
  - type: map
    name: "Locations"
    # Map-specific settings for lat/lng properties
```

## 默认汇总公式

|名称 |输入类型|描述 |
|------|------------|-------------|
| `Average` |数量 |数学平均值 |
| `Min` |数量 |最小的数字 |
| `Max` |数量 |最大数量 |
| `Sum` |数量 |所有数字的总和 |
| `Range` |数量 |最大-最小|
| `Median` |数量 |数学中位数 |
| `Stddev` |数量 |标准差|
| `Earliest` |日期 |最早日期 |
| `Latest` |日期 |最新日期 |
| `Range` |日期 |最新 - 最早 |
| `Checked` |布尔 |真值计数 |
| `Unchecked` |布尔 |错误值计数 |
| `Empty` |任何|空值计数 |
| `Filled` |任何 |非空值计数 |
| `Unique` |任何|唯一值计数 |

## 完整示例

### 任务跟踪器基础

```yaml
filters:
  and:
    - file.hasTag("task")
    - 'file.ext == "md"'

formulas:
  days_until_due: 'if(due, (date(due) - today()).days, "")'
  is_overdue: 'if(due, date(due) < today() && status != "done", false)'
  priority_label: 'if(priority == 1, "🔴 High", if(priority == 2, "🟡 Medium", "🟢 Low"))'

properties:
  status:
    displayName: Status
  formula.days_until_due:
    displayName: "Days Until Due"
  formula.priority_label:
    displayName: Priority

views:
  - type: table
    name: "Active Tasks"
    filters:
      and:
        - 'status != "done"'
    order:
      - file.name
      - status
      - formula.priority_label
      - due
      - formula.days_until_due
    groupBy:
      property: status
      direction: ASC
    summaries:
      formula.days_until_due: Average

  - type: table
    name: "Completed"
    filters:
      and:
        - 'status == "done"'
    order:
      - file.name
      - completed_date
```

### 阅读列表库

```yaml
filters:
  or:
    - file.hasTag("book")
    - file.hasTag("article")

formulas:
  reading_time: 'if(pages, (pages * 2).toString() + " min", "")'
  status_icon: 'if(status == "reading", "📖", if(status == "done", "✅", "📚"))'
  year_read: 'if(finished_date, date(finished_date).year, "")'

properties:
  author:
    displayName: Author
  formula.status_icon:
    displayName: ""
  formula.reading_time:
    displayName: "Est. Time"

views:
  - type: cards
    name: "Library"
    order:
      - cover
      - file.name
      - author
      - formula.status_icon
    filters:
      not:
        - 'status == "dropped"'

  - type: table
    name: "Reading List"
    filters:
      and:
        - 'status == "to-read"'
    order:
      - file.name
      - author
      - pages
      - formula.reading_time
```

### 每日笔记索引

```yaml
filters:
  and:
    - file.inFolder("Daily Notes")
    - '/^\d{4}-\d{2}-\d{2}$/.matches(file.basename)'

formulas:
  word_estimate: '(file.size / 5).round(0)'
  day_of_week: 'date(file.basename).format("dddd")'

properties:
  formula.day_of_week:
    displayName: "Day"
  formula.word_estimate:
    displayName: "~Words"

views:
  - type: table
    name: "Recent Notes"
    limit: 30
    order:
      - file.name
      - formula.day_of_week
      - formula.word_estimate
      - file.mtime
```

## 嵌入碱基

嵌入 Markdown 文件：

```markdown
![[MyBase.base]]

<!-- Specific view -->
![[MyBase.base#View Name]]
```

## YAML 引用规则

- 对包含双引号的公式使用单引号：`'if(done, "Yes", "No")'`
- 对简单字符串使用双引号：`"My View Name"`
- 在复杂表达式中正确转义嵌套引号

## 故障排除

### YAML 语法错误

**不带引号的特殊字符**：包含 `:`、`{`、`}`、`[`、`]`、`,`、`&` 的字符串， `*`、`#`、`?`、`|`、`-`、`<`、`>`、`=`、必须引用 `!`、`%`、`@`、`` ` ``。

```yaml
# WRONG - colon in unquoted string
displayName: Status: Active

# CORRECT
displayName: "Status: Active"
```

**公式中的引号不匹配**：当公式包含双引号时，请将整个公式用单引号括起来。

```yaml
# WRONG - double quotes inside double quotes
formulas:
  label: "if(done, "Yes", "No")"

# CORRECT - single quotes wrapping double quotes
formulas:
  label: 'if(done, "Yes", "No")'
```

### 常见公式错误

**无需字段访问的持续时间数学**：减去日期返回持续时间，而不是数字。始终访问 `.days`、`.hours` 等。

```yaml
# WRONG - Duration is not a number
"(now() - file.ctime).round(0)"

# CORRECT - access .days first, then round
"(now() - file.ctime).days.round(0)"
```

**缺少空检查**：属性可能并不存在于所有笔记上。使用`if()`进行守护。

```yaml
# WRONG - crashes if due_date is empty
"(date(due_date) - today()).days"

# CORRECT - guard with if()
'if(due_date, (date(due_date) - today()).days, "")'
```

**引用未定义的公式**：确保 `order` 或 `properties` 中的每个 `formula.X` 在 `formulas` 中都有匹配的条目。

```yaml
# This will fail silently if 'total' is not defined in formulas
order:
  - formula.total

# Fix: define it
formulas:
  total: "price * quantity"
```

## 参考文献

- [基础语法](https://help.obsidian.md/bases/syntax)
- [功能](https://help.obsidian.md/bases/functions)
- [浏览次数](https://help.obsidian.md/bases/views)
- [公式](https://help.obsidian.md/formulas)
- [完整功能参考](references/FUNCTIONS_REFERENCE.md)
