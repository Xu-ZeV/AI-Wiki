---
title: 组件数据流最佳实践
impact: HIGH
impactDescription: Clear data flow between components prevents state bugs, stale UI, and brittle coupling
type: best-practice
tags: [vue3, props, emits, v-model, provide-inject, data-flow, typescript]
---

# 组件数据流最佳实践

**影响：高** - 当数据流显式时，Vue 组件保持可靠：props 下降，事件上升，`v-model` 处理双向绑定，并且提供/注入支持跨树依赖项。模糊这些边界会导致陈旧状态、隐藏耦合和难以调试的 UI。

Vue.js 中数据流的主要原理是 **Props Down / Events Up**。这是最容易维护的默认设置，并且单向流可以很好地扩展。

## 任务列表

- 将 props 视为只读输入
- 使用 props/emit 进行组件通信；为必要的行动保留参考
- 当命令式 API 需要引用时，请使用模板引用键入它们
- 发出事件而不是直接改变父状态
- 在现代 Vue (3.4+) 中使用 `defineModel` 作为 v-model
- 在子组件中故意处理 v-model 修饰符
- 使用符号提供/注入密钥以避免props钻探（超过〜3层）
- 在提供者中保留突变或公开显式操作
- 在 TypeScript 项目中，更喜欢基于类型的 `defineProps`、`defineEmits` 和 `InjectionKey`

## props：单向数据下载

props是输入。不要让它们在孩子身上发生突变。

**不好：**
```vue
<script setup>
const props = defineProps({ count: Number })

function increment() {
  props.count++
}
</script>
```

**好：**

如果状态需要更改，请发出事件、使用 `v-model` 或创建本地副本。

## 优先使用 props/emit 而不是组件引用

**不好：**
```vue
<script setup>
import { ref } from 'vue'
import UserForm from './UserForm.vue'

const formRef = ref(null)

function submitForm() {
  if (formRef.value.isValid) {
    formRef.value.submit()
  }
}
</script>

<template>
  <UserForm ref="formRef" />
  <button @click="submitForm">Submit</button>
</template>
```

**好：**
```vue
<script setup>
import UserForm from './UserForm.vue'

function handleSubmit(formData) {
  api.submit(formData)
}
</script>

<template>
  <UserForm @submit="handleSubmit" />
</template>
```

## 当需要命令式访问时输入组件引用

默认情况下更喜欢 props/emits。当父级必须调用公开的子方法时，请显式键入 ref 并仅通过 `defineExpose` 公开来自子级的预期 API。

**不好：**
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DialogPanel from './DialogPanel.vue'

const panelRef = ref(null)

onMounted(() => {
  panelRef.value.open()
})
</script>

<template>
  <DialogPanel ref="panelRef" />
</template>
```

**好：**
```vue
<!-- DialogPanel.vue -->
<script setup lang="ts">
function open() {}

defineExpose({ open })
</script>
```

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import DialogPanel from './DialogPanel.vue'

// Vue 3.5+ with useTemplateRef
const panelRef = useTemplateRef('panelRef')

// Before Vue 3.5 with manual typing and ref
// const panelRef = ref<InstanceType<typeof DialogPanel> | null>(null)

onMounted(() => {
  panelRef.value?.open()
})
</script>

<template>
  <DialogPanel ref="panelRef" />
</template>
```

## 发出：显式事件 Up

组件事件不会冒泡。如果父级需要了解某个事件，请明确地重新发出该事件。

**不好：**
```vue
<!-- Parent expects "saved" from grandchild, but it won't bubble -->
<Child @saved="onSaved" />
```

**好：**
```vue
<!-- Child.vue -->
<script setup>
const emit = defineEmits(['saved'])

function onGrandchildSaved(payload) {
  emit('saved', payload)
}
</script>

<template>
  <Grandchild @saved="onGrandchildSaved" />
</template>
```

**事件命名：** 在模板中使用短横线命名法，在脚本中使用驼峰式命名法：
```vue
<script setup>
const emit = defineEmits(['updateUser'])
</script>

<template>
  <ProfileForm @update-user="emit('updateUser', $event)" />
</template>
```

## `v-model`：可预测的双向绑定

默认情况下使用 `defineModel` 进行组件绑定并在输入时发出更新。如果您使用的是 Vue < 3.4，则仅使用 `modelValue` + `update:modelValue` 模式。

**不好：**
```vue
<script setup>
const props = defineProps({ value: String })
</script>

<template>
  <input :value="props.value" @input="$emit('input', $event.target.value)" />
</template>
```

**好（Vue 3.4+）：**
```vue
<script setup>
const model = defineModel({ type: String })
</script>

<template>
  <input v-model="model" />
</template>
```

**好（Vue < 3.4）：**
```vue
<script setup>
const props = defineProps({ modelValue: String })
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input
    :value="props.modelValue"
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

如果您需要在更改后立即更新值，请在父级中使用输入事件值或 `nextTick`。

## 提供/注入：无需 Prop 钻探即可共享上下文

使用提供/注入来实现跨树状态，但将突变集中在提供者中并公开显式操作。

**不好：**
```vue
// Provider.vue
provide('theme', reactive({ dark: false }))

// Consumer.vue
const theme = inject('theme')
// Mutating shared state from any depth becomes hard to track
theme.dark = true
```

**好：**
```vue
// Provider.vue
const theme = reactive({ dark: false })
const toggleTheme = () => { theme.dark = !theme.dark }

provide(themeKey, readonly(theme))
provide(themeActionsKey, { toggleTheme })

// Consumer.vue
const theme = inject(themeKey)
const { toggleTheme } = inject(themeActionsKey)
```

使用符号作为键以避免大型应用程序中的冲突：
```ts
export const themeKey = Symbol('theme')
export const themeActionsKey = Symbol('theme-actions')
```

## 对公共组件 API 使用 TypeScript 契约

在 TypeScript 项目中，直接使用 `defineProps`、`defineEmits` 和 `InjectionKey` 键入组件边界，以便无效的有效负载和不匹配的注入在编译时失败。

**不好：**
```vue
<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps({
  userId: String
})

const emit = defineEmits(['save'])
const settings = inject('settings')

// Payload shape is not checked here
emit('save', 123)

// Key is string-based and not type-safe
settings?.theme = 'dark'
</script>
```

**好：**
```vue
<script setup lang="ts">
import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'

interface Props {
  userId: string
}

interface Emits {
  save: [payload: { id: string; draft: boolean }]
}

interface Settings {
  theme: 'light' | 'dark'
}

const settingsKey: InjectionKey<Settings> = Symbol('settings')

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

provide(settingsKey, { theme: 'light' })

const settings = inject(settingsKey)
if (settings) {
  emit('save', { id: props.userId, draft: false })
}
</script>
```
