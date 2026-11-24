import type { TemplateItem } from '../types'

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'glass-board',
    title: '玻璃倾斜画板',
    titleEn: 'Glass Panel Tilt Board',
    route: '/glass-board',
    category: '3D 动效 / 硬件加速',
    description: '几十块精巧玻璃面板拼成一幅大图，整块画板随鼠标指针 3D 视差倾斜，相邻面板棋盘格景深错落；点击侧边空白区域无缝切图。',
    tags: ['GPU 合成层', '3D 视差', '切片拼图', '60 FPS'],
    highlights: [
      '严格只修改 transform (translate3d/rotateX/rotateY/scale)',
      '零 backdrop-filter 损耗，渐变与 inset 阴影伪造高质感玻璃',
      'offsetLeft/offsetTop 抵消算法精准拼图',
      'requestAnimationFrame 批量调度单帧渲染'
    ],
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>`
  },
  {
    id: 'nav-capsule',
    title: '南瓜助手胶囊导航栏',
    titleEn: 'Capsule Navigation Bar & Items',
    route: '/nav-capsule',
    category: '导航控件 / 物理动效',
    description: '极富生产质感的全自适应胶囊导航栏，具备物理惯性弹性 Glider 滑块、360° 微弹性顺时针旋转微交互及吸顶折叠悬停互斥让位机制。',
    tags: ['弹性磁吸滑块', '360° 弹性微动效', '吸顶正圆折叠', '悬停互斥让位'],
    highlights: [
      '绝对居中算法，解决汉字字数不一致导致视觉重心偏移',
      'Glider 物理惯性质感平滑缓动阻尼 (cubic-bezier)',
      '页面滚动触发展开/折叠形态自适应切换',
      'CSS :hover 与互斥让位机制保证优雅展开'
    ],
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`
  },
  {
    id: 'glass-search',
    title: '南瓜助手磨砂流光搜索框',
    titleEn: 'Glassmorphism Ambient Beam Search Bar',
    route: '/glass-search',
    category: '表单输入 / 氛围光晕',
    description: '半透明磨砂质感胶囊药丸搜索框，双层径向渐变底边呼吸扫光动效，解耦 CSS 设计令牌架构，配合正圆触控清空按钮联动与输入防抖。',
    tags: ['底边环境流光', '双层径向渐变', '设计令牌解耦', '防抖联动清空'],
    highlights: [
      '44px 黄金触控高度与 9999px 全胶囊药丸造型',
      '底部 ::before 伪元素双层径向渐变平滑呼吸扫光',
      '常态/悬停/聚焦三档扫光频率智能加速',
      '--gs-* CSS 变量解耦设计令牌，一键换肤'
    ],
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`
  },
  {
    id: 'card-hover-halo',
    title: '列表卡片悬停跟随光晕',
    titleEn: 'Card Hover Follower Halo',
    route: '/card-hover-halo',
    category: '列表交互 / 物理阻尼',
    description: '容器单实例高斯弥散无界暖橙光晕，Damped Lerp 物理滞后滑行，跟随光晕伴随鼠标在卡片之间与卡片内部进行丝滑微视差立体追踪。',
    tags: ['高斯弥散无界化', 'Damped Lerp 阻尼', '微视差悬浮追踪', '单实例 DOM 共享'],
    highlights: [
      '单实例容器共享光晕节点，零多余 DOM 负担',
      'filter: blur(18px) 彻底消隐生硬边缘',
      '物理惯性阻尼系数 0.11 赋予高级滞后追随质感',
      '卡片内微视差位移追踪 ((mouseX - centerX) * 0.05)'
    ],
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`
  }
]
