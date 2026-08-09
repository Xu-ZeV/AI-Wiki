---
name: defuddle
description: 使用 Defuddle CLI 从网页中提取干净的 Markdown 内容，消除混乱和导航以节省token。当用户提供要阅读或分析的 URL 来获取在线文档、文章、博客文章或任何标准网页时，请使用而不是 WebFetch。不要用于以 .md 结尾的 URL — 这些 URL 已经是 markdown，请直接使用 WebFetch。
---

# 解惑

使用 Defuddle CLI 从网页中提取干净的可读内容。对于标准网页，更喜欢 WebFetch — 它消除了导航、广告和混乱，减少了token的使用。

如果未安装：`npm install -g defuddle`

## 用法

始终使用 `--md` 进行Markdown输出：

```bash
defuddle parse <url> --md
```

保存到文件：

```bash
defuddle parse <url> --md -o content.md
```

提取特定元数据：

```bash
defuddle parse <url> -p title
defuddle parse <url> -p description
defuddle parse <url> -p domain
```

## 输出格式

|旗帜|格式|
|------|--------|
| `--md` | Markdown（默认选择）|
| `--json` | JSON 与 HTML 和 Markdown |
| （无）| HTML |
| `-p <name>` |特定元数据属性 |
