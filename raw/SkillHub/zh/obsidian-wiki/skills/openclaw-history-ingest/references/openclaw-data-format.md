# OpenClaw Agent — 数据格式参考

用于在 wiki 摄取期间解析 `~/.openclaw/` 工件的字段级注释。

## 缓存根

`~/.openclaw/` — 下面的所有路径都相对于此根。

## 工作区/MEMORY.md

简单的Markdown。没有必需的 frontmatter — 结构因用户和代理配置而异。通常看起来像：

```markdown
# Memory

## User Preferences
- Prefers concise responses without trailing summaries
- Uses pnpm over npm

## Projects
### my-api
- FastAPI app, deployed on Fly.io
- Uses Postgres via Supabase

## Patterns
- Debugging: always check logs before code changes
```

这是整个 `~/.openclaw/` 树中最有价值的来源。在接触会话日志之前请完整阅读它。

## 工作区/内存/YYYY-MM-DD.md

每日笔记文件。由 OpenClaw 在每天开始时自动生成。格式：

```markdown
# 2026-04-15

## Session: my-api refactor
- Rewrote auth middleware to use JWT instead of sessions
- Decision: keep refresh tokens in httpOnly cookies

## Session: obsidian-wiki
- Added cross-linker skill
- Fixed broken wikilinks in concepts/
```

今天和昨天的文件会自动加载到每个会话中。超过 7 天的文件信号急剧减弱。

## 工作区/DREAMS.md

可选。一些 OpenClaw 配置会在此处生成日终摘要。简单的Markdown。视为 MEMORY.md 的低优先级补充 — 浏览 MEMORY.md 中尚未捕获的新颖见解。

## 代理/\<agentId\>/sessions/sessions.json

会话索引。 JSON 数组：

```json
[
  {
    "id": "abc123",
    "name": "my-api refactor",
    "created_at": "2026-04-15T10:00:00Z",
    "updated_at": "2026-04-15T12:30:00Z",
    "message_count": 47,
    "agent_id": "default"
  }
]
```

用它来：
- 在打开 JSONL 文件之前构建会话清单
- 按 `updated_at` 优先（最新 = 最高信号）
- 将会话 ID 映射到人类可读的名称

## 代理/\<agentId\>/sessions/\<sessionId\>.jsonl

每场会议的成绩单。 JSONL，仅附加。每行一个 JSON 对象：

**用户回合：**
```json
{"role": "user", "content": "How do I debounce a React input?", "timestamp": "2026-04-15T10:01:00Z"}
```

**辅助转弯：**
```json
{"role": "assistant", "content": "Use useCallback + useEffect with a clearTimeout...", "timestamp": "2026-04-15T10:01:02Z"}
```

**工具调用：**
```json
{"role": "tool", "name": "read_file", "input": {"path": "/home/ubuntu/app/src/App.tsx"}, "timestamp": "2026-04-15T10:01:05Z"}
```

**工具结果：**
```json
{"role": "tool_result", "name": "read_file", "content": "...", "timestamp": "2026-04-15T10:01:05Z"}
```

`role` 是主要调度字段。 `timestamp` 是 ISO 8601。`content` 可以是字符串或结构化对象（对于多部分响应）。

## 代理/\<agentId\>/sessions/\<sessionId\>-topic-\<threadId\>.jsonl

Telegram 主题变体 — 与基本会话 JSONL 相同的架构。 `-topic-<threadId>` 后缀标识哪个 Telegram 线程生成了会话。与常规会话文件的解析方式相同。

## openclaw.json

全局配置。很少用于摄取。如果需要，感兴趣的领域：

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "bootstrapMaxChars": 20000
    }
  },
  "skills": {
    "load": {
      "extraDirs": []
    }
  }
}
```

`agents.defaults.workspace` 是 MEMORY.md 和每日笔记（如果非默认）的规范路径。

## Bootstrap文件优先级（供参考）

OpenClaw 在会话开始时按以下顺序加载上下文文件：

|优先|文件|笔记|
|---|---|---|
| 10 | 10 `AGENTS.md` |永远在线的项目说明|
| 20 | `SOUL.md` |代理身份|
| 30| `IDENTITY.md` |代理角色 |
| 40| `USER.md` |用户简介 |
| 50 | 50 `TOOLS.md` |工具配置 |
| 60| `BOOTSTRAP.md` |自定义引导程序 |
| 70 | 70 `MEMORY.md` |长期记忆（工作空间副本）|

所有文件均按每个文件 `bootstrapMaxChars`（默认 20,000 个字符）截断。

## 提取优先级

|来源 |信号|噪音|
|---|---|---|
| `workspace/MEMORY.md` |非常高——策划、耐用|非常低|
| `workspace/memory/YYYY-MM-DD.md`（最近）|高——活跃上下文|低|
| `workspace/DREAMS.md` |中型 — 摘要 |低|
| `workspace/memory/YYYY-MM-DD.md`（旧）|低 — 陈旧 |中等|
| `sessions/*.jsonl` — 助理轮流 |中等|中等|
| `sessions/*.jsonl` — 工具对 |低|高|
| `openclaw.json` |非常低| — |
| `credentials/` |无 — 跳过 | — |
