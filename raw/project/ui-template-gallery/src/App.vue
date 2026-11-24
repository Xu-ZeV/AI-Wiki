<script setup lang="ts">
import AppNavbar from './components/layout/AppNavbar.vue'
</script>

<template>
  <div class="app-layout">
    <AppNavbar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}
</style>
