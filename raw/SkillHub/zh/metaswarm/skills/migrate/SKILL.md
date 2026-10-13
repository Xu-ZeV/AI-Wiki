---
name: migrate
description: 从 npm 安装的 metaswarm 迁移到市场插件版 —— 在安全检查保护下移除冗余文件
---

# 迁移技能

把一个项目从 npm 安装的 metaswarm（`npx metaswarm init`）迁移到市场插件版。在防止数据丢失的安全协议保护下，移除冗余的内嵌文件。

**何时使用**：SessionStart 钩子检测到 `.claude/plugins/metaswarm/.claude-plugin/plugin.json`（遗留内嵌插件）并建议运行本技能时。

---

## 重要：安全与措辞准则

**在展示任何文件清单之前，用户必须先理解下面这段内容：**

在展示任何迁移预览或文件清单之前，必须始终先说清楚这个前提：

> **这次迁移做什么**：市场插件现在提供了此前复制到你项目目录里的全部技能、命令、量规与指南。这次迁移只是把那些冗余副本清掉 —— 原始内容现在住在插件里。
>
> **不会丢任何东西**：你的项目专属文件（CLAUDE.md、.coverage-thresholds.json、.beads/、bin/、scripts/）**永远不会**被触碰。只有重复的 metaswarm 框架文件会被移除。
>
> **完全可逆**：所有移除都用 `git rm` 暂存（不是永久删除）。在你提交之前：
> - 撤销全部改动：`git restore --staged . && git checkout -- .`
> - 提交之后：`git revert HEAD`
>
> **不会自动提交任何东西** —— 你满意了自己提交。

**语气**：要让人安心，不要制造恐慌。说「清理 XX 个冗余副本」，不要说「删除 XX 个文件」。说「这些文件现在住在插件里」，不要说「这些文件将被移除」。把迁移框定为收拾家务，而不是破坏。

**展示文件数量时**：如果文件很多（例如 40 个以上），要解释数量大的原因 —— 旧的 npm 安装器把整个插件框架复制进了 `.claude/plugins/metaswarm/`，光这一个目录就占了大部分数量，而它全是框架代码，现在由插件直接提供。

---

## 第 1 步：起飞前检查

1. 确认本技能是从市场插件运行的（如果本技能被加载了，说明插件已激活）
2. 读取 `.metaswarm/project-profile.json` —— 如果已设置 `"distribution": "plugin"`，告知用户迁移此前已完成并退出
3. 确认 `.claude/plugins/metaswarm/.claude-plugin/plugin.json` 存在 —— 若不存在，则没有可迁移的内容，告知用户并退出

如果插件未加载，用户需要先安装：`/plugin marketplace add dsifry/metaswarm-marketplace`

---

## 第 2 步：盘点遗留文件

扫描由 `npx metaswarm init` 安装、但现已由市场插件提供的文件。

**移除候选：**

| 类别 | 路径模式 |
|---|---|
| 内嵌插件 | `.claude/plugins/metaswarm/`（整个目录） |
| 量规 | `.claude/rubrics/*.md` |
| 指南 | `.claude/guides/*.md` |
| 旧命令 | `.claude/commands/metaswarm-setup.md`、`.claude/commands/metaswarm-update-version.md` |

**永不移除**（项目本地文件）：`CLAUDE.md`、`.coverage-thresholds.json`、`.metaswarm/project-profile.json`、`.beads/`、`bin/`、`scripts/`、`.github/workflows/`、`.claude/commands/` 下的 shim。

---

## 第 3 步：内容校验

对每个移除候选，用 SHA-256 哈希比对确认它是一份未被修改的 metaswarm 文件。

**哈希协议：**
1. 读取文件内容
2. 把换行符规范化为 LF（`\r\n` -> `\n`，`\r` -> `\n`）
3. 去掉每行尾部空白
4. 去掉尾部换行
5. 对规范化后的内容计算 SHA-256
6. 与市场插件自有目录（rubrics/、guides/ 等）中对应文件的哈希比对

