# 属性（Frontmatter）参考

属性在注释开头使用 YAML frontmatter：

```yaml
---
title: My Note Title
date: 2024-01-15
tags:
  - project
  - important
aliases:
  - My Note
  - Alternative Name
cssclasses:
  - custom-class
status: in-progress
rating: 4.5
completed: false
due: 2024-02-01T14:30:00
---
```

## 财产类型

|类型 |示例|
|------|---------|
|文字| `title: My Title` |
|数量 | `rating: 4.5` |
|复选框 | `completed: true` |
|日期 | `date: 2024-01-15` |
|日期和时间 | `due: 2024-01-15T14:30:00` |
|列表 | `tags: [one, two]` 或 YAML 列表 |
|友情链接 | `related: "[[Other Note]]"` |

## 默认属性

- `tags` - 注释标签（可搜索，以图表视图显示）
- `aliases` - 注释的替代名称（在链接建议中使用）
- `cssclasses` - 应用于阅读/编辑视图中的注释的 CSS 类

## 标签

```markdown
#tag
#nested/tag
#tag-with-dashes
#tag_with_underscores
```

标签可以包含：字母（任何语言）、数字（非第一个字符）、下划线 `_`、连字符 `-`、正斜杠 `/`（用于嵌套）。

在前面的内容中：

```yaml
---
tags:
  - tag1
  - nested/tag2
---
```
