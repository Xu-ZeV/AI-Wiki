# 上游溯源与机制对比：grill-me

## 一、上游仓库信息
- **上游来源**：`https://github.com/RobMitt/grill-me-skill`
- **上游版本**：HEAD commit `31d61d68fc406f8cc2a944b4b10e6f23877720f1`（2025 年）
- **许可证**：MIT License
- **原始定位**：面向 Claude Code 与 Cowork 的苏格拉底式需求与方案盘问 Skill（通过 `AskUserQuestion` 交互）。

## 二、Codex 环境适配说明
在上游原始 `grill-me-skill` 基础上，本仓库针对 OpenAI Codex 桌面环境与三层知识库体系进行了深度适配：
1. **交互工具适配**：
   - 上游依赖 Claude Code 特有的 `AskUserQuestion`；
   - 本适配规范明确在 Codex 的 **Plan Mode** 下优先调用 `request_user_input` 交互卡片，在 **Default Mode** 下优雅降级为清晰的 Markdown 单选题交互。
2. **探索先行原则（Exploration First）**：
   - 强化了先探索代码库的强制要求，杜绝向用户提问本地代码或环境已有确切答案的低效问题。
3. **决策树 5 步收敛法**：
   - 梳理了结构化的 5 阶段演进模型（目标边界 → 架构选型 → 异常边缘 → 交付验证 → 基线收敛）。
4. **快速退出机制（Exit Hatch）**：
   - 补充了容错分支，支持用户随时以默认推荐分支收敛并跳入实施，保持开发灵活性。
