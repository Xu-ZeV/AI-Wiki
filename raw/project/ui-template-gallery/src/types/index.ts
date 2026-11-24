export interface TemplateItem {
  id: string
  title: string
  titleEn: string
  route: string
  category: string
  description: string
  tags: string[]
  highlights: string[]
  iconSvg: string
}

export interface MockArtwork {
  id: string
  title: string
  author: string
  year: string
  ratio: number // 宽高比，例如 1.6
  url: string // SVG data URI 或图片路径
}
