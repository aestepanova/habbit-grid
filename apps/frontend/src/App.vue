<script setup lang="ts">
import AppHeader from "@/components/common/AppHeader.vue";
import AppFooter from "@/components/common/AppFooter.vue";
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-main">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
