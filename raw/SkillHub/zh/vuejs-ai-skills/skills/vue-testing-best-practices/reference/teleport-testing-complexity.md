---
title: Teleport的内容需要特殊的测试方法
impact: MEDIUM
impactDescription: Vue Test Utils cannot find teleported content using standard wrapper.find() methods
type: gotcha
tags: [vue3, teleport, testing, vue-test-utils]
---

# Teleport的内容需要特殊的测试方法

**影响：中度** - Vue Test Utils 将查询范围限制到已安装的组件。Teleport的内容在组件的 DOM 树之外呈现，因此 `wrapper.find()` 无法找到它。这会导致测试失败和混乱。

## 任务清单

- [ ] 单元测试中的存根Teleport以将内容保留在组件树中
- [ ] 使用 `document.body` 查询与真实 Teleport 进行集成测试
- [ ] 考虑使用 `getComponent()` 而不是Teleport组件的 DOM 查询

**问题 - 标准测试失败：**
```vue
<!-- Modal.vue -->
<template>
  <button @click="open = true">Open</button>
  <Teleport to="body">
    <div v-if="open" class="modal" data-testid="modal">
      <input type="text" data-testid="modal-input" />
    </div>
  </Teleport>
</template>
```

```ts
// Modal.spec.ts - BROKEN
import { mount } from '@vue/test-utils'
import Modal from './Modal.vue'

test('modal input exists', async () => {
  const wrapper = mount(Modal)
  await wrapper.find('button').trigger('click')

  // FAILS: Teleported content is not in wrapper's DOM tree
  expect(wrapper.find('[data-testid="modal-input"]').exists()).toBe(true)
})
```

**解决方案 1 - 存根Teleport：**
```ts
import { mount } from '@vue/test-utils'
import Modal from './Modal.vue'

test('modal input exists', async () => {
  const wrapper = mount(Modal, {
    global: {
      stubs: {
        // Stub teleport to render content inline
        Teleport: true
      }
    }
  })

  await wrapper.find('button').trigger('click')

  // Works: Content renders inside wrapper
  expect(wrapper.find('[data-testid="modal-input"]').exists()).toBe(true)
})
```

**解决方案2 - 查询文档正文：**
```ts
import { mount } from '@vue/test-utils'
import Modal from './Modal.vue'

test('modal renders to body', async () => {
  const wrapper = mount(Modal, {
    attachTo: document.body  // Required for Teleport to work
  })

  await wrapper.find('button').trigger('click')

  // Query the actual DOM
  const modal = document.querySelector('[data-testid="modal"]')
  expect(modal).toBeTruthy()

  const input = document.querySelector('[data-testid="modal-input"]')
  expect(input).toBeTruthy()

  // Cleanup
  wrapper.unmount()
})
```

**解决方案 3 - 具有内容访问权限的自定义 Teleport 存根：**
```ts
import { mount, config } from '@vue/test-utils'
import { h, Teleport } from 'vue'
import Modal from './Modal.vue'

// Custom stub that renders content in a testable way
const TeleportStub = {
  setup(props, { slots }) {
    return () => h('div', { class: 'teleport-stub' }, slots.default?.())
  }
}

test('modal with custom stub', async () => {
  const wrapper = mount(Modal, {
    global: {
      stubs: {
        Teleport: TeleportStub
      }
    }
  })

  await wrapper.find('button').trigger('click')

  // Content is inside .teleport-stub
  expect(wrapper.find('.teleport-stub [data-testid="modal-input"]').exists()).toBe(true)
})
```

## 测试 Vue 最终模态和 UI 库

像 Vue Final Modal 这样的库在内部使用 Teleport，导致测试失败：

```ts
// Problem: Vue Final Modal teleports to body
import { VueFinalModal } from 'vue-final-modal'

test('modal content', async () => {
  const wrapper = mount(MyComponent, {
    global: {
      stubs: {
        // Stub the modal component to avoid teleport issues
        VueFinalModal: true
      }
    }
  })
})
```

## E2E 测试（Cypress，剧作家）

E2E 测试查询真实的 DOM，因此 Teleport 自然可以工作：

```ts
// Cypress
it('opens modal', () => {
  cy.visit('/page-with-modal')
  cy.get('button').click()

  // Works: Cypress queries the real DOM
  cy.get('[data-testid="modal"]').should('be.visible')
})
```

## 参考
- [Vue 测试工具 - Teleport](https://test-utils.vuejs.org/guide/advanced/teleport)
- [Vue 测试实用程序 - 存根](https://test-utils.vuejs.org/guide/advanced/stubs-shallow-mount)
