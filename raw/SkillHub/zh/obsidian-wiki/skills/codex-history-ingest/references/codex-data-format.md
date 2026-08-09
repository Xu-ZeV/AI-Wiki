# Codex 数据格式 — 详细参考

本参考文献描述了法典本地历史摄取的实际、观察到的结构。

## 根布局

`~/.codex/`通常包含：

- `sessions/YYYY/MM/DD/rollout-*.jsonl` — 主要结构化会话日志
- `archived_sessions/` — 归档部署
- `session_index.jsonl` — 会话 ID/名称/更新索引
- `history.jsonl` — 转录历史记录（取决于配置）
- `config.toml` — 历史持久性控制

## 会话索引

`~/.codex/session_index.jsonl` 条目每行一个 JSON 对象，通常：

```json
{"id":"<thread-id>","thread_name":"<title>","updated_at":"<timestamp>"}
```

使用它作为追加/完整模式增量的库存主干。

## 推出 JSONL

`rollout-*.jsonl` 文件是带有信封字段的事件流：

```json
{
  "timestamp": "2026-04-12T09:40:02.337Z",
  "type": "session_meta|turn_context|event_msg|response_item",
  "payload": { "...": "..." }
}
```

常见的`type`值：

- `session_meta` — 运行元数据（id、cwd、模型/提供商等）
- `turn_context` — 回合范围上下文信封
- `event_msg` — 运行时事件（任务生命周期、token/记帐、工具调用标记）
- `response_item` — 模型响应项（消息、工具调用、推理块）

### 典型的有效负载子类型

观察到的例子包括：

- `event_msg.payload.type`: `task_started`, `user_message`, `agent_message`, `mcp_tool_call_end`, `exec_command_end`, `token_count`
- `response_item.payload.type`: `message`, `function_call`, `function_call_output`, `reasoning`

## 提取策略

### 保留

- 来自用户消息记录的用户意图
- 来自助理消息记录的助理结论/决定
- 对可重用知识进行编码的高信号工具输出

### 跳过

- 纯遥测（`token_count`，低级管道事件）
- 内部推理痕迹，除非用户明确要求保留它们
- 冗长的执行转储，没有持久的洞察力

## 隐私说明

部署可能包含敏感数据：

- 注入指令层
- 工具输入/输出
- 命令输出中的潜在秘密

始终编辑秘密并进行总结，而不是复制原始记录内容。

## 配置交互

`~/.codex/config.toml` 影响摄取完整性的密钥：

- `history.persistence = "save-all" | "none"`
- `history.max_bytes = <int>`（截断/压实帽）

`codex exec --ephemeral` 运行可能不会保留转出文件。
