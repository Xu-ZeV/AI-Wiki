---
title: WorksWheel 组件性能优化记录与 GitHub 主仓库推送
tags:
  - 日志
date: 2026-10-13
time: 08:50:58
model: GPT-5 Codex
type:
  - Iteration
scope:
  - "[[raw/前端-样式/WorksWheel-组件集成提示词|WorksWheel-组件集成提示词]]"
  - "[[wiki/SkillHub/index|SkillHub 中文索引]]"
  - "[[wiki/SkillHub/categories/multi-agent-orchestration|多智能体编排分类]]"
  - "[AI-Wiki 主仓库](../../../../)"
---

# WorksWheel 组件性能优化记录（形变卡顿与滚轮灵敏度）

## 操作时间

2026-10-13 08:50:58 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Iteration

## 操作范围

- [[raw/前端-样式/WorksWheel-组件集成提示词|WorksWheel-组件集成提示词]]（本次追加「性能优化记录（2026-10-13）」章节）
- `D:\Study\works-wheel`（真实集成工程，仅作为测量与验证对象，非本项目文件）

## 操作摘要

将 WorksWheel 组件在实际工程 `D:\Study\works-wheel` 中的一轮性能调优结果，回写进集成提示词文档，作为该组件的优化台账：

1. **滚轮灵敏度**：`WHEEL_UNITS` 由 `900` 调整为 `700`（约三格滚轮切换一件作品）。
2. **卡顿归因**：用 Chromium 合成器 trace 实测，证明 `rAF` 帧间隔与 `Display::DrawAndSwap` 均正常、无超过 40ms 的帧间隔，问题是「环形 ⇄ 鼓面」形变时单帧画面变化量（ink）峰值过大，而非掉帧。
3. **主要修复**：新增形变专用软弹簧 `OMEGA_MORPH = 3.4`，把形变从约 3 帧的大跳摊到约 10 帧；转折点转动仍用 `OMEGA = 10`。
4. **辅助优化**：三层阶梯矩形阴影替代 40px 模糊、`will-change-transform`、样式写入去重、BOW 权重衰减、连续淡出窗口。
5. **实测对照**：开环峰值 25.0 → 18.2（4.2 后饱和），闭环峰值 17.1 → 7.1（-59%），形变耗时 0.7s → 1.1s。
6. 一并记录了无效尝试与复现脚本（`.perfcheck/film.mjs`、`jerk.mjs`、`chart.mjs`、`present.mjs`）及其环境开关。

## 检查目的

- 让文档不仅保存「组件原样」，还保存「组件被真实跑过之后改成了什么样、为什么这么改」，后续复用者不必从零重测。
- 明确区分「形变卡顿」的两个候选解释（掉帧 vs 单帧变化量过大），并留下可复现的证据链。
- 记录环境前提（QEMU 虚拟机、无 GPU、纯软件光栅化、显示节拍 32Hz ↔ 60Hz 漂移），避免把本机表现误当成组件本身的性能上限。

## 下次迭代方向

- 若组件在其他工程再次出现性能问题，优先核对 `OMEGA_MORPH`、阴影实现与淡出窗口这三处的现状，再决定是否重跑 `.perfcheck` 脚本。
- 组件当前共 7 处相对原始提示词的改动（含 `lucide-react` 的 `ArrowUpRight` 替换内联 SVG），文档中的两份代码仍是「原始版本」，如需完全同步可考虑补充 `works-wheel.tsx` 的最新全文或差异说明。

# GitHub 主仓库推送

## 操作时间

2026-10-13 08:59:03 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Iteration

## 操作范围

- [[wiki/SkillHub/index|SkillHub 中文索引]]
- [[wiki/SkillHub/categories/multi-agent-orchestration|多智能体编排分类]]
- [[raw/SkillHub/README|SkillHub 原始资料来源说明]]
- [[raw/前端-样式/WorksWheel-组件集成提示词|WorksWheel-组件集成提示词]]
- [AI-Wiki 主仓库](/)（`raw/`、`wiki/`、`.agents/`、`scripts/`、`log/`）

## 操作摘要

1. 核查本地 `main` 与 `origin/main`：本地领先 1 个提交（`8dd00e2`），工作区另有 490 项未提交改动（456 项删除、13 项修改、21 项新增）。
2. 未提交改动主体是 `raw/SkillHub` 目录重构：原 `raw/SkillHub/.agents/skills/<skill>` 迁至 `raw/SkillHub/categories/<分类>/<skill>`，并新增 `raw/SkillHub/zh/`、`raw/SkillHub/README.md`。
3. 新增 7 个 `agent-team-*` 多智能体 skill（`raw/SkillHub/categories/multi-agent-orchestration`、`.agents/skills/`、`wiki/SkillHub/skills/` 三份副本）与 `scripts/sync-agent-team-skills.ps1`。
4. 新增 `raw/前端-样式/WorksWheel-组件集成提示词.md`，同步更新 `wiki/SkillHub/index.md`、`raw/SkillHub/skills-lock.json` 等文件。
5. 提交前扫描新增文件：未发现密钥/凭据类内容，最大文件约 5 MB（音频素材），无异常二进制。
6. 将全部改动整理为单个提交并推送到 `origin/main`。

## 检查目的

- 确认本地工作区的有效改动全部纳入版本控制并同步到 GitHub。
- 确认两个处于「内容已修改」状态的子模块不会被误提交，也不会因提交而丢失。

## 检查结果

- 本地与远端同步前状态：`main` = `8dd00e2`，`origin/main` = `4d394cc`（领先 1 个提交）。
- 本次提交 `212085b`（整理 SkillHub 为分类目录结构并同步近期技能与文档）：539 个文件、+19723 / -186，其中 456 个文件被识别为纯重命名（`R100`），74 个新增，9 个修改。
- 推送结果：`4d394cc..212085b  main -> main`，推送后本地 `main` 与 `origin/main` 均为 `212085bfc5bd3f299e63b8ccddde716b71976f31`。
- 子模块 `raw/SkillHub/taste-skills`、`raw/SkillHub/vuejs-ai-skills` 仅存在子仓库内部未提交内容，主仓库记录的 gitlink 未变，因此未进入本次提交，推送后仍保持原样。

## 下次迭代方向

- `raw/SkillHub/taste-skills`、`raw/SkillHub/vuejs-ai-skills` 内部仍有未提交改动，需单独确认是否要提交到对应上游仓库。
- 若不希望 `.obsidian/workspace.json` 参与版本管理，可考虑加入 `.gitignore` 并执行 `git rm --cached`。
