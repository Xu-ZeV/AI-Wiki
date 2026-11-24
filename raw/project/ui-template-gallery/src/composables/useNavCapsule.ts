import { ref, onMounted, onUnmounted, nextTick, type Ref } from 'vue'

export interface NavMenuItem {
  id: string
  label: string
  iconSvg: string
}

export function useNavCapsule(
  navBarRef: Ref<HTMLElement | null>,
  isScrolled: Ref<boolean>
) {
  const activeId = ref('tasks')
  const hoveredId = ref<string | null>(null)
  const rotatingId = ref<string | null>(null)

  const gliderStyle = ref({
    transform: 'translate3d(0, 0, 0)',
    width: '0px',
    opacity: 0,
    transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.3, 1), width 0.38s cubic-bezier(0.25, 1, 0.3, 1), opacity 0.22s ease'
  })

  // 更新 Glider 底色滑块位置与宽度
  const updateGlider = (isImmediate = false) => {
    if (!navBarRef.value) return
    const navBar = navBarRef.value

    // 吸顶折叠态下隐藏全局 Glider，由各按钮自身的背景色独立接管
    if (isScrolled.value) {
      gliderStyle.value.opacity = 0
      return
    }

    const activeEl = navBar.querySelector(`[data-id="${activeId.value}"]`) as HTMLElement | null
    if (!activeEl) {
      gliderStyle.value.opacity = 0
      return
    }

    const width = activeEl.offsetWidth
    const x = activeEl.offsetLeft
    if (width <= 0) return

    if (isImmediate) {
      gliderStyle.value.transition = 'none'
    } else {
      gliderStyle.value.transition =
        'transform 0.4s cubic-bezier(0.25, 1, 0.3, 1), width 0.38s cubic-bezier(0.25, 1, 0.3, 1), opacity 0.22s ease'
    }

    gliderStyle.value.width = `${width}px`
    gliderStyle.value.transform = `translate3d(${x}px, 0, 0)`
    gliderStyle.value.opacity = 1
  }

  // 点击选择菜单项
  const selectItem = (item: NavMenuItem) => {
    if (activeId.value === item.id) return
    activeId.value = item.id

    // 触发 360° 微弹性顺时针旋转
    rotatingId.value = item.id
    setTimeout(() => {
      if (rotatingId.value === item.id) {
        rotatingId.value = null
      }
    }, 660)

    nextTick(() => {
      updateGlider(false)
    })
  }

  const handleMouseEnterItem = (id: string) => {
    hoveredId.value = id
  }

  const handleMouseLeaveItem = () => {
    hoveredId.value = null
  }

  // 固化具名回调，避免卸载失效引发闭包内存泄漏
  const handleResize = () => {
    updateGlider(true)
  }

  onMounted(() => {
    nextTick(() => {
      updateGlider(true)
    })
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    activeId,
    hoveredId,
    rotatingId,
    gliderStyle,
    selectItem,
    handleMouseEnterItem,
    handleMouseLeaveItem,
    updateGlider
  }
}
