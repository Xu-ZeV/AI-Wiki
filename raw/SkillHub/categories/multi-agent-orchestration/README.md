# agent-team：Codex 原生子代理多模型协作套件

## 这是什么

这是 AI-Wiki 自己维护的多代理团队协作 skill 套件，面向 **Codex 原生子代理**（`spawn_agent` / `send_input` / `wait_agent` / `close_agent`）设计。核心特征只有两条：

1. **主代理编排，子代理执行**：主代理负责分解、派发、独立验证与最终裁决，不把子代理的自述当结论。
2. **每个子代理可以使用不同模型**：实现、评审、视觉核验可以由不同模型承担，实现者与评审者必须异构。

套件由一个主入口 skill 和六个环节 skill 组成，统一使用自有命名 `agent-team-*`，不沿用任何上游框架的技能名。

## 本机可用模型

| 模型标识（`spawn_agent` 的 `model`） | 显示名 | 上下文 | 支持的 `reasoning_effort` |
| --- | --- | --- | --- |
| `DeepSeek-V4.1-Flash` | DeepSeek-V4.1-Flash | 256K | `low` / `medium` / `high` / `xhigh` |
| `ccs-glm-5-3-flash/GLM-5.3-Flash` | GLM-5.3-Flash | 1M | `low` / `high` / `max` |

异构评审靠的是在 `spawn_agent` 里显式传 `model`：实现者与评审者必须换模型。只给同一模型换 `reasoning_effort` 属于降级方案，不算异构。

## 文件结构

每个 skill 占一个目录，入口是 `SKILL.md`，可选 `references/` 存放中文评审量规。

| 目录 | 角色 | 中文名 |
| --- | --- | --- |
| `agent-team-orchestration/` | **主入口**：四阶段执行闭环 | 编排执行闭环 |
| `agent-team-brainstorm/` | 头脑风暴结论 → 设计门禁的桥接 | 头脑风暴桥接 |
| `agent-team-design-gate/` | 设计文档定稿前的五角色门禁 | 设计评审门禁 |
| `agent-team-plan-gate/` | 计划呈报人类前的三角色对抗门禁 | 计划评审门禁 |
| `agent-team-external-cli/` | 跨模型委托、模型路由与升级链 | 跨模型委托 |
| `agent-team-visual-review/` | Playwright 截图视觉核验 | 视觉复核 |
| `agent-team-handoff/` | 零上下文交接文档 | 零上下文交接 |

## 典型流程

```text
头脑风暴 → agent-team-brainstorm
        → agent-team-design-gate（五角色全票 APPROVED）
        → agent-team-plan-gate（三角色全票 PASS）
        → agent-team-orchestration（实现 → 编排者独立验证 → 对抗评审 → 提交）
        → agent-team-external-cli（决定实现者与评审者分别用哪个模型）
        → agent-team-visual-review（界面类改动截图核验）
        → agent-team-handoff（会话结束或交接给全新子代理）
```

日常使用主要落在两个入口：

- **做一件事**：`agent-team-orchestration`。
- **换会话继续做**：`agent-team-handoff`。

## 与仓库其他位置的关系

- 项目内可加载副本：`.agents/skills/agent-team-*/SKILL.md`（Codex 实际读取的位置，点开头目录不在 Obsidian 索引内）。
- 上游英文原件归档：`raw/SkillHub/zh/metaswarm/original-en/`，仅作溯源，不参与导航，也不在 Codex 中加载。
- 上游框架专有 skill 的中文全译稿与归纳稿：`raw/SkillHub/zh/metaswarm/`，同样只作原始资料留存。
- wiki 入口：`wiki/SkillHub/categories/multi-agent-orchestration.md`。

## 许可

本套件从采用 MIT 许可的公开开源编排项目抽取协作内核后重写，保留 MIT 许可溯源；具体英文原件与对应关系见 `raw/SkillHub/zh/metaswarm/original-en/`。
