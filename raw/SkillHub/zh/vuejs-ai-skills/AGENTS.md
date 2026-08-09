# Vue 技能开发指南

## 分支策略

> **重要：切勿在 `main` 分支上开发！**
>
> - `main` 是 **发布分支** - 它仅包含已发布的技能
> - `dev` 是 **开发分支** - 所有工作都在这里进行
> - 使用“Sync to Main”GitHub Action 发布从 `dev` 到 `main` 的更改

|分公司|目的|直接提交 |
|--------|---------|----------------|
| `main` |出版（`npx skills add vuejs-ai/skills`）|禁止 |
| `dev` |开发、测试、实验 |仅通过公关 |

## 开发工作流程

完成任何任务后，运行：

```bash
pnpm typecheck
```

这可以确保在提交之前 TypeScript 类型是正确的。

## 技能范围

|技能|范围 |
|-------|-------|
| **vue 最佳实践** | Vue 3 与组合 API、`<script setup lang="ts">`、TypeScript、SSR。包括用于模板无法满足要求的情况的渲染函数。 |
| **vue-options-api-最佳实践** | Vue 3 选项 API 样式（`data()`、`methods`、`this` 上下文）。每个规则仅显示选项 API 解决方案。 |
| **vue-jsx-最佳实践** | Vue 中的 JSX 语法（例如，`class` 与 `className`、JSX 插件配置）。 |
| **vue 测试最佳实践** |使用 Vitest、Vue Test Utils 和 Playwright 进行 E2E 测试。 |
| **vue-router-最佳实践** | Vue Router 4 模式、导航守卫、路由参数和路由组件生命周期交互。 |
| **vue-pinia-最佳实践** | Pinia store、状态管理模式、store 设置以及store 的响应式。 |
| **vue 调试指南** | Vue 3 的调试和故障排除：运行时错误、警告、异步错误处理、SSR 水合问题。 |
| **创建适应性可组合** |使用 `MaybeRef`/`MaybeRefOrGetter` 输入模式创建可重复使用的可组合函数。 |

## 常见陷阱和最佳实践

- **仅限 Vue 特定：** 参考文件必须涵盖 Vue 模式和陷阱，而不是一般的 Web/JS 知识。
- **没有边缘情况：** 避免利基场景、特定于工具的怪癖和明显/众所周知的实践。
- **所需的结构：** 每个参考文件都需要标题、影响级别、任务清单以及不正确/正确的代码示例。
- **SKILL.md 适用于编码代理：** 遵循[官方最佳实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)：简洁（上下文窗口是公共物品），假设编码代理是智能的（仅添加它不知道的内容），没有硬编码计数或历史背景。使用渐进式披露 — SKILL.md 是指向参考文件的概述。

## 有效技能清单

在分享技能之前，请验证：

### 核心品质
- [ ] 描述具体并包含关键术语
- [ ] 描述包括技能的作用以及何时使用它
- [ ] SKILL.md 正文低于 500 行
- [ ] 其他详细信息位于单独的文件中（如果需要）
- [ ] 没有时间敏感信息（或在“旧模式”部分）
- [ ] 始终使用一致的术语
- [ ] 例子是具体的，而不是抽象的
- [ ] 文件引用深一层
- [ ] 适当使用渐进式披露
- [ ] 工作流程步骤清晰

### 代码和脚本
- [ ] 脚本解决问题而不是向 Claude 下注
- [ ] 错误处理是明确且有帮助的
- [ ] 没有“巫毒常量”（所有值均合理）
- [ ] 说明中列出所需的软件包并验证是否可用
- [ ] 脚本有清晰的文档
- [ ] 没有 Windows 风格的路径（全部是正斜杠）
- [ ] 关键操作的验证/验证步骤
- [ ] 包含针对质量关键任务的反馈循环

## 评估技能

### 评估驱动的开发

