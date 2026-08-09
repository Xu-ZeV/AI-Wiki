---
name: ckm:slides
description: 使用 Chart.js、设计 token、响应式布局、文案公式和上下文幻灯片策略创建战略性 HTML 演示文稿。
argument-hint: "[topic] [slide-count]"
metadata:
  author: claudekit
  version: "1.0.0"
---

# 幻灯片

具有数据可视化的战略性 HTML 演示设计。

<参数>$参数</args>

## 何时使用

- 营销演示和宣传材料
- 使用 Chart.js 的数据驱动幻灯片
- 具有布局模式的策略性幻灯片设计
- 文案优化的演示内容

## 子命令

|子命令 |描述 |参考|
|------------|-------------|-----------|
| `create` |创建战略演示幻灯片 | `references/create.md` |

## 参考文献（知识库）

|主题 |文件|
|-------|------|
|布局模式| `references/layout-patterns.md` |
| HTML 模板 | `references/html-template.md` |
|文案公式| `references/copywriting-formulas.md` |
|幻灯片策略| `references/slide-strategies.md` |

## 路由

1.从`$ARGUMENTS`（第一个字）解析子命令
2.加载对应的`references/{subcommand}.md`
3. 使用剩余参数执行
