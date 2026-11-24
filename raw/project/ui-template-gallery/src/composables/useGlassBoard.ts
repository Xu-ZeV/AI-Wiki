import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import type { MockArtwork } from '../types'

export interface BoardTiltState {
  rx: number // 画板外壳 rotateX (-8deg ~ +8deg)
  ry: number // 画板外壳 rotateY (-10deg ~ +10deg)
  s: number // 悬浮轻微放大 (1.000 ~ 1.015)
  shadowX: number // 动态投影水平偏移 (-30px ~ +30px)
  shadowY: number // 动态投影垂直偏移 (20px ~ 60px)
}

export interface SidebarParallaxState {
  rx: number // 侧边栏反向微视差 rotateX (-6deg ~ +6deg)
  ry: number // 侧边栏反向微视差 rotateY (-8deg ~ +8deg)
  z: number // 侧边栏 Z 轴悬浮深度 (12px ~ 20px)
}

/**
 * TileItem: 仅包含 Vue 模板渲染与几何切片布局所必需的静态/状态属性
 * 移除高频 3D 姿态属性（rx, ry, z, s, sheenX, sheenY），彻底消除 60fps 下的 Vue 响应式 Diff 自残
 */
export interface TileItem {
  id: number
  row: number
  col: number
  k: number // 抖动系数 0.82 ~ 1.18
  checker: number // 前后错落 1 或 -1
  offsetLeft: number
  offsetTop: number
  tileWidth: number
  tileHeight: number
  isFlipping: boolean
}

/**
 * 内部非响应式物理姿态状态，仅在 pure JS 数组中被 rAF 快速计算与直接写入 DOM
 */
