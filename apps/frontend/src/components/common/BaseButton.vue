<template>
  <button
    :class="[
      'base-button',
      `base-button--${variant}`,
      `base-button--${size}`,
      {
        'base-button--loading': isLoading,
        'base-button--disabled': isDisabled,
        'base-button--full-width': fullWidth,
        'base-button--icon-only': iconOnly
      }
    ]"
    :disabled="isDisabled || isLoading"
    :type="type"
    @click="handleClick"
  >
    <!-- Иконка слева (опционально) -->
    <span v-if="iconLeft" class="base-button__icon base-button__icon--left">
      <slot name="icon-left">{{ iconLeft }}</slot>
    </span>

    <!-- Текст кнопки -->
    <span v-if="!iconOnly" class="base-button__text">
      <slot>{{ label }}</slot>
    </span>

    <!-- Иконка справа (опционально) -->
    <span v-if="iconRight" class="base-button__icon base-button__icon--right">
      <slot name="icon-right">{{ iconRight }}</slot>
    </span>

    <!-- Индикатор загрузки -->
    <span v-if="isLoading" class="base-button__loader">
      <svg class="spinner" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="3"
        ></circle>
      </svg>
    </span>
  </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface Props {
  label?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  iconOnly?: boolean
  iconLeft?: string
  iconRight?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
  iconOnly: false,
  iconLeft: '',
  iconRight: ''
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isLoading = computed(() => props.loading)
const isDisabled = computed(() => props.disabled || props.loading)

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-family: inherit;
  position: relative;

  &:hover:not(.base-button--disabled) {
    transform: translateY(-2px);
    box-shadow: var(--color-shadow-card);
  }

  &:active:not(.base-button--disabled) {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* Варианты */
.base-button--primary {
  background: var(--color-primary);
  color: var(--color-text-white);

  &:hover:not(.base-button--disabled) {
    background: var(--color-primary-dark);
    box-shadow: var(--color-shadow-card);
  }

  &:active:not(.base-button--disabled) {
    background: var(--color-primary-dark);
  }
}

.base-button--secondary {
  background: var(--color-card-secondary);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);

  &:hover:not(.base-button--disabled) {
    background: var(--color-border);
    box-shadow: var(--color-shadow);
  }
}

.base-button--danger {
  background: #ef4444;
  color: var(--color-text-white);

  &:hover:not(.base-button--disabled) {
    background: #dc2626;
    box-shadow: var(--color-shadow-card);
  }
}

.base-button--success {
  background: #10b981;
  color: var(--color-text-white);

  &:hover:not(.base-button--disabled) {
    background: #059669;
    box-shadow: var(--color-shadow-card);
  }
}

.base-button--ghost {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);

  &:hover:not(.base-button--disabled) {
    background: var(--color-primary-light);
    box-shadow: var(--color-shadow);
  }
}

/* Размеры */
.base-button--small {
  padding: 6px 12px;
  font-size: 12px;
  gap: 4px;
}

.base-button--large {
  padding: 14px 24px;
  font-size: 16px;
  gap: 10px;
}

/* Состояния */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button--full-width {
  width: 100%;
}

.base-button--loading {
  color: transparent;

  .base-button__text {
    visibility: hidden;
  }
}

.base-button--icon-only {
  padding: 8px;
  width: 44px;
  height: 44px;
  min-width: 44px;
}

/* Иконки */
.base-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

/* Loader */
.base-button__loader {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;

  circle {
    stroke: currentColor;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .base-button {
    padding: 8px 12px;
    font-size: 13px;
    gap: 6px;
  }

  .base-button--small {
    padding: 5px 10px;
    font-size: 11px;
  }

  .base-button--large {
    padding: 12px 20px;
    font-size: 14px;
  }

  .base-button--icon-only {
    width: 40px;
    height: 40px;
    min-width: 40px;
  }
}
</style>
