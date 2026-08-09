---
title: 正确地将插槽转发到子组件
impact: MEDIUM
impactDescription: Wrapper components that don't forward slots break slot functionality for consumers
type: best-practice
tags: [vue3, slots, component-composition, wrapper-components, slot-forwarding]
---

# 正确地将槽转发给子组件

**影响：中** - 创建增强或扩展其他组件的包装器组件时，您需要将插槽从父级转发到包装的子级。如果没有正确的槽转发，包装器的使用者就无法自定义内部组件的槽。

## 任务清单

- [ ] 使用 `v-for` 和 `$slots` 迭代所有提供的插槽
- [ ] 使用 `v-slot:[slotName]` 的动态插槽名称
- [ ] 使用 `v-bind="slotProps"` 传递插槽props
- [ ] 处理 slotProps 可能未定义的情况

**基本时隙转发模式：**
```vue
<!-- EnhancedButton.vue - Wrapper component -->
<script setup>
import BaseButton from './BaseButton.vue'
</script>

<template>
  <div class="button-wrapper">
    <BaseButton v-bind="$attrs">
      <!-- Forward all slots to BaseButton -->
      <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </BaseButton>
  </div>
</template>
```

**用途：**
```vue
<script setup>
import EnhancedButton from './EnhancedButton.vue'
</script>

<template>
  <!-- Slots pass through to BaseButton -->
  <EnhancedButton>
    <template #icon>
      <IconCheck />
    </template>
    <template #default>
      Click me
    </template>
  </EnhancedButton>
</template>
```

## 处理作用域槽

当子组件提供 slot props 时，您必须转发它们：

```vue
<!-- DataTableWrapper.vue -->
<script setup>
import DataTable from './DataTable.vue'

const props = defineProps(['data'])
</script>

<template>
  <div class="table-container">
    <DataTable :items="data">
      <!-- Forward slots including scoped slot props -->
      <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps ?? {}" />
      </template>
    </DataTable>
  </div>
</template>
```

```vue
<!-- Consumer can use scoped slot props -->
<DataTableWrapper :data="users">
  <template #row="{ item, index }">
    <tr>
      <td>{{ index + 1 }}</td>
      <td>{{ item.name }}</td>
    </tr>
  </template>
</DataTableWrapper>
```

## 替代方案：处理未定义的 slotProps

某些场景需要检查 slotProps 是否存在：

```vue
<template>
  <ChildComponent>
    <template v-for="(_, name) in $slots" v-slot:[name]="slotProps">
      <!-- Handle both scoped and non-scoped slots -->
      <slot v-if="slotProps" :name="name" v-bind="slotProps" />
      <slot v-else :name="name" />
    </template>
  </ChildComponent>
</template>
```

## 仅转发特定时隙

如果您只想转发某些插槽：

```vue
<template>
  <ChildComponent>
    <!-- Only forward header and footer slots -->
    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps ?? {}" />
    </template>

    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps ?? {}" />
    </template>

    <!-- Default slot handled differently -->
    <slot />
  </ChildComponent>
</template>
```

## 常见错误

|错误|问题 |解决方案 |
|---------|---------|----------|
|不使用 `v-bind="slotProps"` |作用域槽数据丢失 |始终绑定 slotProps |
|忘记 `?? {}` 或空检查 | slotProps 未定义时出错 |添加无效合并 |
|循环中的静态槽名称 |只转发一个槽 |使用`v-slot:[slotName]`动态语法|
|缺少 `v-for` 密钥警告 | Vue 警告（非关键）|插槽功能不需要按键 |

## 参考
- [Vue Land常见问题-转发槽位](https://vue-land.github.io/faq/forwarding-slots)
- [Vue.js 插槽 - 范围插槽](https://vuejs.org/guide/components/slots.html#scoped-slots)
