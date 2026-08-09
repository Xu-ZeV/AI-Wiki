---
title: 切勿改变计算属性的返回值
impact: HIGH
impactDescription: Mutating computed values causes silent failures and lost changes
type: capability
tags: [vue3, computed, reactivity, immutability, common-mistake]
---

# 永远不要改变计算属性的返回值

**影响：高** - 计算属性返回的值是派生状态 - 临时快照。改变这个值会导致难以调试的错误。

**重要提示：** 当计算的缓存保持有效时，突变确实会持续存在，但在重新计算发生时会丢失。危险在于不可预测的缓存失效时间 - 对计算依赖项的任何更改都会触发重新计算，默默地丢弃您的突变。这使得错误间歇性且难以重现。

每次源状态发生变化时，都会创建一个新的快照。改变快照是没有意义的，因为它将在下次重新计算时被丢弃。

## 任务清单

- [ ] 将计算的返回值视为只读
- [ ] 更新源状态而不是计算值
- [ ] 如果需要双向绑定，则使用可写计算属性
- [ ] 避免计算数组上的数组变异方法（push、pop、splice、reverse、sort）

**错误：**
```vue
<script setup>
import { ref, computed } from 'vue'

const books = ref(['Vue Guide', 'React Handbook'])

const publishedBooks = computed(() => {
  return books.value.filter(book => book.includes('Guide'))
})

function addBook() {
  // BAD: Mutating computed value - change will be lost!
  publishedBooks.value.push('New Book')
}

// BAD: Mutating computed array
const sortedBooks = computed(() => books.value.filter(b => b))

function reverseBooks() {
  // BAD: This mutates the computed snapshot
  sortedBooks.value.reverse()
}
</script>
```

```vue
<script>
export default {
  data() {
    return {
      author: {
        name: 'John',
        books: ['Book A', 'Book B']
      }
    }
  },
  computed: {
    authorBooks() {
      return this.author.books
    }
  },
  methods: {
    addBook() {
      // BAD: Mutating computed value
      this.authorBooks.push('New Book')
    }
  }
}
</script>
```

**正确：**
```vue
<script setup>
import { ref, computed } from 'vue'

const books = ref(['Vue Guide', 'React Handbook'])

const publishedBooks = computed(() => {
  return books.value.filter(book => book.includes('Guide'))
})

function addBook(bookName) {
  // GOOD: Update the source state
  books.value.push(bookName)
}

// GOOD: Create a copy before mutating for display
const sortedBooks = computed(() => {
  return [...books.value].sort()  // Spread to create copy before sort
})

const reversedBooks = computed(() => {
  return [...books.value].reverse()  // Spread to create copy before reverse
})
</script>
```

```vue
<script>
export default {
  data() {
    return {
      author: {
        name: 'John',
        books: ['Book A', 'Book B']
      }
    }
  },
  computed: {
    authorBooks() {
      return this.author.books
    }
  },
  methods: {
    addBook(bookName) {
      // GOOD: Update source state
      this.author.books.push(bookName)
    }
  }
}
</script>
```

## 双向绑定的可写计算

如果您确实需要“设置”计算值，请使用可写的计算属性：

```vue
<script setup>
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// Writable computed with getter and setter
const fullName = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(newValue) {
    // Update source state based on the new value
    const parts = newValue.split(' ')
    firstName.value = parts[0] || ''
    lastName.value = parts[1] || ''
  }
})

// Now this is valid:
fullName.value = 'Jane Smith'  // Updates firstName and lastName
</script>
```

## 参考
- [Vue.js 计算属性 - 避免改变计算值](https://vuejs.org/guide/essentials/computed.html#avoid-mutating-computed-value)
- [Vue.js 计算属性 - 可写计算](https://vuejs.org/guide/essentials/computed.html#writable-computed)
