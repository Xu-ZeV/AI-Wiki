---
tags:
  - 日志
---

# VueJS AI Skills 下载

- 操作时间：2026-06-18 03:09:59 +08:00
- 操作模型：GPT-5 Codex
- 操作类型：Ingest, Iteration
- 操作范围：
  - [VueJS AI Skills 原始仓库](../../../../raw/SkillHub/vuejs-ai-skills)
  - [Codex skills 安装目录](../../../../.agents/skills)
  - [skills-lock.json](../../../../skills-lock.json)
- 操作摘要：先执行 `npx skills add vuejs-ai/skills` 安装 8 个 Vue 相关 skills 到 `.agents/skills`，随后按要求将 `https://github.com/vuejs-ai/skills.git` 克隆到 `raw/SkillHub/vuejs-ai-skills`，保留完整源仓库内容。
- 检查目的：确认 `vuejs-ai/skills` 可正常下载，并验证源仓库中的 `skills/` 目录包含 8 个 skill 目录。
- 下次迭代方向：如需纳入 SkillHub wiki，可继续根据 `raw/SkillHub/vuejs-ai-skills/skills/*/SKILL.md` 生成对应中文索引与 skill 文档；若只需要 raw 源文件，可在确认后决定是否清理 `.agents/skills` 与 `skills-lock.json`。
