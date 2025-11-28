<script setup lang="ts">
import { computed } from "vue";

interface Props {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  showText: true,
});

const sizeClass = computed(() => `app-logo--${props.size}`);
</script>

<template>
  <div :class="['app-logo', sizeClass]">
    <img
      src="@/assets/images/logo.svg"
      alt="Habit Grid Logo"
      class="app-logo__image"
    />
    <span v-if="showText" class="app-logo__text">Habit Grid</span>
  </div>
</template>

<style scoped>
.app-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-logo__image {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.app-logo__text {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Size variants */
.app-logo--sm .app-logo__image {
  width: 28px;
  height: 28px;
}

.app-logo--sm .app-logo__text {
  font-size: var(--fs-base);
}

.app-logo--md .app-logo__image {
  width: 40px;
  height: 40px;
}

.app-logo--md .app-logo__text {
  font-size: var(--fs-lg);
}

.app-logo--lg .app-logo__image {
  width: 56px;
  height: 56px;
}

.app-logo--lg .app-logo__text {
  font-size: var(--fs-2xl);
}

.app-logo--xl .app-logo__image {
  width: 80px;
  height: 80px;
}

.app-logo--xl .app-logo__text {
  font-size: var(--fs-3xl);
}
</style>
