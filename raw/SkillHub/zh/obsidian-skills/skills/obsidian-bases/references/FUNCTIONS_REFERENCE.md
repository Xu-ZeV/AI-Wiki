# 函数参考

## 全局函数

|功能|签名|描述 |
|----------|-----------|-------------|
| `date()` | `date(string): date` |解析字符串到日期。格式：`YYYY-MM-DD HH:mm:ss` |
| `duration()` | `duration(string): duration` |解析持续时间字符串 |
| `now()` | `now(): date` |当前日期和时间 |
| `today()` | `today(): date` |当前日期（时间 = 00:00:00）|
| `if()` | `if(condition, trueResult, falseResult?)` |有条件|
| `min()` | `min(n1, n2, ...): number` |最小的数字 |
| `max()` | `max(n1, n2, ...): number` |最大数量 |
| `number()` | `number(any): number` |转换为数字 |
| `link()` | `link(path, display?): Link` |创建链接 |
| `list()` | `list(element): List` |如果尚未包含在列表中 |
| `file()` | `file(path): file` |获取文件对象 |
| `image()` | `image(path): image` |创建用于渲染的图像 |
| `icon()` | `icon(name): icon` | Lucide 图标的名称 |
| `html()` | `html(string): html` |呈现为 HTML |
| `escapeHTML()` | `escapeHTML(string): string` |转义 HTML 字符 |

## 任何类型函数

|功能|签名|描述 |
|----------|-----------|-------------|
| `isTruthy()` | `any.isTruthy(): boolean` |强制转换为布尔值 |
| `isType()` | `any.isType(type): boolean` |检查类型 |
| `toString()` | `any.toString(): string` |转换为字符串 |

## 日期函数和字段

**字段：** `date.year`、`date.month`、`date.day`、`date.hour`、`date.minute`、`date.second`、`date.millisecond`

|功能|签名|描述 |
|----------|-----------|-------------|
| `date()` | `date.date(): date` |删除时间部分 |
| `format()` | `date.format(string): string` |使用 Moment.js 模式格式化 |
| `time()` | `date.time(): string` |获取字符串形式的时间 |
| `relative()` | `date.relative(): string` |人类可读的相对时间 |
| `isEmpty()` | `date.isEmpty(): boolean` |日期始终为 false |

## 持续时间类型

两个日期相减时，结果是 **Duration** 类型（不是数字）。 Duration 有其自己的属性和方法。

**持续时间字段：**
|领域|类型 |描述 |
|-------|------|-------------|
| `duration.days` |数量 |总持续天数 |
| `duration.hours` |数量 |持续时间总小时数 |
| `duration.minutes` |数量 |持续时间总分钟数 |
| `duration.seconds` |数量 |持续时间总秒数 |
| `duration.milliseconds` |数量 |持续时间总毫秒数 |

**重要提示：** Duration 不直接支持 `.round()`、`.floor()`、`.ceil()`。您必须首先访问数字字段（如 `.days`），然后应用数字函数。

```yaml
# CORRECT: Calculate days between dates
"(date(due_date) - today()).days"                    # Returns number of days
"(now() - file.ctime).days"                          # Days since created

# CORRECT: Round the numeric result if needed
"(date(due_date) - today()).days.round(0)"           # Rounded days
"(now() - file.ctime).hours.round(0)"                # Rounded hours

# WRONG - will cause error:
# "((date(due) - today()) / 86400000).round(0)"      # Duration doesn't support division then round
```

## 日期算术

```yaml
# Duration units: y/year/years, M/month/months, d/day/days,
#                 w/week/weeks, h/hour/hours, m/minute/minutes, s/second/seconds

# Add/subtract durations
"date + \"1M\""           # Add 1 month
"date - \"2h\""           # Subtract 2 hours
"now() + \"1 day\""       # Tomorrow
"today() + \"7d\""        # A week from today

# Subtract dates returns Duration type
"now() - file.ctime"                    # Returns Duration
"(now() - file.ctime).days"             # Get days as number
"(now() - file.ctime).hours"            # Get hours as number

# Complex duration arithmetic
"now() + (duration('1d') * 2)"
```

