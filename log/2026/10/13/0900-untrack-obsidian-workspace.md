---
title: 停止跟踪 Obsidian 工作区状态文件
tags:
  - 日志
date: 2026-10-13
time: 09:07:00
model: GPT-5 Codex
type:
  - Iteration
scope:
  - "[[agent|Agent 行为准则]]"
  - "[.gitignore](../../../../.gitignore)"
  - "[.obsidian/workspace.json](../../../../.obsidian/workspace.json)"
  - "[AI-Wiki 主仓库](../../../../)"
---

# 停止跟踪 Obsidian 工作区状态文件

## 操作时间

2026-10-13 09:07:00 +08:00

## 操作模型

GPT-5 Codex

## 操作类型

- Iteration

## 操作范围

- [.gitignore](../../../../.gitignore)（新增忽略规则）
- [.obsidian/workspace.json](../../../../.obsidian/workspace.json)（执行 `git rm --cached`，文件仍保留在本地磁盘）
- [AI-Wiki 主仓库](../../../../)（提交并推送到 `origin/main`）

## 操作摘要

1. `git ls-files .obsidian` 显示当前受跟踪的 Obsidian 文件为 `app.json`、`appearance.json`、`core-plugins.json`、`graph.json`、`workspace.json`。
2. 在 `.gitignore` 中新增 `# Obsidian 工作区状态` 段落并加入 `.obsidian/workspace.json`。
3. 执行 `git rm --cached -- .obsidian/workspace.json`，仅从索引移除，本地文件未删除。
4. 提交该改动并推送到 `origin/main`。

## 检查目的

- 确认 `workspace.json` 这类每次开关笔记都会变化的工作区状态文件不再产生版本噪声。
- 确认其余 4 个 Obsidian 配置文件（`app.json`、`appearance.json`、`core-plugins.json`、`graph.json`）仍处于跟踪状态且未被误改。

## 检查结果

- 提交前工作区仅 `.gitignore`、`.obsidian/workspace.json` 与两个子模块的内部改动为差异项，其中子模块内容不进入本次提交。
- `workspace.json` 从索引移除后不再出现在 `git status` 中，后续开关笔记不再产生 diff。

## 下次迭代方向

- 若在移动端使用 Obsidian，可一并忽略 `.obsidian/workspace-mobile.json`。
- 如需同步工作区布局，可改为维护一份手工挑选的 `.obsidian/workspace.example.json` 作为示例文件。