interface TilePhysicsState {
  id: number
  rx: number
  ry: number
  z: number
  s: number
  sheenX: number
  sheenY: number
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

function hashPseudoRandom(r: number, c: number): number {
  const x = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453
  return x - Math.floor(x)
}

export function useGlassBoard(
  boardRef: Ref<HTMLElement | null>,
  artworks: MockArtwork[]
) {
  const currentIdx = ref(0)
  const currentArtwork = ref<MockArtwork>(artworks[0])
  const tiles = ref<TileItem[]>([])
  const cols = ref(5)
  const rows = ref(5)
  const isTransitioning = ref(false)
  const isImageLoading = ref(false)
  const isImageError = ref(false)

  // 3D 核心响应式状态（外壳固定基态）
  const boardTilt = ref<BoardTiltState>({
    rx: 0,
    ry: 0,
    s: 1,
    shadowX: 0,
    shadowY: 40
  })

  const sidebarParallax = ref<SidebarParallaxState>({
    rx: 0,
    ry: 0,
    z: 16
  })

  const stageWidth = ref(800)
  const stageHeight = ref(500)

  // 动画与插值内部状态（非响应式，极致性能）
  let tilePhysicsList: TilePhysicsState[] = []
  const tileCellMap = new Map<number, HTMLElement>()
  const tileSheenMap = new Map<number, HTMLElement>()

  let rafId: number | null = null
  let resizeObserver: ResizeObserver | null = null
  let mediaQueryList: MediaQueryList | null = null
  let lastPointerTime = performance.now()
  let targetNormX = 0
  let targetNormY = 0
  let targetDistance = 0

  // 减弱动效检测
  const prefersReducedMotion = (): boolean => {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  }

  // 模板 Ref 回调注册函数：具备防御性 null 注销，防止内存泄漏与空指针
  const registerTileCell = (id: number, el: HTMLElement | null) => {
    if (el) {
      tileCellMap.set(id, el)
    } else {
      tileCellMap.delete(id)
    }
  }

  const registerTileSheen = (id: number, el: HTMLElement | null) => {
    if (el) {
      tileSheenMap.set(id, el)
    } else {
      tileSheenMap.delete(id)
    }
  }

  // 重置为静止安全基态（遍历原生 DOM 节点直接复位）
  const resetToStatic = () => {
    targetNormX = 0
    targetNormY = 0
    targetDistance = 0

    boardTilt.value.rx = 0
    boardTilt.value.ry = 0
    boardTilt.value.s = 1
    boardTilt.value.shadowX = 0
    boardTilt.value.shadowY = 40

    sidebarParallax.value.rx = 0
    sidebarParallax.value.ry = 0
    sidebarParallax.value.z = 16

    for (let i = 0; i < tilePhysicsList.length; i++) {
      const p = tilePhysicsList[i]
      p.rx = 0
      p.ry = 0
      p.z = 0
      p.s = 1
      p.sheenX = 0
      p.sheenY = 0

      const cellEl = tileCellMap.get(p.id)
      if (cellEl) {
        cellEl.style.transform = 'translate3d(0, 0, 0px) rotateX(0deg) rotateY(0deg) scale(1)'
      }
      const sheenEl = tileSheenMap.get(p.id)
      if (sheenEl) {
        sheenEl.style.transform = 'translate3d(0px, 0px, 0)'
      }
    }
  }

  // 根据当前画卷宽高比动态计算网格列数与行数（保持 24~30 块面板）
  const calculateGridDimensions = (aspectRatio: number): [number, number] => {
    const validAr = aspectRatio > 0 ? aspectRatio : 16 / 9
    const c = clamp(Math.round(Math.sqrt(26 * validAr)), 3, 7)
    const r = clamp(Math.round(c / validAr), 3, 7)
    return [c, r]
  }

  // 初始化切片数据与对应物理状态
  const initTiles = () => {
    const ar = currentArtwork.value.ratio || 16 / 9
    const [cCount, rCount] = calculateGridDimensions(ar)
    cols.value = cCount
    rows.value = rCount

    const newTiles: TileItem[] = []
    const newPhysics: TilePhysicsState[] = []
    let id = 0

    for (let r = 0; r < rCount; r++) {
      for (let c = 0; c < cCount; c++) {
        const rand = hashPseudoRandom(r, c)
        const k = 0.82 + rand * 0.36 // 弹性阻尼系数
        const checker = (r + c) % 2 === 0 ? 1 : -1 // 棋盘交错纵深

        newTiles.push({
          id,
          row: r,
          col: c,
          k,
          checker,
          offsetLeft: 0,
          offsetTop: 0,
          tileWidth: 0,
          tileHeight: 0,
          isFlipping: false
        })

        newPhysics.push({
          id,
          rx: 0,
          ry: 0,
          z: 0,
          s: 1,
          sheenX: 0,
          sheenY: 0
        })

        id++
      }
    }

    tiles.value = newTiles
    tilePhysicsList = newPhysics

    nextTick(() => {
      measureTiles()
    })
  }

  // 测量切片几何偏移 (offsetLeft / offsetTop) 保证切片拼图绝对对齐
  const measureTiles = () => {
    if (!boardRef.value) return
    const boardEl = boardRef.value
    const gridEl = boardEl.querySelector('.board-grid') as HTMLElement | null
    if (!gridEl) return

    if (gridEl.clientWidth > 0 && gridEl.clientHeight > 0) {
      stageWidth.value = gridEl.clientWidth
      stageHeight.value = gridEl.clientHeight
    }

    const tileDoms = gridEl.querySelectorAll('.tile-cell')
    tileDoms.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      if (tiles.value[index]) {
        tiles.value[index].offsetLeft = htmlEl.offsetLeft
        tiles.value[index].offsetTop = htmlEl.offsetTop
        tiles.value[index].tileWidth = htmlEl.offsetWidth
        tiles.value[index].tileHeight = htmlEl.offsetHeight
      }
    })
  }

  // 指针移动倾斜物理目标计算
  const handlePointerMove = (e: PointerEvent) => {
    lastPointerTime = performance.now()
    if (!boardRef.value || isTransitioning.value) return
    const rect = boardRef.value.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    // 相对画板中心的归一化坐标 (-1.5 ~ +1.5)
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = e.clientX - centerX
    const dy = e.clientY - centerY

    targetNormX = clamp((dx / (rect.width / 2)) * 1.5, -1.5, 1.5)
    targetNormY = clamp((dy / (rect.height / 2)) * 1.5, -1.5, 1.5)
    targetDistance = clamp(Math.sqrt(dx * dx + dy * dy) / (rect.width / 2), 0, 1)

    startAnimationLoop()
  }

  // 指针离开重置目标
  const handlePointerLeave = () => {
    targetNormX = 0
    targetNormY = 0
    targetDistance = 0
    startAnimationLoop()
  }

  // 物理每帧 Lerp 平滑更新与空闲呼吸（纯 JS 数组运算 + 原生 DOM 矩阵直写，耗时 < 0.2ms）
  const updatePhysics = (now: number): boolean => {
    const idleDuration = now - lastPointerTime
    const isIdle = idleDuration > 2500

    let effectiveNormX = targetNormX
    let effectiveNormY = targetNormY
    let effectiveAmt = targetDistance
    let isBreathing = false

    // 空闲呼吸仅在未开启减弱动效时生效
    if (isIdle && !prefersReducedMotion()) {
      isBreathing = true
      const idleBlend = clamp((idleDuration - 2500) / 1000, 0, 1)
      const t = now * 0.001
      const idleNormX = Math.sin(t * 0.8) * 0.35
      const idleNormY = Math.cos(t * 0.6) * 0.25
      const idleAmt = 0.25 + 0.15 * Math.sin(t * 0.5)

      effectiveNormX = lerp(targetNormX, idleNormX, idleBlend)
      effectiveNormY = lerp(targetNormY, idleNormY, idleBlend)
      effectiveAmt = lerp(targetDistance, idleAmt, idleBlend)
    }

    const tileList = tiles.value
    const totalCols = cols.value
    const totalRows = rows.value
    let maxDelta = 0

    for (let i = 0; i < tilePhysicsList.length; i++) {
      const p = tilePhysicsList[i]
      const tile = tileList[i]
      if (!tile) continue

      const lx = totalCols > 1 ? (tile.col / (totalCols - 1) - 0.5) * 2 : 0
      const ly = totalRows > 1 ? (tile.row / (totalRows - 1) - 0.5) * 2 : 0

      const targetRx = clamp((-effectiveNormY * 4.2 - ly * 3.2) * tile.k, -14, 14)
      const targetRy = clamp((effectiveNormX * 5.2 + lx * 3.8) * tile.k, -16, 16)
      const targetZ = tile.checker * (3 + 12 * effectiveAmt) * tile.k
      const targetS = 1 + 0.006 * effectiveAmt
      const targetSheenX = clamp(effectiveNormX * 8 + lx * 4, -14, 14)
      const targetSheenY = clamp(effectiveNormY * 8 + ly * 4, -14, 14)

      const prevRx = p.rx
      const prevRy = p.ry
      const prevZ = p.z

      p.rx = lerp(p.rx, targetRx, 0.1)
      p.ry = lerp(p.ry, targetRy, 0.1)
      p.z = lerp(p.z, targetZ, 0.1)
      p.s = lerp(p.s, targetS, 0.1)
      p.sheenX = lerp(p.sheenX, targetSheenX, 0.1)
      p.sheenY = lerp(p.sheenY, targetSheenY, 0.1)

      const delta = Math.abs(p.rx - prevRx) + Math.abs(p.ry - prevRy) + Math.abs(p.z - prevZ)
      if (delta > maxDelta) maxDelta = delta

      // 原生 DOM style.transform 直写（带空值防护）
      const cellEl = tileCellMap.get(p.id)
      if (cellEl) {
        cellEl.style.transform = `translate3d(0, 0, ${p.z.toFixed(2)}px) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) scale(${p.s.toFixed(3)})`
      }

      const sheenEl = tileSheenMap.get(p.id)
      if (sheenEl) {
        sheenEl.style.transform = `translate3d(${p.sheenX.toFixed(1)}px, ${p.sheenY.toFixed(1)}px, 0)`
      }
    }

    // 若正在呼吸或仍有明显收敛动量，保持动画帧循环；否则优雅休眠以节省 CPU
    return isBreathing || maxDelta > 0.005 || idleDuration < 2500
  }

  // 动画循环（按需调度）
  const animate = (now: number) => {
    const keepRunning = updatePhysics(now)
    if (keepRunning) {
      rafId = requestAnimationFrame(animate)
    } else {
      rafId = null
    }
  }

  const startAnimationLoop = () => {
    if (rafId === null) {
      rafId = requestAnimationFrame(animate)
    }
  }

  const stopAnimationLoop = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  const handleMotionPreferenceChange = () => {
    if (prefersReducedMotion()) {
      resetToStatic()
      stopAnimationLoop()
    } else {
      startAnimationLoop()
    }
  }

  // 预加载图片并处理骨架态与容错
  const loadArtworkImage = (artwork: MockArtwork) => {
    isImageLoading.value = true
    isImageError.value = false

    const img = new Image()
    img.onload = () => {
      isImageLoading.value = false
      isImageError.value = false
    }
    img.onerror = () => {
      isImageLoading.value = false
      isImageError.value = true
    }
    img.src = artwork.url
  }

  // 切换到下一张图（波浪翻转动效）
  const nextArtwork = () => {
    if (isTransitioning.value || artworks.length <= 1) return
    isTransitioning.value = true

    // 若减弱动效开启，直接切换不跑波浪动画
    if (prefersReducedMotion()) {
      currentIdx.value = (currentIdx.value + 1) % artworks.length
      currentArtwork.value = artworks[currentIdx.value]
      loadArtworkImage(currentArtwork.value)
      isTransitioning.value = false
      return
    }

    // 触发错峰翻出
    tiles.value.forEach(tile => {
      const delay = (tile.row + tile.col) * 16 // 错峰动画
      setTimeout(() => {
        tile.isFlipping = true
      }, delay)
    })

    // 切换数据
    setTimeout(() => {
      currentIdx.value = (currentIdx.value + 1) % artworks.length
      currentArtwork.value = artworks[currentIdx.value]
      loadArtworkImage(currentArtwork.value)

      // 翻入
      tiles.value.forEach(tile => {
        const delay = (tile.row + tile.col) * 16
        setTimeout(() => {
          tile.isFlipping = false
        }, delay)
      })

      setTimeout(() => {
        isTransitioning.value = false
      }, 500)
    }, 400)
  }

  onMounted(() => {
    initTiles()
    loadArtworkImage(currentArtwork.value)

    nextTick(() => {
      if (boardRef.value) {
        const gridEl = boardRef.value.querySelector('.board-grid') as HTMLElement | null
        if (gridEl && typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const { width, height } = entry.contentRect
              if (width > 0 && height > 0) {
                stageWidth.value = Math.round(width)
                stageHeight.value = Math.round(height)
              }
            }
            measureTiles()
          })
          resizeObserver.observe(gridEl)
        }
        measureTiles()
      }
    })

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('pointerleave', handlePointerLeave)

    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', handleMotionPreferenceChange)
      } else if ((mediaQueryList as any).addListener) {
        ;(mediaQueryList as any).addListener(handleMotionPreferenceChange)
      }
    }

    startAnimationLoop()
  })

  onUnmounted(() => {
    stopAnimationLoop()
    resetToStatic()

    // 彻底释放全部缓存的 DOM 节点引用，切断闭包引用，杜绝游离 DOM 内存泄漏
    tileCellMap.clear()
    tileSheenMap.clear()
    tilePhysicsList = []

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }

    window.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerleave', handlePointerLeave)

    if (mediaQueryList) {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleMotionPreferenceChange)
      } else if ((mediaQueryList as any).removeListener) {
        ;(mediaQueryList as any).removeListener(handleMotionPreferenceChange)
      }
      mediaQueryList = null
    }
  })

  return {
    currentArtwork,
    currentIdx,
    tiles,
    cols,
    rows,
    isTransitioning,
    isImageLoading,
    isImageError,
    boardTilt,
    sidebarParallax,
    stageWidth,
    stageHeight,
    registerTileCell,
    registerTileSheen,
    handlePointerMove,
    handlePointerLeave,
    resetToStatic,
    nextArtwork
  }
}
