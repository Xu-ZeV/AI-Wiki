# vue 技能

Vue 3 开发的agent 技能。

> 🚧 **早期实验/社区项目**
>
> 该存储库是为 AI 代理创建专门技能以增强 Vue 3 开发的早期实验。技能源于现实问题，但可能因幻觉而不完整，请反馈。如果有价值，我计划建议将这个项目转移给Vue组织，以造福更广泛的社区。

## 安装

```bash
npx skills add vuejs-ai/skills
```

### 克劳德代码市场

Claude Code 用户的替代方案：

```bash
# Add marketplace
/plugin marketplace add vuejs-ai/skills

# Install all skills at once
/plugin install vue-skills-bundle@vue-skills

# Install individual skills
/plugin install vue-best-practices@vue-skills

# Install multiple skills
/plugin install vue-best-practices@vue-skills vue-router-best-practices@vue-skills
```

## 用法

为了获得最可靠的结果，请在提示符前加上 `use vue skill`：

```
Use vue skill, <your prompt here>
```

这会明确触发该技能并确保人工智能遵循记录的模式。如果没有前缀，技能触发可能会不一致，具体取决于提示与技能描述关键字的匹配程度。

## 可用技能

|技能|何时使用 |描述 |
|-------|-------------|-------------|
| **vue 最佳实践** | Vue 3 + 组合 API + TypeScript |最佳实践、常见问题、SSR 指南、性能 |
| **vue-options-api-最佳实践** |选项 API（`data()`、`methods`）| `this` 上下文、生命周期、带有选项 API 的 TypeScript |
| **vue-router-最佳实践** | Vue 路由器 4 |导航守卫、路由参数、路由组件生命周期 |
| **vue-pinia-最佳实践** |国家管理的 Pinia |存储设置、响应式、状态模式 |
| **vue 测试最佳实践** |编写组件或E2E测试| Vitest，Vue Test Utils，剧作家 |
| **vue-jsx-最佳实践** | Vue 中的 JSX |与 React JSX 的语法差异 |
| **vue 调试指南** |调试 Vue 3 问题 |运行时错误、警告、异步错误处理、水合作用问题 |
| **创建适应性可组合** |创建可重用的可组合函数 | `MaybeRef`/`MaybeRefOrGetter` 输入模式 |

## 示例

### vue 最佳实践

#### 演示 - Todo 应用程序

提示

```
create a todo app
```

🔎 请参阅演示[完整输出](https://github.com/vuejs-ai/skills/tree/dev/demo/todo-app)。

#### 使用技能后的变化

- 更具可读性[代码](https://github.com/vuejs-ai/skills/tree/dev/demo/todo-app/with-skills/App.vue)
- [组件](https://github.com/vuejs-ai/skills/tree/dev/demo/todo-app/with-skills/components) 分体式
- 将状态移至可组合函数中（[useTodos.ts](https://github.com/vuejs-ai/skills/tree/dev/demo/todo-app/with-skills/composables/useTodos.ts)）
- 使用 `shallowRef` 作为原始反应数据（参见 [Reactivity](skills/vue-best-practices/references/reactivity.md) 参考）

### 创建适应性可组合

原文来自 [`serkodev/vue-skills`](https://github.com/serkodev/vue-skills/tree/main) 的 `create-agnostic-composable`

#### 演示 - useHidden

提示

```
create a reusable composable for controlling hidden for a element
```

🔎 请参阅演示[完整输出](https://github.com/vuejs-ai/skills/tree/dev/demo/hidden-composable)。

#### 使用技能后的变化

- 使用 `MaybeRef` 和 `MaybeRefOrGetter` 作为输入参数以实现反应灵活性。

```ts
export interface UseHiddenOptions {
  hidden?: MaybeRef<boolean>
  initialHidden?: MaybeRefOrGetter<boolean>
  syncAria?: boolean
}

export function useHidden(
  target?: MaybeRefOrGetter<HTMLElement | null | undefined>,
  options: UseHiddenOptions = {},
)
```

## 方法论

### 技能类型

技能分为两类：

- **能力**：如果没有技能，人工智能*无法*解决问题。这些解决了特定于版本的问题、未记录的行为、最新功能或人工智能训练数据之外的边缘情况。

- **效率**：人工智能*可以*解决问题，但效果不佳。这些提供了可提高解决方案质量的最佳模式、最佳实践和一致的方法。

### 验证过程

每个技能规则都通过自动评估进行验证：

1. **基线**：在没有安装技能的情况下运行
2. **With-skill**：安装技能运行

仅当规则能够使模型解决没有规则就无法解决的问题时，才会保留规则。

|基线|凭借技巧 |行动|
|----------|------------|--------|
|失败|通行证 |保留|
|通行证 |通行证 |考虑删除 |

## 贡献

开发发生在 `dev` 分支上。 `main` 分支仅保留用于已发布的技能。

1.从`dev`创建功能分支
2. 提交PR至`dev`
3.审核通过后，变更合并至`dev`
4. 准备发布时，维护者通过 GitHub Action 同步 `dev` → `main`

## 相关项目

- [antfu/skills](https://github.com/antfu/skills) - Anthony Fu 为 Vue/Vite/Nuxt 精心策划的agent 技能集合
- [vueuse/vueuse-skills](https://github.com/vueuse/vueuse-skills) - Agent skills for VueUse development
- [onmax/nuxt-skills](https://github.com/onmax/nuxt-skills) - Nuxt 开发的agent 技能

## 许可证

麻省理工学院
