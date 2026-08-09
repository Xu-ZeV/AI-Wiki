# Hermes Agent — 数据格式参考

用于在 wiki 摄取期间解析 `~/.hermes/` 工件的字段级注释。

## 缓存根

`~/.hermes/` — 或 `$HERMES_HOME` 用于非默认配置文件。下面的所有路径都是相对于这个根的。

## 回忆/

每个文件都是代理保存的一个离散内存。

### Markdown 记忆 (`*.md`)

可选的 YAML frontmatter，然后是散文正文：

```markdown
---
tags: [python, async, debugging]
created_at: 2026-03-10T14:22:00Z
project: my-api
---
When using `asyncio.gather` with return_exceptions=True, failed tasks return the exception
object rather than raising — check `isinstance(result, Exception)` on each item.
```

感兴趣的领域：
- `tags` — 直接映射到 wiki 标签；标准化为 kebab-case
- `created_at` — 用于出处/期刊类别决策
- `project` — 设置后路由至 `projects/<project>/`

### JSON 内存 (`*.json`)

```json
{
  "content": "...",
  "created_at": "2026-03-10T14:22:00Z",
  "tags": ["python", "async"],
  "project": "my-api",
  "source": "session:abc123"
}
```

与 Markdown 变体相同的字段语义。 `source` 链接回原始会话。

## 会话/

仅当启用会话日志记录 (`config.yaml: logging.sessions: true`) 时才存在。

### 目录布局

```
sessions/
└── 2026-03-10/
    └── abc123.jsonl
```

### JSONL 行模式

**用户/助理轮流：**

```json
{"role": "user",      "content": "How do I debounce a React input?"}
{"role": "assistant", "content": "Use useCallback + useEffect with a setTimeout..."}
```

**工具使用：**

```json
{
  "type": "tool_use",
  "id": "tu_abc",
  "name": "read_file",
  "input": {"path": "/home/ubuntu/project/src/App.tsx"}
}
```

**工具结果：**

```json
{
  "type": "tool_result",
  "tool_use_id": "tu_abc",
  "content": "..."
}
```

**会话元数据（第一行）：**

```json
{
  "type": "session_meta",
  "id": "abc123",
  "cwd": "/home/ubuntu/projects/my-app",
  "model": "claude-sonnet-4-6",
  "started_at": "2026-03-10T14:00:00Z"
}
```

`cwd` 是最可靠的项目推理信号——用它来将知识路由到正确的 `projects/<name>/` 页面。

## 配置.yaml

很少用于摄取。如果需要，有用的字段：

```yaml
model: claude-sonnet-4-6
hermes_home: ~/.hermes        # resolved path, respects $HERMES_HOME
logging:
  sessions: true              # whether session JSONL files are written
  memories: true              # whether memories are persisted
```

## .hub/

技能中心状态。 **在摄取过程中完全跳过。** 包含：

- `lock.json` — 已安装的技能清单（不是用户知识）
- `audit.log` — 安装/更新历史记录
- `quarantine/` — 标记的技能等待审核

## 提取优先级

|来源 |信号|噪音|
|---|---|---|
| `memories/*.md` |高——策划、稳定|低|
| `memories/*.json` |高—结构化|低|
| `sessions/**/*.jsonl` — 助理轮流 |中等|中等|
| `sessions/**/*.jsonl` — 工具对 |低|高|
| `config.yaml` |非常低| — |
| `.hub/` |无 | — |
