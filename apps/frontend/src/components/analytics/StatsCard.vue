<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  type?: "count" | "percentage" | "streak" | "trend";
  title: string;
  value: number | string;
  unit?: string;
  icon?: string;
  subtitle?: string;
  trend?: number;
  variant?: "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  gradient?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "count",
  unit: "",
  icon: "",
  subtitle: "",
  trend: undefined,
  variant: "primary",
  size: "md",
  loading: false,
  gradient: false,
});

const { t } = useI18n();

// Вычисляем цвет в зависимости от варианта
const colorVariant = computed(() => {
  const variants: Record<string, string> = {
    primary: "var(--color-primary)",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  };
  return variants[props.variant] || variants.primary;
});

// Стиль для тренда
const trendStyle = computed(() => {
  if (!props.trend) return {};
  return {
    color: props.trend > 0 ? "#10b981" : "#ef4444",
  };
});

// Текст тренда
const trendText = computed(() => {
  if (!props.trend) return "";
  const symbol = props.trend > 0 ? "↑" : "↓";
  return `${symbol} ${Math.abs(props.trend)}%`;
});

// Размер шрифта в зависимости от размера карточки
const valueFontSize = computed(() => {
  const sizes: Record<string, string> = {
    sm: "var(--fs-2xl)",
    md: "var(--fs-4xl)",
    lg: "var(--fs-6xl)",
  };
  return sizes[props.size] || sizes.md;
});

// Паддинг в зависимости от размера
const cardPadding = computed(() => {
  const sizes: Record<string, string> = {
    sm: "12px",
    md: "24px",
    lg: "32px",
  };
  return sizes[props.size] || sizes.md;
});
</script>

<template>
  <div
    :class="['stats-card', `stats-card--${variant}`, `stats-card--${size}`]"
    :style="{ padding: cardPadding }"
  >
    <!-- Skeleton Loading -->
    <div v-if="loading" class="stats-card__skeleton">
      <div class="skeleton-icon"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-value"></div>
    </div>

    <!-- Содержимое -->
    <div v-else class="stats-card__content">
      <!-- Header с иконкой и названием -->
      <div class="stats-card__header">
        <div
          v-if="icon"
          class="stats-card__icon"
          :style="{ color: colorVariant }"
        >
          {{ icon }}
        </div>
        <h3 class="stats-card__title">{{ title }}</h3>
      </div>

      <!-- Главное значение -->
      <div class="stats-card__value-wrapper">
        <div
          class="stats-card__value"
          :style="{ fontSize: valueFontSize, color: colorVariant }"
        >
          {{ value }}
        </div>
        <span v-if="unit" class="stats-card__unit">{{ unit }}</span>
      </div>

      <!-- Тренд (если есть) -->
      <div
        v-if="trend !== undefined"
        class="stats-card__trend"
        :style="trendStyle"
      >
        {{ trendText }}
      </div>

      <!-- Подсказка -->
      <p v-if="subtitle" class="stats-card__subtitle">{{ subtitle }}</p>
    </div>

    <!-- Background gradient -->
    <div
      v-if="gradient"
      class="stats-card__background"
      :style="{ background: colorVariant }"
    ></div>
  </div>
</template>

<style scoped>
/* ========== BASE STYLES ========== */

.stats-card {
  position: relative;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: var(--transition);
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--color-shadow-card);
  border-color: var(--color-accent-light);
}

/* ========== SIZE VARIANTS ========== */

.stats-card--sm {
  min-height: 120px;
}

.stats-card--md {
  min-height: 160px;
}

.stats-card--lg {
  min-height: 200px;
}

/* ========== COLOR VARIANTS ========== */

.stats-card--primary {
  --card-color: var(--color-primary);
}

.stats-card--success {
  --card-color: #10b981;
}

.stats-card--warning {
  --card-color: #f59e0b;
}

.stats-card--danger {
  --card-color: #ef4444;
}

/* ========== CONTENT ========== */

.stats-card__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.stats-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.stats-card__icon {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card__title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

/* ========== VALUE ========== */

.stats-card__value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stats-card__value {
  font-weight: var(--fw-bold);
  letter-spacing: var(--ls-tight);
  line-height: 1.1;
}

.stats-card__unit {
  font-size: var(--fs-sm);
  color: var(--color-text-secondary);
  font-weight: var(--fw-medium);
}

/* ========== TREND ========== */

.stats-card__trend {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  display: inline-block;
  padding: 4px 8px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-sm);
  margin-top: 4px;
}

.stats-card__trend[style*="color: #ef4444"] {
  background: rgba(239, 68, 68, 0.1);
}

/* ========== SUBTITLE ========== */

.stats-card__subtitle {
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  line-height: 1.4;
  margin: auto 0 0;
}

/* ========== BACKGROUND GRADIENT ========== */

.stats-card__background {
  position: absolute;
  top: 0;
  right: -50px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  opacity: 0.08;
  z-index: 0;
  pointer-events: none;
}

/* ========== SKELETON LOADING ========== */

.stats-card__skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  background: var(--color-border);
  border-radius: 50%;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-text {
  width: 60%;
  height: 14px;
  background: var(--color-border);
  border-radius: var(--radius-sm);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-value {
  width: 40%;
  height: 32px;
  background: var(--color-border);
  border-radius: var(--radius-sm);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ========== RESPONSIVE ========== */

@media (max-width: 768px) {
  .stats-card {
    padding: 16px !important;
  }

  .stats-card__title {
    font-size: var(--fs-xs);
  }

  .stats-card__value {
    font-size: var(--fs-3xl) !important;
  }

  .stats-card__background {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .stats-card {
    padding: 12px !important;
  }

  .stats-card--lg {
    min-height: auto;
  }
}
</style>
