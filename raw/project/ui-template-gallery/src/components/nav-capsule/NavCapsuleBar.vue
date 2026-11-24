<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import { useNavCapsule, type NavMenuItem } from '../../composables/useNavCapsule'

const props = defineProps<{
  isScrolled: boolean
}>()

const emit = defineEmits<{
  (e: 'change', item: NavMenuItem): void
}>()

const navBarRef = ref<HTMLElement | null>(null)

// 6 个通用经典业务菜单项（南瓜助手实战规范）
const menuItems: NavMenuItem[] = [
  {
    id: 'hall',
    label: '大厅',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`
  },
  {
    id: 'meetings',
    label: '会议列表',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>`
  },
  {
    id: 'summaries',
    label: '纪要列表',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="m9 14 2 2 4-4"/></svg>`
  },
  {
    id: 'tasks',
    label: '任务列表',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>`
  },
  {
    id: 'audio',
    label: '声音管理',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`
  },
  {
    id: 'settings',
    label: '设置',
    iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
  }
]

const isScrolledRef = ref(props.isScrolled) as Ref<boolean>
watch(() => props.isScrolled, (newVal) => {
  isScrolledRef.value = newVal
  updateGlider(false)
  // 当从吸顶折叠切回常态展开时，CSS 宽度过渡需要 300ms，在过渡完成后再次校准 Glider 几何坐标，确保绝对对齐
  if (!newVal) {
    setTimeout(() => {
      updateGlider(false)
    }, 320)
  }
})

const {
  activeId,
  rotatingId,
  gliderStyle,
  selectItem,
  handleMouseEnterItem,
  handleMouseLeaveItem,
  updateGlider
} = useNavCapsule(navBarRef, isScrolledRef)

const onSelect = (item: NavMenuItem) => {
  selectItem(item)
  emit('change', item)
}
</script>

<template>
  <nav
    ref="navBarRef"
    class="common-nav-capsule-bar"
    :class="{ 'is-scrolled': isScrolled }"
    role="tablist"
  >
    <!-- 磁吸滑动 Glider 底色滑块 -->
    <div
      class="nav-capsule-glider"
      :style="{
        transform: gliderStyle.transform,
        width: gliderStyle.width,
        opacity: gliderStyle.opacity,
        transition: gliderStyle.transition
      }"
      aria-hidden="true"
    ></div>

    <!-- 菜单按钮项 -->
    <button
      v-for="item in menuItems"
      :key="item.id"
      :data-id="item.id"
      class="common-nav-capsule"
      :class="{ active: activeId === item.id }"
      role="tab"
      :aria-selected="activeId === item.id"
      @click="onSelect(item)"
      @mouseenter="handleMouseEnterItem(item.id)"
      @mouseleave="handleMouseLeaveItem"
    >
      <span class="nav-capsule-inner">
        <span
          class="nav-capsule-icon"
          :class="{ 'rotate-spring': rotatingId === item.id }"
          v-html="item.iconSvg"
        ></span>
        <span class="nav-capsule-text">{{ item.label }}</span>
      </span>
    </button>
  </nav>
</template>
