import type { MockArtwork } from '../types'

// 生成自包含的高清几何与渐变矢量图形 Data URI，保证完全离线可用且零网络故障
function createSvgDataUri(bgGrad: string, shapes: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" width="1600" height="1000">
    <defs>
      ${bgGrad}
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="30" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)" />
    ${shapes}
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const MOCK_ARTWORKS: MockArtwork[] = [
  {
    id: 'cyber-sunset',
    title: '赛博落日 · 霓虹幻境',
    author: 'Studio Sora',
    year: '2026',
    ratio: 1.6,
    url: createSvgDataUri(
      `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#311042" />
        <stop offset="100%" stop-color="#ea580c" />
      </linearGradient>`,
      `<circle cx="800" cy="500" r="280" fill="#f97316" opacity="0.85" filter="url(#glow)" />
       <circle cx="800" cy="500" r="190" fill="#fbbf24" opacity="0.9" />
       <path d="M0,750 Q400,680 800,750 T1600,750 L1600,1000 L0,1000 Z" fill="#18052e" />
       <path d="M0,820 Q400,780 800,820 T1600,820 L1600,1000 L0,1000 Z" fill="#090117" />`
    )
  },
  {
    id: 'emerald-aurora',
    title: '极光翡翠 · 晶体阵列',
    author: 'Quantum Art',
    year: '2026',
    ratio: 1.6,
    url: createSvgDataUri(
      `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#022c22" />
        <stop offset="50%" stop-color="#064e3b" />
        <stop offset="100%" stop-color="#0d9488" />
      </linearGradient>`,
      `<polygon points="800,150 1150,750 450,750" fill="#34d399" opacity="0.4" filter="url(#glow)" />
       <polygon points="800,280 1020,700 580,700" fill="#10b981" opacity="0.65" />
       <circle cx="450" cy="350" r="120" fill="#6ee7b7" opacity="0.3" filter="url(#glow)" />
       <circle cx="1150" cy="350" r="100" fill="#a7f3d0" opacity="0.35" filter="url(#glow)" />`
    )
  },
  {
    id: 'deep-space',
    title: '深空星云 · 维面跃迁',
    author: 'Nebula Lab',
    year: '2026',
    ratio: 1.6,
    url: createSvgDataUri(
      `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090d16" />
        <stop offset="40%" stop-color="#1e1b4b" />
        <stop offset="100%" stop-color="#4338ca" />
      </linearGradient>`,
      `<ellipse cx="800" cy="500" rx="450" ry="220" fill="#818cf8" opacity="0.5" transform="rotate(-25 800 500)" filter="url(#glow)" />
       <circle cx="650" cy="450" r="80" fill="#c7d2fe" opacity="0.8" />
       <circle cx="950" cy="550" r="50" fill="#e0e7ff" opacity="0.9" filter="url(#glow)" />`
    )
  },
  {
    id: 'abstract-monolith',
    title: '极简石塔 · 光影切分',
    author: 'Architectura',
    year: '2026',
    ratio: 1.6,
    url: createSvgDataUri(
      `<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18181b" />
        <stop offset="50%" stop-color="#27272a" />
        <stop offset="100%" stop-color="#3f3f46" />
      </linearGradient>`,
      `<rect x="680" y="200" width="240" height="600" rx="16" fill="#f43f5e" opacity="0.85" filter="url(#glow)" />
       <rect x="740" y="260" width="120" height="480" rx="8" fill="#fda4af" opacity="0.9" />`
    )
  }
]