从插件的现存文件计算哈希，可以保证哈希表始终是最新的 —— 不存在会漂移的硬编码哈希。

**分类：**

| 结果 | 处理 |
|---|---|
| 哈希一致 | **未修改** —— 加入删除清单 |
| 哈希不同 | **用户已修改** —— 标记出来交用户决定，绝不自动删除 |
| 不在哈希表中 | **未知文件** —— 完全跳过 |

---

## 第 4 步：试运行预览

在做出任何改动之前，展示完整的迁移计划。**先展示上面的安全前提**，然后展示预览：

```
## 迁移预览

以下是框架文件的冗余副本，这些内容现在由插件提供。
所有移除都只做暂存（不提交）—— 你可以在提交前撤销全部改动。

### 待清理的冗余框架文件（XX 个）
以下是未被修改过的副本，插件现在直接提供：
- .claude/plugins/metaswarm/（内嵌插件副本 —— XX 个文件，现由市场插件提供）
- .claude/rubrics/<每个匹配文件>（现位于插件的 rubrics/）
- .claude/guides/<每个匹配文件>（现位于插件的 guides/）
- .claude/commands/metaswarm-setup.md（已被插件命令取代）
- .claude/commands/metaswarm-update-version.md（已被插件命令取代）

### 你自定义过的文件（需要你决定）
- .claude/rubrics/code-review-rubric.md（已修改 —— 在你决定之前你的改动会被保留）

### 你的项目文件（永不被触碰）
- CLAUDE.md, .coverage-thresholds.json, .metaswarm/, .beads/, bin/, scripts/

### 会被新增的内容
- .claude/commands/ 下 6 个命令 shim（路由到插件命令的薄封装）
- .metaswarm/project-profile.json 更新为 "distribution": "plugin"

### 如何撤销（提交之前）
git restore --staged . && git checkout -- .
```

---

## 第 5 步：用户确认

使用 `AskUserQuestion`：
- 提醒用户：「这一步只是暂存清理结果 —— 什么都还没提交。你可以用 `git restore --staged . && git checkout -- .` 撤销。」
- 提问：「准备好清理这些冗余的框架文件了吗？」（不要问「准备好删除文件了吗？」）
- 对每个被用户修改过的文件，逐个询问：保留、移除，还是查看差异
- 若用户选择「查看差异」，展示他的版本与插件版本的差别，然后重新询问

---

## 第 6 步：Git 安全

执行移除之前：
1. 运行 `git status` 检查是否有未提交改动
2. 若有未提交改动，警告：「建议先提交或 stash，再执行迁移，这样改动会单独成一个提交。仍要继续吗？」
3. 若用户拒绝，退出

---

## 第 7 步：清理

**先宣告你要做什么**：运行任何命令之前，说：
> 「正在把冗余文件暂存为待移除。这些全是框架副本 —— 你的项目文件不受影响。什么都还没提交。」

**已被 git 跟踪的文件** —— 使用 `git rm`（暂存，可用 `git checkout` 回滚）：
```bash
git rm -rf .claude/plugins/metaswarm/
git rm .claude/rubrics/<每个已确认文件>
git rm .claude/guides/<每个已确认文件>
git rm .claude/commands/metaswarm-setup.md
git rm .claude/commands/metaswarm-update-version.md
```

**运行之后**：安抚用户：「完成 —— XX 个文件已暂存待移除。它们只是被暂存，并未提交。运行 `git status` 查看暂存改动，或用 `git restore --staged . && git checkout -- .` 撤销。」

**未被跟踪的文件** —— 使用 `rm -f`（可能性不大，但也要优雅处理）。

**空目录** —— 清理后若 `.claude/rubrics/`、`.claude/guides/` 为空则删除。**不要**删除 `.claude/commands/`（shim 仍在其中）。

