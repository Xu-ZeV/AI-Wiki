---
name: tag-taxonomy
description: >
  Enforce consistent tagging across the Obsidian wiki using a controlled vocabulary.
  Use this skill when the user says "fix my tags", "normalize tags", "clean up tags",
  "tag audit", "what tags should I use", "tag taxonomy", or whenever you're creating or
  updating wiki pages and need to choose the right tags. Also trigger when the user asks
  about tag conventions, wants to add a new tag to the taxonomy, or says "my tags are a mess".
  Always consult this skill's taxonomy file before assigning tags to any wiki page.
---

# 标签分类 — Wiki 标签的受控词汇

您可以通过将标签标准化为受控词汇来在整个 wiki 中强制执行一致的标签。

## 开始之前

1. **解析配置** — 遵循 `llm-wiki/SKILL.md` 中的配置解析协议（针对 `.env` → `~/.obsidian-wiki/config` → 提示设置）进行 CWD。这给出了 `OBSIDIAN_VAULT_PATH`
2. 读取`$OBSIDIAN_VAULT_PATH/_meta/taxonomy.md`——这是规范标签列表
3. 阅读 `index.md` 以了解 wiki 的范围

## 分类文件

规范标签词汇表位于 `$OBSIDIAN_VAULT_PATH/_meta/taxonomy.md`。它定义：

- **规范标签** — 应该使用的标签
- **别名** — 应映射到规范形式的常见替代方案
- **规则** — 每页最多 5 个标签，小写/连字符，更喜欢宽的而不是窄的
- **迁移指南** — 针对已知不一致的特定重命名

**在标记之前请务必阅读此文件。**这是事实的来源。

## 保留的系统标签

`visibility/`是具有特殊规则的保留标签组。这些标签**不是**域或类型标签，并且与分类词汇表分开管理：

|标签 |目的|
|---|---|
| `visibility/public` |明确公开-在所有模式下显示（与无标签相同）|
| `visibility/internal` |仅限团队 - 排除在过滤查询/导出模式中 |
| `visibility/pii` |敏感数据 — 在过滤查询/导出模式中排除 |

**`visibility/` 标签的规则：**
- 它们**不**计入 5 个标签的限制
- 每页仅一个 `visibility/` 标签
- 当内容明显公开时完全省略 - 不需要标签
- 切勿仅仅因为内容是技术性的而添加 `visibility/internal`；仅将其用于真正受团队限制的知识
- 运行标签审核时，单独报告 `visibility/` 标签使用情况 - 不要将它们标记为未知或非规范

规范化标签时，保持 `visibility/` 标签不变 - 它们不受别名映射的影响。

## 模式一：标签审核

当用户想要查看标签的当前状态时：

### 第 1 步：扫描所有页面

```
Glob: $VAULT_PATH/**/*.md (excluding _archives/, .obsidian/, _meta/)
Extract: tags field from YAML frontmatter
```

### 步骤2：建立标签频率表

对于找到的每个标签，计算有多少页面使用它。标志：

- **未知标签** - 不在分类的规范列表中
- **别名标签** — 使用别名而不是规范形式（例如，`nextjs` 而不是 `react`）
- **过度标记的页面** — 具有超过 5 个标记的页面
- **未标记页面** — 没有标记或空标记字段的页面

### 第 3 步：报告

```markdown
## Tag Audit Report

### Summary

- Total unique tags: 47
- Canonical tags used: 32
- Non-canonical tags found: 15
- Pages over tag limit (5): 3
- Untagged pages: 2

### Non-Canonical Tags Found

| Current Tag | → Canonical | Pages Affected |
| ----------- | ----------- | -------------- |
| `nextjs`    | `react`     | 4              |
| `next-js`   | `react`     | 2              |
| `robotics`  | `ml`        | 1              |
| `windows98` | `retro`     | 3              |

### Unknown Tags (not in taxonomy)

| Tag          | Pages | Recommendation                   |
| ------------ | ----- | -------------------------------- |
| `flutter`    | 1     | Add to taxonomy under Frameworks |
| `kubernetes` | 2     | Add to taxonomy under DevOps     |

### Over-Tagged Pages

| Page                   | Tag Count | Tags                 |
| ---------------------- | --------- | -------------------- |
| `entities/jane-doe.md` | 8         | ai, ml, founder, ... |
```

