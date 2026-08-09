# 图标设计参考

使用 Gemini 3.1 Pro Preview 生成由 AI 驱动的 SVG 图标。 15个款式，12个类别，多尺寸导出。

## 脚本

|脚本 |目的|
|--------|---------|
| `scripts/icon/generate.py` |使用 Gemini 3.1 Pro Preview 生成 SVG 图标 |

## 命令

### 生成单个图标

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "settings gear" --style outlined
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "shopping cart" --style filled --color "#6366F1"
python3 ~/.claude/skills/design/scripts/icon/generate.py --name "dashboard" --category navigation --style duotone
```

### 生成批次变化

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "cloud upload" --batch 4 --output-dir ./icons
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "notification bell" --batch 6 --style outlined --output-dir ./icons
```

### 生成多个尺寸

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "user profile" --sizes "16,24,32,48" --output-dir ./icons
```

### 列表样式/类别

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --list-styles
python3 ~/.claude/skills/design/scripts/icon/generate.py --list-categories
```

## CLI 选项

|选项 |描述 |默认 |
|--------|-------------|---------|
| `--prompt, -p` |图标说明|必填|
| `--name, -n` |图标名称（文件名）| - |
| `--style, -s` |图标样式（15 个选项）| - |
| `--category, -c` |上下文的图标类别| - |
| `--color` |主十六进制颜色 |当前颜色 |
| `--size` |显示尺寸（以 px 为单位）| 24 |
| `--viewbox` | SVG 视图框大小 | 24 |
| `--output, -o` |输出文件路径 |汽车 |
| `--output-dir` |输出目录（批处理） | ./icons |
| `--batch` |变化数量 | - |
| `--sizes` |逗号分隔的尺寸 | - |

## 可用样式

|风格|行程|填写 |最适合 |
|-------|--------|------|----------|
|概述| 2 像素 |无 | UI 界面、网络应用程序 |
|已满 | 0 |固体|移动应用程序、导航栏 |
|双色调 | 0 |双 |营销、登陆页面 |
|薄| 1-1.5 像素 |无 |奢侈品牌，社论|
|大胆| 3 像素 |无 |标题、英雄部分 |
|圆形| 2 像素 |无 |友好的应用程序，健康|
|锐利| 2 像素 |无 |科技、金融科技、企业 |
|平 | 0 |固体|谷歌风格的材料设计|
|渐变| 0 |渐变|现代品牌、SaaS |
|玻璃晶态 | 1 像素 |半|现代UI，覆盖 |
|像素| 0 |固体|游戏，复古|
|手绘|变化 |无 |工匠，创意 |
|等距| 1-2 像素 |部分 |技术文档、信息图表 |
|字形| 0 |固体|系统 UI，紧凑 |
|动画就绪 | 2 像素 |变化 |交互式 UI、入门 |

## 图标类别

|类别 |图标|
|----------|-------|
|导航 |箭头、菜单、主页、V 形|
|行动|编辑、删除、保存、下载、上传 |
|通讯 |电子邮件、聊天、电话、通知 |
|媒体|播放、暂停、音量、相机|
|文件|文档、文件夹、存档、云 |
|用户 |个人、群组、个人资料、设置 |
|商业|购物车、包、钱包、信用卡 |
|数据|图表、图形、分析、仪表板 |
|发展|代码、终端、bug、git、API |
|社会|心形、星星、书签、奖杯|
|天气 |太阳、月亮、云、雨|
|地图 |针、位置、指南针、地球仪|

## SVG 最佳实践

- **ViewBox**：使用 `0 0 24 24`（标准）或 `0 0 16 16`（紧凑型）
- **颜色**：使用 `currentColor` 进行 CSS 继承，避免硬编码颜色
- **辅助功能**：始终包含 `<title>` 元素
- **优化**：最小路径节点，无嵌入字体或光栅图像
- **尺寸**：设计为 24 像素，测试为 16 像素和 48 像素以确保清晰度
- **描边**：使用 `stroke-linecap="round"` 和 `stroke-linejoin="round"` 绘制轮廓样式

## 型号

- **gemini-3.1-pro-preview**：最佳思维、token效率、事实一致性
- 纯文本输出（SVG 是 XML 文本）——无需图像生成 API
- 支持结构化输出以实现一致的 SVG 格式

## 工作流程

1. 描述图标 → `--prompt "settings gear"`
2.选择款式→`--style outlined`
3.生成→脚本输出.svg文件
4. 可选择批次 → `--batch 4` 进行变化
5.多尺寸导出→`--sizes "16,24,32,48"`

## 设置

```bash
export GEMINI_API_KEY="your-key"
pip install google-genai
```