遵循[Anthropic的最佳实践](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#evaluation-and-iteration)：

1. **首先创建评估** - 在编写大量文档之前
2. **建立基线** - 没有技巧地运行，记录失败
3. **测试技能** - 加载技能运行，比较改进
4. **迭代** - 根据评估结果完善技能

### 评估结构

每个参考文件需要 3 个按场景组织的评估：

```
evals/suites/skills/vue-best-practices/
├── computed-vs-methods/           # Reference name
│   ├── scenario-1/                # Eval 1 of 3
│   │   ├── eval.json
│   │   ├── eval.ts
│   │   ├── results.json           # Tracks run results
│   │   └── src/...
│   ├── scenario-2/                # Eval 2 of 3
│   └── scenario-3/                # Eval 3 of 3
```

每个场景都是一个独立的Vue项目：

```
evals/suites/skills/vue-best-practices/computed-vs-methods/scenario-1/
├── eval.json           # Eval configuration with query and expected behavior
├── eval.ts             # Vitest assertions (withheld from agent)
├── results.json        # Tracks run results per model
├── package.json        # Self-contained Vue project
├── vite.config.ts
├── tsconfig.json
├── index.html
├── eslint.config.js
└── src/
    ├── main.ts
    ├── App.vue
    ├── vite-env.d.ts
    └── components/
        └── ProductList.vue   # Empty stub component
```

**关键文件：**
- `eval.json` - 带有查询、技能和预期行为的评估配置
- `eval.ts` - 验证生成代码的 Vitest 测试（在生成过程中向代理保留）
- `results.json` - 跟踪每个模型的运行结果（自动生成）
- `package.json` - 每个套件都是独立的，具有所有依赖项

**eval.json 格式：**
```json
{
  "skills": ["vue-best-practices"],
  "query": "Create a Vue component that displays a filtered list...",
  "files": ["src/components/ProductList.vue"],
  "expected_behavior": [
    "Uses computed property for filtered list, not a method",
    "Does not call filtering function in template"
  ]
}
```

### 评估层

每个评估都经过 4 个层级来衡量技能有效性：

|等级 |提示|设置 |
|------|--------|-------|
| `baseline` | `[original prompt]` |没有技能|
| `with-skill` | `[original prompt]` |技能装|
| `with-skill-prompt` | `use vue-best-practices skill, [original prompt]` |技能装|
| `with-agents-md` | `[original prompt]` |项目AGENTS.md中嵌入的技能内容 |

### 结果跟踪

结果存储在每个 eval 目录中的 `results.json` 中。仅保留每个模型的最新结果。不记录具有特定层的独立运行。

**结果.json格式：**
```json
{
  "haiku": {
    "timestamp": "2025-01-29T14:32:05Z",
    "tiers": {
      "baseline": { "passed": true, "duration": 45000 },
      "with-skill": { "passed": true, "duration": 52000 },
      "with-skill-prompt": { "passed": true, "duration": 48000 },
      "with-agents-md": { "passed": true, "duration": 41000 }
    }
  },
  "sonnet": {
    "timestamp": "2025-01-29T15:10:22Z",
    "tiers": {
      "baseline": { "passed": false, "duration": 38000 },
      "with-skill": { "passed": true, "duration": 55000 },
      "with-skill-prompt": { "passed": true, "duration": 51000 },
      "with-agents-md": { "passed": true, "duration": 47000 }
    }
  }
}
```

**字段定义：**
- 型号密钥：`haiku`、`sonnet`、`opus`（不存在 = 尚未运行）
- `timestamp`：ISO 8601 格式，精度为秒
- `duration`：两次运行的总毫秒数
- `passed`：true = 两次运行均通过，false = 运行 1 或 2 失败（快速失败）

**运行逻辑（2次运行，快速失败）：**
1、运行1：如果失败→停止，记录`passed: false`
2. 运行 1：如果通过 → 继续运行 2
3. 运行2：如果失败→记录`passed: false`
4.运行2：如果通过→记录`passed: true`

新的运行会覆盖该模型之前的结果。

### 编写 eval.ts

使用 **文件内容模式匹配** 测试验证生成的代码：

```typescript
import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

test("Uses computed property for filtering", () => {
  const content = readFileSync(
    join(process.cwd(), "src/components/Example.vue"),
    "utf-8"
  );

  // Assert pattern SHOULD exist
  expect(content).toMatch(/const\s+\w+\s*=\s*computed\s*\(/);

  // Assert pattern should NOT exist
  expect(content).not.toMatch(/v-for="[^"]*\s+in\s+\w+\(\)"/);
});
```

### 评估指南

1. **独立项目** - 每个套件都包含构建所需的所有文件
2. **输入存根必须干净** - 没有注释、提示、TODO 或任何建议如何解决任务的信息。查询本身就应该定义工作。
3. **测试读取文件内容** - 使用 `readFileSync()` 获取生成的代码
4. **使用正则表达式获得灵活性** - 匹配模式，而不是精确的字符串
5. **测试重要的事情** - 专注于正在测试的特定模式
6. **二进制评分** - 构建 + eval.ts 测试 = 通过/失败
7. **多模型测试** - 使用 Haiku、Sonnet 和 Opus 进行测试

### 运行评估

```bash
# Full run - all 4 tiers (skips if results.json exists for model)
pnpm eval computed-vs-methods

# Force re-run even if results exist
pnpm eval computed-vs-methods --force

# Run all missing evals
pnpm eval --all

# Re-run everything
pnpm eval --all --force

# Select model (haiku, sonnet, opus)
pnpm eval computed-vs-methods --model haiku

# Single tier run (for debugging, NOT recorded to results.json)
pnpm eval computed-vs-methods --tier baseline
pnpm eval computed-vs-methods --tier with-skill
pnpm eval computed-vs-methods --tier with-skill-prompt
pnpm eval computed-vs-methods --tier with-agents-md

# Dry run (validate fixtures only, no LLM call)
pnpm eval computed-vs-methods --dry

# Verbose output (keep temp dir, show details)
pnpm eval computed-vs-methods --verbose

# Type check evals library
pnpm --filter @vue-skills/evals typecheck
```

**跳过逻辑：**
- 如果 `results.json` 有所选型号的条目 → 跳过（除非 `--force`）
- 仅记录完整运行（所有 4 层）
- 带有 `--tier` 标志的单层运行用于调试而不是跟踪

### 跑步者的工作原理

1. 将 eval suite 复制到临时目录（不包括 eval.ts 和 eval.json）
2.通过`npx skills add`安装技能（除非`--baseline`）
3. 从 eval.json 读取查询并使用安全工具权限运行 Claude Code
4. 将 eval.ts 复制回临时目录
5.运行`pnpm install`和`pnpm run build`
6.运行`vitest run eval.ts`
7. 根据构建+测试结果报告通过/失败

### 可用评估

|评估|技能|测试 |
|------|-------|-------|
| `computed-vs-methods` | vue 最佳实践 |使用计算（）获取派生数据 |
| `no-v-if-with-v-for` | vue 最佳实践 |分隔 v-if 和 v-for |
| `v-for-key-attribute` | vue 最佳实践 |使用 :key 和唯一的 id |
| `testing-vitest` | vue 测试最佳实践 |使用 Vitest + Vue 测试工具 |
| `testing-async-flushpromises` | vue 测试最佳实践 |使用flushPromises 进行异步 |
| `router-param-change` | vue-router-最佳实践 |观察路线参数 |
| `pinia-store-destructuring` | vue-pinia-最佳实践 |使用 storeToRefs |
| `no-arrow-functions-methods` | vue-options-api-最佳实践 |常规函数语法|
| `jsx-vue-vs-react` | vue-jsx-最佳实践 |使用类而不是类名 |
| `create-composable` | vue 最佳实践 |创建可重用的可组合函数 |

### 完整评估矩阵

每个参考文件需要：

3 次评估 × 4 层 × 3 个模型 × 2 次运行 = 72 次运行（快速失败）

参考示例之一：
- 3 次评估（场景 1、场景 2、场景 3）
- × 4 层（基线、with-skill、with-skill-prompt、with-agents-md）
- × 3 个模型（俳句、十四行诗、作品）
- × 2 次运行（两次都必须通过，第一次失败时快速失败）

仅保留每个模型的最新结果。使用 `--force` 重新运行以更新。

### 验证清单

在考虑已验证的技能之前：

- [ ] 每个参考文件 3 次评估
- [ ] 每个评估都有所有 3 个模型的结果（俳句、十四行诗、作品）
- [ ] 每个模型运行涵盖所有 4 层（基线、with-skill、with-skill-prompt、with-agents-md）
- [ ] 结果显示较基线有所改善
