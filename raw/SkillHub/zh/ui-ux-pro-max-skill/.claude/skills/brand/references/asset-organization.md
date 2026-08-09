# 资产组织指南

在结构化、可搜索的系统中组织营销资产的指南。

## 目录结构

```
project-root/
├── .assets/                          # Git-tracked metadata
│   ├── manifest.json                 # Central asset registry
│   ├── tags.json                     # Tagging system
│   ├── versions/                     # Version history
│   │   └── {asset-id}/
│   │       └── v{n}.json
│   └── metadata/                     # Type-specific metadata
│       ├── designs.json
│       ├── banners.json
│       ├── logos.json
│       └── videos.json
├── assets/                           # Raw files
│   ├── designs/
│   │   ├── campaigns/                # Campaign-specific designs
│   │   ├── web/                      # Website graphics
│   │   └── print/                    # Print materials
│   ├── banners/
│   │   ├── social-media/             # Platform banners
│   │   ├── email-headers/            # Email template headers
│   │   └── landing-pages/            # Hero/section images
│   ├── logos/
│   │   ├── full-horizontal/          # Full logo with wordmark
│   │   ├── icon-only/                # Symbol only
│   │   ├── monochrome/               # Single color versions
│   │   └── variations/               # Special versions
│   ├── videos/
│   │   ├── ads/                      # Promotional videos
│   │   ├── tutorials/                # How-to content
│   │   └── testimonials/             # Customer videos
│   ├── infographics/                 # Data visualizations
│   └── generated/                    # AI-generated assets
│       └── {YYYYMMDD}/               # Date-organized
```

## 命名约定

### 格式
```
{type}_{campaign}_{description}_{timestamp}_{variant}.{ext}
```

### 组件
|组件|格式|必填|示例 |
|-----------|--------|----------|----------|
|类型 |小写|是的 |横幅、标志、设计、视频|
|活动|烤肉串盒 |是* |克劳德发布，第一季度促销，常青 |
|描述 |烤肉串盒 |是的 |英雄形象、电子邮件标题 |
|时间戳|年月日 |是的 | 20251209 | 20251209
|变体|烤肉串盒 |没有 |暗模式，1x1，移动 |

*对非活动资产使用“常青”

### 示例
```
banner_claude-launch_hero-image_20251209_16-9.png
logo_brand-refresh_horizontal-full-color_20251209.svg
design_holiday-campaign_email-hero_20251209_dark-mode.psd
video_product-demo_feature-walkthrough_20251209.mp4
infographic_evergreen_pricing-comparison_20251209.png
```

## 元数据架构

### 资产条目（manifest.json）
```json
{
  "id": "uuid-v4",
  "name": "Campaign Hero Banner",
  "type": "banner",
  "path": "assets/banners/landing-pages/banner_claude-launch_hero-image_20251209.png",
  "dimensions": { "width": 1920, "height": 1080 },
  "fileSize": 245760,
  "mimeType": "image/png",
  "tags": ["campaign", "hero", "launch"],
  "status": "approved",
  "source": {
    "model": "imagen-4",
    "prompt": "...",
    "createdAt": "2025-12-09T10:30:00Z"
  },
  "version": 2,
  "createdBy": "agent:content-creator",
  "approvedBy": "user:john",
  "approvedAt": "2025-12-09T14:00:00Z"
}
```

### 版本条目 (versions/{id}/v{n}.json)
```json
{
  "version": 2,
  "previousVersion": 1,
  "path": "assets/banners/landing-pages/banner_claude-launch_hero-image_20251209_v2.png",
  "changes": "Updated CTA button color to match brand refresh",
  "createdAt": "2025-12-09T12:00:00Z",
  "createdBy": "agent:ui-designer"
}
```

## 标签系统

### 标准标签
|类别 |价值观 |
|----------|--------|
|状态 |草稿、审查、批准、存档|
|平台| Instagram、Twitter、linkedin、facebook、youtube、电子邮件、网络 |
|内容类型 | promotional, educational, brand, product, testimonial |
|格式| 1x1、4x5、9x16、16x9、故事、卷轴、横幅 |
|来源 | imagen-4、veo-3、用户上传、canva、figma |

### 标签使用
- 每个资产应具有：状态+平台+内容类型
- 可选：格式、来源、活动

## 文件组织最佳实践

1. **每个变体一个文件** - 不要将深色/浅色组合在一个文件中
2. **源文件分开** - 保持 .psd/.fig 结构相同
3. **人工智能资产带时间戳** - 按生成日期自动组织
4. **存档不要删除** - 移动到带有日期前缀的 `archived/`
5. **外部大文件** - 视频 > 100MB 使用云存储链接

## 搜索模式

### 按类型
```bash
# Find all banners
ls assets/banners/**/*
```

### 按活动
```bash
# Find all assets for specific campaign
grep -l "claude-launch" .assets/manifest.json
```

### By Status
```bash
# Find approved assets only
jq '.assets[] | select(.status == "approved")' .assets/manifest.json
```

## 清理工作流程

1.在新资产上运行`extract-colors.cjs`
2. 根据品牌指南进行验证
3. 使用新条目更新manifest.json
4. 适当标记
5. 删除重复/过时的版本
