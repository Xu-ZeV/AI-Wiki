# uipro-cli

用于为 AI 编码助手安装 UI/UX Pro Max 技能的 CLI。

## 安装

```bash
npm install -g uipro-cli
```

## 用法

```bash
# Install for specific AI assistant
uipro init --ai claude      # Claude Code
uipro init --ai cursor      # Cursor
uipro init --ai windsurf    # Windsurf
uipro init --ai antigravity # Antigravity
uipro init --ai copilot     # GitHub Copilot
uipro init --ai kiro        # Kiro
uipro init --ai codex       # Codex (Skills)
uipro init --ai roocode     # Roo Code
uipro init --ai qoder       # Qoder
uipro init --ai gemini      # Gemini CLI
uipro init --ai trae        # Trae
uipro init --ai opencode    # OpenCode
uipro init --ai continue    # Continue (Skills)
uipro init --ai all         # All assistants

# Options
uipro init --offline        # Skip GitHub download, use bundled assets only
uipro init --force          # Overwrite existing files

# Other commands
uipro versions              # List available versions
uipro update                # Update to latest version
```

## 它是如何工作的

默认情况下，`uipro init` 尝试从 GitHub 下载最新版本，以确保您获得最新版本。如果下载失败（网络错误、速率限制），它会自动回退到 CLI 包中包含的捆绑资源。

使用 `--offline` 跳过 GitHub 下载并直接使用捆绑资源。

## 发展

```bash
# Install dependencies
bun install

# Run locally
bun run src/index.ts --help

# Build
bun run build

# Link for local testing
bun link
```

## 许可证

CC-BY-NC-4.0
