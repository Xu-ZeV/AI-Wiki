import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useCardHalo(containerRef: Ref<HTMLElement | null>) {
  const haloStyle = ref({
    transform: 'translate3d(0, 0, 0)',
    width: '0px',
    height: '0px',
    borderRadius: '16px',
    opacity: 0
  })

  const DAMPING = 0.11
  const OPACITY_DAMPING = 0.15
  const OFFSET = 14 // 外扩 14px 弥散透出

  let currX = 0
  let currY = 0
  let currW = 0
  let currH = 0
  let currRadius = 16
  let currOpacity = 0

  let targetX = 0
  let targetY = 0
  let targetW = 0
  let targetH = 0
  let targetRadius = 16
  let targetOpacity = 0

  let rafId: number | null = null

  const isReducedMotion = () => {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const stepAnimation = () => {
    const dx = targetX - currX
    const dy = targetY - currY
    const dw = targetW - currW
    const dh = targetH - currH
    const dr = targetRadius - currRadius
    const dop = targetOpacity - currOpacity

    const isMoving =
      Math.abs(dx) > 0.08 ||
      Math.abs(dy) > 0.08 ||
      Math.abs(dw) > 0.08 ||
      Math.abs(dh) > 0.08 ||
      Math.abs(dop) > 0.003

    if (isMoving) {
      currX += dx * DAMPING
      currY += dy * DAMPING
      currW += dw * DAMPING
      currH += dh * DAMPING
      currRadius += dr * DAMPING
      currOpacity += dop * OPACITY_DAMPING

      haloStyle.value = {
        transform: `translate3d(${currX.toFixed(2)}px, ${currY.toFixed(2)}px, 0)`,
        width: `${currW.toFixed(2)}px`,
        height: `${currH.toFixed(2)}px`,
        borderRadius: `${currRadius.toFixed(1)}px`,
        opacity: Number(currOpacity.toFixed(3))
      }

      rafId = requestAnimationFrame(stepAnimation)
    } else {
      currX = targetX
      currY = targetY
      currW = targetW
      currH = targetH
      currRadius = targetRadius
      currOpacity = targetOpacity

      haloStyle.value = {
        transform: `translate3d(${currX.toFixed(2)}px, ${currY.toFixed(2)}px, 0)`,
        width: `${currW.toFixed(2)}px`,
        height: `${currH.toFixed(2)}px`,
        borderRadius: `${currRadius.toFixed(1)}px`,
        opacity: currOpacity <= 0.005 ? 0 : Number(currOpacity.toFixed(3))
      }

      rafId = null
    }
  }

  const triggerLoop = () => {
    if (!rafId) {
      rafId = requestAnimationFrame(stepAnimation)
    }
  }

  // 鼠标在卡片上移动时更新目标状态
  const updateHalo = (cardEl: HTMLElement, clientX: number, clientY: number) => {
    if (!containerRef.value || isReducedMotion()) return
    const container = containerRef.value

    const cRect = container.getBoundingClientRect()
    const r = cardEl.getBoundingClientRect()

    // 卡片内微视差位移追踪 (Micro-Parallax)
    let mxOffset = 0
    let myOffset = 0
    const centerX = r.left + r.width / 2
    const centerY = r.top + r.height / 2
    mxOffset = (clientX - centerX) * 0.05
    myOffset = (clientY - centerY) * 0.05

    const cardRadius = parseInt(window.getComputedStyle(cardEl).borderRadius, 10) || 16

    targetX = r.left - cRect.left + container.scrollLeft - OFFSET + mxOffset
    targetY = r.top - cRect.top + container.scrollTop - OFFSET + myOffset
    targetW = r.width + OFFSET * 2
    targetH = r.height + OFFSET * 2
    targetRadius = cardRadius + OFFSET
    targetOpacity = 1

    // 初次进入直接对准就位淡入，消除从远方飘来的穿帮动画
    if (currOpacity < 0.03) {
      currX = targetX
      currY = targetY
      currW = targetW
      currH = targetH
      currRadius = targetRadius
    }

    triggerLoop()
  }

  const handlePointerLeaveContainer = () => {
    targetOpacity = 0
    triggerLoop()
  }

  onMounted(() => {
    // 容器挂载
  })

  onUnmounted(() => {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })

  return {
    haloStyle,
    updateHalo,
    handlePointerLeaveContainer
  }
}
