<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'clear'): void
}>()

const hasValue = computed(() => (props.modelValue || '').trim().length > 0)

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="glass-search-wrapper">
    <div class="glass-search-bar" role="search">
      <!-- 放大镜图标 -->
      <div class="search-icon-box" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      </div>

      <!-- 原生输入框 -->
      <input
        type="text"
        class="search-input"
        :value="modelValue"
        :placeholder="placeholder || '搜索会议标题、技术关键词或动效特征...'"
        aria-label="搜索框"
        @input="onInput"
      />

      <!-- 44px 触控区清空按钮（有内容时淡入，带 22px 内层面） -->
      <button
        type="button"
        class="search-clear-btn"
        :class="{ visible: hasValue }"
        aria-label="清空输入"
        title="清空"
        @click="handleClear"
      >
        <span class="search-clear-btn__face">✕</span>
      </button>
    </div>
  </div>
</template>
