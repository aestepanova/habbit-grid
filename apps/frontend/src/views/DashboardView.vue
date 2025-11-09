<template>
  <h1>Add buttons!</h1>
  <div style="display: flex; gap: 16px; flex-wrap: wrap;">
    <BaseButton label="Primary" variant="primary" />
    <BaseButton label="Secondary" variant="secondary" />
    <BaseButton label="Danger" variant="danger" />
    <BaseButton label="Success" variant="success" />
    <BaseButton label="Ghost" variant="ghost" />
    <BaseButton label="Loading" :loading="true" />
    <BaseButton icon-only icon-left="★" />
  </div>
</template>

<style scoped></style>

<script setup lang="ts">
import BaseButton from '@/components/common/BaseButton.vue'
</script>
