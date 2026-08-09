# CIP 设计参考

企业形象计划设计包含 50 多个可交付成果、20 种风格、20 个行业。使用 Gemini Nano Banana (Flash/Pro) 生成模型。

## 脚本

|脚本 |目的|
|--------|---------|
| `scripts/cip/search.py` |搜索可交付成果、风格、行业；生成 CIP 简介 |
| `scripts/cip/generate.py` |使用 Gemini (Flash/Pro) 生成 CIP 模型 |
| `scripts/cip/render-html.py` |从 CIP 模型渲染 HTML 演示文稿 |
| `scripts/cip/core.py` | CIP 数据的 BM25 搜索引擎 |

## 命令

### CIP 简介（从这里开始）

```bash
python3 ~/.claude/skills/design/scripts/cip/search.py "tech startup" --cip-brief -b "BrandName"
```

### 搜索域

```bash
# Deliverables
python3 ~/.claude/skills/design/scripts/cip/search.py "business card letterhead" --domain deliverable

# Design styles
python3 ~/.claude/skills/design/scripts/cip/search.py "luxury premium elegant" --domain style

# Industry guidelines
python3 ~/.claude/skills/design/scripts/cip/search.py "hospitality hotel" --domain industry

# Mockup contexts
python3 ~/.claude/skills/design/scripts/cip/search.py "office reception" --domain mockup
```

### 生成模型

```bash
# With logo (RECOMMENDED - uses image editing)
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --deliverable "business card" --industry "consulting"

# Full CIP set with logo
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --industry "consulting" --set

# Pro model for 4K text rendering
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo logo.png --deliverable "business card" --model pro

# Custom deliverables with aspect ratio
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "GreenLeaf" --logo logo.png --industry "organic food" --deliverables "letterhead,packaging,vehicle" --ratio 16:9

# Without logo (AI generates interpretation)
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TechFlow" --deliverable "business card" --no-logo-prompt
```

### 渲染 HTML 演示文稿

```bash
python3 ~/.claude/skills/design/scripts/cip/render-html.py --brand "TopGroup" --industry "consulting" --images /path/to/cip-output
python3 ~/.claude/skills/design/scripts/cip/render-html.py --brand "TopGroup" --industry "consulting" --images ./topgroup-cip --output presentation.html
```

## 型号

- `flash`（默认）：`gemini-2.5-flash-image` - 快速、经济高效
- `pro`：`gemini-3-pro-image-preview` - 质量，4K 文本渲染

## 可交付类别

|类别 |项目 |
|----------|-------|
|核心身份|标志，标志变体|
|文具|名片、信笺、信封、文件夹、笔记本、笔 |
|安全/访问|身份证、挂绳、门禁卡 |
|办公环境 |接待标牌、寻路、会议室标牌、墙面图形 |
|服装| Polo 衫、T 恤、帽子、夹克、围裙 |
|促销|手提袋、礼品盒、USB 驱动器、水瓶、马克杯、雨伞 |
|车辆 |轿车、货车、卡车 |
|数码|社交媒体、电子邮件签名、PowerPoint、文档模板 |
|产品 |包装盒、标签、吊牌、零售展示|
|活动 |贸易展摊位、横幅架、桌布、背景 |

## 设计风格

|风格|颜色 |最适合 |
|-------|--------|----------|
|企业最小 |海军蓝、白色、蓝色|财务、法律、咨询 |
|现代科技|紫色、青色、绿色 |技术、初创公司、SaaS |
|豪华高级|黑色、金色、白色|时尚、珠宝、酒店 |
|温暖有机|棕色、绿色、奶油色|食品、有机、工匠|
|大胆动态|红、橙、黑|体育、娱乐 |

## HTML 演示功能

- 英雄部分包含品牌名称、行业、风格、情绪
- 带有模型图像的可交付卡片
- 描述：概念、目的、规格
- 响应式桌面/移动、深色主题
- 以 base64 形式嵌入的图像（单文件便携式）

## 工作流程

1.生成CIP简介→`scripts/cip/search.py --cip-brief`
2. 生成带有徽标的模型 → `scripts/cip/generate.py --brand --logo --industry --set`
3. 渲染 HTML 演示文稿 → `scripts/cip/render-html.py --brand --industry --images`

**提示：** 如果不存在徽标，请先使用徽标设计（内置）生成一个。

## 详细参考资料

- `references/cip-deliverable-guide.md` - 可交付规格
- `references/cip-style-guide.md` - 设计风格描述
- `references/cip-prompt-engineering.md` - AI生成提示

## 设置

```bash
export GEMINI_API_KEY="your-key"
pip install google-genai pillow
```