## 字符串函数

**字段：** `string.length`

|功能|签名|描述 |
|----------|-----------|-------------|
| `contains()` | `string.contains(value): boolean` |检查子字符串 |
| `containsAll()` | `string.containsAll(...values): boolean` |所有存在的子串 |
| `containsAny()` | `string.containsAny(...values): boolean` |任何存在的子串 |
| `startsWith()` | `string.startsWith(query): boolean` |以查询 | 开头
| `endsWith()` | `string.endsWith(query): boolean` |以查询 | 结尾
| `isEmpty()` | `string.isEmpty(): boolean` |为空或不存在 |
| `lower()` | `string.lower(): string` |改为小写|
| `title()` | `string.title(): string` |标题案例 |
| `trim()` | `string.trim(): string` |删除空格 |
| `replace()` | `string.replace(pattern, replacement): string` |替换图案 |
| `repeat()` | `string.repeat(count): string` |重复字符串 |
| `reverse()` | `string.reverse(): string` |反转字符串 |
| `slice()` | `string.slice(start, end?): string` |子串 |
| `split()` | `string.split(separator, n?): list` |拆分至列表 |

## 数字函数

|功能|签名|描述 |
|----------|-----------|-------------|
| `abs()` | `number.abs(): number` |绝对值|
| `ceil()` | `number.ceil(): number` |四舍五入 |
| `floor()` | `number.floor(): number` |向下舍入 |
| `round()` | `number.round(digits?): number` |四舍五入到数字 |
| `toFixed()` | `number.toFixed(precision): string` |定点表示法 |
| `isEmpty()` | `number.isEmpty(): boolean` |不存在 |

## 列出函数

**字段：** `list.length`

|功能|签名|描述 |
|----------|-----------|-------------|
| `contains()` | `list.contains(value): boolean` |元素存在 |
| `containsAll()` | `list.containsAll(...values): boolean` |所有元素都存在 |
| `containsAny()` | `list.containsAny(...values): boolean` |任意元素都存在 |
| `filter()` | `list.filter(expression): list` |按条件过滤（使用 `value`、`index`）|
| `map()` | `list.map(expression): list` |变换元素（使用 `value`、`index`）|
| `reduce()` | `list.reduce(expression, initial): any` |减少到单个值（使用 `value`、`index`、`acc`）|
| `flat()` | `list.flat(): list` |展平嵌套列表 |
| `join()` | `list.join(separator): string` |连接到字符串 |
| `reverse()` | `list.reverse(): list` |逆序|
| `slice()` | `list.slice(start, end?): list` |子列表 |
| `sort()` | `list.sort(): list` |升序排序 |
| `unique()` | `list.unique(): list` |删除重复项 |
| `isEmpty()` | `list.isEmpty(): boolean` |没有元素 |

## 文件函数

|功能|签名|描述 |
|----------|-----------|-------------|
| `asLink()` | `file.asLink(display?): Link` |转换为链接 |
| `hasLink()` | `file.hasLink(otherFile): boolean` |有文件链接 |
| `hasTag()` | `file.hasTag(...tags): boolean` |具有任何标签 |
| `hasProperty()` | `file.hasProperty(name): boolean` |拥有房产|
| `inFolder()` | `file.inFolder(folder): boolean` |在文件夹或子文件夹 |

## 链接函数

|功能|签名|描述 |
|----------|-----------|-------------|
| `asFile()` | `link.asFile(): file` |获取文件对象 |
| `linksTo()` | `link.linksTo(file): boolean` |文件链接 |

## 对象函数

|功能|签名|描述 |
|----------|-----------|-------------|
| `isEmpty()` | `object.isEmpty(): boolean` |没有属性 |
| `keys()` | `object.keys(): list` |按键列表 |
| `values()` | `object.values(): list` |值列表 |

## 正则表达式函数

|功能|签名|描述 |
|----------|-----------|-------------|
| `matches()` | `regexp.matches(string): boolean` |测试是否匹配 |
