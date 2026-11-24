/**
 * verify-all.mjs: 全量工程自动化静态与构建产物校验脚本
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

console.log('🔍 开始全量工程自动化静态与构建产物校验...')

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'index.html',
  '.npmrc',
  '.gitignore',
  'src/main.ts',
  'src/App.vue',
  'src/style.css',
  'src/types/index.ts',
  'src/router/index.ts',
  'src/data/templates.ts',
  'src/data/mockImages.ts',
  'src/components/layout/AppNavbar.vue',
  'src/components/gallery/TemplateCard.vue',
  'src/views/HomeView.vue',
  // 控件一
  'src/views/GlassBoardView.vue',
  'src/composables/useGlassBoard.ts',
  'src/styles/glass-board.css',
  // 控件二
  'src/views/NavCapsuleView.vue',
  'src/components/nav-capsule/NavCapsuleBar.vue',
  'src/composables/useNavCapsule.ts',
  'src/styles/nav-capsule.css',
  // 控件三
  'src/views/GlassSearchView.vue',
  'src/components/glass-search/GlassSearchBar.vue',
  'src/styles/glass-search.css',
  // 控件四
  'src/views/CardHoverHaloView.vue',
  'src/components/card-halo/CardListWithHalo.vue',
  'src/composables/useCardHalo.ts',
  'src/styles/card-hover-halo.css',
  // 404
  'src/views/NotFoundView.vue',
  // 生产构建产物
  'dist/index.html'
]

let passed = true

for (const relPath of requiredFiles) {
  const fullPath = path.join(projectRoot, relPath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ 缺失关键文件: ${relPath}`)
    passed = false
  } else {
    const stat = fs.statSync(fullPath)
    if (stat.size === 0) {
      console.error(`❌ 文件为空: ${relPath}`)
      passed = false
    }
  }
}

// 检查路由配置完整性
const routerFile = path.join(projectRoot, 'src/router/index.ts')
const routerContent = fs.readFileSync(routerFile, 'utf-8')
const expectedRoutes = ['/', '/glass-board', '/nav-capsule', '/glass-search', '/card-hover-halo', '/:pathMatch(.*)*']

for (const r of expectedRoutes) {
  if (!routerContent.includes(r)) {
    console.error(`❌ 路由未包含: ${r}`)
    passed = false
  }
}

// 检查 Vite 端口配置
const viteFile = path.join(projectRoot, 'vite.config.ts')
const viteContent = fs.readFileSync(viteFile, 'utf-8')
if (!viteContent.includes('port: 5180')) {
  console.error('❌ vite.config.ts 未配置独立端口 5180')
  passed = false
}

// 检查构建产物 assets
const distAssets = path.join(projectRoot, 'dist/assets')
if (!fs.existsSync(distAssets) || fs.readdirSync(distAssets).length < 5) {
  console.error('❌ dist/assets 产物不全')
  passed = false
}

if (!passed) {
  console.error('\n🚫 自动化校验未通过，请检查上述错误。')
  process.exit(1)
} else {
  console.log('✅ 全量自动化静态与产物校验通过！所有组件、路由与构建产物齐备。')
  process.exit(0)
}