---

## 第 8 步：创建命令 shim

向 `.claude/commands/` 写入 6 个 shim（与 setup 技能一致）：

| Shim | 路由到 |
|---|---|
| `start-task.md` | `/metaswarm:start-task` |
| `prime.md` | `/metaswarm:prime` |
| `review-design.md` | `/metaswarm:review-design` |
| `self-reflect.md` | `/metaswarm:self-reflect` |
| `pr-shepherd.md` | `/metaswarm:pr-shepherd` |
| `brainstorm.md` | `/metaswarm:brainstorm` |

每个 shim：
```markdown
<!-- Created by metaswarm setup. Routes to the metaswarm plugin. Safe to delete if you uninstall metaswarm. -->
Invoke the `/metaswarm:<command-name>` skill with any arguments the user provided.
```

若已存在内容不同的同名 shim，覆盖前先询问。

---

## 第 9 步：更新 profile

把这些字段合并进 `.metaswarm/project-profile.json`（保留既有字段）：
```json
{
  "distribution": "plugin",
  "migrated_at": "<ISO 8601 时间戳>",
  "migrated_from": "npm"
}
```

---

## 第 10 步：迁移后总结

展示做了什么以及后续步骤：
```
## 迁移完成

已清理 XX 个冗余框架文件，这些内容现在由市场插件提供。
你的项目文件（CLAUDE.md、.coverage-thresholds.json、.beads/ 等）未被触碰。

### 变更内容
- 移除了 XX 个冗余框架副本（现由插件提供）
- 在 .claude/commands/ 新增 6 个命令 shim
- 项目 profile 更新为 "distribution": "plugin"

### 后续步骤
1. 审阅暂存改动：`git diff --cached --stat`
2. 满意后提交：`git commit -m "chore: migrate metaswarm from npm to marketplace plugin"`
3. 验证一切正常：试着运行 `/start-task`

### 如果觉得哪里不对
- 提交前撤销：`git restore --staged . && git checkout -- .`
- 提交后撤销：`git revert HEAD`
- 完整重装：`npx metaswarm install`（npm 包仍可用）
```

---

## 回滚（没有任何操作是永久的）

所有移除都使用 `git rm`，它只暂存改动 —— 文件并未从 git 历史中删除。迁移从不自动提交，所以用户永远有机会审阅和撤销：

- **提交之前**（完整撤销）：`git restore --staged . && git checkout -- .`
- **提交之后**（完整撤销）：`git revert HEAD`
- **单文件恢复**：`git checkout HEAD~1 -- <path>`
- **完整重装旧方案**：`npx metaswarm install`（npm 包仍在发布）

---

## 错误处理

| 错误 | 处理 |
|---|---|
| `.metaswarm/project-profile.json` 缺失 | 用最小字段创建后继续 |
| 对某文件 `git rm` 失败 | 记录错误，跳过该文件，继续 |
| 权限不足 | 警告用户，跳过该文件，继续 |
| 插件未加载 | 退出并给出安装指引 |
| `metaswarm_version < 0.8.0` | 警告可能需要人工介入 |

---

## 反模式

| 反模式 | 应该怎么做 |
|---|---|
| 自动删除已修改文件 | 标记出来并显式询问 |
| 在确认插件可用之前就删除 | 先做起飞前检查 |
| 对已跟踪文件使用 `rm -rf` | 使用 `git rm`（可逆） |
| 跳过试运行预览 | 始终展示完整预览 |
| 移除项目本地文件 | 绝不触碰 CLAUDE.md、.beads/、bin/、scripts/ |
| 说「删除 XX 个文件」或「移除 XX 个文件」 | 说「清理 XX 个冗余副本」 |
| 脱离安全语境直接给文件清单 | 始终先给安全前提 |
| 直接跳到 `git rm` 命令 | 先解释你在做什么、为什么安全 |