## 模式2：标签标准化

当用户想要修复标签时：

### 第 1 步：运行审核（上文）

### 第 2 步：应用修复

对于每个带有非规范标签的页面：

1. 阅读页面
2. 将别名标签替换为分类中的规范形式
3. 如果页面有超过 5 个标签，建议删除哪些标签（保留最具体/相关的标签）
4. 编写更新的frontmatter

**示例：**

```yaml
# Before
tags: [nextjs, ai, ml-engineer, windows98, creative-coding, game, 8-bit, portfolio]

# After
tags: [react, ai, ml, retro, generative-art]
```

### 步骤 3：处理未知数

对于不在分类中且不是别名的标签：

- 如果标签在 2 个以上页面上使用，建议将其添加到分类中
- 如果该标签在一页上使用，建议将其替换为最接近的规范标签
- 在更改未知标签之前询问用户

### 第 4 步：更新分类法

如果商定了新的规范标签，请将它们附加到正确部分的 `_meta/taxonomy.md` 中。

## 模式 3：标记新页面

当您创建 wiki 页面并需要选择标签时：

1.读取`_meta/taxonomy.md`
2. 选择最多 5 个最能描述页面的标签：
   - 1-2 **域标签**（什么主题领域）
   - 1 **类型标签**（什么样的东西）
   - 0-1 **项目标签**（如果特定于项目）
   - 0-1个额外的描述性标签
3. 只使用规范标签——不要使用别名
4. 如果没有适合的现有标签，请检查是否值得将其添加到分类法中

## 模式4：添加新标签

当用户想要向词汇表添加标签时：

1. 检查现有标签是否已涵盖该概念（如果是，则提出建议）
2. 如果确实是新的，请确定它属于哪个部分（域、类型、项目）
3. 将其添加到 `_meta/taxonomy.md`：
   - 规范的标签名称
   - 它的用途是什么
   - 任何要重定向的别名

## 任何标签操作后

附加到`log.md`：

```
- [TIMESTAMP] TAG_AUDIT tags_normalized=N unknown_tags=M pages_modified=P
```

或者为了标准化：

```
- [TIMESTAMP] TAG_NORMALIZE tags_renamed=N pages_modified=M new_tags_added=P
```

**`hot.md`** — 读取 `$OBSIDIAN_VAULT_PATH/hot.md`（如果缺少，则从 `wiki-ingest` 中的模板创建）。使用一行摘要更新 **最近活动** - 例如“标签审核：规范化 28 页的 14 个标签；添加了 2 个新的规范标签。”保留最后 3 次操作。更新 `updated` 时间戳。

## Vault 写入后 QMD 刷新

QMD 是一个搜索索引，而不是事实来源。如果 `$QMD_WIKI_COLLECTION` 为空或未设置，则跳过此步骤。仅在该技能写入或重写了Vault Markdown后才运行它。如果 QMD 刷新失败，请勿回滚vault更改；单独报告 QMD 状态。

如果设置，则使用 `$QMD_CLI`；否则使用 `qmd`。

```bash
${QMD_CLI:-qmd} update
```

如果输出表明需要向量或嵌入可能已过时，请运行：

```bash
${QMD_CLI:-qmd} embed
```

使用以下任一方法验证集合：

```bash
${QMD_CLI:-qmd} ls "$QMD_WIKI_COLLECTION"
```

或者，当特定页面路径已知时：

```bash
${QMD_CLI:-qmd} get "qmd://$QMD_WIKI_COLLECTION/<page>.md" -l 5
```

记录以下之一：
- `QMD refreshed: update + embed + verified`
- `QMD refreshed: update only + verified`
- `QMD skipped: QMD_WIKI_COLLECTION unset`
- `QMD skipped: qmd CLI unavailable`
- `QMD failed: <short error summary>`